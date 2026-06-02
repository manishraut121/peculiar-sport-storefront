# CLAUDE.md — OneCurve Sports (peculiar-sport-storefront)
# Real e-commerce. India market. Cricket equipment.

## Project overview
Brand: OneCurve — premium handcrafted cricket equipment, Made in India
Domain: onecurve.in
Stack: Vanilla HTML/CSS/JS + Netlify hosting + Razorpay payments
         + Google Sheets (stock/orders) + EmailJS (transactional email)
Repo: github.com/your-org/peculiar-sport-storefront
Owner: solo operator, Claude Code is the dev partner

## File structure
/
├── index.html              ← main storefront (single page app)
├── CLAUDE.md               ← this file
├── README.md               ← setup instructions
├── /images/
│   └── /products/          ← product-{id}-main.jpg, product-{id}-alt{n}.jpg
├── /data/
│   └── products.json       ← product catalog (source of truth)
├── /scripts/
│   └── sheet-sync.js       ← fetches stock from Google Sheet
├── sitemap.xml             ← auto-generated, all product URLs
├── robots.txt              ← allow all, link sitemap
└── netlify.toml            ← redirects + headers config

## Current live state — update this section after every session
- [ ] Deployed to Netlify: NO
- [ ] onecurve.in DNS pointed: NO
- [ ] Razorpay live keys wired: NO (simPay() still in place)
- [ ] Real product photos: NO (SVG placeholders)
- [ ] Google Sheet stock sync: NO
- [ ] EmailJS order confirmation: NO
- [ ] Individual product page URLs: NO (SPA only)
- [ ] Sitemap + Search Console: NO

## Design system — never change these
Primary brand color:  #C9A84C  (gold)
Gold hover:           #E2B84C
Page background:      #080808  (near black)
Card background:      #181818
Surface background:   #0F0F0F
Primary text:         #F0EEE8
Muted text:           rgba(240,238,232,0.52)

Display font: 'Bebas Neue' (class="display") — headings, prices, stats
Body font:    'DM Sans' — all other text

Rules:
- Gold is the ONLY accent — no blue/green/red UI elements
- All prices via fmtP(n) → "Rs.X,XXX" (en-IN locale, integer paise)
- Dark theme only — never add light sections or white backgrounds
- Every button/interactive element needs data-testid="..."
- Mobile: 960px tablet breakpoint, 640px mobile breakpoint
- GST: 18% shown as line item in cart — Math.round(subtotal * 0.18)
- Free shipping threshold: Rs.2,999 (fix existing Rs.999 bug)

## Product data architecture

### Source of truth: /data/products.json

```json
{
  "products": [
    {
      "id": 1,
      "name": "Original Player Edition",
      "slug": "original-player-edition",
      "cat": "bats",
      "grade": "1+",
      "price": 43700,
      "stock": 12,
      "lowStockThreshold": 3,
      "badge": "Pro Series",
      "badgeClass": "badge-gold",
      "desc": "...",
      "specs": { "Weight": "1180g", "Edge": "42mm" },
      "images": ["product-1-main.jpg", "product-1-alt1.jpg"],
      "clr": "gold",
      "seoTitle": "OneCurve Original Player Edition — Grade 1+ English Willow Bat",
      "seoDesc": "Player-grade Grade 1+ English Willow cricket bat..."
    }
  ]
}
```

### Google Sheet stock sync
Sheet columns: id | name | stock | price | active
Published as CSV: File → Share → Publish to web → CSV
URL stored in: scripts/sheet-sync.js as SHEET_URL constant
index.html fetches this on load and overrides stock values from products.json
If Sheet fetch fails → fall back to products.json values silently

### Stock states in UI
stock > lowStockThreshold  → normal "Add to Cart" button
stock <= lowStockThreshold → "Only N left!" warning badge + add to cart
stock === 0               → "Sold Out" badge, button disabled, "Notify Me" shown
active === false          → product hidden from listing entirely

## Razorpay integration — CRITICAL PATH

### Replace simPay() with this exact pattern:

```javascript
function openRazorpay(method) {
  const sub = cartTotal();           // calculate from cart
  const gst = Math.round(sub * 0.18);
  const ship = sub >= 2999 ? 0 : 199;
  const total = sub + gst + ship;

  const options = {
    key: 'rzp_live_XXXXXXXXXX',      // NEVER commit — load from meta tag
    amount: total * 100,             // Razorpay uses paise
    currency: 'INR',
    name: 'OneCurve Sports',
    description: 'Cricket Equipment Order',
    image: '/images/logo.png',
    prefill: { name: '', email: '', contact: '' },
    theme: { color: '#C9A84C' },
    modal: { ondismiss: () => closeCheckout() },
    handler: function(response) {
      onPaymentSuccess(response);
    }
  };
  const rzp = new Razorpay(options);
  rzp.open();
}

function onPaymentSuccess(response) {
  // 1. Log to Google Sheet
  logOrderToSheet(response);
  // 2. Send customer email via EmailJS
  sendOrderEmail(response);
  // 3. Show success screen
  showSuccessScreen(response.razorpay_payment_id);
  // 4. Clear cart
  cart = []; updCartUI();
}
```

### Razorpay key loading — SECURE
Never hardcode key in JS. Load from:

```html
<meta name="rzp-key" content="rzp_live_XXXXXXX">
```

Then in JS: `document.querySelector('meta[name="rzp-key"]').content`
Netlify environment variable → injected at build via _headers or build plugin

### Add Razorpay SDK to <head>:

```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

## Google Sheet order logging

### Apps Script webhook (deploy as web app):

```javascript
function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const sheet = SpreadsheetApp.getActiveSheet();
  sheet.appendRow([
    new Date(),
    data.payment_id,
    data.amount,
    data.items,
    data.customer_name,
    data.customer_email,
    data.customer_phone,
    'PAID'
  ]);
  // Send WhatsApp alert via Twilio or email via Gmail
  sendOwnerAlert(data);
  return ContentService.createTextOutput('ok');
}
```

Sheet columns: Timestamp | Payment ID | Amount | Items | Name | Email | Phone | Status

## Out-of-stock notification system

### "Notify me" button behaviour:
- Shown when stock === 0
- Customer enters email → POST to Google Apps Script
- Script logs: product_id | product_name | customer_email | timestamp
- When you restock: update Sheet stock > 0, run notifyWaitlist(product_id)
- notifyWaitlist sends email via EmailJS to all waiting customers

### Owner low-stock alert:
- On every order completion, if any item stock drops to lowStockThreshold
- POST to Apps Script → sends you email: "⚠ Only 3 Original Player Edition left"
- Include WhatsApp message via Twilio if set up

## EmailJS order confirmation

### Setup:

```javascript
emailjs.init('YOUR_PUBLIC_KEY');

function sendOrderEmail(paymentResponse) {
  const orderItems = cart.map(item => {
    const p = PRODS.find(x => x.id === item.id);
    return `${p.name} x${item.qty} — ${fmtP(p.price * item.qty)}`;
  }).join('\n');

  emailjs.send('service_id', 'template_id', {
    to_email: customerEmail,
    to_name: customerName,
    order_id: paymentResponse.razorpay_payment_id,
    order_items: orderItems,
    order_total: fmtP(cartGrandTotal()),
    delivery_days: '3-5 business days'
  });
}
```

Template must use OneCurve branding: dark background #080808, gold #C9A84C

## SEO requirements

### Every product needs (for individual page URLs):

```html
<title>OneCurve {product.name} — {grade} English Willow Cricket Bat | Buy India</title>
<meta name="description" content="{product.seoDesc} Free delivery. Shop at onecurve.in">
<link rel="canonical" href="https://onecurve.in/products/{product.slug}">
<meta property="og:title" content="...">
<meta property="og:image" content="https://onecurve.in/images/products/{product.id}-og.jpg">
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "{product.name}",
  "offers": { "@type": "Offer", "price": "{product.price}", "priceCurrency": "INR",
               "availability": "https://schema.org/InStock" }
}
</script>
```

### sitemap.xml must include:
- / (homepage)
- /products/ (all products page)
- /products/{slug} for every active product
- Regenerate whenever products change

### Image SEO:
- All <img> tags: alt="{product.name} cricket {cat} — OneCurve"
- File names: original-player-edition-cricket-bat.jpg (not product-1-main.jpg)
- WebP format with JPG fallback
- Sizes: main 800×800, thumbnail 300×300, OG 1200×630

## Product images — requirements
Path: /images/products/
Required per product:
  {slug}-main.webp      (800×800, white/neutral bg)
  {slug}-alt1.webp      (800×800, angle shot)
  {slug}-alt2.webp      (800×800, detail/close-up)
  {slug}-og.jpg         (1200×630, landscape, for social sharing)

Until real photos exist: keep SVG placeholders but add real photos
as priority — conversion drops ~60% without real product images.

## What NOT to do
- Never change the gold/dark color scheme
- Never add light-mode or white-background sections
- Never commit Razorpay live keys to git
- Never change fmtP() price format
- Never use float math for money — always integers (paise)
- Never remove data-testid attributes
- Never hardcode stock numbers in HTML — always from products.json/Sheet
- Never add npm/node dependencies — stays vanilla JS
- Never convert to React/Vue — keep it fast, simple, deployable via drag-drop
- Never break mobile layout — test at 375px width after every change

## Known bugs — fix in order
1. Free shipping threshold says Rs.999 → should be Rs.2,999
2. Newsletter subscribe doesn't save email → wire to Apps Script
3. Cart badge shows 0 on first load → initialise from localStorage
4. simPay() is mock → replace with real Razorpay (PRIORITY)

## Done signal — mandatory at end of every task
DONE. Verify: [exact steps to confirm it works]
Example: "DONE. Verify: add product to cart → checkout →
Razorpay modal opens → pay with test card 4111... →
success screen shows real payment ID → check Razorpay
dashboard → order appears."

## Today's execution order
1. netlify deploy (drag index.html) → get live URL
2. point onecurve.in DNS to Netlify
3. create Razorpay account + complete KYC
4. wire Razorpay into checkout (replace simPay)
5. set up Google Sheet + Apps Script for order logging
6. fix free shipping threshold bug (Rs.999 → Rs.2,999)
7. upload real product photos
8. wire EmailJS for customer order confirmation
