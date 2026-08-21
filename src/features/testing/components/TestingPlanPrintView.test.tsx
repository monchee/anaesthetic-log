import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import TestingPlanPrintView from './TestingPlanPrintView';
import { TestingPlanData } from '@shared/types';
import { createMockPatient } from '@/src/test/factories/patientFactory';
import { formatTestingPlanAsText } from '@shared/utils/testingPlanFormatter';
import { showToast } from '@shared/utils';

const patient = createMockPatient({
  id: 'PRINT-001',
  firstName: 'Avery',
  lastName: 'Ng',
  mrn: 'MRN-PRINT',
  history: {
    ...createMockPatient().history,
    date: '2024-03-15',
  },
});

const baseData: TestingPlanData = {
  selectedDrugs: ['Cefazolin'],
  selectedProtocols: { Cefazolin: 0 },
  customDrugs: [],
  notes: '',
  urgent: false,
  reactionDate: '2024-03-15',
  documentsToChase: {
    tryptases: false,
    anaestheticChart: false,
    other: false,
    otherText: '',
  },
};

describe('TestingPlanPrintView', () => {
  const originalClipboard = navigator.clipboard;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: originalClipboard,
      configurable: true,
      writable: true,
    });
  });

  it('renders flat SPT/IDT rows with Concentration column and omits challenge protocols', () => {
    render(
      <TestingPlanPrintView
        patient={patient}
        data={baseData}
        drugCategories={{ Cephalosporins: ['Cefazolin'] }}
        onProceed={vi.fn()}
      />
    );

    expect(screen.getByRole('columnheader', { name: 'Concentration' })).toBeInTheDocument();
    expect(screen.queryByRole('columnheader', { name: 'SPT Preparation' })).not.toBeInTheDocument();
    expect(screen.getByText('in 0.9% sodium chloride (reconstitute with 10 mL WFI)')).toBeInTheDocument();
    expect(screen.queryByText(/Challenge \/ Desensitisation Protocols/i)).not.toBeInTheDocument();
  });

  it('prints a bordered not-listed tag for REDCap Others custom entries', () => {
    render(
      <TestingPlanPrintView
        patient={patient}
        data={{
          ...baseData,
          selectedDrugs: ['Cefazolin', 'Sodium citrate flush'],
          customDrugs: [{
            name: 'Sodium citrate flush',
            sptConcentration: '',
            idtSteps: [],
            includeInChallenge: false,
            fromRedcapOther: true,
          }],
        }}
        drugCategories={{ Cephalosporins: ['Cefazolin'] }}
        onProceed={vi.fn()}
      />
    );

    expect(screen.getByText('Sodium citrate flush')).toBeInTheDocument();
    expect(screen.getByText('not listed')).toHaveClass('border');
  });

  it('prints a black-and-white-safe pharmacy warning only for flagged drugs', () => {
    render(
      <TestingPlanPrintView
        patient={patient}
        data={{
          ...baseData,
          selectedDrugs: ['Cephalexin', 'Rocuronium'],
          selectedProtocols: { Cephalexin: 0, Rocuronium: 0 },
        }}
        drugCategories={{
          Penicillins: ['Cephalexin'],
          'Muscle Relaxants': ['Rocuronium'],
        }}
        onProceed={vi.fn()}
      />
    );

    const warning = screen.getByText('⚠ Confirm preparation with pharmacy');
    expect(warning).toHaveClass('border-status-warning', 'text-status-warning', 'print:border-black', 'print:bg-white', 'print:text-black', 'font-bold');
    expect(screen.getAllByText(/Confirm preparation with pharmacy/)).toHaveLength(1);
  });

  it('renders exact IDT preparation text in the concentration cell when present', () => {
    render(
      <TestingPlanPrintView
        patient={patient}
        data={{
          ...baseData,
          selectedDrugs: ['Pantoprazole'],
          selectedProtocols: { Pantoprazole: 0 },
        }}
        drugCategories={{
          'Proton Pump Inhibitors': ['Pantoprazole'],
        }}
        onProceed={vi.fn()}
      />
    );

    // Check exact preparation strings in IDT rows
    expect(screen.getByText('0.1 mL of 0.04 mg/mL + 0.9 mL NS')).toBeInTheDocument();
    expect(screen.getByText('0.1 mL of 0.4 mg/mL + 0.9 mL NS')).toBeInTheDocument();
    expect(screen.getByText('0.1 mL neat + 0.9 mL NS')).toBeInTheDocument();
  });

  it('renders under-review badge, exact reviewNote, and source link next to first row for generated drugs', () => {
    render(
      <TestingPlanPrintView
        patient={patient}
        data={{
          ...baseData,
          selectedDrugs: ['Pantoprazole'],
          selectedProtocols: { Pantoprazole: 0 },
        }}
        drugCategories={{
          'Proton Pump Inhibitors': ['Pantoprazole'],
        }}
        onProceed={vi.fn()}
      />
    );

    const underReviewBadge = screen.getByText(/Under review/i);
    expect(underReviewBadge).toBeInTheDocument();
    expect(underReviewBadge.closest('.border-status-warning')).toHaveClass('print:border-black', 'print:bg-white', 'print:text-black');

    expect(screen.getByText('The Spreadsheet 2 spreadsheet labels the SPT concentration as "Neat (40 mg/mL)". This is a spreadsheet labelling error — the correct reconstituted concentration is 4 mg/mL (40 mg powder + 10 mL NS).')).toBeInTheDocument();

    const link = screen.getByRole('link', { name: /https:\/\/scratch\.yuson\.au\/drugs\/pantoprazole\//i });
    expect(link).toHaveAttribute('href', 'https://scratch.yuson.au/drugs/pantoprazole/');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('does not render a source link for DREAM-only protocols', () => {
    render(
      <TestingPlanPrintView
        patient={patient}
        data={{
          ...baseData,
          selectedDrugs: ['Cephalexin'],
          selectedProtocols: { Cephalexin: 0 },
        }}
        drugCategories={{
          Penicillins: ['Cephalexin'],
        }}
        onProceed={vi.fn()}
      />
    );

    expect(screen.queryByRole('link', { name: /scratch\.yuson\.au/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/scratch\.yuson\.au/i)).not.toBeInTheDocument();
  });

  it('fails closed on invalid protocol index with accessible review alert and no guessed doses', () => {
    render(
      <TestingPlanPrintView
        patient={patient}
        data={{
          ...baseData,
          selectedDrugs: ['Ketamine'],
          selectedProtocols: { Ketamine: 99 },
        }}
        drugCategories={{
          Hypnotics: ['Ketamine'],
        }}
        onProceed={vi.fn()}
      />
    );

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('⚠ Protocol selection requires review');
    expect(screen.getByText('Ketamine')).toBeInTheDocument();
    expect(screen.queryByText('1:1,000')).not.toBeInTheDocument();
    expect(screen.queryByText('1:100')).not.toBeInTheDocument();
  });


  it('renders the screen-only "Copy as Text" button in controls', () => {
    render(
      <TestingPlanPrintView
        patient={patient}
        data={baseData}
        drugCategories={{ Cephalosporins: ['Cefazolin'] }}
        onProceed={vi.fn()}
      />
    );

    const copyButton = screen.getByRole('button', { name: /Copy as Text/i });
    expect(copyButton).toBeInTheDocument();
  });

  it('copies exact formatted testing plan text to clipboard and shows success toast after confirmation', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      configurable: true,
      writable: true,
    });
    const toastSuccessSpy = vi.spyOn(showToast, 'success');

    const drugCategories = { Cephalosporins: ['Cefazolin'] };
    const expectedBody = formatTestingPlanAsText(patient, baseData, drugCategories);

    render(
      <TestingPlanPrintView
        patient={patient}
        data={baseData}
        drugCategories={drugCategories}
        onProceed={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Copy as Text/i }));

    // Confirmation dialog opens
    expect(screen.getByText('Confirm Copy: Testing Request Form')).toBeInTheDocument();
    expect(screen.getByText('NG, Avery')).toBeInTheDocument();
    expect(screen.getAllByText('MRN-PRINT').length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: /Copy to Clipboard/i }));

    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalledTimes(1);
      expect(writeTextMock).toHaveBeenCalledWith(expectedBody);
      expect(toastSuccessSpy).toHaveBeenCalledWith('Testing request copied to clipboard');
    });
  });

  it('shows error toast when navigator.clipboard.writeText rejects after confirmation', async () => {
    const writeTextMock = vi.fn().mockRejectedValue(new Error('Permission denied'));
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      configurable: true,
      writable: true,
    });
    const toastErrorSpy = vi.spyOn(showToast, 'error');

    render(
      <TestingPlanPrintView
        patient={patient}
        data={baseData}
        drugCategories={{ Cephalosporins: ['Cefazolin'] }}
        onProceed={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Copy as Text/i }));
    fireEvent.click(screen.getByRole('button', { name: /Copy to Clipboard/i }));

    await waitFor(() => {
      expect(toastErrorSpy).toHaveBeenCalledWith('Failed to copy testing request to clipboard');
    });
  });

  it('shows error toast when Clipboard API is unavailable after confirmation', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: undefined,
      configurable: true,
      writable: true,
    });
    const toastErrorSpy = vi.spyOn(showToast, 'error');

    render(
      <TestingPlanPrintView
        patient={patient}
        data={baseData}
        drugCategories={{ Cephalosporins: ['Cefazolin'] }}
        onProceed={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Copy as Text/i }));
    fireEvent.click(screen.getByRole('button', { name: /Copy to Clipboard/i }));

    await waitFor(() => {
      expect(toastErrorSpy).toHaveBeenCalledWith('Failed to copy testing request to clipboard');
    });
  });

  it('gates Email action with confirmation showing nurse recipient destination', () => {
    render(
      <TestingPlanPrintView
        patient={patient}
        data={baseData}
        drugCategories={{ Cephalosporins: ['Cefazolin'] }}
        onProceed={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Email to Allergy Nurse/i }));

    expect(screen.getByText('Confirm Email: Testing Request Form')).toBeInTheDocument();
    expect(screen.getByText('SLHD-RPA-allergynurses@health.nsw.gov.au')).toBeInTheDocument();
    expect(screen.getByText('Identified Clinical Request Form')).toBeInTheDocument();
  });

  it('gates Print action with confirmation dialog', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
    render(
      <TestingPlanPrintView
        patient={patient}
        data={baseData}
        drugCategories={{ Cephalosporins: ['Cefazolin'] }}
        onProceed={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Print Now/i }));

    expect(screen.getByText('Confirm Print: Testing Request Form')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Open Print Dialog/i }));

    expect(printSpy).toHaveBeenCalledTimes(1);
  });
});
