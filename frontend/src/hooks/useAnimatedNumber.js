import { useEffect, useRef, useState } from 'react';

/**
 * Animates a number counting from 0 up to `target` over `duration` ms,
 * using requestAnimationFrame - not a library, since this is the only
 * place in the app that needs it. Re-runs whenever `target` changes, so a
 * fresh prediction result re-triggers the animation.
 */
export function useAnimatedNumber(target, duration = 900) {
  const [value, setValue] = useState(0);
  const frameRef = useRef();

  useEffect(() => {
    const start = performance.now();
    const from = 0;
    const to = typeof target === 'number' ? target : 0;

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(from + (to - from) * eased);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    }

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);

  return value;
}
