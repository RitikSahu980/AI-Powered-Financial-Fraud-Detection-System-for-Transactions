import { useEffect, useState } from 'react';
import { useAnimatedNumber } from '../../hooks/useAnimatedNumber';

const TONE_COLORS = { LOW: '#16A34A', MEDIUM: '#D97706', HIGH: '#DC2626' };
const SIZE = 148;
const STROKE = 12;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * Circular gauge for PredictionResponse.confidence (0-1), colored by
 * riskLevel. Animates in on mount/change rather than snapping straight to
 * the final value.
 */
export default function ConfidenceGauge({ confidence, riskLevel }) {
  const color = TONE_COLORS[riskLevel] ?? '#5B6B85';
  const [target, setTarget] = useState(0);
  const animatedConfidence = useAnimatedNumber(target, 900);

  useEffect(() => {
    // defer to the next tick so the ring visibly animates from 0 rather
    // than rendering already-filled on first paint
    const id = requestAnimationFrame(() => setTarget(confidence ?? 0));
    return () => cancelAnimationFrame(id);
  }, [confidence]);

  const offset = CIRCUMFERENCE * (1 - animatedConfidence);

  return (
    <div className="relative" style={{ width: SIZE, height: SIZE }}>
      <svg width={SIZE} height={SIZE} className="-rotate-90">
        <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} stroke="#EAEEF4" strokeWidth={STROKE} fill="none" />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke={color}
          strokeWidth={STROKE}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 120ms linear' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-2xl font-semibold tabular-nums text-ink">
          {(animatedConfidence * 100).toFixed(1)}%
        </span>
        <span className="text-xs text-slate-400">confidence</span>
      </div>
    </div>
  );
}
