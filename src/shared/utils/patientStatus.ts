import type { Patient } from '@features/patients/types';

export type PatientWorkflowStatus = 'referral' | 'plan-drafted' | 'testing' | 'reported';

export interface DerivePatientStatusInputs {
  planDrafts: Record<string, unknown> | null;
  testingDraft: { mrn?: string } | null;
  activeReport: { mrn?: string } | null;
}

export interface PatientStatusResult {
  status: PatientWorkflowStatus;
  docsOutstanding: boolean;
}

export function derivePatientStatus(
  patient: Patient,
  inputs: DerivePatientStatusInputs,
): PatientStatusResult {
  let status: PatientWorkflowStatus = 'referral';

  if (inputs.activeReport?.mrn === patient.mrn) {
    status = 'reported';
  } else if (inputs.testingDraft?.mrn === patient.mrn) {
    status = 'testing';
  } else if (inputs.planDrafts !== null
    && Object.prototype.hasOwnProperty.call(inputs.planDrafts, patient.id)) {
    status = 'plan-drafted';
  }

  const documentsToChase = patient.history.documentsToChase;
  const docsOutstanding = Boolean(
    documentsToChase?.tryptases
      || documentsToChase?.anaestheticChart
      || documentsToChase?.other,
  );

  return { status, docsOutstanding };
}
