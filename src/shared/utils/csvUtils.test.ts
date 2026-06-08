import { describe, expect, it } from 'vitest';
import { parseRedcapCSV } from './csvUtils';

const baseHeaders = [
  'Record ID',
  'First Name',
  'Last Name',
  'Date of Reaction:',
  'Date of birth',
  'Gender',
  'City',
  'Hospital where reaction occurred:',
  'Procedure:',
  'Time of Induction:',
  'Time Reaction First Noted:',
  'Outcome?',
  'Administered Drug (choice=Rocuronium)',
  'Roc - Time',
  'Antibiotic (choice=Cefazolin)',
  'Cefazolin - Time',
  'Write a brief summary',
  'Comments',
  'Tachycardia (>100bpm before adrenaline)',
  'Adrenaline Given',
  'Serum Tryptase Time',
  'Serum Tryptase Result',
  'Muscle Relaxant (choice=Vecuronium)',
  'Documents to Chase: (choice=Tryptase)',
];

function csv(headers: string[], rows: string[][]): string {
  return [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n');
}

describe('parseRedcapCSV', () => {
  it('parses a valid labelled REDCap export into patients', () => {
    const result = parseRedcapCSV(csv(baseHeaders, [[
      'REC-1',
      'Alice',
      'Smith',
      '2026-01-02',
      '1980-03-04',
      'Female',
      'Sydney',
      'RPAH',
      'Appendectomy',
      '09:10:00',
      '0925',
      'Completed',
      'Checked',
      '09:12',
      'Unchecked',
      '',
      'Brief summary',
      'Reviewed by allergy team',
      'Checked',
      'Checked',
      '09:40',
      '18.5',
      'Checked',
      'Checked',
    ]]));

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toMatchObject({
      id: 'REC-1',
      firstName: 'Alice',
      lastName: 'Smith',
      mrn: 'REC-1',
      redcapId: 'REC-1',
      history: {
        date: '2026-01-02',
        hospital: 'RPAH',
        procedure: 'Appendectomy',
        inductionTime: '09:10',
        reactionTime: '09:25',
        medications: ['Rocuronium @ 09:12'],
        treatment: ['Adrenaline'],
        testingPlan: ['Vecuronium'],
        documentsToChase: { tryptases: true },
      },
    });
    expect(result.data[0].history.symptoms).toEqual([{ label: 'Tachycardia' }]);
    expect(result.data[0].history.tryptases).toEqual([{ time: '09:40', result: '18.5' }]);
  });

  it('returns a helpful error when required labelled columns are missing', () => {
    const result = parseRedcapCSV(csv(['Record ID', 'First Name', 'Last Name'], [['REC-1', 'Alice', 'Smith']]));

    expect(result.success).toBe(false);
    expect(result.error).toContain('Missing required columns: Date of Reaction:');
    expect(result.error).toContain('CSV / Microsoft Excel (labels)');
  });

  it('handles quoted fields with commas and escaped quotes', () => {
    const result = parseRedcapCSV(csv(baseHeaders, [[
      'REC-2',
      'Bob',
      'Jones',
      '2026-02-03',
      '',
      '',
      '',
      '"Royal, Prince Alfred"',
      '"Procedure with ""quoted"" note"',
      '',
      '',
      '',
      'Unchecked',
      '',
      'Checked',
      '1015',
      '"Summary, with comma"',
      '"He said ""stable"""',
      '',
      '',
      '',
      '',
      'Unchecked',
      'Unchecked',
    ]]));

    expect(result.success).toBe(true);
    expect(result.data[0].history.hospital).toBe('Royal, Prince Alfred');
    expect(result.data[0].history.procedure).toBe('Procedure with "quoted" note');
    expect(result.data[0].history.reactionSummary).toBe('Summary, with comma');
    expect(result.data[0].history.comments).toBe('He said "stable"');
    expect(result.data[0].history.medications).toEqual(['Cefazolin @ 10:15']);
  });

  it('parses choice columns and HH:MM / HHMM medication times', () => {
    const result = parseRedcapCSV(csv(baseHeaders, [[
      'REC-3',
      'Cara',
      'Ng',
      '2026-03-04',
      '',
      '',
      '',
      '',
      '',
      '0810',
      '08:25',
      '',
      'Checked',
      '0812',
      'Checked',
      '08:20:00',
      '',
      '',
      '',
      '',
      '',
      '',
      'Unchecked',
      'Unchecked',
    ]]));

    expect(result.success).toBe(true);
    expect(result.data[0].history.inductionTime).toBe('08:10');
    expect(result.data[0].history.reactionTime).toBe('08:25');
    expect(result.data[0].history.medications).toEqual(['Rocuronium @ 08:12', 'Cefazolin @ 08:20']);
  });

  it('handles empty and header-only files gracefully', () => {
    expect(parseRedcapCSV('').success).toBe(false);
    expect(parseRedcapCSV('').error).toBe('Empty or invalid CSV.');

    const headerOnly = parseRedcapCSV(baseHeaders.join(','));
    expect(headerOnly.success).toBe(false);
    expect(headerOnly.error).toBe('Empty or invalid CSV.');
  });
});
