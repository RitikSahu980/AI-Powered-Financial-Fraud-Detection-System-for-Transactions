import { useEffect, useState } from 'react';
import { Hash, DollarSign, User, Users } from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import {
  validateStep,
  validatePositiveAmount,
  validatePositiveOrZeroAmount,
  validateRequired,
} from '../../utils/validators';

const TRANSACTION_TYPES = ['PAYMENT', 'TRANSFER', 'CASH_OUT', 'DEBIT', 'CASH_IN'];

const INITIAL_FORM = {
  step: '1',
  type: 'TRANSFER',
  amount: '',
  nameOrig: '',
  oldbalanceOrg: '',
  newbalanceOrig: '',
  nameDest: '',
  oldbalanceDest: '',
  newbalanceDest: '',
};

/**
 * Fields map 1:1 onto CreateTransactionRequest - no extra or renamed
 * fields, since that's exactly what POST /api/v1/transactions expects.
 * Validates client-side using the same constraints the backend enforces
 * (@Min(1), @Positive, @PositiveOrZero, @NotBlank) so obviously-invalid
 * input is caught before a round trip - not a substitute for the
 * backend's own validation, which still runs and whose messages still
 * surface if something slips through.
 */
export default function TransactionForm({ onSubmit, isSubmitting, serverErrors }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});

  // Backend field-level validation errors (400 responses) surface here
  // too, not just client-side checks - keyed by the same CreateTransactionRequest field names.
  useEffect(() => {
    if (serverErrors && Object.keys(serverErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...serverErrors }));
    }
  }, [serverErrors]);

  function handleChange(field) {
    return (e) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
    };
  }

  function validate() {
    const next = {
      step: validateStep(form.step),
      amount: validatePositiveAmount(form.amount, 'Amount'),
      nameOrig: validateRequired(form.nameOrig, 'Sender name'),
      oldbalanceOrg: validatePositiveOrZeroAmount(form.oldbalanceOrg, 'Sender old balance'),
      newbalanceOrig: validatePositiveOrZeroAmount(form.newbalanceOrig, 'Sender new balance'),
      nameDest: validateRequired(form.nameDest, 'Receiver name'),
      oldbalanceDest: validatePositiveOrZeroAmount(form.oldbalanceDest, 'Receiver old balance'),
      newbalanceDest: validatePositiveOrZeroAmount(form.newbalanceDest, 'Receiver new balance'),
    };
    setErrors(next);
    return !Object.values(next).some(Boolean);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      step: Number(form.step),
      type: form.type,
      amount: Number(form.amount),
      nameOrig: form.nameOrig.trim(),
      oldbalanceOrg: Number(form.oldbalanceOrg),
      newbalanceOrig: Number(form.newbalanceOrig),
      nameDest: form.nameDest.trim(),
      oldbalanceDest: Number(form.oldbalanceDest),
      newbalanceDest: Number(form.newbalanceDest),
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <Input
          id="step"
          label="Step"
          type="number"
          min={1}
          icon={Hash}
          hint="Simulated time unit (1 step ≈ 1 hour)"
          value={form.step}
          onChange={handleChange('step')}
          error={errors.step}
          disabled={isSubmitting}
        />
        <div>
          <label htmlFor="type" className="mb-1.5 block text-sm font-medium text-ink">
            Transaction Type
          </label>
          <select
            id="type"
            value={form.type}
            onChange={handleChange('type')}
            disabled={isSubmitting}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-ink transition-colors focus:border-azure focus:outline-none focus:ring-2 focus:ring-azure/15 disabled:opacity-60"
          >
            {TRANSACTION_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Input
        id="amount"
        label="Amount"
        type="number"
        step="0.01"
        min={0}
        icon={DollarSign}
        placeholder="0.00"
        value={form.amount}
        onChange={handleChange('amount')}
        error={errors.amount}
        disabled={isSubmitting}
      />

      <div className="border-t border-slate-100 pt-5">
        <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
          <User size={13} /> Sender
        </p>
        <div className="space-y-4">
          <Input
            id="nameOrig"
            label="Sender Name"
            placeholder="C123456789"
            value={form.nameOrig}
            onChange={handleChange('nameOrig')}
            error={errors.nameOrig}
            disabled={isSubmitting}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              id="oldbalanceOrg"
              label="Sender Old Balance"
              type="number"
              step="0.01"
              min={0}
              value={form.oldbalanceOrg}
              onChange={handleChange('oldbalanceOrg')}
              error={errors.oldbalanceOrg}
              disabled={isSubmitting}
            />
            <Input
              id="newbalanceOrig"
              label="Sender New Balance"
              type="number"
              step="0.01"
              min={0}
              value={form.newbalanceOrig}
              onChange={handleChange('newbalanceOrig')}
              error={errors.newbalanceOrig}
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 pt-5">
        <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
          <Users size={13} /> Receiver
        </p>
        <div className="space-y-4">
          <Input
            id="nameDest"
            label="Receiver Name"
            placeholder="C987654321"
            value={form.nameDest}
            onChange={handleChange('nameDest')}
            error={errors.nameDest}
            disabled={isSubmitting}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              id="oldbalanceDest"
              label="Receiver Old Balance"
              type="number"
              step="0.01"
              min={0}
              value={form.oldbalanceDest}
              onChange={handleChange('oldbalanceDest')}
              error={errors.oldbalanceDest}
              disabled={isSubmitting}
            />
            <Input
              id="newbalanceDest"
              label="Receiver New Balance"
              type="number"
              step="0.01"
              min={0}
              value={form.newbalanceDest}
              onChange={handleChange('newbalanceDest')}
              error={errors.newbalanceDest}
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full" isLoading={isSubmitting}>
        Analyze Transaction
      </Button>
    </form>
  );
}
