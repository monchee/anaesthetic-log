#!/usr/bin/env node
/**
 * scripts/verify-order.mjs
 *
 * Positional order verifier with an independent cryptographic guard for the
 * frozen pre-snapshot DREAM protocol baseline.
 *
 * BACKGROUND & CLINICAL SAFETY:
 * DREAM stores clinical testing plans referencing protocols by their 0-based
 * array index (`protocolIndex`). Any unexpected positional shift silently
 * redirects historical saved plans to unintended drugs, test modalities, or
 * concentration steps.
 *
 * To ensure safe backwards compatibility:
 * 1. The original pre-snapshot DREAM protocol list (the first 116 records,
 *    indices 0..115) is permanently FROZEN.
 * 2. Any new protocols (e.g. index 116: Flucloxacillin skin/IV) must be
 *    appended strictly at the end (append-only semantics).
 * 3. This verifier maintains a committed canonical SHA-256 hash baseline for
 *    the first 116 records, preventing accidental reordering, deletion, or
 *    tampering in expectedProtocolOrder.json from going undetected.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { createHash } from 'node:crypto';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_FIXTURE_PATH = join(ROOT, 'src', 'shared', 'data', 'expectedProtocolOrder.json');

/**
 * The frozen count of protocols that existed in DREAM prior to the SCRATCH
 * snapshot cutover. Indices 0..115 are immutable to protect saved clinical plans.
 */
export const FROZEN_PRE_SNAPSHOT_COUNT = 116;

/**
 * The minimum required baseline count for DREAM protocols, including the
 * 116 frozen pre-snapshot records plus the committed appended Flucloxacillin
 * record at index 116. Future records may only be added as an appended suffix (>= 117).
 */
export const MINIMUM_BASELINE_COUNT = 117;


/**
 * Committed canonical SHA-256 hash of the 116 frozen pre-snapshot protocol tuples.
 *
 * Canonical representation:
 * JSON array of `{ drugName: string, testType: string, protocolLabel: string }`
 * for indices 0 through 115.
 */
export const FROZEN_PRE_SNAPSHOT_PREFIX_SHA256 =
  'e1441bb00c906da6bdd7138b2206f5e6a5735f54805bfa2d9cecd5d00c007096';

/**
 * Key boundary checkpoints in the masterlist to give immediate, actionable
 * diagnostics if order drifts.
 */
export const FROZEN_PREFIX_CHECKPOINTS = Object.freeze({
  HEAD_0: {
    index: 0,
    tuple: { drugName: 'Cis-atracurium', testType: 'skin', protocolLabel: 'IV' },
    description: 'First record in frozen pre-snapshot prefix',
  },
  TAIL_115: {
    index: 115,
    tuple: { drugName: 'Voltaren (Diclofenac)', testType: 'challenge', protocolLabel: 'Graded Challenge' },
    description: 'Last record in frozen pre-snapshot prefix (index 115)',
  },
  APPENDED_116: {
    index: 116,
    tuple: { drugName: 'Flucloxacillin', testType: 'skin', protocolLabel: 'IV' },
    description: 'First deliberate appended source record (index 116)',
  },
});

/**
 * Canonicalizes a protocol tuple to a clean object with deterministic keys.
 */
export function canonicalizeTuple(item) {
  if (!item || typeof item !== 'object') {
    throw new Error(`Invalid protocol tuple: ${JSON.stringify(item)}`);
  }
  return {
    drugName: String(item.drugName ?? ''),
    testType: String(item.testType ?? ''),
    protocolLabel: String(item.protocolLabel ?? ''),
  };
}

/**
 * Deterministic JSON stringification of a tuple array.
 */
export function canonicalizeTuples(tuples) {
  if (!Array.isArray(tuples)) {
    throw new TypeError('Expected an array of tuples to canonicalize');
  }
  return JSON.stringify(tuples.map(canonicalizeTuple));
}

/**
 * Computes the SHA-256 hex digest for an array of protocol tuples.
 * If `count` is specified, hashes only the first `count` items.
 */
export function computeTuplesHash(tuples, count = FROZEN_PRE_SNAPSHOT_COUNT) {
  if (!Array.isArray(tuples)) {
    throw new TypeError('Expected an array of tuples');
  }
  const slice = typeof count === 'number' ? tuples.slice(0, count) : tuples;
  const canonicalString = canonicalizeTuples(slice);
  return createHash('sha256').update(canonicalString, 'utf8').digest('hex');
}

/**
 * Validates the schema and structure of expectedProtocolOrder.json.
 */
export function validateFixtureSchema(fixture) {
  if (!fixture || typeof fixture !== 'object' || Array.isArray(fixture)) {
    throw new Error("Fixture must be a non-null JSON object containing 'count' and 'order'.");
  }

  if (!Number.isInteger(fixture.count) || fixture.count < 0) {
    throw new Error(`Fixture 'count' must be a non-negative integer (received: ${fixture.count}).`);
  }

  if (!Array.isArray(fixture.order)) {
    throw new Error("Fixture must include an 'order' array.");
  }

  if (fixture.count !== fixture.order.length) {
    throw new Error(
      `Fixture count mismatch: declared count is ${fixture.count} but order array length is ${fixture.order.length}.`
    );
  }

  for (let i = 0; i < fixture.order.length; i++) {
    const item = fixture.order[i];
    if (
      !item ||
      typeof item.drugName !== 'string' ||
      item.drugName.trim().length === 0 ||
      typeof item.testType !== 'string' ||
      item.testType.trim().length === 0 ||
      typeof item.protocolLabel !== 'string'
    ) {
      throw new Error(
        `Fixture entry at index ${i} is malformed: ${JSON.stringify(item)}. ` +
        `Expected { drugName: string, testType: string, protocolLabel: string }.`
      );
    }
  }

  return true;
}

/**
 * Validates the frozen pre-snapshot prefix against the independent canonical hash.
 */
export function validateFrozenPrefix(tuples, sourceLabel = 'fixture') {
  if (!Array.isArray(tuples)) {
    return {
      valid: false,
      error: `${sourceLabel}: tuples must be an array.`,
    };
  }

  if (tuples.length < FROZEN_PRE_SNAPSHOT_COUNT) {
    return {
      valid: false,
      error:
        `CRITICAL SAFETY FAILURE (${sourceLabel}): contains only ${tuples.length} records, ` +
        `which is fewer than the frozen pre-snapshot baseline of ${FROZEN_PRE_SNAPSHOT_COUNT} records.\n` +
        `Truncating frozen records breaks backwards compatibility with stored clinical plans!`,
    };
  }

  const actualHash = computeTuplesHash(tuples, FROZEN_PRE_SNAPSHOT_COUNT);

  if (actualHash !== FROZEN_PRE_SNAPSHOT_PREFIX_SHA256) {
    // Collect boundary diagnostic hints
    const head = tuples[0];
    const tail = tuples[115];
    const headExpected = FROZEN_PREFIX_CHECKPOINTS.HEAD_0.tuple;
    const tailExpected = FROZEN_PREFIX_CHECKPOINTS.TAIL_115.tuple;

    const headMatches =
      head?.drugName === headExpected.drugName &&
      head?.testType === headExpected.testType &&
      head?.protocolLabel === headExpected.protocolLabel;

    const tailMatches =
      tail?.drugName === tailExpected.drugName &&
      tail?.testType === tailExpected.testType &&
      tail?.protocolLabel === tailExpected.protocolLabel;

    let diagnostic = '';
    if (!headMatches) {
      diagnostic += `\n  - Head checkpoint (index 0) mismatch:\n    Expected: ${JSON.stringify(headExpected)}\n    Received: ${JSON.stringify(head)}`;
    }
    if (!tailMatches) {
      diagnostic += `\n  - Tail checkpoint (index 115) mismatch:\n    Expected: ${JSON.stringify(tailExpected)}\n    Received: ${JSON.stringify(tail)}`;
    }

    return {
      valid: false,
      actualHash,
      expectedHash: FROZEN_PRE_SNAPSHOT_PREFIX_SHA256,
      error:
        `CRITICAL SAFETY FAILURE: The frozen 116-record pre-snapshot prefix in ${sourceLabel} ` +
        `has been modified, reordered, or tampered with!\n` +
        `  Expected SHA-256: ${FROZEN_PRE_SNAPSHOT_PREFIX_SHA256}\n` +
        `  Actual SHA-256:   ${actualHash}\n` +
        `  Clinical safety notice: DREAM saved plans reference protocol array indices 0..115 directly. ` +
        `Any reordering, insertion, or modification in this frozen prefix breaks stored patient records!` +
        diagnostic,
    };
  }

  return {
    valid: true,
    actualHash,
    expectedHash: FROZEN_PRE_SNAPSHOT_PREFIX_SHA256,
  };
}

/**
 * Extracts protocol tuples from generated and dream-only TypeScript data files.
 */
export function extractTuples(fileContent) {
  const tuples = [];
  const recordRegex =
    /\{\s*(?:id:\s*['"][^'"]*['"],\s*)?drugName:\s*['"]([^'"]+)['"][\s\S]*?testType:\s*['"]([^'"]+)['"][\s\S]*?protocolLabel:\s*['"]([^'"]*)['"]/g;
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

/**
 * Reconstructs DRUG_MASTERLIST tuples from drugMasterlist.ts by resolving
 * findGenerated and findDreamOnly calls against the source arrays.
 */
export function extractMasterlistTuples(masterlistContent, generatedTuples, dreamOnlyTuples) {
  function findGenTuple(drugName, testType, label) {
    const match = generatedTuples.find(
      (t) => t.drugName === drugName && t.testType === testType && (!label || t.protocolLabel === label)
    );
    if (!match) throw new Error(`Missing generated tuple: ${drugName} (${testType}${label ? ` - ${label}` : ''})`);
    return match;
  }

  function findDreamTuple(drugName, testType, label) {
    const match = dreamOnlyTuples.find(
      (t) => t.drugName === drugName && t.testType === testType && (!label || t.protocolLabel === label)
    );
    if (!match) throw new Error(`Missing DREAM-only tuple: ${drugName} (${testType}${label ? ` - ${label}` : ''})`);
    return match;
  }

  const tuples = [];
  const regex = /find(Generated|DreamOnly)\(\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"](?:\s*,\s*['"]([^'"]*)['"])?\s*\)/g;
  let m;
  while ((m = regex.exec(masterlistContent)) !== null) {
    const isGen = m[1] === 'Generated';
    const drugName = m[2];
    const testType = m[3];
    const protocolLabel = m[4] || '';
    if (isGen) {
      tuples.push(findGenTuple(drugName, testType, protocolLabel));
    } else {
      tuples.push(findDreamTuple(drugName, testType, protocolLabel));
    }
  }
  return tuples;
}

/**
 * Full verification pipeline:
 * 1. Validates fixture schema.
 * 2. Independently validates fixture's frozen pre-snapshot prefix against canonical hash.
 * 3. Reconstructs actual merged masterlist from source files.
 * 4. Independently validates actual masterlist's frozen pre-snapshot prefix against canonical hash.
 * 5. Compares expected vs actual across all positions.
 * 6. Validates deliberate appended source record(s).
 */
export function verifyOrder({
  rootDir = ROOT,
  fixturePath = DEFAULT_FIXTURE_PATH,
} = {}) {
  const errors = [];
  const warnings = [];
  const mismatches = [];

  // 1. Read and validate fixture
  let fixtureContent;
  try {
    fixtureContent = readFileSync(fixturePath, 'utf8');
  } catch (err) {
    return {
      success: false,
      criticalError: `Failed to read fixture at ${fixturePath}: ${err.message}`,
      errors: [`Failed to read fixture at ${fixturePath}: ${err.message}`],
      isFixtureError: true,
    };
  }

  let fixture;
  try {
    fixture = JSON.parse(fixtureContent);
  } catch (err) {
    return {
      success: false,
      criticalError: `Failed to parse fixture JSON at ${fixturePath}: ${err.message}`,
      errors: [`Failed to parse fixture JSON at ${fixturePath}: ${err.message}`],
      isFixtureError: true,
    };
  }

  try {
    validateFixtureSchema(fixture);
  } catch (err) {
    return {
      success: false,
      criticalError: `Fixture schema validation failed: ${err.message}`,
      errors: [err.message],
      isFixtureError: true,
    };
  }

  const expectedTuples = fixture.order;

  // 2. Independently verify fixture's frozen prefix (0..115) against committed canonical hash
  const fixturePrefixCheck = validateFrozenPrefix(expectedTuples, 'expectedProtocolOrder.json fixture');
  if (!fixturePrefixCheck.valid) {
    errors.push(fixturePrefixCheck.error);
  }

  // 3. Read source files and reconstruct actual tuples
  let generatedContent, dreamOnlyContent, masterlistContent;
  try {
    generatedContent = readFileSync(join(rootDir, 'src', 'shared', 'data', 'drugMasterlist.generated.ts'), 'utf8');
    dreamOnlyContent = readFileSync(join(rootDir, 'src', 'shared', 'data', 'dreamOnlyProtocols.ts'), 'utf8');
    masterlistContent = readFileSync(join(rootDir, 'src', 'shared', 'data', 'drugMasterlist.ts'), 'utf8');
  } catch (err) {
    return {
      success: false,
      criticalError: `Failed to read source data files: ${err.message}`,
      errors: [`Failed to read source data files: ${err.message}`],
      isFixtureError: false,
    };
  }

  const generatedTuples = extractTuples(generatedContent);
  const dreamOnlyTuples = extractTuples(dreamOnlyContent);
  let actualTuples = [];
  try {
    actualTuples = extractMasterlistTuples(masterlistContent, generatedTuples, dreamOnlyTuples);
  } catch (err) {
    errors.push(`Failed to reconstruct masterlist tuples: ${err.message}`);
  }

  // 4. Independently verify masterlist's frozen prefix (0..115) against committed canonical hash
  const masterlistPrefixCheck = validateFrozenPrefix(actualTuples, 'merged drugMasterlist.ts');
  if (!masterlistPrefixCheck.valid) {
    errors.push(masterlistPrefixCheck.error);
  }

  // 5. Check positional matches across all records
  const totalPositions = Math.max(expectedTuples.length, actualTuples.length);
  for (let i = 0; i < totalPositions; i++) {
    const exp = expectedTuples[i];
    const act = actualTuples[i];

    if (
      !exp ||
      !act ||
      exp.drugName !== act.drugName ||
      exp.testType !== act.testType ||
      exp.protocolLabel !== act.protocolLabel
    ) {
      mismatches.push({ index: i, expected: exp, actual: act });
    }
  }

  // 6. Verify deliberate appended record(s) and minimum baseline count
  const expectedApp116 = FROZEN_PREFIX_CHECKPOINTS.APPENDED_116.tuple;

  if (expectedTuples.length < MINIMUM_BASELINE_COUNT) {
    errors.push(
      `CRITICAL SAFETY FAILURE: expectedProtocolOrder.json contains only ${expectedTuples.length} records, ` +
      `which is fewer than the required baseline count of ${MINIMUM_BASELINE_COUNT} records (missing committed index 116 checkpoint).`
    );
  } else {
    const fixtureApp116 = expectedTuples[116];
    if (
      !fixtureApp116 ||
      fixtureApp116.drugName !== expectedApp116.drugName ||
      fixtureApp116.testType !== expectedApp116.testType ||
      fixtureApp116.protocolLabel !== expectedApp116.protocolLabel
    ) {
      errors.push(
        `Fixture appended record at index 116 mismatch: expected ${JSON.stringify(expectedApp116)}, received ${JSON.stringify(fixtureApp116)}`
      );
    }
  }

  if (actualTuples.length < MINIMUM_BASELINE_COUNT) {
    errors.push(
      `CRITICAL SAFETY FAILURE: Reconstructed masterlist contains only ${actualTuples.length} records, ` +
      `which is fewer than the required baseline count of ${MINIMUM_BASELINE_COUNT} records (missing committed index 116 checkpoint).`
    );
  } else {
    const actualApp116 = actualTuples[116];
    if (
      !actualApp116 ||
      actualApp116.drugName !== expectedApp116.drugName ||
      actualApp116.testType !== expectedApp116.testType ||
      actualApp116.protocolLabel !== expectedApp116.protocolLabel
    ) {
      errors.push(
        `Masterlist appended record at index 116 mismatch: expected ${JSON.stringify(expectedApp116)}, received ${JSON.stringify(actualApp116)}`
      );
    }
  }

  const success = errors.length === 0 && mismatches.length === 0;

  return {
    success,
    fixtureCount: expectedTuples.length,
    actualCount: actualTuples.length,
    frozenPrefixCount: FROZEN_PRE_SNAPSHOT_COUNT,
    frozenPrefixHash: FROZEN_PRE_SNAPSHOT_PREFIX_SHA256,
    fixturePrefixValid: fixturePrefixCheck.valid,
    masterlistPrefixValid: masterlistPrefixCheck.valid,
    mismatches,
    errors,
    warnings,
  };
}

export function main() {
  console.log('================================================================================');
  console.log('DRUG MASTERLIST POSITIONAL ORDER & INDEPENDENT FROZEN PREFIX VERIFICATION');
  console.log('================================================================================');
  console.log(`FROZEN PREFIX BASELINE: ${FROZEN_PRE_SNAPSHOT_COUNT} records (SHA-256: ${FROZEN_PRE_SNAPSHOT_PREFIX_SHA256})`);
  console.log(`MINIMUM BASELINE COUNT: ${MINIMUM_BASELINE_COUNT} records`);
  console.log(`FIXTURE PATH:           ${DEFAULT_FIXTURE_PATH}`);

  const result = verifyOrder();

  if (result.criticalError) {
    console.error(`\nBROKEN CHECK: ${result.criticalError}`);
    process.exit(result.isFixtureError ? 2 : 1);
  }

  console.log(`EXPECTED (fixture) count: ${result.fixtureCount}`);
  console.log(`ACTUAL (merged)    count: ${result.actualCount}`);
  console.log('--------------------------------------------------------------------------------');
  console.log(`[GUARD 1] Fixture schema integrity:                PASS`);
  console.log(`[GUARD 2] Fixture frozen prefix (0..115) hash:     ${result.fixturePrefixValid ? 'PASS' : 'FAIL'}`);
  console.log(`[GUARD 3] Masterlist frozen prefix (0..115) hash:  ${result.masterlistPrefixValid ? 'PASS' : 'FAIL'}`);

  const appendedPassed =
    result.errors.every((e) => !e.toLowerCase().includes('116') && !e.toLowerCase().includes('117')) &&
    result.fixtureCount >= MINIMUM_BASELINE_COUNT &&
    result.actualCount >= MINIMUM_BASELINE_COUNT;
  console.log(`[GUARD 4] Deliberate appended record (index 116):  ${appendedPassed ? 'PASS (Flucloxacillin skin/IV)' : 'FAIL'}`);

  console.log(`[GUARD 5] Positional 1:1 parity (${result.fixtureCount} positions):   ${result.mismatches.length === 0 ? 'PASS (0 mismatches)' : `FAIL (${result.mismatches.length} mismatches)`}`);
  console.log('--------------------------------------------------------------------------------');


  if (result.errors.length > 0) {
    console.error('ERROR DETAILS:');
    for (const err of result.errors) {
      console.error(`- ${err}`);
    }
  }

  if (result.mismatches.length > 0) {
    console.error(`\nPOSITIONAL MISMATCHES (${result.mismatches.length}):`);
    for (const m of result.mismatches) {
      console.error(`MISMATCH at index ${m.index}:`);
      console.error(`  EXPECTED: ${JSON.stringify(m.expected)}`);
      console.error(`  ACTUAL:   ${JSON.stringify(m.actual)}`);
    }
  }

  if (result.success) {
    console.log(`Positional mismatches: 0 out of ${result.fixtureCount} positions.`);
    console.log('STATUS: PASS (0 mismatches). Clinical saved plan positions and frozen prefix are 100% verified.');
    console.log('================================================================================\n');
    process.exit(0);
  } else {
    console.error('\nSTATUS: FAIL. Positional ordering or frozen baseline guard failed!');
    console.log('================================================================================\n');
    process.exit(1);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
