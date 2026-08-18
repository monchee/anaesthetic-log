import { Patient, LogFormData } from '@shared/types';

export type ClinicalWorkSource = 'database' | 'manual' | 'direct';

export interface ClinicalWorkContext {
  schemaVersion: 1;
  sessionId: string;
  source: ClinicalWorkSource;
  firstName: string;
  lastName: string;
  mrn: string;
  dob?: string;
  reactionDate?: string;
  testingVisitDate: string;
  patientSnapshot?: Patient | null;
  createdAt: number;
}

export interface TestingDraftEnvelope {
  schemaVersion: 1;
  workContext: ClinicalWorkContext;
  formData: LogFormData;
  savedAt: number;
}

export interface ActiveReportEnvelope {
  schemaVersion: 1;
  workContext: ClinicalWorkContext;
  record: LogFormData;
  savedAt: number;
}

export function generateSessionId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export function createClinicalWorkContext(params: {
  source: ClinicalWorkSource;
  patient?: Patient | null;
  firstName?: string;
  lastName?: string;
  mrn?: string;
  dob?: string;
  reactionDate?: string;
  testingVisitDate?: string;
  sessionId?: string;
  createdAt?: number;
}): ClinicalWorkContext {
  const patient = params.patient;
  const today = new Date().toISOString().split('T')[0];

  return {
    schemaVersion: 1,
    sessionId: params.sessionId || generateSessionId(),
    source: params.source,
    firstName: params.firstName ?? patient?.firstName ?? '',
    lastName: params.lastName ?? patient?.lastName ?? '',
    mrn: params.mrn ?? patient?.mrn ?? '',
    dob: params.dob ?? patient?.dob ?? undefined,
    reactionDate: params.reactionDate ?? patient?.history?.date ?? undefined,
    testingVisitDate: params.testingVisitDate || today,
    patientSnapshot: patient ? JSON.parse(JSON.stringify(patient)) : null,
    createdAt: params.createdAt || Date.now(),
  };
}

export function isClinicalWorkContext(val: unknown): val is ClinicalWorkContext {
  if (!val || typeof val !== 'object') return false;
  const obj = val as Record<string, unknown>;
  return (
    obj.schemaVersion === 1 &&
    typeof obj.sessionId === 'string' &&
    (obj.source === 'database' || obj.source === 'manual' || obj.source === 'direct') &&
    typeof obj.firstName === 'string' &&
    typeof obj.lastName === 'string' &&
    typeof obj.mrn === 'string' &&
    typeof obj.testingVisitDate === 'string' &&
    typeof obj.createdAt === 'number'
  );
}

export function isActiveReportEnvelope(val: unknown): val is ActiveReportEnvelope {
  if (!val || typeof val !== 'object') return false;
  const obj = val as Record<string, unknown>;
  return (
    obj.schemaVersion === 1 &&
    isClinicalWorkContext(obj.workContext) &&
    typeof obj.record === 'object' &&
    obj.record !== null &&
    typeof obj.savedAt === 'number'
  );
}

export function isTestingDraftEnvelope(val: unknown): val is TestingDraftEnvelope {
  if (!val || typeof val !== 'object') return false;
  const obj = val as Record<string, unknown>;
  return (
    obj.schemaVersion === 1 &&
    isClinicalWorkContext(obj.workContext) &&
    typeof obj.formData === 'object' &&
    obj.formData !== null &&
    typeof obj.savedAt === 'number'
  );
}

/**
 * Migrates legacy raw LogFormData records (stored before workflow envelopes)
 * to a direct/report-only context WITHOUT attaching any live or currently selected patient.
 */
export function migrateLegacyRecordToEnvelope(
  rawRecord: unknown,
  savedAt?: number
): ActiveReportEnvelope | null {
  if (!rawRecord || typeof rawRecord !== 'object') return null;

  if (isActiveReportEnvelope(rawRecord)) {
    return rawRecord;
  }

  const record = rawRecord as Partial<LogFormData>;
  if (typeof record.mrn !== 'string' || typeof record.firstName !== 'string' || typeof record.lastName !== 'string') {
    return null;
  }

  const timestamp = savedAt || Date.now();
  const workContext = createClinicalWorkContext({
    source: 'direct',
    firstName: record.firstName,
    lastName: record.lastName,
    mrn: record.mrn,
    dob: record.dob,
    testingVisitDate: record.visitDate || new Date().toISOString().split('T')[0],
    patient: null, // explicitly null — never attach live selectedPatient
    createdAt: timestamp,
  });

  return {
    schemaVersion: 1,
    workContext,
    record: rawRecord as LogFormData,
    savedAt: timestamp,
  };
}

/**
 * Migrates legacy raw LogFormData testing draft (stored before workflow envelopes)
 * to a direct workflow draft envelope.
 */
export function migrateLegacyDraftToEnvelope(
  rawDraft: unknown,
  savedAt?: number
): TestingDraftEnvelope | null {
  if (!rawDraft || typeof rawDraft !== 'object') return null;

  if (isTestingDraftEnvelope(rawDraft)) {
    return rawDraft;
  }

  const draft = rawDraft as Partial<LogFormData>;
  if (typeof draft.mrn !== 'string' && typeof draft.firstName !== 'string') {
    return null;
  }

  const timestamp = savedAt || Date.now();
  const workContext = createClinicalWorkContext({
    source: 'direct',
    firstName: draft.firstName || '',
    lastName: draft.lastName || '',
    mrn: draft.mrn || '',
    dob: draft.dob,
    testingVisitDate: draft.visitDate || new Date().toISOString().split('T')[0],
    patient: null,
    createdAt: timestamp,
  });

  return {
    schemaVersion: 1,
    workContext,
    formData: rawDraft as LogFormData,
    savedAt: timestamp,
  };
}
