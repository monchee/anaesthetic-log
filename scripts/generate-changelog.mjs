#!/usr/bin/env node
// Additive merge of CHANGELOG.md into src/shared/data/changelog.json (the file
// the UI reads). CHANGELOG.md is the source of truth for recent releases, but it
// does NOT hold the full history — changelog.json goes back further. So we only
// ADD versions that are missing from the JSON. Existing entries are left alone
// except for explicit release metadata such as `Summary: ...`.
//
// Run manually with `npm run changelog:sync`; also runs automatically via the
// `prebuild` npm hook before every `build`/`deploy`.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const MD_PATH = join(ROOT, 'CHANGELOG.md');
const JSON_PATH = join(ROOT, 'src', 'shared', 'data', 'changelog.json');

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// "2026-06-04" -> "4 June 2026" (matches the existing human-readable style)
function humanDate(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  const [, y, mo, d] = m;
  return `${Number(d)} ${MONTHS[Number(mo) - 1]} ${y}`;
}

const normalize = (v) => v.replace(/^v/i, '');

// Header: "## [0.49.0] — 2026-05-06 (Pancuronium)"
const HEADER_RE = /^##\s*\[([^\]]+)\]\s*[—–-]\s*([0-9]{4}-[0-9]{2}-[0-9]{2})(?:\s*\(([^)]+)\))?/;

export function deriveSummaryFromChanges(changes) {
  const first = changes[0] || '';
  return first.split(/\s+[—–-]\s+/)[0].trim();
}

export function parseChangelogMd(md) {
  const lines = md.split(/\r?\n/);
  const entries = [];
  let current = null;

  for (const line of lines) {
    const header = HEADER_RE.exec(line);
    if (header) {
      if (current) entries.push(current);
      current = {
        version: `v${header[1].trim()}`,
        date: humanDate(header[2].trim()),
        codename: header[3] ? header[3].trim() : '',
        summary: '',
        changes: [],
      };
      continue;
    }
    if (!current) continue;

    const summary = /^(?:\*\*)?Summary:\s*(?:\*\*)?\s*(.*)$/.exec(line.trim());
    if (summary) {
      current.summary = summary[1].trim();
      continue;
    }

    const bullet = /^[-*]\s+(.*)$/.exec(line.trim());
    if (bullet) {
      const text = bullet[1].replace(/\*\*/g, '').trim();
      if (!text || /^version bump/i.test(text)) continue; // skip Chore noise
      current.changes.push(text);
    }
  }
  if (current) entries.push(current);
  return entries;
}

// Newest-first numeric semver compare
function semverDesc(a, b) {
  const pa = normalize(a.version).split('.').map(Number);
  const pb = normalize(b.version).split('.').map(Number);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const diff = (pb[i] || 0) - (pa[i] || 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

// Escape non-ASCII back to \uXXXX to match the existing file's serialization,
// so the diff shows only the newly added entries (not a reformat of all 55).
function escapeNonAscii(str) {
  return str.replace(/[\u0080-\uffff]/g, (c) =>
    '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'),
  );
}

export function syncChangelog({ existing, parsed }) {
  const known = new Set(existing.map((e) => normalize(e.version)));
  const byVersion = new Map(existing.map((entry) => [normalize(entry.version), entry]));

  let added = 0;
  let updated = 0;
  for (const entry of parsed) {
    const key = normalize(entry.version);
    if (known.has(key)) {
      const existingEntry = byVersion.get(key);
      if (entry.summary && existingEntry && existingEntry.summary !== entry.summary) {
        existingEntry.summary = entry.summary;
        updated++;
      }
      continue;
    }

    const summary = entry.summary || deriveSummaryFromChanges(entry.changes);
    existing.push({
      version: entry.version,
      codename: entry.codename,
      date: entry.date,
      summary,
      highlight: false, // the UI keys "Latest" off array position, not this flag
      changes: entry.changes,
    });
    known.add(key);
    added++;
  }

  existing.sort(semverDesc);
  return { entries: existing, added, updated };
}

export function main() {
  const existing = JSON.parse(readFileSync(JSON_PATH, 'utf8'));

  const parsed = parseChangelogMd(readFileSync(MD_PATH, 'utf8'));
  const { entries, added, updated } = syncChangelog({ existing, parsed });

  const out = escapeNonAscii(JSON.stringify(entries, null, 2)) + '\n';
  writeFileSync(JSON_PATH, out);

  const changes = [
    added > 0 ? `added ${added} version(s)` : '',
    updated > 0 ? `updated ${updated} summary field(s)` : '',
  ].filter(Boolean).join('; ');

  console.log(changes ? `changelog.json: ${changes}; ${entries.length} total.` : `changelog.json: up to date; ${entries.length} total.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
