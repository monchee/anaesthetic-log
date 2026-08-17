# Plan 002: Harden the Sentry `beforeSend` PHI scrub to cover exception messages, event message, and extras

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**:
> `git diff --stat 70aa8ac..HEAD -- src/lib/sentry.ts src/core/components/ErrorBoundary.tsx src/lib/analytics.ts`
> If any of these files changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: security
- **Planned at**: commit `70aa8ac`, 2026-06-12

## Why this matters

DREAM is a local-first clinical app: identifiable patient data (names, DOBs,
MRNs) lives in browser state and must never leave the device except via the
explicit de-identified research path. Sentry error tracking is the one other
network egress. The current `beforeSend` scrub only strips cookies, user
identity fields, and an `MRN:`-pattern in **breadcrumb messages** — it does
not touch `event.message`, `exception.values[].value`, or `event.extra`.
Today's capture sites are benign (a React ErrorBoundary and web-vitals), so
nothing leaks *now*; but the first future `throw new Error(\`…${patient.name}…\`)`
or a `captureMessage` with interpolated patient data would ship PHI to Sentry
verbatim. This plan makes the scrub structural (one pure, unit-tested
function applied to every text surface of the event) so the guarantee doesn't
depend on every future call site being careful.

## Current state

Relevant files:

- `src/lib/sentry.ts` — lazy-loaded Sentry wrapper (77 lines). Contains the
  `beforeSend` scrub at lines 32–52. No test file exists for it.
- `src/core/components/ErrorBoundary.tsx` — one of only two capture sites;
  calls `captureException(error, { extra: { componentStack } })` at lines
  40–44. **Read-only for this plan.**
- `src/lib/analytics.ts` — the other capture site; calls
  `captureMessage(\`Web Vitals: ${name}\`, …)` at line 9. **Read-only.**
- `src/lib/env.ts` — Zod-validated env (`VITE_SENTRY_DSN`,
  `VITE_ENVIRONMENT`). **Read-only.**

The current scrub, `src/lib/sentry.ts:19-53` as written:

```ts
    Sentry.init({
      dsn: env.VITE_SENTRY_DSN,
      environment: env.VITE_ENVIRONMENT,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      tracesSampleRate: 1.0,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      beforeSend(event) {
        // Remove any potential PHI (Protected Health Information)
        if (event.request) {
          delete event.request.cookies;
        }
        if (event.user) {
          // Anonymize user data
          event.user.id = 'anonymized';
          delete event.user.email;
          delete event.user.username;
          delete event.user.ip_address;
        }
        // Scrub PHI from breadcrumbs
        if (event.breadcrumbs) {
          event.breadcrumbs = event.breadcrumbs.map((breadcrumb) => ({
            ...breadcrumb,
            message: breadcrumb.message?.replace(/MRN:\s*\w+/gi, 'MRN: [REDACTED]'),
          }));
        }
        return event;
      },
    });
```

Sentry is imported dynamically (`import('@sentry/react')`) and only when
`VITE_SENTRY_DSN` is set and `VITE_ENVIRONMENT !== 'test'` — so unit tests
never initialize real Sentry. Type-only imports from `@sentry/react` are safe
(erased at compile time).

Repo conventions that apply:

- Tests are vitest `describe`/`it` colocated next to the source file
  (`foo.ts` → `foo.test.ts`); see `src/shared/utils/csvUtils.test.ts` for the
  assertion style.
- Module style: plain exported functions with JSDoc, no classes — match the
  existing `sentry.ts`.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Typecheck | `npx tsc --noEmit` | exit 0, no output |
| Unit tests (all) | `npx vitest run` | all pass (222 at plan time) |
| Unit tests (this file) | `npx vitest run src/lib/sentry.test.ts` | all pass |
| Lint | `npm run lint` | exit 0 |

(Verified working at plan time. Dependencies already installed; do NOT run
`npm install`.)

## Scope

**In scope** (the only files you may modify):

- `src/lib/sentry.ts`
- `src/lib/sentry.test.ts` (create)
- `plans/README.md` (status row only)

**Out of scope** (do NOT touch, even though they look related):

- `src/core/components/ErrorBoundary.tsx` and `src/lib/analytics.ts` — call
  sites are fine; the fix belongs in the wrapper, not the callers.
- The replay integration config (`maskAllText: true, blockAllMedia: true`) —
  already correct; do not change sample rates or masking.
- `tracesSampleRate` — cost tuning, not security; leave it.
- `vitest.config.ts` / coverage thresholds — plan 001 owns that file.
- Sentry project settings / server-side scrubbing — out of repo scope.

## Git workflow

- Branch: `advisor/002-sentry-phi-scrub` off `main`.
- Commit style: conventional-ish, matching `git log` (e.g.
  `fix(security): scrub PHI from all Sentry event text surfaces`).
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Extract a pure, exported scrub function

In `src/lib/sentry.ts`, add (above `initSentry`):

```ts
import type { ErrorEvent as SentryErrorEvent } from '@sentry/react';

/**
 * Patterns that may identify a patient if interpolated into an error or
 * log message. Names cannot be pattern-matched; this is defence-in-depth
 * for structured identifiers, not a substitute for never logging PHI.
 */
const PHI_PATTERNS: Array<[RegExp, string]> = [
  [/MRN:?\s*[\w-]+/gi, 'MRN: [REDACTED]'],
  [/\bREC-\d+\b/g, '[RECORD-ID]'],
  [/\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/g, '[DATE]'], // DOB-shaped dates
];

const scrubText = (text: string): string =>
  PHI_PATTERNS.reduce((acc, [pattern, replacement]) => acc.replace(pattern, replacement), text);

/**
 * Scrubs potential PHI from every text surface of an outgoing Sentry event.
 * Pure and exported so it is unit-testable without initializing Sentry.
 */
export function scrubPhiFromEvent(event: SentryErrorEvent): SentryErrorEvent {
  if (event.request) {
    delete event.request.cookies;
  }
  if (event.user) {
    event.user.id = 'anonymized';
    delete event.user.email;
    delete event.user.username;
    delete event.user.ip_address;
  }
  if (event.message) {
    event.message = scrubText(event.message);
  }
  if (event.exception?.values) {
    for (const value of event.exception.values) {
      if (value.value) value.value = scrubText(value.value);
    }
  }
  // Free-form context attached at capture sites can carry anything; scrub
  // string values rather than trusting each future call site.
  if (event.extra) {
    for (const key of Object.keys(event.extra)) {
      const v = event.extra[key];
      if (typeof v === 'string') event.extra[key] = scrubText(v);
    }
  }
  if (event.breadcrumbs) {
    event.breadcrumbs = event.breadcrumbs.map((breadcrumb) => ({
      ...breadcrumb,
      message: breadcrumb.message ? scrubText(breadcrumb.message) : breadcrumb.message,
    }));
  }
  return event;
}
```

Then replace the entire inline `beforeSend(event) { … }` body with:

```ts
      sendDefaultPii: false,
      beforeSend(event) {
        return scrubPhiFromEvent(event);
      },
```

(`sendDefaultPii: false` is the Sentry default; setting it explicitly
documents the intent in a clinical codebase.)

**Verify**: `npx tsc --noEmit` → exit 0. If the type name `ErrorEvent` does
not exist in the installed `@sentry/react` version, see STOP conditions.

### Step 2: Unit-test the scrub function

Create `src/lib/sentry.test.ts`. Import only `scrubPhiFromEvent` (never call
`initSentry` — it would attempt a dynamic Sentry import; `VITE_ENVIRONMENT`
is `test` under vitest so it would no-op, but the unit under test here is the
pure function). Build minimal event literals (cast via
`as Parameters<typeof scrubPhiFromEvent>[0]` if the Sentry event type demands
fields irrelevant to the test). Cover:

1. **Exception message scrub**: an event with
   `exception.values[0].value = 'Failed to save MRN: 12345 for patient'` →
   after scrubbing, the value contains `'MRN: [REDACTED]'` and not `'12345'`.
2. **Event message scrub**: `message: 'lookup failed for REC-441'` →
   contains `'[RECORD-ID]'`, not `'REC-441'`.
3. **DOB-shaped date scrub**: `message: 'invalid DOB 04/03/1980'` →
   contains `'[DATE]'`, not `'04/03/1980'`.
4. **Extra scrub**: `extra: { note: 'MRN: 99', componentStack: 'at Foo' }` →
   `note` redacted, `componentStack` untouched.
5. **User anonymization**: `user: { id: 'u1', email: 'a@b.c' }` → id becomes
   `'anonymized'`, email deleted.
6. **Breadcrumb scrub preserved**: breadcrumb with message `'MRN: 7'` →
   redacted (parity with the old behavior).
7. **Pass-through**: an event with none of these fields returns unchanged
   (no throw, same reference or deep-equal).

Model the file structure on `src/shared/utils/csvUtils.test.ts`
(plain `describe`/`it`/`expect`, no setup files needed).

**Verify**: `npx vitest run src/lib/sentry.test.ts` → 7 tests pass.

### Step 3: Full verification pass

**Verify**, in order:

1. `npx tsc --noEmit` → exit 0
2. `npx vitest run` → all tests pass (existing 222 + 7 new)
3. `npm run lint` → exit 0
4. `git status --porcelain` → only `src/lib/sentry.ts`, `src/lib/sentry.test.ts`,
   and `plans/README.md` modified/created

## Test plan

Covered by Step 2: seven named cases in the new `src/lib/sentry.test.ts`,
structural pattern `src/shared/utils/csvUtils.test.ts`. Verification:
`npx vitest run src/lib/sentry.test.ts` → 7 pass.

## Done criteria

ALL must hold:

- [ ] `npx tsc --noEmit` exits 0
- [ ] `npx vitest run` exits 0; `src/lib/sentry.test.ts` exists with the 7 cases
- [ ] `grep -n "scrubPhiFromEvent" src/lib/sentry.ts` shows the export and its
      use inside `beforeSend`
- [ ] `grep -n "sendDefaultPii: false" src/lib/sentry.ts` matches
- [ ] `grep -c "replace(/MRN" src/lib/sentry.ts` returns 0 (old inline regex
      replaced by `PHI_PATTERNS`)
- [ ] `npm run lint` exits 0
- [ ] No files outside the in-scope list are modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The drift check shows `src/lib/sentry.ts` changed and the live `beforeSend`
  no longer matches the "Current state" excerpt.
- `@sentry/react` does not export an `ErrorEvent` type (older/newer major).
  Do not fall back to `any` — report the available event type names
  (`npx tsc` error output will list candidates) and wait for direction.
- Typing `event.extra` mutation fails because the installed Sentry types mark
  it readonly — report rather than casting around it.
- Any pre-existing test fails after your change.

## Maintenance notes

- The DOB-date pattern is deliberately broad (`04/03/1980`, `4-3-80`); if it
  ever redacts a legitimate non-PHI date in an error message, that is the
  correct trade-off for a clinical app — reviewers should resist narrowing it.
- Pattern-based scrubbing cannot catch patient *names*. The real guarantee
  remains "never interpolate patient data into errors/messages"; this scrub
  is the backstop. A reviewer adding new `captureException`/`captureMessage`
  call sites should check what flows into `extra`.
- If a future change adds Sentry `contexts` or `tags` at capture sites,
  extend `scrubPhiFromEvent` to walk those too (deliberately deferred — no
  current call site sets them).
- `beforeSendTransaction` is not scrubbed (tracing payloads contain URLs and
  timings only in this SPA — no router, no PHI in URLs). Revisit if routing
  is ever added.
