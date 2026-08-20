import { describe, expect, it } from 'vitest';
import {
  SUPPORTED_SCHEMA_VERSIONS,
  isSupportedSchemaVersion,
  computeDoseLevelDiff,
} from '../../../../scripts/sync-protocols.mjs';

describe('sync-protocols schema version validation', () => {
  it('supports schema versions 1.0 and 1.1', () => {
    expect(SUPPORTED_SCHEMA_VERSIONS).toContain('1.0');
    expect(SUPPORTED_SCHEMA_VERSIONS).toContain('1.1');
    expect(SUPPORTED_SCHEMA_VERSIONS).toEqual(['1.0', '1.1']);
  });

  it('accepts schema version 1.0 and 1.1 via isSupportedSchemaVersion', () => {
    expect(isSupportedSchemaVersion('1.0')).toBe(true);
    expect(isSupportedSchemaVersion('1.1')).toBe(true);
  });

  it('rejects unrecognised or malformed schema versions', () => {
    expect(isSupportedSchemaVersion('0.9')).toBe(false);
    expect(isSupportedSchemaVersion('1.2')).toBe(false);
    expect(isSupportedSchemaVersion('2.0')).toBe(false);
    expect(isSupportedSchemaVersion('')).toBe(false);
    expect(isSupportedSchemaVersion(undefined as unknown as string)).toBe(false);
  });
});

describe('sync-protocols dose level diff review gate', () => {
  it('detects no diff when drug protocols are identical', () => {
    const snapshot = {
      schema_version: '1.1',
      drugs: [
        {
          slug: 'test-drug',
          title: 'Test Drug',
          version: '1.0',
          last_reviewed: 'review-marker-before',
          protocols: [
            {
              id: 'iv',
              label: 'IV',
              test_type: 'skin',
              presentation: 'presentation-before',
              diluent: 'diluent-placeholder',
              under_review: false,
              needs_pharmacy_verification: false,
              spt: { dilution: 'dilution-before', concentration: 'concentration-before' },
              idt: [{ dilution: 'dilution-before', concentration: 'concentration-before' }],
              challenge: { interval: 'interval-placeholder', steps: [{ dose: 'dose-placeholder' }] },
            },
          ],
        },
      ],
    };

    const diffs = computeDoseLevelDiff(snapshot, snapshot);
    expect(diffs).toEqual([]);
  });

  it('detects modifications in drug protocols', () => {
    const oldSnapshot = {
      drugs: [
        {
          slug: 'test-drug',
          title: 'Test Drug',
          version: '1.0',
          last_reviewed: 'review-marker-before',
          protocols: [
            {
              id: 'iv',
              label: 'IV',
              test_type: 'skin',
              spt: { dilution: 'dilution-before', concentration: 'concentration-before' },
            },
          ],
        },
      ],
    };

    const newSnapshot = {
      drugs: [
        {
          slug: 'test-drug',
          title: 'Test Drug',
          version: '1.1',
          last_reviewed: 'review-marker-after',
          protocols: [
            {
              id: 'iv',
              label: 'IV',
              test_type: 'skin',
              spt: { dilution: 'dilution-after', concentration: 'concentration-after' },
            },
          ],
        },
      ],
    };

    const diffs = computeDoseLevelDiff(oldSnapshot, newSnapshot);
    expect(diffs).toHaveLength(1);
    expect(diffs[0].type).toBe('DRUG_MODIFIED');
  });
});
