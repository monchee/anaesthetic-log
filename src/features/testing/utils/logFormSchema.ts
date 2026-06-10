import { z } from 'zod';
import { DrugTestRow, LogFormData, NurseNotes, TryptaseData } from '../types';

const stringOrEmpty = (value: unknown): string => String(value || '');
const stringOrUndefined = (value: unknown): string | undefined => value ? String(value) : undefined;

const toRecord = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
};

const sanitizeTryptase = (value: unknown): TryptaseData | undefined => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const source = toRecord(value);
  return {
    obtained: Boolean(source.obtained),
    significantElevation: Boolean(source.significantElevation),
    values: Array.isArray(source.values)
      ? source.values.map((sampleValue) => {
          const sample = toRecord(sampleValue);
          return {
            time: stringOrEmpty(sample.time),
            result: stringOrEmpty(sample.result),
          };
        })
      : [],
  };
};

const sanitizeNurseNotes = (value: unknown): NurseNotes | undefined => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const source = toRecord(value);
  return {
    preTesting: stringOrUndefined(source.preTesting),
    duringTesting: stringOrUndefined(source.duringTesting),
    postTesting: stringOrUndefined(source.postTesting),
    signedBy: stringOrUndefined(source.signedBy),
  };
};

const sanitizeDrugTestRow = (value: unknown): DrugTestRow => {
  const row = toRecord(value);
  const legacyIdtResults = [
    stringOrEmpty(row.idt100),
    stringOrEmpty(row.idt10),
    stringOrEmpty(row.idtNeat),
  ].filter((_, index, values) => values.slice(index).some(v => v !== '') || index === 0);

  return {
    id: stringOrUndefined(row.id),
    drugName: stringOrEmpty(row.drugName),
    sptWheal: stringOrEmpty(row.sptWheal),
    idtResults: Array.isArray(row.idtResults)
      ? row.idtResults.map((v: unknown) => String(v ?? ''))
      : legacyIdtResults,
    protocolIndex: typeof row.protocolIndex === 'number' ? row.protocolIndex : 0,
    customName: stringOrUndefined(row.customName),
    notes: stringOrUndefined(row.notes),
  };
};

const RawLogFormDataSchema = z.object({
  id: z.unknown().optional().transform(stringOrUndefined),
  timestamp: z.unknown().optional().transform(stringOrUndefined),
  mrn: z.unknown().optional().transform(stringOrEmpty),
  firstName: z.unknown().optional().transform(stringOrEmpty),
  lastName: z.unknown().optional().transform(stringOrEmpty),
  visitDate: z.unknown().optional().transform(stringOrEmpty),
  controls: z.unknown().optional().transform((value) => {
    const controls = toRecord(value);
    return {
      histamineSpt: stringOrEmpty(controls.histamineSpt),
      salineSpt: stringOrEmpty(controls.salineSpt),
      salineIdt: stringOrEmpty(controls.salineIdt),
    };
  }),
  testPanel: z.unknown().optional().transform((value) => (
    Array.isArray(value) ? value.map(sanitizeDrugTestRow) : []
  )),
  proceedToChallenge: z.unknown().optional().transform(Boolean),
  challengeDrug: z.unknown().optional().transform(stringOrEmpty),
  challengeDrugCustom: z.unknown().optional().transform(stringOrUndefined),
  outcome: z.unknown().optional().transform((value): LogFormData['outcome'] => (
    value === 'SUCCESS' || value === 'UNSUCCESS' ? value : null
  )),
  reactionTime: z.unknown().optional().transform(stringOrEmpty),
  symptoms: z.unknown().optional().transform((value) => (
    Array.isArray(value) ? value.map(s => String(s)) : []
  )),
  symptomsOther: z.unknown().optional().transform(stringOrEmpty),
  interventionType: z.unknown().optional().transform(stringOrEmpty),
  interventionOther: z.unknown().optional().transform(stringOrEmpty),
  plan: z.unknown().optional().transform(stringOrEmpty),
  nurseNotes: z.unknown().optional().transform(sanitizeNurseNotes),
  tryptase: z.unknown().optional().transform(sanitizeTryptase),
});

export const LogFormDataSchema = RawLogFormDataSchema.transform((data): LogFormData => ({
  id: data.id,
  timestamp: data.timestamp,
  mrn: data.mrn ?? '',
  firstName: data.firstName ?? '',
  lastName: data.lastName ?? '',
  visitDate: data.visitDate ?? '',
  controls: data.controls ?? {
    histamineSpt: '',
    salineSpt: '',
    salineIdt: '',
  },
  testPanel: data.testPanel ?? [],
  proceedToChallenge: Boolean(data.proceedToChallenge),
  challengeDrug: data.challengeDrug ?? '',
  challengeDrugCustom: data.challengeDrugCustom,
  outcome: data.outcome ?? null,
  reactionTime: data.reactionTime ?? '',
  symptoms: data.symptoms ?? [],
  symptomsOther: data.symptomsOther ?? '',
  interventionType: data.interventionType ?? '',
  interventionOther: data.interventionOther ?? '',
  plan: data.plan ?? '',
  nurseNotes: data.nurseNotes,
  tryptase: data.tryptase,
}));

export const parseLogFormData = (value: unknown): LogFormData => LogFormDataSchema.parse(value);

export const safeParseLogFormData = (value: unknown): LogFormData | null => {
  const result = LogFormDataSchema.safeParse(value);
  return result.success ? result.data : null;
};
