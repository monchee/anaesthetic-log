import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Screen, Patient } from '@/types';
import { createMockLogFormData } from '@/src/test/factories/testingDataFactory';
import { createMockPatient } from '@/src/test/factories/patientFactory';
import { LogScreen } from './LogScreen';

vi.mock('@core/components/ScreenLayout', () => ({
  ScreenLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@features/patients/components/PatientSelector', () => ({
  default: ({ onSelectPatient }: { onSelectPatient: (p: Patient) => void }) => (
    <div>
      <span>Patient selector</span>
      <button
        type="button"
        onClick={() =>
          onSelectPatient(createMockPatient({ id: 'new-patient-99', firstName: 'Sarah', lastName: 'Connor' }))
        }
      >
        Select Candidate Patient
      </button>
    </div>
  ),
}));

describe('LogScreen clear-report confirmation', () => {
  it('names the patient and irreversible consequence, then clears the report', () => {
    const onClearActiveReport = vi.fn();

    function Harness() {
      const [confirmClearOpen, setConfirmClearOpen] = React.useState(false);

      return (
        <LogScreen
          layoutProps={{
            setScreen: vi.fn(),
            currentScreen: Screen.LOG,
            databaseDate: '',
            showDisclaimer: false,
            isCustomData: false,
            onDismissDisclaimer: vi.fn(),
            onUploadPatients: vi.fn(),
            csvUploadSheetOpen: false,
            onCSVUploadSheetOpenChange: vi.fn(),
          }}
          appSubtitle=""
          selectedPatient={null}
          lastSavedRecord={createMockLogFormData({ firstName: 'Avery', lastName: 'Ng' })}
          activeReportSavedAt={Date.now()}
          isPatientDialogOpen={false}
          setIsPatientDialogOpen={vi.fn()}
          confirmClearOpen={confirmClearOpen}
          setConfirmClearOpen={setConfirmClearOpen}
          patients={[]}
          onPatientSelect={vi.fn()}
          onManualDetailChange={vi.fn()}
          onToggleSuspectedAgent={vi.fn()}
          onSetTestingPlanData={vi.fn()}
          onProceedToTesting={vi.fn()}
          onStartDirectTesting={vi.fn()}
          onClearActiveReport={onClearActiveReport}
        />
      );
    }

    render(<Harness />);

    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));

    expect(screen.getByRole('dialog')).toHaveTextContent('Clear active report?');
    expect(screen.getByRole('dialog')).toHaveTextContent(
      'This permanently removes the current report for Avery Ng and any in-progress testing draft from this device. This cannot be undone.',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Clear report' }));

    expect(onClearActiveReport).toHaveBeenCalledOnce();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

describe('LogScreen Home quick-start actions', () => {
  const defaultLayoutProps = {
    setScreen: vi.fn(),
    currentScreen: Screen.LOG,
    databaseDate: '',
    showDisclaimer: false,
    isCustomData: false,
    onDismissDisclaimer: vi.fn(),
    onUploadPatients: vi.fn(),
    csvUploadSheetOpen: false,
    onCSVUploadSheetOpenChange: vi.fn(),
  };

  it('renders quick-start actions with descriptions and distinctive semantic colour styling when no patient is selected', () => {
    render(
      <LogScreen
        layoutProps={defaultLayoutProps}
        appSubtitle=""
        selectedPatient={null}
        lastSavedRecord={null}
        activeReportSavedAt={null}
        isPatientDialogOpen={false}
        setIsPatientDialogOpen={vi.fn()}
        confirmClearOpen={false}
        setConfirmClearOpen={vi.fn()}
        patients={[]}
        onPatientSelect={vi.fn()}
        onManualDetailChange={vi.fn()}
        onToggleSuspectedAgent={vi.fn()}
        onSetTestingPlanData={vi.fn()}
        onProceedToTesting={vi.fn()}
        onStartDirectTesting={vi.fn()}
        onClearActiveReport={vi.fn()}
      />
    );

    const uploadBtn = screen.getByRole('button', { name: /Upload REDCap export & review records/i });
    const testingBtn = screen.getByRole('button', { name: /Open Allergy Testing/i });

    expect(uploadBtn).toBeInTheDocument();
    expect(testingBtn).toBeInTheDocument();
    expect(uploadBtn).toHaveTextContent('Import patient records from a REDCap CSV export and review clinic analytics in the Dashboard.');
    expect(testingBtn).toHaveTextContent('Start a fresh testing session directly without selecting a patient or creating a testing plan.');

    // Cool blue/cyan treatment on REDCap upload
    expect(uploadBtn).toHaveClass('bg-sky-500/[0.04]', 'border-sky-500/30', 'focus-visible:ring-sky-500');
    // Warm amber/orange treatment on Allergy Testing
    expect(testingBtn).toHaveClass('bg-amber-500/[0.04]', 'border-amber-500/30', 'focus-visible:ring-amber-500');
    // Preserved shared button traits
    expect(uploadBtn).toHaveClass('btn-press', 'rounded-none');
    expect(testingBtn).toHaveClass('btn-press', 'rounded-none');
  });

  it('does not render quick-start actions when a patient is selected', () => {
    render(
      <LogScreen
        layoutProps={defaultLayoutProps}
        appSubtitle=""
        selectedPatient={createMockPatient({ id: '1', firstName: 'Jane', lastName: 'Doe', mrn: '12345' })}
        lastSavedRecord={null}
        activeReportSavedAt={null}
        isPatientDialogOpen={false}
        setIsPatientDialogOpen={vi.fn()}
        confirmClearOpen={false}
        setConfirmClearOpen={vi.fn()}
        patients={[]}
        onPatientSelect={vi.fn()}
        onManualDetailChange={vi.fn()}
        onToggleSuspectedAgent={vi.fn()}
        onSetTestingPlanData={vi.fn()}
        onProceedToTesting={vi.fn()}
        onStartDirectTesting={vi.fn()}
        onClearActiveReport={vi.fn()}
      />
    );

    expect(screen.queryByRole('button', { name: /Upload REDCap export & review records/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Open Allergy Testing/i })).not.toBeInTheDocument();
  });

  it('opens the CSV upload sheet when upload quick-action is clicked', () => {
    const onCSVUploadSheetOpenChange = vi.fn();
    render(
      <LogScreen
        layoutProps={{
          ...defaultLayoutProps,
          onCSVUploadSheetOpenChange,
        }}
        appSubtitle=""
        selectedPatient={null}
        lastSavedRecord={null}
        activeReportSavedAt={null}
        isPatientDialogOpen={false}
        setIsPatientDialogOpen={vi.fn()}
        confirmClearOpen={false}
        setConfirmClearOpen={vi.fn()}
        patients={[]}
        onPatientSelect={vi.fn()}
        onManualDetailChange={vi.fn()}
        onToggleSuspectedAgent={vi.fn()}
        onSetTestingPlanData={vi.fn()}
        onProceedToTesting={vi.fn()}
        onStartDirectTesting={vi.fn()}
        onClearActiveReport={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Upload REDCap export & review records/i }));
    expect(onCSVUploadSheetOpenChange).toHaveBeenCalledWith(true);
  });

  it('calls onStartDirectTesting immediately when clicking Open Allergy Testing without unsaved draft', () => {
    const onStartDirectTesting = vi.fn();
    render(
      <LogScreen
        layoutProps={defaultLayoutProps}
        appSubtitle=""
        selectedPatient={null}
        lastSavedRecord={null}
        activeReportSavedAt={null}
        isPatientDialogOpen={false}
        setIsPatientDialogOpen={vi.fn()}
        confirmClearOpen={false}
        setConfirmClearOpen={vi.fn()}
        patients={[]}
        onPatientSelect={vi.fn()}
        onManualDetailChange={vi.fn()}
        onToggleSuspectedAgent={vi.fn()}
        onSetTestingPlanData={vi.fn()}
        onProceedToTesting={vi.fn()}
        onStartDirectTesting={onStartDirectTesting}
        onClearActiveReport={vi.fn()}
        isTestingDraftDirty={false}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Open Allergy Testing/i }));
    expect(onStartDirectTesting).toHaveBeenCalledOnce();
  });

  it('prompts confirmation when clicking Open Allergy Testing with an unsaved testing draft', () => {
    const onStartDirectTesting = vi.fn();
    render(
      <LogScreen
        layoutProps={defaultLayoutProps}
        appSubtitle=""
        selectedPatient={null}
        lastSavedRecord={null}
        activeReportSavedAt={null}
        isPatientDialogOpen={false}
        setIsPatientDialogOpen={vi.fn()}
        confirmClearOpen={false}
        setConfirmClearOpen={vi.fn()}
        patients={[]}
        onPatientSelect={vi.fn()}
        onManualDetailChange={vi.fn()}
        onToggleSuspectedAgent={vi.fn()}
        onSetTestingPlanData={vi.fn()}
        onProceedToTesting={vi.fn()}
        onStartDirectTesting={onStartDirectTesting}
        onClearActiveReport={vi.fn()}
        isTestingDraftDirty={true}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Open Allergy Testing/i }));

    expect(onStartDirectTesting).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toHaveTextContent('Start fresh testing session?');
    expect(screen.getByRole('dialog')).toHaveTextContent('You have unsaved changes in your current testing session.');

    fireEvent.click(screen.getByRole('button', { name: 'Start fresh session' }));
    expect(onStartDirectTesting).toHaveBeenCalledOnce();
  });
});

describe('LogScreen Workflow Mode ordering', () => {
  const baseProps = {
    layoutProps: {
      setScreen: vi.fn(),
      currentScreen: Screen.LOG,
      databaseDate: '',
      showDisclaimer: false,
      isCustomData: false,
      onDismissDisclaimer: vi.fn(),
      onUploadPatients: vi.fn(),
      csvUploadSheetOpen: false,
      onCSVUploadSheetOpenChange: vi.fn(),
    },
    appSubtitle: '',
    selectedPatient: null,
    lastSavedRecord: null,
    activeReportSavedAt: null,
    isPatientDialogOpen: false,
    setIsPatientDialogOpen: vi.fn(),
    confirmClearOpen: false,
    setConfirmClearOpen: vi.fn(),
    patients: [],
    onPatientSelect: vi.fn(),
    onManualDetailChange: vi.fn(),
    onToggleSuspectedAgent: vi.fn(),
    onSetTestingPlanData: vi.fn(),
    onProceedToTesting: vi.fn(),
    onStartDirectTesting: vi.fn(),
    onClearActiveReport: vi.fn(),
  };

  it('orders Patient Selection before Quick-start actions in clinician mode', () => {
    render(<LogScreen {...baseProps} workflowMode="clinician" />);

    const patientCard = screen.getByText('Patient Selection');
    const directAction = screen.getByRole('button', { name: /Open Allergy Testing/i });

    // Compare document order
    expect(patientCard.compareDocumentPosition(directAction)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
  });

  it('orders Quick-start actions before Patient Selection in nurse mode', () => {
    render(<LogScreen {...baseProps} workflowMode="nurse" />);

    const directAction = screen.getByRole('button', { name: /Open Allergy Testing/i });
    const patientCard = screen.getByText('Patient Selection');

    // In nurse mode, directAction should precede patientCard
    expect(directAction.compareDocumentPosition(patientCard)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
  });
});

describe('LogScreen active work banners', () => {
  const baseProps = {
    layoutProps: {
      setScreen: vi.fn(),
      currentScreen: Screen.LOG,
      databaseDate: '',
      showDisclaimer: false,
      isCustomData: false,
      onDismissDisclaimer: vi.fn(),
      onUploadPatients: vi.fn(),
      csvUploadSheetOpen: false,
      onCSVUploadSheetOpenChange: vi.fn(),
    },
    appSubtitle: '',
    selectedPatient: null,
    lastSavedRecord: createMockLogFormData({ firstName: 'Alex', lastName: 'Rivera' }),
    activeReportSavedAt: Date.now() - 5000,
    isPatientDialogOpen: false,
    setIsPatientDialogOpen: vi.fn(),
    confirmClearOpen: false,
    setConfirmClearOpen: vi.fn(),
    patients: [],
    onPatientSelect: vi.fn(),
    onManualDetailChange: vi.fn(),
    onToggleSuspectedAgent: vi.fn(),
    onSetTestingPlanData: vi.fn(),
    onProceedToTesting: vi.fn(),
    onStartDirectTesting: vi.fn(),
    onClearActiveReport: vi.fn(),
    isTestingDraftDirty: true,
  };

  it('orders Active Report before Testing Draft in clinician mode', () => {
    render(<LogScreen {...baseProps} workflowMode="clinician" />);

    const activeReportText = screen.getByText(/Active report:/i);
    const draftText = screen.getByText(/In-progress testing session/i);

    expect(activeReportText.compareDocumentPosition(draftText)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
  });

  it('orders Testing Draft before Active Report in nurse mode', () => {
    render(<LogScreen {...baseProps} workflowMode="nurse" />);

    const draftText = screen.getByText(/In-progress testing session/i);
    const activeReportText = screen.getByText(/Active report:/i);

    expect(draftText.compareDocumentPosition(activeReportText)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
  });
});

describe('LogScreen dirty patient switch confirmation', () => {
  it('guards selecting a different patient when testing draft is dirty', () => {
    const onPatientSelect = vi.fn();
    const onResetForm = vi.fn();

    render(
      <LogScreen
        layoutProps={{
          setScreen: vi.fn(),
          currentScreen: Screen.LOG,
          databaseDate: '',
          showDisclaimer: false,
          isCustomData: false,
          onDismissDisclaimer: vi.fn(),
          onUploadPatients: vi.fn(),
          csvUploadSheetOpen: false,
          onCSVUploadSheetOpenChange: vi.fn(),
        }}
        appSubtitle=""
        selectedPatient={createMockPatient({ id: 'current-patient-1', firstName: 'John', lastName: 'Doe' })}
        lastSavedRecord={null}
        activeReportSavedAt={null}
        isPatientDialogOpen={false}
        setIsPatientDialogOpen={vi.fn()}
        confirmClearOpen={false}
        setConfirmClearOpen={vi.fn()}
        patients={[]}
        onPatientSelect={onPatientSelect}
        onManualDetailChange={vi.fn()}
        onToggleSuspectedAgent={vi.fn()}
        onSetTestingPlanData={vi.fn()}
        onProceedToTesting={vi.fn()}
        onStartDirectTesting={vi.fn()}
        onClearActiveReport={vi.fn()}
        isTestingDraftDirty={true}
        onResetForm={onResetForm}
      />
    );

    // Click candidate patient
    fireEvent.click(screen.getByRole('button', { name: 'Select Candidate Patient' }));

    // Should open confirmation dialog and not switch immediately
    expect(screen.getByRole('dialog')).toHaveTextContent('Switch patient?');
    expect(screen.getByRole('dialog')).toHaveTextContent('You have unsaved changes in your current testing session.');
    expect(onPatientSelect).not.toHaveBeenCalled();

    // Confirm switch
    fireEvent.click(screen.getByRole('button', { name: 'Switch patient' }));

    expect(onResetForm).toHaveBeenCalledOnce();
    expect(onPatientSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'new-patient-99', firstName: 'Sarah' })
    );
  });
});
