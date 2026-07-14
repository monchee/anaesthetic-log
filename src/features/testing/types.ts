export interface IDTStep {
  ratio: string;         // e.g. "1:1,000"
  concentration: string; // e.g. "0.01mg/mL"
}

export interface ChallengeStep {
  step: number;
  dose: string;
  volume: string;
  cumulative: string;
}

export interface DrugProtocol {
  drugName: string;
  category: string;
  testType: 'skin' | 'challenge' | 'control' | 'experimental';
  presentation: string;
  sptNeatConcentration: string;
  diluent: string;
  idtSteps: IDTStep[];
  challengeSteps: ChallengeStep[];
  protocolLabel: string;
}

export interface CustomDrugEntry {
  name: string;
  sptConcentration?: string;
  idtSteps?: IDTStep[];
  includeInChallenge?: boolean;
  fromRedcapOther?: boolean;
}

export interface DrugTestRow {
  id?: string;
  drugName: string;
  customName?: string;
  protocolIndex?: number;
  sptWheal: string;
  idtResults: string[];
  notes?: string;
  // Custom protocol fields — used when drugName === 'Other'
  customSptConcentration?: string;
  customIdtSteps?: IDTStep[];
  includeInChallenge?: boolean;
  // Legacy fields — read-only, kept for migration of old localStorage records
  idt100?: string;
  idt10?: string;
  idtNeat?: string;
}

export interface Controls {
  histamineSpt: string;
  salineSpt: string;
  salineIdt: string;
}

export enum TestOutcome {
  SUCCESS = 'SUCCESS',
  UNSUCCESS = 'UNSUCCESS'
}

export interface NurseNotes {
  preTesting?: string;
  duringTesting?: string;
  postTesting?: string;
  signedBy?: string;
}

export interface TryptaseValue {
  time: string;
  result: string;
}

export interface TryptaseData {
  obtained: boolean;
  significantElevation: boolean;
  values: TryptaseValue[];
}

export interface LogFormData {
  id?: string;
  timestamp?: string;
  mrn: string;
  firstName: string;
  lastName: string;
  dob?: string;
  visitDate: string;
  controls: Controls;
  testPanel: DrugTestRow[];
  proceedToChallenge: boolean;
  challengeDrug: string;
  challengeDrugCustom?: string;
  outcome: 'SUCCESS' | 'UNSUCCESS' | null;
  reactionTime: string;
  symptoms: string[];
  symptomsOther: string;
  interventionType: string;
  interventionOther: string;
  plan: string;
  nurseNotes?: NurseNotes;
  tryptase?: TryptaseData;
}

export interface DocumentsToChase {
  tryptases: boolean;
  anaestheticChart: boolean;
  other: boolean;
  otherText: string;
}

export interface TestingPlanData {
  selectedDrugs: string[];
  selectedProtocols: Record<string, number>;
  customDrugs: CustomDrugEntry[];
  notes: string;
  urgent: boolean;
  reactionDate: string;
  documentsToChase: DocumentsToChase;
}
