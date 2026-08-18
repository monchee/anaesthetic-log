import { LogFormData, TryptaseData } from '@features/testing/types';
import { Patient } from '@shared/types';
import { isSkinTestPositive, getPositiveResults, getNegativeResults, getCrossSensitizationNotes, getCrossSensitizedDrugs, buildRecommendations } from './testingUtils';
import { formatDate } from './dateUtils';

export function formatTryptaseSentence(tryptase?: TryptaseData): string {
  if (!tryptase?.obtained) {
    return tryptase?.hadReferralData === true
      ? 'Serial serum tryptase results are pending confirmation.'
      : 'Serial serum tryptase samples were not obtained.';
  }
  const formatted = tryptase.values
    .filter(v => v.result)
    .map((v, i) => `T${i + 1}${v.time ? ` (${v.time})` : ''}: ${v.result}`)
    .join(', ');
  if (tryptase.significantElevation) {
    return `Serial serum tryptase samples revealed clinically significant dynamic tryptase elevation${formatted ? ` (${formatted})` : ''}.`;
  }
  return `Serial serum tryptase samples were obtained and were not elevated${formatted ? ` (${formatted})` : ''}.`;
}

export function formatClinicalReportAsText(data: LogFormData, redact?: (value: string) => string): string {
  const lines: string[] = [];

  lines.push('ANAESTHETIC TESTING REPORT');
  lines.push('Clinical Immunology & Allergy — Royal Prince Alfred Hospital');
  lines.push('');
  lines.push(`Patient: ${redact ? redact(`${data.firstName} ${data.lastName}`) : `${data.firstName} ${data.lastName}`}`);
  lines.push(`MRN: ${redact ? redact(data.mrn) : data.mrn}`);
  lines.push(`DOB: ${data.dob ? (redact ? redact(formatDate(data.dob)) : formatDate(data.dob)) : 'Unknown'}`);
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

  // Tryptase
  if (data.tryptase) {
    lines.push('Tryptase:');
    lines.push(`  ${formatTryptaseSentence(data.tryptase)}`);
    lines.push('');
  }

  // Test Panel
  if (data.testPanel && data.testPanel.length > 0) {
    lines.push('Skin & Intradermal Testing:');
    data.testPanel.forEach((row, index) => {
      if (index > 0) {
        lines.push('');
      }
      const name = row.drugName === 'Other' ? (row.customName || 'Other') : row.drugName;
      const result = isSkinTestPositive(row) ? 'Positive' : 'Negative';
      const spt = row.sptWheal && row.sptWheal !== '-'
        ? (row.sptWheal.endsWith('mm') ? row.sptWheal : `${row.sptWheal}mm`)
        : '-';

      lines.push(`  Drug: ${name}`);
      lines.push(`  Result: ${result}`);
      lines.push(`  SPT: ${spt}`);

      const idtLines: string[] = [];
      if (row.idtResults && row.idtResults.length > 0) {
        row.idtResults.forEach((v, idx) => {
          if (v !== undefined && v !== '' && v !== '-') {
            const val = v.endsWith('mm') ? v : `${v}mm`;
            idtLines.push(`IDT ${idx + 1}: ${val}`);
          }
        });
      } else {
        if (row.idt100 && row.idt100 !== '-') {
          const val = row.idt100.endsWith('mm') ? row.idt100 : `${row.idt100}mm`;
          idtLines.push(`1:100: ${val}`);
        }
        if (row.idt10 && row.idt10 !== '-') {
          const val = row.idt10.endsWith('mm') ? row.idt10 : `${row.idt10}mm`;
          idtLines.push(`1:10: ${val}`);
        }
        if (row.idtNeat && row.idtNeat !== '-') {
          const val = row.idtNeat.endsWith('mm') ? row.idtNeat : `${row.idtNeat}mm`;
          idtLines.push(`Neat: ${val}`);
        }
      }

      if (idtLines.length > 0) {
        lines.push('  IDT:');
        idtLines.forEach(line => lines.push(`    ${line}`));
      } else {
        lines.push('  IDT: -');
      }

      if (row.notes && row.notes.trim()) {
        lines.push(`  Notes: ${row.notes.trim()}`);
      }
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

  // Cross-sensitization (3C)
  const posResults = getPositiveResults(data);
  const crossNotes = getCrossSensitizationNotes(posResults);
  const crossSensitized = getCrossSensitizedDrugs(posResults);
  if (crossNotes.length > 0) {
    crossNotes.forEach(n => lines.push(n));
    lines.push('');
  }

  // Recommendations (3D)
  const { avoidList, bullets, noAllergyMessage } = buildRecommendations(posResults, crossSensitized);
  lines.push('Recommendations:');
  if (noAllergyMessage) {
    lines.push(noAllergyMessage);
  } else {
    avoidList.forEach(d => lines.push(`AVOID ${d.toUpperCase()}`));
    bullets.forEach(b => lines.push(`- ${b}`));
  }
  lines.push('');

  // Nurse Notes
  const nn = data.nurseNotes;
  if (nn && (nn.preTesting || nn.duringTesting || nn.postTesting || nn.signedBy)) {
    lines.push('Nursing Notes:');
    if (nn.preTesting) { lines.push('  Pre-Testing:'); lines.push(`  ${nn.preTesting}`); }
    if (nn.duringTesting) { lines.push('  During Testing:'); lines.push(`  ${nn.duringTesting}`); }
    if (nn.postTesting) { lines.push('  Post-Testing / Discharge:'); lines.push(`  ${nn.postTesting}`); }
    if (nn.signedBy) lines.push(`  Signed: ${nn.signedBy} (RN)`);
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

export function formatPatientHandoutAsText(data: LogFormData, redact?: (value: string) => string): string {
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
  lines.push(`Patient: ${redact ? redact(`${data.firstName} ${data.lastName}`) : `${data.firstName} ${data.lastName}`}`);
  lines.push(`DOB: ${data.dob ? (redact ? redact(formatDate(data.dob)) : formatDate(data.dob)) : 'Unknown'}`);
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
  lines.push('Phone: (02) 9515 7586');
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

export function generateLetterText(data: LogFormData, patient: Patient | null, redact?: (value: string) => string): string {
  const posResults = getPositiveResults(data);
  const negResults = getNegativeResults(data);
  const crossNotes = getCrossSensitizationNotes(posResults);
  const crossSensitized = getCrossSensitizedDrugs(posResults);
  const { avoidList, bullets, noAllergyMessage } = buildRecommendations(posResults, crossSensitized);
  const lines: string[] = [];

  const fullName = redact ? redact(`${data.firstName} ${data.lastName}`) : `${data.firstName} ${data.lastName}`;
  const firstName = redact ? redact(data.firstName) : data.firstName;

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

  // Tryptase sentence (3A) — always present; defaults to "not obtained"
  lines.push(formatTryptaseSentence(data.tryptase));
  lines.push('');

  const testingDate = data.visitDate ? formatDate(data.visitDate) : '[date]';
  lines.push(`${firstName} presented to the RPA ANZAAG Allergy Clinic on ${testingDate}, for Skin Prick (SPT) and Intradermal (IDT) allergy testing. The following agents were tested:`);
  lines.push('');

  // Results — drug names only, no IDT measurements (3B)
  lines.push('Results:');
  if (posResults.length > 0) {
    posResults.forEach(drug => lines.push(`${drug.toUpperCase()}: Positive`));
  }
  if (negResults.length > 0) {
    negResults.forEach(drug => lines.push(`${drug}: Negative`));
  }
  lines.push('');

  // Cross-sensitization notes (3C)
  if (crossNotes.length > 0) {
    crossNotes.forEach(n => lines.push(n));
    lines.push('');
  }

  // IV challenge (3E)
  if (data.proceedToChallenge) {
    const challengeName = data.challengeDrug === 'Other' ? (data.challengeDrugCustom || 'Other') : data.challengeDrug;
    if (data.outcome === 'SUCCESS') {
      lines.push(`Drug challenge with ${challengeName}: tolerated.`);
    } else if (data.outcome === 'UNSUCCESS') {
      const symptoms = data.symptoms.map(s => s === 'Other' ? `Other (${data.symptomsOther})` : s).join(', ');
      const intervention = data.interventionType === 'Other' ? `Other: ${data.interventionOther}` : data.interventionType;
      lines.push(`Drug challenge with ${challengeName} - reaction at ${data.reactionTime} minutes; symptoms: ${symptoms}; treated with: ${intervention}.`);
    }
    lines.push('');
  }

  // Recommendations (3D)
  lines.push('Recommendations:');
  if (noAllergyMessage) {
    lines.push(noAllergyMessage);
  } else {
    avoidList.forEach(d => lines.push(`AVOID ${d.toUpperCase()}`));
    bullets.forEach(b => lines.push(`- ${b}`));
  }
  lines.push('');
  if (patient?.history?.referringEmail) {
    lines.push(`Referrer email: ${patient.history.referringEmail}`);
  }
  lines.push('Allergy MDT: Dr. D Zalcberg, Dr. A Stoyanov and CNC K. Wells.');

  return lines.join('\n');
}
