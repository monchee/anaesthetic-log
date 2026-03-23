import { LogFormData, DrugTestRow, TestingPlanData } from '../../../types';

/**
 * Factory function to create mock LogFormData for testing
 */
export function createMockLogFormData(overrides?: Partial<LogFormData>): LogFormData {
  const defaultFormData: LogFormData = {
    mrn: 'MRN-001',
    firstName: 'John',
    lastName: 'Doe',
    visitDate: new Date().toISOString().split('T')[0],
    controls: {
      histamineSpt: '5',
      salineSpt: '0',
      salineIdt: '0',
    },
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
  };

  return { ...defaultFormData, ...overrides };
}

/**
 * Factory function to create mock DrugTestRow
 */
export function createMockDrugTestRow(overrides?: Partial<DrugTestRow>): DrugTestRow {
  const defaultRow: DrugTestRow = {
    id: `drug-${Date.now()}`,
    drugName: 'Rocuronium',
    sptWheal: '',
    idt100: '',
    idt10: '',
    idtNeat: '',
  };

  return { ...defaultRow, ...overrides };
}

/**
 * Create a list of mock drug test rows
 */
export function createMockDrugTestPanel(count: number = 3): DrugTestRow[] {
  const drugs = ['Rocuronium', 'Propofol', 'Fentanyl', 'Midazolam', 'Lignocaine'];
  return Array.from({ length: count }, (_, i) => 
    createMockDrugTestRow({
      id: `drug-${i}`,
      drugName: drugs[i % drugs.length],
    })
  );
}

/**
 * Factory function to create mock TestingPlanData
 */
export function createMockTestingPlanData(overrides?: Partial<TestingPlanData>): TestingPlanData {
  const defaultPlanData: TestingPlanData = {
    selectedDrugs: ['Rocuronium', 'Propofol'],
    customDrugs: [],
    notes: 'Standard testing protocol',
    urgent: false,
    reactionDate: '',
    documentsToChase: {
      tryptases: false,
      anaestheticChart: false,
      other: false,
      otherText: '',
    },
  };

  return { ...defaultPlanData, ...overrides };
}

/**
 * Create a complete LogFormData with test results
 */
export function createCompletedLogFormData(): LogFormData {
  return createMockLogFormData({
    controls: {
      histamineSpt: '5',
      salineSpt: '0',
      salineIdt: '0',
    },
    testPanel: [
      createMockDrugTestRow({
        drugName: 'Rocuronium',
        sptWheal: '0',
        idt100: '0',
        idt10: '0',
        idtNeat: '0',
      }),
      createMockDrugTestRow({
        drugName: 'Propofol',
        sptWheal: '0',
        idt100: '0',
        idt10: '0',
        idtNeat: '0',
      }),
    ],
    proceedToChallenge: true,
    challengeDrug: 'Rocuronium',
    outcome: 'SUCCESS',
    plan: 'Patient tolerated all tests. Safe to use tested agents.',
  });
}
