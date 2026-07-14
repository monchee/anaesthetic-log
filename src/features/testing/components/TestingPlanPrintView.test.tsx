import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import TestingPlanPrintView from './TestingPlanPrintView';
import { TestingPlanData } from '@/types';
import { createMockPatient } from '@/src/test/factories/patientFactory';

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
    expect(warning).toHaveClass('print:border-black', 'print:bg-white', 'print:text-black', 'font-bold');
    expect(screen.getAllByText(/Confirm preparation with pharmacy/)).toHaveLength(1);
  });
});
