import { z } from 'zod';
import { Patient } from '../types';

const symptomSchema = z.object({
  label: z.string(),
  detail: z.string().optional(),
}).passthrough();

const tryptaseSchema = z.object({
  time: z.string().optional(),
  result: z.string(),
}).passthrough();

const documentsToChaseSchema = z.object({
  tryptases: z.boolean().optional(),
  anaestheticChart: z.boolean().optional(),
  other: z.boolean().optional(),
  otherText: z.string().optional(),
}).passthrough();

const patientHistorySchema = z.object({
  date: z.string(),
  grade: z.string(),
  reactionSummary: z.string(),
  comments: z.string().optional(),
  symptoms: z.array(symptomSchema),
  firstSymptom: z.string().optional(),
  predominantSymptom: z.string().optional(),
  treatment: z.array(z.string()),
  suspectedAgents: z.array(z.string()),
  tryptase: z.string().optional(),
  tryptases: z.array(tryptaseSchema).optional(),
  procedure: z.string(),
  anaesthetist: z.string(),
  referringDoctor: z.string().optional(),
  referringDoctorPosition: z.string().optional(),
  providerNumber: z.string().optional(),
  referringEmail: z.string().optional(),
  referringPhone: z.string().optional(),
  hospital: z.string().optional(),
  inductionTime: z.string().optional(),
  reactionTime: z.string().optional(),
  medications: z.array(z.string()).optional(),
  preInductionDrugs: z.array(z.string()).optional(),
  postInductionDrugs: z.array(z.string()).optional(),
  procedureOutcome: z.string().optional(),
  anaesthesiaType: z.array(z.string()).optional(),
  testingPlan: z.array(z.string()).optional(),
  testingPlanCustom: z.string().optional(),
  documentsToChase: documentsToChaseSchema.optional(),
}).passthrough();

const patientSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  dob: z.string(),
  mrn: z.string(),
  redcapId: z.string().optional(),
  gender: z.string(),
  city: z.string(),
  history: patientHistorySchema,
}).passthrough();

export interface PatientDbPayload {
  patients: Patient[];
  databaseDate: string;
  hasUploadedData: boolean;
}

export const PatientDbSchema = z.object({
  patients: z.array(patientSchema),
  databaseDate: z.string(),
  hasUploadedData: z.boolean(),
});

export const parsePatientDb = (value: unknown): PatientDbPayload => (
  PatientDbSchema.parse(value) as PatientDbPayload
);

export const safeParsePatientDb = (value: unknown): PatientDbPayload | null => {
  const result = PatientDbSchema.safeParse(value);
  return result.success ? result.data as PatientDbPayload : null;
};
