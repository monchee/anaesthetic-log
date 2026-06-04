#!/usr/bin/env node
// Additive merge of CHANGELOG.md into src/shared/data/changelog.json (the file
// the UI reads). CHANGELOG.md is the source of truth for recent releases, but it
// does NOT hold the full history — changelog.json goes back further. So we only
// ADD versions that are missing from the JSON; existing entries are never touched.
//
// Run manually with `npm run changelog:sync`; also runs automatically via the
// `prebuild` npm hook before every `build`/`deploy`.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
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

function parseChangelogMd(md) {
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
        changes: [],
      };
      continue;
    }
    if (!current) continue;

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

function main() {
  const existing = JSON.parse(readFileSync(JSON_PATH, 'utf8'));
  const known = new Set(existing.map((e) => normalize(e.version)));

  const parsed = parseChangelogMd(readFileSync(MD_PATH, 'utf8'));

  let added = 0;
  for (const entry of parsed) {
    if (known.has(normalize(entry.version))) continue;
    // summary = lead of the first change (text before the first em/en dash),
    // a tidy teaser for the Quick Start "What's New" banner.
    const first = entry.changes[0] || '';
    const summary = first.split(/\s+[—–-]\s+/)[0].trim();
    existing.push({
      version: entry.version,
      codename: entry.codename,
      date: entry.date,
      summary,
      highlight: false, // the UI keys "Latest" off array position, not this flag
      changes: entry.changes,
    });
    known.add(normalize(entry.version));
    added++;
  }

  existing.sort(semverDesc);

  const out = escapeNonAscii(JSON.stringify(existing, null, 2)) + '\n';
  writeFileSync(JSON_PATH, out);

  console.log(
    added > 0
      ? `changelog.json: added ${added} version(s); ${existing.length} total.`
      : `changelog.json: up to date; ${existing.length} total.`,
  );
}

main();
