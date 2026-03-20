import { Patient } from '@features/patients/types';
import { LogFormData } from '@features/testing/types';

interface DeidentifiedPatient {
  auditId: string;
  reactionDate: string;
  grade: string;
  reactionSummary: string;
  symptoms: string[];
  firstSymptom: string;
  predominantSymptom: string;
  treatment: string[];
  suspectedAgents: string[];
  tryptase: string;
  procedure: string;
  hospital: string;
  inductionTime: string;
  reactionTime: string;
  medications: string[];
  preInductionDrugs: string[];
  postInductionDrugs: string[];
  procedureOutcome: string;
  anaesthesiaType: string[];
}

interface DeidentifiedTestLog {
  auditId: string;
  visitDate: string;
  controls: {
    histamineSpt: string;
    salineSpt: string;
    salineIdt: string;
  };
  testPanel: Array<{
    drugName: string;
    sptWheal: string;
    idt100: string;
    idt10: string;
    idtNeat: string;
    notes: string;
  }>;
  proceedToChallenge: boolean;
  challengeDrug: string;
  outcome: string | null;
  reactionTime: string;
  symptoms: string[];
  interventionType: string;
  plan: string;
}

function generateAuditId(index: number): string {
  return `AUDIT-${String(index + 1).padStart(4, '0')}`;
}

export function deidentifyPatients(patients: Patient[]): DeidentifiedPatient[] {
  return patients.map((p, i) => ({
    auditId: generateAuditId(i),
    reactionDate: p.history.date || '',
    grade: p.history.grade || '',
    reactionSummary: p.history.reactionSummary || '',
    symptoms: p.history.symptoms?.map(s => s.label) ?? [],
    firstSymptom: p.history.firstSymptom || '',
    predominantSymptom: p.history.predominantSymptom || '',
    treatment: p.history.treatment ?? [],
    suspectedAgents: p.history.suspectedAgents ?? [],
    tryptase: p.history.tryptase || '',
    procedure: p.history.procedure || '',
    hospital: p.history.hospital || '',
    inductionTime: p.history.inductionTime || '',
    reactionTime: p.history.reactionTime || '',
    medications: p.history.medications ?? [],
    preInductionDrugs: p.history.preInductionDrugs ?? [],
    postInductionDrugs: p.history.postInductionDrugs ?? [],
    procedureOutcome: p.history.procedureOutcome || '',
    anaesthesiaType: p.history.anaesthesiaType ?? [],
  }));
}

export function deidentifyTestLogs(logs: LogFormData[]): DeidentifiedTestLog[] {
  return logs.map((log, i) => ({
    auditId: generateAuditId(i),
    visitDate: log.visitDate || '',
    controls: {
      histamineSpt: log.controls?.histamineSpt || '',
      salineSpt: log.controls?.salineSpt || '',
      salineIdt: log.controls?.salineIdt || '',
    },
    testPanel: (log.testPanel || []).map(row => ({
      drugName: row.drugName === 'Other' ? (row.customName || 'Other') : row.drugName,
      sptWheal: row.sptWheal || '',
      idt100: row.idt100 || '',
      idt10: row.idt10 || '',
      idtNeat: row.idtNeat || '',
      notes: row.notes || '',
    })),
    proceedToChallenge: log.proceedToChallenge,
    challengeDrug: log.challengeDrug || '',
    outcome: log.outcome,
    reactionTime: log.reactionTime || '',
    symptoms: log.symptoms || [],
    interventionType: log.interventionType || '',
    plan: log.plan || '',
  }));
}

export function exportDeidentifiedJSON(patients: Patient[], logs: LogFormData[]): string {
  const data = {
    exportDate: new Date().toISOString(),
    patientCount: patients.length,
    testLogCount: logs.length,
    patients: deidentifyPatients(patients),
    testLogs: deidentifyTestLogs(logs),
  };
  return JSON.stringify(data, null, 2);
}

export function exportDeidentifiedCSV(patients: Patient[]): string {
  const deidentified = deidentifyPatients(patients);
  const headers = [
    'Audit ID', 'Reaction Date', 'Grade', 'Reaction Summary',
    'Symptoms', 'First Symptom', 'Predominant Symptom',
    'Treatment', 'Suspected Agents', 'Tryptase',
    'Procedure', 'Hospital', 'Induction Time', 'Reaction Time',
    'Medications', 'Pre-Induction Drugs', 'Post-Induction Drugs',
    'Procedure Outcome', 'Anaesthesia Type',
  ];

  const escapeCSV = (val: string) => {
    if (val.includes(',') || val.includes('"') || val.includes('\n')) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  };

  const rows = deidentified.map(p => [
    p.auditId,
    p.reactionDate,
    p.grade,
    p.reactionSummary,
    p.symptoms.join('; '),
    p.firstSymptom,
    p.predominantSymptom,
    p.treatment.join('; '),
    p.suspectedAgents.join('; '),
    p.tryptase,
    p.procedure,
    p.hospital,
    p.inductionTime,
    p.reactionTime,
    p.medications.join('; '),
    p.preInductionDrugs.join('; '),
    p.postInductionDrugs.join('; '),
    p.procedureOutcome,
    p.anaesthesiaType.join('; '),
  ].map(escapeCSV).join(','));

  return [headers.join(','), ...rows].join('\n');
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
