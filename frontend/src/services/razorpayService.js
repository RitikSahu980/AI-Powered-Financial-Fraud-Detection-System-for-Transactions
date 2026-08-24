import api from "../api/axios";

/**
 * Creates a Razorpay order from the backend.
 */
export async function createOrder(amount) {
  const response = await api.post("/payments/create-order", {
    amount,
  });

  return response.data.data;
}

export async function verifyPayment(payload) {
  const response = await api.post("/payments/verify", payload);
  return response.data.data;
}

/**
 * Loads the Razorpay SDK if it isn't already present.
 */
export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
}
