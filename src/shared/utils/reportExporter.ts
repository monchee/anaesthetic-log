import { LogFormData } from '@features/testing/types';
import { isSkinTestPositive } from './testingUtils';

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
