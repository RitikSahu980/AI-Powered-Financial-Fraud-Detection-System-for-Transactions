import { forwardRef, useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

/**
 * Reusable form input. Handles its own password-visibility toggle when
 * type="password", and renders an inline error message + red ring when
 * `error` is passed - the shared building block for every form's
 * validation feedback across the app (not re-implemented per page).
 */
const Input = forwardRef(function Input(
  { label, error, hint, icon: Icon, type = 'text', className = '', ...props },
  ref
) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const resolvedType = isPassword && showPassword ? 'text' : type;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={props.id} className="mb-1.5 block text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        )}
        <input
          ref={ref}
          type={resolvedType}
          aria-invalid={!!error}
          aria-describedby={error ? `${props.id}-error` : undefined}
          className={`h-11 w-full rounded-xl border bg-white text-sm text-ink placeholder:text-slate-400
            transition-colors duration-150 focus:outline-none
            ${Icon ? 'pl-10' : 'pl-3.5'} ${isPassword ? 'pr-10' : 'pr-3.5'}
            ${error
              ? 'border-risk-high focus:border-risk-high focus:ring-2 focus:ring-risk-high/15'
              : 'border-slate-200 focus:border-azure focus:ring-2 focus:ring-azure/15'
            }`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
          >
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        )}
      </div>
      {error ? (
        <p id={`${props.id}-error`} className="mt-1.5 flex items-center gap-1 text-xs font-medium text-risk-high">
          <AlertCircle size={13} />
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-slate-400">{hint}</p>
      ) : null}
    </div>
  );
});

export default Input;
