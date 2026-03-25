import { DrugTestRow, LogFormData } from '@features/testing/types';

// Testing utility functions

export const isSkinTestPositive = (row: DrugTestRow): boolean => {
    const check = (v: string | undefined) => (parseInt(v ?? '0', 10) || 0) >= 3;
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
