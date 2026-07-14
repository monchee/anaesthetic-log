import type { Patient } from '@features/patients/types';
import { describe, expect, it } from 'vitest';
import {
  derivePatientStatus,
  type DerivePatientStatusInputs,
} from './patientStatus';

function makePatient(overrides: Partial<Patient> = {}): Patient {
  return {
    id: 'patient-1',
    firstName: 'Test',
    lastName: 'Patient',
    dob: '1980-01-01',
    mrn: 'MRN-AbC-123',
    gender: 'Female',
    city: 'Sydney',
    history: {
      date: '2026-01-01',
      grade: '2',
      reactionSummary: 'Reaction summary',
      symptoms: [],
      treatment: [],
      suspectedAgents: [],
      procedure: 'Procedure',
      anaesthetist: 'Anaesthetist',
    },
    ...overrides,
  };
}

function makeInputs(overrides: Partial<DerivePatientStatusInputs> = {}): DerivePatientStatusInputs {
  return {
    planDrafts: null,
    testingDraft: null,
    activeReport: null,
    ...overrides,
  };
}

describe('derivePatientStatus status', () => {
  it('returns reported for a matching active report', () => {
    const patient = makePatient();

    expect(derivePatientStatus(patient, makeInputs({ activeReport: { mrn: patient.mrn } }))).toEqual({
      status: 'reported',
      docsOutstanding: false,
    });
  });

  it('returns testing for a matching testing draft', () => {
    const patient = makePatient();

    expect(derivePatientStatus(patient, makeInputs({ testingDraft: { mrn: patient.mrn } })).status)
      .toBe('testing');
  });

  it('returns plan-drafted for an own-property patient draft', () => {
    const patient = makePatient();

    expect(derivePatientStatus(patient, makeInputs({ planDrafts: { [patient.id]: {} } })).status)
      .toBe('plan-drafted');
  });

  it('returns referral when there is no matching workflow data', () => {
    expect(derivePatientStatus(makePatient(), makeInputs()).status).toBe('referral');
  });

  it('gives a matching active report precedence over matching testing and plan drafts', () => {
    const patient = makePatient();
    const result = derivePatientStatus(patient, makeInputs({
      activeReport: { mrn: patient.mrn },
      testingDraft: { mrn: patient.mrn },
      planDrafts: { [patient.id]: { panel: [] } },
    }));

    expect(result.status).toBe('reported');
  });

  it('gives a matching testing draft precedence over a plan draft', () => {
    const patient = makePatient();
    const result = derivePatientStatus(patient, makeInputs({
      testingDraft: { mrn: patient.mrn },
      planDrafts: { [patient.id]: {} },
    }));

    expect(result.status).toBe('testing');
  });

  it('matches report and testing MRNs by exact string', () => {
    const patient = makePatient();

    expect(derivePatientStatus(patient, makeInputs({
      activeReport: { mrn: patient.mrn.toLowerCase() },
      testingDraft: { mrn: patient.mrn.toUpperCase() },
    })).status).toBe('referral');
  });

  it('falls through safely when activeReport and testingDraft are null', () => {
    const patient = makePatient();

    expect(derivePatientStatus(patient, makeInputs({
      planDrafts: { [patient.id]: {} },
      activeReport: null,
      testingDraft: null,
    })).status).toBe('plan-drafted');
  });

  it.each([
    ['null', null],
    ['empty', {}],
  ])('returns referral when planDrafts is %s', (_label, planDrafts) => {
    expect(derivePatientStatus(makePatient(), makeInputs({ planDrafts })).status).toBe('referral');
  });

  it('ignores inherited plan draft properties', () => {
    const patient = makePatient();
    const planDrafts = Object.create({ [patient.id]: {} }) as Record<string, unknown>;

    expect(derivePatientStatus(patient, makeInputs({ planDrafts })).status).toBe('referral');
  });
});

describe('derivePatientStatus docsOutstanding', () => {
  it.each([
    ['tryptases', { tryptases: true }],
    ['anaesthetic chart', { anaestheticChart: true }],
    ['other documents', { other: true }],
  ])('returns true when %s documents need chasing', (_label, documentsToChase) => {
    const basePatient = makePatient();
    const patient = makePatient({
      history: { ...basePatient.history, documentsToChase },
    });

    expect(derivePatientStatus(patient, makeInputs()).docsOutstanding).toBe(true);
  });

  it('returns false when all document flags are false', () => {
    const basePatient = makePatient();
    const patient = makePatient({
      history: {
        ...basePatient.history,
        documentsToChase: { tryptases: false, anaestheticChart: false, other: false },
      },
    });

    expect(derivePatientStatus(patient, makeInputs()).docsOutstanding).toBe(false);
  });

  it('returns false when documentsToChase is undefined', () => {
    expect(derivePatientStatus(makePatient(), makeInputs()).docsOutstanding).toBe(false);
  });

  it('derives outstanding documents independently for a reported patient', () => {
    const basePatient = makePatient();
    const patient = makePatient({
      history: { ...basePatient.history, documentsToChase: { tryptases: true } },
    });

    expect(derivePatientStatus(patient, makeInputs({ activeReport: { mrn: patient.mrn } }))).toEqual({
      status: 'reported',
      docsOutstanding: true,
    });
  });
});
