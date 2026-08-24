import { Loader2 } from 'lucide-react';

const VARIANT_CLASSES = {
  primary:
    'bg-azure text-white shadow-glow hover:bg-azure-dim focus-visible:outline-azure disabled:bg-azure/50',
  secondary:
    'bg-white text-ink border border-slate-200 hover:bg-slate-50 disabled:opacity-50',
  ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 disabled:opacity-50',
  danger: 'bg-risk-high text-white hover:bg-red-700 disabled:bg-risk-high/50',
};

const SIZE_CLASSES = {
  sm: 'h-9 px-3.5 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-base',
};

/**
 * Reusable button. `isLoading` swaps in a spinner and disables the button
 * without shifting its width (label stays in the DOM, just visually hidden).
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  type = 'button',
  icon: Icon,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`relative inline-flex items-center justify-center gap-2 rounded-xl font-medium
        transition-all duration-150 ease-out active:scale-[0.98]
        disabled:cursor-not-allowed disabled:active:scale-100
        ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
      {...props}
    >
      {isLoading && <Loader2 size={16} className="animate-spin" />}
      {!isLoading && Icon && <Icon size={16} />}
      {children}
    </button>
  );
}
