import { useState, useEffect } from 'react';
import { LogFormData, TestingPlanData } from '../types';
import { DEFAULT_SELECTED_DRUGS } from '@shared/utils/constants';

const ACTIVE_REPORT_KEY = 'dream:active_report';
const ACTIVE_REPORT_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

interface ActiveReportEntry {
  record: LogFormData;
  savedAt: number;
}

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
  const [activeReportSavedAt, setActiveReportSavedAt] = useState<number | null>(null);
  const [testingPlanData, setTestingPlanData] = useState<TestingPlanData | null>(null);
  const [recentLogs, setRecentLogs] = useState<LogFormData[]>([]);

  useEffect(() => {
    // Restore active report from localStorage if within TTL
    try {
      const raw = localStorage.getItem(ACTIVE_REPORT_KEY);
      if (raw) {
        const entry: ActiveReportEntry = JSON.parse(raw);
        if (Date.now() - entry.savedAt < ACTIVE_REPORT_TTL_MS) {
          setLastSavedRecord(entry.record);
          setActiveReportSavedAt(entry.savedAt);
        } else {
          localStorage.removeItem(ACTIVE_REPORT_KEY);
        }
      }
    } catch {
      localStorage.removeItem(ACTIVE_REPORT_KEY);
    }
  }, []);

  useEffect(() => {
    import('@shared/data/mockTestingLogs').then(({ MOCK_TESTING_LOGS }) => {
      setRecentLogs(prev => prev.length === 0 ? MOCK_TESTING_LOGS : prev);
    }).catch(() => {
      // silent fallback — dashboard shows empty state
    });
  }, []);

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
        nurseNotes: parsed.nurseNotes ? {
          preTesting: parsed.nurseNotes.preTesting ? String(parsed.nurseNotes.preTesting) : undefined,
          duringTesting: parsed.nurseNotes.duringTesting ? String(parsed.nurseNotes.duringTesting) : undefined,
          postTesting: parsed.nurseNotes.postTesting ? String(parsed.nurseNotes.postTesting) : undefined,
          signedBy: parsed.nurseNotes.signedBy ? String(parsed.nurseNotes.signedBy) : undefined,
        } : undefined,
        tryptase: parsed.tryptase ? {
          obtained: Boolean(parsed.tryptase.obtained),
          significantElevation: Boolean(parsed.tryptase.significantElevation),
          values: Array.isArray(parsed.tryptase.values)
            ? parsed.tryptase.values.map((v: any) => ({ time: String(v.time || ''), result: String(v.result || '') }))
            : [],
        } : undefined,
      };
      
      if (recordToSave.outcome !== null && recordToSave.outcome !== 'SUCCESS' && recordToSave.outcome !== 'UNSUCCESS') {
        recordToSave.outcome = null;
      }
      
      const finalRecord: LogFormData = { ...recordToSave };
      
      const savedAt = Date.now();
      setLastSavedRecord(finalRecord);
      setActiveReportSavedAt(savedAt);
      setRecentLogs(prev => [finalRecord, ...prev]);
      try {
        const entry: ActiveReportEntry = { record: finalRecord, savedAt };
        localStorage.setItem(ACTIVE_REPORT_KEY, JSON.stringify(entry));
      } catch {
        // localStorage may be unavailable — non-fatal
      }

      return finalRecord;
    } catch (error) {
      console.error('Error saving clinical record:', error);
      throw error;
    }
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM_STATE);
    // Does NOT clear lastSavedRecord — use clearActiveReport for that
  };

  const clearActiveReport = () => {
    setLastSavedRecord(null);
    setActiveReportSavedAt(null);
    localStorage.removeItem(ACTIVE_REPORT_KEY);
  };

  return {
    formData,
    setFormData,
    lastSavedRecord,
    setLastSavedRecord,
    activeReportSavedAt,
    testingPlanData,
    setTestingPlanData,
    recentLogs,
    handleSubmit,
    resetForm,
    clearActiveReport,
    INITIAL_FORM_STATE,
  };
}
