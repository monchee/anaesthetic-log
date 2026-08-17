import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useChromeHeight } from './useChromeHeight';

function createMockElement(height: number = 64): HTMLDivElement {
  const element = document.createElement('div');
  vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({
    width: 800,
    height,
    top: 0,
    left: 0,
    bottom: height,
    right: 800,
    x: 0,
    y: 0,
    toJSON: () => {},
  });
  return element;
}

describe('useChromeHeight', () => {
  beforeEach(() => {
    document.documentElement.style.removeProperty('--app-chrome-height');
  });

  afterEach(() => {
    document.documentElement.style.removeProperty('--app-chrome-height');
    vi.restoreAllMocks();
  });

  it('sets --app-chrome-height on mount', () => {
    const el = createMockElement(72);
    renderHook(() => {
      const ref = useChromeHeight<HTMLDivElement>();
      ref.current = el;
      return ref;
    });

    expect(document.documentElement.style.getPropertyValue('--app-chrome-height')).toBe('72px');
  });

  it('removes --app-chrome-height on unmount', () => {
    const el = createMockElement(72);
    const { unmount } = renderHook(() => {
      const ref = useChromeHeight<HTMLDivElement>();
      ref.current = el;
      return ref;
    });

    expect(document.documentElement.style.getPropertyValue('--app-chrome-height')).toBe('72px');

    unmount();
    expect(document.documentElement.style.getPropertyValue('--app-chrome-height')).toBe('');
  });

  it('handles environment when ResizeObserver is undefined without crashing', () => {
    vi.stubGlobal('ResizeObserver', undefined);

    try {
      const el = createMockElement(56);
      const { unmount } = renderHook(() => {
        const ref = useChromeHeight<HTMLDivElement>();
        ref.current = el;
        return ref;
      });

      expect(document.documentElement.style.getPropertyValue('--app-chrome-height')).toBe('56px');

      unmount();
      expect(document.documentElement.style.getPropertyValue('--app-chrome-height')).toBe('');
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('updates height when ResizeObserver triggers or window resizes', () => {
    let observerCallback: (entries: ResizeObserverEntry[]) => void = () => {};
    const observeMock = vi.fn();
    const disconnectMock = vi.fn();

    class MockResizeObserver {
      constructor(callback: (entries: ResizeObserverEntry[]) => void) {
        observerCallback = callback;
      }
      observe = observeMock;
      unobserve = vi.fn();
      disconnect = disconnectMock;
    }

    const originalResizeObserver = global.ResizeObserver;
    global.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;

    try {
      const el = createMockElement(60);
      const { unmount } = renderHook(() => {
        const ref = useChromeHeight<HTMLDivElement>();
        ref.current = el;
        return ref;
      });

      expect(observeMock).toHaveBeenCalledWith(el);
      expect(document.documentElement.style.getPropertyValue('--app-chrome-height')).toBe('60px');

      // Change height and trigger ResizeObserver
      vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
        width: 800,
        height: 84,
        top: 0,
        left: 0,
        bottom: 84,
        right: 800,
        x: 0,
        y: 0,
        toJSON: () => {},
      });

      observerCallback([]);
      expect(document.documentElement.style.getPropertyValue('--app-chrome-height')).toBe('84px');

      // Window resize fallback
      vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
        width: 800,
        height: 96,
        top: 0,
        left: 0,
        bottom: 96,
        right: 800,
        x: 0,
        y: 0,
        toJSON: () => {},
      });

      window.dispatchEvent(new Event('resize'));
      expect(document.documentElement.style.getPropertyValue('--app-chrome-height')).toBe('96px');

      unmount();
      expect(disconnectMock).toHaveBeenCalled();
      expect(document.documentElement.style.getPropertyValue('--app-chrome-height')).toBe('');
    } finally {
      global.ResizeObserver = originalResizeObserver;
    }
  });
});
