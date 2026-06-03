# OneCurve — Security & Analytics setup

All free-tier. Do these once. Order doesn't matter, but Cloudflare gives the
biggest security win for the least effort, so start there.

---

## 1. Cloudflare — edge security (DDoS, WAF, SSL) — FREE

Puts onecurve.in behind Cloudflare's network: DDoS protection, a managed Web
Application Firewall, free SSL, and bot mitigation — all in front of your
Netlify site.

**Setup**
1. Create a free account at cloudflare.com → **Add a site** → `onecurve.in`.
2. Cloudflare scans your existing DNS records. Confirm them.
3. Cloudflare gives you **two nameservers**. Go to your domain registrar
   (where you bought onecurve.in) and replace its nameservers with those two.
   (Propagation: minutes to a few hours.)
4. In Cloudflare → **DNS**: point the site at Netlify and keep records
   **Proxied** (orange cloud):
   - `CNAME  @      your-site.netlify.app`  (proxied)
   - `CNAME  www    your-site.netlify.app`  (proxied)
   In Netlify → Domain settings, add `onecurve.in` as a custom domain so
   Netlify also issues its certificate.
5. Cloudflare → **SSL/TLS → Overview** → set mode to **Full (strict)**.
6. **SSL/TLS → Edge Certificates** → enable **Always Use HTTPS** and
   **Automatic HTTPS Rewrites**.

**Security toggles (Cloudflare dashboard)**
- **Security → Bots → Bot Fight Mode: ON** — blocks obvious bots free.
- **Security → WAF → Managed rules: ON** — OWASP-style protection.
- **Security → WAF → Rate limiting rules** → add one for the sensitive paths:
  - Path contains `/rep` → more than 10 requests / minute / IP → **Block**.
  - Path contains `/.netlify/functions/` → more than 20 / minute / IP → **Block**.
  This stops brute-forcing the rep passcode and hammering the payment function.
- **Speed/Caching → Caching**: leave default; Cloudflare caches your static
  assets (faster + absorbs traffic spikes).

> Note: with Cloudflare proxying + **Full (strict)** + Netlify's own
> certificate, both layers are encrypted end to end. If you ever see a
> redirect loop, it's almost always SSL mode set to *Flexible* instead of
> *Full (strict)* — fix that first.

---

## 2. reCAPTCHA v3 — bot protection on checkout + Rep Console — FREE

The code is already wired (storefront checkout sends action `checkout`, the
Rep Console sends `rep_sale`). You just need keys.

1. Go to **google.com/recaptcha/admin** → **+ Create**.
2. Type: **reCAPTCHA v3**. Domains: `onecurve.in` (add `localhost` too if you
   want to test locally). Submit.
3. You get a **Site key** (public) and a **Secret key** (private).
4. **Site key** → paste into the `<meta name="recaptcha-key" content="...">`
   tag in **both** `index.html` and `rep.html`.
5. **Secret key** → set it as a secret, never in git:
   - Netlify → Site settings → Environment variables → add
     `RECAPTCHA_SECRET = <secret>` (used by the create-order function).
   - Apps Script → set `var RECAPTCHA_SECRET = '<secret>';` at the top of
     `apps-script.gs`, then re-deploy the web app.

When the secret is set, the server rejects any request whose token is missing
or scores like a bot (score < 0.5). When it's blank, the check is skipped and
everything still works — so nothing breaks before you add keys.

---

## 3. Analytics — traffic + conversions — FREE

Pick ONE. Both are free for your volume.

### Option A — Plausible (privacy-friendly, lightweight)
Free trial / cheap; self-host is free. Add before `</head>` in `index.html`:
```html
<script defer data-domain="onecurve.in" src="https://plausible.io/js/script.js"></script>
```

### Option B — Google Analytics 4 (free, more features)
1. analytics.google.com → create a property for onecurve.in → get a
   **Measurement ID** (`G-XXXXXXX`).
2. Add before `</head>` in `index.html`:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX"></script>
<script>
  window.dataLayer=window.dataLayer||[];
  function gtag(){dataLayer.push(arguments);}
  gtag('js',new Date());
  gtag('config','G-XXXXXXX');
</script>
```

**Tracking conversions:** the site already fires internal events via `logEv()`
(e.g. `PAYMENT/payment_verified`, `CART/add_to_cart`). To forward those to GA4,
add inside `logEv()`: `if(window.gtag)gtag('event',action,{category,label});`
— tell me and I'll wire it.

> Cloudflare also has **Web Analytics** (free, privacy-first, no cookie banner)
> under its dashboard — a zero-code alternative if you'd rather not add a tag.

---

## What stays out of git (secrets)
- Razorpay key **secret** → Netlify env `RAZORPAY_KEY_SECRET`
- reCAPTCHA **secret** → Netlify env `RECAPTCHA_SECRET` + Apps Script var
- Rep passcodes → Apps Script `REP_PASSCODES`
Only **public** keys (Razorpay key id, reCAPTCHA site key, GA measurement id)
go in the HTML meta tags.
