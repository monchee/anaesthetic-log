import { act, render, renderHook, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FontSizeProvider, useFontSize } from './FontSizeProvider';

describe('FontSizeProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.style.fontSize = '';
    vi.restoreAllMocks();
  });

  it('provides default font size of 100% when storage is empty', () => {
    const { result } = renderHook(() => useFontSize(), {
      wrapper: FontSizeProvider,
    });

    expect(result.current.fontSizePercent).toBe(100);
    expect(document.documentElement.style.fontSize).toBe('100%');
    expect(localStorage.getItem('app-font-size-pct')).toBe('100');
  });

  it('restores valid saved font size from localStorage within sane range', () => {
    localStorage.setItem('app-font-size-pct', '115');

    const { result } = renderHook(() => useFontSize(), {
      wrapper: FontSizeProvider,
    });

    expect(result.current.fontSizePercent).toBe(115);
    expect(document.documentElement.style.fontSize).toBe('115%');
  });

  it.each([
    ['non-numeric string', 'corrupt-value'],
    ['NaN string', 'NaN'],
    ['below minimum size', '50'],
    ['above maximum size', '200'],
    ['negative number', '-100'],
  ])('falls back to 100% default when stored value is %s (%s)', (_label, storedValue) => {
    localStorage.setItem('app-font-size-pct', storedValue);

    const { result } = renderHook(() => useFontSize(), {
      wrapper: FontSizeProvider,
    });

    expect(result.current.fontSizePercent).toBe(100);
    expect(document.documentElement.style.fontSize).toBe('100%');
  });

  it('gracefully degrades to 100% default when localStorage.getItem throws (e.g. Safari private mode)', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('The operation is insecure.', 'SecurityError');
    });

    const { result } = renderHook(() => useFontSize(), {
      wrapper: FontSizeProvider,
    });

    expect(result.current.fontSizePercent).toBe(100);
    expect(document.documentElement.style.fontSize).toBe('100%');
  });

  it('gracefully degrades when localStorage.setItem throws (e.g. quota exceeded or storage blocked)', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Quota exceeded', 'QuotaExceededError');
    });

    const { result } = renderHook(() => useFontSize(), {
      wrapper: FontSizeProvider,
    });

    expect(() => {
      act(() => {
        result.current.increaseFontSize();
      });
    }).not.toThrow();

    expect(result.current.fontSizePercent).toBe(105);
    expect(document.documentElement.style.fontSize).toBe('105%');
  });

  it('increases, decreases, and resets font size within [85, 125] limits', () => {
    const { result } = renderHook(() => useFontSize(), {
      wrapper: FontSizeProvider,
    });

    expect(result.current.canIncrease).toBe(true);
    expect(result.current.canDecrease).toBe(true);

    act(() => result.current.increaseFontSize());
    expect(result.current.fontSizePercent).toBe(105);

    // Increase up to max (125)
    act(() => {
      result.current.increaseFontSize();
      result.current.increaseFontSize();
      result.current.increaseFontSize();
      result.current.increaseFontSize();
      result.current.increaseFontSize();
    });
    expect(result.current.fontSizePercent).toBe(125);
    expect(result.current.canIncrease).toBe(false);

    // Reset
    act(() => result.current.resetFontSize());
    expect(result.current.fontSizePercent).toBe(100);

    // Decrease down to min (85)
    act(() => {
      result.current.decreaseFontSize();
      result.current.decreaseFontSize();
      result.current.decreaseFontSize();
      result.current.decreaseFontSize();
    });
    expect(result.current.fontSizePercent).toBe(85);
    expect(result.current.canDecrease).toBe(false);
  });

  it('throws when useFontSize is called outside of FontSizeProvider', () => {
    expect(() => renderHook(() => useFontSize())).toThrow(
      'useFontSize must be used within a FontSizeProvider'
    );
  });

  it('renders child components correctly', () => {
    render(
      <FontSizeProvider>
        <div data-testid="child-element">Test Child</div>
      </FontSizeProvider>
    );

    expect(screen.getByTestId('child-element')).toBeInTheDocument();
    expect(screen.getByTestId('child-element')).toHaveTextContent('Test Child');
  });
});
