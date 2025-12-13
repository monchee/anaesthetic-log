
export interface PatientHistory {
  date: string;
  grade: string;
  reactionSummary: string;
  comments?: string; // Additional comments from CSV
  symptoms: Array<{ label: string; detail?: string }>;
  firstSymptom?: string;
  predominantSymptom?: string;
  treatment: string[];
  suspectedAgents: string[];
  tryptase?: string;
  procedure: string;
  anaesthetist: string; // Kept for legacy/completer support
  referringDoctor?: string;
  referringDoctorPosition?: string; // Anaesthetic Consultant, Trainee, GP, Other
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
  anaesthesiaType?: string[]; // New field for General, Regional, Local, IV Sedation
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

export enum TestOutcome {
  SUCCESS = 'SUCCESS',
  UNSUCCESS = 'UNSUCCESS'
}

export enum Screen {
  LOG = 'log',
  SUMMARY = 'summary',
  PATIENT_SUMMARY = 'patient-summary',
  DASHBOARD = 'dashboard',
  CHANGELOG = 'changelog',
  TESTING = 'testing',
  PRINT_PLAN = 'print-plan'
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

export interface CategoryTheme {
  activeBg: string;
  activeRing: string;
  headerText: string;
  headerBorder: string;
  btnSelected: string;
  btnHover: string;
  pulse: string;
  rowBorder: string;
  actionText: string;
}
