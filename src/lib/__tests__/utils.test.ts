import { describe, it, expect } from 'vitest';
import { formatDate } from '@shared/utils';

describe('utils', () => {
  describe('formatDate', () => {
    it('formats date correctly to dd/mm/yyyy', () => {
      const date = '2024-01-15';
      const formatted = formatDate(date);
      expect(formatted).toBe('15/01/2024');
    });

    it('handles invalid date gracefully', () => {
      const result = formatDate('invalid-date');
      expect(result).toBeTruthy();
    });
  });
});
