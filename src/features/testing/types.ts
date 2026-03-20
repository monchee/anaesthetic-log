export interface DrugTestRow {
  id?: string;
  drugName: string;
  sptWheal: string;
  idt100: string;
  idt10: string;
  idtNeat: string;
  customName?: string;
  notes?: string;
  [key: string]: string | undefined;
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

export interface DocumentsToChase {
  tryptases: boolean;
  anaestheticChart: boolean;
  other: boolean;
  otherText: string;
}

export interface TestingPlanData {
  selectedDrugs: string[];
  customDrugs: string[];
  notes: string;
  urgent: boolean;
  reactionDate: string;
  documentsToChase: DocumentsToChase;
}
