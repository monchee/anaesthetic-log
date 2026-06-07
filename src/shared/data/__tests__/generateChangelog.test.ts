import { describe, expect, it } from 'vitest';
import { deriveSummaryFromChanges, parseChangelogMd, syncChangelog } from '../../../../scripts/generate-changelog.mjs';

describe('generate-changelog summary metadata', () => {
  it('parses an explicit plain summary line for the Quick Start banner', () => {
    const entries = parseChangelogMd(`
## [1.2.3] — 2026-06-08 (Banner)

Summary: A short modal-safe release summary.

### Fixed
- **First detailed change** — this should stay in the full changelog.
`);

    expect(entries).toEqual([
      {
        version: 'v1.2.3',
        date: '8 June 2026',
        codename: 'Banner',
        summary: 'A short modal-safe release summary.',
        changes: ['First detailed change — this should stay in the full changelog.'],
      },
    ]);
  });

  it('parses a bold markdown summary line', () => {
    const [entry] = parseChangelogMd(`
## [1.2.4] — 2026-06-09

**Summary:** Another short summary.

### Added
- **Detailed item** — full release copy.
`);

    expect(entry.summary).toBe('Another short summary.');
  });

  it('falls back to the first change lead when no explicit summary exists', () => {
    const summary = deriveSummaryFromChanges([
      'Testing plan: protocol selection — clinicians can now choose protocol variants.',
    ]);

    expect(summary).toBe('Testing plan: protocol selection');
  });

  it('updates existing JSON summaries when markdown provides explicit metadata', () => {
    const existing = [
      {
        version: 'v1.2.3',
        codename: 'Old',
        date: '8 June 2026',
        summary: 'Old first-line fallback',
        highlight: false,
        changes: ['Old first-line fallback — detail.'],
      },
    ];
    const parsed = parseChangelogMd(`
## [1.2.3] — 2026-06-08 (Old)

Summary: New explicit modal summary.

### Fixed
- **Old first-line fallback** — detail.
`);

    const result = syncChangelog({ existing, parsed });

    expect(result.added).toBe(0);
    expect(result.updated).toBe(1);
    expect(result.entries[0].summary).toBe('New explicit modal summary.');
  });
});
