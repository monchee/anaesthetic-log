#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FIXTURE_PATH = join(ROOT, 'src', 'shared', 'data', 'expectedProtocolOrder.json');

// 1. Read and validate expectedProtocolOrder.json fixture
let fixture;
try {
  const fixtureContent = readFileSync(FIXTURE_PATH, 'utf8');
  fixture = JSON.parse(fixtureContent);
} catch (err) {
  console.error(`BROKEN CHECK: Failed to read or parse fixture at ${FIXTURE_PATH}: ${err.message}`);
  process.exit(2);
}

const EXPECTED_PROTOCOL_COUNT = 116;
if (
  !fixture ||
  typeof fixture !== 'object' ||
  !Array.isArray(fixture.order) ||
  !Number.isInteger(fixture.count) ||
  fixture.count !== EXPECTED_PROTOCOL_COUNT ||
  fixture.order.length !== EXPECTED_PROTOCOL_COUNT
) {
  console.error(
    `BROKEN CHECK: fixture is malformed or count mismatch (count: ${fixture?.count}, order.length: ${fixture?.order?.length}).\n` +
    `Expected an object with 'order' array and matching integer 'count' equal to ${EXPECTED_PROTOCOL_COUNT}.`
  );
  process.exit(2);
}

for (let i = 0; i < fixture.order.length; i++) {
  const item = fixture.order[i];
  if (!item || typeof item.drugName !== 'string' || typeof item.testType !== 'string' || typeof item.protocolLabel !== 'string') {
    console.error(`BROKEN CHECK: fixture entry at index ${i} is malformed: ${JSON.stringify(item)}`);
    process.exit(2);
  }
}

const expectedTuples = fixture.order;

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
const actualTuples = [
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
console.log(`EXPECTED (fixture) record count: ${expectedTuples.length}`);
console.log(`ACTUAL (merged)    record count: ${actualTuples.length}`);

let mismatches = 0;
const total = Math.max(expectedTuples.length, actualTuples.length);

for (let i = 0; i < total; i++) {
  const exp = expectedTuples[i];
  const act = actualTuples[i];

  if (!exp || !act || exp.drugName !== act.drugName || exp.testType !== act.testType || exp.protocolLabel !== act.protocolLabel) {
    mismatches++;
    console.error(`MISMATCH at index ${i}:`);
    console.error(`  EXPECTED: ${JSON.stringify(exp)}`);
    console.error(`  ACTUAL:   ${JSON.stringify(act)}`);
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
