import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Patient } from '../../../types';
import * as patientRepository from '../patientRepository';

describe('Patient Repository', () => {
  const mockPatients: Patient[] = [
    {
      id: '1',
      name: 'John Doe',
      dob: '1980-01-01',
      mrn: 'MRN001',
      gender: 'Male',
      city: 'Sydney',
      reaction_history: [
        {
          drug: 'Rocuronium',
          grade: '3',
          outcome: 'Abandoned',
        },
      ],
    },
    {
      id: '2',
      name: 'Jane Smith',
      dob: '1990-05-15',
      mrn: 'MRN002',
      gender: 'Female',
      city: 'Melbourne',
      reaction_history: [],
    },
    {
      id: '3',
      name: 'Bob Johnson',
      dob: '1975-12-20',
      mrn: 'MRN003',
      gender: 'Male',
      city: 'Brisbane',
      reaction_history: [
        {
          drug: 'Propofol',
          grade: '1',
          outcome: 'Completed',
        },
        {
          drug: 'Fentanyl',
          grade: '2',
          outcome: 'Completed',
        },
      ],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('searchPatients', () => {
    it('searches by patient name (case insensitive)', () => {
      const result = patientRepository.searchPatients(mockPatients, 'john');

      expect(result).toHaveLength(2);
      expect(result.every((p) => p.name.toLowerCase().includes('john'))).toBe(true);
    });

    it('searches by MRN', () => {
      const result = patientRepository.searchPatients(mockPatients, 'MRN002');

      expect(result).toHaveLength(1);
      expect(result[0].mrn).toBe('MRN002');
    });

    it('searches by city', () => {
      const result = patientRepository.searchPatients(mockPatients, 'sydney');

      expect(result).toHaveLength(1);
      expect(result[0].city).toBe('Sydney');
    });

    it('returns empty array when no matches found', () => {
      const result = patientRepository.searchPatients(mockPatients, 'NonExistent');

      expect(result).toHaveLength(0);
    });

    it('returns all patients when search term is empty', () => {
      const result = patientRepository.searchPatients(mockPatients, '');

      expect(result).toHaveLength(3);
    });

    it('handles partial matches correctly', () => {
      const result = patientRepository.searchPatients(mockPatients, 'Smith');

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Jane Smith');
    });
  });

  describe('filterByGrade', () => {
    it('filters patients with grade 3+ reactions', () => {
      const result = patientRepository.filterByGrade(mockPatients, '3');

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('John Doe');
    });

    it('filters patients with grade 2 reactions', () => {
      const result = patientRepository.filterByGrade(mockPatients, '2');

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Bob Johnson');
    });

    it('returns all patients when grade is "all"', () => {
      const result = patientRepository.filterByGrade(mockPatients, 'all');

      expect(result).toHaveLength(3);
    });

    it('returns empty array when no patients match grade', () => {
      const result = patientRepository.filterByGrade(mockPatients, '4');

      expect(result).toHaveLength(0);
    });
  });

  describe('filterByOutcome', () => {
    it('filters patients with abandoned procedures', () => {
      const result = patientRepository.filterByOutcome(mockPatients, 'Abandoned');

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('John Doe');
    });

    it('filters patients with completed procedures', () => {
      const result = patientRepository.filterByOutcome(mockPatients, 'Completed');

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Bob Johnson');
    });

    it('returns all patients when outcome is "all"', () => {
      const result = patientRepository.filterByOutcome(mockPatients, 'all');

      expect(result).toHaveLength(3);
    });
  });

  describe('getPatientById', () => {
    it('returns patient by ID', () => {
      const result = patientRepository.getPatientById(mockPatients, '1');

      expect(result).toBeDefined();
      expect(result?.id).toBe('1');
      expect(result?.name).toBe('John Doe');
    });

    it('returns undefined for non-existent ID', () => {
      const result = patientRepository.getPatientById(mockPatients, '999');

      expect(result).toBeUndefined();
    });
  });

  describe('getPatientByMRN', () => {
    it('returns patient by MRN', () => {
      const result = patientRepository.getPatientByMRN(mockPatients, 'MRN002');

      expect(result).toBeDefined();
      expect(result?.mrn).toBe('MRN002');
      expect(result?.name).toBe('Jane Smith');
    });

    it('returns undefined for non-existent MRN', () => {
      const result = patientRepository.getPatientByMRN(mockPatients, 'MRN999');

      expect(result).toBeUndefined();
    });
  });

  describe('sortPatients', () => {
    it('sorts patients by name ascending', () => {
      const result = patientRepository.sortPatients(mockPatients, 'name', 'asc');

      expect(result[0].name).toBe('Bob Johnson');
      expect(result[1].name).toBe('Jane Smith');
      expect(result[2].name).toBe('John Doe');
    });

    it('sorts patients by name descending', () => {
      const result = patientRepository.sortPatients(mockPatients, 'name', 'desc');

      expect(result[0].name).toBe('John Doe');
      expect(result[1].name).toBe('Jane Smith');
      expect(result[2].name).toBe('Bob Johnson');
    });

    it('sorts patients by MRN', () => {
      const result = patientRepository.sortPatients(mockPatients, 'mrn', 'asc');

      expect(result[0].mrn).toBe('MRN001');
      expect(result[1].mrn).toBe('MRN002');
      expect(result[2].mrn).toBe('MRN003');
    });

    it('handles empty array', () => {
      const result = patientRepository.sortPatients([], 'name', 'asc');

      expect(result).toHaveLength(0);
    });
  });

  describe('getUniqueDrugs', () => {
    it('returns unique drugs from all reaction histories', () => {
      const result = patientRepository.getUniqueDrugs(mockPatients);

      expect(result).toContain('Rocuronium');
      expect(result).toContain('Propofol');
      expect(result).toContain('Fentanyl');
      expect(result).toHaveLength(3);
    });

    it('returns empty array when no reactions exist', () => {
      const patientsWithoutReactions = mockPatients.map((p) => ({
        ...p,
        reaction_history: [],
      }));

      const result = patientRepository.getUniqueDrugs(patientsWithoutReactions);

      expect(result).toHaveLength(0);
    });
  });

  describe('getDrugCategories', () => {
    it('categorizes drugs correctly', () => {
      const drugCategories = {
        'Muscle Relaxants': ['Rocuronium', 'Suxamethonium', 'Vecuronium'],
        'Anaesthetics': ['Propofol', 'Fentanyl', 'Sevoflurane'],
        'Antibiotics': ['Penicillin', 'Cephalosporin'],
      };

      const result = patientRepository.getDrugCategories(mockPatients, drugCategories);

      expect(result['Muscle Relaxants']).toContain('Rocuronium');
      expect(result['Anaesthetics']).toContain('Propofol');
      expect(result['Anaesthetics']).toContain('Fentanyl');
    });
  });

  describe('Error Handling', () => {
    it('handles null patients array gracefully', () => {
      const result = patientRepository.searchPatients(null as any, 'test');

      expect(result).toHaveLength(0);
    });

    it('handles undefined patients array gracefully', () => {
      const result = patientRepository.searchPatients(undefined as any, 'test');

      expect(result).toHaveLength(0);
    });

    it('handles patients with missing reaction history', () => {
      const patientsWithMissingHistory = [
        ...mockPatients,
        {
          id: '4',
          name: 'Test Patient',
          dob: '1990-01-01',
          mrn: 'MRN004',
          gender: 'Male',
          city: 'Perth',
          reaction_history: undefined as any,
        },
      ];

      const result = patientRepository.getUniqueDrugs(patientsWithMissingHistory);

      // Should not throw error
      expect(result).toBeDefined();
    });
  });

  describe('Data Validation', () => {
    it('validates patient ID is present', () => {
      const invalidPatient = { ...mockPatients[0], id: '' };

      const isValid = patientRepository.validatePatient(invalidPatient);

      expect(isValid).toBe(false);
    });

    it('validates patient name is present', () => {
      const invalidPatient = { ...mockPatients[0], name: '' };

      const isValid = patientRepository.validatePatient(invalidPatient);

      expect(isValid).toBe(false);
    });

    it('validates MRN is present', () => {
      const invalidPatient = { ...mockPatients[0], mrn: '' };

      const isValid = patientRepository.validatePatient(invalidPatient);

      expect(isValid).toBe(false);
    });

    it('returns true for valid patient', () => {
      const isValid = patientRepository.validatePatient(mockPatients[0]);

      expect(isValid).toBe(true);
    });
  });
});
