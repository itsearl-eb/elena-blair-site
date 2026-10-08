// The Cloudflare Turnstile SITE key for this site (§128, item 9).
//
// **This is the public half of the pair and belongs in the page.** The other
// half, the SECRET key, goes in this Netlify site's env vars as
// `TURNSTILE_SECRET_KEY` and must never appear in this repo — the secret is
// what makes server-side verification mean anything.
//
// Set 24 September 2026, with `TURNSTILE_SECRET_KEY` live on both Netlify
// sites in every context — so verification is now REAL, not skipped. Empty it
// again and the honeypot carries on alone; that path is still tested.
//
// One file rather than a copy per page, because a site key pasted into five
// pages is a site key that will be right in four of them.
window.EB_TURNSTILE_SITE_KEY = '0x4AAAAAAFB97udRwJdx75gY'
