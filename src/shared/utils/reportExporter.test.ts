import { describe, expect, it } from 'vitest';
import {
  calculateMinutesAfterInduction,
  formatClinicalReportAsText,
  formatPatientHandoutAsText,
  formatSymptomsList,
  formatTreatmentList,
  formatTryptaseSentence,
  generateLetterText,
  getOutcomeText,
} from './reportExporter';
import { createMockDrugTestRow, createMockLogFormData } from '@/src/test/factories/testingDataFactory';
import { createMockPatient } from '@/src/test/factories/patientFactory';

describe('formatTryptaseSentence', () => {
  it('uses the standard not-obtained sentence', () => {
    expect(formatTryptaseSentence({ obtained: false, significantElevation: false, values: [] }))
      .toBe('Serial serum tryptase samples were not obtained.');
  });

  it('uses the standard obtained and not-elevated sentence with values', () => {
    expect(formatTryptaseSentence({
      obtained: true,
      significantElevation: false,
      values: [{ time: '09:15', result: '4.2' }],
    })).toBe('Serial serum tryptase samples were obtained and were not elevated (T1 (09:15): 4.2).');
  });

  it('uses the standard significant-elevation sentence with values', () => {
    expect(formatTryptaseSentence({
      obtained: true,
      significantElevation: true,
      values: [{ time: '09:15', result: '4.2' }, { time: '10:15', result: '19.8' }],
    })).toBe('Serial serum tryptase samples revealed clinically significant dynamic tryptase elevation (T1 (09:15): 4.2, T2 (10:15): 19.8).');
  });
});

describe('PowerchartLetter helpers', () => {
  it('calculates minutes after induction and falls back for invalid times', () => {
    expect(calculateMinutesAfterInduction(createMockPatient())).toBe('10 minutes');
    expect(calculateMinutesAfterInduction(createMockPatient({
      history: { ...createMockPatient().history, reactionTime: '09:00' },
    }))).toBe('an unknown period');
  });

  it('formats symptom, treatment, and outcome text', () => {
    const patient = createMockPatient();

    expect(formatSymptomsList(patient)).toBe('urticaria and hypotension');
    expect(formatTreatmentList(patient)).toBe('adrenaline and iv fluids');
    expect(getOutcomeText(createMockPatient({
      history: { ...patient.history, procedureOutcome: 'Abandoned after reaction' },
    }))).toBe('abandoned');
    expect(getOutcomeText(createMockPatient({
      history: { ...patient.history, procedureOutcome: '' },
    }))).toBe('completed/abandoned');
  });
});

describe('formatClinicalReportAsText', () => {
  it('includes positives, negatives, challenge details, and cross-sensitization', () => {
    const text = formatClinicalReportAsText(createMockLogFormData({
      tryptase: { obtained: true, significantElevation: false, values: [{ time: '09:30', result: '5.0' }] },
      testPanel: [
        createMockDrugTestRow({ drugName: 'Rocuronium', sptWheal: '5', idtResults: [] }),
        createMockDrugTestRow({ drugName: 'Propofol', sptWheal: '0', idtResults: [] }),
      ],
      proceedToChallenge: true,
      challengeDrug: 'Cefazolin',
      outcome: 'SUCCESS',
    }));

    expect(text).toContain('Serial serum tryptase samples were obtained and were not elevated');
    expect(text).toContain('Rocuronium | 5mm');
    expect(text).toContain('Drug: Cefazolin');
    expect(text).toContain('Given the significant molecular similarity between Rocuronium and Vecuronium');
    expect(text).toContain('AVOID ROCURONIUM');
    expect(text).toContain('AVOID VECURONIUM');
  });

  it('uses the redact callback for patient identifiers', () => {
    const text = formatClinicalReportAsText(createMockLogFormData({
      firstName: 'Alice',
      lastName: 'Smith',
      mrn: 'MRN-999',
    }), () => '[redacted]');

    expect(text).toContain('Patient: [redacted]');
    expect(text).toContain('MRN: [redacted]');
    expect(text).not.toContain('Alice Smith');
    expect(text).not.toContain('MRN-999');
  });

  it('handles empty inputs without throwing', () => {
    const text = formatClinicalReportAsText(createMockLogFormData({
      controls: { histamineSpt: '', salineSpt: '', salineIdt: '' },
      testPanel: [],
      visitDate: '',
    }));

    expect(text).toContain('Visit Date: Unknown');
    expect(text).toContain('No evidence of IgE-mediated allergy to medications tested.');
  });
});

describe('formatPatientHandoutAsText', () => {
  it('uses the corrected clinic contact block and result sections', () => {
    const text = formatPatientHandoutAsText(createMockLogFormData({
      testPanel: [
        createMockDrugTestRow({ drugName: 'Rocuronium', sptWheal: '4', idtResults: [] }),
        createMockDrugTestRow({ drugName: 'Propofol', sptWheal: '0', idtResults: [] }),
      ],
    }));

    expect(text).toContain('DRUGS TO AVOID:');
    expect(text).toContain('- ROCURONIUM (AVOID)');
    expect(text).toContain('DRUGS TOLERATED:');
    expect(text).toContain('- Propofol (Safe)');
    expect(text).toContain('Phone: (02) 9515 7586');
    expect(text).not.toContain('(02) 9515 8814');
  });

  it('uses the redact callback for the patient name', () => {
    const text = formatPatientHandoutAsText(createMockLogFormData({
      firstName: 'Alice',
      lastName: 'Smith',
    }), () => '[redacted]');

    expect(text).toContain('Patient: [redacted]');
    expect(text).not.toContain('Alice Smith');
  });
});

describe('generateLetterText', () => {
  it('generates a full letter with positive, negative, challenge, and cross-sensitized recommendations', () => {
    const text = generateLetterText(createMockLogFormData({
      tryptase: { obtained: false, significantElevation: false, values: [] },
      testPanel: [
        createMockDrugTestRow({ drugName: 'Rocuronium', sptWheal: '5', idtResults: [] }),
        createMockDrugTestRow({ drugName: 'Propofol', sptWheal: '0', idtResults: [] }),
      ],
      proceedToChallenge: true,
      challengeDrug: 'Cefazolin',
      outcome: 'SUCCESS',
    }), createMockPatient());

    expect(text).toContain('John Doe presented to RPAH');
    expect(text).toContain('Serial serum tryptase samples were not obtained.');
    expect(text).toContain('ROCURONIUM: Positive');
    expect(text).toContain('Propofol: Negative');
    expect(text).toContain('Drug challenge with Cefazolin: tolerated.');
    expect(text).toContain('Given the significant molecular similarity between Rocuronium and Vecuronium');
    expect(text).toContain('AVOID VECURONIUM');
  });

  it('handles manual entry without patient narrative', () => {
    const text = generateLetterText(createMockLogFormData(), null);

    expect(text).toContain('John presented to the RPA ANZAAG Allergy Clinic');
    expect(text).not.toContain('presented to [hospital]');
  });

  it('redacts patient identifiers when requested', () => {
    const text = generateLetterText(createMockLogFormData({
      firstName: 'Alice',
      lastName: 'Smith',
    }), createMockPatient(), () => '[redacted]');

    expect(text).toContain('[redacted] presented to RPAH');
    expect(text).not.toContain('Alice Smith');
  });
});
