import { useState, useEffect, useRef, useCallback } from 'react';
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

function isDraftEqual(a: LogFormData | null, b: LogFormData | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
}

export function useTestingState() {
  const [formData, setFormData] = useState<LogFormData>(INITIAL_FORM_STATE);
  const [lastSavedRecord, setLastSavedRecord] = useState<LogFormData | null>(null);
  const [activeReportSavedAt, setActiveReportSavedAt] = useState<number | null>(null);
  const [lastDraftSavedAt, setLastDraftSavedAt] = useState<number | null>(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [testingPlanData, setTestingPlanData] = useState<TestingPlanData | null>(null);
  const [recentLogs, setRecentLogs] = useState<LogFormData[]>([]);
  const formDataRef = useRef<LogFormData>(formData);
  formDataRef.current = formData;

  const lastSavedDraftRef = useRef<LogFormData | null>(null);
  const isInitialMount = useRef(true);

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
    const draftSavedAt = getSavedAt(TESTING_DRAFT_KEY, ACTIVE_REPORT_TTL_MS);
    const parsedDraft = draft ? safeParseLogFormData(draft) : null;
    if (parsedDraft) {
      lastSavedDraftRef.current = parsedDraft;
      setFormData(parsedDraft);
      if (draftSavedAt) {
        setLastDraftSavedAt(draftSavedAt);
      }
    }
  }, []);

  // Debounced autosave of the in-progress session. Only persists once the
  // clinician has entered real data; the timestamped entry self-expires (6h).
  const draftTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (!isTestingSessionDirty(formData)) {
      setIsSavingDraft(false);
      return;
    }
    if (isDraftEqual(lastSavedDraftRef.current, formData)) {
      setIsSavingDraft(false);
      return;
    }

    if (draftTimer.current) clearTimeout(draftTimer.current);
    setIsSavingDraft(true);
    draftTimer.current = setTimeout(() => {
      setWithTTL(TESTING_DRAFT_KEY, formData);
      lastSavedDraftRef.current = formData;
      setLastDraftSavedAt(Date.now());
      setIsSavingDraft(false);
      draftTimer.current = null;
    }, 500);
    return () => {
      if (draftTimer.current) clearTimeout(draftTimer.current);
    };
  }, [formData]);

  const persistDraftNow = useCallback(() => {
    if (draftTimer.current) {
      clearTimeout(draftTimer.current);
      draftTimer.current = null;
    }
    const current = formDataRef.current;
    if (isTestingSessionDirty(current)) {
      setWithTTL(TESTING_DRAFT_KEY, current);
      lastSavedDraftRef.current = current;
      const now = Date.now();
      setLastDraftSavedAt(now);
      setIsSavingDraft(false);
    }
  }, []);

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
      lastSavedDraftRef.current = null;
      setLastDraftSavedAt(null);
      setIsSavingDraft(false);
      removeStored(TESTING_DRAFT_KEY);

      return finalRecord;
    } catch (error) {
      console.error('Error saving clinical record:', error);
      throw error;
    }
  };

  const resetForm = () => {
    if (draftTimer.current) {
      clearTimeout(draftTimer.current);
      draftTimer.current = null;
    }
    lastSavedDraftRef.current = null;
    setFormData(INITIAL_FORM_STATE);
    setLastDraftSavedAt(null);
    setIsSavingDraft(false);
    removeStored(TESTING_DRAFT_KEY);
    // Does NOT clear lastSavedRecord — use clearActiveReport for that
  };

  const clearActiveReport = () => {
    if (draftTimer.current) {
      clearTimeout(draftTimer.current);
      draftTimer.current = null;
    }
    lastSavedDraftRef.current = null;
    setLastSavedRecord(null);
    setActiveReportSavedAt(null);
    setLastDraftSavedAt(null);
    setIsSavingDraft(false);
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
    persistDraftNow,
    INITIAL_FORM_STATE,
  };
}
