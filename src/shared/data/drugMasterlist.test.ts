import { describe, expect, it } from 'vitest';
import expectedOrder from './expectedProtocolOrder.json';
import {
  DRUG_MASTERLIST,
  DREAM_ONLY_PROTOCOLS,
  MASTERLIST_CATEGORIES,
  getProtocolsForDrug,
  getSkinProtocolsForDrug,
  getDrugsByCategory,
  getChallengeDrugsByCategory,
} from './drugMasterlist';
import { GENERATED_PROTOCOLS } from './drugMasterlist.generated';

describe('drugMasterlist structure & integrity', () => {
  it('contains exactly 117 protocol records in the merged masterlist', () => {
    expect(DRUG_MASTERLIST).toHaveLength(117);
    expect(DREAM_ONLY_PROTOCOLS).toHaveLength(24);
    expect(GENERATED_PROTOCOLS).toHaveLength(93);
  });

  it('defines a non-empty id for every protocol entry', () => {
    expect(DRUG_MASTERLIST.every(protocol => typeof protocol.id === 'string' && protocol.id.trim().length > 0)).toBe(true);
  });

  it('defines a diluent string for every protocol entry', () => {
    expect(DRUG_MASTERLIST.every(protocol => typeof protocol.diluent === 'string')).toBe(true);
  });

  it('ensures protocol IDs are unique within each drug name', () => {
    const protocolsByDrug = new Map<string, string[]>();
    for (const protocol of DRUG_MASTERLIST) {
      const ids = protocolsByDrug.get(protocol.drugName) || [];
      ids.push(protocol.id);
      protocolsByDrug.set(protocol.drugName, ids);
    }

    for (const [drugName, ids] of protocolsByDrug.entries()) {
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size, `Duplicate protocol id detected for drug: ${drugName}`).toBe(ids.length);
    }
  });

  it('assigns every protocol to a valid category in MASTERLIST_CATEGORIES', () => {
    expect(DRUG_MASTERLIST.every(protocol => MASTERLIST_CATEGORIES.includes(protocol.category))).toBe(true);
  });

  it('preserves standard MASTERLIST_CATEGORIES ordering', () => {
    expect(MASTERLIST_CATEGORIES).toEqual([
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
    ]);
  });
});

describe('drugMasterlist array ordering & backwards compatibility', () => {
  // DREAM selects protocol variants by array index (protocolIndex), so a positional
  // shift silently re-points a saved clinical plan at a different dose. The expected
  // order is a committed fixture rather than a `git show` of a previous revision:
  // that baseline disappears the moment this change merges, and a check that quietly
  // stops working is worse than no check.
  it('preserves the frozen positional ordering of all 117 records', () => {
    expect(expectedOrder.count).toBe(117);
    expect(expectedOrder.order).toHaveLength(117);
    expect(DRUG_MASTERLIST).toHaveLength(117);

    for (let i = 0; i < expectedOrder.order.length; i++) {
      const want = expectedOrder.order[i];
      const got = DRUG_MASTERLIST[i];
      expect(got.drugName, `Position ${i} drugName mismatch`).toBe(want.drugName);
      expect(got.testType, `Position ${i} testType mismatch`).toBe(want.testType);
      expect(got.protocolLabel, `Position ${i} protocolLabel mismatch`).toBe(want.protocolLabel);
    }
  });

  it('preserves the canonical SHA-256 hash of the 116 frozen pre-snapshot protocols', async () => {
    const { computeTuplesHash, FROZEN_PRE_SNAPSHOT_PREFIX_SHA256 } = await import(
      '../../../scripts/verify-order.mjs'
    );
    expect(computeTuplesHash(expectedOrder.order, 116)).toBe(FROZEN_PRE_SNAPSHOT_PREFIX_SHA256);
    expect(computeTuplesHash(DRUG_MASTERLIST, 116)).toBe(FROZEN_PRE_SNAPSHOT_PREFIX_SHA256);
  });
});

describe('drugMasterlist diluents & snapshot data', () => {
  it('uses sourced diluent values for representative RTU and reconstitution-volume drugs', () => {
    expect(getSkinProtocolsForDrug('Rocuronium')[0].diluent).toBe('0.9% sodium chloride');
    expect(getSkinProtocolsForDrug('Cis-atracurium')[0].diluent).toBe('0.9% sodium chloride');
    expect(getSkinProtocolsForDrug('Vecuronium')[0].diluent).toBe('0.9% sodium chloride (reconstitute with 2.5 mL WFI)');
    expect(getSkinProtocolsForDrug('Cefazolin')[0].diluent).toBe('0.9% sodium chloride (reconstitute with 10 mL WFI)');
    expect(getSkinProtocolsForDrug('Pantoprazole')[0].diluent).toBe('0.9% sodium chloride (reconstitute with 10 mL NS)');
    expect(getSkinProtocolsForDrug('Penicillin Major')[0].diluent).toBe('Phosphate-buffered saline (1 mL supplied diluent — not plain saline)');
  });

  it('correctly populates metadata on generated snapshot records', () => {
    const rocuronium = getSkinProtocolsForDrug('Rocuronium')[0];
    expect(rocuronium.sourceSlug).toBe('rocuronium');
    expect(rocuronium.underReview).toBe(false);
    expect(rocuronium.lastReviewed).toBe('2026-03-28');
    expect(rocuronium.id).toBe('iv');
  });

  it('correctly splits Cefazolin into skin and challenge records', () => {
    const cefazolinAll = getProtocolsForDrug('Cefazolin');
    expect(cefazolinAll).toHaveLength(2);

    const skin = cefazolinAll.find(p => p.testType === 'skin');
    expect(skin).toBeDefined();
    expect(skin?.id).toBe('iv');
    expect(skin?.protocolLabel).toBe('IV');
    expect(skin?.sptNeatConcentration).toBe('Neat (100 mg/mL)');
    expect(skin?.idtSteps).toHaveLength(2);
    expect(skin?.challengeSteps).toHaveLength(0);

    const challenge = cefazolinAll.find(p => p.testType === 'challenge');
    expect(challenge).toBeDefined();
    expect(challenge?.id).toBe('iv-challenge');
    expect(challenge?.protocolLabel).toBe('IV Challenge');
    expect(challenge?.challengeSteps).toHaveLength(4);
    expect(challenge?.idtSteps).toHaveLength(0);
    expect(challenge?.diluent).toBe('');
  });
});

describe('snapshot-synchronized drugs exact values & clinical safety checks', () => {
  it('verifies Cefuroxime uses source iv skin record and keeps Cefuroxime Suspension separate', () => {
    const cefuroximeProtocols = getProtocolsForDrug('Cefuroxime');
    expect(cefuroximeProtocols).toHaveLength(1);
    const cef = cefuroximeProtocols[0];
    expect(cef.id).toBe('iv');
    expect(cef.testType).toBe('skin');
    expect(cef.sourceSlug).toBe('cefuroxime');
    expect(cef.sptNeatConcentration).toBe('Neat (25 mg/mL)');
    expect(cef.idtSteps).toEqual([
      { ratio: '1:100', concentration: '0.25 mg/mL', preparation: '0.1 mL of 2.5 mg/mL + 0.9 mL NS' },
      { ratio: '1:10', concentration: '2.5 mg/mL', preparation: '0.1 mL of 25 mg/mL + 0.9 mL NS' },
    ]);
    expect(cef.underReview).toBe(false);

    const suspension = getProtocolsForDrug('Cefuroxime Suspension');
    expect(suspension).toHaveLength(1);
    expect(suspension[0].id).toBe('suspension');
    expect(suspension[0].needsPharmacyVerification).toBe(true);
  });

  it('verifies Flucloxacillin preserves DREAM challenge at index 110 and appends source skin record at index 116', () => {
    const flucAll = getProtocolsForDrug('Flucloxacillin');
    expect(flucAll).toHaveLength(2);

    const challenge = DRUG_MASTERLIST[110];
    expect(challenge.drugName).toBe('Flucloxacillin');
    expect(challenge.testType).toBe('challenge');
    expect(challenge.protocolLabel).toBe('Oral Graded Challenge');
    expect(challenge.challengeSteps).toHaveLength(3);

    const skin = DRUG_MASTERLIST[116];
    expect(skin.drugName).toBe('Flucloxacillin');
    expect(skin.testType).toBe('skin');
    expect(skin.id).toBe('iv');
    expect(skin.protocolLabel).toBe('IV');
    expect(skin.sourceSlug).toBe('flucloxacillin');
    expect(skin.sptNeatConcentration).toBe('0.2 mg/mL');
    expect(skin.diluent).toBe('0.9% sodium chloride (Initial Reconstitution: Add 4.6 mL NS to 500 mg vial to obtain 100 mg/mL; Intermediate Dilution: Draw 1.0 mL of 100 mg/mL solution, add 4.0 mL NS to result in 20 mg/mL)');
    expect(skin.idtSteps).toEqual([
      { ratio: '1:100', concentration: '0.2 mg/mL', preparation: '0.1 mL of 2 mg/mL + 0.9 mL NS' },
      { ratio: '1:10', concentration: '2 mg/mL', preparation: '0.1 mL neat (20mg/ml) + 0.9 mL NS' },
    ]);
  });

  it('verifies Levofloxacin retains pharmacy verification flag and exact source IDT steps', () => {
    const levo = getSkinProtocolsForDrug('Levofloxacin')[0];
    expect(levo.id).toBe('tablet');
    expect(levo.protocolLabel).toBe('Tablet');
    expect(levo.needsPharmacyVerification).toBe(true);
    expect(levo.sourceSlug).toBe('levofloxacin');
    expect(levo.presentation).toBe('500 mg tablets or IV formulation');
    expect(levo.sptNeatConcentration).toBe('Neat (5 mg/mL)');
    expect(levo.diluent).toBe('Normal saline for IDT dilutions (consult the Manufacturing Pharmacist for the exact diluent and method if using tablets)');
    expect(levo.idtSteps).toEqual([
      { ratio: '1:100', concentration: '0.05 mg/mL', preparation: '0.1 mL of 0.5 mg/mL + 0.9 mL NS' },
    ]);
  });

  it('verifies Levonorgestrel is source SPT-only with stale DREAM IDT removed', () => {
    const levo = getSkinProtocolsForDrug('Levonorgestrel')[0];
    expect(levo.id).toBe('oral');
    expect(levo.protocolLabel).toBe('Oral');
    expect(levo.needsPharmacyVerification).toBe(true);
    expect(levo.sourceSlug).toBe('levonorgestrel');
    expect(levo.sptNeatConcentration).toBe('Neat (crushed tablet solution)');
    expect(levo.idtSteps).toEqual([]);
  });

  it('verifies Pantoprazole retains underReview flag, reviewNote, and 4 mg/mL concentration', () => {
    const panto = getSkinProtocolsForDrug('Pantoprazole')[0];
    expect(panto.id).toBe('iv');
    expect(panto.sourceSlug).toBe('pantoprazole');
    expect(panto.underReview).toBe(true);
    expect(panto.reviewNote).toBe(
      'The Spreadsheet 2 spreadsheet labels the SPT concentration as "Neat (40 mg/mL)". This is a spreadsheet labelling error — the correct reconstituted concentration is 4 mg/mL (40 mg powder + 10 mL NS).'
    );
    expect(panto.sptNeatConcentration).toBe('Neat (4 mg/mL)');
    expect(panto.diluent).toBe('0.9% sodium chloride (reconstitute with 10 mL NS)');
    expect(panto.idtSteps).toHaveLength(3);
  });

  it('verifies Sugammadex (Alone) uses source id alone and keeps Sugammadex (+ Rocuronium) DREAM-only', () => {
    const alone = DRUG_MASTERLIST[5];
    expect(alone.drugName).toBe('Sugammadex (Alone)');
    expect(alone.id).toBe('alone');
    expect(alone.sourceSlug).toBe('sugammadex');
    expect(alone.sptNeatConcentration).toBe('Neat (100 mg/mL)');
    expect(alone.idtSteps).toEqual([
      { ratio: '1:1,000', concentration: '0.1 mg/mL', preparation: '0.1 mL of 1 mg/mL + 0.9 mL NS' },
      { ratio: '1:100', concentration: '1 mg/mL', preparation: '0.1 mL of 10 mg/mL + 0.9 mL NS' },
    ]);

    const combo = DRUG_MASTERLIST[6];
    expect(combo.drugName).toBe('Sugammadex (+ Rocuronium)');
    expect(combo.id).toBe('rocuronium');
    expect(combo.sourceSlug).toBeUndefined();
  });

  it('verifies Tazocin retains underReview flag, reviewNote, and only the single source IDT row', () => {
    const taz = getSkinProtocolsForDrug('Tazocin')[0];
    expect(taz.id).toBe('iv');
    expect(taz.sourceSlug).toBe('tazocin');
    expect(taz.underReview).toBe(true);
    expect(taz.reviewNote).toBe(
      'Concentration discrepancy: Medication List specifies SPT at 1:10 (2 mg/mL Piperacillin), whereas calculation of 1:10 of 200 mg/mL gives 20 mg/mL. Concentration under clinical review.'
    );
    expect(taz.sptNeatConcentration).toBe('1:10 — ⚠️ concentration under review (Medication List: 2 mg/mL; calculation: 20 mg/mL)');
    expect(taz.diluent).toBe('0.9% sodium chloride (reconstitute with 20 mL NS)');
    expect(taz.idtSteps).toEqual([
      { ratio: '1:100', concentration: '2/0.2 mg/mL', preparation: '0.1 mL of 20/2 mg/mL + 0.9 mL NS' },
    ]);
  });

  it('verifies Urografin retains all three literal source rows', () => {
    const uro = getSkinProtocolsForDrug('Urografin')[0];
    expect(uro.id).toBe('iv-contrast');
    expect(uro.sourceSlug).toBe('urografin');
    expect(uro.sptNeatConcentration).toBe('Neat');
    expect(uro.diluent).toBe('0.9% sodium chloride');
    expect(uro.idtSteps).toEqual([
      { ratio: '1:100', concentration: '—', preparation: '0.1 mL of 1:10 + 0.9 mL NS' },
      { ratio: '1:10', concentration: '—', preparation: '0.1 mL neat + 0.9 mL NS' },
      { ratio: 'Neat', concentration: '500 U/mL', preparation: 'Undiluted stock' },
    ]);
  });

  it('verifies Vancomycin retains only the single source IDT row and source diluent', () => {
    const vanc = getSkinProtocolsForDrug('Vancomycin')[0];
    expect(vanc.id).toBe('iv');
    expect(vanc.sourceSlug).toBe('vancomycin');
    expect(vanc.sptNeatConcentration).toBe('Neat (100 mg/mL)');
    expect(vanc.diluent).toBe('0.9% sodium chloride (add 5 mL NS to 500 mg or 10 mL NS to 1 g)');
    expect(vanc.idtSteps).toEqual([
      { ratio: '1:1,000,000', concentration: '0.0001 mg/mL', preparation: '0.1 mL of 0.001 mg/mL + 0.9 mL NS' },
    ]);
  });
});

describe('drugMasterlist pharmacy verification flags', () => {
  it('flags exactly the unresolved skin protocols named in the release warning', () => {
    const flaggedProtocols = DRUG_MASTERLIST.filter(protocol => protocol.needsPharmacyVerification === true);

    expect(flaggedProtocols.map(protocol => protocol.drugName)).toEqual([
      'Cephalexin',
      'Methoxybenzylpenicillin',
      'Cefuroxime Suspension',
      'Levofloxacin',
      'Levonorgestrel',
      'Methylene Blue',
      'IV Contrast',
      'Atropine',
    ]);
    expect(flaggedProtocols.every(protocol => protocol.testType === 'skin')).toBe(true);
  });

  it('does not flag unrelated or challenge protocols', () => {
    expect(getSkinProtocolsForDrug('Rocuronium')[0].needsPharmacyVerification).toBeUndefined();
    expect(getSkinProtocolsForDrug('Cefazolin')[0].needsPharmacyVerification).toBeUndefined();

    const cephalexinChallenge = DRUG_MASTERLIST.find(
      protocol => protocol.drugName === 'Cephalexin' && protocol.testType === 'challenge'
    );
    expect(cephalexinChallenge?.needsPharmacyVerification).toBeUndefined();
  });
});

describe('drugMasterlist helper functions', () => {
  it('getProtocolsForDrug returns all protocols for a drug name', () => {
    expect(getProtocolsForDrug('Ampicillin')).toHaveLength(3);
    expect(getProtocolsForDrug('NonExistentDrug')).toEqual([]);
  });

  it('getSkinProtocolsForDrug excludes challenge-only protocols', () => {
    expect(getSkinProtocolsForDrug('Cefazolin')).toHaveLength(1);
    expect(getSkinProtocolsForDrug('Amoxycillin Suspension')).toHaveLength(0);
    expect(getSkinProtocolsForDrug('Betamethasone')).toHaveLength(1); // experimental
  });

  it('getDrugsByCategory excludes challenge-only drugs and sorts alphabetically', () => {
    const byCategory = getDrugsByCategory();
    expect(byCategory['Cephalosporins']).toContain('Cefazolin');
    expect(byCategory['Others']).not.toContain('Amoxycillin Suspension');
    for (const [cat, drugs] of Object.entries(byCategory)) {
      const sorted = [...drugs].sort();
      expect(drugs, `Drugs in category ${cat} should be sorted`).toEqual(sorted);
    }
  });

  it('getChallengeDrugsByCategory includes challenge drugs grouped by category', () => {
    const challengeDrugs = getChallengeDrugsByCategory();
    expect(challengeDrugs['Cephalosporins']).toEqual(['Cefazolin']);
    expect(challengeDrugs['Penicillins']).toEqual(['Cephalexin', 'Flucloxacillin']);
    expect(challengeDrugs['Others']).toContain('Amoxycillin Suspension');
  });
});

describe('dreamOnlyProtocols referencing integrity & dead record guard', () => {
  it('ensures every record in DREAM_ONLY_PROTOCOLS is actively referenced in DRUG_MASTERLIST (no dead duplicates)', () => {
    const masterlistSet = new Set(DRUG_MASTERLIST);
    const unreferenced = DREAM_ONLY_PROTOCOLS.filter((protocol) => !masterlistSet.has(protocol));

    if (unreferenced.length > 0) {
      const details = unreferenced
        .map(
          (p) =>
            `  • [${p.category}] ${p.drugName} (testType: '${p.testType}'${p.protocolLabel ? `, label: '${p.protocolLabel}'` : ''}, id: '${p.id}')`
        )
        .join('\n');
      expect.fail(
        `Dead/unreferenced protocol record(s) detected in dreamOnlyProtocols.ts (${unreferenced.length} record(s)):\n${details}\n` +
          `Either reference these records in drugMasterlist.ts or delete them if they have migrated to SCRATCH.`
      );
    }

    expect(unreferenced).toHaveLength(0);
  });

  it('ensures 1:1 bidirectional reference parity between DREAM_ONLY_PROTOCOLS and DRUG_MASTERLIST dream-only records', () => {
    const dreamOnlyInMasterlist = DRUG_MASTERLIST.filter((protocol) => DREAM_ONLY_PROTOCOLS.includes(protocol));

    // Direction 1: Every record in DREAM_ONLY_PROTOCOLS must be present in DRUG_MASTERLIST
    const unreferenced = DREAM_ONLY_PROTOCOLS.filter((p) => !dreamOnlyInMasterlist.includes(p));
    expect(
      unreferenced,
      `Dead records in dreamOnlyProtocols.ts: ${unreferenced.map(p => `${p.drugName} (${p.testType}${p.protocolLabel ? ` - ${p.protocolLabel}` : ''})`).join(', ')}`
    ).toHaveLength(0);

    // Direction 2: Count matches exactly (no unreferenced records in DREAM_ONLY_PROTOCOLS and no orphaned references)
    expect(DREAM_ONLY_PROTOCOLS).toHaveLength(dreamOnlyInMasterlist.length);
  });

  it('fails if drugMasterlist attempts to reference a non-existent findDreamOnly protocol', () => {
    const findProtocol = (
      drugName: string,
      testType: 'skin' | 'challenge' | 'control' | 'experimental',
      protocolLabel?: string
    ) => {
      const match = DREAM_ONLY_PROTOCOLS.find(
        (p) =>
          p.drugName === drugName &&
          p.testType === testType &&
          (!protocolLabel || p.protocolLabel === protocolLabel)
      );
      if (!match) {
        throw new Error(
          `Missing DREAM-only protocol for ${drugName} (${testType}${protocolLabel ? ` - ${protocolLabel}` : ''})`
        );
      }
      return match;
    };

    expect(() => findProtocol('NonExistentDrug', 'skin')).toThrow(
      /Missing DREAM-only protocol for NonExistentDrug/
    );
    expect(() => findProtocol('Sugammadex (+ Rocuronium)', 'skin', 'NonExistentLabel')).toThrow(
      /Missing DREAM-only protocol for Sugammadex/
    );
  });
});

