import React, { useMemo, useCallback } from 'react';
import { LogFormData } from '../types';

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
          testPanel: [...prev.testPanel, { drugName, sptWheal: '', idt100: '', idt10: '', idtNeat: '', customName: '' }]
        };
      }
    });
  }, [setFormData]);

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
        const newRows = missingDrugs.map(d => ({
            drugName: d,
            sptWheal: '',
            idt100: '',
            idt10: '',
            idtNeat: '',
            customName: ''
        }));
        return {
          ...prev,
          testPanel: [...prev.testPanel, ...newRows]
        };
      }
    });
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
            idt100: '', 
            idt10: '', 
            idtNeat: '', 
            customName: '' 
        }
      ]
    }));
  }, [setFormData]);

  const removeRow = useCallback((index: number) => {
    setFormData(prev => ({
        ...prev,
        testPanel: prev.testPanel.filter((_, i) => i !== index)
    }));
  }, [setFormData]);

  const updateDrugData = useCallback((index: number, field: string, value: string) => {
    if (['sptWheal', 'idt100', 'idt10', 'idtNeat'].includes(field)) {
        if (value !== '' && !isNaN(parseFloat(value)) && parseFloat(value) < 0) return;
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
    addCustomDrug,
    removeRow,
    updateDrugData,
    toggleSymptom,
    challengeOptions
  };
};
