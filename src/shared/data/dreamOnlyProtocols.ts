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
  {
    id: "rocuronium",
    drugName: "Sugammadex (+ Rocuronium)", category: "Reversal Agents", testType: "skin",
    presentation: "Mix with Rocuronium 1:1", sptNeatConcentration: "Neat (100mg/10mg/mL)", diluent: "0.9% sodium chloride",
    idtSteps: [s("1:1,000", "0.1mg/0.01mg/mL"), s("1:100", "1mg/0.1mg/mL")],
    challengeSteps: [],
    protocolLabel: "+ Rocuronium",
  },
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
    id: "suspension",
    drugName: "Cefuroxime Suspension", category: "Others", testType: "skin",
    needsPharmacyVerification: true,
    presentation: "125mg/5mL", sptNeatConcentration: "Neat (25mg/mL)", diluent: "",
    idtSteps: [s("1:100", "0.29mg/mL")],
    challengeSteps: [],
    protocolLabel: "Suspension",
  },
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
  {
    id: "oral-graded-challenge",
    drugName: "Amoxycillin Suspension", category: "Others", testType: "challenge",
    presentation: "125mg/5mL", sptNeatConcentration: "", diluent: "",
    idtSteps: [],
    challengeSteps: [c(1, "25mg", "1.0 mL", "25mg"), c(2, "50mg", "2.0 mL", "75mg"), c(3, "100mg", "4.0 mL", "175mg"), c(4, "250mg", "10 mL", "425mg")],
    protocolLabel: "Oral Graded Challenge",
  },
  {
    id: "oral-graded-challenge",
    drugName: "Amoxycillin/Clavulanic Acid", category: "Others", testType: "challenge",
    presentation: "125mg/31.25mg per 5mL", sptNeatConcentration: "", diluent: "",
    idtSteps: [],
    challengeSteps: [c(1, "25mg/6.25mg", "1 mL", "25mg/6.25mg"), c(2, "125mg/31.25mg", "5 mL", "150mg/37.5mg"), c(3, "250mg/62.5mg", "10 mL", "400mg/100mg"), c(4, "500mg/125mg", "20 mL", "900mg/225mg")],
    protocolLabel: "Oral Graded Challenge",
  },
  {
    id: "oral-graded-challenge",
    drugName: "Flucloxacillin", category: "Penicillins", testType: "challenge",
    presentation: "125mg/5mL suspension", sptNeatConcentration: "", diluent: "",
    idtSteps: [],
    challengeSteps: [c(1, "50mg", "2 mL", "50mg"), c(2, "125mg", "5 mL", "175mg"), c(3, "325mg", "13 mL", "500mg")],
    protocolLabel: "Oral Graded Challenge",
  },
  {
    id: "graded-challenge",
    drugName: "Meloxicam", category: "Others", testType: "challenge",
    presentation: "Tablet", sptNeatConcentration: "", diluent: "",
    idtSteps: [],
    challengeSteps: [c(1, "2.5mg", "2.5 mL", "2.5mg"), c(2, "5mg", "5 mL", "7.5mg")],
    protocolLabel: "Graded Challenge",
  },
  {
    id: "oral-graded-challenge",
    drugName: "Trimethoprim/Sulfamethoxazole", category: "Others", testType: "challenge",
    presentation: "40mg/200mg per 5mL suspension", sptNeatConcentration: "", diluent: "",
    idtSteps: [],
    challengeSteps: [c(1, "16mg/80mg", "2.0 mL", "16mg/80mg"), c(2, "64mg/320mg", "8.0 mL", "80mg/400mg"), c(3, "80mg/400mg", "10.0 mL", "160mg/800mg")],
    protocolLabel: "Oral Graded Challenge",
  },
  {
    id: "oral-graded-challenge",
    drugName: "Trimethoprim", category: "Others", testType: "challenge",
    presentation: "Suspension", sptNeatConcentration: "", diluent: "",
    idtSteps: [],
    challengeSteps: [c(1, "20mg", "2 mL", "20mg"), c(2, "100mg", "10 mL", "120mg"), c(3, "200mg", "20 mL", "320mg")],
    protocolLabel: "Oral Graded Challenge",
  },
  {
    id: "graded-challenge",
    drugName: "Voltaren (Diclofenac)", category: "Others", testType: "challenge",
    presentation: "Tablet", sptNeatConcentration: "", diluent: "",
    idtSteps: [],
    challengeSteps: [c(1, "25mg", "1 tablet", "25mg"), c(2, "50mg", "1 tablet", "75mg"), c(3, "100mg", "2 tablets", "175mg")],
    protocolLabel: "Graded Challenge",
  },
];
