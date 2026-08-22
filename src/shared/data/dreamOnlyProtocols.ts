import type { DrugProtocol } from "@features/testing/types";

/**
 * Hand-maintained DREAM protocol records for drugs not yet authored in SCRATCH.
 * As drugs are migrated to SCRATCH, their records move to protocols.snapshot.json
 * and are removed from this list.
 */
export const DREAM_ONLY_PROTOCOLS: DrugProtocol[] = [
  // ── REVERSAL AGENTS ────────────────────────────────────────────────────────
  // ── PENICILLINS ────────────────────────────────────────────────────────
  // ── HYPNOTICS ────────────────────────────────────────────────────────
  // ── LOCAL ANAESTHETICS ────────────────────────────────────────────────────────
  // ── OPIOIDS ────────────────────────────────────────────────────────
  // ── ANTISEPTICS ────────────────────────────────────────────────────────
  // ── OTHERS ────────────────────────────────────────────────────────
  // ── CHALLENGE / DESENSITISATION ────────────────────────────────────────────────────────
];
