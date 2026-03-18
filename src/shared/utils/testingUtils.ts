import { DrugTestRow, LogFormData } from '@features/testing/types';

// Testing utility functions

export const isSkinTestPositive = (row: DrugTestRow): boolean => {
    const spt = parseInt(row.sptWheal || '0', 10);
    const idt100 = parseInt(row.idt100 || '0', 10);
    const idt10 = parseInt(row.idt10 || '0', 10);
    const idtNeat = parseInt(row.idtNeat || '0', 10);
    return spt >= 3 || idt100 >= 3 || idt10 >= 3 || idtNeat >= 3;
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
