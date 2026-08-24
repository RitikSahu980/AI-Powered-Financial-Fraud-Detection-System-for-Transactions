import { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const VARIANTS = {
  success: { icon: CheckCircle2, classes: 'bg-white border-risk-low/30 text-ink', iconClass: 'text-risk-low' },
  error: { icon: XCircle, classes: 'bg-white border-risk-high/30 text-ink', iconClass: 'text-risk-high' },
  warning: { icon: AlertTriangle, classes: 'bg-white border-risk-medium/30 text-ink', iconClass: 'text-risk-medium' },
  info: { icon: Info, classes: 'bg-white border-azure/30 text-ink', iconClass: 'text-azure' },
};

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (message, variant = 'info', duration = 4500) => {
      const id = ++idCounter;
      setToasts((current) => [...current, { id, message, variant }]);
      if (duration > 0) {
        setTimeout(() => dismiss(id), duration);
      }
      return id;
    },
    [dismiss]
  );

  const toast = useCallback(
    (message, options) => push(message, options?.variant, options?.duration),
    [push]
  );
  toast.success = (message, duration) => push(message, 'success', duration);
  toast.error = (message, duration) => push(message, 'error', duration);
  toast.warning = (message, duration) => push(message, 'warning', duration);
  toast.info = (message, duration) => push(message, 'info', duration);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        className="fixed bottom-5 right-5 z-[100] flex w-full max-w-sm flex-col gap-2.5"
        role="region"
        aria-label="Notifications"
      >
        {toasts.map(({ id, message, variant }) => {
          const config = VARIANTS[variant] ?? VARIANTS.info;
          const Icon = config.icon;
          return (
            <div
              key={id}
              role="status"
              className={`animate-fade-in-up flex items-start gap-3 rounded-xl border ${config.classes} px-4 py-3 shadow-card-hover`}
            >
              <Icon size={19} className={`mt-0.5 shrink-0 ${config.iconClass}`} />
              <p className="flex-1 text-sm leading-snug text-ink">{message}</p>
              <button
                onClick={() => dismiss(id)}
                aria-label="Dismiss notification"
                className="shrink-0 text-slate-400 transition hover:text-ink"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
