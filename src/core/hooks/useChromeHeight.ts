import { useEffect, useRef } from 'react';

/**
 * Hook to measure the height of the sticky chrome container and set it
 * as a CSS custom property `--app-chrome-height` on document.documentElement.
 * This powers anchor offsets and scroll margins across the app.
 */
export function useChromeHeight<T extends HTMLElement = HTMLElement>() {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const updateHeight = () => {
      const height = element.getBoundingClientRect().height || element.offsetHeight || 0;
      document.documentElement.style.setProperty('--app-chrome-height', `${height}px`);
    };

    // One-shot initial measurement on mount
    updateHeight();

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        updateHeight();
      });
      resizeObserver.observe(element);
    }

    const handleResize = () => {
      updateHeight();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      window.removeEventListener('resize', handleResize);
      document.documentElement.style.removeProperty('--app-chrome-height');
    };
  }, []);

  return ref;
}
