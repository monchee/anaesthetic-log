import { describe, it, expect } from 'vitest';
import { deidentify } from './ResearchService';
import { LogFormData } from '@shared/types';

function makeData(overrides: Partial<LogFormData> = {}): LogFormData {
  return {
    mrn: '123456',
    firstName: 'John',
    lastName: 'Doe',
    visitDate: '2026-01-15',
    controls: { histamineSpt: '5', salineSpt: '0', salineIdt: '0' },
    testPanel: [
      { drugName: 'Rocuronium', sptWheal: '5', idtResults: ['3', '4'], protocolIndex: 0 },
      { drugName: 'Cefazolin', sptWheal: '0', idtResults: ['0', '0'], protocolIndex: 0 },
    ],
    proceedToChallenge: true,
    challengeDrug: 'Rocuronium',
    outcome: 'UNSUCCESS',
    reactionTime: '5',
    symptoms: ['Hypotension', 'Rash'],
    symptomsOther: '',
    interventionType: 'Adrenaline',
    interventionOther: '',
    plan: 'Avoid Rocuronium.',
    ...overrides,
  };
}

describe('deidentify', () => {
  it('strips patient name fields', () => {
    const result = deidentify(makeData());
    // result should not have firstName, lastName, or mrn fields
    expect((result as any).firstName).toBeUndefined();
    expect((result as any).lastName).toBeUndefined();
    expect((result as any).mrn).toBeUndefined();
  });

  it('passes through REDCap ID', () => {
    const result = deidentify(makeData(), 'REDCAP-001');
    expect(result.redcap_id).toBe('REDCAP-001');
  });

  it('handles null REDCap ID', () => {
    const result = deidentify(makeData());
    expect(result.redcap_id).toBeNull();
  });

  it('maps skin test panel correctly', () => {
    const result = deidentify(makeData());
    expect(result.test_panel).toHaveLength(2);
    expect(result.test_panel[0].drug_name).toBe('Rocuronium');
    expect(result.test_panel[0].spt_wheal).toBe('5');
    expect(result.test_panel[0].is_positive).toBe(true);
    expect(result.test_panel[1].drug_name).toBe('Cefazolin');
    expect(result.test_panel[1].is_positive).toBe(false);
  });

  it('uses customName for drug_name when available', () => {
    const data = makeData({
      testPanel: [{ drugName: 'Other', customName: 'MyCustomDrug', sptWheal: '5', idtResults: [], protocolIndex: 0 }],
    });
    const result = deidentify(data);
    expect(result.test_panel[0].drug_name).toBe('MyCustomDrug');
  });

  it('counts positive results', () => {
    const result = deidentify(makeData());
    expect(result.positive_count).toBe(1);
    expect(result.total_drugs_tested).toBe(2);
  });

  it('handles challenge outcome', () => {
    const result = deidentify(makeData());
    expect(result.proceed_to_challenge).toBe(true);
    expect(result.challenge_drug).toBe('Rocuronium');
    expect(result.challenge_outcome).toBe('UNSUCCESS');
  });

  it('handles no challenge', () => {
    const data = makeData({ proceedToChallenge: false, outcome: null });
    const result = deidentify(data);
    expect(result.proceed_to_challenge).toBe(false);
    expect(result.challenge_drug).toBeNull();
    expect(result.challenge_outcome).toBeNull();
  });

  it('passes through challenge meta for unsuccessful outcomes', () => {
    const result = deidentify(makeData());
    expect(result.reaction_time).toBe('5');
    expect(result.symptoms).toEqual(['Hypotension', 'Rash']);
    expect(result.intervention_type).toBe('Adrenaline');
  });

  it('handles legacy IDT fields (idt100, idt10, idtNeat)', () => {
    const data = makeData({
      testPanel: [{ drugName: 'Rocuronium', sptWheal: '3', idt100: '4', idt10: '2', idtNeat: '', idtResults: ['4', '2'], protocolIndex: 0 }],
    });
    const result = deidentify(data);
    expect(result.test_panel[0].idt_results).toBe('4 | 2');
    expect(result.test_panel[0].is_positive).toBe(true);
  });

  it('handles empty test panel', () => {
    const data = makeData({ testPanel: [] });
    const result = deidentify(data);
    expect(result.test_panel).toEqual([]);
    expect(result.total_drugs_tested).toBe(0);
    expect(result.positive_count).toBe(0);
  });

  it('handles challenge with custom drug name', () => {
    const data = makeData({
      proceedToChallenge: true,
      challengeDrug: 'Other',
      challengeDrugCustom: 'CustomChallengeDrug',
      outcome: 'SUCCESS',
      reactionTime: '',
      symptoms: [],
      interventionType: '',
    });
    const result = deidentify(data);
    expect(result.challenge_drug).toBe('CustomChallengeDrug');
    expect(result.challenge_outcome).toBe('SUCCESS');
  });

  it('includes app version', () => {
    const result = deidentify(makeData());
    expect(result.app_version).toBeDefined();
  });

  it('includes visit date', () => {
    const result = deidentify(makeData());
    expect(result.visit_date).toBe('2026-01-15');
  });

  it('passes through plan', () => {
    const result = deidentify(makeData());
    expect(result.plan).toBe('Avoid Rocuronium.');
  });
});
