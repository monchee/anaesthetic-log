#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// 1. Read old drugMasterlist.ts from git HEAD
const oldFileContent = execSync(
  'GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_NOSYSTEM=1 git show HEAD:src/shared/data/drugMasterlist.ts',
  { encoding: 'utf8' }
);

function extractTuples(fileContent) {
  const tuples = [];
  const recordRegex = /\{\s*(?:id:\s*['"][^'"]*['"],\s*)?drugName:\s*['"]([^'"]+)['"][\s\S]*?testType:\s*['"]([^'"]+)['"][\s\S]*?protocolLabel:\s*['"]([^'"]*)['"]/g;
  let m;
  while ((m = recordRegex.exec(fileContent)) !== null) {
    tuples.push({
      drugName: m[1],
      testType: m[2],
      protocolLabel: m[3],
    });
  }
  return tuples;
}

const oldTuples = extractTuples(oldFileContent);

// 2. Read generated and dream-only files to reconstruct the merged DRUG_MASTERLIST order
const generatedContent = readFileSync(join(ROOT, 'src', 'shared', 'data', 'drugMasterlist.generated.ts'), 'utf8');
const dreamOnlyContent = readFileSync(join(ROOT, 'src', 'shared', 'data', 'dreamOnlyProtocols.ts'), 'utf8');

const generatedTuples = extractTuples(generatedContent);
const dreamOnlyTuples = extractTuples(dreamOnlyContent);

function findGenTuple(drugName, testType, label) {
  const match = generatedTuples.find(
    (t) => t.drugName === drugName && t.testType === testType && (!label || t.protocolLabel === label)
  );
  if (!match) throw new Error(`Missing generated tuple: ${drugName} (${testType})`);
  return match;
}

// Reconstruct merged array order exactly as drugMasterlist.ts does
const newTuples = [
  findGenTuple('Cis-atracurium', 'skin'),
  findGenTuple('Rocuronium', 'skin'),
  findGenTuple('Pancuronium', 'skin'),
  findGenTuple('Vecuronium', 'skin'),
  findGenTuple('Suxamethonium', 'skin'),
  ...dreamOnlyTuples.slice(0, 17),
  findGenTuple('Cefazolin', 'skin'),
  ...dreamOnlyTuples.slice(17, 100),
  findGenTuple('Cefazolin', 'challenge'),
  ...dreamOnlyTuples.slice(100),
];

console.log('================================================================================');
console.log('DRUG MASTERLIST POSITIONAL ORDER VERIFICATION');
console.log('================================================================================');
console.log(`OLD (git HEAD) record count: ${oldTuples.length}`);
console.log(`NEW (merged)    record count: ${newTuples.length}`);

let mismatches = 0;
const total = Math.max(oldTuples.length, newTuples.length);

for (let i = 0; i < total; i++) {
  const o = oldTuples[i];
  const n = newTuples[i];

  if (!o || !n || o.drugName !== n.drugName || o.testType !== n.testType || o.protocolLabel !== n.protocolLabel) {
    mismatches++;
    console.error(`MISMATCH at index ${i}:`);
    console.error(`  OLD: ${JSON.stringify(o)}`);
    console.error(`  NEW: ${JSON.stringify(n)}`);
  }
}

console.log('--------------------------------------------------------------------------------');
console.log(`Positional mismatches: ${mismatches} out of ${total} positions.`);
if (mismatches === 0) {
  console.log('STATUS: PASS (0 mismatches). Clinical saved plan positions are 100% preserved.');
  console.log('================================================================================\n');
  process.exit(0);
} else {
  console.error('STATUS: FAIL. Positional ordering was altered!');
  console.log('================================================================================\n');
  process.exit(1);
}
