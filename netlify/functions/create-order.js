// Netlify serverless function: create a Razorpay order.
// Uses only built-in fetch (Node 18+) — no npm dependencies (per CLAUDE.md).
//
// SECURITY: the client sends only cart items ({id, qty}); the amount is
// recomputed HERE from the bundled catalog plus the same Google Sheet
// price/active/stock overrides the storefront uses. A client-supplied
// amount is never trusted.
//
// Env vars (set in Netlify dashboard → Site settings → Environment variables):
//   RAZORPAY_KEY_ID      — e.g. rzp_test_XXXX or rzp_live_XXXX
//   RAZORPAY_KEY_SECRET  — the secret (NEVER committed to git)
//   RECAPTCHA_SECRET     — optional, enables reCAPTCHA v3 verification
//   SHEET_CSV_URL        — optional, same published-CSV URL as <meta name="sheet-csv">
//
// Request  body : { items: [{ id, qty }], recaptcha_token }
// Response body : { orderId, amount, currency, keyId }

const CATALOG = require('../../data/products.json').products;

const GST_RATE = 0.18;
const FREE_SHIP_THRESHOLD = 2999; // rupees, free shipping at/above this
const SHIP_FLAT = 199;            // rupees
const MAX_QTY_PER_ITEM = 20;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return resp(405, { error: 'Method not allowed' });
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  // Keys not configured → 503 so the frontend falls back to demo mode.
  if (!keyId || !keySecret) {
    return resp(503, { error: 'Razorpay keys not configured' });
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (e) {
    return resp(400, { error: 'Invalid JSON' });
  }

  // Bot protection: verify reCAPTCHA v3 token if a secret is configured.
  const rcSecret = process.env.RECAPTCHA_SECRET;
  if (rcSecret) {
    const ok = await verifyRecaptcha(rcSecret, body.recaptcha_token, 'checkout');
    if (!ok) return resp(403, { error: 'reCAPTCHA failed' });
  }

  // ---- Validate cart items and recompute the amount server-side ----
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return resp(400, { error: 'Cart is empty' });
  }
  const qtyById = new Map();
  for (const it of body.items) {
    const id = parseInt(it && it.id, 10);
    const qty = parseInt(it && it.qty, 10);
    if (!Number.isInteger(id) || !Number.isInteger(qty) || qty < 1 || qty > MAX_QTY_PER_ITEM) {
      return resp(400, { error: 'Invalid cart item' });
    }
    qtyById.set(id, (qtyById.get(id) || 0) + qty);
  }

  const overrides = await fetchSheetOverrides(); // {} when sheet not configured/unreachable
  let sub = 0;
  const noteLines = [];
  for (const [id, qty] of qtyById) {
    const prod = CATALOG.find((p) => p.id === id);
    if (!prod) return resp(400, { error: 'Unknown product in cart' });
    const ov = overrides[id] || {};
    const active = ov.active !== undefined ? ov.active : prod.active !== false;
    if (!active) return resp(409, { error: `${prod.name} is no longer available` });
    const stock = Number.isInteger(ov.stock) ? ov.stock : prod.stock;
    if (Number.isInteger(stock) && qty > stock) {
      return resp(409, { error: `${prod.name}: only ${stock} left in stock` });
    }
    const price = Number.isInteger(ov.price) ? ov.price : prod.price; // rupees
    sub += price * qty;
    noteLines.push(`${prod.name} x${qty}`);
  }
  const gst = Math.round(sub * GST_RATE);
  const ship = sub >= FREE_SHIP_THRESHOLD ? 0 : SHIP_FLAT;
  const amount = (sub + gst + ship) * 100; // integer paise

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
  const receipt = 'oc_' + Date.now();

  try {
    const r = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,                       // integer paise, server-computed
        currency: 'INR',
        receipt,
        payment_capture: 1,
        notes: { items: noteLines.join(', ').slice(0, 250) },
      }),
    });

    const data = await r.json();
    if (!r.ok) {
      return resp(502, { error: 'Razorpay order failed', detail: data });
    }

    return resp(200, {
      orderId: data.id,
      amount: data.amount,
      currency: data.currency,
      keyId,                          // publishable key id, safe to expose
    });
  } catch (e) {
    return resp(500, { error: 'Order creation error', detail: String(e) });
  }
};

/* Fetch the same published Google Sheet CSV the storefront uses and return
   id -> { stock, price, active }. Any failure → {} (catalog values apply). */
async function fetchSheetOverrides() {
  const url = process.env.SHEET_CSV_URL;
  if (!url) return {};
  try {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 4000);
    const r = await fetch(url, { signal: ctl.signal });
    clearTimeout(timer);
    if (!r.ok) return {};
    const rows = parseCSV(await r.text()).filter((row) => row.length && row.some((c) => c !== ''));
    if (rows.length < 2) return {};
    const head = rows[0].map((h) => h.trim().toLowerCase());
    const ci = {
      id: head.indexOf('id'),
      stock: head.indexOf('stock'),
      price: head.indexOf('price'),
      active: head.indexOf('active'),
    };
    if (ci.id === -1) return {};
    const map = {};
    for (let i = 1; i < rows.length; i++) {
      const cells = rows[i];
      const id = parseInt((cells[ci.id] || '').trim(), 10);
      if (!Number.isInteger(id)) continue;
      const entry = {};
      if (ci.stock !== -1 && cells[ci.stock] !== '') entry.stock = parseInt(cells[ci.stock], 10);
      if (ci.price !== -1 && cells[ci.price] !== '') entry.price = parseInt(cells[ci.price], 10);
      if (ci.active !== -1) {
        const a = (cells[ci.active] || '').trim().toLowerCase();
        entry.active = !(a === 'false' || a === 'no' || a === '0' || a === 'n');
      }
      map[id] = entry;
    }
    return map;
  } catch (e) {
    return {};
  }
}

/* Minimal CSV parser (quoted fields + commas) — mirrors scripts/sheet-sync.js */
function parseCSV(text) {
  const rows = [];
  let row = [], field = '', inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') inQ = false;
      else field += c;
    } else {
      if (c === '"') inQ = true;
      else if (c === ',') { row.push(field); field = ''; }
      else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
      else if (c === '\r') { /* skip */ }
      else field += c;
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows;
}

async function verifyRecaptcha(secret, token, action) {
  if (!token) return false;
  try {
    const params = new URLSearchParams({ secret, response: token });
    const r = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    const d = await r.json();
    // v3: require success, matching action, and a non-bot score.
    return !!d.success && (!d.action || d.action === action) && (d.score == null || d.score >= 0.5);
  } catch (e) {
    return false;
  }
}

function resp(statusCode, obj) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(obj),
  };
}
