import { Patient, TestingPlanData } from '@/types';

export function formatTestingPlanAsText(
  patient: Patient,
  data: TestingPlanData,
  drugCategories: Record<string, string[]>
): string {
  const { selectedDrugs, customDrugs, notes, urgent, reactionDate, documentsToChase } = data;
  const lines: string[] = [];

  lines.push('ANAESTHETIC ALLERGY TESTING REQUEST');
  lines.push('Department of Clinical Immunology & Allergy');
  lines.push('Royal Prince Alfred Hospital');
  lines.push('');

  if (urgent) {
    lines.push('*** URGENT — PRIORITY TESTING REQUIRED ***');
    lines.push('');
  }

  lines.push('PATIENT DETAILS');
  lines.push('---------------');
  lines.push(`Name:       ${patient.firstName} ${patient.lastName}`);
  lines.push(`MRN:        ${patient.mrn}`);
  if (patient.redcapId && patient.redcapId !== patient.mrn) {
    lines.push(`REDCap ID:  ${patient.redcapId}`);
  }
  lines.push(`DOB:        ${patient.dob ? new Date(patient.dob).toLocaleDateString('en-AU') : 'Unknown'}`);
  lines.push(`Gender:     ${patient.gender ?? 'Unknown'}`);
  if (reactionDate) {
    lines.push(`Date of Reaction: ${new Date(reactionDate).toLocaleDateString('en-AU')}`);
  }
  lines.push('');

  // Documents to chase
  const docsNeeded: string[] = [];
  if (documentsToChase?.tryptases) docsNeeded.push('Tryptases');
  if (documentsToChase?.anaestheticChart) docsNeeded.push('Anaesthetic Chart');
  if (documentsToChase?.other) {
    docsNeeded.push(documentsToChase.otherText ? `Other: ${documentsToChase.otherText}` : 'Other');
  }
  if (docsNeeded.length > 0) {
    lines.push('DOCUMENTS TO CHASE');
    lines.push('------------------');
    docsNeeded.forEach(d => lines.push(`- ${d}`));
    lines.push('');
  }

  // Selected drugs grouped by category
  lines.push('REQUESTED TESTING PANEL');
  lines.push('-----------------------');
  let hasAnyDrug = false;
  for (const [category, drugs] of Object.entries(drugCategories)) {
    const active = (drugs as string[]).filter(d => selectedDrugs.includes(d));
    if (active.length > 0) {
      lines.push(`${category}:`);
      active.forEach(d => lines.push(`  - ${d}`));
      hasAnyDrug = true;
    }
  }
  // Custom drugs
  const activeCustom = customDrugs.filter(d => selectedDrugs.includes(d));
  if (activeCustom.length > 0) {
    lines.push('Additional:');
    activeCustom.forEach(d => lines.push(`  - ${d}`));
    hasAnyDrug = true;
  }
  if (!hasAnyDrug) {
    lines.push('No drugs selected.');
  }
  lines.push('');

  if (notes) {
    lines.push('CLINICAL NOTES');
    lines.push('--------------');
    lines.push(notes);
    lines.push('');
  }

  lines.push(`Request Date: ${new Date().toLocaleDateString('en-AU')}`);

  return lines.join('\n');
}
