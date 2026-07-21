import { AbstractPaymentProvider } from "@medusajs/framework/utils";
import {
  AuthorizePaymentInput,
  AuthorizePaymentOutput,
  CancelPaymentInput,
  CancelPaymentOutput,
  CapturePaymentInput,
  CapturePaymentOutput,
  DeletePaymentInput,
  DeletePaymentOutput,
  GetPaymentStatusInput,
  GetPaymentStatusOutput,
  InitiatePaymentInput,
  InitiatePaymentOutput,
  ProviderWebhookPayload,
  RefundPaymentInput,
  RefundPaymentOutput,
  RetrievePaymentInput,
  RetrievePaymentOutput,
  UpdatePaymentInput,
  UpdatePaymentOutput,
  WebhookActionResult,
} from "@medusajs/framework/types";
import crypto from "crypto";

type Options = {
  keyId: string;
  keySecret: string;
  webhookSecret?: string;
};

/**
 * Razorpay payment provider for Medusa v2 (India / INR).
 *
 * Server-side flow:
 *  - initiatePayment  -> create a Razorpay Order (amount in paise)
 *  - the storefront opens Razorpay Checkout with that order_id
 *  - authorizePayment -> verify the HMAC-SHA256 signature, then capture
 *  - getWebhookActionAndData -> independently verify the webhook signature
 *
 * Registered only when RAZORPAY_KEY_ID/SECRET are set (see medusa-config),
 * so the backend runs fine without keys; manual payment handles demos.
 */
class RazorpayProviderService extends AbstractPaymentProvider<Options> {
  static identifier = "razorpay";

  protected options_: Options;

  constructor(container: any, options: Options) {
    super(container, options);
    this.options_ = options;
  }

  static validateOptions(options: Options) {
    if (!options.keyId || !options.keySecret) {
      throw new Error("Razorpay provider requires keyId and keySecret");
    }
  }

  private authHeader() {
    const token = Buffer.from(
      `${this.options_.keyId}:${this.options_.keySecret}`
    ).toString("base64");
    return `Basic ${token}`;
  }

  private async api(path: string, method = "GET", body?: any) {
    const res = await fetch(`https://api.razorpay.com/v1${path}`, {
      method,
      headers: {
        Authorization: this.authHeader(),
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(
        `Razorpay ${method} ${path} failed: ${JSON.stringify(data)}`
      );
    }
    return data;
  }

  private toPaise(amount: any): number {
    return Math.round(Number(amount) * 100);
  }

  async initiatePayment(
    input: InitiatePaymentInput
  ): Promise<InitiatePaymentOutput> {
    const order = await this.api("/orders", "POST", {
      amount: this.toPaise(input.amount),
      currency: (input.currency_code || "inr").toUpperCase(),
      payment_capture: 1,
      notes: { medusa: "true" },
    });
    return {
      id: order.id,
      data: { ...order, keyId: this.options_.keyId },
    };
  }

  async authorizePayment(
    input: AuthorizePaymentInput
  ): Promise<AuthorizePaymentOutput> {
    const data: any = input.data || {};
    // Prefer explicit razorpay_order_id (set after Checkout) over internal id
    const orderId = data.razorpay_order_id || data.id;
    const paymentId = data.razorpay_payment_id;
    const signature = data.razorpay_signature;

    // No client confirmation yet -> still pending (user must open Razorpay).
    if (!paymentId || !signature || !orderId) {
      return { status: "pending", data };
    }

    const expected = crypto
      .createHmac("sha256", this.options_.keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    const ok =
      expected.length === signature.length &&
      crypto.timingSafeEqual(
        Buffer.from(expected),
        Buffer.from(signature)
      );

    if (!ok) {
      return { status: "error", data: { ...data, verified: false } };
    }
    // CAPTURED: payment_capture:1 already captured at Razorpay
    return { status: "captured", data: { ...data, verified: true } };
  }

  async capturePayment(
    input: CapturePaymentInput
  ): Promise<CapturePaymentOutput> {
    // payment_capture:1 auto-captures on success; just echo the data.
    return { data: input.data };
  }

  async cancelPayment(
    input: CancelPaymentInput
  ): Promise<CancelPaymentOutput> {
    return { data: input.data };
  }

  async deletePayment(
    input: DeletePaymentInput
  ): Promise<DeletePaymentOutput> {
    return { data: input.data };
  }

  async refundPayment(
    input: RefundPaymentInput
  ): Promise<RefundPaymentOutput> {
    const data: any = input.data || {};
    const paymentId = data.razorpay_payment_id;
    if (paymentId) {
      const refund = await this.api(`/payments/${paymentId}/refund`, "POST", {
        amount: this.toPaise(input.amount),
      });
      return { data: { ...data, refund } };
    }
    return { data };
  }

  async retrievePayment(
    input: RetrievePaymentInput
  ): Promise<RetrievePaymentOutput> {
    const data: any = input.data || {};
    if (data.id) {
      const order = await this.api(`/orders/${data.id}`);
      return { data: { ...data, ...order } };
    }
    return { data };
  }

  async updatePayment(
    input: UpdatePaymentInput
  ): Promise<UpdatePaymentOutput> {
    // Amount changed before payment -> create a fresh order.
    return this.initiatePayment(input as unknown as InitiatePaymentInput);
  }

  async getPaymentStatus(
    input: GetPaymentStatusInput
  ): Promise<GetPaymentStatusOutput> {
    const data: any = input.data || {};
    try {
      if (data.id) {
        const order = await this.api(`/orders/${data.id}`);
        if (order.status === "paid")
          return { status: "captured", data: { ...data, ...order } };
        if (order.status === "attempted")
          return { status: "authorized", data: { ...data, ...order } };
      }
    } catch (e) {
      // fall through
    }
    return { status: "pending", data };
  }

  async getWebhookActionAndData(
    payload: ProviderWebhookPayload["payload"]
  ): Promise<WebhookActionResult> {
    const secret = this.options_.webhookSecret;
    const rawBody =
      typeof payload.rawData === "string"
        ? payload.rawData
        : Buffer.isBuffer(payload.rawData)
        ? payload.rawData.toString("utf8")
        : JSON.stringify(payload.data);
    const sig = (payload.headers?.["x-razorpay-signature"] as string) || "";

    if (secret) {
      const expected = crypto
        .createHmac("sha256", secret)
        .update(rawBody)
        .digest("hex");
      if (expected !== sig) {
        return { action: "not_supported" };
      }
    }

    const body: any = payload.data || {};
    const event = body.event as string;
    const entity =
      body?.payload?.payment?.entity || body?.payload?.order?.entity || {};
    const sessionId = entity.order_id || entity.id;
    const amount = entity.amount ? Number(entity.amount) / 100 : undefined;

    if (event === "payment.captured" || event === "order.paid") {
      return {
        action: "captured",
        data: { session_id: sessionId, amount: amount as any },
      };
    }
    if (event === "payment.authorized") {
      return {
        action: "authorized",
        data: { session_id: sessionId, amount: amount as any },
      };
    }
    if (event === "payment.failed") {
      return {
        action: "failed",
        data: { session_id: sessionId, amount: amount as any },
      };
    }
    return { action: "not_supported" };
  }
}

export default RazorpayProviderService;
