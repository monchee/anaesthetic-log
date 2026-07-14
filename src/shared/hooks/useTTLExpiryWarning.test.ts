import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useTTLExpiryWarning } from './useTTLExpiryWarning';
import {
  ACTIVE_REPORT_KEY,
  ACTIVE_REPORT_TTL_MS,
  setWithTTL,
} from '@shared/utils/ttlStorage';

const MINUTE_MS = 60 * 1000;
const NOW = new Date('2026-07-14T12:00:00+10:00').getTime();

const storeAt = (savedAt: number) => {
  localStorage.setItem(ACTIVE_REPORT_KEY, JSON.stringify({
    value: { draft: true },
    savedAt,
  }));
};

describe('useTTLExpiryWarning', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('is not near expiry when no patient-data keys are populated', () => {
    const { result } = renderHook(() => useTTLExpiryWarning());

    expect(result.current.isNearExpiry).toBe(false);
    expect(result.current.expiresAt).toBeNull();
  });

  it('warns for the soonest key when it is 29 minutes from expiry', () => {
    const savedAt = NOW - (5 * 60 + 31) * MINUTE_MS;
    storeAt(savedAt);

    const { result } = renderHook(() => useTTLExpiryWarning());

    expect(result.current.isNearExpiry).toBe(true);
    expect(result.current.expiresAt).toBe(savedAt + ACTIVE_REPORT_TTL_MS);
  });

  it('does not warn for a key saved one hour ago', () => {
    storeAt(NOW - 60 * MINUTE_MS);

    const { result } = renderHook(() => useTTLExpiryWarning());

    expect(result.current.isNearExpiry).toBe(false);
  });

  it('re-stamps populated keys and clears the warning immediately', () => {
    storeAt(NOW - (5 * 60 + 31) * MINUTE_MS);
    const { result } = renderHook(() => useTTLExpiryWarning());

    act(() => result.current.keepWorking());

    const refreshed = JSON.parse(localStorage.getItem(ACTIVE_REPORT_KEY)!);
    expect(refreshed.savedAt).toBe(NOW);
    expect(refreshed.value).toEqual({ draft: true });
    expect(result.current.isNearExpiry).toBe(false);
    expect(result.current.expiresAt).toBe(NOW + ACTIVE_REPORT_TTL_MS);
  });

  it('dismisses only the current expiry cycle', () => {
    storeAt(NOW - (5 * 60 + 31) * MINUTE_MS);
    const { result } = renderHook(() => useTTLExpiryWarning());

    act(() => result.current.dismiss());
    expect(result.current.isDismissed).toBe(true);

    act(() => vi.advanceTimersByTime(MINUTE_MS));
    expect(result.current.isDismissed).toBe(true);

    act(() => {
      setWithTTL(ACTIVE_REPORT_KEY, { nextDraft: true });
      vi.setSystemTime(Date.now() + (5 * 60 + 31) * MINUTE_MS);
      vi.advanceTimersByTime(MINUTE_MS);
    });

    expect(result.current.isNearExpiry).toBe(true);
    expect(result.current.isDismissed).toBe(false);
  });
});
