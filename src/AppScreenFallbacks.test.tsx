import { fireEvent, render, screen } from './test/helpers';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Screen } from '@shared/types';
import type { Patient, TestingPlanData } from '@/types';
import { useAnaestheticApp } from '@core/hooks/useAnaestheticApp';
import { AnaestheticLogApp } from '../App';

vi.mock('@core/hooks/useAnaestheticApp', () => ({
  useAnaestheticApp: vi.fn(),
}));

vi.mock('@features/research/hooks/useResearchSubmit', () => ({
  useResearchSubmit: () => ({ reset: vi.fn() }),
}));

vi.mock('@core/components/HelpModal', () => ({
  HelpModal: () => null,
}));

const mockedUseAnaestheticApp = vi.mocked(useAnaestheticApp);

function createAppState(
  screen: Screen,
  overrides: Partial<ReturnType<typeof useAnaestheticApp>> = {}
) {
  return {
    screen,
    setScreen: vi.fn(),
    formData: {},
    setFormData: vi.fn(),
    selectedPatient: null,
    lastSavedRecord: null,
    setLastSavedRecord: vi.fn(),
    activeReportSavedAt: null,
    lastDraftSavedAt: null,
    isSavingDraft: false,
    testingPlanData: null,
    setTestingPlanData: vi.fn(),
    isPatientDialogOpen: false,
    setIsPatientDialogOpen: vi.fn(),
    patients: [],
    databaseDate: '',
    hasUploadedData: false,
    patientDbSavedAt: null,
    isLoadingPatients: false,
    recentLogs: [],
    showDisclaimer: false,
    handleDismissDisclaimer: vi.fn(),
    handlePatientSelect: vi.fn(),
    handleManualDetailChange: vi.fn(),
    handleSubmit: vi.fn(),
    handleUploadPatients: vi.fn(),
    handleDashboardPatientSelect: vi.fn(),
    resetForm: vi.fn(),
    clearActiveReport: vi.fn(),
    INITIAL_FORM_STATE: {},
    setSelectedPatient: vi.fn(),
    ...overrides,
  } as unknown as ReturnType<typeof useAnaestheticApp>;
}

describe('AnaestheticLogApp guarded screens', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows report recovery actions when the active report is missing', () => {
    const appState = createAppState(Screen.SUMMARY);
    mockedUseAnaestheticApp.mockReturnValue(appState);

    render(<AnaestheticLogApp />);

    expect(screen.getByRole('heading', { name: 'No active report', level: 2 })).toBeInTheDocument();
    expect(screen.getByText('This screen needs an active report. Local data may have expired, or the page was reloaded.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Go Home' }));
    fireEvent.click(screen.getByRole('button', { name: 'Go to Dashboard' }));

    expect(appState.setScreen).toHaveBeenNthCalledWith(1, Screen.LOG);
    expect(appState.setScreen).toHaveBeenNthCalledWith(2, Screen.DASHBOARD);
  });

  it.each([
    ['patient', { testingPlanData: {} as TestingPlanData }],
    ['testing plan', { selectedPatient: {} as Patient }],
  ])('shows testing-plan recovery actions when the %s is missing', (_missingValue, availableValue) => {
    const appState = createAppState(Screen.PRINT_PLAN, availableValue);
    mockedUseAnaestheticApp.mockReturnValue(appState);

    render(<AnaestheticLogApp />);

    expect(screen.getByRole('heading', { name: 'No active testing plan', level: 2 })).toBeInTheDocument();
    expect(screen.getByText('This screen needs an active testing plan. Local data may have expired, or the page was reloaded.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Go Home' }));
    fireEvent.click(screen.getByRole('button', { name: 'Go to Dashboard' }));

    expect(appState.setScreen).toHaveBeenNthCalledWith(1, Screen.LOG);
    expect(appState.setScreen).toHaveBeenNthCalledWith(2, Screen.DASHBOARD);
  });
});
