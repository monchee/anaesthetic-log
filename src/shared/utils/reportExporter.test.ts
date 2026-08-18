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

  it('keeps the exact not-obtained sentence when there was no referral data', () => {
    expect(formatTryptaseSentence({
      obtained: false,
      significantElevation: false,
      values: [],
      hadReferralData: false,
    })).toBe('Serial serum tryptase samples were not obtained.');
  });

  it('uses pending-confirmation wording when the referral contained tryptase data', () => {
    expect(formatTryptaseSentence({
      obtained: false,
      significantElevation: false,
      values: [],
      hadReferralData: true,
    })).toBe('Serial serum tryptase results are pending confirmation.');
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
  it('formats skin testing panel as separated readable records without pipe table header', () => {
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

    // Absense of old pipe table headers and rows
    expect(text).not.toContain('Drug | SPT | IDT Results | Notes');
    expect(text).not.toContain('Drug | SPT');
    expect(text).not.toContain('Rocuronium | 5mm');

    // Section header
    expect(text).toContain('Skin & Intradermal Testing:');

    // Drug blocks with isSkinTestPositive semantics
    expect(text).toContain('  Drug: Rocuronium\n  Result: Positive\n  SPT: 5mm\n  IDT: -');
    expect(text).toContain('  Drug: Propofol\n  Result: Negative\n  SPT: 0mm\n  IDT: -');

    // Other report sections preserved
    expect(text).toContain('Serial serum tryptase samples were obtained and were not elevated');
    expect(text).toContain('Drug: Cefazolin');
    expect(text).toContain('Given the significant molecular similarity between Rocuronium and Vecuronium');
    expect(text).toContain('AVOID ROCURONIUM');
    expect(text).toContain('AVOID VECURONIUM');
  });

  it('formats IDT values on indented lines and includes notes only when present', () => {
    const text = formatClinicalReportAsText(createMockLogFormData({
      testPanel: [
        createMockDrugTestRow({
          drugName: 'Cefazolin',
          sptWheal: '2',
          idtResults: ['0', '4'],
          notes: 'Delayed erythema at 20 min',
        }),
        createMockDrugTestRow({
          drugName: 'Other',
          customName: 'CustomDrug',
          sptWheal: '',
          idtResults: [],
        }),
      ],
    }));

    // First drug with IDT values and notes
    expect(text).toContain(
      '  Drug: Cefazolin\n' +
      '  Result: Positive\n' +
      '  SPT: 2mm\n' +
      '  IDT:\n' +
      '    IDT 1: 0mm\n' +
      '    IDT 2: 4mm\n' +
      '  Notes: Delayed erythema at 20 min'
    );

    // Second drug with custom name, missing SPT dash, no IDT, and no Notes line
    expect(text).toContain(
      '  Drug: CustomDrug\n' +
      '  Result: Negative\n' +
      '  SPT: -\n' +
      '  IDT: -'
    );
    expect(text).not.toContain('Notes: undefined');
  });

  it('handles legacy IDT fields on indented lines', () => {
    const text = formatClinicalReportAsText(createMockLogFormData({
      testPanel: [
        createMockDrugTestRow({
          drugName: 'Amoxicillin',
          sptWheal: '0',
          idtResults: [],
          idt100: '0',
          idt10: '3',
          idtNeat: '5',
        }),
      ],
    }));

    expect(text).toContain(
      '  Drug: Amoxicillin\n' +
      '  Result: Positive\n' +
      '  SPT: 0mm\n' +
      '  IDT:\n' +
      '    1:100: 0mm\n' +
      '    1:10: 3mm\n' +
      '    Neat: 5mm'
    );
  });

  it('uses the redact callback for patient identifiers', () => {
    const text = formatClinicalReportAsText(createMockLogFormData({
      firstName: 'Alice',
      lastName: 'Smith',
      mrn: 'MRN-999',
      dob: '1980-05-01',
    }), () => '[redacted]');

    expect(text).toContain('Patient: [redacted]');
    expect(text).toContain('MRN: [redacted]');
    expect(text).toContain('DOB: [redacted]');
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

  it('formats failed challenge details and nursing notes correctly', () => {
    const text = formatClinicalReportAsText(createMockLogFormData({
      proceedToChallenge: true,
      challengeDrug: 'Other',
      challengeDrugCustom: 'CustomAntibiotic',
      outcome: 'UNSUCCESS',
      reactionTime: '15',
      symptoms: ['Rash', 'Other'],
      symptomsOther: 'Bronchospasm',
      interventionType: 'Other',
      interventionOther: 'Adrenaline 0.5mg IM',
      nurseNotes: {
        preTesting: 'Vitals stable',
        duringTesting: 'Mild flushing noted',
        postTesting: 'Recovered fully post-adrenaline',
        signedBy: 'Jane Doe',
      },
    }));

    expect(text).toContain('Drug Challenge:');
    expect(text).toContain('  Drug: CustomAntibiotic');
    expect(text).toContain('  Outcome: POSITIVE (Reaction)');
    expect(text).toContain('  Reaction Time: 15 mins');
    expect(text).toContain('  Symptoms: Rash, Other (Bronchospasm)');
    expect(text).toContain('  Intervention: Other: Adrenaline 0.5mg IM');

    expect(text).toContain('Nursing Notes:');
    expect(text).toContain('  Pre-Testing:\n  Vitals stable');
    expect(text).toContain('  During Testing:\n  Mild flushing noted');
    expect(text).toContain('  Post-Testing / Discharge:\n  Recovered fully post-adrenaline');
    expect(text).toContain('  Signed: Jane Doe (RN)');
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
      dob: '1980-05-01',
    }), () => '[redacted]');

    expect(text).toContain('Patient: [redacted]');
    expect(text).toContain('DOB: [redacted]');
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

  it('never claims samples were not obtained when referral data awaits confirmation', () => {
    const text = generateLetterText(createMockLogFormData({
      tryptase: {
        obtained: false,
        significantElevation: false,
        values: [],
        source: 'entered',
        hadReferralData: true,
      },
    }), createMockPatient());

    expect(text).toContain('Serial serum tryptase results are pending confirmation.');
    expect(text).not.toContain('Serial serum tryptase samples were not obtained.');
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
