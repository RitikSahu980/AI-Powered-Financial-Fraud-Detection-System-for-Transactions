import { ShieldCheck } from 'lucide-react';
import SignalNetwork from '../components/ui/SignalNetwork';

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="flex min-h-screen w-full">
      {/* Left panel: signature moment. Hidden below lg to keep mobile focused on the form. */}
      <div className="relative hidden w-[45%] flex-col justify-between overflow-hidden bg-navy-deep p-12 lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-40
            bg-[radial-gradient(circle_at_20%_20%,rgba(47,111,237,0.25),transparent_40%),radial-gradient(circle_at_80%_70%,rgba(91,141,255,0.15),transparent_45%)]"
        />

        <div className="relative z-10 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-azure/20">
            <ShieldCheck size={19} className="text-azure-bright" />
          </div>
          <span className="font-display text-lg font-semibold text-white">Sentinel</span>
        </div>

        <div className="relative z-10 flex flex-1 items-center justify-center">
          <SignalNetwork />
        </div>

        <div className="relative z-10 max-w-sm">
          <p className="font-display text-2xl font-medium leading-snug text-white">
            Real-time fraud detection, powered by machine learning.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            Every transaction is scored the moment it happens &mdash; risk level, confidence,
            and an audit trail your analysts can act on.
          </p>
        </div>
      </div>

      {/* Right panel: the form. */}
      <div className="flex w-full flex-col items-center justify-center bg-canvas px-6 py-12 lg:w-[55%]">
        <div className="mb-8 flex items-center gap-2.5 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-azure/10">
            <ShieldCheck size={19} className="text-azure" />
          </div>
          <span className="font-display text-lg font-semibold text-ink">Sentinel</span>
        </div>

        <div className="w-full max-w-sm">
          <div className="glass rounded-2xl border-white/60 bg-white/90 p-8 shadow-card">
            <h1 className="font-display text-2xl font-semibold text-ink">{title}</h1>
            {subtitle && <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p>}
            <div className="mt-7">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
