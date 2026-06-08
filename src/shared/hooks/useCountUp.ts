import { useState, useEffect } from 'react';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Hook for counting up numbers with cleanup - reduced duration for less aggressive animation
export const useCountUp = (end: number, duration = 800) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (duration <= 0 || prefersReducedMotion()) {
      setCount(end);
      return;
    }

    let startTime: number | null = null;
    let animationFrameId: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      // Ease out cubic - smoother than quart
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(ease * end));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [end, duration]);

  return count;
};
