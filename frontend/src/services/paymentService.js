import api from "../api/axios";
import { createOrder, loadRazorpayScript } from "./razorpayService";

/**
 * Called after Razorpay payment succeeds.
 */
export async function verifyPayment(payload) {
  const response = await api.post("/payments/verify", payload);

  return response.data.data;
}

/**
 * Existing payment API (kept for compatibility if needed elsewhere).
 */
export async function submitPayment(userId, payment) {
  const response = await api.post(`/payments/${userId}`, payment);
  return response.data.data;
}

/**
 * Starts Razorpay Checkout.
 */
export async function startRazorpayPayment(
  userId,
  paymentData,
  onSuccess,
  onFailure,
) {
  const loaded = await loadRazorpayScript();

  if (!loaded) {
    throw new Error("Unable to load Razorpay Checkout.");
  }

  // Create Razorpay Order
  const order = await createOrder(paymentData.amount);

  const options = {
    key: order.key,

    amount: order.amount,

    currency: order.currency,

    name: "Sentinel Pay",

    description: "AI Secured Payment",

    order_id: order.orderId,

    theme: {
      color: "#2563EB",
    },

    prefill: {
      name: paymentData.recipientName,
    },

    handler: async function (response) {
      try {
        const verified = await verifyPayment({
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,

          userId,

          payment: paymentData,
        });

        // Pass the entire PaymentResponse to the UI
        onSuccess(verified.payment);
      } catch (err) {
        onFailure(err);
      }
    },

    modal: {
      ondismiss() {
        onFailure(new Error("Payment cancelled."));
      },
    },
  };

  const razorpay = new window.Razorpay(options);

  razorpay.open();
}

/**
 * Converts backend payment status to UI status.
 */
export function paymentOutcome(payment) {
  switch (payment.paymentStatus) {
    case "BLOCKED":
      return "BLOCKED";

    case "UNDER_REVIEW":
      return "UNDER_REVIEW";

    default:
      return "SUCCESSFUL";
  }
}
