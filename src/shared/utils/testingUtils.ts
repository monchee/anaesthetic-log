import { DrugTestRow, LogFormData } from '@features/testing/types';
import { SKIN_TEST_POSITIVE_THRESHOLD } from './constants';

// Testing utility functions

export const isSkinTestPositive = (row: DrugTestRow): boolean => {
    const check = (v: string | undefined) => (parseInt(v ?? '0', 10) || 0) >= SKIN_TEST_POSITIVE_THRESHOLD;
    if (check(row.sptWheal)) return true;
    if (row.idtResults?.some(v => check(v))) return true;
    // Legacy fallback
    return check(row.idt100) || check(row.idt10) || check(row.idtNeat);
};

export const getPositiveResults = (record: LogFormData) => {
  const drugs: string[] = [];
  const challengeName = record.challengeDrug === 'Other' ? (record.challengeDrugCustom || 'Other') : record.challengeDrug;

  if (record.proceedToChallenge && record.outcome === 'UNSUCCESS') {
      drugs.push(challengeName);
  }

  (record.testPanel || []).forEach((t) => {
      const drugName = t.drugName === 'Other' ? (t.customName || 'Other') : t.drugName;
      if (record.proceedToChallenge && drugName === challengeName) return;
      if (isSkinTestPositive(t)) {
          drugs.push(drugName);
      }
  });

  return [...new Set(drugs)];
};

export const getNegativeResults = (record: LogFormData) => {
  const drugs: string[] = [];
  const challengeName = record.challengeDrug === 'Other' ? (record.challengeDrugCustom || 'Other') : record.challengeDrug;

  if (record.proceedToChallenge && record.outcome === 'SUCCESS') {
      drugs.push(challengeName);
  }

  (record.testPanel || []).forEach((t) => {
      const drugName = t.drugName === 'Other' ? (t.customName || 'Other') : t.drugName;
      if (record.proceedToChallenge && drugName === challengeName) return;
      if (!isSkinTestPositive(t)) {
          drugs.push(drugName);
      }
  });

  return [...new Set(drugs)];
};

// Canonical masterlist spelling is 'Cis-atracurium' (hyphenated) — positives
// carry that form, so this list must match it to recognise it as a relaxant.
export const MUSCLE_RELAXANTS = ['Rocuronium', 'Vecuronium', 'Suxamethonium', 'Cis-atracurium', 'Pancuronium', 'Atracurium', 'Mivacurium'];

export function getCrossSensitizationNotes(positives: string[]): string[] {
  const notes: string[] = [];
  const hasRoc = positives.includes('Rocuronium');
  const hasVec = positives.includes('Vecuronium');
  if (hasRoc && !hasVec) {
    notes.push('Given the significant molecular similarity between Rocuronium and Vecuronium, the patient should also be considered sensitized to Vecuronium.');
  }
  if (hasVec && !hasRoc) {
    notes.push('Given the significant molecular similarity between Vecuronium and Rocuronium, the patient should also be considered sensitized to Rocuronium.');
  }
  return notes;
}

export function getCrossSensitizedDrugs(positives: string[]): string[] {
  const hasRoc = positives.includes('Rocuronium');
  const hasVec = positives.includes('Vecuronium');
  const crossSensitized: string[] = [];

  if (hasRoc && !hasVec && MUSCLE_RELAXANTS.includes('Vecuronium')) {
    crossSensitized.push('Vecuronium');
  }
  if (hasVec && !hasRoc && MUSCLE_RELAXANTS.includes('Rocuronium')) {
    crossSensitized.push('Rocuronium');
  }

  return crossSensitized;
}

export function buildRecommendations(
  positives: string[],
  crossSensitized: string[],
): { avoidList: string[]; bullets: string[]; noAllergyMessage?: string } {
  if (positives.length === 0) {
    return {
      avoidList: [],
      bullets: [],
      noAllergyMessage: 'No evidence of IgE-mediated allergy to medications tested.',
    };
  }
  const avoidList = [...positives, ...crossSensitized];
  const bullets = [
    'Updated allergy profile on eMR.',
    'GP to update allergy profile on MyHealth Record.',
  ];
  const hasMuscleRelaxant = [...positives, ...crossSensitized].some(d => MUSCLE_RELAXANTS.includes(d));
  if (hasMuscleRelaxant) {
    bullets.push('MedicAlert bracelet recommended and advice given.');
  }
  bullets.push('Copy of letter to be provided to patient to give to any anaesthetist prior to future surgery.');
  return { avoidList, bullets };
}
