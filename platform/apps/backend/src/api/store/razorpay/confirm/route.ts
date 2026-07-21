import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import crypto from "crypto"

/**
 * POST /store/razorpay/confirm
 *
 * After Razorpay Checkout succeeds on the client, attach the payment id +
 * HMAC signature to the active payment session so complete-cart can authorize.
 *
 * Body:
 *   cart_id, razorpay_order_id, razorpay_payment_id, razorpay_signature
 *
 * Requires publishable API key (store route).
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = (req.body || {}) as {
    cart_id?: string
    razorpay_order_id?: string
    razorpay_payment_id?: string
    razorpay_signature?: string
  }

  const cartId = body.cart_id?.trim()
  const orderId = body.razorpay_order_id?.trim()
  const paymentId = body.razorpay_payment_id?.trim()
  const signature = body.razorpay_signature?.trim()

  if (!cartId || !orderId || !paymentId || !signature) {
    return res.status(400).json({
      message:
        "cart_id, razorpay_order_id, razorpay_payment_id, razorpay_signature required",
    })
  }

  const secret = process.env.RAZORPAY_KEY_SECRET
  if (!secret) {
    return res.status(503).json({ message: "Razorpay is not configured" })
  }

  // Verify HMAC before trusting client fields (same formula as authorizePayment)
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex")

  const ok =
    expected.length === signature.length &&
    crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))

  if (!ok) {
    return res.status(400).json({ message: "Invalid Razorpay signature" })
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const payment = req.scope.resolve(Modules.PAYMENT)

  const { data: carts } = await query.graph({
    entity: "cart",
    fields: [
      "id",
      "currency_code",
      "total",
      "payment_collection.id",
      "payment_collection.payment_sessions.id",
      "payment_collection.payment_sessions.provider_id",
      "payment_collection.payment_sessions.data",
      "payment_collection.payment_sessions.status",
      "payment_collection.payment_sessions.amount",
      "payment_collection.payment_sessions.currency_code",
    ],
    filters: { id: cartId },
  })

  const cart = carts?.[0] as any
  if (!cart?.payment_collection?.id) {
    return res.status(404).json({ message: "Cart or payment collection not found" })
  }

  const sessions: any[] = cart.payment_collection.payment_sessions || []
  const session =
    sessions.find(
      (s) =>
        String(s.provider_id || "").includes("razorpay") &&
        (s.status === "pending" || s.status === "requires_more")
    ) ||
    sessions.find((s) => String(s.provider_id || "").includes("razorpay"))

  if (!session?.id) {
    return res.status(400).json({
      message: "No Razorpay payment session on this cart — select Razorpay first",
    })
  }

  // Prefer module retrieve for authoritative amount/currency
  let amount = session.amount
  let currency_code = session.currency_code || cart.currency_code || "inr"
  try {
    const full = await payment.retrievePaymentSession(session.id)
    amount = full.amount ?? amount
    currency_code = full.currency_code || currency_code
  } catch {
    // fall back to graph fields / cart total
  }
  if (amount == null) {
    amount = cart.total
  }

  const prev = (session.data || {}) as Record<string, unknown>
  // Keep Razorpay order id as `id` (from initiatePayment) for authorize
  const nextData = {
    ...prev,
    id: prev.id || orderId,
    razorpay_order_id: orderId,
    razorpay_payment_id: paymentId,
    razorpay_signature: signature,
    verified_client: true,
  }

  await payment.updatePaymentSession({
    id: session.id,
    data: nextData,
    amount,
    currency_code,
  })

  return res.status(200).json({
    ok: true,
    payment_session_id: session.id,
  })
}
