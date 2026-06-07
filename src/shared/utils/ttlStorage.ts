/**
 * Time-boxed localStorage for patient/clinical data.
 *
 * Privacy model: any patient data written to this device is stamped with a
 * write time and automatically expires after `ACTIVE_REPORT_TTL_MS`. Stale
 * keys are removed on read and swept once on app init, so clinical data never
 * lingers on a shared workstation beyond the window.
 */

/** Single source of truth for how long patient data may persist locally. */
export const ACTIVE_REPORT_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

/** Every localStorage key that may hold patient/clinical data. */
export const ACTIVE_REPORT_KEY = 'dream:active_report';
export const TESTING_DRAFT_KEY = 'dream:testing_draft';
export const TESTING_PLAN_BUILDER_DRAFTS_KEY = 'dream:testing_plan_builder_drafts';
export const PATIENT_DATA_KEYS = [ACTIVE_REPORT_KEY, TESTING_DRAFT_KEY, TESTING_PLAN_BUILDER_DRAFTS_KEY] as const;

interface TTLEntry<T> {
  value: T;
  savedAt: number;
}

/** Store a value alongside its write timestamp. Non-fatal on failure. */
export function setWithTTL<T>(key: string, value: T): void {
  try {
    const entry: TTLEntry<T> = { value, savedAt: Date.now() };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // localStorage may be unavailable (private mode / quota) — non-fatal
  }
}

/**
 * Return the stored value if it was written within `ttlMs`, otherwise remove
 * the key and return null. Also returns null for missing/corrupt entries.
 */
export function getIfFresh<T>(key: string, ttlMs: number = ACTIVE_REPORT_TTL_MS): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const entry = JSON.parse(raw) as TTLEntry<T>;
    if (typeof entry?.savedAt !== 'number') {
      localStorage.removeItem(key);
      return null;
    }
    if (Date.now() - entry.savedAt < ttlMs) {
      return entry.value;
    }
    localStorage.removeItem(key);
    return null;
  } catch {
    try { localStorage.removeItem(key); } catch { /* ignore */ }
    return null;
  }
}

/** Read the write timestamp of a stored entry, or null if missing/stale/corrupt. */
export function getSavedAt(key: string, ttlMs: number = ACTIVE_REPORT_TTL_MS): number | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const entry = JSON.parse(raw) as TTLEntry<unknown>;
    if (typeof entry?.savedAt !== 'number') return null;
    return Date.now() - entry.savedAt < ttlMs ? entry.savedAt : null;
  } catch {
    return null;
  }
}

/** Remove a stored key. Non-fatal on failure. */
export function removeStored(key: string): void {
  try { localStorage.removeItem(key); } catch { /* ignore */ }
}

/** Sweep every patient-data key, removing any that are stale. Call on app init. */
export function purgeStale(
  keys: readonly string[] = PATIENT_DATA_KEYS,
  ttlMs: number = ACTIVE_REPORT_TTL_MS,
): void {
  for (const key of keys) {
    // getIfFresh removes the key as a side effect when stale.
    getIfFresh(key, ttlMs);
  }
}
