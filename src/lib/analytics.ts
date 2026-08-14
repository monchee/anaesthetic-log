import { onCLS, onINP, onFCP, onLCP, onTTFB } from 'web-vitals';
import { captureMessage } from './sentry';
import { env } from './env';

/**
 * Runs a callback with a temporary guard on `performance.getEntriesByType`
 * for the unsupported 'visibility-state' entry type.
 *
 * In Chromium, calling `performance.getEntriesByType('visibility-state')` emits
 * "Deprecated API for given entry type." when 'visibility-state' is not in
 * `PerformanceObserver.supportedEntryTypes`. web-vitals queries this during observer
 * registration and falls back to `document.visibilityState` if an empty list is returned.
 *
 * This scoped guard intercepts only 'visibility-state' during observer registration and
 * immediately restores the original performance method in a finally block.
 */
export function withVisibilityStateGuard<T>(callback: () => T): T {
  const perf = typeof performance !== 'undefined' ? performance : undefined;
  if (!perf || typeof perf.getEntriesByType !== 'function') {
    return callback();
  }

  const supportsVisibilityState =
    typeof PerformanceObserver !== 'undefined' &&
    Array.isArray(PerformanceObserver.supportedEntryTypes) &&
    PerformanceObserver.supportedEntryTypes.includes('visibility-state');

  if (supportsVisibilityState) {
    return callback();
  }

  const originalGetEntriesByType = perf.getEntriesByType;
  let restored = false;

  const restore = () => {
    if (restored) return;
    restored = true;
    try {
      perf.getEntriesByType = originalGetEntriesByType;
    } catch {
      // Non-writable or non-configurable property handling
    }
  };

  try {
    perf.getEntriesByType = function (this: unknown, type: string, ...rest: unknown[]) {
      if (type === 'visibility-state') {
        return [];
      }
      return originalGetEntriesByType.apply(this ?? perf, [type, ...rest] as [string]);
    };
  } catch {
    // Non-writable property handling
  }

  try {
    return callback();
  } finally {
    restore();
  }
}

export function reportWebVitals() {
  if (env.VITE_ENVIRONMENT === 'test') return;

  const sendToSentry = (name: string, value: number) => {
    void captureMessage(`Web Vitals: ${name}`, {
      level: 'info',
      extra: {
        value,
        unit: 'ms',
      },
    });
  };

  withVisibilityStateGuard(() => {
    onCLS((metric) => sendToSentry('CLS', metric.value));
    onINP((metric) => sendToSentry('INP', metric.value));
    onFCP((metric) => sendToSentry('FCP', metric.value));
    onLCP((metric) => sendToSentry('LCP', metric.value));
    onTTFB((metric) => sendToSentry('TTFB', metric.value));
  });
}
