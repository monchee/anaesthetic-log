import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ACTIVE_REPORT_TTL_MS, PATIENT_DB_KEY } from '@shared/utils/ttlStorage';
import * as ttlStorage from '@shared/utils/ttlStorage';
import { Patient } from '../types';
import { usePatientState } from './usePatientState';

const mockPatientsRead = vi.hoisted(() => vi.fn());

vi.mock('@shared/data/mockPatients', () => {
  return {
    get MOCK_PATIENTS() {
      mockPatientsRead();
      return [{
        id: 'mock-1',
        firstName: 'Wei',
        lastName: 'Chen',
        dob: '1980-05-01',
        mrn: '1',
        gender: 'Male',
        city: 'Newtown',
        history: {
          date: '2024-03-10',
          grade: 'Grade III',
          reactionSummary: 'Mock reaction',
          symptoms: [],
          treatment: [],
          suspectedAgents: [],
          procedure: 'Mock procedure',
          anaesthetist: 'Dr Mock',
        },
      }];
    },
  };
});

const importedPatients: Patient[] = [{
  id: 'synthetic-1',
  firstName: 'Avery',
  lastName: 'Testpatient',
  dob: '1980-01-01',
  mrn: 'SYN-001',
  redcapId: 'synthetic-1',
  gender: 'Other',
  city: 'Test City',
  history: {
    date: '2026-07-14',
    grade: 'Grade II',
    reactionSummary: 'Synthetic test reaction',
    symptoms: [{ label: 'Flushing' }],
    treatment: ['Observation'],
    suspectedAgents: ['Test agent'],
    procedure: 'Synthetic procedure',
    anaesthetist: 'Dr Test',
  },
}];

const writeStoredCohort = (value: unknown, savedAt: number) => {
  localStorage.setItem(PATIENT_DB_KEY, JSON.stringify({ value, savedAt }));
};

describe('usePatientState', () => {
  beforeEach(() => {
    localStorage.clear();
    mockPatientsRead.mockClear();
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it('persists an uploaded cohort with its matching database metadata', async () => {
    const setWithTTLSpy = vi.spyOn(ttlStorage, 'setWithTTL');
    const { result } = renderHook(() => usePatientState());
    await waitFor(() => expect(result.current.isLoadingPatients).toBe(false));

    const fileLastModified = new Date(2026, 6, 14, 12, 0).getTime();
    act(() => result.current.handleUploadPatients(importedPatients, fileLastModified));

    expect(setWithTTLSpy).toHaveBeenCalledWith(PATIENT_DB_KEY, {
      patients: importedPatients,
      databaseDate: '14/07/2026',
      hasUploadedData: true,
    });
    expect(result.current.patientDbSavedAt).not.toBeNull();
  });

  it('hydrates a fresh valid cohort without loading demo patients', async () => {
    const savedAt = Date.now() - 1_000;
    writeStoredCohort({
      patients: importedPatients,
      databaseDate: '14/07/2026',
      hasUploadedData: true,
    }, savedAt);

    const { result } = renderHook(() => usePatientState());

    await waitFor(() => expect(result.current.isLoadingPatients).toBe(false));
    expect(result.current.patients).toEqual(importedPatients);
    expect(result.current.databaseDate).toBe('14/07/2026');
    expect(result.current.hasUploadedData).toBe(true);
    expect(result.current.patientDbSavedAt).toBe(savedAt);
    expect(mockPatientsRead).not.toHaveBeenCalled();
  });

  it.each([
    ['stale', {
      patients: importedPatients,
      databaseDate: '14/07/2026',
      hasUploadedData: true,
    }, Date.now() - ACTIVE_REPORT_TTL_MS - 1],
    ['corrupt', {
      patients: 'not-an-array',
      databaseDate: '14/07/2026',
      hasUploadedData: true,
    }, Date.now()],
  ])('falls back to demo patients for a %s stored cohort', async (_label, value, savedAt) => {
    writeStoredCohort(value, savedAt);

    const { result } = renderHook(() => usePatientState());

    await waitFor(() => expect(result.current.isLoadingPatients).toBe(false));
    expect(result.current.patients[0].firstName).toBe('Wei');
    expect(result.current.hasUploadedData).toBe(false);
    expect(result.current.patientDbSavedAt).toBeNull();
    expect(mockPatientsRead).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem(PATIENT_DB_KEY)).toBeNull();
  });

  it('adds and removes a suspected agent and updates the selected patient', async () => {
    const setWithTTLSpy = vi.spyOn(ttlStorage, 'setWithTTL');
    const { result } = renderHook(() => usePatientState());
    await waitFor(() => expect(result.current.isLoadingPatients).toBe(false));

    act(() => result.current.handlePatientSelect(result.current.patients[0]));
    act(() => result.current.toggleSuspectedAgent('mock-1', 'Propofol'));

    expect(result.current.patients[0].history.suspectedAgents).toEqual(['Propofol']);
    expect(result.current.selectedPatient?.history.suspectedAgents).toEqual(['Propofol']);
    expect(setWithTTLSpy).not.toHaveBeenCalled();

    act(() => result.current.toggleSuspectedAgent('mock-1', 'Propofol'));

    expect(result.current.patients[0].history.suspectedAgents).toEqual([]);
    expect(result.current.selectedPatient?.history.suspectedAgents).toEqual([]);
    expect(setWithTTLSpy).not.toHaveBeenCalled();
  });

  it('persists suspected-agent changes for an uploaded cohort', async () => {
    writeStoredCohort({
      patients: importedPatients,
      databaseDate: '14/07/2026',
      hasUploadedData: true,
    }, Date.now());
    const setWithTTLSpy = vi.spyOn(ttlStorage, 'setWithTTL');
    const { result } = renderHook(() => usePatientState());
    await waitFor(() => expect(result.current.isLoadingPatients).toBe(false));

    act(() => result.current.handlePatientSelect(result.current.patients[0]));
    act(() => result.current.toggleSuspectedAgent('synthetic-1', 'Propofol'));

    expect(result.current.patients[0].history.suspectedAgents).toEqual(['Test agent', 'Propofol']);
    expect(result.current.selectedPatient?.history.suspectedAgents).toEqual(['Test agent', 'Propofol']);
    expect(setWithTTLSpy).toHaveBeenCalledWith(PATIENT_DB_KEY, {
      patients: [expect.objectContaining({
        id: 'synthetic-1',
        history: expect.objectContaining({ suspectedAgents: ['Test agent', 'Propofol'] }),
      })],
      databaseDate: '14/07/2026',
      hasUploadedData: true,
    });
  });
});
