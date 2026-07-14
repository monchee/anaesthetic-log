import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Screen } from '@/types';
import { createMockPatient } from '@/src/test/factories/patientFactory';
import { createMockLogFormData } from '@/src/test/factories/testingDataFactory';
import { TestingScreen } from './TestingScreens';

vi.mock('@core/components/ScreenLayout', () => ({
  ScreenLayout: ({ children }: { children: React.ReactNode }) => (
    <React.Suspense fallback={<div>Loading</div>}>{children}</React.Suspense>
  ),
}));

vi.mock('@features/testing/components/TestingLogForm', () => ({
  default: () => <div>Testing log form</div>,
}));

const layoutProps = {
  setScreen: vi.fn(),
  currentScreen: Screen.TESTING,
  databaseDate: '',
  showDisclaimer: false,
  isCustomData: false,
  onDismissDisclaimer: vi.fn(),
  onUploadPatients: vi.fn(),
  csvUploadSheetOpen: false,
  onCSVUploadSheetOpenChange: vi.fn(),
};

function renderTestingScreen(selectedPatient: ReturnType<typeof createMockPatient> | null) {
  render(
    <TestingScreen
      layoutProps={layoutProps}
      selectedPatient={selectedPatient}
      formData={createMockLogFormData({ firstName: 'Manual', lastName: 'Patient', mrn: 'M-001' })}
      setFormData={vi.fn()}
      lastDraftSavedAt={null}
      isSavingDraft={false}
      onBack={vi.fn()}
      onSubmit={vi.fn()}
    />,
  );
}

describe('TestingScreen high-risk clinical context', () => {
  it('renders matching chips below the patient identity bar', async () => {
    renderTestingScreen(createMockPatient({
      history: {
        ...createMockPatient().history,
        highRiskMeds: ['beta-blocker'],
        conditions: ['asthmatic'],
      },
    }));

    const identityBar = await screen.findByLabelText('Patient identity');
    const context = await screen.findByRole('region', { name: 'High-risk clinical context' });
    expect(identityBar.compareDocumentPosition(context) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(within(context).getByText('Beta-blocker')).toBeInTheDocument();
    expect(within(context).getByText('Asthma')).toBeInTheDocument();
  });

  it('renders no chips and does not crash for manual entry without a selected patient', async () => {
    expect(() => renderTestingScreen(null)).not.toThrow();

    expect(await screen.findByLabelText('Patient identity')).toHaveTextContent('PATIENT, Manual');
    expect(screen.queryByRole('region', { name: 'High-risk clinical context' })).not.toBeInTheDocument();
  });
});
