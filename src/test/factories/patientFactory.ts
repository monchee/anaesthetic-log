import { Patient, PatientHistory } from '../../../types';

/**
 * Factory function to create mock patients for testing
 */
export function createMockPatient(overrides?: Partial<Patient>): Patient {
  const defaultPatient: Patient = {
    id: 'TEST-001',
    firstName: 'John',
    lastName: 'Doe',
    dob: '1980-01-01',
    mrn: 'MRN-001',
    gender: 'Male',
    city: 'Sydney',
    history: createMockPatientHistory(),
  };

  return { ...defaultPatient, ...overrides };
}

/**
 * Factory function to create mock patient history
 */
export function createMockPatientHistory(overrides?: Partial<PatientHistory>): PatientHistory {
  const defaultHistory: PatientHistory = {
    date: '2024-01-15',
    grade: 'Grade 2',
    reactionSummary: 'Mild allergic reaction during surgery',
    procedure: 'Appendectomy',
    anaesthetist: 'Dr. Smith',
    hospital: 'RPAH',
    symptoms: [
      { label: 'Urticaria', detail: 'Generalised' },
      { label: 'Hypotension' },
    ],
    treatment: ['Adrenaline', 'IV Fluids'],
    suspectedAgents: ['Rocuronium'],
    medications: ['Rocuronium @ 09:15', 'Propofol @ 09:10'],
    inductionTime: '09:10',
    reactionTime: '09:20',
    anaesthesiaType: ['General'],
  };

  return { ...defaultHistory, ...overrides };
}

/**
 * Create a list of mock patients
 */
export function createMockPatientList(count: number = 5): Patient[] {
  return Array.from({ length: count }, (_, i) => 
    createMockPatient({
      id: `TEST-${String(i + 1).padStart(3, '0')}`,
      firstName: `Patient${i + 1}`,
      lastName: `Test${i + 1}`,
      mrn: `MRN-${String(i + 1).padStart(3, '0')}`,
    })
  );
}

/**
 * Create manual patient entry
 */
export function createManualPatient(): Patient {
  return createMockPatient({
    id: 'manual',
    firstName: '',
    lastName: '',
    dob: '',
    mrn: '',
    city: '',
  });
}
