import { describe, expect, it } from 'vitest';
import { formatTestingPlanAsText } from './testingPlanFormatter';
import { createMockPatient } from '@/src/test/factories/patientFactory';
import { createMockTestingPlanData } from '@/src/test/factories/testingDataFactory';

describe('testingPlanFormatter', () => {
  const sampleDrugCategories: Record<string, string[]> = {
    'Neuromuscular Blocking Agents (NMBAs)': ['Rocuronium', 'Vecuronium', 'Suxamethonium'],
    'Induction Agents': ['Propofol', 'Thiopentone'],
    'Opioids': ['Fentanyl', 'Morphine'],
  };

  it('formats a complete standard testing plan with protocol details', () => {
    const patient = createMockPatient({
      firstName: 'Wei',
      lastName: 'Chen',
      mrn: 'MRN-12345',
      redcapId: 'REDCAP-999',
      dob: '1985-06-15',
      gender: 'Female',
    });

    const planData = createMockTestingPlanData({
      selectedDrugs: ['Rocuronium', 'Propofol'],
      urgent: true,
      reactionDate: '2024-02-10',
      documentsToChase: {
        tryptases: true,
        anaestheticChart: true,
        other: true,
        otherText: 'Hospital discharge summary',
      },
      notes: 'Previous severe anaphylaxis during elective laparoscopic cholecystectomy.',
    });

    const result = formatTestingPlanAsText(patient, planData, sampleDrugCategories);

    // Headers
    expect(result).toContain('ANAESTHETIC ALLERGY TESTING REQUEST');
    expect(result).toContain('Department of Clinical Immunology & Allergy');
    expect(result).toContain('Royal Prince Alfred Hospital');
    expect(result).toContain('*** URGENT — PRIORITY TESTING REQUIRED ***');

    // Patient Details
    expect(result).toContain('Name:       Wei Chen');
    expect(result).toContain('MRN:        MRN-12345');
    expect(result).toContain('REDCap ID:  REDCAP-999');
    expect(result).toContain('DOB:        15/06/1985');
    expect(result).toContain('Gender:     Female');
    expect(result).toContain('Date of Reaction: 10/02/2024');

    // Documents to Chase
    expect(result).toContain('DOCUMENTS TO CHASE');
    expect(result).toContain('- Tryptases');
    expect(result).toContain('- Anaesthetic Chart');
    expect(result).toContain('- Other: Hospital discharge summary');

    // Testing panel
    expect(result).toContain('REQUESTED TESTING PANEL');
    expect(result).toContain('Neuromuscular Blocking Agents (NMBAs):');
    expect(result).toContain('Rocuronium');
    expect(result).toContain('Induction Agents:');
    expect(result).toContain('Propofol');

    // Clinical Notes
    expect(result).toContain('CLINICAL NOTES');
    expect(result).toContain('Previous severe anaphylaxis during elective laparoscopic cholecystectomy.');
    expect(result).toContain('Request Date:');
  });

  it('omits urgent banner when urgent is false', () => {
    const patient = createMockPatient();
    const planData = createMockTestingPlanData({ urgent: false });
    const result = formatTestingPlanAsText(patient, planData, sampleDrugCategories);

    expect(result).not.toContain('*** URGENT');
  });

  it('omits REDCap ID when it matches MRN or is missing', () => {
    const patientSame = createMockPatient({ mrn: 'MRN-100', redcapId: 'MRN-100' });
    const planData = createMockTestingPlanData();
    const resultSame = formatTestingPlanAsText(patientSame, planData, sampleDrugCategories);
    expect(resultSame).not.toContain('REDCap ID:');

    const patientNone = createMockPatient({ mrn: 'MRN-200', redcapId: undefined });
    const resultNone = formatTestingPlanAsText(patientNone, planData, sampleDrugCategories);
    expect(resultNone).not.toContain('REDCap ID:');
  });

  it('handles missing DOB and gender gracefully', () => {
    const patient = createMockPatient({ dob: '', gender: undefined });
    const planData = createMockTestingPlanData();
    const result = formatTestingPlanAsText(patient, planData, sampleDrugCategories);

    expect(result).toContain('DOB:        Unknown');
    expect(result).toContain('Gender:     Unknown');
  });

  it('omits reaction date when empty', () => {
    const patient = createMockPatient();
    const planData = createMockTestingPlanData({ reactionDate: '' });
    const result = formatTestingPlanAsText(patient, planData, sampleDrugCategories);

    expect(result).not.toContain('Date of Reaction:');
  });

  it('formats documents to chase when only other without text is selected', () => {
    const patient = createMockPatient();
    const planData = createMockTestingPlanData({
      documentsToChase: {
        tryptases: false,
        anaestheticChart: false,
        other: true,
        otherText: '',
      },
    });
    const result = formatTestingPlanAsText(patient, planData, sampleDrugCategories);

    expect(result).toContain('DOCUMENTS TO CHASE');
    expect(result).toContain('- Other');
  });

  it('omits DOCUMENTS TO CHASE section when no documents are needed', () => {
    const patient = createMockPatient();
    const planData = createMockTestingPlanData({
      documentsToChase: {
        tryptases: false,
        anaestheticChart: false,
        other: false,
        otherText: '',
      },
    });
    const result = formatTestingPlanAsText(patient, planData, sampleDrugCategories);

    expect(result).not.toContain('DOCUMENTS TO CHASE');
  });

  it('formats custom drugs and additional entries', () => {
    const patient = createMockPatient();
    const planData = createMockTestingPlanData({
      selectedDrugs: ['CustomDrugA', 'CustomDrugB'],
      customDrugs: [
        {
          name: 'CustomDrugA',
          sptConcentration: '10mg/ml',
          idtSteps: [{ ratio: '1:100', concentration: '' }, { ratio: '1:10', concentration: '' }],
        },
        {
          name: 'CustomDrugB',
        },
      ],
    });
    const result = formatTestingPlanAsText(patient, planData, sampleDrugCategories);

    expect(result).toContain('Additional:');
    expect(result).toContain('- CustomDrugA | SPT: 10mg/ml | IDT: 1:100, 1:10');
    expect(result).toContain('- CustomDrugB');
  });

  it('displays "No drugs selected." when selectedDrugs is empty', () => {
    const patient = createMockPatient();
    const planData = createMockTestingPlanData({
      selectedDrugs: [],
      customDrugs: [],
    });
    const result = formatTestingPlanAsText(patient, planData, sampleDrugCategories);

    expect(result).toContain('No drugs selected.');
  });

  it('omits clinical notes section when notes is empty', () => {
    const patient = createMockPatient();
    const planData = createMockTestingPlanData({ notes: '' });
    const result = formatTestingPlanAsText(patient, planData, sampleDrugCategories);

    expect(result).not.toContain('CLINICAL NOTES');
  });
});
