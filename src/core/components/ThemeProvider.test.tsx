import { act, render, renderHook, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider, useTheme } from './ThemeProvider';
import { APP_CONFIG } from '@shared/utils/constants';

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
    document.documentElement.style.colorScheme = '';
    document.head.innerHTML = '<meta name="theme-color" content="#002664" />';
    vi.restoreAllMocks();
  });

  it('provides default light theme when storage is empty', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    expect(result.current.theme).toBe('light');
    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect(document.documentElement.style.colorScheme).toBe('light');
  });

  it('restores valid dark theme from localStorage', () => {
    localStorage.setItem(APP_CONFIG.LOCAL_STORAGE_KEYS.THEME, 'dark');

    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    expect(result.current.theme).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.style.colorScheme).toBe('dark');
  });

  it('falls back to default theme when stored value is invalid', () => {
    localStorage.setItem(APP_CONFIG.LOCAL_STORAGE_KEYS.THEME, 'invalid-theme');

    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    expect(result.current.theme).toBe('light');
  });

  it('gracefully degrades to defaultTheme when localStorage.getItem throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('The operation is insecure.', 'SecurityError');
    });

    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    expect(result.current.theme).toBe('light');
  });

  it('toggles theme and updates document attributes and storage', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem(APP_CONFIG.LOCAL_STORAGE_KEYS.THEME)).toBe('dark');

    const meta = document.querySelector('meta[name="theme-color"]');
    expect(meta?.getAttribute('content')).toBe('#4D8FFF');

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe('light');
    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect(localStorage.getItem(APP_CONFIG.LOCAL_STORAGE_KEYS.THEME)).toBe('light');
    expect(meta?.getAttribute('content')).toBe('#002664');
  });

  it('sets theme explicitly via setTheme', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    act(() => {
      result.current.setTheme('dark');
    });

    expect(result.current.theme).toBe('dark');
    expect(localStorage.getItem(APP_CONFIG.LOCAL_STORAGE_KEYS.THEME)).toBe('dark');
  });

  it('gracefully degrades when localStorage.setItem throws during toggleTheme or setTheme', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Quota exceeded', 'QuotaExceededError');
    });

    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    expect(() => {
      act(() => {
        result.current.toggleTheme();
      });
    }).not.toThrow();

    expect(result.current.theme).toBe('dark');

    expect(() => {
      act(() => {
        result.current.setTheme('light');
      });
    }).not.toThrow();

    expect(result.current.theme).toBe('light');
  });

  it('provides initial state when useTheme is called outside of ThemeProvider', () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('light');
    expect(typeof result.current.setTheme).toBe('function');
    expect(typeof result.current.toggleTheme).toBe('function');
  });

  it('renders child elements correctly', () => {
    render(
      <ThemeProvider>
        <span data-testid="theme-child">Theme Content</span>
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme-child')).toBeInTheDocument();
    expect(screen.getByTestId('theme-child')).toHaveTextContent('Theme Content');
  });
});
