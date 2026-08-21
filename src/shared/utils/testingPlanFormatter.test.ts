import { describe, expect, it } from 'vitest';
import { formatTestingPlanAsText } from './testingPlanFormatter';
import { createMockPatient } from '@/src/test/factories/patientFactory';
import { createMockTestingPlanData } from '@/src/test/factories/testingDataFactory';

describe('testingPlanFormatter', () => {
  const sampleDrugCategories: Record<string, string[]> = {
    'Neuromuscular Blocking Agents (NMBAs)': ['Rocuronium', 'Vecuronium', 'Suxamethonium'],
    'Induction Agents': ['Propofol', 'Thiopentone'],
    'Opioids': ['Fentanyl', 'Morphine'],
    'Proton Pump Inhibitors': ['Pantoprazole'],
    'Penicillins': ['Tazocin', 'Cephalexin'],
    'Hypnotics': ['Ketamine'],
    'Others': ['Levofloxacin'],
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
    expect(result).toContain('REDCap ID:  MRN-12345');
    expect(result).toContain('REDCap Record ID (secondary): REDCAP-999');
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

  it('formats exact clinical fields for Pantoprazole including diluent, preparation, and review note while omitting SCRATCH link', () => {
    const patient = createMockPatient();
    const planData = createMockTestingPlanData({
      selectedDrugs: ['Pantoprazole'],
      selectedProtocols: { Pantoprazole: 0 },
    });

    const result = formatTestingPlanAsText(patient, planData, sampleDrugCategories);

    expect(result).toContain('Proton Pump Inhibitors:');
    expect(result).toContain('- Pantoprazole (40 mg powder for injection)');
    expect(result).toContain('SPT: Neat (4 mg/mL) | Diluent: 0.9% sodium chloride (reconstitute with 10 mL NS)');
    expect(result).toContain('IDT: 1:1,000 (0.004 mg/mL) [0.1 mL of 0.04 mg/mL + 0.9 mL NS] → 1:100 (0.04 mg/mL) [0.1 mL of 0.4 mg/mL + 0.9 mL NS] → 1:10 (0.4 mg/mL) [0.1 mL neat + 0.9 mL NS]');
    expect(result).toContain('⚠ Under review: The Spreadsheet 2 spreadsheet labels the SPT concentration as "Neat (40 mg/mL)". This is a spreadsheet labelling error — the correct reconstituted concentration is 4 mg/mL (40 mg powder + 10 mL NS).');
    expect(result).not.toContain('scratch.yuson.au');
    expect(result).not.toContain('Source:');
  });

  it('formats exact clinical fields for Tazocin including diluent, preparation, and review note while omitting SCRATCH link', () => {
    const patient = createMockPatient();
    const planData = createMockTestingPlanData({
      selectedDrugs: ['Tazocin'],
      selectedProtocols: { Tazocin: 0 },
    });

    const result = formatTestingPlanAsText(patient, planData, sampleDrugCategories);

    expect(result).toContain('Penicillins:');
    expect(result).toContain('- Tazocin (4 g / 500 mg powder for injection)');
    expect(result).toContain('SPT: 1:10 — ⚠️ concentration under review (Medication List: 2 mg/mL; calculation: 20 mg/mL) | Diluent: 0.9% sodium chloride (reconstitute with 20 mL NS)');
    expect(result).toContain('IDT: 1:100 (2/0.2 mg/mL) [0.1 mL of 20/2 mg/mL + 0.9 mL NS]');
    expect(result).toContain('⚠ Under review: Concentration discrepancy: Medication List specifies SPT at 1:10 (2 mg/mL Piperacillin), whereas calculation of 1:10 of 200 mg/mL gives 20 mg/mL. Concentration under clinical review.');
    expect(result).not.toContain('scratch.yuson.au');
    expect(result).not.toContain('Source:');
  });

  it('formats pharmacy-verification warning and omits SCRATCH link for DREAM-only Cephalexin', () => {
    const patient = createMockPatient();
    const planData = createMockTestingPlanData({
      selectedDrugs: ['Cephalexin'],
      selectedProtocols: { Cephalexin: 0 },
    });

    const result = formatTestingPlanAsText(patient, planData, sampleDrugCategories);

    expect(result).toContain('Penicillins:');
    expect(result).toContain('- Cephalexin (2mg/mL)');
    expect(result).toContain('SPT: Neat (2mg/mL) | Diluent: 0.9% sodium chloride');
    expect(result).toContain('IDT: 1:100 (0.02mg/mL) → 1:10 (0.2mg/mL) → Neat (2mg/mL)');
    expect(result).toContain('⚠ Confirm preparation with pharmacy');
    expect(result).not.toContain('scratch.yuson.au');
    expect(result).not.toContain('Source:');
  });


  it('formats pharmacy warning for generated Levofloxacin and omits SCRATCH link', () => {
    const patient = createMockPatient();
    const planData = createMockTestingPlanData({
      selectedDrugs: ['Levofloxacin'],
      selectedProtocols: { Levofloxacin: 0 },
    });

    const result = formatTestingPlanAsText(patient, planData, sampleDrugCategories);

    expect(result).toContain('- Levofloxacin (500 mg tablets or IV formulation)');
    expect(result).toContain('Protocol: Tablet');
    expect(result).toContain('⚠ Confirm preparation with pharmacy');
    expect(result).not.toContain('scratch.yuson.au');
    expect(result).not.toContain('Source:');
  });

  it('formats multi-protocol DREAM-only Ketamine with explicit protocol label and no SCRATCH URL', () => {
    const patient = createMockPatient();
    const planData = createMockTestingPlanData({
      selectedDrugs: ['Ketamine'],
      selectedProtocols: { Ketamine: 0 },
    });

    const result = formatTestingPlanAsText(patient, planData, sampleDrugCategories);

    expect(result).toContain('Hypnotics:');
    expect(result).toContain('- Ketamine (100mg/mL)');
    expect(result).toContain('Protocol: 1:1,000 start');
    expect(result).toContain('SPT: Neat (100mg/mL) | Diluent: 0.9% sodium chloride');
    expect(result).toContain('IDT: 1:1,000 (0.1mg/mL) → 1:100 (1mg/mL) → 1:10 (10mg/mL)');
    expect(result).not.toContain('scratch.yuson.au');
  });

  it('formats alternative protocol selection for Ketamine with explicit protocol label', () => {
    const patient = createMockPatient();
    const planData = createMockTestingPlanData({
      selectedDrugs: ['Ketamine'],
      selectedProtocols: { Ketamine: 1 },
    });

    const result = formatTestingPlanAsText(patient, planData, sampleDrugCategories);

    expect(result).toContain('Hypnotics:');
    expect(result).toContain('- Ketamine (100mg/mL)');
    expect(result).toContain('Protocol: 1:100 start');
    expect(result).toContain('SPT: Neat (100mg/mL) | Diluent: 0.9% sodium chloride');
    expect(result).toContain('IDT: 1:1,000 (0.1mg/mL)');
    expect(result).not.toContain('scratch.yuson.au');
  });

  it('fails closed on invalid protocol index and does not render guessed doses', () => {
    const patient = createMockPatient();
    const planData = createMockTestingPlanData({
      selectedDrugs: ['Ketamine'],
      selectedProtocols: { Ketamine: 99 }, // Out of bounds
    });

    const result = formatTestingPlanAsText(patient, planData, sampleDrugCategories);

    expect(result).toContain('Hypnotics:');
    expect(result).toContain('- Ketamine');
    expect(result).toContain('⚠ Protocol selection requires review');
    // Ensure guessed dose steps are NOT rendered
    expect(result).not.toContain('1:1,000');
    expect(result).not.toContain('1:100');
    expect(result).not.toContain('Neat (50 mg/mL)');
  });

  it('omits urgent banner when urgent is false', () => {
    const patient = createMockPatient();
    const planData = createMockTestingPlanData({ urgent: false });
    const result = formatTestingPlanAsText(patient, planData, sampleDrugCategories);

    expect(result).not.toContain('*** URGENT');
  });

  it('omits REDCap Record ID (secondary) when it matches REDCap ID / MRN or is missing', () => {
    const patientSame = createMockPatient({ mrn: 'MRN-100', redcapId: 'MRN-100' });
    const planData = createMockTestingPlanData();
    const resultSame = formatTestingPlanAsText(patientSame, planData, sampleDrugCategories);
    expect(resultSame).not.toContain('REDCap Record ID (secondary):');

    const patientNone = createMockPatient({ mrn: 'MRN-200', redcapId: undefined });
    const resultNone = formatTestingPlanAsText(patientNone, planData, sampleDrugCategories);
    expect(resultNone).not.toContain('REDCap Record ID (secondary):');
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

  it('formats custom drugs and additional entries, including exact custom preparation strings', () => {
    const patient = createMockPatient();
    const planData = createMockTestingPlanData({
      selectedDrugs: ['CustomDrugA', 'CustomDrugB', 'CustomDrugWithPrep'],
      customDrugs: [
        {
          name: 'CustomDrugA',
          sptConcentration: '10mg/ml',
          idtSteps: [{ ratio: '1:100', concentration: '' }, { ratio: '1:10', concentration: '' }],
        },
        {
          name: 'CustomDrugB',
        },
        {
          name: 'CustomDrugWithPrep',
          sptConcentration: '5mg/mL',
          idtSteps: [{ ratio: '1:100', concentration: '0.05mg/mL', preparation: '0.1 mL stock + 0.9 mL saline' }],
        },
      ],
    });
    const result = formatTestingPlanAsText(patient, planData, sampleDrugCategories);

    expect(result).toContain('Additional:');
    expect(result).toContain('- CustomDrugA | SPT: 10mg/ml | IDT: 1:100, 1:10');
    expect(result).toContain('- CustomDrugB');
    expect(result).toContain('- CustomDrugWithPrep | SPT: 5mg/mL | IDT: 1:100 (0.05mg/mL) [0.1 mL stock + 0.9 mL saline]');
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
