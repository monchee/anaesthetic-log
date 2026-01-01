import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from './useLocalStorage';

describe('useLocalStorage', () => {
  const mockKey = 'test-key';

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('Initialization', () => {
    it('returns initial value when localStorage is empty', () => {
      const { result } = renderHook(() => useLocalStorage(mockKey, 'initial'));

      expect(result.current[0]).toBe('initial');
    });

    it('reads existing value from localStorage', () => {
      localStorage.setItem(mockKey, JSON.stringify('existing value'));

      const { result } = renderHook(() => useLocalStorage(mockKey, 'initial'));

      expect(result.current[0]).toBe('existing value');
    });

    it('parses JSON values correctly', () => {
      const complexValue = { name: 'Test', count: 42 };
      localStorage.setItem(mockKey, JSON.stringify(complexValue));

      const { result } = renderHook(() =>
        useLocalStorage(mockKey, { name: 'Default', count: 0 })
      );

      expect(result.current[0]).toEqual(complexValue);
    });

    it('handles window undefined (SSR)', () => {
      const originalWindow = global.window;
      // @ts-ignore - testing SSR scenario
      delete global.window;

      const { result } = renderHook(() => useLocalStorage(mockKey, 'ssr-value'));

      expect(result.current[0]).toBe('ssr-value');

      global.window = originalWindow;
    });
  });

  describe('Setting Values', () => {
    it('updates state and localStorage when setValue is called', () => {
      const { result } = renderHook(() => useLocalStorage(mockKey, 'initial'));

      act(() => {
        result.current[1]('new value');
      });

      expect(result.current[0]).toBe('new value');
      expect(localStorage.setItem).toHaveBeenCalledWith(
        mockKey,
        JSON.stringify('new value')
      );
    });

    it('accepts function updater', () => {
      const { result } = renderHook(() => useLocalStorage(mockKey, 0));

      act(() => {
        result.current[1]((prev) => prev + 1);
      });

      expect(result.current[0]).toBe(1);
    });

    it('stores complex objects', () => {
      const { result } = renderHook(() =>
        useLocalStorage(mockKey, { items: [] })
      );

      const newValue = { items: ['item1', 'item2'] };

      act(() => {
        result.current[1](newValue);
      });

      expect(result.current[0]).toEqual(newValue);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        mockKey,
        JSON.stringify(newValue)
      );
    });

    it('handles null values', () => {
      const { result } = renderHook(() => useLocalStorage<string | null>(mockKey, 'default'));

      act(() => {
        result.current[1](null);
      });

      expect(result.current[0]).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('handles JSON parse errors gracefully', () => {
      localStorage.setItem(mockKey, 'invalid json{');

      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const { result } = renderHook(() => useLocalStorage(mockKey, 'fallback'));

      expect(result.current[0]).toBe('fallback');
      expect(consoleWarn).toHaveBeenCalled();
    });

    it('handles localStorage setItem errors (quota exceeded)', () => {
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});

      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      const { result } = renderHook(() => useLocalStorage(mockKey, 'initial'));

      act(() => {
        result.current[1]('new value');
      });

      // State should still update even if localStorage fails
      expect(result.current[0]).toBe('new value');
      expect(consoleWarn).toHaveBeenCalled();
    });

    it('handles localStorage getItem errors', () => {
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});

      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('SecurityError');
      });

      const { result } = renderHook(() => useLocalStorage(mockKey, 'fallback'));

      expect(result.current[0]).toBe('fallback');
      expect(consoleWarn).toHaveBeenCalled();
    });
  });

  describe('Type Safety', () => {
    it('works with string types', () => {
      const { result } = renderHook(() => useLocalStorage<string>(mockKey, ''));

      act(() => {
        result.current[1]('test string');
      });

      expect(typeof result.current[0]).toBe('string');
    });

    it('works with number types', () => {
      const { result } = renderHook(() => useLocalStorage<number>(mockKey, 0));

      act(() => {
        result.current[1](42);
      });

      expect(result.current[0]).toBe(42);
    });

    it('works with boolean types', () => {
      const { result } = renderHook(() => useLocalStorage<boolean>(mockKey, false));

      act(() => {
        result.current[1](true);
      });

      expect(result.current[0]).toBe(true);
    });

    it('works with array types', () => {
      const { result } = renderHook(() => useLocalStorage<string[]>(mockKey, []));

      act(() => {
        result.current[1](['item1', 'item2']);
      });

      expect(result.current[0]).toEqual(['item1', 'item2']);
    });

    it('works with object types', () => {
      type TestObject = { id: number; name: string };
      const { result } = renderHook(() =>
        useLocalStorage<TestObject>(mockKey, { id: 0, name: '' })
      );

      act(() => {
        result.current[1]({ id: 1, name: 'Test' });
      });

      expect(result.current[0]).toEqual({ id: 1, name: 'Test' });
    });
  });

  describe('Persistence', () => {
    it('persists across hook re-renders', () => {
      const { result, rerender } = renderHook(() =>
        useLocalStorage(mockKey, 'initial')
      );

      act(() => {
        result.current[1]('persisted value');
      });

      rerender();

      expect(result.current[0]).toBe('persisted value');
    });

    it('shares state between multiple hook instances with same key', () => {
      const { result: result1 } = renderHook(() =>
        useLocalStorage(mockKey, 'initial')
      );

      const { result: result2 } = renderHook(() =>
        useLocalStorage(mockKey, 'initial')
      );

      act(() => {
        result1.current[1]('shared value');
      });

      expect(result2.current[0]).toBe('shared value');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty string as valid value', () => {
      const { result } = renderHook(() => useLocalStorage(mockKey, 'default'));

      act(() => {
        result.current[1]('');
      });

      expect(result.current[0]).toBe('');
    });

    it('handles zero as valid value', () => {
      const { result } = renderHook(() => useLocalStorage<number>(mockKey, 100));

      act(() => {
        result.current[1](0);
      });

      expect(result.current[0]).toBe(0);
    });

    it('handles false as valid value', () => {
      const { result } = renderHook(() => useLocalStorage<boolean>(mockKey, true));

      act(() => {
        result.current[1](false);
      });

      expect(result.current[0]).toBe(false);
    });

    it('handles empty array as valid value', () => {
      const { result } = renderHook(() => useLocalStorage<string[]>(mockKey, ['default']));

      act(() => {
        result.current[1]([]);
      });

      expect(result.current[0]).toEqual([]);
    });

    it('handles empty object as valid value', () => {
      const { result } = renderHook(() =>
        useLocalStorage<Record<string, any>>(mockKey, { key: 'value' })
      );

      act(() => {
        result.current[1]({});
      });

      expect(result.current[0]).toEqual({});
    });
  });

  describe('Clinical Data Scenarios', () => {
    it('stores patient data correctly', () => {
      const patientData = {
        id: '123',
        name: 'John Doe',
        mrn: 'MRN001',
        reaction_history: [],
      };

      const { result } = renderHook(() =>
        useLocalStorage(mockKey, null)
      );

      act(() => {
        result.current[1](patientData as any);
      });

      expect(result.current[0]).toEqual(patientData);
    });

    it('stores testing logs correctly', () => {
      const testingLogs = [
        {
          id: '1',
          date: '2024-01-01',
          patient: 'John Doe',
          tests: [],
        },
      ];

      const { result } = renderHook(() =>
        useLocalStorage(mockKey, [])
      );

      act(() => {
        result.current[1](testingLogs as any);
      });

      expect(result.current[0]).toEqual(testingLogs);
    });
  });
});
