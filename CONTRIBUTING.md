# Contributing

This repository is private clinical tooling. Contributions should preserve patient privacy, clinical document clarity, and the local-first data model.

## Local Setup

```bash
npm ci
npm run dev
```

Open the Vite URL printed in the terminal, usually `http://localhost:3000`.

## Expected Checks

Run these before committing code or documentation that affects behavior:

```bash
npx tsc --noEmit
npm run lint
npm run test:unit
npm run build
```

Use `npm run test:e2e` for browser-flow changes and `npm run test:coverage` when you need a local coverage report.

## Privacy Rules

- Never commit real patient data, REDCap exports, identifiable screenshots, generated clinical reports, or print/PDF captures.
- Use demo or synthetic data for tests and screenshots.
- Keep normal clinical workflows local-first: identifiable patient data should remain in the browser unless a feature explicitly handles deidentified research submission.
- Avoid adding dependencies, logging, analytics, or network calls that could transmit clinical data without explicit review.

## Changelog and Release Notes

For user-visible changes:

1. Add a top entry to `CHANGELOG.md`.
2. Include a short `Summary:` line for the Quick Start "What's New" modal.
3. Run:
   ```bash
   npm run changelog:sync
   ```
4. Confirm `src/shared/data/changelog.json` changed as expected.

## Release Checklist

1. Bump `package.json`.
2. Update `CHANGELOG.md` with `Summary:`.
3. Run `npm run changelog:sync`.
4. Run the expected checks.
5. Commit with a release-focused message.
6. Tag and push the release.
7. Create the GitHub release.
8. Publish with `npm run deploy`.

## Pull Requests

- Prefer focused changes with clear clinical/user impact.
- Keep generated local artifacts out of commits unless they are intentionally tracked.
- Use squash merge into `main`.
- Do not add open-source license language; this remains private/internal tooling.
