import { describe, expect, it } from 'vitest';
import { createMockPatientHistory } from '@/src/test/factories/patientFactory';
import { deriveHighRiskChips } from './highRiskContext';

describe('deriveHighRiskChips', () => {
  it.each([
    [{ highRiskMeds: ['Beta-blocker'] }, ['Beta-blocker']],
    [{ highRiskMeds: ['ACE inhibitor'] }, ['ACE-inhibitor']],
    [{ conditions: ['Pregnant'] }, ['Pregnancy']],
    [{ conditions: ['Asthma'] }, ['Asthma']],
  ])('derives a chip for an individual high-risk context', (overrides, expected) => {
    expect(deriveHighRiskChips(createMockPatientHistory(overrides))).toEqual(expected);
  });

  it('derives multiple chips in a stable order', () => {
    const history = createMockPatientHistory({
      highRiskMeds: ['ACE-I therapy', 'beta blocker treatment'],
      conditions: ['Severe asthma', 'Currently pregnant'],
    });

    expect(deriveHighRiskChips(history)).toEqual([
      'Beta-blocker',
      'ACE-inhibitor',
      'Pregnancy',
      'Asthma',
    ]);
  });

  it('matches case-insensitively', () => {
    const history = createMockPatientHistory({
      highRiskMeds: ['BETA-BLOCKER', 'ace inhibitor'],
      conditions: ['PREGNANCY', 'ASTHMA'],
    });

    expect(deriveHighRiskChips(history)).toEqual([
      'Beta-blocker',
      'ACE-inhibitor',
      'Pregnancy',
      'Asthma',
    ]);
  });

  it('does not derive chips from unrelated strings', () => {
    const history = createMockPatientHistory({
      highRiskMeds: ['Anti-hypertensive', 'Calcium channel blocker'],
      conditions: ['Hypertension', 'Eczema'],
    });

    expect(deriveHighRiskChips(history)).toEqual([]);
  });

  it.each([
    {},
    { highRiskMeds: [], conditions: [] },
  ])('returns an empty array when risk arrays are absent or empty', overrides => {
    expect(deriveHighRiskChips(createMockPatientHistory(overrides))).toEqual([]);
  });
});
