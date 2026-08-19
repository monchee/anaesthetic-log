import { describe, expect, it } from 'vitest';
import {
  searchPatients,
  filterByGrade,
  filterByOutcome,
  getPatientById,
  getPatientByMRN,
  sortPatients,
  getUniqueDrugs,
  getDrugCategories,
  validatePatient,
} from './patientRepository';
import { createMockPatient, createMockPatientHistory } from '@/src/test/factories/patientFactory';

describe('patientRepository', () => {
  const mockPatients = [
    createMockPatient({
      id: 'P1',
      firstName: 'Alice',
      lastName: 'Smith',
      mrn: 'MRN001',
      city: 'Sydney',
      history: createMockPatientHistory({
        grade: 'Grade 3',
        suspectedAgents: ['Rocuronium', 'Cefazolin'],
      }),
    }),
    createMockPatient({
      id: 'P2',
      firstName: 'Bob',
      lastName: 'Jones',
      mrn: 'MRN002',
      city: 'Melbourne',
      history: createMockPatientHistory({
        grade: 'Grade 2',
        suspectedAgents: ['Propofol'],
      }),
    }),
    createMockPatient({
      id: 'P3',
      firstName: 'Charlie',
      lastName: 'Brown',
      mrn: 'MRN003',
      city: 'Brisbane',
      history: createMockPatientHistory({
        grade: 'Grade 3',
        suspectedAgents: ['Rocuronium', 'Sugammadex'],
      }),
    }),
  ];

  describe('searchPatients', () => {
    it('returns empty array if input patients list is null or undefined', () => {
      expect(searchPatients(null, 'Alice')).toEqual([]);
      expect(searchPatients(undefined, 'Alice')).toEqual([]);
    });

    it('returns all patients if search term is empty or whitespace', () => {
      expect(searchPatients(mockPatients, '')).toEqual(mockPatients);
      expect(searchPatients(mockPatients, '   ')).toEqual(mockPatients);
    });

    it('searches by patient first name, last name, full name, MRN, city, and ID case-insensitively', () => {
      expect(searchPatients(mockPatients, 'alice')).toEqual([mockPatients[0]]);
      expect(searchPatients(mockPatients, 'JONES')).toEqual([mockPatients[1]]);
      expect(searchPatients(mockPatients, 'charlie brown')).toEqual([mockPatients[2]]);
      expect(searchPatients(mockPatients, 'mrn002')).toEqual([mockPatients[1]]);
      expect(searchPatients(mockPatients, 'sydney')).toEqual([mockPatients[0]]);
      expect(searchPatients(mockPatients, 'P3')).toEqual([mockPatients[2]]);
    });

    it('returns empty array when no matches are found', () => {
      expect(searchPatients(mockPatients, 'Nonexistent')).toEqual([]);
    });
  });

  describe('filterByGrade', () => {
    it('returns all patients when grade is "all"', () => {
      expect(filterByGrade(mockPatients, 'all')).toEqual(mockPatients);
    });

    it('filters patients matching exact grade', () => {
      const grade3Patients = filterByGrade(mockPatients, 'Grade 3');
      expect(grade3Patients).toHaveLength(2);
      expect(grade3Patients.map(p => p.id)).toEqual(['P1', 'P3']);

      const grade2Patients = filterByGrade(mockPatients, 'Grade 2');
      expect(grade2Patients).toHaveLength(1);
      expect(grade2Patients[0].id).toBe('P2');
    });
  });

  describe('filterByOutcome', () => {
    it('returns all patients when outcome is "all"', () => {
      expect(filterByOutcome(mockPatients, 'all')).toEqual(mockPatients);
    });

    it('filters patients by outcome proxy (grade)', () => {
      expect(filterByOutcome(mockPatients, 'Grade 2')).toHaveLength(1);
    });
  });

  describe('getPatientById', () => {
    it('finds patient by id', () => {
      expect(getPatientById(mockPatients, 'P2')).toBe(mockPatients[1]);
      expect(getPatientById(mockPatients, 'UNKNOWN')).toBeUndefined();
    });
  });

  describe('getPatientByMRN', () => {
    it('finds patient by MRN', () => {
      expect(getPatientByMRN(mockPatients, 'MRN003')).toBe(mockPatients[2]);
      expect(getPatientByMRN(mockPatients, 'MRN999')).toBeUndefined();
    });
  });

  describe('sortPatients', () => {
    it('sorts patients by name in ascending and descending order without mutating original array', () => {
      const asc = sortPatients(mockPatients, 'name', 'asc');
      expect(asc.map(p => p.firstName)).toEqual(['Alice', 'Bob', 'Charlie']);

      const desc = sortPatients(mockPatients, 'name', 'desc');
      expect(desc.map(p => p.firstName)).toEqual(['Charlie', 'Bob', 'Alice']);

      // Check original array unchanged
      expect(mockPatients[0].firstName).toBe('Alice');
    });

    it('sorts patients by MRN in ascending and descending order', () => {
      const asc = sortPatients(mockPatients, 'mrn', 'asc');
      expect(asc.map(p => p.mrn)).toEqual(['MRN001', 'MRN002', 'MRN003']);

      const desc = sortPatients(mockPatients, 'mrn', 'desc');
      expect(desc.map(p => p.mrn)).toEqual(['MRN003', 'MRN002', 'MRN001']);
    });
  });

  describe('getUniqueDrugs', () => {
    it('returns sorted deduplicated list of suspected agents', () => {
      const drugs = getUniqueDrugs(mockPatients);
      expect(drugs).toEqual(['Cefazolin', 'Propofol', 'Rocuronium', 'Sugammadex']);
    });

    it('handles patients with empty or missing history safely', () => {
      const emptyPatients = [createMockPatient({ history: undefined as any })];
      expect(getUniqueDrugs(emptyPatients)).toEqual([]);
    });
  });

  describe('getDrugCategories', () => {
    it('returns categories that contain at least one used suspected agent', () => {
      const categories = {
        'NMBAs': ['Rocuronium', 'Vecuronium'],
        'Induction': ['Propofol', 'Thiopentone'],
        'Antibiotics': ['Cefazolin', 'Amoxicillin'],
        'UnusedCategory': ['DrugA', 'DrugB'],
      };

      const result = getDrugCategories(mockPatients, categories);

      expect(result).toEqual({
        'NMBAs': ['Rocuronium'],
        'Induction': ['Propofol'],
        'Antibiotics': ['Cefazolin'],
      });
      expect(result).not.toHaveProperty('UnusedCategory');
    });
  });

  describe('validatePatient', () => {
    it('returns true when all required fields (id, firstName, lastName, mrn) are present', () => {
      expect(validatePatient(mockPatients[0])).toBe(true);
    });

    it('returns false when any required field is missing or empty', () => {
      expect(validatePatient(createMockPatient({ id: '' }))).toBe(false);
      expect(validatePatient(createMockPatient({ firstName: '' }))).toBe(false);
      expect(validatePatient(createMockPatient({ lastName: '' }))).toBe(false);
      expect(validatePatient(createMockPatient({ mrn: '' }))).toBe(false);
    });
  });
});
