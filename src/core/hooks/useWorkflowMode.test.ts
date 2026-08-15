import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useWorkflowMode,
  WORKFLOW_MODE_STORAGE_KEY,
  parseWorkflowMode,
  readStoredWorkflowMode,
  writeStoredWorkflowMode,
} from './useWorkflowMode';

describe('useWorkflowMode', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('parseWorkflowMode', () => {
    it('parses nurse correctly', () => {
      expect(parseWorkflowMode('nurse')).toBe('nurse');
    });

    it('parses clinician correctly', () => {
      expect(parseWorkflowMode('clinician')).toBe('clinician');
    });

    it('falls back to clinician for null, undefined, or invalid strings', () => {
      expect(parseWorkflowMode(null)).toBe('clinician');
      expect(parseWorkflowMode(undefined)).toBe('clinician');
      expect(parseWorkflowMode('admin')).toBe('clinician');
      expect(parseWorkflowMode('doctor')).toBe('clinician');
      expect(parseWorkflowMode('')).toBe('clinician');
    });
  });

  describe('readStoredWorkflowMode & writeStoredWorkflowMode', () => {
    it('reads from sessionStorage key dream.workflowMode', () => {
      sessionStorage.setItem(WORKFLOW_MODE_STORAGE_KEY, 'nurse');
      expect(readStoredWorkflowMode()).toBe('nurse');
    });

    it('handles sessionStorage throwing an exception', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('SecurityError: storage disabled');
      });
      expect(readStoredWorkflowMode()).toBe('clinician');
    });

    it('writes safely to sessionStorage without throwing on errors', () => {
      writeStoredWorkflowMode('nurse');
      expect(sessionStorage.getItem(WORKFLOW_MODE_STORAGE_KEY)).toBe('nurse');

      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });
      expect(() => writeStoredWorkflowMode('clinician')).not.toThrow();
    });
  });

  describe('useWorkflowMode hook', () => {
    it('defaults to clinician when no session value is present', () => {
      const { result } = renderHook(() => useWorkflowMode());
      expect(result.current.workflowMode).toBe('clinician');
    });

    it('restores nurse mode when stored in sessionStorage', () => {
      sessionStorage.setItem(WORKFLOW_MODE_STORAGE_KEY, 'nurse');
      const { result } = renderHook(() => useWorkflowMode());
      expect(result.current.workflowMode).toBe('nurse');
    });

    it('allows immediate mode switching, updates sessionStorage, and does not touch localStorage', () => {
      const { result } = renderHook(() => useWorkflowMode());

      act(() => {
        result.current.setWorkflowMode('nurse');
      });

      expect(result.current.workflowMode).toBe('nurse');
      expect(sessionStorage.getItem(WORKFLOW_MODE_STORAGE_KEY)).toBe('nurse');
      expect(localStorage.getItem(WORKFLOW_MODE_STORAGE_KEY)).toBeNull();

      act(() => {
        result.current.setWorkflowMode('clinician');
      });

      expect(result.current.workflowMode).toBe('clinician');
      expect(sessionStorage.getItem(WORKFLOW_MODE_STORAGE_KEY)).toBe('clinician');
    });
  });
});
