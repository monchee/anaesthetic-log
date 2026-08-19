import { describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDashboardAnalytics } from './useDashboardAnalytics';
import { createMockPatient, createMockPatientHistory } from '@/src/test/factories/patientFactory';
import { createMockLogFormData, createMockDrugTestRow } from '@/src/test/factories/testingDataFactory';

describe('useDashboardAnalytics', () => {
  const defaultDrugOptions = ['Rocuronium', 'Vecuronium', 'Propofol', 'Cefazolin', 'Fentanyl'];
  const defaultDrugCategories = {
    'NMBAs': ['Rocuronium', 'Vecuronium'],
    'Induction': ['Propofol'],
    'Antibiotics': ['Cefazolin'],
    'Opioids': ['Fentanyl'],
  };

  it('computes empty metrics when no patients or logs are provided', () => {
    const { result } = renderHook(() =>
      useDashboardAnalytics({
        existingPatients: [],
        recentLogs: [],
        drugOptions: defaultDrugOptions,
        drugCategories: defaultDrugCategories,
      })
    );

    expect(result.current.totalPatients).toBe(0);
    expect(result.current.redcapRecordCount).toBe(0);
    expect(result.current.sessionLogCount).toBe(0);
    expect(result.current.grade3PlusCount).toBe(0);
    expect(result.current.redcapGrade3PlusCount).toBe(0);
    expect(result.current.abandonedCount).toBe(0);
    expect(result.current.avgReactionTime).toBe(0);
    expect(result.current.mostCommonAgent).toBe('N/A');
    expect(result.current.mostCommonAgentCount).toBe(0);
    expect(result.current.topAgentsByCount).toEqual([]);
    expect(result.current.gradeCounts).toEqual({
      I: 0,
      II: 0,
      III: 0,
      IV: 0,
      Ungraded: 0,
    });
  });

  it('aggregates REDCap patient grades, severity counts, and abandoned procedures', () => {
    const patients = [
      createMockPatient({
        id: 'P1',
        history: createMockPatientHistory({
          grade: 'Grade IV (Cardiac Arrest)',
          procedureOutcome: 'abandoned due to arrest',
          inductionTime: '09:00',
          reactionTime: '09:15',
          suspectedAgents: ['Rocuronium'],
          medications: [],
        }),
      }),
      createMockPatient({
        id: 'P2',
        history: createMockPatientHistory({
          grade: 'Grade III',
          procedureOutcome: 'Completed',
          inductionTime: '10:00',
          reactionTime: '10:25',
          suspectedAgents: ['Rocuronium', 'Propofol'],
          medications: [],
        }),
      }),
      createMockPatient({
        id: 'P3',
        history: createMockPatientHistory({
          grade: 'Grade II',
          procedureOutcome: 'Completed',
          inductionTime: '',
          reactionTime: '',
          suspectedAgents: ['Cefazolin'],
          medications: [],
        }),
      }),
      createMockPatient({
        id: 'P4',
        history: createMockPatientHistory({
          grade: 'Grade I',
          procedureOutcome: '1', // legacy code for abandoned
          inductionTime: '',
          reactionTime: '',
          suspectedAgents: ['Fentanyl'],
          medications: [],
        }),
      }),
      createMockPatient({
        id: 'P5',
        history: createMockPatientHistory({
          grade: 'Ungraded',
          procedureOutcome: 'Completed',
          inductionTime: '',
          reactionTime: '',
          suspectedAgents: ['UnlistedDrug'],
          medications: [],
        }),
      }),
    ];

    const { result } = renderHook(() =>
      useDashboardAnalytics({
        existingPatients: patients,
        recentLogs: [],
        drugOptions: defaultDrugOptions,
        drugCategories: defaultDrugCategories,
      })
    );

    expect(result.current.totalPatients).toBe(5);
    expect(result.current.redcapRecordCount).toBe(5);
    expect(result.current.grade3PlusCount).toBe(2);
    expect(result.current.redcapGrade3PlusCount).toBe(2);
    expect(result.current.abandonedCount).toBe(2); // P1 (abandoned) + P4 ('1')
    expect(result.current.gradeCounts).toEqual({
      IV: 1,
      III: 1,
      II: 1,
      I: 1,
      Ungraded: 1,
    });

    // Time: P1 (15m) + P2 (25m) = 40 / 2 = 20m average
    expect(result.current.avgReactionTime).toBe(20);

    // Most common agent: Rocuronium (2 occurrences: P1, P2)
    expect(result.current.mostCommonAgent).toBe('Rocuronium');
    expect(result.current.mostCommonAgentCount).toBe(2);
  });

  it('aggregates newly added session logs with positive skin tests and challenge reactions', () => {
    const recentLogs = [
      createMockLogFormData({
        outcome: 'UNSUCCESS',
        interventionType: 'Adrenaline',
        reactionTime: '10',
        proceedToChallenge: true,
        challengeDrug: 'Cefazolin',
        testPanel: [
          createMockDrugTestRow({
            drugName: 'Rocuronium',
            sptWheal: '6',
            idtResults: ['5', '7'],
          }),
        ],
      }),
      createMockLogFormData({
        outcome: 'UNSUCCESS',
        interventionType: 'Antihistamines',
        reactionTime: '20',
        proceedToChallenge: false,
        testPanel: [
          createMockDrugTestRow({
            drugName: 'Propofol',
            sptWheal: '4',
            idtResults: ['0'],
          }),
        ],
      }),
      createMockLogFormData({
        outcome: 'SUCCESS',
        proceedToChallenge: true,
        challengeDrug: 'Vecuronium',
        testPanel: [],
      }),
    ];

    const { result } = renderHook(() =>
      useDashboardAnalytics({
        existingPatients: [],
        recentLogs,
        drugOptions: defaultDrugOptions,
        drugCategories: defaultDrugCategories,
      })
    );

    expect(result.current.sessionLogCount).toBe(3);
    expect(result.current.totalPatients).toBe(3);
    // UNSUCCESS + Adrenaline -> Grade III; UNSUCCESS + other -> Grade I; SUCCESS -> Ungraded
    expect(result.current.gradeCounts.III).toBe(1);
    expect(result.current.gradeCounts.I).toBe(1);
    expect(result.current.gradeCounts.Ungraded).toBe(1);
    expect(result.current.grade3PlusCount).toBe(1);

    // Reaction times: (10 + 20) / 2 = 15m
    expect(result.current.avgReactionTime).toBe(15);
  });

  it('maps custom/unlisted drugs to "Other" and appends to statsByCategory', () => {
    const patients = [
      createMockPatient({
        history: createMockPatientHistory({
          suspectedAgents: ['UnknownNovelAgent'],
          medications: [],
        }),
      }),
    ];

    const { result } = renderHook(() =>
      useDashboardAnalytics({
        existingPatients: patients,
        recentLogs: [],
        drugOptions: defaultDrugOptions,
        drugCategories: defaultDrugCategories,
      })
    );

    const othersCategory = result.current.statsByCategory.find(c => c.category === 'Others');
    expect(othersCategory).toBeDefined();
    expect(othersCategory?.stats[0].name).toBe('Other (Unlisted)');
    expect(othersCategory?.stats[0].total).toBe(1);
  });
});
