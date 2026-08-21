import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import expectedOrderFixture from '../expectedProtocolOrder.json';
import {
  FROZEN_PRE_SNAPSHOT_COUNT,
  MINIMUM_BASELINE_COUNT,
  FROZEN_PRE_SNAPSHOT_PREFIX_SHA256,
  FROZEN_PREFIX_CHECKPOINTS,
  canonicalizeTuple,
  canonicalizeTuples,
  computeTuplesHash,
  validateFixtureSchema,
  validateFrozenPrefix,
  verifyOrder,
} from '../../../../scripts/verify-order.mjs';

describe('verify-order frozen baseline constants & checkpoints', () => {
  it('defines frozen pre-snapshot count as 116', () => {
    expect(FROZEN_PRE_SNAPSHOT_COUNT).toBe(116);
  });

  it('defines minimum baseline count as 117 (frozen prefix + index 116 Flucloxacillin checkpoint)', () => {
    expect(MINIMUM_BASELINE_COUNT).toBe(117);
  });

  it('defines the canonical SHA-256 hash for the 116 frozen records', () => {
    expect(FROZEN_PRE_SNAPSHOT_PREFIX_SHA256).toBe(
      'e1441bb00c906da6bdd7138b2206f5e6a5735f54805bfa2d9cecd5d00c007096'
    );
  });

  it('defines expected boundary checkpoints for head, tail, and deliberate appended record', () => {
    expect(FROZEN_PREFIX_CHECKPOINTS.HEAD_0.index).toBe(0);
    expect(FROZEN_PREFIX_CHECKPOINTS.HEAD_0.tuple).toEqual({
      drugName: 'Cis-atracurium',
      testType: 'skin',
      protocolLabel: 'IV',
    });

    expect(FROZEN_PREFIX_CHECKPOINTS.TAIL_115.index).toBe(115);
    expect(FROZEN_PREFIX_CHECKPOINTS.TAIL_115.tuple).toEqual({
      drugName: 'Voltaren (Diclofenac)',
      testType: 'challenge',
      protocolLabel: 'Graded Challenge',
    });

    expect(FROZEN_PREFIX_CHECKPOINTS.APPENDED_116.index).toBe(116);
    expect(FROZEN_PREFIX_CHECKPOINTS.APPENDED_116.tuple).toEqual({
      drugName: 'Flucloxacillin',
      testType: 'skin',
      protocolLabel: 'IV',
    });
  });
});

describe('verify-order canonical serialization & hashing', () => {
  it('canonicalizes a single tuple cleanly', () => {
    const input = {
      drugName: 'Rocuronium',
      testType: 'skin',
      protocolLabel: 'IV',
      extraField: 'should be ignored',
    };
    expect(canonicalizeTuple(input)).toEqual({
      drugName: 'Rocuronium',
      testType: 'skin',
      protocolLabel: 'IV',
    });
  });

  it('canonicalizes an array of tuples deterministically', () => {
    const input = [
      { drugName: 'Cis-atracurium', testType: 'skin', protocolLabel: 'IV', extraneous: 1 },
      { drugName: 'Rocuronium', testType: 'skin', protocolLabel: 'IV', extra: false },
    ];
    const canonicalJson = canonicalizeTuples(input);
    expect(canonicalJson).toBe(
      JSON.stringify([
        { drugName: 'Cis-atracurium', testType: 'skin', protocolLabel: 'IV' },
        { drugName: 'Rocuronium', testType: 'skin', protocolLabel: 'IV' },
      ])
    );
  });

  it('computes exact canonical hash matching committed baseline for fixture prefix', () => {
    const prefix116 = expectedOrderFixture.order.slice(0, 116);
    const computedHash = computeTuplesHash(prefix116, 116);
    expect(computedHash).toBe(FROZEN_PRE_SNAPSHOT_PREFIX_SHA256);
  });

  it('produces different hashes if tuple fields differ or positions change', () => {
    const prefix116 = expectedOrderFixture.order.slice(0, 116);
    const modified = [...prefix116];
    // Swap index 0 and 1
    modified[0] = prefix116[1];
    modified[1] = prefix116[0];

    const modifiedHash = computeTuplesHash(modified, 116);
    expect(modifiedHash).not.toBe(FROZEN_PRE_SNAPSHOT_PREFIX_SHA256);
  });
});

describe('verify-order fixture schema validation', () => {
  it('accepts the committed expectedProtocolOrder fixture', () => {
    expect(() => validateFixtureSchema(expectedOrderFixture)).not.toThrow();
  });

  it('rejects non-object or null fixture', () => {
    expect(() => validateFixtureSchema(null)).toThrow(/Fixture must be a non-null JSON object/);
    expect(() => validateFixtureSchema([])).toThrow(/Fixture must be a non-null JSON object/);
    expect(() => validateFixtureSchema('string')).toThrow(/Fixture must be a non-null JSON object/);
  });

  it('rejects count mismatch or malformed count', () => {
    expect(() => validateFixtureSchema({ count: '117', order: [] })).toThrow(/non-negative integer/);
    expect(() => validateFixtureSchema({ count: -1, order: [] })).toThrow(/non-negative integer/);
    expect(() =>
      validateFixtureSchema({ count: 2, order: [{ drugName: 'A', testType: 'skin', protocolLabel: 'IV' }] })
    ).toThrow(/Fixture count mismatch/);
  });

  it('rejects malformed items in order array', () => {
    expect(() =>
      validateFixtureSchema({
        count: 1,
        order: [{ drugName: '', testType: 'skin', protocolLabel: 'IV' }],
      })
    ).toThrow(/Fixture entry at index 0 is malformed/);

    expect(() =>
      validateFixtureSchema({
        count: 1,
        order: [{ drugName: 'A', testType: 123, protocolLabel: 'IV' }],
      })
    ).toThrow(/Fixture entry at index 0 is malformed/);
  });
});

describe('verify-order independent frozen prefix guard', () => {
  it('validates the committed fixture prefix successfully', () => {
    const res = validateFrozenPrefix(expectedOrderFixture.order, 'expectedProtocolOrder.json fixture');
    expect(res.valid).toBe(true);
    expect(res.actualHash).toBe(FROZEN_PRE_SNAPSHOT_PREFIX_SHA256);
  });

  it('detects and rejects truncation below 116 records', () => {
    const truncated = expectedOrderFixture.order.slice(0, 100);
    const res = validateFrozenPrefix(truncated, 'truncated test list');
    expect(res.valid).toBe(false);
    expect(res.error).toContain('contains only 100 records');
    expect(res.error).toContain('fewer than the frozen pre-snapshot baseline of 116 records');
  });

  it('detects and rejects reordering within the 116 prefix with actionable message', () => {
    const tampered = expectedOrderFixture.order.slice(0, 116);
    // Swap first two records
    const temp = tampered[0];
    tampered[0] = tampered[1];
    tampered[1] = temp;

    const res = validateFrozenPrefix(tampered, 'tampered test list');
    expect(res.valid).toBe(false);
    expect(res.error).toContain('CRITICAL SAFETY FAILURE');
    expect(res.error).toContain('Head checkpoint (index 0) mismatch');
    expect(res.error).toContain(`Expected SHA-256: ${FROZEN_PRE_SNAPSHOT_PREFIX_SHA256}`);
  });

  it('detects and rejects modification at an arbitrary index in the prefix', () => {
    const tampered = expectedOrderFixture.order.slice(0, 116).map((t, idx) => {
      if (idx === 50) {
        return { ...t, drugName: 'Tampered Drug Name' };
      }
      return t;
    });

    const res = validateFrozenPrefix(tampered, 'tampered item list');
    expect(res.valid).toBe(false);
    expect(res.actualHash).not.toBe(FROZEN_PRE_SNAPSHOT_PREFIX_SHA256);
  });

  it('allows append-only records beyond index 115 without altering prefix hash', () => {
    const allRecords = expectedOrderFixture.order; // 117 records
    expect(allRecords).toHaveLength(117);

    const prefixCheck = validateFrozenPrefix(allRecords, 'full fixture');
    expect(prefixCheck.valid).toBe(true);
    expect(prefixCheck.actualHash).toBe(FROZEN_PRE_SNAPSHOT_PREFIX_SHA256);
  });
});

describe('verify-order full pipeline execution', () => {
  let testTempDir: string;

  beforeAll(() => {
    testTempDir = mkdtempSync(join(tmpdir(), 'dream-verify-order-test-'));
  });

  afterAll(() => {
    if (testTempDir) {
      rmSync(testTempDir, { recursive: true, force: true });
    }
  });

  it('passes complete verification on current repository masterlist and fixture', () => {
    const result = verifyOrder();
    expect(result.success).toBe(true);
    expect(result.fixtureCount).toBe(117);
    expect(result.actualCount).toBe(117);
    expect(result.frozenPrefixCount).toBe(116);
    expect(result.fixturePrefixValid).toBe(true);
    expect(result.masterlistPrefixValid).toBe(true);
    expect(result.mismatches).toEqual([]);
    expect(result.errors).toEqual([]);
  });

  it('fails pipeline verification with minimum baseline/index-116 error when fixture has only 116 records', () => {
    const fixture116 = {
      count: 116,
      order: expectedOrderFixture.order.slice(0, 116),
    };
    const fixturePath116 = join(testTempDir, 'fixture-116.json');
    writeFileSync(fixturePath116, JSON.stringify(fixture116, null, 2), 'utf8');

    const result = verifyOrder({ fixturePath: fixturePath116 });
    expect(result.success).toBe(false);
    expect(result.fixtureCount).toBe(116);
    expect(result.fixturePrefixValid).toBe(true);
    expect(result.errors).toContainEqual(
      expect.stringContaining('fewer than the required baseline count of 117 records (missing committed index 116 checkpoint)')
    );
  });

  it('fails pipeline verification with appended-record error when index 116 tuple is wrong', () => {
    const fixtureWrong116 = {
      count: 117,
      order: [
        ...expectedOrderFixture.order.slice(0, 116),
        { drugName: 'WrongDrug', testType: 'skin', protocolLabel: 'IV' },
      ],
    };
    const fixturePathWrong116 = join(testTempDir, 'fixture-wrong-116.json');
    writeFileSync(fixturePathWrong116, JSON.stringify(fixtureWrong116, null, 2), 'utf8');

    const result = verifyOrder({ fixturePath: fixturePathWrong116 });
    expect(result.success).toBe(false);
    expect(result.fixtureCount).toBe(117);
    expect(result.fixturePrefixValid).toBe(true);
    expect(result.errors).toContainEqual(
      expect.stringContaining('Fixture appended record at index 116 mismatch')
    );
    expect(result.mismatches).toContainEqual(
      expect.objectContaining({
        index: 116,
        expected: { drugName: 'WrongDrug', testType: 'skin', protocolLabel: 'IV' },
        actual: { drugName: 'Flucloxacillin', testType: 'skin', protocolLabel: 'IV' },
      })
    );
  });
});
