import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Screen } from '@/types';
import { createMockLogFormData } from '@/src/test/factories/testingDataFactory';
import { LogScreen } from './LogScreen';

vi.mock('@core/components/ScreenLayout', () => ({
  ScreenLayout: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@features/patients/components/PatientSelector', () => ({
  default: () => <div>Patient selector</div>,
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

  it('renders quick-start actions when no patient is selected', () => {
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

    expect(screen.getByRole('button', { name: /Upload REDCap export & review records/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Open Allergy Testing/i })).toBeInTheDocument();
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
