const CURRENCY = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
});
const DATETIME = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "medium",
});

function Field({ label, value, mono = false }) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p
        className={`mt-0.5 text-sm font-medium text-ink ${mono ? "font-mono" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}

/** Transaction Information + Account Information sections of the details page - straight from TransactionResponse. */
export default function TransactionSummaryCard({ transaction }) {
  const t = transaction;
  return (
    <div className="rounded-2xl border border-slate-100 bg-surface p-6 shadow-card">
      <p className="text-sm font-semibold text-ink">Transaction Information</p>
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Field label="Transaction ID" value={t.transactionId} mono />
        <Field label="Type" value={t.type} />
        <Field label="Amount" value={CURRENCY.format(t.amount)} />
        <Field label="Step" value={t.step} />
        <Field label="Created" value={DATETIME.format(new Date(t.createdAt))} />
        <Field label="Submitted by" value={t.userId} mono />
      </div>

      <p className="mt-6 border-t border-slate-100 pt-5 text-sm font-semibold text-ink">
        Account Information
      </p>
      <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Sender
          </p>
          <div className="space-y-3">
            <Field label="Account" value={t.nameOrig} mono />
            <Field
              label="Balance Before"
              value={CURRENCY.format(t.oldbalanceOrg)}
            />
            <Field
              label="Balance After"
              value={CURRENCY.format(t.newbalanceOrig)}
            />
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Receiver
          </p>
          <div className="space-y-3">
            <Field label="Account" value={t.nameDest} mono />
            <Field
              label="Balance Before"
              value={CURRENCY.format(t.oldbalanceDest)}
            />
            <Field
              label="Balance After"
              value={CURRENCY.format(t.newbalanceDest)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
