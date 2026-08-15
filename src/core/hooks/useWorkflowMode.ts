import { useState, useCallback } from 'react';

export type WorkflowMode = 'clinician' | 'nurse';

export const WORKFLOW_MODE_STORAGE_KEY = 'dream.workflowMode';

export function parseWorkflowMode(value: string | null | undefined): WorkflowMode {
  if (value === 'nurse') return 'nurse';
  return 'clinician';
}

export function readStoredWorkflowMode(): WorkflowMode {
  try {
    if (typeof window === 'undefined' || !window.sessionStorage) {
      return 'clinician';
    }
    const stored = window.sessionStorage.getItem(WORKFLOW_MODE_STORAGE_KEY);
    return parseWorkflowMode(stored);
  } catch {
    // Gracefully handle storage disabled/SecurityError in iframe/private browsing
    return 'clinician';
  }
}

export function writeStoredWorkflowMode(mode: WorkflowMode): void {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.setItem(WORKFLOW_MODE_STORAGE_KEY, mode);
    }
  } catch {
    // Non-fatal write failure
  }
}

export function useWorkflowMode() {
  const [workflowMode, setWorkflowModeState] = useState<WorkflowMode>(readStoredWorkflowMode);

  const setWorkflowMode = useCallback((mode: WorkflowMode) => {
    setWorkflowModeState(mode);
    writeStoredWorkflowMode(mode);
  }, []);

  return {
    workflowMode,
    setWorkflowMode,
  };
}
