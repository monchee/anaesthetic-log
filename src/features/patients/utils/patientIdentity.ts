import { Patient } from '../types';

/**
 * Generates a stable patient identity signature based on patient ID and direct
 * identifying fields (MRN, name, DOB) without inventing data.
 * Used to distinguish different patients even when they share sentinel IDs (such as "manual").
 */
export function getPatientIdentitySignature(patient: Patient | null | undefined): string {
  if (!patient) return '';
  if (patient.id && patient.id !== 'manual') {
    return patient.id;
  }
  const id = patient.id ?? 'manual';
  const mrn = (patient.mrn ?? '').trim().toLowerCase();
  const firstName = (patient.firstName ?? '').trim().toLowerCase();
  const lastName = (patient.lastName ?? '').trim().toLowerCase();
  const dob = (patient.dob ?? '').trim();
  return `${id}::${mrn}::${firstName}::${lastName}::${dob}`;
}

export function isDifferentPatient(
  a: Patient | null | undefined,
  b: Patient | null | undefined
): boolean {
  return getPatientIdentitySignature(a) !== getPatientIdentitySignature(b);
}
