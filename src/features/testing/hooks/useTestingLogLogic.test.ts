import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useTestingLogLogic } from './useTestingLogLogic';
import { LogFormData } from '../types';

const mockDrugCategories: Record<string, string[]> = {
  Cephalosporins: ['Cefazolin', 'Ceftriaxone'],
  'Muscle Relaxants': ['Rocuronium', 'Suxamethonium'],
};

const initialFormData: LogFormData = {
  mrn: 'MRN123',
  firstName: 'Jane',
  lastName: 'Doe',
  visitDate: '2026-06-10',
  controls: { histamineSpt: '', salineSpt: '', salineIdt: '' },
  testPanel: [
    { drugName: 'Cefazolin', sptWheal: '', idtResults: ['', ''], protocolIndex: 0 },
  ],
  proceedToChallenge: false,
  challengeDrug: '',
  challengeDrugCustom: '',
  outcome: null,
  reactionTime: '',
  symptoms: ['Rash'],
  symptomsOther: '',
  interventionType: '',
  interventionOther: '',
  plan: '',
};

describe('useTestingLogLogic', () => {
  it('computes drugToCategoryMap and challengeOptions', () => {
    let formData = { ...initialFormData };
    const setFormData = vi.fn((update) => {
      formData = typeof update === 'function' ? update(formData) : update;
    });

    const { result } = renderHook(() =>
      useTestingLogLogic({
        formData,
        setFormData,
        drugCategories: mockDrugCategories,
      })
    );

    expect(result.current.drugToCategoryMap.Cefazolin).toBe('Cephalosporins');
    expect(result.current.drugToCategoryMap.Rocuronium).toBe('Muscle Relaxants');
    expect(result.current.challengeOptions).toContain('Cefazolin');
    expect(result.current.challengeOptions).toContain('Other');
  });

  it('handles input and control changes with positive numeric checks', () => {
    let formData = { ...initialFormData };
    const setFormData = vi.fn((update) => {
      formData = typeof update === 'function' ? update(formData) : update;
    });

    const { result } = renderHook(() =>
      useTestingLogLogic({
        formData,
        setFormData,
        drugCategories: mockDrugCategories,
      })
    );

    act(() => {
      result.current.handleInputChange('plan', 'Avoid drug');
      result.current.handleControlChange('histamineSpt', '6');
    });

    expect(setFormData).toHaveBeenCalledTimes(2);

    // Negative values should be rejected
    setFormData.mockClear();
    act(() => {
      result.current.handleInputChange('reactionTime', '-5');
      result.current.handleControlChange('histamineSpt', '-2');
    });
    expect(setFormData).not.toHaveBeenCalled();
  });

  it('toggles drug and protocol selections on test panel', () => {
    let formData = { ...initialFormData };
    const setFormData = vi.fn((update) => {
      formData = typeof update === 'function' ? update(formData) : update;
    });

    const { result } = renderHook(() =>
      useTestingLogLogic({
        formData,
        setFormData,
        drugCategories: mockDrugCategories,
      })
    );

    // Toggle off Cefazolin
    act(() => {
      result.current.toggleDrug('Cefazolin');
    });
    expect(formData.testPanel.some((r) => r.drugName === 'Cefazolin')).toBe(false);

    // Toggle on Rocuronium
    act(() => {
      result.current.toggleDrug('Rocuronium');
    });
    expect(formData.testPanel.some((r) => r.drugName === 'Rocuronium')).toBe(true);

    // Toggle category
    act(() => {
      result.current.toggleCategory(mockDrugCategories.Cephalosporins);
    });
    expect(formData.testPanel.some((r) => r.drugName === 'Cefazolin')).toBe(true);
    expect(formData.testPanel.some((r) => r.drugName === 'Ceftriaxone')).toBe(true);

    // Toggle drug protocol
    act(() => {
      result.current.toggleDrugProtocol('Cefazolin', 0);
    });
  });

  it('manages custom drugs and IDT steps', () => {
    let formData = { ...initialFormData };
    const setFormData = vi.fn((update) => {
      formData = typeof update === 'function' ? update(formData) : update;
    });

    const { result } = renderHook(() =>
      useTestingLogLogic({
        formData,
        setFormData,
        drugCategories: mockDrugCategories,
      })
    );

    act(() => {
      result.current.addCustomDrug();
    });
    expect(formData.testPanel.some((r) => r.drugName === 'Other')).toBe(true);

    const otherIndex = formData.testPanel.findIndex((r) => r.drugName === 'Other');

    act(() => {
      result.current.addCustomIdtStep(otherIndex);
    });
    expect(formData.testPanel[otherIndex].customIdtSteps?.length).toBe(1);

    act(() => {
      result.current.updateDrugData(otherIndex, 'customIdtStep_ratio_0', '1:100');
      result.current.updateDrugData(otherIndex, 'customIdtStep_concentration_0', '0.1 mg/mL');
      result.current.updateDrugData(otherIndex, 'customName', 'SpecialCustom');
      result.current.updateDrugData(otherIndex, 'sptWheal', '4');
      result.current.updateDrugData(otherIndex, 'idt_0', '5');
      result.current.updateDrugData(otherIndex, 'includeInChallenge', 'true');
    });

    expect(formData.testPanel[otherIndex].customName).toBe('SpecialCustom');
    expect(formData.testPanel[otherIndex].sptWheal).toBe('4');
    expect(formData.testPanel[otherIndex].idtResults?.[0]).toBe('5');
    expect(formData.testPanel[otherIndex].includeInChallenge).toBe(true);

    act(() => {
      result.current.removeCustomIdtStep(otherIndex, 0);
    });
    expect(formData.testPanel[otherIndex].customIdtSteps?.length).toBe(0);

    act(() => {
      result.current.removeRow(otherIndex);
    });
    expect(formData.testPanel.some((r) => r.customName === 'SpecialCustom')).toBe(false);
  });

  it('toggles symptoms and switches protocols', () => {
    let formData = { ...initialFormData };
    const setFormData = vi.fn((update) => {
      formData = typeof update === 'function' ? update(formData) : update;
    });

    const { result } = renderHook(() =>
      useTestingLogLogic({
        formData,
        setFormData,
        drugCategories: mockDrugCategories,
      })
    );

    // Toggle off existing Rash
    act(() => {
      result.current.toggleSymptom('Rash');
    });
    expect(formData.symptoms.includes('Rash')).toBe(false);

    // Toggle on Hypotension
    act(() => {
      result.current.toggleSymptom('Hypotension');
    });
    expect(formData.symptoms.includes('Hypotension')).toBe(true);

    // Select protocol
    act(() => {
      result.current.selectProtocol(0, 0);
    });
    expect(formData.testPanel[0].protocolIndex).toBe(0);
  });
});
