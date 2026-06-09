import { describe, it, expect } from 'vitest';
import {
  isSkinTestPositive,
  getPositiveResults,
  getNegativeResults,
  getCrossSensitizationNotes,
  getCrossSensitizedDrugs,
  buildRecommendations,
} from './testingUtils';
import { DrugTestRow, LogFormData } from '@features/testing/types';

function makeRow(overrides: Partial<DrugTestRow> = {}): DrugTestRow {
  return {
    drugName: 'Rocuronium',
    sptWheal: '',
    idtResults: [],
    protocolIndex: 0,
    ...overrides,
  };
}

function makeData(overrides: Partial<LogFormData> = {}): LogFormData {
  return {
    mrn: '123456',
    firstName: 'Test',
    lastName: 'Patient',
    visitDate: '2026-01-01',
    controls: { histamineSpt: '5', salineSpt: '0', salineIdt: '0' },
    testPanel: [],
    proceedToChallenge: false,
    challengeDrug: '',
    outcome: null,
    reactionTime: '',
    symptoms: [],
    symptomsOther: '',
    interventionType: '',
    interventionOther: '',
    plan: '',
    ...overrides,
  };
}

describe('isSkinTestPositive', () => {
  it('returns true when SPT wheal >= 3', () => {
    expect(isSkinTestPositive(makeRow({ sptWheal: '5' }))).toBe(true);
    expect(isSkinTestPositive(makeRow({ sptWheal: '3' }))).toBe(true);
  });

  it('returns false when SPT wheal < 3', () => {
    expect(isSkinTestPositive(makeRow({ sptWheal: '2' }))).toBe(false);
    expect(isSkinTestPositive(makeRow({ sptWheal: '0' }))).toBe(false);
  });

  it('returns false when SPT wheal is empty', () => {
    expect(isSkinTestPositive(makeRow({ sptWheal: '' }))).toBe(false);
  });

  it('returns true when any IDT result >= 3', () => {
    expect(isSkinTestPositive(makeRow({ idtResults: ['1', '4', '2'] }))).toBe(true);
  });

  it('returns false when all IDT results < 3', () => {
    expect(isSkinTestPositive(makeRow({ idtResults: ['1', '2', '0'] }))).toBe(false);
  });

  it('returns true for legacy IDT fields >= 3', () => {
    expect(isSkinTestPositive(makeRow({ idt100: '5' }))).toBe(true);
    expect(isSkinTestPositive(makeRow({ idt10: '3' }))).toBe(true);
    expect(isSkinTestPositive(makeRow({ idtNeat: '4' }))).toBe(true);
  });

  it('returns false when legacy IDT fields < 3', () => {
    expect(isSkinTestPositive(makeRow({ idt100: '2', idt10: '1', idtNeat: '0' }))).toBe(false);
  });
});

describe('getPositiveResults', () => {
  it('includes drugs with positive skin tests', () => {
    const data = makeData({
      testPanel: [{ ...makeRow({ drugName: 'Rocuronium', sptWheal: '5' }) }, { ...makeRow({ drugName: 'Cefazolin', sptWheal: '2' }) }],
    });
    expect(getPositiveResults(data)).toEqual(['Rocuronium']);
  });

  it('includes unsuccessful challenge drug', () => {
    const data = makeData({
      testPanel: [{ ...makeRow({ drugName: 'Rocuronium', sptWheal: '2' }) }],
      proceedToChallenge: true,
      challengeDrug: 'Rocuronium',
      outcome: 'UNSUCCESS',
    });
    expect(getPositiveResults(data)).toEqual(['Rocuronium']);
  });

  it('deduplicates drugs from skin test and challenge', () => {
    const data = makeData({
      testPanel: [{ ...makeRow({ drugName: 'Rocuronium', sptWheal: '5' }) }],
      proceedToChallenge: true,
      challengeDrug: 'Rocuronium',
      outcome: 'UNSUCCESS',
    });
    expect(getPositiveResults(data)).toEqual(['Rocuronium']);
  });

  it('returns empty when no positives', () => {
    const data = makeData({
      testPanel: [{ ...makeRow({ drugName: 'Cefazolin', sptWheal: '0' }) }],
    });
    expect(getPositiveResults(data)).toEqual([]);
  });

  it('handles custom drug names', () => {
    const data = makeData({
      testPanel: [{ ...makeRow({ drugName: 'Other', customName: 'MyDrug', sptWheal: '5' }) }],
    });
    expect(getPositiveResults(data)).toEqual(['MyDrug']);
  });
});

describe('getNegativeResults', () => {
  it('includes drugs with negative skin tests', () => {
    const data = makeData({
      testPanel: [{ ...makeRow({ drugName: 'Rocuronium', sptWheal: '2' }) }, { ...makeRow({ drugName: 'Cefazolin', sptWheal: '0' }) }],
    });
    expect(getNegativeResults(data)).toEqual(['Rocuronium', 'Cefazolin']);
  });

  it('includes successful challenge drug', () => {
    const data = makeData({
      testPanel: [{ ...makeRow({ drugName: 'Rocuronium', sptWheal: '2' }) }],
      proceedToChallenge: true,
      challengeDrug: 'Rocuronium',
      outcome: 'SUCCESS',
    });
    expect(getNegativeResults(data)).toEqual(['Rocuronium']);
  });

  it('deduplicates challenge from skin test', () => {
    const data = makeData({
      testPanel: [{ ...makeRow({ drugName: 'Rocuronium', sptWheal: '0' }) }],
      proceedToChallenge: true,
      challengeDrug: 'Rocuronium',
      outcome: 'SUCCESS',
    });
    expect(getNegativeResults(data)).toEqual(['Rocuronium']);
  });

  it('handles custom drug names', () => {
    const data = makeData({
      testPanel: [{ ...makeRow({ drugName: 'Other', customName: 'MyDrug', sptWheal: '0' }) }],
    });
    expect(getNegativeResults(data)).toEqual(['MyDrug']);
  });
});

describe('getCrossSensitizationNotes', () => {
  it('adds Vecuronium sensitization when Rocuronium positive only', () => {
    const notes = getCrossSensitizationNotes(['Rocuronium']);
    expect(notes.length).toBe(1);
    expect(notes[0]).toContain('Vecuronium');
  });

  it('adds Rocuronium sensitization when Vecuronium positive only', () => {
    const notes = getCrossSensitizationNotes(['Vecuronium']);
    expect(notes.length).toBe(1);
    expect(notes[0]).toContain('Rocuronium');
  });

  it('returns empty when both are positive', () => {
    expect(getCrossSensitizationNotes(['Rocuronium', 'Vecuronium'])).toEqual([]);
  });

  it('returns empty when neither is positive', () => {
    expect(getCrossSensitizationNotes(['Cefazolin'])).toEqual([]);
    expect(getCrossSensitizationNotes([])).toEqual([]);
  });
});

describe('getCrossSensitizedDrugs', () => {
  it('adds Vecuronium when Rocuronium is positive only', () => {
    expect(getCrossSensitizedDrugs(['Rocuronium'])).toEqual(['Vecuronium']);
  });

  it('adds Rocuronium when Vecuronium is positive only', () => {
    expect(getCrossSensitizedDrugs(['Vecuronium'])).toEqual(['Rocuronium']);
  });

  it('returns empty when both are positive', () => {
    expect(getCrossSensitizedDrugs(['Rocuronium', 'Vecuronium'])).toEqual([]);
  });

  it('returns empty when neither Rocuronium nor Vecuronium is positive', () => {
    expect(getCrossSensitizedDrugs(['Cefazolin'])).toEqual([]);
    expect(getCrossSensitizedDrugs([])).toEqual([]);
  });
});

describe('buildRecommendations', () => {
  it('returns noAllergyMessage when no positives', () => {
    const result = buildRecommendations([], []);
    expect(result.noAllergyMessage).toBeDefined();
    expect(result.avoidList).toEqual([]);
    expect(result.bullets).toEqual([]);
  });

  it('includes avoid list from positives and cross-sensitized', () => {
    const result = buildRecommendations(['Rocuronium'], ['Vecuronium']);
    expect(result.avoidList).toContain('Rocuronium');
    expect(result.avoidList).toContain('Vecuronium');
  });

  it('includes MedicAlert bullet only for muscle relaxants', () => {
    const mrResult = buildRecommendations(['Rocuronium'], []);
    expect(mrResult.bullets.some(b => b.includes('MedicAlert'))).toBe(true);

    const nonMrResult = buildRecommendations(['Cefazolin'], []);
    expect(nonMrResult.bullets.some(b => b.includes('MedicAlert'))).toBe(false);
  });

  it('recognises canonical Cis-atracurium (hyphenated) as a muscle relaxant', () => {
    // Regression: MUSCLE_RELAXANTS previously held the unhyphenated spelling,
    // so a positive Cis-atracurium was not treated as a relaxant.
    const result = buildRecommendations(['Cis-atracurium'], []);
    expect(result.bullets.some(b => b.includes('MedicAlert'))).toBe(true);
  });

  it('includes standard bullets in recommendations', () => {
    const result = buildRecommendations(['Rocuronium'], []);
    expect(result.bullets.some(b => b.includes('eMR'))).toBe(true);
    expect(result.bullets.some(b => b.includes('GP'))).toBe(true);
    expect(result.bullets.some(b => b.includes('Copy of letter'))).toBe(true);
  });
});
