import { describe, expect, it } from 'vitest';
import { buildTestPanelFromPlan } from './buildTestPanelFromPlan';
import { TestingPlanData } from '../types';

describe('buildTestPanelFromPlan', () => {
  describe('empty and undefined inputs', () => {
    it('returns empty testPanel when plan is undefined', () => {
      const result = buildTestPanelFromPlan(undefined);
      expect(result).toEqual({
        testPanel: [],
      });
      expect('proceedToChallenge' in result).toBe(false);
      expect('challengeDrug' in result).toBe(false);
      expect('challengeDrugCustom' in result).toBe(false);
    });

    it('returns empty testPanel when plan is null', () => {
      const result = buildTestPanelFromPlan(null);
      expect(result).toEqual({
        testPanel: [],
      });
      expect('proceedToChallenge' in result).toBe(false);
      expect('challengeDrug' in result).toBe(false);
      expect('challengeDrugCustom' in result).toBe(false);
    });

    it('returns empty testPanel when plan has empty selectedDrugs and customDrugs', () => {
      const plan: Partial<TestingPlanData> = {
        selectedDrugs: [],
        customDrugs: [],
      };
      const result = buildTestPanelFromPlan(plan);
      expect(result).toEqual({
        testPanel: [],
      });
      expect(Object.keys(result)).toEqual(['testPanel']);
    });

    it('handles plan with undefined selectedDrugs or customDrugs gracefully', () => {
      const plan: Partial<TestingPlanData> = {
        notes: 'Some notes',
      };
      const result = buildTestPanelFromPlan(plan);
      expect(result).toEqual({
        testPanel: [],
      });
      expect(Object.keys(result)).toEqual(['testPanel']);
    });
  });

  describe('standard drugs', () => {
    it('builds rows for standard drugs with default protocolIndex 0', () => {
      // Rocuronium has 2 IDT steps in DRUG_MASTERLIST
      const plan: Partial<TestingPlanData> = {
        selectedDrugs: ['Rocuronium'],
      };
      const result = buildTestPanelFromPlan(plan);

      expect(result.testPanel).toHaveLength(1);
      expect(result.testPanel[0]).toEqual({
        drugName: 'Rocuronium',
        sptWheal: '',
        idtResults: ['', ''],
        protocolIndex: 0,
        customName: '',
      });
      expect('proceedToChallenge' in result).toBe(false);
    });

    it('respects selectedProtocols index when specified', () => {
      // Ampicillin has multiple protocols in DRUG_MASTERLIST:
      // index 0: Neat SPT (3 IDT steps)
      // index 1: 1:5 SPT (3 IDT steps)
      // index 2: Control (3 IDT steps)
      const plan: Partial<TestingPlanData> = {
        selectedDrugs: ['Ampicillin'],
        selectedProtocols: {
          Ampicillin: 1,
        },
      };
      const result = buildTestPanelFromPlan(plan);

      expect(result.testPanel).toHaveLength(1);
      expect(result.testPanel[0]).toEqual({
        drugName: 'Ampicillin',
        sptWheal: '',
        idtResults: ['', '', ''],
        protocolIndex: 1,
        customName: '',
      });
    });

    it('handles drug with 1 IDT step correctly (e.g. Cis-atracurium)', () => {
      const plan: Partial<TestingPlanData> = {
        selectedDrugs: ['Cis-atracurium'],
      };
      const result = buildTestPanelFromPlan(plan);

      expect(result.testPanel).toHaveLength(1);
      expect(result.testPanel[0]).toEqual({
        drugName: 'Cis-atracurium',
        sptWheal: '',
        idtResults: [''],
        protocolIndex: 0,
        customName: '',
      });
    });

    it('handles drugs with no protocol found (unknown drug)', () => {
      const plan: Partial<TestingPlanData> = {
        selectedDrugs: ['UnknownDrugXYZ'],
        selectedProtocols: {
          UnknownDrugXYZ: 0,
        },
      };
      const result = buildTestPanelFromPlan(plan);

      expect(result.testPanel).toHaveLength(1);
      expect(result.testPanel[0]).toEqual({
        drugName: 'UnknownDrugXYZ',
        sptWheal: '',
        idtResults: [],
        protocolIndex: 0,
        customName: '',
      });
    });

    it('handles out-of-range protocolIndex gracefully (protocol undefined)', () => {
      const plan: Partial<TestingPlanData> = {
        selectedDrugs: ['Rocuronium'],
        selectedProtocols: {
          Rocuronium: 999,
        },
      };
      const result = buildTestPanelFromPlan(plan);

      expect(result.testPanel).toHaveLength(1);
      expect(result.testPanel[0]).toEqual({
        drugName: 'Rocuronium',
        sptWheal: '',
        idtResults: [],
        protocolIndex: 999,
        customName: '',
      });
    });

    it('maps multiple standard drugs preserving order', () => {
      const plan: Partial<TestingPlanData> = {
        selectedDrugs: ['Cis-atracurium', 'Rocuronium', 'Suxamethonium'],
        selectedProtocols: {
          Rocuronium: 0,
        },
      };
      const result = buildTestPanelFromPlan(plan);

      expect(result.testPanel).toHaveLength(3);
      expect(result.testPanel.map(r => r.drugName)).toEqual([
        'Cis-atracurium',
        'Rocuronium',
        'Suxamethonium',
      ]);
    });
  });

  describe('custom drugs', () => {
    it('builds custom drug rows with drugName "Other" and preserves custom fields', () => {
      const plan: Partial<TestingPlanData> = {
        customDrugs: [
          {
            name: 'Custom Agent A',
            sptConcentration: '10mg/mL',
            idtSteps: [
              { ratio: '1:100', concentration: '0.1mg/mL' },
              { ratio: '1:10', concentration: '1mg/mL' },
            ],
            includeInChallenge: false,
          },
        ],
      };
      const result = buildTestPanelFromPlan(plan);

      expect(result.testPanel).toHaveLength(1);
      expect(result.testPanel[0]).toEqual({
        drugName: 'Other',
        customName: 'Custom Agent A',
        sptWheal: '',
        idtResults: ['', ''],
        protocolIndex: 0,
        customSptConcentration: '10mg/mL',
        customIdtSteps: [
          { ratio: '1:100', concentration: '0.1mg/mL' },
          { ratio: '1:10', concentration: '1mg/mL' },
        ],
        includeInChallenge: false,
      });
      // No challenge prefill when includeInChallenge is false
      expect('proceedToChallenge' in result).toBe(false);
      expect('challengeDrug' in result).toBe(false);
      expect('challengeDrugCustom' in result).toBe(false);
    });

    it('handles custom drug with undefined idtSteps', () => {
      const plan: Partial<TestingPlanData> = {
        customDrugs: [
          {
            name: 'Custom Agent B',
          },
        ],
      };
      const result = buildTestPanelFromPlan(plan);

      expect(result.testPanel).toHaveLength(1);
      expect(result.testPanel[0]).toEqual({
        drugName: 'Other',
        customName: 'Custom Agent B',
        sptWheal: '',
        idtResults: [],
        protocolIndex: 0,
        customSptConcentration: undefined,
        customIdtSteps: undefined,
        includeInChallenge: undefined,
      });
      expect('proceedToChallenge' in result).toBe(false);
    });

    it('sets challenge fields when custom drug has includeInChallenge: true', () => {
      const plan: Partial<TestingPlanData> = {
        customDrugs: [
          {
            name: 'Custom Antibiotic',
            sptConcentration: '5mg/mL',
            includeInChallenge: true,
          },
        ],
      };
      const result = buildTestPanelFromPlan(plan);

      expect(result.proceedToChallenge).toBe(true);
      expect(result.challengeDrug).toBe('Other');
      expect(result.challengeDrugCustom).toBe('Custom Antibiotic');
      expect(Object.keys(result).sort()).toEqual([
        'challengeDrug',
        'challengeDrugCustom',
        'proceedToChallenge',
        'testPanel',
      ]);
    });

    it('picks the first custom drug with includeInChallenge when multiple have it set', () => {
      const plan: Partial<TestingPlanData> = {
        customDrugs: [
          {
            name: 'First Custom',
            includeInChallenge: false,
          },
          {
            name: 'Second Custom (First in challenge)',
            includeInChallenge: true,
          },
          {
            name: 'Third Custom (Also in challenge)',
            includeInChallenge: true,
          },
        ],
      };
      const result = buildTestPanelFromPlan(plan);

      expect(result.proceedToChallenge).toBe(true);
      expect(result.challengeDrug).toBe('Other');
      expect(result.challengeDrugCustom).toBe('Second Custom (First in challenge)');
    });

    it('does not include challenge fields if custom drug with includeInChallenge has empty name', () => {
      const plan: Partial<TestingPlanData> = {
        customDrugs: [
          {
            name: '',
            includeInChallenge: true,
          },
        ],
      };
      const result = buildTestPanelFromPlan(plan);

      expect('proceedToChallenge' in result).toBe(false);
      expect('challengeDrug' in result).toBe(false);
      expect('challengeDrugCustom' in result).toBe(false);
    });
  });

  describe('combined standard and custom drugs', () => {
    it('places standard rows first, followed by custom rows', () => {
      const plan: Partial<TestingPlanData> = {
        selectedDrugs: ['Rocuronium'],
        selectedProtocols: { Rocuronium: 0 },
        customDrugs: [
          {
            name: 'Custom Dye',
            sptConcentration: '1%',
            idtSteps: [{ ratio: '1:100', concentration: '0.01%' }],
            includeInChallenge: true,
          },
        ],
      };
      const result = buildTestPanelFromPlan(plan);

      expect(result.testPanel).toHaveLength(2);
      expect(result.testPanel[0].drugName).toBe('Rocuronium');
      expect(result.testPanel[0].customName).toBe('');
      expect(result.testPanel[1].drugName).toBe('Other');
      expect(result.testPanel[1].customName).toBe('Custom Dye');

      expect(result.proceedToChallenge).toBe(true);
      expect(result.challengeDrug).toBe('Other');
      expect(result.challengeDrugCustom).toBe('Custom Dye');
    });

    it('does not set challenge fields if only standard drugs are selected without challenge custom drugs', () => {
      const plan: Partial<TestingPlanData> = {
        selectedDrugs: ['Rocuronium', 'Cis-atracurium'],
        customDrugs: [
          {
            name: 'Non-challenge Custom',
            includeInChallenge: false,
          },
        ],
      };
      const result = buildTestPanelFromPlan(plan);

      expect(result.testPanel).toHaveLength(3);
      expect('proceedToChallenge' in result).toBe(false);
      expect('challengeDrug' in result).toBe(false);
      expect('challengeDrugCustom' in result).toBe(false);
      expect(Object.keys(result)).toEqual(['testPanel']);
    });
  });
});
