// Spam protection, the browser half (§128, item 9). Pairs with
// `netlify/functions/lib/spam-guard.js`, which is where the checking
// actually happens — everything here is a courtesy to the server.
//
// **Nothing on this page is a defence.** A bot does not run it. The honeypot
// field and the Turnstile widget exist so that a REAL submission carries the
// evidence the server needs; the decision is the server's alone.
//
// Injected by script rather than written into each form's HTML, for the
// reason the field names are shared constants: four hand-copied honeypots
// are four chances to rename one and silently disable the trap.
;(function () {
  // Must match `HONEYPOT_FIELD` / `TOKEN_FIELD` in the function lib. A
  // mismatch fails OPEN — the server sees an empty honeypot and lets
  // everything through — so these two strings are worth keeping boring.
  var HONEYPOT_FIELD = 'company_fax'
  var TOKEN_FIELD = 'turnstile_token'
  var TURNSTILE_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js'

  function siteKey() {
    return (window.EB_TURNSTILE_SITE_KEY || '').trim()
  }

  // Off-screen, not `display: none` and not `type="hidden"`. A hidden input
  // is skipped by anything that has seen a honeypot before; an off-screen
  // text input looks like a field. `tabindex="-1"` and `aria-hidden` keep a
  // keyboard user and a screen reader out of it, which matters — a person
  // who tabs into an invisible field and types would have their enquiry
  // silently dropped, and that is the one way this can hurt a real client.
  function addHoneypot(form) {
    if (form.querySelector('[name="' + HONEYPOT_FIELD + '"]')) return
    var wrap = document.createElement('div')
    wrap.setAttribute('aria-hidden', 'true')
    wrap.style.position = 'absolute'
    wrap.style.left = '-9999px'
    wrap.style.width = '1px'
    wrap.style.height = '1px'
    wrap.style.overflow = 'hidden'

    var label = document.createElement('label')
    label.setAttribute('for', 'eb-' + HONEYPOT_FIELD)
    label.textContent = 'Fax'

    var input = document.createElement('input')
    input.type = 'text'
    input.id = 'eb-' + HONEYPOT_FIELD
    input.name = HONEYPOT_FIELD
    input.autocomplete = 'off'
    input.tabIndex = -1

    wrap.appendChild(label)
    wrap.appendChild(input)
    form.appendChild(wrap)
  }

  // Rendered above the submit button, or at the end of the form if no submit
  // button can be found. Implicit rendering: Cloudflare's script finds
  // `.cf-turnstile` and writes the token into a `cf-turnstile-response`
  // input inside this form.
  function addTurnstile(form) {
    var key = siteKey()
    if (!key) return
    if (form.querySelector('.cf-turnstile')) return

    var holder = document.createElement('div')
    holder.className = 'cf-turnstile'
    holder.setAttribute('data-sitekey', key)
    // Managed mode: invisible for almost everyone, an interaction only for
    // traffic Cloudflare is unsure about.
    holder.setAttribute('data-appearance', 'interaction-only')
    // **A Turnstile token expires after 300 seconds, and these forms take
    // longer than that.** The minor intake asks about thirty questions; the
    // commission form asks for a brief. Someone filling one in carefully
    // would arrive at Submit holding a dead token and be rejected — the
    // single most likely way this feature loses a real enquiry. `auto` gets
    // a fresh one before that happens.
    holder.setAttribute('data-refresh-expired', 'auto')
    holder.style.margin = '1.5rem 0'

    var submit = form.querySelector('button[type="submit"], input[type="submit"], button:not([type])')
    if (submit && submit.parentNode) submit.parentNode.insertBefore(holder, submit)
    else form.appendChild(holder)

    // **Tell the person early if the widget cannot run.** Turnstile calls
    // this on a configuration or network failure — `110200` is "domain not
    // allowed", which is what a missing hostname on the widget produces.
    //
    // The degrade this was written for is gone (the server is strict again
    // as of 24 September), and the wording has changed with it: it no longer
    // says the form "may not" go through, because now it will not. What has
    // not changed is why it exists — without it someone answers thirty
    // questions and only then finds out the page could not verify them.
    // Under strict verification that warning is worth MORE, not less.
    holder.setAttribute('data-error-callback', 'ebTurnstileError')

    if (!document.querySelector('script[src^="' + TURNSTILE_SRC + '"]')) {
      var script = document.createElement('script')
      script.src = TURNSTILE_SRC
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    }
  }

  function install(form) {
    if (!form) return
    addHoneypot(form)
    addTurnstile(form)
  }

  // Merged into whatever payload the form already builds. Returns the
  // honeypot's value — which is the POINT: the server needs to see what was
  // typed into it, so this must not helpfully omit a filled-in trap.
  function fields(form) {
    var trap = form.querySelector('[name="' + HONEYPOT_FIELD + '"]')
    var token = form.querySelector('[name="cf-turnstile-response"]')
    var out = {}
    out[HONEYPOT_FIELD] = trap ? trap.value : ''
    out[TOKEN_FIELD] = token ? token.value : ''
    return out
  }

  // Named on `window` because Turnstile's implicit rendering takes a callback
  // by NAME, not by reference.
  window.ebTurnstileError = function (code) {
    var forms = document.querySelectorAll('form')
    for (var i = 0; i < forms.length; i++) {
      var form = forms[i]
      if (form.querySelector('.eb-verify-warning')) continue
      if (!form.querySelector('.cf-turnstile')) continue
      var p = document.createElement('p')
      p.className = 'eb-verify-warning'
      p.setAttribute('role', 'status')
      p.style.margin = '1.25rem 0'
      p.style.fontSize = '13px'
      p.style.lineHeight = '1.8'
      p.style.color = '#6E1E23'
      p.textContent =
        'The spam check on this page is not loading, so this form cannot be ' +
        'submitted right now. Please reload, or email us at ' +
        'sayhello@elenablair.com and we will pick it up from there.'
      form.insertBefore(p, form.firstChild)
    }
    if (window.console && console.warn) console.warn('[spam-guard] Turnstile error', code)
  }

  window.EBSpamGuard = { install: install, fields: fields }
})()
