import { useState } from 'react';
import { LogFormData, TestingPlanData } from '../types';
import { DEFAULT_SELECTED_DRUGS } from '@shared/utils/constants';

const INITIAL_FORM_STATE: LogFormData = {
  mrn: '',
  firstName: '',
  lastName: '',
  visitDate: new Date().toISOString().split('T')[0],
  controls: {
    histamineSpt: '',
    salineSpt: '',
    salineIdt: '',
  },
  testPanel: DEFAULT_SELECTED_DRUGS.map(drugName => ({
    drugName,
    sptWheal: '',
    idtResults: [],
    protocolIndex: 0,
  })),
  proceedToChallenge: false,
  challengeDrug: '',
  challengeDrugCustom: '',
  outcome: null,
  reactionTime: '',
  symptoms: [],
  symptomsOther: '',
  interventionType: '',
  interventionOther: '',
  plan: ''
};

export function useTestingState() {
  const [formData, setFormData] = useState<LogFormData>(INITIAL_FORM_STATE);
  const [lastSavedRecord, setLastSavedRecord] = useState<LogFormData | null>(null);
  const [testingPlanData, setTestingPlanData] = useState<TestingPlanData | null>(null);
  const [recentLogs, setRecentLogs] = useState<LogFormData[]>([]);

  const handleSubmit = () => {
    try {
      const serialized = JSON.stringify(formData);
      const parsed = JSON.parse(serialized) as LogFormData;
      
      const recordToSave: LogFormData = {
        id: parsed.id ? String(parsed.id) : undefined,
        timestamp: parsed.timestamp ? String(parsed.timestamp) : undefined,
        mrn: String(parsed.mrn || ''),
        firstName: String(parsed.firstName || ''),
        lastName: String(parsed.lastName || ''),
        visitDate: String(parsed.visitDate || ''),
        controls: {
          histamineSpt: String(parsed.controls?.histamineSpt || ''),
          salineSpt: String(parsed.controls?.salineSpt || ''),
          salineIdt: String(parsed.controls?.salineIdt || ''),
        },
        testPanel: (parsed.testPanel || []).map(row => ({
          id: row.id ? String(row.id) : undefined,
          drugName: String(row.drugName || ''),
          sptWheal: String(row.sptWheal || ''),
          idtResults: Array.isArray(row.idtResults)
            ? row.idtResults.map((v: unknown) => String(v ?? ''))
            : [String(row.idt100 || ''), String(row.idt10 || ''), String(row.idtNeat || '')].filter((_, i, a) => a.slice(i).some(v => v !== '') || i === 0),
          protocolIndex: typeof row.protocolIndex === 'number' ? row.protocolIndex : 0,
          customName: row.customName ? String(row.customName) : undefined,
          notes: row.notes ? String(row.notes) : undefined,
        })),
        proceedToChallenge: Boolean(parsed.proceedToChallenge),
        challengeDrug: String(parsed.challengeDrug || ''),
        challengeDrugCustom: parsed.challengeDrugCustom ? String(parsed.challengeDrugCustom) : undefined,
        outcome: (parsed.outcome === 'SUCCESS' || parsed.outcome === 'UNSUCCESS') ? parsed.outcome : null,
        reactionTime: String(parsed.reactionTime || ''),
        symptoms: (parsed.symptoms || []).map(s => String(s)),
        symptomsOther: String(parsed.symptomsOther || ''),
        interventionType: String(parsed.interventionType || ''),
        interventionOther: String(parsed.interventionOther || ''),
        plan: String(parsed.plan || ''),
      };
      
      if (recordToSave.outcome !== null && recordToSave.outcome !== 'SUCCESS' && recordToSave.outcome !== 'UNSUCCESS') {
        recordToSave.outcome = null;
      }
      
      const finalRecord: LogFormData = { ...recordToSave };
      
      setLastSavedRecord(finalRecord);
      setRecentLogs(prev => [finalRecord, ...prev]);
      
      return finalRecord;
    } catch (error) {
      console.error('Error saving clinical record:', error);
      throw error;
    }
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM_STATE);
    setLastSavedRecord(null);
  };

  return {
    formData,
    setFormData,
    lastSavedRecord,
    setLastSavedRecord,
    testingPlanData,
    setTestingPlanData,
    recentLogs,
    handleSubmit,
    resetForm,
    INITIAL_FORM_STATE,
  };
}
