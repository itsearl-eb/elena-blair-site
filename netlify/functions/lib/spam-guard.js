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

// **`true` since 24 September 2026 — strict.** A request with no token at
// all is a rejection.
//
// It was `false` for a few hours because the widget was returning `110200
// domain not allowed` on every surface, so no token existed to send and
// strict would have refused every real enquiry. Turned on once the whole
// path was exercised live rather than inferred:
//
//   - both staging sites issue an 816-character token, no error callback,
//     nothing in the console;
//   - a deliberately invalid token POSTed to the live function came back
//     `success: false, error: verification-failed` — which proves the
//     secret is set, Cloudflare is reachable from the function, and the
//     rejection path works, and writes nothing;
//   - a filled honeypot came back `success: true` and wrote nothing.
//
// **The emergency stop is an env var, not this line**, and that is the point
// of writing it this way. If Turnstile ever stops issuing tokens again, the
// fix that matters is measured in seconds: set
// `SPAM_GUARD_ALLOW_MISSING_TOKEN=1` in the Netlify UI and every form falls
// back to honeypot-only, with a warning on every invocation. No commit, no
// deploy, no waiting for a build — which is what an outage on a client-facing
// intake form actually needs. Unset it to go strict again.
//
// Strict is the default precisely because an env var that has to be SET to
// weaken things cannot weaken them by accident.
function rejectMissingToken() {
  return process.env.SPAM_GUARD_ALLOW_MISSING_TOKEN !== '1'
}

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
    // **An absent token is a degrade, not a rejection** — unless
    // REJECT_MISSING_TOKEN is turned on below.
    //
    // This looked wrong until the first live test. With the secret key set
    // and the widget returning `110200 domain not allowed`, no token is
    // issued to anyone, so "reject on a missing token" refuses every real
    // enquiry on every form. A misconfigured widget, an ad blocker on
    // `challenges.cloudflare.com`, a corporate proxy and a CSP all produce
    // exactly this evidence, and so does a bot — and we cannot tell them
    // apart from here.
    //
    // It is the same distinction this file already makes for the key: **an
    // absent token means the check never ran; an invalid token means it ran
    // and failed.** Failing open on the first and closed on the second is
    // the rule, applied consistently, not an exception carved out for an
    // outage.
    //
    // The cost is honest: a bot that simply omits the token gets past
    // Turnstile. It still meets the honeypot, which is where every one of
    // these forms stood yesterday — so this is never worse than not having
    // shipped, and it cannot lose a client.
    if (!rejectMissingToken()) {
      console.warn(
        '[spam-guard] Turnstile token ABSENT with a secret key set — accepting, honeypot only. ' +
          'The widget is not issuing tokens: check the hostname list on the Turnstile widget ' +
          '(error 110200 is "domain not allowed").',
      )
      return { ran: true, ok: true, degraded: true, reason: 'missing-token-accepted' }
    }
    console.warn('[spam-guard] Turnstile token absent — rejecting (strict).')
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

// **The two kinds of rejection are not the same kind of event, and they must
// not get the same response.** This was one response until the secret key
// went live on 24 September; with verification actually running, the second
// case became reachable by real people and silence became the wrong answer.
//
// **Honeypot — answer `success: true` and write nothing.** Only something
// automated fills in an off-screen field, so there is no real person to
// inform. A bot told it failed retries with the field left blank; one told it
// succeeded goes away.
//
// **Turnstile — answer `success: false`.** A missing or failed token is NOT
// proof of a bot. A privacy blocker that blocks `challenges.cloudflare.com`
// produces exactly the same evidence as a script, and so does a corporate
// proxy. Telling that person "received, we'll be in touch" while writing
// nothing is the worst failure this whole feature can produce: they believe
// they have reached the studio and nobody ever replies. `success: false`
// lands in each form's own catch, which already says "Something went wrong.
// Please try again, or email us at sayhello@elenablair.com" — an error with
// a way out.
//
// The shape is `{ success: false }` at status 200 rather than a 403 because
// that is the exact shape every one of these forms already handles; none of
// them reads `res.ok`. A 403 would be more correct as HTTP and less correct
// as behaviour.
function rejectionResponse(reason) {
  const silent = reason === 'honeypot'
  console.log(`[spam-guard] rejected: ${reason} (${silent ? 'silent' : 'told'})`)
  if (silent) return { statusCode: 200, body: JSON.stringify({ success: true }) }
  return {
    statusCode: 200,
    body: JSON.stringify({ success: false, error: 'verification-failed' }),
  }
}

// The two field names the front end must use. Exported so the HTML and this
// file cannot drift — the failure mode of a renamed honeypot is silent, and
// it fails in the direction of letting everything through.
module.exports = {
  HONEYPOT_FIELD,
  TOKEN_FIELD,
  checkSubmission,
  rejectionResponse,
  // Exported so a harness can assert BOTH postures. The emergency stop is
  // only worth having if it is known to work on the day it is needed.
  rejectMissingToken,
}
