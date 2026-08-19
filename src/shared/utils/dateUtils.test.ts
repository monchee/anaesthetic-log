import { describe, expect, it } from 'vitest';
import { formatDate, formatTime, calculateTimeDifference } from './dateUtils';

describe('dateUtils', () => {
  describe('formatDate', () => {
    it('returns empty string for empty input', () => {
      expect(formatDate('')).toBe('');
      expect(formatDate(null as unknown as string)).toBe('');
      expect(formatDate(undefined as unknown as string)).toBe('');
    });

    it('returns raw string if parsing produces an invalid date', () => {
      expect(formatDate('invalid-date-string')).toBe('invalid-date-string');
    });

    it('formats valid date strings into DD/MM/YYYY', () => {
      // Using explicit year, month, day string
      expect(formatDate('2024-03-05')).toBe('05/03/2024');
      expect(formatDate('2024-11-28')).toBe('28/11/2024');
    });
  });

  describe('formatTime', () => {
    it('formats timestamp to 2-digit 24h time string', () => {
      const date = new Date(2024, 0, 1, 14, 35, 0);
      expect(formatTime(date.getTime())).toBe('14:35');

      const morningDate = new Date(2024, 0, 1, 8, 5, 0);
      expect(formatTime(morningDate.getTime())).toBe('08:05');
    });
  });

  describe('calculateTimeDifference', () => {
    it('returns null if start or end is missing or invalid', () => {
      expect(calculateTimeDifference()).toBeNull();
      expect(calculateTimeDifference('09:00', '')).toBeNull();
      expect(calculateTimeDifference('', '09:30')).toBeNull();
      expect(calculateTimeDifference('invalid', '09:30')).toBeNull();
      expect(calculateTimeDifference('09:00', 'invalid')).toBeNull();
    });

    it('calculates minute differences for standard times on the same day', () => {
      expect(calculateTimeDifference('09:00', '09:00')).toBe(0);
      expect(calculateTimeDifference('09:15', '09:45')).toBe(30);
      expect(calculateTimeDifference('08:30', '10:00')).toBe(90);
      expect(calculateTimeDifference('09:10:00', '09:25:30')).toBe(15);
    });

    it('handles midnight crossing when end time is on the next day', () => {
      // Induction at 23:50, reaction at 00:10 -> 20 minutes
      expect(calculateTimeDifference('23:50', '00:10')).toBe(20);
      // Induction at 23:00, reaction at 01:30 -> 150 minutes
      expect(calculateTimeDifference('23:00', '01:30')).toBe(150);
    });
  });
});
