import { describe, expect, it } from 'vitest';
import { getGradeVariant } from './gradingUtils';

describe('gradingUtils', () => {
  describe('getGradeVariant', () => {
    it('returns "ungraded" for empty or falsy strings', () => {
      expect(getGradeVariant('')).toBe('ungraded');
      expect(getGradeVariant(null as unknown as string)).toBe('ungraded');
      expect(getGradeVariant(undefined as unknown as string)).toBe('ungraded');
    });

    it('identifies Grade 4 / Cardiac Arrest', () => {
      expect(getGradeVariant('Grade IV')).toBe('grade4');
      expect(getGradeVariant('GRADE IV')).toBe('grade4');
      expect(getGradeVariant('grade iv')).toBe('grade4');
      expect(getGradeVariant('Grade IV (Cardiac Arrest)')).toBe('grade4');
      expect(getGradeVariant('CARDIAC ARREST')).toBe('grade4');
      expect(getGradeVariant('Cardiac Arrest')).toBe('grade4');
      expect(getGradeVariant('cardiac arrest')).toBe('grade4');
      expect(getGradeVariant('4')).toBe('grade4');
    });

    it('identifies Grade 3 / Life Threatening', () => {
      expect(getGradeVariant('Grade III')).toBe('grade3');
      expect(getGradeVariant('GRADE III')).toBe('grade3');
      expect(getGradeVariant('grade iii')).toBe('grade3');
      expect(getGradeVariant('Grade III - Severe')).toBe('grade3');
      expect(getGradeVariant('LIFE THREATENING')).toBe('grade3');
      expect(getGradeVariant('Life Threatening')).toBe('grade3');
      expect(getGradeVariant('life threatening')).toBe('grade3');
      expect(getGradeVariant('3')).toBe('grade3');
    });

    it('identifies Grade 2 / Moderate', () => {
      expect(getGradeVariant('Grade II')).toBe('grade2');
      expect(getGradeVariant('GRADE II')).toBe('grade2');
      expect(getGradeVariant('grade ii')).toBe('grade2');
      expect(getGradeVariant('Grade II (Moderate)')).toBe('grade2');
      expect(getGradeVariant('MODERATE')).toBe('grade2');
      expect(getGradeVariant('Moderate')).toBe('grade2');
      expect(getGradeVariant('moderate')).toBe('grade2');
      expect(getGradeVariant('2')).toBe('grade2');
    });

    it('identifies Grade 1 / Cutaneous', () => {
      expect(getGradeVariant('Grade I')).toBe('grade1');
      expect(getGradeVariant('GRADE I')).toBe('grade1');
      expect(getGradeVariant('grade i')).toBe('grade1');
      expect(getGradeVariant('Grade I (Mild)')).toBe('grade1');
      expect(getGradeVariant('CUTANEOUS')).toBe('grade1');
      expect(getGradeVariant('Cutaneous')).toBe('grade1');
      expect(getGradeVariant('cutaneous')).toBe('grade1');
      expect(getGradeVariant('1')).toBe('grade1');
    });

    it('returns "ungraded" for unrecognised grades', () => {
      expect(getGradeVariant('Unknown')).toBe('ungraded');
      expect(getGradeVariant('N/A')).toBe('ungraded');
      expect(getGradeVariant('Ungraded')).toBe('ungraded');
      expect(getGradeVariant('None')).toBe('ungraded');
      expect(getGradeVariant('Grade 0')).toBe('ungraded');
    });
  });
});
