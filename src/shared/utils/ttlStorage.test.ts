import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { refreshTTL } from './ttlStorage';

describe('refreshTTL', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('preserves the stored value and refreshes its timestamp', () => {
    const value = { patientId: 'example', draft: ['one', 'two'] };
    localStorage.setItem('clinical-key', JSON.stringify({ value, savedAt: 1_000 }));
    vi.setSystemTime(50_000);

    refreshTTL('clinical-key');

    expect(JSON.parse(localStorage.getItem('clinical-key')!)).toEqual({
      value,
      savedAt: 50_000,
    });
  });

  it('does nothing and does not throw for a missing key', () => {
    expect(() => refreshTTL('missing-key')).not.toThrow();
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });
});
