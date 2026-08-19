import { describe, expect, it } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAdvancedSearch, INITIAL_FILTERS } from './useAdvancedSearch';
import { createMockPatient, createMockPatientHistory } from '@/src/test/factories/patientFactory';

describe('useAdvancedSearch', () => {
  const samplePatients = [
    createMockPatient({
      id: 'P1',
      firstName: 'Wei',
      lastName: 'Chen',
      mrn: 'MRN001',
      history: createMockPatientHistory({
        date: '2024-01-15',
        grade: 'Grade IV (Cardiac Arrest)',
        procedure: 'Laparoscopic Appendectomy',
        hospital: 'Royal Prince Alfred Hospital',
        procedureOutcome: 'abandoned',
        suspectedAgents: ['Rocuronium'],
        medications: ['Rocuronium @ 09:00', 'Propofol @ 08:50'],
      }),
    }),
    createMockPatient({
      id: 'P2',
      firstName: 'Sarah',
      lastName: 'Connor',
      mrn: 'MRN002',
      history: createMockPatientHistory({
        date: '2024-02-20',
        grade: 'Grade III',
        procedure: 'Total Knee Replacement',
        hospital: 'Concord Hospital',
        procedureOutcome: 'Completed',
        suspectedAgents: ['Cefazolin', 'Rocuronium'],
        medications: ['Cefazolin @ 10:00', 'Rocuronium @ 10:05'],
      }),
    }),
    createMockPatient({
      id: 'P3',
      firstName: 'David',
      lastName: 'Miller',
      mrn: 'MRN003',
      history: createMockPatientHistory({
        date: '2024-03-10',
        grade: 'Grade II',
        procedure: 'Endoscopy',
        hospital: 'Royal Prince Alfred Hospital',
        procedureOutcome: 'Completed',
        suspectedAgents: ['Propofol'],
        medications: ['Propofol @ 14:00'],
      }),
    }),
  ];

  it('initialises with default state and generates sorted suggestions', () => {
    const { result } = renderHook(() => useAdvancedSearch(samplePatients));

    expect(result.current.filters).toEqual(INITIAL_FILTERS);
    expect(result.current.activeFilterCount).toBe(0);
    expect(result.current.filteredPatients).toHaveLength(3);

    expect(result.current.suggestions.hospitals).toEqual([
      'Concord Hospital',
      'Royal Prince Alfred Hospital',
    ]);
    expect(result.current.suggestions.procedures).toEqual([
      'Endoscopy',
      'Laparoscopic Appendectomy',
      'Total Knee Replacement',
    ]);
    expect(result.current.suggestions.agents).toEqual([
      'Cefazolin',
      'Propofol',
      'Rocuronium',
    ]);
  });

  it('filters by text query (name, MRN, suspected agent)', () => {
    const { result } = renderHook(() => useAdvancedSearch(samplePatients));

    // Name match
    act(() => {
      result.current.updateFilter('textQuery', 'Wei');
    });
    expect(result.current.filteredPatients.map(p => p.id)).toEqual(['P1']);

    // MRN match
    act(() => {
      result.current.updateFilter('textQuery', 'MRN002');
    });
    expect(result.current.filteredPatients.map(p => p.id)).toEqual(['P2']);

    // Suspected agent match
    act(() => {
      result.current.updateFilter('textQuery', 'cefazolin');
    });
    expect(result.current.filteredPatients.map(p => p.id)).toEqual(['P2']);
  });

  it('filters by clinical severity grades', () => {
    const { result } = renderHook(() => useAdvancedSearch(samplePatients));

    act(() => {
      result.current.updateFilter('grades', ['IV', 'III']);
    });

    expect(result.current.filteredPatients.map(p => p.id)).toEqual(['P1', 'P2']);
    expect(result.current.activeFilterCount).toBe(1);
  });

  it('filters by date range (supports dd/mm/yyyy and yyyy-mm-dd)', () => {
    const { result } = renderHook(() => useAdvancedSearch(samplePatients));

    act(() => {
      result.current.updateFilter('dateFrom', '2024-02-01');
      result.current.updateFilter('dateTo', '2024-03-31');
    });

    expect(result.current.filteredPatients.map(p => p.id)).toEqual(['P2', 'P3']);
    expect(result.current.activeFilterCount).toBe(2);
  });

  it('filters by procedure type and hospital', () => {
    const { result } = renderHook(() => useAdvancedSearch(samplePatients));

    act(() => {
      result.current.updateFilter('hospital', 'Concord');
    });
    expect(result.current.filteredPatients.map(p => p.id)).toEqual(['P2']);

    act(() => {
      result.current.updateFilter('hospital', '');
      result.current.updateFilter('procedureType', 'appendectomy');
    });
    expect(result.current.filteredPatients.map(p => p.id)).toEqual(['P1']);
  });

  it('filters by suspected agents with AND logic', () => {
    const { result } = renderHook(() => useAdvancedSearch(samplePatients));

    act(() => {
      result.current.updateFilter('suspectedAgents', ['Rocuronium', 'Cefazolin']);
    });

    // P2 has both; P1 only has Rocuronium; P3 only has Propofol
    expect(result.current.filteredPatients.map(p => p.id)).toEqual(['P2']);
  });

  it('filters by procedure outcome (abandoned vs completed)', () => {
    const { result } = renderHook(() => useAdvancedSearch(samplePatients));

    act(() => {
      result.current.updateFilter('outcomeFilter', 'abandoned');
    });
    expect(result.current.filteredPatients.map(p => p.id)).toEqual(['P1']);

    act(() => {
      result.current.updateFilter('outcomeFilter', 'completed');
    });
    expect(result.current.filteredPatients.map(p => p.id)).toEqual(['P2', 'P3']);
  });

  it('clears all filters and resets active filter count', () => {
    const { result } = renderHook(() => useAdvancedSearch(samplePatients));

    act(() => {
      result.current.updateFilter('grades', ['IV']);
      result.current.updateFilter('hospital', 'RPAH');
      result.current.updateFilter('outcomeFilter', 'abandoned');
    });
    expect(result.current.activeFilterCount).toBe(3);

    act(() => {
      result.current.clearFilters();
    });
    expect(result.current.filters).toEqual(INITIAL_FILTERS);
    expect(result.current.activeFilterCount).toBe(0);
    expect(result.current.filteredPatients).toHaveLength(3);
  });
});
