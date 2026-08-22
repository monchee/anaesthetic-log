import type { DrugProtocol } from "@features/testing/types";

/**
 * Hand-maintained DREAM protocol records for drugs not yet authored in SCRATCH.
 *
 * EMPTY since the 2026-08 tranche migration: every one of the 117 masterlist
 * records is generated from the SCRATCH export (protocols.snapshot.json), and
 * future dose edits happen under SCRATCH's clinical sign-off gate. If a new
 * panel placeholder is needed before its SCRATCH page exists, add a record
 * here and reference it with findDreamOnly in drugMasterlist.ts.
 */
export const DREAM_ONLY_PROTOCOLS: DrugProtocol[] = [];
