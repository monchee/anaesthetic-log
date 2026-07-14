import { renderHook, waitFor } from '@testing-library/react';
import type { SetStateAction } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePatientState } from '@features/patients/hooks/usePatientState';
import { useTestingState } from '@features/testing/hooks/useTestingState';
import { useDisclaimer } from '@shared/hooks/useDisclaimer';
import { generateLetterText } from '@shared/utils/reportExporter';
import { createMockLogFormData } from '@/src/test/factories/testingDataFactory';
import { createMockPatient } from '@/src/test/factories/patientFactory';
import type { LogFormData, Patient } from '@/types';
import { Screen } from '@/types';
import { useAppNavigation } from './useAppNavigation';
import { useAnaestheticApp } from './useAnaestheticApp';

vi.mock('@features/patients/hooks/usePatientState');
vi.mock('@features/testing/hooks/useTestingState');
vi.mock('@shared/hooks/useDisclaimer');
vi.mock('./useAppNavigation');

describe('useAnaestheticApp tryptase prefill', () => {
  let selectedPatient: Patient | null;
  let formData: LogFormData;
  let setFormData: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    selectedPatient = null;
    formData = createMockLogFormData();
    setFormData = vi.fn((next: SetStateAction<LogFormData>) => {
      formData = typeof next === 'function' ? next(formData) : next;
    });

    vi.mocked(usePatientState).mockImplementation(() => ({
      selectedPatient,
      setSelectedPatient: vi.fn(),
      isPatientDialogOpen: false,
      setIsPatientDialogOpen: vi.fn(),
      patients: [],
      databaseDate: '',
      hasUploadedData: false,
      patientDbSavedAt: null,
      isLoadingPatients: false,
      handlePatientSelect: vi.fn(),
      handleManualDetailChange: vi.fn(),
      handleUploadPatients: vi.fn(),
    } as ReturnType<typeof usePatientState>));

    vi.mocked(useTestingState).mockImplementation(() => ({
      formData,
      setFormData,
      lastSavedRecord: null,
      setLastSavedRecord: vi.fn(),
      activeReportSavedAt: null,
      lastDraftSavedAt: null,
      isSavingDraft: false,
      testingPlanData: null,
      setTestingPlanData: vi.fn(),
      recentLogs: [],
      handleSubmit: vi.fn(() => formData),
      resetForm: vi.fn(),
      clearActiveReport: vi.fn(),
      INITIAL_FORM_STATE: createMockLogFormData(),
    } as ReturnType<typeof useTestingState>));

    vi.mocked(useAppNavigation).mockReturnValue({
      screen: Screen.LOG,
      setScreen: vi.fn(),
      navigateTo: vi.fn(),
      navigateToLog: vi.fn(),
      navigateToDashboard: vi.fn(),
      navigateToResearch: vi.fn(),
      navigateToSummary: vi.fn(),
      navigateToPatientSummary: vi.fn(),
      navigateToTesting: vi.fn(),
      navigateToPrintPlan: vi.fn(),
      navigateToChangelog: vi.fn(),
    });
    vi.mocked(useDisclaimer).mockReturnValue({
      showDisclaimer: false,
      handleDismissDisclaimer: vi.fn(),
    });
  });

  it('prefills referral values once and never produces a false not-obtained letter sentence', async () => {
    selectedPatient = createMockPatient({
      history: {
        ...createMockPatient().history,
        tryptases: [
          { time: '09:15', result: '4.2' },
          { result: '19.8' },
        ],
      },
    });

    const { rerender } = renderHook(() => useAnaestheticApp());

    await waitFor(() => expect(formData.tryptase).toEqual({
      obtained: true,
      significantElevation: false,
      values: [
        { time: '09:15', result: '4.2' },
        { time: '', result: '19.8' },
      ],
      source: 'referral',
      hadReferralData: true,
    }));

    const letter = generateLetterText(formData, selectedPatient);
    expect(letter).toContain('Serial serum tryptase samples were obtained and were not elevated (T1 (09:15): 4.2, T2: 19.8).');
    expect(letter).not.toContain('Serial serum tryptase samples were not obtained.');

    formData = {
      ...formData,
      tryptase: {
        ...formData.tryptase!,
        values: [{ time: 'clinician edit', result: '7.1' }],
        source: 'entered',
      },
    };
    selectedPatient = { ...selectedPatient, firstName: 'Updated name' };
    rerender();

    await waitFor(() => expect(formData.firstName).toBe('Updated name'));
    expect(formData.tryptase).toMatchObject({
      values: [{ time: 'clinician edit', result: '7.1' }],
      source: 'entered',
      hadReferralData: true,
    });
  });

  it('leaves existing tryptase state untouched when the patient has no referral samples', async () => {
    const existingTryptase: NonNullable<LogFormData['tryptase']> = {
      obtained: false,
      significantElevation: false,
      values: [],
      source: 'entered',
    };
    formData = createMockLogFormData({ tryptase: existingTryptase });
    selectedPatient = createMockPatient({
      history: { ...createMockPatient().history, tryptases: undefined },
    });

    renderHook(() => useAnaestheticApp());

    await waitFor(() => expect(formData.mrn).toBe(selectedPatient?.mrn));
    expect(formData.tryptase).toBe(existingTryptase);
  });
});
