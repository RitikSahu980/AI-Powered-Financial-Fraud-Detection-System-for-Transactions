import { Loader2 } from 'lucide-react';

/**
 * Full-card overlay shown while a request is in flight - dims and blurs
 * whatever's beneath it rather than replacing it, so layout doesn't jump.
 */
export default function LoadingOverlay({ label = 'Analyzing transaction…' }) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-2xl bg-white/70 backdrop-blur-sm">
      <Loader2 size={28} className="animate-spin text-azure" />
      <p className="text-sm font-medium text-slate-500">{label}</p>
    </div>
  );
}
