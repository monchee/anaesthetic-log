import { useState, useEffect, useRef } from 'react';
import { LogFormData, TestingPlanData } from '../types';
import { DEFAULT_SELECTED_DRUGS } from '@shared/utils/constants';
import {
  ACTIVE_REPORT_KEY, ACTIVE_REPORT_TTL_MS, TESTING_DRAFT_KEY,
  setWithTTL, getIfFresh, getSavedAt, removeStored,
} from '@shared/utils/ttlStorage';
import { isTestingSessionDirty } from '../utils/isTestingSessionDirty';
import { parseLogFormData, safeParseLogFormData } from '../utils/logFormSchema';

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
  const [lastDraftSavedAt, setLastDraftSavedAt] = useState<number | null>(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [testingPlanData, setTestingPlanData] = useState<TestingPlanData | null>(null);
  const [recentLogs, setRecentLogs] = useState<LogFormData[]>([]);

  useEffect(() => {
    // Restore active report from localStorage if written within the TTL window.
    const record = getIfFresh<LogFormData>(ACTIVE_REPORT_KEY, ACTIVE_REPORT_TTL_MS);
    const savedAt = getSavedAt(ACTIVE_REPORT_KEY, ACTIVE_REPORT_TTL_MS);
    const parsedRecord = record ? safeParseLogFormData(record) : null;
    if (parsedRecord && savedAt) {
      setLastSavedRecord(parsedRecord);
      setActiveReportSavedAt(savedAt);
    }

    // Restore any fresh in-progress testing draft. Submitted records and manual
    // resets clear this key, so the TTL entry only represents uncommitted work.
    const draft = getIfFresh<LogFormData>(TESTING_DRAFT_KEY, ACTIVE_REPORT_TTL_MS);
    const parsedDraft = draft ? safeParseLogFormData(draft) : null;
    if (parsedDraft) setFormData(parsedDraft);
  }, []);

  // Debounced autosave of the in-progress session. Only persists once the
  // clinician has entered real data; the timestamped entry self-expires (6h).
  const draftTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!isTestingSessionDirty(formData)) {
      setIsSavingDraft(false);
      return;
    }
    if (draftTimer.current) clearTimeout(draftTimer.current);
    setIsSavingDraft(true);
    draftTimer.current = setTimeout(() => {
      setWithTTL(TESTING_DRAFT_KEY, formData);
      setLastDraftSavedAt(Date.now());
      setIsSavingDraft(false);
      draftTimer.current = null;
    }, 500);
    return () => {
      if (draftTimer.current) clearTimeout(draftTimer.current);
    };
  }, [formData]);

  useEffect(() => {
    import('@shared/data/mockTestingLogs').then(({ MOCK_TESTING_LOGS }) => {
      setRecentLogs(prev => prev.length === 0 ? MOCK_TESTING_LOGS : prev);
    }).catch((error) => {
      console.warn('Unable to load mock testing logs:', error);
      // Non-fatal fallback — dashboard shows empty state.
    });
  }, []);

  const handleSubmit = () => {
    try {
      const finalRecord = parseLogFormData(formData);
      
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
    lastDraftSavedAt,
    isSavingDraft,
    testingPlanData,
    setTestingPlanData,
    recentLogs,
    handleSubmit,
    resetForm,
    clearActiveReport,
    INITIAL_FORM_STATE,
  };
}
