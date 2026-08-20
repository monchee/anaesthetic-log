import type { DrugProtocol } from '@features/testing/types';
import { GENERATED_PROTOCOLS } from './drugMasterlist.generated';
import { DREAM_ONLY_PROTOCOLS } from './dreamOnlyProtocols';

export { DREAM_ONLY_PROTOCOLS };

function findGenerated(
  drugName: string,
  testType: 'skin' | 'challenge' | 'control' | 'experimental',
  protocolLabel?: string
): DrugProtocol {
  const match = GENERATED_PROTOCOLS.find(
    (p) =>
      p.drugName === drugName &&
      p.testType === testType &&
      (!protocolLabel || p.protocolLabel === protocolLabel)
  );
  if (!match) {
    throw new Error(`Missing generated protocol for ${drugName} (${testType}${protocolLabel ? ` - ${protocolLabel}` : ''})`);
  }
  return match;
}

/**
 * Complete drug masterlist for allergy testing and challenges.
 * Combines generated protocols from SCRATCH (protocols.snapshot.json) with
 * hand-maintained protocols for drugs not yet migrated to SCRATCH.
 *
 * CRITICAL: The array order is strictly preserved to maintain backwards compatibility
 * with saved plans that reference protocolIndex.
 */
export const DRUG_MASTERLIST: DrugProtocol[] = [
  // ── MUSCLE RELAXANTS (from SCRATCH snapshot) ────────────────────────────────
  findGenerated('Cis-atracurium', 'skin'),
  findGenerated('Rocuronium', 'skin'),
  findGenerated('Pancuronium', 'skin'),
  findGenerated('Vecuronium', 'skin'),
  findGenerated('Suxamethonium', 'skin'),

  // ── REVERSAL AGENTS & PENICILLINS (DREAM-only) ──────────────────────────────
  ...DREAM_ONLY_PROTOCOLS.slice(0, 17),

  // ── CEPHALOSPORINS: Cefazolin skin (from SCRATCH snapshot) ──────────────────
  findGenerated('Cefazolin', 'skin'),

  // ── REST OF DRUGS (DREAM-only) ──────────────────────────────────────────────
  ...DREAM_ONLY_PROTOCOLS.slice(17, 100),

  // ── CEFAZOLIN CHALLENGE (from SCRATCH snapshot) ─────────────────────────────
  findGenerated('Cefazolin', 'challenge'),

  // ── REMAINING CHALLENGES (DREAM-only) ───────────────────────────────────────
  ...DREAM_ONLY_PROTOCOLS.slice(100),
];

// ── Category ordering ──────────────────────────────────────────────────────
export const MASTERLIST_CATEGORIES: string[] = [
  'Muscle Relaxants',
  'Reversal Agents',
  'Penicillins',
  'Cephalosporins',
  'Hypnotics',
  'Local Anaesthetics',
  'Opioids',
  'Antiseptics',
  'Proton Pump Inhibitors',
  'Others',
];

// ── Helpers ────────────────────────────────────────────────────────────────

export function getProtocolsForDrug(drugName: string): DrugProtocol[] {
  return DRUG_MASTERLIST.filter((p) => p.drugName === drugName);
}

export function getSkinProtocolsForDrug(drugName: string): DrugProtocol[] {
  return DRUG_MASTERLIST.filter(
    (p) => p.drugName === drugName && (p.testType === 'skin' || p.testType === 'control' || p.testType === 'experimental')
  );
}

/**
 * Returns unique drug names per category for the SPT/IDT selection panel.
 * Challenge-only drugs are excluded.
 */
export function getDrugsByCategory(): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  for (const protocol of DRUG_MASTERLIST) {
    if (protocol.testType === 'challenge') continue;
    const { category, drugName } = protocol;
    if (!result[category]) result[category] = [];
    if (!result[category].includes(drugName)) {
      result[category].push(drugName);
    }
  }
  // Sort drugs alphabetically within each category
  for (const cat of Object.keys(result)) {
    result[cat].sort();
  }
  return result;
}

/**
 * Returns unique drug names with challenge protocols, grouped by category.
 * Used by TestingPlanGenerator for challenge section.
 */
export function getChallengeDrugsByCategory(): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  for (const protocol of DRUG_MASTERLIST) {
    if (protocol.testType !== 'challenge') continue;
    const { category, drugName } = protocol;
    if (!result[category]) result[category] = [];
    if (!result[category].includes(drugName)) {
      result[category].push(drugName);
    }
  }
  return result;
}
