import { Patient } from '../types';

export function searchPatients(patients: Patient[] | null | undefined, searchTerm: string): Patient[] {
  if (!patients) return [];

  const term = searchTerm.toLowerCase().trim();

  if (!term) return patients;

  return patients.filter((patient) => {
    const searchableText = [
      patient.name,
      patient.mrn,
      patient.city,
      patient.id,
    ].join(' ');

    return searchableText.toLowerCase().includes(term);
  });
}

export function filterByGrade(patients: Patient[], grade: string): Patient[] {
  if (grade === 'all') return patients;

  return patients.filter((patient) =>
    patient.reaction_history?.some((reaction) => reaction.grade === grade)
  );
}

export function filterByOutcome(patients: Patient[], outcome: string): Patient[] {
  if (outcome === 'all') return patients;

  return patients.filter((patient) =>
    patient.reaction_history?.some((reaction) => reaction.outcome === outcome)
  );
}

export function getPatientById(patients: Patient[], id: string): Patient | undefined {
  return patients.find((patient) => patient.id === id);
}

export function getPatientByMRN(patients: Patient[], mrn: string): Patient | undefined {
  return patients.find((patient) => patient.mrn === mrn);
}

export function sortPatients(
  patients: Patient[],
  field: 'name' | 'mrn',
  order: 'asc' | 'desc'
): Patient[] {
  return [...patients].sort((a, b) => {
    const aValue = a[field];
    const bValue = b[field];

    const comparison = aValue.localeCompare(bValue);

    return order === 'asc' ? comparison : -comparison;
  });
}

export function getUniqueDrugs(patients: Patient[]): string[] {
  const drugs = new Set<string>();

  patients.forEach((patient) => {
    patient.reaction_history?.forEach((reaction) => {
      drugs.add(reaction.drug);
    });
  });

  return Array.from(drugs).sort();
}

export function getDrugCategories(
  patients: Patient[],
  drugCategories: Record<string, string[]>
): Record<string, string[]> {
  const result: Record<string, string[]> = {};

  Object.entries(drugCategories).forEach(([category, drugs]) => {
    const usedDrugs = drugs.filter((drug) =>
      patients.some((patient) =>
        patient.reaction_history?.some((reaction) => reaction.drug === drug)
      )
    );

    if (usedDrugs.length > 0) {
      result[category] = usedDrugs;
    }
  });

  return result;
}

export function validatePatient(patient: Patient): boolean {
  return !!(
    patient.id &&
    patient.name &&
    patient.mrn
  );
}
