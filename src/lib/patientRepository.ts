import { Patient } from '@shared/types';

export function searchPatients(patients: Patient[] | null | undefined, searchTerm: string): Patient[] {
  if (!patients) return [];

  const term = searchTerm.toLowerCase().trim();

  if (!term) return patients;

  return patients.filter((patient) => {
    const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
    const searchableText = [
      fullName,
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
    patient.history?.grade === grade
  );
}

export function filterByOutcome(patients: Patient[], outcome: string): Patient[] {
  if (outcome === 'all') return patients;

  return patients.filter((patient) =>
    patient.history?.grade === outcome // Using grade as outcome proxy
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
    let aValue: string;
    let bValue: string;

    if (field === 'name') {
      aValue = `${a.firstName} ${a.lastName}`;
      bValue = `${b.firstName} ${b.lastName}`;
    } else {
      aValue = a[field];
      bValue = b[field];
    }

    const comparison = aValue.localeCompare(bValue);

    return order === 'asc' ? comparison : -comparison;
  });
}

export function getUniqueDrugs(patients: Patient[]): string[] {
  const drugs = new Set<string>();

  patients.forEach((patient) => {
    patient.history?.suspectedAgents?.forEach((drug) => {
      drugs.add(drug);
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
        patient.history?.suspectedAgents?.includes(drug)
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
    patient.firstName &&
    patient.lastName &&
    patient.mrn
  );
}
