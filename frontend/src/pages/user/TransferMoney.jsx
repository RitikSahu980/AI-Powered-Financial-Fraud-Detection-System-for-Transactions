import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Send, ShieldCheck, ShieldAlert, ShieldQuestion } from "lucide-react";

import { downloadReceipt } from "../../utils/pdfReceipt";

import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

import {
  startRazorpayPayment,
  paymentOutcome,
} from "../../services/paymentService";

import { normalizeApiError } from "../../api/axios";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";

import {
  validateRequired,
  validatePositiveAmount,
} from "../../utils/validators";

const PAYMENT_METHODS = [
  { value: "UPI", label: "UPI" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "CARD", label: "Card" },
  { value: "WALLET", label: "Wallet" },
];

const OUTCOME_COPY = {
  SUCCESSFUL: {
    icon: ShieldCheck,
    title: "Payment Successful",
    body: "Your payment was processed successfully and screened for fraud in real time.",
    tone: "text-risk-low",
    bg: "bg-risk-low-bg",
  },

  UNDER_REVIEW: {
    icon: ShieldQuestion,
    title: "Transaction Under Review",
    body: "Your payment requires additional verification before it is completed.",
    tone: "text-risk-medium",
    bg: "bg-risk-medium-bg",
  },

  BLOCKED: {
    icon: ShieldAlert,
    title: "Payment Blocked",
    body: "This payment was identified as high risk and has been blocked.",
    tone: "text-risk-high",
    bg: "bg-risk-high-bg",
  },
};

const INITIAL_FORM = {
  recipientName: "",
  recipientAccount: "",
  amount: "",
  remarks: "",
  paymentMethod: "UPI",
};

export default function TransferMoney() {
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  function handleChange(field) {
    return (e) => {
      setForm((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));

      if (errors[field]) {
        setErrors((prev) => ({
          ...prev,
          [field]: null,
        }));
      }
    };
  }

  function validate() {
    const next = {
      recipientName: validateRequired(form.recipientName, "Recipient Name"),

      recipientAccount: validateRequired(
        form.recipientAccount,
        "Recipient Account",
      ),

      amount: validatePositiveAmount(form.amount, "Amount"),
    };

    setErrors(next);

    return !Object.values(next).some(Boolean);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);
    setResult(null);

    try {
      await startRazorpayPayment(
        user.userId,

        {
          recipientName: form.recipientName.trim(),
          recipientAccount: form.recipientAccount.trim(),
          amount: Number(form.amount),
          paymentMethod: form.paymentMethod,
          remarks: form.remarks,
        },

        // Success
        (payment) => {
          setResult({
            ...payment,

            outcome: paymentOutcome(payment),

            recipientName: form.recipientName,

            recipientAccount: form.recipientAccount,

            amount: Number(form.amount),

            // Prefer the backend value if available
            paymentMethod: payment.paymentMethod ?? form.paymentMethod,

            // Razorpay IDs
            razorpayOrderId: payment.razorpayOrderId,

            razorpayPaymentId: payment.razorpayPaymentId,

            remarks: form.remarks,
          });

          setForm(INITIAL_FORM);

          toast.success("Payment completed successfully.");

          setIsSubmitting(false);
        },

        // Failure / Cancelled
        (err) => {
          if (err?.response) {
            toast.error(normalizeApiError(err).message);
          } else {
            toast.error(err.message);
          }

          setIsSubmitting(false);
        },
      );
    } catch (err) {
      if (err?.response) {
        toast.error(normalizeApiError(err).message);
      } else {
        toast.error(err.message);
      }

      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-semibold text-ink">
          Transfer Money
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Securely transfer money with AI-powered fraud detection.
        </p>
      </div>

      {result ? (
        <ResultCard
          result={result}
          onSendAnother={() => setResult(null)}
          onViewHistory={() => navigate("/user/history")}
        />
      ) : (
        <form
          onSubmit={handleSubmit}
          noValidate
          className="space-y-5 rounded-2xl border border-slate-100 bg-surface p-6 shadow-card"
        >
          <Input
            id="recipientName"
            label="Recipient Name"
            placeholder="Rahul Sharma"
            value={form.recipientName}
            onChange={handleChange("recipientName")}
            error={errors.recipientName}
            disabled={isSubmitting}
          />
          <Input
            id="recipientAccount"
            label="Recipient Account / UPI"
            placeholder="rahul@upi"
            value={form.recipientAccount}
            onChange={handleChange("recipientAccount")}
            error={errors.recipientAccount}
            disabled={isSubmitting}
          />
          <Input
            id="amount"
            label="Amount"
            type="number"
            min={0}
            step="0.01"
            placeholder="0.00"
            value={form.amount}
            onChange={handleChange("amount")}
            error={errors.amount}
            disabled={isSubmitting}
          />
          <Input
            id="remarks"
            label="Remarks (Optional)"
            placeholder="Rent Payment"
            value={form.remarks}
            onChange={handleChange("remarks")}
            disabled={isSubmitting}
          />
          <div>
            <label className="mb-2 block text-sm font-medium text-ink">
              Payment Method
            </label>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method.value}
                  type="button"
                  disabled={isSubmitting}
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      paymentMethod: method.value,
                    }))
                  }
                  className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                    form.paymentMethod === method.value
                      ? "border-azure bg-azure-50 text-azure"
                      : "border-slate-200 text-slate-500 hover:border-slate-300"
                  }`}
                >
                  {method.label}
                </button>
              ))}
            </div>
          </div>
          <Button
            type="submit"
            icon={Send}
            isLoading={isSubmitting}
            className="w-full"
          >
            Proceed to Pay
          </Button>
        </form>
      )}
    </div>
  );
}

function ResultCard({ result, onSendAnother, onViewHistory }) {
  const copy = OUTCOME_COPY[result.outcome];

  const currency = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  });

  return (
    <div className="rounded-2xl border border-slate-100 bg-surface p-8 text-center shadow-card">
      <div
        className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${copy.bg}`}
      >
        <copy.icon size={28} className={copy.tone} />
      </div>

      <h2 className={`mt-5 font-display text-2xl font-semibold ${copy.tone}`}>
        {copy.title}
      </h2>

      <p className="mt-3 text-sm text-slate-500">{copy.body}</p>

      <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50 p-5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">Recipient</span>

          <span className="font-medium text-ink">{result.recipientName}</span>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm text-slate-500">Amount</span>

          <span className="font-semibold text-ink">
            {currency.format(result.amount)}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm text-slate-500">
            Remaining Wallet Balance
          </span>

          <span className="font-semibold text-azure">
            {result.remainingBalance != null
              ? currency.format(result.remainingBalance)
              : "--"}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm text-slate-500">Transaction Status</span>

          <span className={copy.tone}>{copy.title}</span>
        </div>
      </div>

      <div className="mt-8 flex justify-center gap-3">
        <Button variant="secondary" onClick={onSendAnother}>
          Send Another
        </Button>

        <Button variant="secondary" onClick={() => downloadReceipt(result)}>
          Download Receipt
        </Button>

        <Button onClick={onViewHistory}>View History</Button>
      </div>
    </div>
  );
}
