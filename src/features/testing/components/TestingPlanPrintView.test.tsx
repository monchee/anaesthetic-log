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
  it('prints stacked diluent text in the SPT preparation column and omits challenge protocols', () => {
    render(
      <TestingPlanPrintView
        patient={patient}
        data={baseData}
        drugCategories={{ Cephalosporins: ['Cefazolin'] }}
        onProceed={vi.fn()}
      />
    );

    expect(screen.getByRole('columnheader', { name: 'SPT Preparation' })).toBeInTheDocument();
    expect(screen.queryByRole('columnheader', { name: 'Diluent' })).not.toBeInTheDocument();
    expect(screen.getAllByText('in 0.9% sodium chloride (reconstitute with WFI)')).toHaveLength(2);
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
});
