import { describe, expect, it } from 'vitest';
import { getPatientIdentitySignature, isDifferentPatient } from './patientIdentity';
import { createMockPatient } from '@/src/test/factories/patientFactory';

describe('patientIdentity', () => {
  it('returns empty string for null or undefined patient', () => {
    expect(getPatientIdentitySignature(null)).toBe('');
    expect(getPatientIdentitySignature(undefined)).toBe('');
  });

  it('generates consistent signature for database patient', () => {
    const patient1 = createMockPatient({
      id: 'p123',
      mrn: 'MRN001',
      firstName: 'Alice',
      lastName: 'Smith',
      dob: '1985-05-12',
    });
    const patient2 = createMockPatient({
      id: 'p123',
      mrn: ' mrn001 ',
      firstName: 'alice',
      lastName: 'SMITH',
      dob: '1985-05-12',
    });

    expect(getPatientIdentitySignature(patient1)).toBe('p123');
    expect(isDifferentPatient(patient1, patient2)).toBe(false);
  });

  it('distinguishes different manual records sharing the same sentinel id "manual"', () => {
    const manual1 = createMockPatient({
      id: 'manual',
      mrn: 'MAN001',
      firstName: 'John',
      lastName: 'Doe',
      dob: '1970-01-01',
    });
    const manual2 = createMockPatient({
      id: 'manual',
      mrn: 'MAN002',
      firstName: 'Jane',
      lastName: 'Doe',
      dob: '1975-02-02',
    });

    expect(getPatientIdentitySignature(manual1)).not.toBe(getPatientIdentitySignature(manual2));
    expect(isDifferentPatient(manual1, manual2)).toBe(true);
  });

  it('treats identical manual records as the same patient', () => {
    const manual1 = createMockPatient({
      id: 'manual',
      mrn: 'MAN001',
      firstName: 'John',
      lastName: 'Doe',
      dob: '1970-01-01',
    });
    const manual1Copy = createMockPatient({
      id: 'manual',
      mrn: 'MAN001',
      firstName: 'John',
      lastName: 'Doe',
      dob: '1970-01-01',
    });

    expect(isDifferentPatient(manual1, manual1Copy)).toBe(false);
  });
});
