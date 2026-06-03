// Netlify serverless function: create a Razorpay order.
// Uses only built-in fetch (Node 18+) — no npm dependencies (per CLAUDE.md).
//
// Env vars (set in Netlify dashboard → Site settings → Environment variables):
//   RAZORPAY_KEY_ID      — e.g. rzp_test_XXXX or rzp_live_XXXX
//   RAZORPAY_KEY_SECRET  — the secret (NEVER committed to git)
//
// Request  body : { amount: <paise int>, currency: "INR", items: [...] }
// Response body : { orderId, amount, currency, keyId }

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

  const amount = parseInt(body.amount, 10);
  if (!Number.isInteger(amount) || amount <= 0) {
    return resp(400, { error: 'Invalid amount' });
  }

  // Bot protection: verify reCAPTCHA v3 token if a secret is configured.
  const rcSecret = process.env.RECAPTCHA_SECRET;
  if (rcSecret) {
    const ok = await verifyRecaptcha(rcSecret, body.recaptcha_token, 'checkout');
    if (!ok) return resp(403, { error: 'reCAPTCHA failed' });
  }

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
        amount,                       // integer paise
        currency: body.currency || 'INR',
        receipt,
        payment_capture: 1,
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
