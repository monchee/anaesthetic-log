import { describe, expect, it, vi } from 'vitest';
import {
  deidentifyPatients,
  deidentifyTestLogs,
  exportDeidentifiedJSON,
  exportDeidentifiedCSV,
  downloadFile,
} from './auditExporter';
import { createMockPatient, createMockPatientHistory } from '@/src/test/factories/patientFactory';
import { createMockLogFormData, createMockDrugTestRow } from '@/src/test/factories/testingDataFactory';

describe('auditExporter', () => {
  describe('deidentifyPatients', () => {
    it('strips all direct patient identifiers and generates sequential audit IDs', () => {
      const patients = [
        createMockPatient({
          id: 'PATIENT-001',
          firstName: 'John',
          lastName: 'Doe',
          mrn: 'MRN-999',
          dob: '1980-01-01',
          city: 'Sydney',
          history: createMockPatientHistory({
            date: '2024-01-15',
            grade: 'Grade 3',
            reactionSummary: 'Anaphylaxis post induction',
            symptoms: [{ label: 'Hypotension' }, { label: 'Bronchospasm' }],
            firstSymptom: 'Hypotension',
            predominantSymptom: 'Cardiovascular collapse',
            treatment: ['Adrenaline', 'IV Saline'],
            suspectedAgents: ['Rocuronium', 'Cefazolin'],
            tryptase: '14.5',
            procedure: 'Laparoscopy',
            hospital: 'RPAH',
            inductionTime: '09:00',
            reactionTime: '09:12',
            medications: ['Rocuronium @ 09:00', 'Propofol @ 08:55'],
            preInductionDrugs: ['Midazolam'],
            postInductionDrugs: ['Metaraminol'],
            procedureOutcome: 'Completed',
            anaesthesiaType: ['General'],
          }),
        }),
        createMockPatient({
          id: 'PATIENT-002',
          firstName: 'Jane',
          lastName: 'Smith',
          mrn: 'MRN-888',
          dob: '1992-05-20',
          history: createMockPatientHistory({
            grade: 'Grade 2',
            tryptases: [
              { result: '12.0', time: '+1h' },
              { result: '2.5', time: 'baseline' },
            ],
          }),
        }),
      ];

      const result = deidentifyPatients(patients);

      expect(result).toHaveLength(2);
      expect(result[0].auditId).toBe('AUDIT-0001');
      expect(result[1].auditId).toBe('AUDIT-0002');

      // PHI checks: ensure firstName, lastName, mrn, dob, city are absent from the return type/values
      const patient0 = result[0] as unknown as Record<string, unknown>;
      expect(patient0.firstName).toBeUndefined();
      expect(patient0.lastName).toBeUndefined();
      expect(patient0.mrn).toBeUndefined();
      expect(patient0.dob).toBeUndefined();
      expect(patient0.city).toBeUndefined();

      // Clinical field preservation
      expect(result[0].grade).toBe('Grade 3');
      expect(result[0].reactionDate).toBe('2024-01-15');
      expect(result[0].reactionSummary).toBe('Anaphylaxis post induction');
      expect(result[0].symptoms).toEqual(['Hypotension', 'Bronchospasm']);
      expect(result[0].firstSymptom).toBe('Hypotension');
      expect(result[0].predominantSymptom).toBe('Cardiovascular collapse');
      expect(result[0].treatment).toEqual(['Adrenaline', 'IV Saline']);
      expect(result[0].suspectedAgents).toEqual(['Rocuronium', 'Cefazolin']);
      expect(result[0].tryptase).toBe('14.5');
      expect(result[0].hospital).toBe('RPAH');

      // Structured tryptases array formatting
      expect(result[1].tryptase).toBe('T1 (+1h): 12.0; T2 (baseline): 2.5');
    });

    it('handles empty or missing history fields safely', () => {
      const patient = createMockPatient({
        history: {
          date: '',
          grade: '',
          reactionSummary: '',
          procedure: '',
          anaesthetist: '',
          hospital: '',
          symptoms: [],
          treatment: [],
          suspectedAgents: [],
          medications: [],
        },
      });

      const result = deidentifyPatients([patient]);
      expect(result[0].auditId).toBe('AUDIT-0001');
      expect(result[0].symptoms).toEqual([]);
      expect(result[0].tryptase).toBe('');
      expect(result[0].reactionDate).toBe('');
    });
  });

  describe('deidentifyTestLogs', () => {
    it('deidentifies test logs and maps drug test panel details', () => {
      const logs = [
        createMockLogFormData({
          mrn: 'MRN-001',
          firstName: 'Alice',
          lastName: 'Walker',
          visitDate: '2024-03-01',
          controls: {
            histamineSpt: '5',
            salineSpt: '0',
            salineIdt: '0',
          },
          testPanel: [
            createMockDrugTestRow({
              drugName: 'Rocuronium',
              sptWheal: '6',
              idtResults: ['4', '8'],
              notes: 'Strong positive on IDT',
            }),
            createMockDrugTestRow({
              drugName: 'Other',
              customName: 'CustomDrugX',
              sptWheal: '0',
              idtResults: [],
              idt100: '0',
              idt10: '0',
              idtNeat: '0',
              notes: 'Negative',
            }),
          ],
          proceedToChallenge: true,
          challengeDrug: 'Cefazolin',
          outcome: 'SUCCESS',
          reactionTime: '',
          symptoms: [],
          interventionType: '',
          plan: 'Proceed with safe alternatives.',
        }),
      ];

      const result = deidentifyTestLogs(logs);

      expect(result).toHaveLength(1);
      expect(result[0].auditId).toBe('AUDIT-0001');
      const log0 = result[0] as unknown as Record<string, unknown>;
      expect(log0.firstName).toBeUndefined();
      expect(log0.lastName).toBeUndefined();
      expect(log0.mrn).toBeUndefined();

      expect(result[0].visitDate).toBe('2024-03-01');
      expect(result[0].controls).toEqual({
        histamineSpt: '5',
        salineSpt: '0',
        salineIdt: '0',
      });
      expect(result[0].testPanel).toHaveLength(2);
      expect(result[0].testPanel[0]).toEqual({
        drugName: 'Rocuronium',
        sptWheal: '6',
        idtResults: '4 | 8',
        notes: 'Strong positive on IDT',
      });
      expect(result[0].testPanel[1].drugName).toBe('CustomDrugX');
      expect(result[0].proceedToChallenge).toBe(true);
      expect(result[0].challengeDrug).toBe('Cefazolin');
      expect(result[0].outcome).toBe('SUCCESS');
      expect(result[0].plan).toBe('Proceed with safe alternatives.');
    });

    it('handles empty test logs and default fields', () => {
      const logs = [createMockLogFormData({ testPanel: [] })];
      const result = deidentifyTestLogs(logs);

      expect(result[0].testPanel).toEqual([]);
      expect(result[0].outcome).toBeNull();
    });
  });

  describe('exportDeidentifiedJSON', () => {
    it('produces valid JSON containing patients and test logs summary', () => {
      const patients = [createMockPatient()];
      const logs = [createMockLogFormData()];

      const jsonStr = exportDeidentifiedJSON(patients, logs);
      const parsed = JSON.parse(jsonStr);

      expect(parsed).toHaveProperty('exportDate');
      expect(parsed.patientCount).toBe(1);
      expect(parsed.testLogCount).toBe(1);
      expect(parsed.patients).toHaveLength(1);
      expect(parsed.testLogs).toHaveLength(1);
      expect(parsed.patients[0].auditId).toBe('AUDIT-0001');
    });
  });

  describe('exportDeidentifiedCSV', () => {
    it('exports CSV headers and correctly escaped patient rows', () => {
      const patients = [
        createMockPatient({
          history: createMockPatientHistory({
            grade: 'Grade 3',
            reactionSummary: 'Reaction with "quotes", commas, and newlines\nin details',
            symptoms: [{ label: 'Hypotension' }, { label: 'Urticaria' }],
            treatment: ['Adrenaline', 'IV Fluids'],
            suspectedAgents: ['Rocuronium'],
            procedure: 'Surgery, General',
          }),
        }),
      ];

      const csv = exportDeidentifiedCSV(patients);
      const lines = csv.split('\n');

      expect(lines[0]).toContain('Audit ID,Reaction Date,Grade,Reaction Summary');
      expect(csv).toContain('AUDIT-0001');
      expect(csv).toContain('Grade 3');
      // Quotes and commas escaped properly
      expect(csv).toContain('"Reaction with ""quotes"", commas, and newlines\nin details"');
      expect(csv).toContain('"Surgery, General"');
      expect(csv).toContain('Hypotension; Urticaria');
    });
  });

  describe('downloadFile', () => {
    it('creates a download link, triggers click, and cleans up', () => {
      const mockCreateObjectURL = vi.fn().mockReturnValue('blob:http://localhost/dummy');
      const mockRevokeObjectURL = vi.fn();
      globalThis.URL.createObjectURL = mockCreateObjectURL;
      globalThis.URL.revokeObjectURL = mockRevokeObjectURL;

      const clickSpy = vi.fn();
      const appendSpy = vi.spyOn(document.body, 'appendChild');
      const removeSpy = vi.spyOn(document.body, 'removeChild');

      const originalCreateElement = document.createElement.bind(document);
      vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        const el = originalCreateElement(tagName);
        if (tagName === 'a') {
          el.click = clickSpy;
        }
        return el;
      });

      downloadFile('{"test": true}', 'export.json', 'application/json');

      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(appendSpy).toHaveBeenCalled();
      expect(clickSpy).toHaveBeenCalled();
      expect(removeSpy).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:http://localhost/dummy');
    });
  });
});
