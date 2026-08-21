import { describe, expect, it } from 'vitest';
import { resolveSelectedProtocol } from './protocolResolver';
import type { DrugProtocol } from '@features/testing/types';

const mockProtocols: DrugProtocol[] = [
  {
    id: 'p1',
    drugName: 'Ketamine',
    category: 'Hypnotics',
    testType: 'skin',
    presentation: '100 mg/2 mL',
    sptNeatConcentration: 'Neat (50 mg/mL)',
    diluent: '0.9% sodium chloride',
    idtSteps: [{ ratio: '1:1,000', concentration: '0.05 mg/mL' }],
    challengeSteps: [],
    protocolLabel: '1:1,000 start',
  },
  {
    id: 'p2',
    drugName: 'Ketamine',
    category: 'Hypnotics',
    testType: 'skin',
    presentation: '100 mg/2 mL',
    sptNeatConcentration: 'Neat (50 mg/mL)',
    diluent: '0.9% sodium chloride',
    idtSteps: [{ ratio: '1:100', concentration: '0.5 mg/mL' }],
    challengeSteps: [],
    protocolLabel: '1:100 start',
  },
];

describe('resolveSelectedProtocol', () => {
  it('resolves undefined index to the first protocol (index 0 / established default)', () => {
    const result = resolveSelectedProtocol(mockProtocols, undefined);
    expect(result.status).toBe('valid');
    if (result.status === 'valid') {
      expect(result.index).toBe(0);
      expect(result.protocol).toBe(mockProtocols[0]);
      expect(result.isDefault).toBe(true);
    }
  });

  it('resolves explicit valid index 0 to the first protocol', () => {
    const result = resolveSelectedProtocol(mockProtocols, 0);
    expect(result.status).toBe('valid');
    if (result.status === 'valid') {
      expect(result.index).toBe(0);
      expect(result.protocol).toBe(mockProtocols[0]);
      expect(result.isDefault).toBe(true);
    }
  });

  it('resolves explicit valid index 1 to the second protocol', () => {
    const result = resolveSelectedProtocol(mockProtocols, 1);
    expect(result.status).toBe('valid');
    if (result.status === 'valid') {
      expect(result.index).toBe(1);
      expect(result.protocol).toBe(mockProtocols[1]);
      expect(result.isDefault).toBe(false);
    }
  });

  it('fails closed when selected index is out of bounds (>= length)', () => {
    const result = resolveSelectedProtocol(mockProtocols, 2);
    expect(result.status).toBe('invalid');
    if (result.status === 'invalid') {
      expect(result.protocol).toBeUndefined();
      expect(result.reason).toContain('out of bounds');
    }
  });

  it('fails closed on large out-of-bounds index without silently clamping', () => {
    const result = resolveSelectedProtocol(mockProtocols, 99);
    expect(result.status).toBe('invalid');
    if (result.status === 'invalid') {
      expect(result.protocol).toBeUndefined();
    }
  });

  it('fails closed when selected index is negative', () => {
    const result = resolveSelectedProtocol(mockProtocols, -1);
    expect(result.status).toBe('invalid');
    if (result.status === 'invalid') {
      expect(result.protocol).toBeUndefined();
      expect(result.reason).toContain('out of bounds');
    }
  });

  it('fails closed on non-integer float index', () => {
    const result = resolveSelectedProtocol(mockProtocols, 1.5);
    expect(result.status).toBe('invalid');
    if (result.status === 'invalid') {
      expect(result.protocol).toBeUndefined();
      expect(result.reason).toContain('must be an integer');
    }
  });

  it('fails closed on string index', () => {
    const result = resolveSelectedProtocol(mockProtocols, '0' as unknown as number);
    expect(result.status).toBe('invalid');
  });

  it('fails closed on null, NaN, Infinity, and object values', () => {
    expect(resolveSelectedProtocol(mockProtocols, null).status).toBe('invalid');
    expect(resolveSelectedProtocol(mockProtocols, NaN).status).toBe('invalid');
    expect(resolveSelectedProtocol(mockProtocols, Infinity).status).toBe('invalid');
    expect(resolveSelectedProtocol(mockProtocols, {}).status).toBe('invalid');
    expect(resolveSelectedProtocol(mockProtocols, []).status).toBe('invalid');
  });

  it('returns empty status on empty or null protocol array', () => {
    expect(resolveSelectedProtocol([], 0).status).toBe('empty');
    expect(resolveSelectedProtocol(null, 0).status).toBe('empty');
    expect(resolveSelectedProtocol(undefined, 0).status).toBe('empty');
  });
});
