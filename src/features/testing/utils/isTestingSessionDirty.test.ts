import { describe, expect, it } from 'vitest';
import { LogFormData } from '../types';
import { isTestingSessionDirty } from './isTestingSessionDirty';

const cleanSession = (): LogFormData => ({
  mrn: '123456',
  firstName: 'Jane',
  lastName: 'Citizen',
  visitDate: '2026-06-10',
  controls: {
    histamineSpt: '',
    salineSpt: '',
    salineIdt: '',
  },
  testPanel: [
    {
      drugName: 'Rocuronium',
      sptWheal: '',
      idtResults: ['', ''],
      protocolIndex: 0,
    },
  ],
  proceedToChallenge: false,
  challengeDrug: '',
  challengeDrugCustom: '',
  outcome: null,
  reactionTime: '',
  symptoms: [],
  symptomsOther: '',
  interventionType: '',
  interventionOther: '',
  plan: '',
});

describe('isTestingSessionDirty', () => {
  it('does not treat patient identity or default visit data as dirty', () => {
    expect(isTestingSessionDirty(cleanSession())).toBe(false);
  });

  it('detects skin-test and row note data', () => {
    expect(isTestingSessionDirty({
      ...cleanSession(),
      testPanel: [{ ...cleanSession().testPanel[0], sptWheal: '3' }],
    })).toBe(true);

    expect(isTestingSessionDirty({
      ...cleanSession(),
      testPanel: [{ ...cleanSession().testPanel[0], idtResults: ['', '4'] }],
    })).toBe(true);

    expect(isTestingSessionDirty({
      ...cleanSession(),
      testPanel: [{ ...cleanSession().testPanel[0], notes: 'Delayed flare' }],
    })).toBe(true);
  });

  it('detects control readings', () => {
    expect(isTestingSessionDirty({
      ...cleanSession(),
      controls: { ...cleanSession().controls, histamineSpt: '5' },
    })).toBe(true);
  });

  it('detects challenge data', () => {
    expect(isTestingSessionDirty({ ...cleanSession(), proceedToChallenge: true })).toBe(true);
    expect(isTestingSessionDirty({ ...cleanSession(), challengeDrug: 'Propofol' })).toBe(true);
    expect(isTestingSessionDirty({ ...cleanSession(), outcome: 'UNSUCCESS' })).toBe(true);
    expect(isTestingSessionDirty({ ...cleanSession(), reactionTime: '10 minutes' })).toBe(true);
    expect(isTestingSessionDirty({ ...cleanSession(), symptoms: ['Urticaria'] })).toBe(true);
    expect(isTestingSessionDirty({ ...cleanSession(), symptomsOther: 'Cough' })).toBe(true);
    expect(isTestingSessionDirty({ ...cleanSession(), interventionType: 'Adrenaline' })).toBe(true);
    expect(isTestingSessionDirty({ ...cleanSession(), interventionOther: 'Oxygen' })).toBe(true);
    expect(isTestingSessionDirty({ ...cleanSession(), plan: 'Avoid rocuronium' })).toBe(true);
  });

  it('detects nurse notes', () => {
    expect(isTestingSessionDirty({
      ...cleanSession(),
      nurseNotes: { preTesting: 'Baseline observations normal' },
    })).toBe(true);
  });

  it('detects tryptase data', () => {
    expect(isTestingSessionDirty({
      ...cleanSession(),
      tryptase: { obtained: true, significantElevation: false, values: [] },
    })).toBe(true);

    expect(isTestingSessionDirty({
      ...cleanSession(),
      tryptase: {
        obtained: false,
        significantElevation: false,
        values: [{ time: '1 hour', result: '' }],
      },
    })).toBe(true);
  });

  it('ignores malformed empty tryptase values', () => {
    expect(isTestingSessionDirty({
      ...cleanSession(),
      tryptase: {
        obtained: false,
        significantElevation: false,
        values: 'not-an-array',
      },
    } as unknown as LogFormData)).toBe(false);
  });
});
