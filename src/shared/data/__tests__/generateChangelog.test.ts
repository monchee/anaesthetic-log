import { describe, expect, it } from 'vitest';
import { deriveSummaryFromChanges, extractLatestReleases, parseChangelogMd, syncChangelog } from '../../../../scripts/generate-changelog.mjs';

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

  it('extracts latest releases preserving skipBanner and min count', () => {
    const mockEntries = [
      { version: 'v1.2.5', codename: 'Patch', skipBanner: true },
      { version: 'v1.2.4', codename: 'Feature', skipBanner: false },
      { version: 'v1.2.3', codename: 'Older 1' },
      { version: 'v1.2.2', codename: 'Older 2' },
      { version: 'v1.2.1', codename: 'Older 3' },
      { version: 'v1.2.0', codename: 'Older 4' },
    ];

    const latest = extractLatestReleases(mockEntries, 5);

    expect(latest).toHaveLength(5);
    expect(latest[0]).toEqual({ version: 'v1.2.5', codename: 'Patch', skipBanner: true });
    expect(latest[1]).toEqual({ version: 'v1.2.4', codename: 'Feature' });
    expect(latest[4]).toEqual({ version: 'v1.2.1', codename: 'Older 3' });
  });

  it('extracts enough releases when non-skipBanner is beyond minCount', () => {
    const mockEntries = [
      { version: 'v1.2.3', codename: 'Patch 3', skipBanner: true },
      { version: 'v1.2.2', codename: 'Patch 2', skipBanner: true },
      { version: 'v1.2.1', codename: 'Feature', skipBanner: false },
    ];

    const latest = extractLatestReleases(mockEntries, 2);

    expect(latest).toHaveLength(3);
    expect(latest[2].version).toBe('v1.2.1');
  });
});
