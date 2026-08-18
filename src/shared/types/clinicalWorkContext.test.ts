import { describe, expect, it } from 'vitest';
import {
  createClinicalWorkContext,
  generateSessionId,
  isClinicalWorkContext,
  isActiveReportEnvelope,
  isTestingDraftEnvelope,
  migrateLegacyRecordToEnvelope,
  migrateLegacyDraftToEnvelope,
} from './clinicalWorkContext';
import { Patient, LogFormData } from '@shared/types';

const mockPatient: Patient = {
  id: '101',
  mrn: 'MRN12345',
  firstName: 'Jane',
  lastName: 'Doe',
  dob: '1980-05-15',
  gender: 'Female',
  city: 'Sydney',
  history: {
    date: '2025-06-12',
    procedure: 'Laparoscopy',
    grade: 'Grade 2',
    reactionSummary: 'Hypotension and bronchospasm',
    suspectedAgents: ['Cefazolin'],
    symptoms: [{ label: 'Hypotension' }, { label: 'Bronchospasm' }],
    treatment: ['Adrenaline'],
    anaesthetist: 'Dr Smith',
  },
};

const mockFormData: LogFormData = {
  mrn: 'MRN12345',
  firstName: 'Jane',
  lastName: 'Doe',
  dob: '1980-05-15',
  visitDate: '2026-03-18',
  controls: { histamineSpt: '5', salineSpt: '0', salineIdt: '0' },
  testPanel: [],
  proceedToChallenge: false,
  challengeDrug: '',
  outcome: null,
  reactionTime: '',
  symptoms: [],
  symptomsOther: '',
  interventionType: '',
  interventionOther: '',
  plan: 'Safe for future anaesthesia',
};

describe('ClinicalWorkContext', () => {
  it('generates unique session IDs', () => {
    const id1 = generateSessionId();
    const id2 = generateSessionId();
    expect(id1).toBeTruthy();
    expect(id2).toBeTruthy();
    expect(id1).not.toBe(id2);
  });

  it('creates database-linked context with bounded patient snapshot', () => {
    const ctx = createClinicalWorkContext({
      source: 'database',
      patient: mockPatient,
    });

    expect(ctx.schemaVersion).toBe(1);
    expect(ctx.source).toBe('database');
    expect(ctx.sessionId).toBeTruthy();
    expect(ctx.firstName).toBe('Jane');
    expect(ctx.lastName).toBe('Doe');
    expect(ctx.mrn).toBe('MRN12345');
    expect(ctx.dob).toBe('1980-05-15');
    expect(ctx.reactionDate).toBe('2025-06-12');
    expect(ctx.patientSnapshot).toEqual(mockPatient);
    expect(ctx.createdAt).toBeGreaterThan(0);
  });

  it('creates direct-entry context without patient snapshot', () => {
    const ctx = createClinicalWorkContext({
      source: 'direct',
      firstName: 'John',
      lastName: 'Smith',
      mrn: 'DIR999',
      testingVisitDate: '2026-03-18',
    });

    expect(ctx.source).toBe('direct');
    expect(ctx.patientSnapshot).toBeNull();
    expect(ctx.firstName).toBe('John');
    expect(ctx.lastName).toBe('Smith');
    expect(ctx.mrn).toBe('DIR999');
    expect(ctx.dob).toBeUndefined();
    expect(ctx.reactionDate).toBeUndefined();
  });

  it('validates clinical work contexts correctly', () => {
    const ctx = createClinicalWorkContext({
      source: 'manual',
      firstName: 'Alex',
      lastName: 'Taylor',
      mrn: 'MAN001',
    });

    expect(isClinicalWorkContext(ctx)).toBe(true);
    expect(isClinicalWorkContext(null)).toBe(false);
    expect(isClinicalWorkContext({ schemaVersion: 2 })).toBe(false);
    expect(isClinicalWorkContext({ ...ctx, sessionId: undefined })).toBe(false);
  });

  it('migrates legacy raw report record without attaching selected patient', () => {
    const savedAt = 1700000000000;
    const envelope = migrateLegacyRecordToEnvelope(mockFormData, savedAt);

    expect(envelope).not.toBeNull();
    expect(isActiveReportEnvelope(envelope)).toBe(true);
    expect(envelope?.schemaVersion).toBe(1);
    expect(envelope?.savedAt).toBe(savedAt);
    expect(envelope?.record).toEqual(mockFormData);
    expect(envelope?.workContext.source).toBe('direct');
    expect(envelope?.workContext.patientSnapshot).toBeNull();
    expect(envelope?.workContext.mrn).toBe('MRN12345');
    expect(envelope?.workContext.firstName).toBe('Jane');
    expect(envelope?.workContext.lastName).toBe('Doe');
  });

  it('preserves existing active report envelope on migration call', () => {
    const ctx = createClinicalWorkContext({ source: 'database', patient: mockPatient });
    const original = {
      schemaVersion: 1 as const,
      workContext: ctx,
      record: mockFormData,
      savedAt: 1700000000000,
    };

    const envelope = migrateLegacyRecordToEnvelope(original);
    expect(envelope).toBe(original);
  });

  it('migrates legacy raw draft to draft envelope', () => {
    const savedAt = 1700000000000;
    const envelope = migrateLegacyDraftToEnvelope(mockFormData, savedAt);

    expect(envelope).not.toBeNull();
    expect(isTestingDraftEnvelope(envelope)).toBe(true);
    expect(envelope?.schemaVersion).toBe(1);
    expect(envelope?.formData).toEqual(mockFormData);
    expect(envelope?.workContext.source).toBe('direct');
    expect(envelope?.workContext.patientSnapshot).toBeNull();
  });
});
