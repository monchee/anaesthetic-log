import type { DrugProtocol, IDTStep, ChallengeStep } from "@features/testing/types";

// Compact helpers for readability
const s = (ratio: string, concentration: string): IDTStep => ({ ratio, concentration });
const c = (step: number, dose: string, volume: string, cumulative: string): ChallengeStep => ({ step, dose, volume, cumulative });

/**
 * Hand-maintained DREAM protocol records for drugs not yet authored in SCRATCH.
 * As drugs are migrated to SCRATCH, their records move to protocols.snapshot.json
 * and are removed from this list.
 */
export const DREAM_ONLY_PROTOCOLS: DrugProtocol[] = [
  // ── REVERSAL AGENTS ────────────────────────────────────────────────────────
  // ── PENICILLINS ────────────────────────────────────────────────────────
  {
    id: "standard",
    drugName: "Methoxybenzylpenicillin", category: "Penicillins", testType: "skin",
    needsPharmacyVerification: true,
    presentation: "", sptNeatConcentration: "", diluent: "",
    idtSteps: [],
    challengeSteps: [],
    protocolLabel: "",
  },
  // ── HYPNOTICS ────────────────────────────────────────────────────────
  // ── LOCAL ANAESTHETICS ────────────────────────────────────────────────────────
  // ── OPIOIDS ────────────────────────────────────────────────────────
  // ── ANTISEPTICS ────────────────────────────────────────────────────────
  // ── OTHERS ────────────────────────────────────────────────────────
  {
    id: "standard",
    drugName: "Methylene Blue", category: "Others", testType: "skin",
    needsPharmacyVerification: true,
    presentation: "", sptNeatConcentration: "", diluent: "",
    idtSteps: [],
    challengeSteps: [],
    protocolLabel: "",
  },
  {
    id: "standard",
    drugName: "IV Contrast", category: "Others", testType: "skin",
    needsPharmacyVerification: true,
    presentation: "", sptNeatConcentration: "", diluent: "",
    idtSteps: [],
    challengeSteps: [],
    protocolLabel: "",
  },
  {
    id: "standard",
    drugName: "Atropine", category: "Others", testType: "skin",
    needsPharmacyVerification: true,
    presentation: "", sptNeatConcentration: "", diluent: "",
    idtSteps: [],
    challengeSteps: [],
    protocolLabel: "",
  },
  // ── CHALLENGE / DESENSITISATION ────────────────────────────────────────────────────────
];
