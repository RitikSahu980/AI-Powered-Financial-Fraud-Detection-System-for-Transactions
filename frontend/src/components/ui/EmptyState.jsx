import { Inbox } from 'lucide-react';
import Button from './Button';

/** Generic "nothing here yet" placeholder, with an optional call to action. */
export default function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-azure-50">
        <Icon size={26} className="text-azure" />
      </div>
      <p className="mt-4 text-sm font-semibold text-ink">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-slate-400">{description}</p>}
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-5 w-auto px-6">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
