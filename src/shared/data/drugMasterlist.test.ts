import { describe, expect, it } from 'vitest';
import { DRUG_MASTERLIST, getSkinProtocolsForDrug } from './drugMasterlist';

describe('drugMasterlist diluents', () => {
  it('defines a diluent string for every protocol entry', () => {
    expect(DRUG_MASTERLIST.every(protocol => typeof protocol.diluent === 'string')).toBe(true);
  });

  it('uses sourced diluent values for representative RTU and reconstitution-volume drugs', () => {
    expect(getSkinProtocolsForDrug('Rocuronium')[0].diluent).toBe('0.9% sodium chloride');
    expect(getSkinProtocolsForDrug('Cefazolin')[0].diluent).toBe('0.9% sodium chloride (reconstitute with 10 mL WFI)');
    expect(getSkinProtocolsForDrug('Pantoprazole')[0].diluent).toBe('0.9% sodium chloride (reconstitute with 10 mL)');
    expect(getSkinProtocolsForDrug('Penicillin Major')[0].diluent).toBe('Phosphate-buffered saline (1 mL supplied diluent — not plain saline)');
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
