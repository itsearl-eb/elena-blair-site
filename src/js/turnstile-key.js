// The Cloudflare Turnstile SITE key for this site (§128, item 9).
//
// **This is the public half of the pair and belongs in the page.** The other
// half, the SECRET key, goes in this Netlify site's env vars as
// `TURNSTILE_SECRET_KEY` and must never appear in this repo — the secret is
// what makes server-side verification mean anything.
//
// Left empty until Earl creates the widget at
// dash.cloudflare.com → Turnstile → Add widget. While it is empty:
//
//   - no widget renders, no Cloudflare script loads, and the forms submit
//     exactly as they do today;
//   - the HONEYPOT still runs, on both sides, and needs no configuration.
//
// One file rather than four hardcoded copies, because a site key pasted into
// four pages is a site key that will be right in three of them.
window.EB_TURNSTILE_SITE_KEY = ''
