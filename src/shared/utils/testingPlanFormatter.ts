import { Patient, TestingPlanData } from '@shared/types';
import { getSkinProtocolsForDrug } from '@shared/data/drugMasterlist';
import { resolveSelectedProtocol } from './protocolResolver';

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
  lines.push(`REDCap ID:  ${patient.mrn}`);
  if (patient.redcapId && patient.redcapId !== patient.mrn) {
    lines.push(`REDCap Record ID (secondary): ${patient.redcapId}`);
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

  // Selected drugs grouped by category, with protocol details
  lines.push('REQUESTED TESTING PANEL');
  lines.push('-----------------------');
  let hasAnyDrug = false;
  for (const [category, drugs] of Object.entries(drugCategories)) {
    const active = (drugs as string[]).filter(d => selectedDrugs.includes(d));
    if (active.length > 0) {
      lines.push(`${category}:`);
      active.forEach(d => {
        const protocols = getSkinProtocolsForDrug(d);
        const resolution = resolveSelectedProtocol(protocols, data.selectedProtocols?.[d]);

        if (resolution.status === 'invalid') {
          lines.push(`  - ${d}`);
          lines.push('      ⚠ Protocol selection requires review');
          return;
        }

        if (resolution.status === 'empty') {
          lines.push(`  - ${d}`);
          return;
        }

        const protocol = resolution.protocol;
        lines.push(`  - ${d}${protocol.presentation ? ` (${protocol.presentation})` : ''}`);

        // Protocol label if present
        if (protocol.protocolLabel) {
          lines.push(`      Protocol: ${protocol.protocolLabel}`);
        }

        // SPT Neat Concentration & Diluent
        if (protocol.sptNeatConcentration || protocol.diluent) {
          const parts: string[] = [];
          if (protocol.sptNeatConcentration) parts.push(`SPT: ${protocol.sptNeatConcentration}`);
          if (protocol.diluent) parts.push(`Diluent: ${protocol.diluent}`);
          lines.push(`      ${parts.join(' | ')}`);
        }

        // IDT steps in source order with optional preparation
        if (protocol.idtSteps && protocol.idtSteps.length > 0) {
          const idtChain = protocol.idtSteps
            .map(s => {
              const conc = s.concentration ? ` (${s.concentration})` : '';
              const prep = s.preparation ? ` [${s.preparation}]` : '';
              return `${s.ratio}${conc}${prep}`;
            })
            .join(' → ');
          lines.push(`      IDT: ${idtChain}`);
        }

        // Under review note
        if (protocol.underReview) {
          lines.push(`      ⚠ Under review${protocol.reviewNote ? `: ${protocol.reviewNote}` : ''}`);
        }

        // Pharmacy verification warning
        if (protocol.needsPharmacyVerification) {
          lines.push('      ⚠ Confirm preparation with pharmacy');
        }
      });
      hasAnyDrug = true;
    }
  }
  const activeCustom = customDrugs.filter(e => selectedDrugs.includes(e.name));
  if (activeCustom.length > 0) {
    lines.push('Additional:');
    activeCustom.forEach(e => {
      const spt = e.sptConcentration ? ` | SPT: ${e.sptConcentration}` : '';
      const idt = e.idtSteps?.length
        ? ` | IDT: ${e.idtSteps
            .map(s => {
              const conc = s.concentration ? ` (${s.concentration})` : '';
              const prep = s.preparation ? ` [${s.preparation}]` : '';
              return `${s.ratio}${conc}${prep}`;
            })
            .filter(Boolean)
            .join(', ')}`
        : '';
      lines.push(`  - ${e.name}${spt}${idt}`);
    });
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
