export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dob: string;
  mrn: string;
  redcapId?: string;
  gender: string;
  city: string;
  history: PatientHistory;
}

export interface PatientHistory {
  date: string;
  grade: string;
  reactionSummary: string;
  comments?: string;
  symptoms: Array<{ label: string; detail?: string }>;
  firstSymptom?: string;
  predominantSymptom?: string;
  treatment: string[];
  suspectedAgents: string[];
  tryptase?: string;
  tryptases?: Array<{ time?: string; result: string }>;
  procedure: string;
  anaesthetist: string;
  referringDoctor?: string;
  referringDoctorPosition?: string;
  providerNumber?: string;
  referringEmail?: string;
  referringPhone?: string;
  hospital?: string;
  inductionTime?: string;
  reactionTime?: string;
  medications?: string[];
  preInductionDrugs?: string[];
  postInductionDrugs?: string[];
  procedureOutcome?: string;
  anaesthesiaType?: string[];
  testingPlan?: string[];
  testingPlanCustom?: string;
  documentsToChase?: { tryptases?: boolean; anaestheticChart?: boolean; other?: boolean; otherText?: string };
  uploadedDocs?: {
    anaestheticChart?: boolean;
    resusChart?: boolean;
    tryptaseResults?: boolean;
    dischargeLetter?: boolean;
    other?: boolean;
  };
  conditions?: string[];
  highRiskMeds?: string[];
  differentialDiagnosis?: string;
}
