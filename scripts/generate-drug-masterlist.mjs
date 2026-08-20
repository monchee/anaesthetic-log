#!/usr/bin/env node
// Generates src/shared/data/drugMasterlist.generated.ts from
// src/shared/data/protocols.snapshot.json.
//
// Run manually with `npm run protocols:generate`.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SNAPSHOT_PATH = join(ROOT, 'src', 'shared', 'data', 'protocols.snapshot.json');
const OUTPUT_PATH = join(ROOT, 'src', 'shared', 'data', 'drugMasterlist.generated.ts');

export function composeSptNeatConcentration(spt) {
  if (!spt) return '';
  const { dilution, concentration } = spt;
  if (dilution && concentration) {
    return `${dilution} (${concentration})`;
  }
  if (dilution) return dilution;
  if (concentration) return concentration;
  return '';
}

export function transformSnapshotToProtocols(snapshot) {
  const protocols = [];

  for (const drug of snapshot.drugs || []) {
    const drugName = drug.title;
    const category = drug.dream?.category || '';
    const sourceSlug = drug.slug;
    const lastReviewed = drug.last_reviewed;

    for (const protocol of drug.protocols || []) {
      const hasSkin = Boolean(
        protocol.spt ||
        (protocol.idt && protocol.idt.length > 0) ||
        (protocol.test_type && protocol.test_type !== 'challenge')
      );
      const hasChallenge = Boolean(
        protocol.challenge &&
        protocol.challenge.steps &&
        protocol.challenge.steps.length > 0
      );

      const underReview = Boolean(protocol.under_review);
      const needsPharmacyVerification = protocol.needs_pharmacy_verification === true;

      // Case 1: Both skin and challenge -> Split into 2 records
      if (hasSkin && hasChallenge) {
        // Skin record
        protocols.push({
          id: protocol.id,
          drugName,
          category,
          testType: protocol.test_type || 'skin',
          presentation: protocol.presentation || '',
          sptNeatConcentration: composeSptNeatConcentration(protocol.spt),
          diluent: protocol.diluent || '',
          idtSteps: (protocol.idt || []).map((step) => ({
            ratio: step.dilution || '',
            concentration: step.concentration || '',
          })),
          challengeSteps: [],
          protocolLabel: protocol.label,
          sourceSlug,
          underReview,
          lastReviewed,
          ...(needsPharmacyVerification ? { needsPharmacyVerification: true } : {}),
        });

        // Challenge record
        protocols.push({
          id: `${protocol.id}-challenge`,
          drugName,
          category,
          testType: 'challenge',
          presentation: protocol.presentation || '',
          sptNeatConcentration: '',
          diluent: '',
          idtSteps: [],
          challengeSteps: (protocol.challenge.steps || []).map((step, idx) => ({
            step: idx + 1,
            dose: step.dose || '',
            volume: step.volume || '',
            cumulative: step.cumulative || '',
          })),
          protocolLabel: `${protocol.label} Challenge`,
          sourceSlug,
          underReview,
          lastReviewed,
          ...(needsPharmacyVerification ? { needsPharmacyVerification: true } : {}),
        });
      } else if (hasChallenge) {
        // Only challenge record
        protocols.push({
          id: protocol.id,
          drugName,
          category,
          testType: 'challenge',
          presentation: protocol.presentation || '',
          sptNeatConcentration: '',
          diluent: '',
          idtSteps: [],
          challengeSteps: (protocol.challenge?.steps || []).map((step, idx) => ({
            step: idx + 1,
            dose: step.dose || '',
            volume: step.volume || '',
            cumulative: step.cumulative || '',
          })),
          protocolLabel: protocol.label,
          sourceSlug,
          underReview,
          lastReviewed,
          ...(needsPharmacyVerification ? { needsPharmacyVerification: true } : {}),
        });
      } else {
        // Skin only record
        protocols.push({
          id: protocol.id,
          drugName,
          category,
          testType: protocol.test_type || 'skin',
          presentation: protocol.presentation || '',
          sptNeatConcentration: composeSptNeatConcentration(protocol.spt),
          diluent: protocol.diluent || '',
          idtSteps: (protocol.idt || []).map((step) => ({
            ratio: step.dilution || '',
            concentration: step.concentration || '',
          })),
          challengeSteps: [],
          protocolLabel: protocol.label,
          sourceSlug,
          underReview,
          lastReviewed,
          ...(needsPharmacyVerification ? { needsPharmacyVerification: true } : {}),
        });
      }
    }
  }

  return protocols;
}

function formatStringLiteral(str) {
  return JSON.stringify(str);
}

export function generateTypeScript(protocols) {
  const lines = [
    '// AUTO-GENERATED from src/shared/data/protocols.snapshot.json.',
    '// Do NOT edit this file directly. Run `npm run protocols:generate` to regenerate.',
    '',
    "import type { DrugProtocol, IDTStep, ChallengeStep } from '@features/testing/types';",
    '',
    '// Compact helpers for readability',
    'const s = (ratio: string, concentration: string): IDTStep => ({ ratio, concentration });',
    'const c = (step: number, dose: string, volume: string, cumulative: string): ChallengeStep => ({ step, dose, volume, cumulative });',
    '',
    'export const GENERATED_PROTOCOLS: DrugProtocol[] = [',
  ];

  for (const p of protocols) {
    lines.push('  {');
    lines.push(`    id: ${formatStringLiteral(p.id)},`);
    lines.push(`    drugName: ${formatStringLiteral(p.drugName)},`);
    if (p.needsPharmacyVerification) {
      lines.push('    needsPharmacyVerification: true,');
    }
    lines.push(`    category: ${formatStringLiteral(p.category)},`);
    lines.push(`    testType: ${formatStringLiteral(p.testType)},`);
    lines.push(`    presentation: ${formatStringLiteral(p.presentation)},`);
    lines.push(`    sptNeatConcentration: ${formatStringLiteral(p.sptNeatConcentration)},`);
    lines.push(`    diluent: ${formatStringLiteral(p.diluent)},`);

    if (p.idtSteps.length === 0) {
      lines.push('    idtSteps: [],');
    } else {
      const idtFormatted = p.idtSteps
        .map((step) => `s(${formatStringLiteral(step.ratio)}, ${formatStringLiteral(step.concentration)})`)
        .join(', ');
      lines.push(`    idtSteps: [${idtFormatted}],`);
    }

    if (p.challengeSteps.length === 0) {
      lines.push('    challengeSteps: [],');
    } else {
      const challengeFormatted = p.challengeSteps
        .map((step) => `c(${step.step}, ${formatStringLiteral(step.dose)}, ${formatStringLiteral(step.volume)}, ${formatStringLiteral(step.cumulative)})`)
        .join(', ');
      lines.push(`    challengeSteps: [${challengeFormatted}],`);
    }

    lines.push(`    protocolLabel: ${formatStringLiteral(p.protocolLabel)},`);
    if (p.sourceSlug) {
      lines.push(`    sourceSlug: ${formatStringLiteral(p.sourceSlug)},`);
    }
    if (p.underReview !== undefined) {
      lines.push(`    underReview: ${p.underReview},`);
    }
    if (p.lastReviewed) {
      lines.push(`    lastReviewed: ${formatStringLiteral(p.lastReviewed)},`);
    }
    lines.push('  },');
  }

  lines.push('];');
  lines.push('');
  return lines.join('\n');
}

export function generateDrugMasterlist(snapshotPath = SNAPSHOT_PATH, outputPath = OUTPUT_PATH) {
  const snapshotContent = readFileSync(snapshotPath, 'utf8');
  const snapshot = JSON.parse(snapshotContent);
  const protocols = transformSnapshotToProtocols(snapshot);
  const code = generateTypeScript(protocols);
  writeFileSync(outputPath, code, 'utf8');
  return { protocolCount: protocols.length };
}

export function main() {
  const { protocolCount } = generateDrugMasterlist();
  console.log(`Generated ${protocolCount} protocol records in src/shared/data/drugMasterlist.generated.ts`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
