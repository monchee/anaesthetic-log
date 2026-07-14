import type { PatientHistory } from '@features/patients/types';

export function deriveHighRiskChips(history: PatientHistory): string[] {
  const highRiskMeds = history.highRiskMeds ?? [];
  const conditions = history.conditions ?? [];
  const chips: string[] = [];

  if (highRiskMeds.some(medication => /beta.?blocker/i.test(medication))) {
    chips.push('Beta-blocker');
  }

  if (highRiskMeds.some(medication => /ACE.?I\b|ACE.?inhibitor/i.test(medication))) {
    chips.push('ACE-inhibitor');
  }

  if (conditions.some(condition => /pregnan/i.test(condition))) {
    chips.push('Pregnancy');
  }

  if (conditions.some(condition => /asthma/i.test(condition))) {
    chips.push('Asthma');
  }

  return chips;
}
