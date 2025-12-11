

export interface PatientHistory {
  date: string;
  grade: string;
  reactionSummary: string;
  symptoms: string[];
  treatment: string[];
  suspectedAgents: string[];
  tryptase?: string;
  procedure: string;
  anaesthetist: string; // Kept for legacy/completer support
  referringDoctor?: string;
  providerNumber?: string;
  referringEmail?: string;
  referringPhone?: string;
  hospital?: string;
  inductionTime?: string;
  reactionTime?: string;
  medications?: string[]; // Unified list of drugs with timings
  preInductionDrugs?: string[]; // Legacy: kept for mock data compatibility
  postInductionDrugs?: string[]; // Legacy: kept for mock data compatibility
  procedureOutcome?: string;
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dob: string;
  mrn: string;
  gender: string;
  city: string;
  history: PatientHistory;
}

export interface DrugTestRow {
  id?: string; // Unique ID for row, especially for multiple custom "Other" entries
  drugName: string;
  sptWheal: string;
  idt100: string;
  idt10: string;
  idtNeat: string;
  customName?: string;
  [key: string]: string | undefined; // Allow string indexing for form updates
}

export interface Controls {
  histamineSpt: string;
  salineSpt: string;
  salineIdt: string;
}

export interface LogFormData {
  id?: string;
  timestamp?: string;
  mrn: string;
  firstName: string;
  lastName: string;
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
}

export interface TestingPlanData {
  selectedDrugs: string[];
  customDrugs: string[];
  notes: string;
}

export type Screen = 'log' | 'summary' | 'patient-summary' | 'dashboard' | 'changelog' | 'testing' | 'print-plan';
