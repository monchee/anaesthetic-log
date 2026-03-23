import { LogFormData } from '@features/testing/types';
import { Patient } from '@/types';
import { isSkinTestPositive, getPositiveResults, getNegativeResults } from './testingUtils';
import { formatDate } from './dateUtils';

export function formatClinicalReportAsText(data: LogFormData): string {
  const lines: string[] = [];

  lines.push('ANAESTHETIC TESTING REPORT');
  lines.push('Clinical Immunology & Allergy — Royal Prince Alfred Hospital');
  lines.push('');
  lines.push(`Patient: ${data.firstName} ${data.lastName}`);
  lines.push(`MRN: ${data.mrn}`);
  lines.push(`Visit Date: ${data.visitDate ? new Date(data.visitDate).toLocaleDateString('en-AU') : 'Unknown'}`);
  lines.push('');

  // Controls
  if (data.controls) {
    lines.push('Controls (mm):');
    lines.push(`  Histamine SPT: ${data.controls.histamineSpt || '-'}`);
    lines.push(`  Saline SPT: ${data.controls.salineSpt || '-'}`);
    lines.push(`  Saline IDT: ${data.controls.salineIdt || '-'}`);
    lines.push('');
  }

  // Test Panel
  if (data.testPanel && data.testPanel.length > 0) {
    lines.push('Skin & Intradermal Testing:');
    lines.push('Drug | SPT | IDT 1:100 | IDT 1:10 | IDT Neat | Notes');
    lines.push('-'.repeat(70));
    data.testPanel.forEach(row => {
      const name = row.drugName === 'Other' ? (row.customName || 'Other') : row.drugName;
      const positive = isSkinTestPositive(row) ? ' *POSITIVE*' : '';
      const notes = row.notes ? ` | ${row.notes}` : '';
      lines.push(`${name} | ${row.sptWheal || '-'}mm | ${row.idt100 || '-'}mm | ${row.idt10 || '-'}mm | ${row.idtNeat || '-'}mm${notes}${positive}`);
    });
    lines.push('');
  }

  // Challenge
  if (data.proceedToChallenge) {
    const challengeName = data.challengeDrug === 'Other' ? (data.challengeDrugCustom || 'Other') : data.challengeDrug;
    lines.push('Drug Challenge:');
    lines.push(`  Drug: ${challengeName}`);
    lines.push(`  Outcome: ${data.outcome === 'SUCCESS' ? 'NEGATIVE (Safe)' : 'POSITIVE (Reaction)'}`);
    if (data.outcome === 'UNSUCCESS') {
      lines.push(`  Reaction Time: ${data.reactionTime} mins`);
      const symptoms = data.symptoms.map(s => s === 'Other' ? `Other (${data.symptomsOther})` : s).join(', ');
      lines.push(`  Symptoms: ${symptoms}`);
      const intervention = data.interventionType === 'Other' ? `Other: ${data.interventionOther}` : data.interventionType;
      lines.push(`  Intervention: ${intervention}`);
    }
    lines.push('');
  }

  // Plan
  if (data.plan) {
    lines.push('Assessment & Plan:');
    lines.push(data.plan);
    lines.push('');
  }

  lines.push(`Generated: ${new Date().toLocaleDateString('en-AU')}`);

  return lines.join('\n');
}

export function formatPatientHandoutAsText(data: LogFormData): string {
  const lines: string[] = [];
  const posResults: string[] = [];
  const negResults: string[] = [];

  const challengeName = data.challengeDrug === 'Other' ? (data.challengeDrugCustom || 'Other') : data.challengeDrug;

  if (data.proceedToChallenge && data.outcome === 'UNSUCCESS') posResults.push(challengeName);
  if (data.proceedToChallenge && data.outcome === 'SUCCESS') negResults.push(challengeName);

  (data.testPanel || []).forEach(t => {
    const drugName = t.drugName === 'Other' ? (t.customName || 'Other') : t.drugName;
    if (data.proceedToChallenge && drugName === challengeName) return;
    if (isSkinTestPositive(t)) posResults.push(drugName);
    else negResults.push(drugName);
  });

  lines.push('ALLERGY TESTING RESULTS — PATIENT INFORMATION HANDOUT');
  lines.push('');
  lines.push(`Patient: ${data.firstName} ${data.lastName}`);
  lines.push(`Date: ${data.visitDate ? new Date(data.visitDate).toLocaleDateString('en-AU') : 'Unknown'}`);
  lines.push('');

  if (posResults.length > 0) {
    lines.push('DRUGS TO AVOID:');
    posResults.forEach(d => lines.push(`  - ${d.toUpperCase()} (AVOID)`));
    lines.push('');
  }

  if (negResults.length > 0) {
    lines.push('DRUGS TOLERATED:');
    negResults.forEach(d => lines.push(`  - ${d} (Safe)`));
    lines.push('');
  }

  lines.push('Department of Clinical Immunology & Allergy');
  lines.push('Royal Prince Alfred Hospital');
  lines.push('Level 5, Gloucester House');
  lines.push('Phone: (02) 9515 8814');
  lines.push('Email: SLHD-RPA-ClinicalImmunology@health.nsw.gov.au');
  lines.push('');
  lines.push('Please provide this document to your anaesthetist before any future surgery.');

  return lines.join('\n');
}

// --- PowerchartLetter helpers ---

export function calculateMinutesAfterInduction(patient: Patient): string {
  const { inductionTime, reactionTime } = patient.history;
  if (!inductionTime || !reactionTime) return 'an unknown period';
  const [ih, im] = inductionTime.split(':').map(Number);
  const [rh, rm] = reactionTime.split(':').map(Number);
  if (isNaN(ih) || isNaN(im) || isNaN(rh) || isNaN(rm)) return 'an unknown period';
  const diff = (rh * 60 + rm) - (ih * 60 + im);
  if (diff <= 0) return 'an unknown period';
  return `${diff} minutes`;
}

export function formatSymptomsList(patient: Patient): string {
  const symptoms = patient.history.symptoms?.map(s => s.label) ?? [];
  if (symptoms.length === 0) return 'signs concerning for anaphylaxis';
  if (symptoms.length === 1) return symptoms[0].toLowerCase();
  return symptoms.slice(0, -1).map(s => s.toLowerCase()).join(', ') + ' and ' + symptoms[symptoms.length - 1].toLowerCase();
}

export function formatTreatmentList(patient: Patient): string {
  const treatments = patient.history.treatment ?? [];
  if (treatments.length === 0) return 'supportive measures';
  if (treatments.length === 1) return treatments[0].toLowerCase();
  return treatments.slice(0, -1).map(t => t.toLowerCase()).join(', ') + ' and ' + treatments[treatments.length - 1].toLowerCase();
}

export function getOutcomeText(patient: Patient): string {
  const outcome = patient.history.procedureOutcome?.toLowerCase() ?? '';
  if (outcome.includes('completed') || outcome === '2') return 'completed';
  if (outcome.includes('abandoned') || outcome.includes('adandoned') || outcome === '1') return 'abandoned';
  return 'completed/abandoned';
}

export function generateLetterText(data: LogFormData, patient: Patient | null): string {
  const posResults = getPositiveResults(data);
  const negResults = getNegativeResults(data);
  const lines: string[] = [];

  const fullName = `${data.firstName} ${data.lastName}`;
  const firstName = data.firstName;

  if (patient && patient.id !== 'manual') {
    const { history } = patient;
    const hospital = history.hospital || '[hospital]';
    const procedure = history.procedure || '[procedure]';
    const reactionDate = history.date ? formatDate(history.date) : '[date]';
    const minutesAfter = calculateMinutesAfterInduction(patient);
    const symptoms = formatSymptomsList(patient);
    const treatment = formatTreatmentList(patient);
    const outcome = getOutcomeText(patient);

    lines.push(`${fullName} presented to ${hospital} for a ${procedure.toLowerCase()} on the ${reactionDate}. Approximately ${minutesAfter} after induction, ${firstName} developed signs concerning for anaphylaxis. These were ${symptoms}. ${firstName} was treated with ${treatment} and the operation was ${outcome}.`);
    lines.push('');
  }

  const testingDate = data.visitDate ? formatDate(data.visitDate) : '[date]';
  lines.push(`${firstName} presented to the RPA ANZAAG Allergy Clinic on ${testingDate}, for Skin Prick (SPT) and Intradermal (IDT) allergy testing. The following agents were tested with results below:`);
  lines.push('');

  if (data.testPanel && data.testPanel.length > 0) {
    data.testPanel.forEach(row => {
      const drugName = row.drugName === 'Other' ? (row.customName || 'Other') : row.drugName;
      const results = [
        row.sptWheal ? `SPT ${row.sptWheal}mm` : null,
        row.idt100 ? `IDT 1:100 ${row.idt100}mm` : null,
        row.idt10 ? `IDT 1:10 ${row.idt10}mm` : null,
        row.idtNeat ? `IDT Neat ${row.idtNeat}mm` : null,
      ].filter(Boolean).join(', ');
      lines.push(`${drugName}: ${results || 'no results recorded'}`);
    });
    lines.push('');
  }

  lines.push('Results:');
  if (posResults.length > 0) {
    posResults.forEach(drug => lines.push(`${drug.toUpperCase()} — POSITIVE`));
  }
  if (negResults.length > 0) {
    negResults.forEach(drug => lines.push(`${drug} — Negative`));
  }
  lines.push('');

  lines.push('Recommendations:');
  if (posResults.length > 0) {
    lines.push(`Avoid ${posResults.map(d => d.toUpperCase()).join(', ')}`);
  }
  if (negResults.length > 0) {
    lines.push(`There was no evidence of sensitisation to ${negResults.join(', ')}`);
  }
  lines.push('');
  lines.push('Allergy MDT: Dr. D Zalcberg, Dr. A Stoyanov and CNC K. Wells.');

  return lines.join('\n');
}
