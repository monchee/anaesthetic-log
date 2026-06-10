import { describe, expect, it } from 'vitest';
import { ZodError } from 'zod';
import { parseLogFormData, safeParseLogFormData } from './logFormSchema';

describe('logFormSchema', () => {
  it('coerces clinical form data through one parser', () => {
    expect(parseLogFormData({
      mrn: 123,
      firstName: 'Jane',
      lastName: 'Citizen',
      controls: { histamineSpt: 5, salineSpt: 0, salineIdt: null },
      testPanel: [{ drugName: 'Rocuronium', sptWheal: 3, idtResults: [0, 4, null] }],
      symptoms: ['Urticaria', 123],
      outcome: 'INVALID',
    })).toMatchObject({
      mrn: '123',
      controls: { histamineSpt: '5', salineSpt: '', salineIdt: '' },
      testPanel: [{ drugName: 'Rocuronium', sptWheal: '3', idtResults: ['0', '4', ''] }],
      symptoms: ['Urticaria', '123'],
      outcome: null,
    });
  });

  it('throws a typed ZodError for invalid root data', () => {
    expect(() => parseLogFormData(null)).toThrow(ZodError);
    expect(safeParseLogFormData(null)).toBeNull();
  });
});
