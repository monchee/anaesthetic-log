import { describe, expect, it } from 'vitest';
import { parseRedcapCSV, decodeCsvBytes, normalizeHeader } from './csvUtils';

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

  it('lists detected columns in the error so mismatches are diagnosable', () => {
    const result = parseRedcapCSV(csv(['Record ID', 'First Name', 'Last Name'], [['REC-1', 'Alice', 'Smith']]));
    expect(result.success).toBe(false);
    expect(result.error).toContain('Detected columns begin with:');
    expect(result.error).toContain('"Record ID"');
  });
});

describe('parseRedcapCSV — encoding & header robustness', () => {
  const minimalHeaders = ['Record ID', 'First Name', 'Last Name', 'Date of Reaction:'];
  const minimalRow = ['REC-1', 'Alice', 'Smith', '2026-01-02'];

  it('tolerates non-breaking spaces and doubled whitespace in required headers', () => {
    // REDCap/Excel sometimes emit U+00A0 (NBSP) or doubled spaces inside labels.
    const headers = ['Record ID', 'First Name', 'Last  Name', 'Date of Reaction:'];
    const result = parseRedcapCSV(csv(headers, [minimalRow]));
    expect(result.success).toBe(true);
    expect(result.data[0]).toMatchObject({ id: 'REC-1', firstName: 'Alice', lastName: 'Smith' });
  });

  it('strips a leading BOM character from the CSV text', () => {
    const result = parseRedcapCSV('﻿' + csv(minimalHeaders, [minimalRow]));
    expect(result.success).toBe(true);
    expect(result.data[0].id).toBe('REC-1');
  });

  it('normalizeHeader removes BOM/zero-width, converts NBSP, and collapses spaces', () => {
    expect(normalizeHeader('﻿Date of Reaction:')).toBe('Date of Reaction:');
    expect(normalizeHeader('First​  Name ')).toBe('First Name');
  });

  it('decodeCsvBytes strips a UTF-8 BOM', () => {
    const body = Buffer.from('Record ID,First Name', 'utf8');
    const bytes = new Uint8Array(3 + body.length);
    bytes[0] = 0xEF; bytes[1] = 0xBB; bytes[2] = 0xBF;
    bytes.set(body, 3);
    expect(decodeCsvBytes(bytes.buffer)).toBe('Record ID,First Name');
  });

  it('decodeCsvBytes reads UTF-16LE files (what Excel "Save As" produces)', () => {
    const csvText = csv(minimalHeaders, [minimalRow]);
    const body = Buffer.from(csvText, 'utf16le');
    const bytes = new Uint8Array(2 + body.length);
    bytes[0] = 0xFF; bytes[1] = 0xFE; // UTF-16LE BOM
    bytes.set(body, 2);

    const decoded = decodeCsvBytes(bytes.buffer);
    const result = parseRedcapCSV(decoded);
    expect(result.success).toBe(true);
    expect(result.data[0]).toMatchObject({ id: 'REC-1', firstName: 'Alice', lastName: 'Smith' });
  });
});
