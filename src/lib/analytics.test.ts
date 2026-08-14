import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { withVisibilityStateGuard, reportWebVitals } from './analytics';
import { onCLS, onINP, onFCP, onLCP, onTTFB } from 'web-vitals';
import * as sentry from './sentry';
import { env } from './env';

vi.mock('web-vitals', () => ({
  onCLS: vi.fn(),
  onINP: vi.fn(),
  onFCP: vi.fn(),
  onLCP: vi.fn(),
  onTTFB: vi.fn(),
}));

describe('withVisibilityStateGuard', () => {
  let originalGetEntriesByType: typeof performance.getEntriesByType;
  let originalSupportedEntryTypes: typeof PerformanceObserver.supportedEntryTypes;

  beforeEach(() => {
    originalGetEntriesByType = performance.getEntriesByType;
    originalSupportedEntryTypes = PerformanceObserver.supportedEntryTypes;
  });

  afterEach(() => {
    Object.defineProperty(performance, 'getEntriesByType', {
      value: originalGetEntriesByType,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(PerformanceObserver, 'supportedEntryTypes', {
      value: originalSupportedEntryTypes,
      configurable: true,
      writable: true,
    });
    vi.restoreAllMocks();
  });

  it('returns empty array for visibility-state when unsupported and restores original method after callback', () => {
    Object.defineProperty(PerformanceObserver, 'supportedEntryTypes', {
      value: ['paint', 'navigation', 'mark'],
      configurable: true,
      writable: true,
    });

    const mockOriginal = vi.fn().mockReturnValue([{ name: 'hidden', startTime: 100 }]);
    performance.getEntriesByType = mockOriginal;

    let visibilityResult: unknown;
    let otherResult: unknown;

    withVisibilityStateGuard(() => {
      visibilityResult = performance.getEntriesByType('visibility-state');
      otherResult = performance.getEntriesByType('navigation');
    });

    // During guard: visibility-state returns [] without calling original
    expect(visibilityResult).toEqual([]);
    expect(mockOriginal).not.toHaveBeenCalledWith('visibility-state');

    // Other entry types pass through to original
    expect(mockOriginal).toHaveBeenCalledWith('navigation');
    expect(otherResult).toEqual([{ name: 'hidden', startTime: 100 }]);

    // Immediately after callback: original method is restored
    expect(performance.getEntriesByType).toBe(mockOriginal);
    const postCallResult = performance.getEntriesByType('visibility-state');
    expect(postCallResult).toEqual([{ name: 'hidden', startTime: 100 }]);
    expect(mockOriginal).toHaveBeenCalledWith('visibility-state');
  });

  it('restores the original method even if callback throws', () => {
    Object.defineProperty(PerformanceObserver, 'supportedEntryTypes', {
      value: ['paint'],
      configurable: true,
      writable: true,
    });

    const mockOriginal = vi.fn();
    performance.getEntriesByType = mockOriginal;

    expect(() => {
      withVisibilityStateGuard(() => {
        throw new Error('boom');
      });
    }).toThrow('boom');

    expect(performance.getEntriesByType).toBe(mockOriginal);
  });

  it('does not intercept visibility-state when supported by PerformanceObserver', () => {
    Object.defineProperty(PerformanceObserver, 'supportedEntryTypes', {
      value: ['visibility-state', 'paint'],
      configurable: true,
      writable: true,
    });

    const mockOriginal = vi.fn().mockReturnValue([{ name: 'hidden', startTime: 50 }]);
    performance.getEntriesByType = mockOriginal;

    let result: unknown;
    withVisibilityStateGuard(() => {
      result = performance.getEntriesByType('visibility-state');
    });

    expect(mockOriginal).toHaveBeenCalledWith('visibility-state');
    expect(result).toEqual([{ name: 'hidden', startTime: 50 }]);
  });

  it('handles non-writable performance.getEntriesByType gracefully without throwing', () => {
    Object.defineProperty(PerformanceObserver, 'supportedEntryTypes', {
      value: ['paint'],
      configurable: true,
      writable: true,
    });

    const dummyMethod = vi.fn().mockReturnValue([]);
    Object.defineProperty(performance, 'getEntriesByType', {
      value: dummyMethod,
      writable: false,
      configurable: true,
    });

    let executed = false;
    expect(() => {
      withVisibilityStateGuard(() => {
        executed = true;
      });
    }).not.toThrow();

    expect(executed).toBe(true);
  });

  it('handles environment when PerformanceObserver supportedEntryTypes is missing or not an array', () => {
    Object.defineProperty(PerformanceObserver, 'supportedEntryTypes', {
      value: undefined,
      configurable: true,
      writable: true,
    });

    const mockOriginal = vi.fn().mockReturnValue([{ name: 'hidden', startTime: 20 }]);
    performance.getEntriesByType = mockOriginal;

    let visibilityResult: unknown;
    withVisibilityStateGuard(() => {
      visibilityResult = performance.getEntriesByType('visibility-state');
    });

    expect(visibilityResult).toEqual([]);
    expect(mockOriginal).not.toHaveBeenCalledWith('visibility-state');
    expect(performance.getEntriesByType).toBe(mockOriginal);
  });
});

describe('reportWebVitals', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('skips reporting when VITE_ENVIRONMENT is test', () => {
    const originalEnv = env.VITE_ENVIRONMENT;
    (env as { VITE_ENVIRONMENT: string }).VITE_ENVIRONMENT = 'test';

    try {
      reportWebVitals();

      expect(onCLS).not.toHaveBeenCalled();
      expect(onINP).not.toHaveBeenCalled();
      expect(onFCP).not.toHaveBeenCalled();
      expect(onLCP).not.toHaveBeenCalled();
      expect(onTTFB).not.toHaveBeenCalled();
    } finally {
      (env as { VITE_ENVIRONMENT: string }).VITE_ENVIRONMENT = originalEnv;
    }
  });

  it('registers all web-vitals and forwards payloads to Sentry when not in test env', () => {
    const captureMessageSpy = vi.spyOn(sentry, 'captureMessage').mockResolvedValue();

    const originalEnv = env.VITE_ENVIRONMENT;
    (env as { VITE_ENVIRONMENT: string }).VITE_ENVIRONMENT = 'production';

    const listeners: Record<string, (metric: { value: number }) => void> = {};
    vi.mocked(onCLS).mockImplementation(((cb: any) => {
      listeners['CLS'] = cb;
    }) as any);
    vi.mocked(onINP).mockImplementation(((cb: any) => {
      listeners['INP'] = cb;
    }) as any);
    vi.mocked(onFCP).mockImplementation(((cb: any) => {
      listeners['FCP'] = cb;
    }) as any);
    vi.mocked(onLCP).mockImplementation(((cb: any) => {
      listeners['LCP'] = cb;
    }) as any);
    vi.mocked(onTTFB).mockImplementation(((cb: any) => {
      listeners['TTFB'] = cb;
    }) as any);

    try {
      reportWebVitals();

      expect(listeners['CLS']).toBeDefined();
      expect(listeners['INP']).toBeDefined();
      expect(listeners['FCP']).toBeDefined();
      expect(listeners['LCP']).toBeDefined();
      expect(listeners['TTFB']).toBeDefined();

      listeners['CLS']({ value: 0.05 });
      expect(captureMessageSpy).toHaveBeenCalledWith('Web Vitals: CLS', {
        level: 'info',
        extra: { value: 0.05, unit: 'ms' },
      });

      listeners['INP']({ value: 45 });
      expect(captureMessageSpy).toHaveBeenCalledWith('Web Vitals: INP', {
        level: 'info',
        extra: { value: 45, unit: 'ms' },
      });

      listeners['FCP']({ value: 1200 });
      expect(captureMessageSpy).toHaveBeenCalledWith('Web Vitals: FCP', {
        level: 'info',
        extra: { value: 1200, unit: 'ms' },
      });

      listeners['LCP']({ value: 2100 });
      expect(captureMessageSpy).toHaveBeenCalledWith('Web Vitals: LCP', {
        level: 'info',
        extra: { value: 2100, unit: 'ms' },
      });

      listeners['TTFB']({ value: 300 });
      expect(captureMessageSpy).toHaveBeenCalledWith('Web Vitals: TTFB', {
        level: 'info',
        extra: { value: 300, unit: 'ms' },
      });
    } finally {
      (env as { VITE_ENVIRONMENT: string }).VITE_ENVIRONMENT = originalEnv;
    }
  });
});
