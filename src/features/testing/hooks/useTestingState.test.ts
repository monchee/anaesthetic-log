import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ACTIVE_REPORT_KEY,
  ACTIVE_REPORT_TTL_MS,
  TESTING_DRAFT_KEY,
} from '@shared/utils/ttlStorage';
import { LogFormData } from '../types';
import { useTestingState } from './useTestingState';

vi.mock('@shared/data/mockTestingLogs', () => ({
  MOCK_TESTING_LOGS: [
    {
      mrn: 'MOCK1',
      firstName: 'Mock',
      lastName: 'Patient',
      visitDate: '2026-06-10',
      controls: { histamineSpt: '', salineSpt: '', salineIdt: '' },
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
    },
  ],
}));

const baseForm = (): LogFormData => ({
  mrn: '123456',
  firstName: 'Jane',
  lastName: 'Citizen',
  visitDate: '2026-06-10',
  controls: {
    histamineSpt: '5',
    salineSpt: '0',
    salineIdt: '0',
  },
  testPanel: [
    {
      drugName: 'Rocuronium',
      sptWheal: '3',
      idtResults: ['0', '4'],
      protocolIndex: 1,
      notes: 'Positive IDT',
    },
  ],
  proceedToChallenge: true,
  challengeDrug: 'Rocuronium',
  challengeDrugCustom: '',
  outcome: 'UNSUCCESS',
  reactionTime: '10 minutes',
  symptoms: ['Urticaria'],
  symptomsOther: '',
  interventionType: 'Antihistamine',
  interventionOther: '',
  plan: 'Avoid rocuronium',
  nurseNotes: {
    preTesting: 'Baseline observations normal',
    duringTesting: 'Observed wheal',
    postTesting: 'Stable on discharge',
    signedBy: 'RN Test',
  },
  tryptase: {
    obtained: true,
    significantElevation: false,
    values: [{ time: '1 hour', result: '8.1' }],
  },
});

const writeTTL = (key: string, value: LogFormData, savedAt = Date.now()) => {
  localStorage.setItem(key, JSON.stringify({ value, savedAt }));
};

const readTTL = <T,>(key: string): T | null => {
  const raw = localStorage.getItem(key);
  return raw ? (JSON.parse(raw).value as T) : null;
};

describe('useTestingState', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('initializes with an empty form and loads recent mock logs', async () => {
    const { result } = renderHook(() => useTestingState());

    expect(result.current.formData.mrn).toBe('');
    expect(result.current.formData.testPanel).toHaveLength(2);

    await waitFor(() => {
      expect(result.current.recentLogs).toHaveLength(1);
    });
  });

  it('restores a fresh active report and testing draft from TTL storage', async () => {
    const activeReport = baseForm();
    const savedAt = Date.now();
    const draft = {
      ...baseForm(),
      mrn: '654321',
      firstName: 'Draft',
      tryptase: {
        obtained: true,
        significantElevation: true,
        values: [{ time: 30, result: 12.4 }],
      },
    } as unknown as LogFormData;

    writeTTL(ACTIVE_REPORT_KEY, activeReport, savedAt);
    writeTTL(TESTING_DRAFT_KEY, draft, savedAt);

    const { result } = renderHook(() => useTestingState());

    await waitFor(() => {
      expect(result.current.lastSavedRecord?.mrn).toBe('123456');
      expect(result.current.formData.mrn).toBe('654321');
    });
    expect(result.current.formData.tryptase).toEqual({
      obtained: true,
      significantElevation: true,
      values: [{ time: '30', result: '12.4' }],
    });
    expect(result.current.activeReportSavedAt).toBe(savedAt);
  });

  it('does not restore stale drafts', () => {
    writeTTL(TESTING_DRAFT_KEY, baseForm(), Date.now() - ACTIVE_REPORT_TTL_MS - 1);

    const { result } = renderHook(() => useTestingState());

    expect(result.current.formData.mrn).toBe('');
    expect(localStorage.getItem(TESTING_DRAFT_KEY)).toBeNull();
  });

  it('normalizes malformed tryptase drafts', async () => {
    writeTTL(TESTING_DRAFT_KEY, {
      ...baseForm(),
      tryptase: {
        obtained: '',
        significantElevation: 1,
        values: [null, { time: 60 }],
      },
    } as unknown as LogFormData);

    const { result } = renderHook(() => useTestingState());

    await waitFor(() => {
      expect(result.current.formData.tryptase).toEqual({
        obtained: false,
        significantElevation: true,
        values: [
          { time: '', result: '' },
          { time: '60', result: '' },
        ],
      });
    });
  });

  it('autosaves dirty sessions after the debounce delay', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useTestingState());

    act(() => {
      result.current.setFormData({ ...result.current.formData, controls: { ...result.current.formData.controls, histamineSpt: '5' } });
    });

    act(() => {
      vi.advanceTimersByTime(499);
    });
    expect(localStorage.getItem(TESTING_DRAFT_KEY)).toBeNull();

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(readTTL<LogFormData>(TESTING_DRAFT_KEY)?.controls.histamineSpt).toBe('5');
  });

  it('sanitizes and saves submitted records, then clears the draft', async () => {
    const unsafeForm = {
      ...baseForm(),
      id: 123,
      timestamp: 456,
      controls: {
        histamineSpt: 5,
        salineSpt: 0,
        salineIdt: null,
      },
      testPanel: [
        {
          id: 99,
          drugName: 'Rocuronium',
          sptWheal: 3,
          idtResults: [0, 4, null],
          protocolIndex: 'bad',
          customName: 42,
          notes: 17,
        },
      ],
      symptoms: ['Urticaria', 123],
      nurseNotes: {
        preTesting: 1,
        duringTesting: 2,
        postTesting: 3,
        signedBy: 4,
      },
      tryptase: {
        obtained: 1,
        significantElevation: 0,
        values: [{ time: 30, result: 12.4 }],
      },
    } as unknown as LogFormData;

    writeTTL(TESTING_DRAFT_KEY, baseForm());
    const { result } = renderHook(() => useTestingState());

    act(() => {
      result.current.setFormData(unsafeForm);
    });

    await waitFor(() => {
      expect(result.current.formData.mrn).toBe('123456');
    });

    let saved: LogFormData | undefined;
    act(() => {
      saved = result.current.handleSubmit();
    });

    expect(saved).toMatchObject({
      id: '123',
      timestamp: '456',
      controls: {
        histamineSpt: '5',
        salineSpt: '',
        salineIdt: '',
      },
      testPanel: [
        {
          id: '99',
          drugName: 'Rocuronium',
          sptWheal: '3',
          idtResults: ['0', '4', ''],
          protocolIndex: 0,
          customName: '42',
          notes: '17',
        },
      ],
      symptoms: ['Urticaria', '123'],
      nurseNotes: {
        preTesting: '1',
        duringTesting: '2',
        postTesting: '3',
        signedBy: '4',
      },
      tryptase: {
        obtained: true,
        significantElevation: false,
        values: [{ time: '30', result: '12.4' }],
      },
    });
    expect(result.current.lastSavedRecord).toEqual(saved);
    expect(readTTL<LogFormData>(ACTIVE_REPORT_KEY)).toEqual(saved);
    expect(localStorage.getItem(TESTING_DRAFT_KEY)).toBeNull();
  });

  it('preserves legacy IDT fields and normalizes invalid optional fields on submit', async () => {
    const legacyForm = {
      ...baseForm(),
      id: '',
      timestamp: '',
      testPanel: [
        {
          drugName: 'Legacy row',
          sptWheal: '',
          idt100: '',
          idt10: '5',
          idtNeat: '',
          protocolIndex: 2,
          customName: '',
          notes: '',
        },
      ],
      challengeDrugCustom: '',
      outcome: 'UNKNOWN',
      nurseNotes: undefined,
      tryptase: undefined,
    } as unknown as LogFormData;

    const { result } = renderHook(() => useTestingState());

    act(() => {
      result.current.setFormData(legacyForm);
    });

    await waitFor(() => {
      expect(result.current.formData.testPanel[0].drugName).toBe('Legacy row');
    });

    let saved: LogFormData | undefined;
    act(() => {
      saved = result.current.handleSubmit();
    });

    expect(saved).toMatchObject({
      id: undefined,
      timestamp: undefined,
      outcome: null,
      challengeDrugCustom: undefined,
      nurseNotes: undefined,
      tryptase: undefined,
      testPanel: [
        {
          drugName: 'Legacy row',
          idtResults: ['', '5'],
          protocolIndex: 2,
          customName: undefined,
          notes: undefined,
        },
      ],
    });
  });

  it('saves partial nurse notes and malformed tryptase shapes defensively', async () => {
    const partialForm = {
      ...baseForm(),
      nurseNotes: {
        preTesting: '',
        duringTesting: 'During',
      },
      tryptase: {
        obtained: false,
        significantElevation: false,
        values: 'not-an-array',
      },
    } as unknown as LogFormData;
    const { result } = renderHook(() => useTestingState());

    act(() => {
      result.current.setFormData(partialForm);
    });

    await waitFor(() => {
      expect(result.current.formData.nurseNotes?.duringTesting).toBe('During');
    });

    let saved: LogFormData | undefined;
    act(() => {
      saved = result.current.handleSubmit();
    });

    expect(saved?.nurseNotes).toEqual({
      preTesting: undefined,
      duringTesting: 'During',
      postTesting: undefined,
      signedBy: undefined,
    });
    expect(saved?.tryptase).toEqual({
      obtained: false,
      significantElevation: false,
      values: [],
    });
  });

  it('logs and rethrows submit parser failures', () => {
    const invalidForm = { ...baseForm() };
    Object.defineProperty(invalidForm, 'mrn', {
      get() {
        throw new TypeError('Unreadable MRN');
      },
    });
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { result } = renderHook(() => useTestingState());

    act(() => {
      result.current.setFormData(invalidForm);
    });

    expect(() => result.current.handleSubmit()).toThrow(TypeError);
    expect(errorSpy).toHaveBeenCalledWith('Error saving clinical record:', expect.any(TypeError));
  });

  it('resets the form and clears only the testing draft', () => {
    writeTTL(TESTING_DRAFT_KEY, baseForm());
    const { result } = renderHook(() => useTestingState());

    act(() => {
      result.current.setLastSavedRecord(baseForm());
      result.current.resetForm();
    });

    expect(result.current.formData.mrn).toBe('');
    expect(result.current.lastSavedRecord?.mrn).toBe('123456');
    expect(localStorage.getItem(TESTING_DRAFT_KEY)).toBeNull();
  });

  it('clears the active report and draft', () => {
    writeTTL(ACTIVE_REPORT_KEY, baseForm());
    writeTTL(TESTING_DRAFT_KEY, baseForm());
    const { result } = renderHook(() => useTestingState());

    act(() => {
      result.current.clearActiveReport();
    });

    expect(result.current.lastSavedRecord).toBeNull();
    expect(result.current.activeReportSavedAt).toBeNull();
    expect(localStorage.getItem(ACTIVE_REPORT_KEY)).toBeNull();
    expect(localStorage.getItem(TESTING_DRAFT_KEY)).toBeNull();
  });

  it('warns when mock testing logs fail to load', async () => {
    vi.resetModules();
    vi.doMock('@shared/data/mockTestingLogs', () => {
      throw new Error('mock load failed');
    });
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { useTestingState: useTestingStateWithFailedImport } = await import('./useTestingState');

    renderHook(() => useTestingStateWithFailedImport());

    await waitFor(() => {
      expect(warnSpy).toHaveBeenCalledWith('Unable to load mock testing logs:', expect.any(Error));
    });
  });
});
