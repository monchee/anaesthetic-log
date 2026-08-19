import { describe, expect, it } from 'vitest';
import { parsePatientTimeline } from './timelineUtils';
import { createMockPatientHistory } from '@/src/test/factories/patientFactory';

describe('timelineUtils', () => {
  describe('parsePatientTimeline', () => {
    it('parses timed and untimed medications, induction, and reaction onset into chronological events', () => {
      const history = createMockPatientHistory({
        inductionTime: '08:50',
        reactionTime: '09:05',
        medications: [
          'Propofol 200mg @ 08:45',
          'Rocuronium 50mg @ 08:50',
          'Cefazolin 2g',
        ],
        preInductionDrugs: ['Midazolam 2mg @ 08:30'],
        postInductionDrugs: ['Metaraminol 0.5mg @ 09:07'],
        anaesthesiaType: ['General Anaesthesia'],
      });

      const { events, untimedMedications } = parsePatientTimeline(history);

      // Verify event count: 4 timed meds + 1 induction + 1 reaction = 6 events
      expect(events).toHaveLength(6);

      // Verify chronological ordering
      expect(events[0]).toEqual({ time: '08:30', type: 'med', label: 'Midazolam' });
      expect(events[1]).toEqual({ time: '08:45', type: 'med', label: 'Propofol' });
      expect(events[2]).toEqual({ time: '08:50', type: 'med', label: 'Rocuronium' });
      expect(events[3]).toEqual({ time: '08:50', type: 'induction', label: 'Anaesthetic Induction' });
      expect(events[4]).toEqual({ time: '09:05', type: 'reaction', label: 'Reaction Onset' });
      expect(events[5]).toEqual({ time: '09:07', type: 'med', label: 'Metaraminol' });

      // Untimed medications (dosage stripped, trimmed)
      expect(untimedMedications).toEqual(['Cefazolin']);
    });

    it('strips dosages with word-boundary units (mg, g, mcg, ml, l, units) correctly', () => {
      const history = createMockPatientHistory({
        inductionTime: '',
        reactionTime: '',
        medications: [
          'Fentanyl 100mcg @ 08:00',
          'Sugammadex 200mg @ 09:30',
          'Morphine 2.5ml @ 08:20',
          'Oxytocin 5units @ 08:25',
          'Saline 1l @ 08:10',
        ],
      });

      const { events } = parsePatientTimeline(history);

      expect(events.map(e => e.label)).toEqual([
        'Fentanyl',
        'Saline',
        'Morphine',
        'Oxytocin',
        'Sugammadex',
      ]);
    });

    it('filters out anaesthesia types from untimed medications list', () => {
      const history = createMockPatientHistory({
        inductionTime: '',
        reactionTime: '',
        medications: [
          'General Anaesthesia',
          'GA',
          'Regional Block',
          'IV Sedation',
          'Paracetamol 1g',
        ],
        anaesthesiaType: ['General Anaesthesia'],
      });

      const { untimedMedications } = parsePatientTimeline(history);

      expect(untimedMedications).toEqual(['Paracetamol']);
      expect(untimedMedications).not.toContain('General Anaesthesia');
      expect(untimedMedications).not.toContain('GA');
      expect(untimedMedications).not.toContain('Regional Block');
      expect(untimedMedications).not.toContain('IV Sedation');
    });

    it('deduplicates identical drug entries across medication lists', () => {
      const history = createMockPatientHistory({
        inductionTime: '',
        reactionTime: '',
        medications: ['Cefazolin 2g', 'Propofol @ 08:00'],
        preInductionDrugs: ['Cefazolin 2g'],
        postInductionDrugs: ['Propofol @ 08:00'],
      });

      const { events, untimedMedications } = parsePatientTimeline(history);

      expect(events).toHaveLength(1);
      expect(events[0]).toEqual({ time: '08:00', type: 'med', label: 'Propofol' });
      expect(untimedMedications).toEqual(['Cefazolin']);
    });

    it('handles empty medication lists and blank strings safely', () => {
      const history = createMockPatientHistory({
        inductionTime: '',
        reactionTime: '',
        medications: ['', '   '],
        preInductionDrugs: [],
        postInductionDrugs: [],
      });

      const { events, untimedMedications } = parsePatientTimeline(history);

      expect(events).toEqual([]);
      expect(untimedMedications).toEqual([]);
    });

    it('handles untimed medication without @ delimiter and without time after @', () => {
      const history = createMockPatientHistory({
        inductionTime: '',
        reactionTime: '',
        medications: ['Amoxicillin @', 'Gentamicin 80mg'],
      });

      const { events, untimedMedications } = parsePatientTimeline(history);

      expect(events).toEqual([]);
      expect(untimedMedications).toEqual(['Amoxicillin', 'Gentamicin']);
    });
  });
});
