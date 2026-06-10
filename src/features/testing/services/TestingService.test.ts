import { describe, expect, it } from 'vitest';
import { LogFormData, DrugTestRow } from '../types';
import { TestingService } from './TestingService';

const service = new TestingService();

const baseForm = (): LogFormData => ({
  mrn: '123456',
  firstName: 'Jane',
  lastName: 'Citizen',
  visitDate: '2026-06-10',
  controls: {
    histamineSpt: '5',
    salineSpt: '0',
    salineIdt: '0',
  },
  testPanel: [
    {
      drugName: 'Rocuronium',
      sptWheal: '0',
      idtResults: ['0', '0'],
      protocolIndex: 0,
    },
  ],
  proceedToChallenge: false,
  challengeDrug: '',
  challengeDrugCustom: '',
  outcome: null,
  reactionTime: '',
  symptoms: [],
  symptomsOther: '',
  interventionType: '',
  interventionOther: '',
  plan: '',
});

const row = (overrides: Partial<DrugTestRow>): DrugTestRow => ({
  drugName: 'Rocuronium',
  sptWheal: '',
  idtResults: [],
  protocolIndex: 0,
  ...overrides,
});

describe('TestingService', () => {
  describe('validateForm', () => {
    it('accepts a complete non-challenge form', () => {
      expect(service.validateForm(baseForm())).toEqual({ isValid: true, errors: [] });
    });

    it('requires patient identity and visit fields', () => {
      const result = service.validateForm({
        ...baseForm(),
        mrn: ' ',
        firstName: '',
        lastName: '',
        visitDate: '',
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual([
        'MRN is required',
        'First name is required',
        'Last name is required',
        'Visit date is required',
      ]);
    });

    it('requires at least one named drug test', () => {
      expect(service.validateForm({ ...baseForm(), testPanel: [] }).errors)
        .toContain('At least one drug test is required');

      expect(service.validateForm({
        ...baseForm(),
        testPanel: [row({ drugName: 'Other', customName: ' ' })],
      }).errors).toContain("Custom drug name must be specified for all 'Other' entries");
    });

    it('requires challenge details when challenge proceeds', () => {
      const result = service.validateForm({
        ...baseForm(),
        proceedToChallenge: true,
        challengeDrug: '',
        outcome: null,
      });

      expect(result.errors).toEqual([
        'Challenge drug must be selected',
        'Challenge outcome must be recorded',
      ]);
    });

    it('requires custom challenge drug names for Other challenges', () => {
      expect(service.validateForm({
        ...baseForm(),
        proceedToChallenge: true,
        challengeDrug: 'Other',
        challengeDrugCustom: '',
        outcome: 'SUCCESS',
      }).errors).toContain('Custom challenge drug name is required');
    });

    it('requires reaction time and symptoms for unsuccessful challenges', () => {
      const result = service.validateForm({
        ...baseForm(),
        proceedToChallenge: true,
        challengeDrug: 'Propofol',
        outcome: 'UNSUCCESS',
        reactionTime: '',
        symptoms: [],
      });

      expect(result.errors).toEqual([
        'Reaction time is required for unsuccessful challenges',
        'At least one symptom must be selected',
      ]);
    });
  });

  describe('isSkinTestPositive', () => {
    it('uses the 3mm SPT threshold', () => {
      expect(service.isSkinTestPositive(row({ sptWheal: '2' }))).toBe(false);
      expect(service.isSkinTestPositive(row({ sptWheal: '3' }))).toBe(true);
    });

    it('uses the 3mm IDT threshold', () => {
      expect(service.isSkinTestPositive(row({ idtResults: ['0', '2'] }))).toBe(false);
      expect(service.isSkinTestPositive(row({ idtResults: ['0', '3'] }))).toBe(true);
    });

    it('falls back to legacy IDT fields', () => {
      expect(service.isSkinTestPositive(row({ idt100: '2', idt10: '0', idtNeat: '0' }))).toBe(false);
      expect(service.isSkinTestPositive(row({ idt100: '0', idt10: '3', idtNeat: '0' }))).toBe(true);
    });
  });

  it('returns positive tests and statistics for a panel', () => {
    const panel = [
      row({ drugName: 'Rocuronium', sptWheal: '3' }),
      row({ drugName: 'Propofol', sptWheal: '0', idtResults: ['0'] }),
    ];

    expect(service.getPositiveTests(panel)).toEqual([panel[0]]);
    expect(service.calculateStatistics(panel)).toEqual({
      total: 2,
      positive: 1,
      negative: 1,
      positiveRate: '50.0',
    });
    expect(service.calculateStatistics([])).toEqual({
      total: 0,
      positive: 0,
      negative: 0,
      positiveRate: '0.0',
    });
  });
});
