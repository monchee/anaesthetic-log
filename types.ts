

export interface PatientHistory {
  date: string;
  grade: string;
  reactionSummary: string;
  symptoms: string[];
  treatment: string[];
  suspectedAgents: string[];
  tryptase?: string;
  procedure: string;
  anaesthetist: string;
  hospital?: string;
  inductionTime?: string;
  reactionTime?: string;
  preInductionDrugs?: string[];
  procedureOutcome?: string; // New field for "Completed" vs "Abandoned"
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

export type Screen = 'log' | 'summary' | 'patient-summary' | 'dashboard' | 'changelog' | 'testing';