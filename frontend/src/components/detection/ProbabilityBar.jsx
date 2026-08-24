import { useEffect, useState } from 'react';
import { useAnimatedNumber } from '../../hooks/useAnimatedNumber';

const RISK_BAR_COLOR = { HIGH: 'bg-risk-high', MEDIUM: 'bg-risk-medium', LOW: 'bg-risk-low' };

/** Animated 0-1 probability bar, colored by riskLevel. Shared by the Detection and Transactions modules. */
export default function ProbabilityBar({ probability, riskLevel }) {
  const [target, setTarget] = useState(0);
  const animated = useAnimatedNumber(target, 900);

  useEffect(() => {
    const id = requestAnimationFrame(() => setTarget(probability ?? 0));
    return () => cancelAnimationFrame(id);
  }, [probability]);

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="font-medium text-slate-500">Fraud probability</span>
        <span className="font-mono font-semibold text-ink">{(animated * 100).toFixed(2)}%</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${RISK_BAR_COLOR[riskLevel] ?? 'bg-azure'}`}
          style={{ width: `${Math.min(animated * 100, 100)}%`, transition: 'width 120ms linear' }}
        />
      </div>
    </div>
  );
}
