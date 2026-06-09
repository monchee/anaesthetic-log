import { useState, useEffect, useRef } from 'react';
import { LogFormData, TestingPlanData } from '../types';
import { DEFAULT_SELECTED_DRUGS } from '@shared/utils/constants';
import {
  ACTIVE_REPORT_KEY, ACTIVE_REPORT_TTL_MS, TESTING_DRAFT_KEY,
  setWithTTL, getIfFresh, getSavedAt, removeStored,
} from '@shared/utils/ttlStorage';
import { isTestingSessionDirty } from '../utils/isTestingSessionDirty';

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

const sanitizeTryptase = (tryptase: unknown): LogFormData['tryptase'] => {
  if (!tryptase || typeof tryptase !== 'object') return undefined;
  const source = tryptase as {
    obtained?: unknown;
    significantElevation?: unknown;
    values?: unknown;
  };
  return {
    obtained: Boolean(source.obtained),
    significantElevation: Boolean(source.significantElevation),
    values: Array.isArray(source.values)
      ? source.values.map((v) => {
          const sample = v && typeof v === 'object'
            ? v as { time?: unknown; result?: unknown }
            : {};
          return {
            time: String(sample.time || ''),
            result: String(sample.result || ''),
          };
        })
      : [],
  };
};

export function useTestingState() {
  const [formData, setFormData] = useState<LogFormData>(INITIAL_FORM_STATE);
  const [lastSavedRecord, setLastSavedRecord] = useState<LogFormData | null>(null);
  const [activeReportSavedAt, setActiveReportSavedAt] = useState<number | null>(null);
  const [testingPlanData, setTestingPlanData] = useState<TestingPlanData | null>(null);
  const [recentLogs, setRecentLogs] = useState<LogFormData[]>([]);

  useEffect(() => {
    // Restore active report from localStorage if written within the TTL window.
    const record = getIfFresh<LogFormData>(ACTIVE_REPORT_KEY, ACTIVE_REPORT_TTL_MS);
    const savedAt = getSavedAt(ACTIVE_REPORT_KEY, ACTIVE_REPORT_TTL_MS);
    if (record && savedAt) {
      setLastSavedRecord({ ...record, tryptase: sanitizeTryptase(record.tryptase) });
      setActiveReportSavedAt(savedAt);
    }

    // Restore an in-progress testing draft if one was saved within the TTL
    // window — resumes work after a reload, tab close, or SW auto-update.
    // Only restore when the app loads directly on the testing screen (the real
    // resume case). Restoring onto the home screen would risk injecting one
    // patient's results into a different patient selected fresh this session.
    if (window.location.pathname === '/testing') {
      const draft = getIfFresh<LogFormData>(TESTING_DRAFT_KEY, ACTIVE_REPORT_TTL_MS);
      if (draft) setFormData({ ...draft, tryptase: sanitizeTryptase(draft.tryptase) });
    }
  }, []);

  // Debounced autosave of the in-progress session. Only persists once the
  // clinician has entered real data; the timestamped entry self-expires (6h).
  const draftTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!isTestingSessionDirty(formData)) return;
    if (draftTimer.current) clearTimeout(draftTimer.current);
    draftTimer.current = setTimeout(() => {
      setWithTTL(TESTING_DRAFT_KEY, formData);
    }, 500);
    return () => {
      if (draftTimer.current) clearTimeout(draftTimer.current);
    };
  }, [formData]);

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
        tryptase: sanitizeTryptase(parsed.tryptase),
      };
      
      if (recordToSave.outcome !== null && recordToSave.outcome !== 'SUCCESS' && recordToSave.outcome !== 'UNSUCCESS') {
        recordToSave.outcome = null;
      }
      
      const finalRecord: LogFormData = { ...recordToSave };
      
      const savedAt = Date.now();
      setLastSavedRecord(finalRecord);
      setActiveReportSavedAt(savedAt);
      setRecentLogs(prev => [finalRecord, ...prev]);
      setWithTTL(ACTIVE_REPORT_KEY, finalRecord);
      // The session is now committed to a report — drop the in-progress draft.
      removeStored(TESTING_DRAFT_KEY);

      return finalRecord;
    } catch (error) {
      console.error('Error saving clinical record:', error);
      throw error;
    }
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM_STATE);
    removeStored(TESTING_DRAFT_KEY);
    // Does NOT clear lastSavedRecord — use clearActiveReport for that
  };

  const clearActiveReport = () => {
    setLastSavedRecord(null);
    setActiveReportSavedAt(null);
    removeStored(ACTIVE_REPORT_KEY);
    removeStored(TESTING_DRAFT_KEY);
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
