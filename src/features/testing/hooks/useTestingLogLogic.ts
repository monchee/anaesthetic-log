import React, { useMemo, useCallback } from 'react';
import { LogFormData } from '../types';
import { getSkinProtocolsForDrug } from '@shared/data/drugMasterlist';


interface UseTestingLogLogicProps {
  formData: LogFormData;
  setFormData: React.Dispatch<React.SetStateAction<LogFormData>>;
  drugCategories: Record<string, string[]>;
}

export const useTestingLogLogic = ({ formData, setFormData, drugCategories }: UseTestingLogLogicProps) => {

  const drugToCategoryMap = useMemo(() => {
    const map: Record<string, string> = {};
    Object.entries(drugCategories).forEach(([cat, drugs]) => {
      (drugs as string[]).forEach(d => {
        map[d] = cat;
      });
    });
    return map;
  }, [drugCategories]);

  const handleInputChange = useCallback((field: keyof LogFormData, value: any) => {
    if (field === 'reactionTime' && typeof value === 'string' && value !== '' && !isNaN(parseFloat(value)) && parseFloat(value) < 0) return;
    setFormData(prev => ({ ...prev, [field]: value }));
  }, [setFormData]);

  const handleControlChange = useCallback((field: string, value: string) => {
    if (value !== '' && !isNaN(parseFloat(value)) && parseFloat(value) < 0) return;
    setFormData(prev => ({
        ...prev, 
        controls: { ...prev.controls, [field]: value }
    }));
  }, [setFormData]);

  const makeNewRow = useCallback((drugName: string) => {
    const protocols = getSkinProtocolsForDrug(drugName);
    const idtStepCount = protocols[0]?.idtSteps.length ?? 0;
    return {
      drugName,
      sptWheal: '',
      idtResults: Array(idtStepCount).fill(''),
      protocolIndex: 0,
      customName: '',
    };
  }, []);

  const toggleDrug = useCallback((drugName: string) => {
    setFormData(prev => {
      const exists = prev.testPanel.find(row => row.drugName === drugName && !row.id);
      if (exists) {
        return {
          ...prev,
          testPanel: prev.testPanel.filter(row => row.drugName !== drugName || row.id)
        };
      } else {
        return {
          ...prev,
          testPanel: [...prev.testPanel, makeNewRow(drugName)]
        };
      }
    });
  }, [setFormData, makeNewRow]);

  const toggleCategory = useCallback((categoryDrugs: string[]) => {
    setFormData(prev => {
      const currentPanelDrugs = prev.testPanel.filter(r => !r.id).map(row => row.drugName);
      const allSelected = categoryDrugs.every(d => currentPanelDrugs.includes(d));
      if (allSelected) {
        return {
          ...prev,
          testPanel: prev.testPanel.filter(row => row.id || !categoryDrugs.includes(row.drugName))
        };
      } else {
        const missingDrugs = categoryDrugs.filter(d => !currentPanelDrugs.includes(d));
        return {
          ...prev,
          testPanel: [...prev.testPanel, ...missingDrugs.map(makeNewRow)]
        };
      }
    });
  }, [setFormData, makeNewRow]);

  const selectProtocol = useCallback((rowIndex: number, protocolIndex: number) => {
    setFormData(prev => ({
      ...prev,
      testPanel: prev.testPanel.map((row, i) => {
        if (i !== rowIndex) return row;
        const protocols = getSkinProtocolsForDrug(row.drugName);
        const protocol = protocols[protocolIndex];
        return {
          ...row,
          protocolIndex,
          idtResults: Array(protocol?.idtSteps.length ?? 0).fill(''),
        };
      }),
    }));
  }, [setFormData]);

  const addCustomDrug = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      testPanel: [
        ...prev.testPanel,
        {
          id: `custom-${Date.now()}-${Math.random()}`,
          drugName: 'Other',
          sptWheal: '',
          idtResults: [],
          protocolIndex: 0,
          customName: '',
          customSptConcentration: '',
          customIdtSteps: [],
          includeInChallenge: false,
        }
      ]
    }));
  }, [setFormData]);

  const addCustomIdtStep = useCallback((rowIndex: number) => {
    setFormData(prev => ({
      ...prev,
      testPanel: prev.testPanel.map((row, i) => {
        if (i !== rowIndex) return row;
        const steps = [...(row.customIdtSteps ?? []), { ratio: '', concentration: '' }];
        return { ...row, customIdtSteps: steps, idtResults: [...(row.idtResults ?? []), ''] };
      }),
    }));
  }, [setFormData]);

  const removeCustomIdtStep = useCallback((rowIndex: number, stepIndex: number) => {
    setFormData(prev => ({
      ...prev,
      testPanel: prev.testPanel.map((row, i) => {
        if (i !== rowIndex) return row;
        const steps = (row.customIdtSteps ?? []).filter((_, si) => si !== stepIndex);
        const results = (row.idtResults ?? []).filter((_, si) => si !== stepIndex);
        return { ...row, customIdtSteps: steps, idtResults: results };
      }),
    }));
  }, [setFormData]);

  const removeRow = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      testPanel: prev.testPanel.filter((_, i) => i !== index)
    }));
  }, [setFormData]);

  const updateDrugData = useCallback((index: number, field: string, value: string) => {
    if (field === 'includeInChallenge') {
      setFormData(prev => ({
        ...prev,
        testPanel: prev.testPanel.map((row, i) => i === index ? { ...row, includeInChallenge: value === 'true' } : row),
      }));
      return;
    }
    if (field.startsWith('customIdtStep_')) {
      const parts = field.split('_');
      const subField = parts[1]; // 'ratio' or 'concentration'
      const stepIdx = parseInt(parts[2], 10);
      setFormData(prev => ({
        ...prev,
        testPanel: prev.testPanel.map((row, i) => {
          if (i !== index) return row;
          const steps = [...(row.customIdtSteps ?? [])];
          steps[stepIdx] = { ...(steps[stepIdx] ?? { ratio: '', concentration: '' }), [subField]: value };
          return { ...row, customIdtSteps: steps };
        }),
      }));
      return;
    }
    if (field === 'sptWheal') {
      if (value !== '' && !isNaN(parseFloat(value)) && parseFloat(value) < 0) return;
    }
    if (field.startsWith('idt_')) {
      if (value !== '' && !isNaN(parseFloat(value)) && parseFloat(value) < 0) return;
      const idx = parseInt(field.slice(4), 10);
      setFormData(prev => ({
        ...prev,
        testPanel: prev.testPanel.map((row, i) => {
          if (i !== index) return row;
          const updated = [...(row.idtResults ?? [])];
          updated[idx] = value;
          return { ...row, idtResults: updated };
        }),
      }));
      return;
    }
    setFormData(prev => ({
      ...prev,
      testPanel: prev.testPanel.map((row, i) => i === index ? { ...row, [field]: value } : row)
    }));
  }, [setFormData]);

  const toggleSymptom = useCallback((symptom: string) => {
    setFormData(prev => {
      const exists = prev.symptoms.includes(symptom);
      return {
        ...prev,
        symptoms: exists ? prev.symptoms.filter(s => s !== symptom) : [...prev.symptoms, symptom]
      };
    });
  }, [setFormData]);

  const challengeOptions = useMemo(() => {
    const panelDrugs = (formData.testPanel || [])
        .map(r => r.drugName === 'Other' && r.customName ? r.customName : r.drugName)
        .filter((d): d is string => !!d);
    
    const standardDrugs = Object.values(drugCategories).flat();
    const uniqueDrugs = Array.from(new Set([...panelDrugs, ...standardDrugs])).filter(d => d !== 'Other');
    uniqueDrugs.sort();
    return [...uniqueDrugs, 'Other'];
  }, [formData.testPanel, drugCategories]);

  return {
    drugToCategoryMap,
    handleInputChange,
    handleControlChange,
    toggleDrug,
    toggleCategory,
    selectProtocol,
    addCustomDrug,
    addCustomIdtStep,
    removeCustomIdtStep,
    removeRow,
    updateDrugData,
    toggleSymptom,
    challengeOptions
  };
};
