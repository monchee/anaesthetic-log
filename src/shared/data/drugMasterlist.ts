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

function findDreamOnly(
  drugName: string,
  testType: 'skin' | 'challenge' | 'control' | 'experimental',
  protocolLabel?: string
): DrugProtocol {
  const match = DREAM_ONLY_PROTOCOLS.find(
    (p) =>
      p.drugName === drugName &&
      p.testType === testType &&
      (!protocolLabel || p.protocolLabel === protocolLabel)
  );
  if (!match) {
    throw new Error(`Missing DREAM-only protocol for ${drugName} (${testType}${protocolLabel ? ` - ${protocolLabel}` : ''})`);
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
  // [0] Cis-atracurium (skin, IV)
  findGenerated("Cis-atracurium", "skin", "IV"),
  // [1] Rocuronium (skin, IV)
  findGenerated("Rocuronium", "skin", "IV"),
  // [2] Pancuronium (skin, IV)
  findGenerated("Pancuronium", "skin", "IV"),
  // [3] Vecuronium (skin, IV)
  findGenerated("Vecuronium", "skin", "IV"),
  // [4] Suxamethonium (skin, IV)
  findGenerated("Suxamethonium", "skin", "IV"),
  // [5] Sugammadex (Alone) (skin, Alone)
  findGenerated("Sugammadex (Alone)", "skin", "Alone"),
  // [6] Sugammadex (+ Rocuronium) (skin, + Rocuronium)
  findDreamOnly("Sugammadex (+ Rocuronium)", "skin", "+ Rocuronium"),
  // [7] Penicillin Major (skin, PPL)
  findGenerated("Penicillin Major", "skin", "PPL"),
  // [8] Penicillin Minor (skin, MD)
  findGenerated("Penicillin Minor", "skin", "MD"),
  // [9] Ampicillin (skin, Neat SPT)
  findGenerated("Ampicillin", "skin", "Neat SPT"),
  // [10] Ampicillin (skin, 1:5 SPT)
  findGenerated("Ampicillin", "skin", "1:5 SPT"),
  // [11] Ampicillin (control, Control)
  findGenerated("Ampicillin", "control", "Control"),
  // [12] Amoxycillin (skin, Neat SPT)
  findGenerated("Amoxycillin", "skin", "Neat SPT"),
  // [13] Amoxycillin (skin, 1:5 SPT)
  findGenerated("Amoxycillin", "skin", "1:5 SPT"),
  // [14] Benzylpenicillin (skin, 1:1,000 start)
  findGenerated("Benzylpenicillin", "skin", "1:1,000 start"),
  // [15] Benzylpenicillin (skin, 1:100 start)
  findGenerated("Benzylpenicillin", "skin", "1:100 start"),
  // [16] Benzylpenicillin (control, Control)
  findGenerated("Benzylpenicillin", "control", "Control"),
  // [17] Augmentin (skin, 1:1,000 start)
  findGenerated("Augmentin", "skin", "1:1,000 start"),
  // [18] Augmentin (skin, 1:100 start)
  findGenerated("Augmentin", "skin", "1:100 start"),
  // [19] Cephalexin (skin, IV)
  findDreamOnly("Cephalexin", "skin", "IV"),
  // [20] Tazocin (skin, IV)
  findGenerated("Tazocin", "skin", "IV"),
  // [21] Methoxybenzylpenicillin (skin)
  findDreamOnly("Methoxybenzylpenicillin", "skin"),
  // [22] Cefazolin (skin, IV)
  findGenerated("Cefazolin", "skin", "IV"),
  // [23] Cefepime (skin, IV)
  findGenerated("Cefepime", "skin", "IV"),
  // [24] Cefotaxime (skin, IV)
  findGenerated("Cefotaxime", "skin", "IV"),
  // [25] Ceftazidime (skin, IV)
  findGenerated("Ceftazidime", "skin", "IV"),
  // [26] Ceftriaxone (skin, IV)
  findGenerated("Ceftriaxone", "skin", "IV"),
  // [27] Cefuroxime (skin, IV)
  findGenerated("Cefuroxime", "skin", "IV"),
  // [28] Midazolam (skin, IV)
  findGenerated("Midazolam", "skin", "IV"),
  // [29] Propofol (skin, IV)
  findGenerated("Propofol", "skin", "IV"),
  // [30] Ketamine (skin, 1:1,000 start)
  findGenerated("Ketamine", "skin", "1:1,000 start"),
  // [31] Ketamine (skin, 1:100 start)
  findGenerated("Ketamine", "skin", "1:100 start"),
  // [32] Thiopental (skin, 1:1,000 start)
  findGenerated("Thiopental", "skin", "1:1,000 start"),
  // [33] Thiopental (skin, 1:100 start)
  findGenerated("Thiopental", "skin", "1:100 start"),
  // [34] Lignocaine (skin, IV)
  findDreamOnly("Lignocaine", "skin", "IV"),
  // [35] Mepivacaine (skin, Epidural)
  findGenerated("Mepivacaine", "skin", "Epidural"),
  // [36] Bupivacaine (skin, Epidural)
  findGenerated("Bupivacaine", "skin", "Epidural"),
  // [37] Ropivacaine (skin, Epidural Protocol 1)
  findGenerated("Ropivacaine", "skin", "Epidural Protocol 1"),
  // [38] Ropivacaine (skin, Epidural Protocol 2)
  findGenerated("Ropivacaine", "skin", "Epidural Protocol 2"),
  // [39] Alfentanil (skin, IV)
  findGenerated("Alfentanil", "skin", "IV"),
  // [40] Fentanyl (skin, IV)
  findGenerated("Fentanyl", "skin", "IV"),
  // [41] Morphine (skin, 1:1,000 start)
  findGenerated("Morphine", "skin", "1:1,000 start"),
  // [42] Morphine (skin, 1:100 start)
  findGenerated("Morphine", "skin", "1:100 start"),
  // [43] Remifentanil (skin, 1:1,000 start)
  findGenerated("Remifentanil", "skin", "1:1,000 start"),
  // [44] Remifentanil (skin, 1:100 start)
  findGenerated("Remifentanil", "skin", "1:100 start"),
  // [45] Oxycodone (skin, IV)
  findGenerated("Oxycodone", "skin", "IV"),
  // [46] Chlorhexidine (skin, 0.02%)
  findGenerated("Chlorhexidine", "skin", "0.02%"),
  // [47] Povidone Iodine (skin, 1:1,000 start)
  findGenerated("Povidone Iodine", "skin", "1:1,000 start"),
  // [48] Povidone Iodine (skin, 1:100 start)
  findGenerated("Povidone Iodine", "skin", "1:100 start"),
  // [49] Esomeprazole (skin)
  findGenerated("Esomeprazole", "skin"),
  // [50] Lansoprazole (skin)
  findGenerated("Lansoprazole", "skin"),
  // [51] Omeprazole (skin)
  findGenerated("Omeprazole", "skin"),
  // [52] Pantoprazole (skin, IV)
  findGenerated("Pantoprazole", "skin", "IV"),
  // [53] Rabeprazole (skin)
  findGenerated("Rabeprazole", "skin"),
  // [54] Actrapid (Insulin) (skin, S/C)
  findGenerated("Actrapid (Insulin)", "skin", "S/C"),
  // [55] Azithromycin (skin, IV)
  findGenerated("Azithromycin", "skin", "IV"),
  // [56] Betamethasone (experimental, IV)
  findGenerated("Betamethasone", "experimental", "IV"),
  // [57] Cefuroxime Suspension (skin, Suspension)
  findDreamOnly("Cefuroxime Suspension", "skin", "Suspension"),
  // [58] Ciprofloxacin (skin, IV)
  findDreamOnly("Ciprofloxacin", "skin", "IV"),
  // [59] Clindamycin (skin, IV)
  findGenerated("Clindamycin", "skin", "IV"),
  // [60] Dalteparin (skin, SC)
  findGenerated("Dalteparin", "skin", "SC"),
  // [61] Dexamethasone (skin, IV)
  findGenerated("Dexamethasone", "skin", "IV"),
  // [62] Doxycycline (skin, 1:1,000 start)
  findDreamOnly("Doxycycline", "skin", "1:1,000 start"),
  // [63] Doxycycline (skin, 1:100 start)
  findDreamOnly("Doxycycline", "skin", "1:100 start"),
  // [64] Droperidol (skin, IV)
  findGenerated("Droperidol", "skin", "IV"),
  // [65] Enoxaparin (skin, SC)
  findGenerated("Enoxaparin", "skin", "SC"),
  // [66] Fluconazole (skin, IV)
  findGenerated("Fluconazole", "skin", "IV"),
  // [67] Glycopyrronium (experimental)
  findGenerated("Glycopyrronium", "experimental"),
  // [68] Granisetron (skin, IV)
  findGenerated("Granisetron", "skin", "IV"),
  // [69] Heparin (skin, SC)
  findGenerated("Heparin", "skin", "SC"),
  // [70] Humulin NPH (Insulin) (skin, S/C)
  findGenerated("Humulin NPH (Insulin)", "skin", "S/C"),
  // [71] Humulin R (Insulin) (skin, S/C)
  findGenerated("Humulin R (Insulin)", "skin", "S/C"),
  // [72] Hydrocortisone (experimental, IV)
  findGenerated("Hydrocortisone", "experimental", "IV"),
  // [73] Latex (skin)
  findGenerated("Latex", "skin"),
  // [74] Levofloxacin (skin, Tablet)
  findGenerated("Levofloxacin", "skin", "Tablet"),
  // [75] Levonorgestrel (skin, Oral)
  findGenerated("Levonorgestrel", "skin", "Oral"),
  // [76] Medroxyprogesterone (skin, Inj)
  findGenerated("Medroxyprogesterone", "skin", "Inj"),
  // [77] Metacresol (skin, 1:1,000 start)
  findGenerated("Metacresol", "skin", "1:1,000 start"),
  // [78] Metacresol (skin, 1:100 start)
  findGenerated("Metacresol", "skin", "1:100 start"),
  // [79] Methylprednisolone (experimental, IV)
  findGenerated("Methylprednisolone", "experimental", "IV"),
  // [80] Metoclopramide (skin, IV)
  findGenerated("Metoclopramide", "skin", "IV"),
  // [81] Metronidazole (skin, IV)
  findGenerated("Metronidazole", "skin", "IV"),
  // [82] Neostigmine (experimental, Inj)
  findGenerated("Neostigmine", "experimental", "Inj"),
  // [83] Novorapid (Insulin) (skin, S/C)
  findGenerated("Novorapid (Insulin)", "skin", "S/C"),
  // [84] Omnipaque (skin, IV Contrast)
  findGenerated("Omnipaque", "skin", "IV Contrast"),
  // [85] Ondansetron (skin, IV)
  findGenerated("Ondansetron", "skin", "IV"),
  // [86] Optisulin (Insulin) (skin, S/C)
  findGenerated("Optisulin (Insulin)", "skin", "S/C"),
  // [87] Paracetamol (skin, IV)
  findGenerated("Paracetamol", "skin", "IV"),
  // [88] Parecoxib (skin, IV)
  findGenerated("Parecoxib", "skin", "IV"),
  // [89] Patent Blue (skin, SC)
  findGenerated("Patent Blue", "skin", "SC"),
  // [90] Protamine (skin, IV)
  findGenerated("Protamine", "skin", "IV"),
  // [91] Protaphane (Insulin) (skin, S/C)
  findGenerated("Protaphane (Insulin)", "skin", "S/C"),
  // [92] Tranexamic Acid (skin, IV)
  findGenerated("Tranexamic Acid", "skin", "IV"),
  // [93] Tramadol (experimental, IV)
  findGenerated("Tramadol", "experimental", "IV"),
  // [94] Triamcinolone (experimental, Inj)
  findGenerated("Triamcinolone", "experimental", "Inj"),
  // [95] Ultravist (skin, IV Contrast)
  findDreamOnly("Ultravist", "skin", "IV Contrast"),
  // [96] Ultravist (control, Control)
  findDreamOnly("Ultravist", "control", "Control"),
  // [97] Urografin (skin, IV Contrast)
  findGenerated("Urografin", "skin", "IV Contrast"),
  // [98] Vancomycin (skin, IV)
  findGenerated("Vancomycin", "skin", "IV"),
  // [99] Visipaque (skin, IV Contrast)
  findGenerated("Visipaque", "skin", "IV Contrast"),
  // [100] Xylocaine (skin, IV)
  findGenerated("Xylocaine", "skin", "IV"),
  // [101] Methylene Blue (skin)
  findDreamOnly("Methylene Blue", "skin"),
  // [102] IV Contrast (skin)
  findDreamOnly("IV Contrast", "skin"),
  // [103] Atropine (skin)
  findDreamOnly("Atropine", "skin"),
  // [104] Amoxycillin Suspension (challenge, Oral Graded Challenge)
  findDreamOnly("Amoxycillin Suspension", "challenge", "Oral Graded Challenge"),
  // [105] Amoxycillin/Clavulanic Acid (challenge, Oral Graded Challenge)
  findDreamOnly("Amoxycillin/Clavulanic Acid", "challenge", "Oral Graded Challenge"),
  // [106] Cefazolin (challenge, IV Challenge)
  findGenerated("Cefazolin", "challenge", "IV Challenge"),
  // [107] Cephalexin (challenge, Oral Graded Challenge)
  findDreamOnly("Cephalexin", "challenge", "Oral Graded Challenge"),
  // [108] Ciprofloxacin (challenge, Oral Graded Challenge)
  findDreamOnly("Ciprofloxacin", "challenge", "Oral Graded Challenge"),
  // [109] Doxycycline (challenge, Oral Graded Challenge)
  findDreamOnly("Doxycycline", "challenge", "Oral Graded Challenge"),
  // [110] Flucloxacillin (challenge, Oral Graded Challenge)
  findDreamOnly("Flucloxacillin", "challenge", "Oral Graded Challenge"),
  // [111] Lignocaine (challenge, Challenge)
  findDreamOnly("Lignocaine", "challenge", "Challenge"),
  // [112] Meloxicam (challenge, Graded Challenge)
  findDreamOnly("Meloxicam", "challenge", "Graded Challenge"),
  // [113] Trimethoprim/Sulfamethoxazole (challenge, Oral Graded Challenge)
  findDreamOnly("Trimethoprim/Sulfamethoxazole", "challenge", "Oral Graded Challenge"),
  // [114] Trimethoprim (challenge, Oral Graded Challenge)
  findDreamOnly("Trimethoprim", "challenge", "Oral Graded Challenge"),
  // [115] Voltaren (Diclofenac) (challenge, Graded Challenge)
  findDreamOnly("Voltaren (Diclofenac)", "challenge", "Graded Challenge"),
  // [116] Flucloxacillin (skin, IV)
  findGenerated("Flucloxacillin", "skin", "IV"),
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
