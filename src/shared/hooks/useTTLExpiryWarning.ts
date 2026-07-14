import { useCallback, useEffect, useState } from 'react';
import {
  ACTIVE_REPORT_TTL_MS,
  getSavedAt,
  PATIENT_DATA_KEYS,
  refreshTTL,
} from '@shared/utils/ttlStorage';

const EXPIRY_WARNING_THRESHOLD_MS = 30 * 60 * 1000;
const EXPIRY_CHECK_INTERVAL_MS = 60 * 1000;

interface ExpirySnapshot {
  expiresAt: number | null;
  checkedAt: number;
}

const getExpirySnapshot = (): ExpirySnapshot => {
  const checkedAt = Date.now();
  let expiresAt: number | null = null;

  for (const key of PATIENT_DATA_KEYS) {
    const savedAt = getSavedAt(key);
    if (savedAt === null) continue;

    const keyExpiresAt = savedAt + ACTIVE_REPORT_TTL_MS;
    if (expiresAt === null || keyExpiresAt < expiresAt) {
      expiresAt = keyExpiresAt;
    }
  }

  return { expiresAt, checkedAt };
};

export function useTTLExpiryWarning() {
  const [snapshot, setSnapshot] = useState<ExpirySnapshot>(getExpirySnapshot);
  const [dismissedForExpiryAt, setDismissedForExpiryAt] = useState<number | null>(null);

  const recompute = useCallback(() => {
    setSnapshot(getExpirySnapshot());
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(recompute, EXPIRY_CHECK_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, [recompute]);

  const keepWorking = useCallback(() => {
    for (const key of PATIENT_DATA_KEYS) {
      if (getSavedAt(key) !== null) refreshTTL(key);
    }
    recompute();
  }, [recompute]);

  const dismiss = useCallback(() => {
    setDismissedForExpiryAt(snapshot.expiresAt);
  }, [snapshot.expiresAt]);

  const remainingMs = snapshot.expiresAt === null
    ? null
    : snapshot.expiresAt - snapshot.checkedAt;
  const isNearExpiry = remainingMs !== null
    && remainingMs > 0
    && remainingMs <= EXPIRY_WARNING_THRESHOLD_MS;
  const isDismissed = snapshot.expiresAt !== null
    && dismissedForExpiryAt === snapshot.expiresAt;

  return {
    isNearExpiry,
    expiresAt: snapshot.expiresAt,
    keepWorking,
    isDismissed,
    dismiss,
  };
}
