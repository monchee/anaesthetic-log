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
