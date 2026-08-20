import { execSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';
import {
  DRUG_MASTERLIST,
  DREAM_ONLY_PROTOCOLS,
  MASTERLIST_CATEGORIES,
  getProtocolsForDrug,
  getSkinProtocolsForDrug,
  getDrugsByCategory,
  getChallengeDrugsByCategory,
} from './drugMasterlist';

describe('drugMasterlist structure & integrity', () => {
  it('contains exactly 116 protocol records in the merged masterlist', () => {
    expect(DRUG_MASTERLIST).toHaveLength(116);
    expect(DREAM_ONLY_PROTOCOLS).toHaveLength(109);
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
  it('preserves exact positional ordering of all 116 records compared to git HEAD', () => {
    const oldFileContent = execSync(
      'GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_NOSYSTEM=1 git show HEAD:src/shared/data/drugMasterlist.ts',
      { encoding: 'utf8' }
    );

    const oldTuples: { drugName: string; testType: string; protocolLabel: string }[] = [];
    const recordRegex = /\{\s*drugName:\s*['"]([^'"]+)['"][\s\S]*?testType:\s*['"]([^'"]+)['"][\s\S]*?protocolLabel:\s*['"]([^'"]*)['"]/g;

    let m;
    while ((m = recordRegex.exec(oldFileContent)) !== null) {
      oldTuples.push({
        drugName: m[1],
        testType: m[2],
        protocolLabel: m[3],
      });
    }

    expect(oldTuples).toHaveLength(116);
    expect(DRUG_MASTERLIST).toHaveLength(116);

    for (let i = 0; i < 116; i++) {
      const oldRec = oldTuples[i];
      const newRec = DRUG_MASTERLIST[i];
      expect(newRec.drugName, `Position ${i} drugName mismatch`).toBe(oldRec.drugName);
      expect(newRec.testType, `Position ${i} testType mismatch`).toBe(oldRec.testType);
      expect(newRec.protocolLabel, `Position ${i} protocolLabel mismatch`).toBe(oldRec.protocolLabel);
    }
  });
});

describe('drugMasterlist diluents & snapshot data', () => {
  it('uses sourced diluent values for representative RTU and reconstitution-volume drugs', () => {
    expect(getSkinProtocolsForDrug('Rocuronium')[0].diluent).toBe('Normal saline (NS)');
    expect(getSkinProtocolsForDrug('Cis-atracurium')[0].diluent).toBe('Normal saline (NS)');
    expect(getSkinProtocolsForDrug('Vecuronium')[0].diluent).toBe('Normal saline (reconstitute with 2.5 mL WFI)');
    expect(getSkinProtocolsForDrug('Cefazolin')[0].diluent).toBe('0.9% sodium chloride (reconstitute with 10 mL WFI)');
    expect(getSkinProtocolsForDrug('Pantoprazole')[0].diluent).toBe('0.9% sodium chloride (reconstitute with 10 mL)');
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
