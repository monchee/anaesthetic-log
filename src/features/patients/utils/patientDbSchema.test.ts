import { describe, expect, it } from 'vitest';
import { parsePatientDb, safeParsePatientDb } from './patientDbSchema';

const validPayload = {
  patients: [{
    id: 'synthetic-1',
    firstName: 'Avery',
    lastName: 'Testpatient',
    dob: '1980-01-01',
    mrn: 'SYN-001',
    gender: 'Other',
    city: 'Test City',
    history: {
      date: '2026-07-14',
      grade: 'Grade II',
      reactionSummary: 'Synthetic test reaction',
      symptoms: [{ label: 'Flushing' }],
      treatment: ['Observation'],
      suspectedAgents: ['Test agent'],
      procedure: 'Synthetic procedure',
      anaesthetist: 'Dr Test',
    },
  }],
  databaseDate: '14/07/2026',
  hasUploadedData: true,
};

describe('patientDbSchema', () => {
  it('parses a valid persisted cohort payload', () => {
    expect(parsePatientDb(validPayload)).toEqual(validPayload);
  });

  it('accepts omitted optional fields and safely ignores extra top-level fields', () => {
    const parsed = parsePatientDb({
      ...validPayload,
      unexpected: 'ignored',
    });

    expect(parsed).toEqual(validPayload);
    expect(parsed.patients[0].redcapId).toBeUndefined();
  });

  it('returns null for missing required fields without throwing', () => {
    expect(safeParsePatientDb({
      patients: validPayload.patients,
      hasUploadedData: true,
    })).toBeNull();
  });

  it('returns null for malformed JSON-like input without throwing', () => {
    expect(() => safeParsePatientDb('{"patients": [}')).not.toThrow();
    expect(safeParsePatientDb('{"patients": [}')).toBeNull();
  });
});
