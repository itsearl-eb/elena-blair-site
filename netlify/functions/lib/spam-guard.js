// Spam protection for every public submit function (§128, item 9).
//
// Two layers, and they fail differently on purpose.
//
// **1. Honeypot.** A field a human never sees and a bot fills in because it
// fills in everything. Costs nothing, needs no configuration, no third
// party, and no request — so it is the layer that works on the first deploy
// and keeps working if Cloudflare is down.
//
//   It is NOT `type="hidden"`. Well-behaved scrapers skip hidden inputs;
//   the ones worth catching submit every visible field they can find. It is
//   a real text input, positioned off-screen by CSS, with `tabindex="-1"`,
//   `autocomplete="off"` and `aria-hidden="true"` so a screen reader and a
//   keyboard user never reach it either.
//
//   The name is plausible on purpose. A field called `honeypot` is skipped
//   by anything that has seen one before; `company_fax` reads like a field
//   worth filling. It must not collide with a real field on any of these
//   forms — checked: `website`, `instagram`, `portfolio` are real, `fax`
//   appears nowhere.
//
// **2. Cloudflare Turnstile**, verified server-side. The token a browser
// gets from the widget proves nothing until this side asks Cloudflare about
// it — a client-side `if (token)` check is worth exactly nothing, since the
// thing being defended against does not run our JavaScript.
//
// ---------------------------------------------------------------------
// Fail open, and why that is the right call here rather than a compromise
// ---------------------------------------------------------------------
//
// With no `TURNSTILE_SECRET_KEY` set, Turnstile is **skipped** and the
// honeypot still runs. The alternative — reject everything until the key is
// configured — would take down the commission form the moment this deploys,
// and a real client whose enquiry silently failed is a worse outcome than a
// spam row somebody closes in two clicks. §16's whole posture is
// degrade-don't-block, and an intake form is the least appropriate place to
// break that rule.
//
// The cost of failing open is that the protection is invisible when it is
// not working, which is how a feature gets believed in. So:
//   - it logs a warning on every unconfigured invocation, and
//   - `checkSubmission` reports which layers actually ran, so the caller
//     can put it in the log beside the submission.
//
// A token that IS present and fails verification is rejected, configured or
// not. Failing open is about an absent key, never about a failed check.

const HONEYPOT_FIELD = 'company_fax'
const TOKEN_FIELD = 'turnstile_token'
const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

// Cloudflare's own timeout is generous; ours is not. A submit function that
// hangs on an outage is indistinguishable to the person filling in the form
// from one that lost their enquiry.
const VERIFY_TIMEOUT_MS = 5000

function clientIp(event) {
  const h = (event && event.headers) || {}
  // Netlify's own header first; x-forwarded-for can carry a list.
  const forwarded = h['x-nf-client-connection-ip'] || h['client-ip'] || h['x-forwarded-for']
  if (!forwarded) return null
  return String(forwarded).split(',')[0].trim() || null
}

async function verifyTurnstile(token, event) {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) {
    console.warn(
      '[spam-guard] TURNSTILE_SECRET_KEY is not set — Turnstile SKIPPED, honeypot only. ' +
        'Set it in this site’s Netlify env vars (both contexts) to turn the second layer on.',
    )
    return { ran: false, ok: true }
  }
  if (!token) {
    // Configured but no token: either the widget did not load, or the
    // request did not come from the form. Reject — with a key set, a
    // missing token is the ordinary signature of a scripted post.
    return { ran: true, ok: false, reason: 'missing-token' }
  }

  const body = new URLSearchParams()
  body.append('secret', secret)
  body.append('response', token)
  const ip = clientIp(event)
  if (ip) body.append('remoteip', ip)

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), VERIFY_TIMEOUT_MS)
  try {
    const res = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
      signal: controller.signal,
    })
    const json = await res.json()
    if (json.success) return { ran: true, ok: true }
    return { ran: true, ok: false, reason: 'turnstile:' + (json['error-codes'] || []).join(',') }
  } catch (err) {
    // Cloudflare unreachable or too slow. **Accept**, for the same reason
    // an absent key is accepted: losing a real enquiry to somebody else's
    // outage is the worse failure. Logged so it is not invisible.
    console.error('[spam-guard] Turnstile verification unreachable, accepting:', err.message)
    return { ran: true, ok: true, degraded: true }
  } finally {
    clearTimeout(timer)
  }
}

// `{ ok, reason, layers }`. `layers` says what actually ran, so the caller
// logs the truth rather than the intention.
async function checkSubmission(data, event) {
  const trap = data && data[HONEYPOT_FIELD]
  if (typeof trap === 'string' && trap.trim() !== '') {
    return { ok: false, reason: 'honeypot', layers: { honeypot: true, turnstile: false } }
  }

  const turnstile = await verifyTurnstile(data && data[TOKEN_FIELD], event)
  return {
    ok: turnstile.ok,
    reason: turnstile.reason,
    layers: { honeypot: true, turnstile: turnstile.ran, turnstileDegraded: Boolean(turnstile.degraded) },
  }
}

// What a rejected submission returns. **200, not 403**, and `success: true`.
//
// This is deliberate and it is the one thing here worth not changing back. A
// bot that is told it failed retries with the field left blank; one that is
// told it succeeded goes away. The form's own JavaScript redirects to the
// thank-you page either way, so a false positive — a real person somehow
// caught by this — sees the ordinary confirmation rather than an error they
// cannot act on. Nothing is written anywhere, which is the entire effect.
function rejectionResponse(reason) {
  console.log('[spam-guard] rejected:', reason)
  return { statusCode: 200, body: JSON.stringify({ success: true }) }
}

// The two field names the front end must use. Exported so the HTML and this
// file cannot drift — the failure mode of a renamed honeypot is silent, and
// it fails in the direction of letting everything through.
module.exports = {
  HONEYPOT_FIELD,
  TOKEN_FIELD,
  checkSubmission,
  rejectionResponse,
}
