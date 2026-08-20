import { describe, expect, it } from 'vitest';
import snapshot from './protocols.snapshot.json';
import {
  CROSS_REACTIVITY_ITEMS,
  CROSS_REACTIVITY_GOVERNANCE,
  parseCrossReactivitySnapshot,
} from './crossReactivity';

describe('crossReactivity data adapter', () => {
  it('exposes exactly six ordered items matching the pinned snapshot', () => {
    expect(CROSS_REACTIVITY_ITEMS).toHaveLength(6);
    expect(CROSS_REACTIVITY_ITEMS).toEqual(snapshot.cross_reactivity.items);
  });

  it('exposes the snapshot pending governance metadata accurately', () => {
    expect(CROSS_REACTIVITY_GOVERNANCE).toEqual({
      version: snapshot.cross_reactivity.version,
      last_reviewed: snapshot.cross_reactivity.last_reviewed,
      reviewed_by: snapshot.cross_reactivity.reviewed_by,
      under_review: snapshot.cross_reactivity.under_review,
      provenance: snapshot.cross_reactivity.provenance,
    });
    expect(CROSS_REACTIVITY_GOVERNANCE.under_review).toBe(true);
    expect(CROSS_REACTIVITY_GOVERNANCE.last_reviewed).toBe('');
    expect(CROSS_REACTIVITY_GOVERNANCE.reviewed_by).toBe('');
  });

  it('validates every item contains non-empty category, info, and alternatives', () => {
    for (const item of CROSS_REACTIVITY_ITEMS) {
      expect(typeof item.category).toBe('string');
      expect(item.category.trim().length).toBeGreaterThan(0);
      expect(typeof item.info).toBe('string');
      expect(item.info.trim().length).toBeGreaterThan(0);
      expect(typeof item.alternatives).toBe('string');
      expect(item.alternatives.trim().length).toBeGreaterThan(0);
    }
  });

  it('preserves the exact order of categories from snapshot', () => {
    const categories = CROSS_REACTIVITY_ITEMS.map((item) => item.category);
    const expectedCategories = snapshot.cross_reactivity.items.map((item) => item.category);
    expect(categories).toEqual(expectedCategories);
  });
});

describe('parseCrossReactivitySnapshot invariant error handling', () => {
  const createValidSnapshot = () => ({
    schema_version: '1.1',
    cross_reactivity: {
      version: '1.0',
      last_reviewed: '',
      reviewed_by: '',
      under_review: true,
      provenance: 'Test provenance',
      items: [
        {
          category: 'Test category',
          info: 'Test information',
          alternatives: 'Test alternative',
        },
      ],
    },
  });

  describe('snapshot and schema_version validation', () => {
    it('throws if snapshot is null or not an object', () => {
      expect(() => parseCrossReactivitySnapshot(null as any)).toThrow(
        /expected a non-null snapshot object/i
      );
      expect(() => parseCrossReactivitySnapshot(undefined as any)).toThrow(
        /expected a non-null snapshot object/i
      );
      expect(() => parseCrossReactivitySnapshot('string' as any)).toThrow(
        /expected a non-null snapshot object/i
      );
    });

    it('throws if schema_version is missing, not a string, or not exactly "1.1"', () => {
      const snapMissing = createValidSnapshot();
      delete (snapMissing as any).schema_version;
      expect(() => parseCrossReactivitySnapshot(snapMissing)).toThrow(
        /schema_version/i
      );

      const snapWrongType = { ...createValidSnapshot(), schema_version: 1.1 as any };
      expect(() => parseCrossReactivitySnapshot(snapWrongType)).toThrow(
        /schema_version/i
      );

      const snapWrongVersion = { ...createValidSnapshot(), schema_version: '1.0' };
      expect(() => parseCrossReactivitySnapshot(snapWrongVersion)).toThrow(
        /schema_version/i
      );

      const snapEmptyVersion = { ...createValidSnapshot(), schema_version: '' };
      expect(() => parseCrossReactivitySnapshot(snapEmptyVersion)).toThrow(
        /schema_version/i
      );
    });

    it('throws if cross_reactivity is missing or not an object', () => {
      expect(() =>
        parseCrossReactivitySnapshot({ schema_version: '1.1' } as any)
      ).toThrow(/missing or invalid cross_reactivity/i);
      expect(() =>
        parseCrossReactivitySnapshot({
          schema_version: '1.1',
          cross_reactivity: null,
        } as any)
      ).toThrow(/missing or invalid cross_reactivity/i);
      expect(() =>
        parseCrossReactivitySnapshot({
          schema_version: '1.1',
          cross_reactivity: 'invalid',
        } as any)
      ).toThrow(/missing or invalid cross_reactivity/i);
    });
  });

  describe('governance fields validation', () => {
    it('throws if under_review is not a boolean', () => {
      const snap = createValidSnapshot();
      (snap.cross_reactivity as any).under_review = 'true';
      expect(() => parseCrossReactivitySnapshot(snap)).toThrow(
        /under_review.*boolean/i
      );

      (snap.cross_reactivity as any).under_review = null;
      expect(() => parseCrossReactivitySnapshot(snap)).toThrow(
        /under_review.*boolean/i
      );
    });

    it('throws if version is missing, not a string, or empty/whitespace', () => {
      const snapMissing = createValidSnapshot();
      delete (snapMissing.cross_reactivity as any).version;
      expect(() => parseCrossReactivitySnapshot(snapMissing)).toThrow(
        /version.*string/i
      );

      const snapNonString = createValidSnapshot();
      (snapNonString.cross_reactivity as any).version = 1.0;
      expect(() => parseCrossReactivitySnapshot(snapNonString)).toThrow(
        /version.*string/i
      );

      const snapEmpty = createValidSnapshot();
      snapEmpty.cross_reactivity.version = '';
      expect(() => parseCrossReactivitySnapshot(snapEmpty)).toThrow(
        /version.*non-empty/i
      );

      const snapWhitespace = createValidSnapshot();
      snapWhitespace.cross_reactivity.version = '   ';
      expect(() => parseCrossReactivitySnapshot(snapWhitespace)).toThrow(
        /version.*non-empty/i
      );
    });

    it('throws if provenance is missing, not a string, or empty/whitespace', () => {
      const snapMissing = createValidSnapshot();
      delete (snapMissing.cross_reactivity as any).provenance;
      expect(() => parseCrossReactivitySnapshot(snapMissing)).toThrow(
        /provenance.*string/i
      );

      const snapNonString = createValidSnapshot();
      (snapNonString.cross_reactivity as any).provenance = 123;
      expect(() => parseCrossReactivitySnapshot(snapNonString)).toThrow(
        /provenance.*string/i
      );

      const snapEmpty = createValidSnapshot();
      snapEmpty.cross_reactivity.provenance = '';
      expect(() => parseCrossReactivitySnapshot(snapEmpty)).toThrow(
        /provenance.*non-empty/i
      );

      const snapWhitespace = createValidSnapshot();
      snapWhitespace.cross_reactivity.provenance = '  \t  ';
      expect(() => parseCrossReactivitySnapshot(snapWhitespace)).toThrow(
        /provenance.*non-empty/i
      );
    });

    it('throws if last_reviewed or reviewed_by are not strings', () => {
      const snapLastReviewedType = createValidSnapshot();
      (snapLastReviewedType.cross_reactivity as any).last_reviewed = null;
      expect(() => parseCrossReactivitySnapshot(snapLastReviewedType)).toThrow(
        /last_reviewed.*string/i
      );

      const snapReviewedByType = createValidSnapshot();
      (snapReviewedByType.cross_reactivity as any).reviewed_by = 42;
      expect(() => parseCrossReactivitySnapshot(snapReviewedByType)).toThrow(
        /reviewed_by.*string/i
      );
    });

    it('allows last_reviewed and reviewed_by to be empty when under_review is true', () => {
      const snap = createValidSnapshot();
      snap.cross_reactivity.under_review = true;
      snap.cross_reactivity.last_reviewed = '';
      snap.cross_reactivity.reviewed_by = '';
      const result = parseCrossReactivitySnapshot(snap);
      expect(result.governance.under_review).toBe(true);
      expect(result.governance.last_reviewed).toBe('');
      expect(result.governance.reviewed_by).toBe('');
    });

    it('requires last_reviewed and reviewed_by to be non-empty when under_review is false', () => {
      const snap = createValidSnapshot();
      snap.cross_reactivity.under_review = false;
      snap.cross_reactivity.last_reviewed = '';
      snap.cross_reactivity.reviewed_by = 'Test reviewer';
      expect(() => parseCrossReactivitySnapshot(snap)).toThrow(
        /last_reviewed.*non-empty/i
      );

      snap.cross_reactivity.last_reviewed = '   ';
      expect(() => parseCrossReactivitySnapshot(snap)).toThrow(
        /last_reviewed.*non-empty/i
      );

      snap.cross_reactivity.last_reviewed = 'review-marker';
      snap.cross_reactivity.reviewed_by = '';
      expect(() => parseCrossReactivitySnapshot(snap)).toThrow(
        /reviewed_by.*non-empty/i
      );

      snap.cross_reactivity.reviewed_by = '   ';
      expect(() => parseCrossReactivitySnapshot(snap)).toThrow(
        /reviewed_by.*non-empty/i
      );

      snap.cross_reactivity.reviewed_by = 'Test reviewer';
      const result = parseCrossReactivitySnapshot(snap);
      expect(result.governance.under_review).toBe(false);
      expect(result.governance.last_reviewed).toBe('review-marker');
      expect(result.governance.reviewed_by).toBe('Test reviewer');
    });

    it('preserves exact strings without mutating or trimming returned governance values', () => {
      const snap = createValidSnapshot();
      snap.cross_reactivity.version = ' 1.0 ';
      snap.cross_reactivity.provenance = ' Provenance string with whitespace ';
      snap.cross_reactivity.under_review = false;
      snap.cross_reactivity.last_reviewed = ' review-marker ';
      snap.cross_reactivity.reviewed_by = ' Test reviewer ';
      const result = parseCrossReactivitySnapshot(snap);
      expect(result.governance.version).toBe(' 1.0 ');
      expect(result.governance.provenance).toBe(' Provenance string with whitespace ');
      expect(result.governance.last_reviewed).toBe(' review-marker ');
      expect(result.governance.reviewed_by).toBe(' Test reviewer ');
    });
  });

  describe('items validation', () => {
    it('throws if cross_reactivity.items is missing or not an array', () => {
      const snap = createValidSnapshot();
      (snap.cross_reactivity as any).items = 'not an array';
      expect(() => parseCrossReactivitySnapshot(snap)).toThrow(
        /items.*array/i
      );
    });

    it('throws if cross_reactivity.items is empty', () => {
      const snap = createValidSnapshot();
      snap.cross_reactivity.items = [];
      expect(() => parseCrossReactivitySnapshot(snap)).toThrow(
        /items.*empty/i
      );
    });

    it('throws if an item is null or not an object', () => {
      const snap = createValidSnapshot();
      (snap.cross_reactivity as any).items = [null];
      expect(() => parseCrossReactivitySnapshot(snap)).toThrow(
        /expected an object/i
      );
    });

    it('throws if an item is missing required fields or has empty fields', () => {
      const snapMissing = createValidSnapshot();
      snapMissing.cross_reactivity.items = [{ category: 'Test category', info: '' } as any];
      expect(() => parseCrossReactivitySnapshot(snapMissing)).toThrow(
        /malformed item/i
      );

      const snapEmptyCat = createValidSnapshot();
      snapEmptyCat.cross_reactivity.items = [
        { category: '   ', info: 'Test information', alternatives: 'Test alternative' },
      ];
      expect(() => parseCrossReactivitySnapshot(snapEmptyCat)).toThrow(
        /malformed item/i
      );

      const snapEmptyAlt = createValidSnapshot();
      snapEmptyAlt.cross_reactivity.items = [
        { category: 'Test category', info: 'Test information', alternatives: '   ' },
      ];
      expect(() => parseCrossReactivitySnapshot(snapEmptyAlt)).toThrow(
        /malformed item/i
      );
    });
  });
});
