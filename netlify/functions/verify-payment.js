// Netlify serverless function: verify a Razorpay payment signature.
// Uses Node's built-in crypto — no npm dependencies (per CLAUDE.md).
//
// Razorpay signs `${order_id}|${payment_id}` with HMAC-SHA256 using the
// key secret. We recompute it server-side and compare in constant time.
//
// Request  body : { razorpay_order_id, razorpay_payment_id, razorpay_signature }
// Response body : { verified: true|false }

const crypto = require('crypto');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return resp(405, { error: 'Method not allowed' });
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    return resp(503, { error: 'Razorpay keys not configured' });
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (e) {
    return resp(400, { error: 'Invalid JSON' });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return resp(400, { error: 'Missing fields' });
  }

  const expected = crypto
    .createHmac('sha256', keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  const verified = safeEqual(expected, razorpay_signature);

  // TODO (owner): on verified, log order to Google Sheet + send EmailJS receipt.
  return resp(200, { verified });
};

function safeEqual(a, b) {
  const ab = Buffer.from(a, 'utf8');
  const bb = Buffer.from(b, 'utf8');
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

function resp(statusCode, obj) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(obj),
  };
}
