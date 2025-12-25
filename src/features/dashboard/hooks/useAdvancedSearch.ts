import { useMemo, useState, useCallback } from 'react';
import { Patient } from '../../../../types';

export interface AdvancedSearchFilters {
  textQuery: string;
  grades: string[];
  dateFrom: string;
  dateTo: string;
  procedureType: string;
  suspectedAgents: string[];
  hospital: string;
  outcomeFilter: 'all' | 'abandoned' | 'completed';
}

export const INITIAL_FILTERS: AdvancedSearchFilters = {
  textQuery: '',
  grades: [],
  dateFrom: '',
  dateTo: '',
  procedureType: '',
  suspectedAgents: [],
  hospital: '',
  outcomeFilter: 'all',
};

interface UseAdvancedSearchResult {
  filteredPatients: Patient[];
  suggestions: {
    procedures: string[];
    hospitals: string[];
    agents: string[];
  };
  filters: AdvancedSearchFilters;
  setFilters: (value: AdvancedSearchFilters | ((prev: AdvancedSearchFilters) => AdvancedSearchFilters)) => void;
  updateFilter: <K extends keyof AdvancedSearchFilters>(key: K, value: AdvancedSearchFilters[K]) => void;
  clearFilters: () => void;
  activeFilterCount: number;
}

// Helper: Parse date string (handles dd/mm/yyyy and yyyy-mm-dd)
const parseDate = (dateStr: string): Date | null => {
  if (!dateStr) return null;
  
  // Try dd/mm/yyyy format
  const ddmmyyyy = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (ddmmyyyy) {
    return new Date(parseInt(ddmmyyyy[3]), parseInt(ddmmyyyy[2]) - 1, parseInt(ddmmyyyy[1]));
  }
  
  // Try yyyy-mm-dd format (HTML date input)
  const yyyymmdd = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (yyyymmdd) {
    return new Date(parseInt(yyyymmdd[1]), parseInt(yyyymmdd[2]) - 1, parseInt(yyyymmdd[3]));
  }
  
  // Fallback to Date constructor
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
};

// Helper: Normalise grade string for comparison
const normaliseGrade = (grade: string): string => {
  if (!grade) return 'ungraded';
  const g = grade.toUpperCase();
  if (g.includes('IV') || g.includes('CARDIAC ARREST')) return 'IV';
  if (g.includes('III')) return 'III';
  if (g.includes('II')) return 'II';
  if (g.includes('I')) return 'I';
  return 'ungraded';
};

export function useAdvancedSearch(patients: Patient[]): UseAdvancedSearchResult {
  const [filters, setFilters] = useState<AdvancedSearchFilters>(INITIAL_FILTERS);

  // Extract unique suggestions from the patient data
  const suggestions = useMemo(() => {
    const procedures = new Set<string>();
    const hospitals = new Set<string>();
    const agents = new Set<string>();

    patients.forEach(p => {
      if (p.history.procedure) procedures.add(p.history.procedure);
      if (p.history.hospital) hospitals.add(p.history.hospital);
      (p.history.suspectedAgents || []).forEach(a => {
        if (a) agents.add(a);
      });
      // Also extract agents from medications
      (p.history.medications || []).forEach(m => {
        const drugName = m.split('@')[0].trim();
        if (drugName) agents.add(drugName);
      });
    });

    return {
      procedures: Array.from(procedures).sort(),
      hospitals: Array.from(hospitals).sort(),
      agents: Array.from(agents).sort(),
    };
  }, [patients]);

  // Filter patients based on all criteria
  const filteredPatients = useMemo(() => {
    return patients.filter(p => {
      // Text query filter (name, MRN, suspected agents)
      if (filters.textQuery) {
        const query = filters.textQuery.toLowerCase();
        const matchesName = 
          (p.firstName || '').toLowerCase().includes(query) ||
          (p.lastName || '').toLowerCase().includes(query);
        const matchesMrn = (p.mrn || '').toLowerCase().includes(query);
        const matchesAgent = (p.history.suspectedAgents || []).some(
          a => (a || '').toLowerCase().includes(query)
        );
        if (!matchesName && !matchesMrn && !matchesAgent) return false;
      }

      // Grade filter
      if (filters.grades.length > 0) {
        const patientGrade = normaliseGrade(p.history.grade);
        if (!filters.grades.includes(patientGrade)) return false;
      }

      // Date range filter
      if (filters.dateFrom || filters.dateTo) {
        const patientDate = parseDate(p.history.date);
        if (!patientDate) return false;

        if (filters.dateFrom) {
          const fromDate = parseDate(filters.dateFrom);
          if (fromDate && patientDate < fromDate) return false;
        }

        if (filters.dateTo) {
          const toDate = parseDate(filters.dateTo);
          if (toDate && patientDate > toDate) return false;
        }
      }

      // Procedure type filter
      if (filters.procedureType) {
        const procedure = (p.history.procedure || '').toLowerCase();
        if (!procedure.includes(filters.procedureType.toLowerCase())) return false;
      }

      // Suspected agents filter (AND logic - patient must have ALL selected agents)
      if (filters.suspectedAgents.length > 0) {
        const patientAgents = [
          ...(p.history.suspectedAgents || []),
          ...(p.history.medications || []).map(m => m.split('@')[0].trim())
        ].map(a => a.toLowerCase());
        
        // Check if patient has ALL selected agents
        const hasAllAgents = filters.suspectedAgents.every(
          agent => patientAgents.some(pa => pa.includes(agent.toLowerCase()))
        );
        if (!hasAllAgents) return false;
      }

      // Hospital filter
      if (filters.hospital) {
        const hospital = (p.history.hospital || '').toLowerCase();
        if (!hospital.includes(filters.hospital.toLowerCase())) return false;
      }

      // Outcome filter
      if (filters.outcomeFilter !== 'all') {
        const outcome = (p.history.procedureOutcome || '').toLowerCase();
        const isAbandoned = outcome.includes('abandoned') || outcome.includes('adandoned') || outcome === '1';
        
        if (filters.outcomeFilter === 'abandoned' && !isAbandoned) return false;
        if (filters.outcomeFilter === 'completed' && isAbandoned) return false;
      }

      return true;
    });
  }, [patients, filters]);

  // Update a single filter
  const updateFilter = useCallback(<K extends keyof AdvancedSearchFilters>(
    key: K,
    value: AdvancedSearchFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
  }, []);

  // Count active filters (excluding textQuery which uses the main search box)
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.grades.length > 0) count++;
    if (filters.dateFrom) count++;
    if (filters.dateTo) count++;
    if (filters.procedureType) count++;
    if (filters.suspectedAgents.length > 0) count += filters.suspectedAgents.length;
    if (filters.hospital) count++;
    if (filters.outcomeFilter !== 'all') count++;
    return count;
  }, [filters]);

  return {
    filteredPatients,
    suggestions,
    filters,
    setFilters,
    updateFilter,
    clearFilters,
    activeFilterCount,
  };
}
