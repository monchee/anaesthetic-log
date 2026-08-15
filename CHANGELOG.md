## [0.76.5] — 2026-08-15 (Navigation without Workflow View)

Summary: Removed the unwanted Clinician/Nurse workflow view and mode-dependent layout while preserving direct Allergy Testing, REDCap review, draft protection, contextual navigation, mobile navigation, and clinical nurse notes.

### Removed
- **Clinician and Nurse workflow view mode** — Removes the workflow mode selector and mode-dependent view switching from desktop and mobile navigation.

### Changed
- **Unified Home layout** — Standardizes Home screen presentation with consistent patient selection, quick-start actions, and informational panels.
- **Stable contextual navigation** — Retains dynamic links for active reports and in-progress testing drafts in consistent order across navigation surfaces.

## [0.76.4] — 2026-08-15 (Navigation and Direct Entry Workbench)

Summary: Reworked navigation, added Home REDCap review and direct Allergy Testing entry points, strengthened draft-safe history behaviour, accessibility coverage, and autosave restore status.

### Added
- **Mode-aware navigation architecture** — Introduces `AppSidebar`, `MobileNavigationDrawer`, and `WorkflowModeControl` with tailored views for Clinician and Nurse workflows, integrated hash routing, and `NavigationGuardDialog` protection.
- **Direct entry and quick-start actions** — Adds prominent Home action cards for REDCap CSV review and direct Allergy Testing with active draft resume indicators and safe patient switching guards.
- **Synchronous draft persistence** — Adds `persistDraftNow` in `useTestingState` to immediately flush in-flight draft changes and prevent debounce race conditions during navigation.

### Changed
- **Autosave restore indicator accuracy** — Refines `DraftSaveIndicator` and testing draft restoration to avoid false saving states on mount and accurately reflect saved timestamps and unsaved edits.
- **Comprehensive test coverage** — Expands unit test suites for navigation components, workflow mode hooks, and draft lifecycle management, alongside updated accessibility and direct entry E2E specs.

## [0.76.3] — 2026-08-15 (Distinctive Quick-Start Colours)

Summary: Applies distinct semantic colour styling to Home quick-start entry points, styling REDCap review in cool blue/sky tones and Allergy Testing in warm amber tones while preserving all accessibility standards, responsive layouts, and clinical behaviours.

### Changed
- **Distinctive quick-start action colours** — Styles the REDCap CSV review action with cool blue (`sky`) accents and the direct Allergy Testing action with warm amber accents, enabling immediate visual distinction between administrative review and direct clinical testing entry points.
- **Preserved accessibility and interaction behaviour** — Maintains high-contrast iconography, theme-aware tinted backgrounds, visible keyboard focus rings, zero-radius geometry, responsive grid sizing, and existing modal and navigation workflows across both quick-start actions.

## [0.76.2] — 2026-08-15 (Quick Start Emphasis)

Summary: Strengthens Home quick-start entry points with prominent, equal-weight action cards for REDCap review and direct Allergy Testing, featuring responsive grid layouts and accessibility-preserving visual treatments.

### Changed
- **Equal-weight Home quick-start entry points** — Elevates REDCap CSV review and direct Allergy Testing into balanced, prominent action cards with clear descriptive copy.
- **Responsive and accessible visual treatment** — Refines quick-start cards with high-contrast iconography, theme-aware tinted surfaces, fluid responsive layout, and visible focus rings preserving accessibility standards.

## [0.76.1] — 2026-08-15 (Workbench Polish & Performance)

Summary: Removes known production build and Chromium console warnings with updated browser data, web-vitals compatibility, and granular code splitting, while completing whole-project Clinical Workbench design and print styling polish.

### Added
- **Granular vendor and runtime chunking** — Configures dedicated production chunk boundaries for React/DOM runtime, Supabase, Sentry, Radix UI components, forms, and icons, eliminating production chunk-size warnings.
- **Whole-project Clinical Workbench polish** — Finalizes semantic category and status tokens, zero-radius geometry, high-contrast focus rings, and print-safe typography across clinical reports, handouts, letters, and dashboard views.

### Changed
- **Warning-free telemetry and browser data** — Updates `web-vitals` and Browserslist data, with a scoped fallback for browsers without `visibility-state` performance entries while preserving all five reported metrics.
- **Operational documentation** — Updates README notes to reflect clean production chunking without expected warnings.

## [0.76.0] — 2026-08-14 (Clinical Workbench Refinement)

Summary: Refines the Clinical Workbench interface with semantic category and status tokens, improved typography and print scaling, responsive PatientTable workflows, enhanced draft and pharmacy verification affordances, and expanded regression coverage.

### Added
- **Semantic category and status tokens** — Extends Tailwind design tokens with semantic drug category palettes (`--cat-*`) and structured status color tokens (`success`, `warning`, `danger`, `info`, `neutral`) for consistent theme styling across clinical views.
- **Typography and print scaling** — Refines Public Sans font hierarchy and print stylesheets to guarantee legibility, optimal contrast, and robust black-and-white page scaling across clinical forms and reports.
- **Responsive PatientTable** — Improves table layout, quick filters (`Needs action`, `Reported`), search responsiveness, and pagination affordances on mobile and tablet viewport widths.
- **Draft and pharmacy affordances** — Streamlines in-progress session persistence indicators and highlights unverified masterlist preparations with clear pharmacy confirmation callouts.
- **Regression test coverage** — Adds comprehensive unit and component test suites covering patient worklist filtering, design token contracts, and draft lifecycle transitions.

## [0.75.0] — 2026-08-14 (Direct Testing Entry)

Summary: Adds quick-start entry points for REDCap review and direct Allergy Testing, with editable patient identity fields and safe draft protection.

### Added
- **Home quick-start actions** — users can upload a REDCap export and continue directly to Dashboard, or open Allergy Testing without first selecting a patient or creating a testing plan.
- **Direct Allergy Testing identity fields** — nurses can enter MRN, first name, last name, and optional DOB in a fresh testing session; required identity validation remains enforced before saving.
- **Safe direct-session entry** — the `/testing` route opens the same fresh-session state, while unsaved direct testing data triggers confirmation before it can be discarded.

### Changed
- **Patient-linked testing identity remains protected** — testing sessions opened from a patient record continue to show read-only identity information and preserve the existing selected drugs and plan workflow.
- **Help and FAQ guidance** — documents both the patient-linked workflow and the direct testing/REDCap review entry paths.

## [0.74.0] — 2026-08-14 (Clipboard Handoff)

Summary: Adds plain-text clipboard copying for the Testing Request Form preview with toast feedback, and updates FAQ export guidance.

### Added
- **Copy as Text for Testing Request Form preview** — Clinicians can now copy formatted testing request details directly to the clipboard from the print preview screen, reusing the email formatter while preserving all clinical and protocol details.
- **Clipboard feedback notifications** — Displays immediate success and failure toasts when copying testing request text to the clipboard.

### Changed
- **FAQ export guidance update** — Clarifies that both clinical reports and testing request forms support plain text clipboard export alongside email dispatch.

## [0.73.0] — 2026-08-14 (Clinical Workbench)

Summary: Adopts the Clinical Workbench design system across the interface with strict zero-radius geometry, semantic theme tokens, visible keyboard focus indicators, and formal design specifications in PRODUCT.md, DESIGN.md, and .impeccable/design.json.

### Added
- **Formal product specification (`PRODUCT.md`)** — Documents platform context, clinician workflows, local-first privacy principles, clinical calculation constraints, and accessibility targets.
- **Design system specification (`DESIGN.md`)** — Establishes the "Clinical Workbench" visual language, NSW Health color palette, Public Sans typographic scale, rectangular geometry, elevation rules, and component patterns.
- **Design tokens schema (`.impeccable/design.json`)** — Defines machine-readable design system tokens, color ramps, typography scales, shadows, breakpoints, and component examples.

### Changed
- **Strict zero-radius geometry across UI components** — Standardizes sharp rectangular corners (`rounded-none`) across buttons, cards, dialogs, badges, sidebars, dropdowns, hover cards, and skeleton loaders.
- **Enhanced keyboard focus visibility and tactile interactions** — Adds consistent high-contrast focus rings (`focus-visible:ring-2`) and tactile micro-press states across buttons, inputs, toggles, and report tabs.
- **Semantic theme token consolidation** — Replaces hardcoded color utilities with semantic theme tokens (`--background`, `--card`, `--border`, `--muted`, `--primary`) across info pages, testing forms, and research dashboards.

## [0.72.0] — 2026-07-14 (Referral Trust)

Summary: Tryptase results from the referral now prefill the testing record and Powerchart letter, preventing the clinically unsafe false claim that serial samples were "not obtained." This release also adds a persistent patient worklist, clearer clinical completeness cues, safer imports, and stronger privacy protections across the five-phase UX improvement programme.

### Added
- **Sticky patient identity at clinical decision points** — Testing Session and Summary screens keep the patient's name, MRN, and DOB visible while clinicians scroll, reducing wrong-patient risk during data entry and report review.
- **Visible autosave status** — testing-session and Testing Request Form drafts now show when they are saving and when they were last saved, making browser-local persistence explicit.
- **Persistent patient worklist with workflow status** — imported cohorts persist for 6 hours across refreshes, while the dashboard derives Referral, Plan drafted, Testing, and Reported states and adds Needs action and Reported filters.
- **Expiry warning for local clinical data** — a banner warns before the 6-hour browser-local TTL expires and offers a Keep working action to extend the active session.
- **Honest suspected-agent review** — an explicit empty state no longer implies an agent was identified when none was imported, and clinicians can tap medication-timeline entries to mark or unmark suspected agents.
- **Missing-information checklist** — patient history highlights absent anaesthetic charts, resuscitation charts, tryptase results, discharge letters, suspected agents, and differential diagnosis before testing proceeds.
- **High-risk context chips** — beta-blocker, ACE inhibitor, pregnancy, and asthma context now appears during patient review and testing where it can inform clinical decisions.
- **Pharmacy-verification flags** — testing-request builder and print views flag masterlist preparations whose concentration or preparation details still require pharmacy confirmation.

### Changed
- **Clinical terminology is consistent end to end** — screens and actions now use Testing Request Form, Testing Session, and Reports consistently instead of mixing plan, log, and summary labels.
- **Confirmation dialogs share one safety pattern** — destructive and high-impact actions now use the same accessible confirmation dialog, wording hierarchy, and destructive styling.
- **CSV uploads explain progress and outcomes** — upload surfaces show parsing state plus imported and skipped-row totals, so clinicians receive clear feedback instead of a silent transition.
- **Duplicate uploads can replace the cohort** — uploading an already loaded REDCap database now offers an explicit full-database replacement flow instead of rejecting the file.

### Fixed
- **Quoted multi-line CSV fields import correctly** — the REDCap parser now honours quoted records containing commas, escaped quotes, and embedded newlines instead of splitting one patient across multiple rows.
- **Sentry removes PHI from every event text surface** — identifiers and DOB-shaped dates are scrubbed from messages, exceptions, breadcrumbs, and extras; user and cookie data are removed before transmission.
- **MRNs retain their recorded casing** — patient identifiers are displayed verbatim instead of being incorrectly forced to lowercase.
- **Referral tryptase data reaches the Powerchart letter** — imported tryptase samples prefill the testing record and generated letter, so existing results are reported rather than falsely described as "not obtained."

## [0.71.0] — 2026-06-11 (Any Encoding)

Summary: Fixes CSV import rejecting valid REDCap exports with "Missing required columns" when the file isn't UTF-8. Excel "Save As" commonly writes UTF-16, which the app decoded as UTF-8 — garbling every column name so all required headers failed at once. Imports now work regardless of file encoding.

### Fixed
- **CSV upload now reads any file encoding** — all three upload paths (main upload sheet, Help modal, Dashboard) read the file as bytes and detect the byte-order mark (UTF-8, UTF-16LE, UTF-16BE) before decoding, instead of assuming UTF-8. A UTF-16 export from Excel no longer turns column names into mojibake. New `decodeCsvBytes` helper in `csvUtils.ts`.
- **Header matching tolerates invisible characters** — `normalizeHeader` strips BOM and zero-width spaces, converts non-breaking spaces (U+00A0) to regular spaces, and collapses doubled whitespace, applied once to every parsed header so both validation and column-mapping are resilient to REDCap/Excel label artifacts.

### Changed
- **CSV parse errors now name the detected columns** — the "Missing required columns" message lists the first few column names actually found in the file, so an encoding garble vs a genuine column rename is diagnosable at a glance.

## [0.70.0] — 2026-06-11 (Medication Chart)

Summary: Redesigns the testing plan request form to match the standard national medication chart (NIMC) template — patient ID label box header, one row per SPT/IDT step in a flat administration table — so the printed document is clinically familiar and audit-compliant.

### Changed
- **Testing plan print view now matches NIMC medication chart format** — replaces the accent-border / patient-banner layout with the standard two-column header: a bordered "Affix patient identification label here" box (pre-filled URN, family name, given names, address watermark, DOB, M/F checkboxes, red "First prescriber" warning) and a right column with the red "Attach ADR sticker" box and form title.
- **Flat per-step table replaces grouped drug table** — each drug now produces one row per test step (1 SPT row + 1 row per IDT dilution) instead of stacking all IDT concentrations in a single cell; columns match the NIMC "Once only and nurse initiated medicines" format: Date | Drug | Type | Concentration | Date | Time | Signature | Print name | Wheal (mm) | Time.
- **Reference controls moved to a bordered strip above the table** — Histamine SPT / Saline SPT / Saline IDT fill-in lines now sit in a clearly delineated section immediately above the protocol table.
- **Three blank rows added at table bottom** for handwritten additions at time of testing.
- **"not listed" badge preserved for REDCap-sourced custom drugs** — shown inline next to the drug name in the Type column.

## [0.69.0] — 2026-06-11 (Legible)

Summary: Design-audit remediation pass — closes the UI/UX and typography findings from the formal accessibility audit, prioritising the patient-safety items: legible wheal measurements, dark-mode-safe clinical notes, B&W-survivable printed reports, and colourblind-safe severity indicators.

### Fixed
- **Wheal-size inputs now use tabular figures** — every SPT and IDT result cell in `DrugTestGrid` is `font-mono tabular-nums` unconditionally (previously mono only on a positive result), so digits column-align across rows and a 3mm vs 13mm value can no longer be misread between IDT dilution columns at the positive/negative threshold.
- **Clinical notes are legible in dark mode** — the Assessment & Plan textareas (`AssessmentSection`, `AssessmentPlanSection`) used hardcoded `bg-white`/slate tokens that rendered near-white text on a white field in dark mode; they now use semantic `bg-background`/`text-foreground`/`border-border` tokens. Notes typed in dark mode are no longer invisible.
- **Printed reports survive B&W photocopying** — the print stylesheet forces all headings to `#000` and `--foreground` to black, so NSW Health Blue headings no longer wash out to grey on a ward printer; the "AVOID" drug labels in `ClinicalReport` and `PatientHandout` now print bold-black so the avoidance signal is unmistakable in monochrome.
- **Dark-mode secondary text meets WCAG AA** — `--muted-foreground` raised from `0 0% 60%` (#999, ~3.8:1) to `0 0% 65%` (#a6a6a6, ≥4.5:1), fixing contrast on every section label, table header and caption in dark mode.
- **Patient name no longer exposed on the active-report banner** — the banner now shows initials (e.g. "J. Smith") instead of the full name, so a previous patient's identity is not visible to the next person at a shared workstation.
- **Print header/footer no longer overlap content** — replaced the `print:fixed` running header/footer + `body` padding approach with proper `@page` margins (25mm top / 20mm bottom / 15mm sides), preventing the patient identifier from overlapping the first table row on A4.
- **Reference control inputs drop the number spinner** — Histamine/Saline control fields switched from `type="number"` to `type="text" inputMode="decimal"`, so a bedside scroll can no longer accidentally increment a control baseline.

### Added
- **Colourblind-safe severity distribution** — the dashboard severity bar now carries `role="img"` with a synthesised text summary, distinct diagonal pattern fills per grade, and legend chips that print the grade numeral (I–IV) as text rather than relying on a colour dot alone.
- **Full keyboard navigation for the patient selector** — `PatientSelector` now supports ArrowUp/ArrowDown/Enter/Escape with `aria-activedescendant`, so the list is operable without a mouse (WCAG 2.1.1).
- **Validation errors jump to their field** — the save-time error summary renders each message as a link to the offending control (`visit-date`, `drug-filter`, `clinical-plan`); a single click focuses the field instead of a manual scroll-hunt.
- **Required-field validation on manual patient entry** — First Name, Last Name and MRN now block "Save & Close" with inline error text, preventing an unidentifiable clinical record.
- **Report tabs expose proper ARIA roles** — the Clinical Report / Handout / Letter tab bar now uses `role="tablist"`/`role="tab"` with `aria-selected`.

### Changed
- **Type scale corrected** — `h4` changed from `text-base font-bold` to `text-lg font-semibold`, removing the inverted weight-to-size relationship against `h3`.
- **Section labels and heading consistency** — ad-hoc `uppercase tracking-wide` label strings across the testing and patient screens consolidated onto the `.section-label` utility; the Assessment & Plan report heading now matches the other section headings (uppercase, tracking-wider, primary underline).
- **Narrative measure controlled** — long narrative blocks in `PowerchartLetter`, `PatientHandout` and `PatientHistory` are now constrained with `max-w-prose` for a readable line length.
- **`.app-wordmark` class** — the login wordmark's `tracking-widest` is now an isolated utility class, reserved so functional headings don't inherit logotype spacing.

### Notes
- All original audit findings (Workstream A UI/UX + Workstream B Typography) are addressed; the full report lives at `plans/dream-design-audit-2026-06-11.md`.
- 216 unit tests pass; typecheck and lint clean; production build green. The testing-day E2E selector was updated for the new report-tab role.

### Chore
- Version bump to 0.69.0

## [0.68.0] — 2026-06-10 (Polished)

Summary: Final pass of the audit cycle — completes the section decomposition, hoists the help modal to the app root so it's a true singleton, and raises the coverage floor.

### Fixed
- **Help modal is now a single instance** — `HelpModal` is rendered once at the app root rather than inside each screen's `ScreenLayout`. This permanently resolves the re-opening-on-navigation bug that required a sessionStorage band-aid in the previous patch; the band-aid is removed. The modal auto-opens at most once per page load regardless of screen navigation.

### Changed
- **`TestingLogFormSections.tsx` fully decomposed** — the 766-line barrel of section components is now 7 individual files (`ControlsSection`, `DrugTestPanelSection`, `DrugChallengeSection`, `DrugChallengeReactionFields`, `TryptaseSection`, `AssessmentPlanSection`, `NurseNotesSection`), each under 200 lines. `TestingLogFormSections.tsx` becomes a 7-line re-export barrel for backwards-compatible imports.
- **Coverage thresholds raised** — vitest thresholds for `src/features/testing/**` raised from the initial floor (statements 63 → 64, branches 64 → 64.1, functions 49 → 51, lines 63 → 68).

### Notes
- Closes the audit backlog. All original findings (Milestone 0–3 + outstanding items RI-1 through RI-3) are complete.
- 213 unit tests pass; Playwright smoke and testing-day E2E unchanged.

### Chore
- Version bump to 0.68.0

## [0.67.0] — 2026-06-10 (Decomposed)

Summary: Structural refactor pass from the audit backlog — breaks the `App.tsx` routing god-component and the monolithic testing form into focused units, and replaces the hand-rolled save-path coercion with a single Zod schema applied at both the save and restore boundaries. No user-facing behavior change.

### Changed
- **`App.tsx` decomposed into screen components** — the 572-line routing god-component is now a ~200-line switcher that delegates each screen to a named component under `src/core/screens/` (Log, Testing, Summary, Dashboard, Research, InfoPage). Provider wiring moved to `AppProviders`.
- **`TestingLogForm` split** — the 769-line form shell is now ~115 lines; its section markup lives in `TestingLogFormSections`, keeping the form container thin.
- **Single Zod schema for clinical record sanitization** — the ~50-line manual field-by-field coercion in `handleSubmit` is replaced by `parseLogFormData`/`safeParseLogFormData` in `logFormSchema.ts`. The same schema now sanitizes records on **both** save and localStorage restore, so a malformed stored draft or report is normalized identically wherever it re-enters React state. Legacy IDT field fallback and tryptase/nurse-note handling are preserved.

### Added
- **Schema unit tests** — `logFormSchema.test.ts` covers field coercion, legacy IDT fallback, malformed-input guards, and the safe-parse path.

### Notes
- This is a pure structural pass: the 213-test unit suite and the Chromium E2E flow (patient → panel → save → report, plus draft restore) pass unchanged as the regression guard.
- `.gitignore` PII rule narrowed from `data/` to `/data/` so it no longer shadows tracked source under `src/shared/data/`.

### Chore
- Version bump to 0.67.0

## [0.66.0] — 2026-06-10 (Hardened)

Summary: Safety-net pass from the repo audit — fixes a silent draft-restore data-loss bug, adds focused tests around the clinical record save path, tightens type safety in form handlers, and enforces test coverage in CI.

### Fixed
- **In-progress testing drafts now restore after a reload** — the restore guard checked `window.location.pathname === '/testing'`, which never matches in this single-path SPA, so autosaved drafts were written but never restored. Clinicians who reloaded or were auto-updated mid-session silently lost uncommitted work. The TTL window, plus draft-clearing on submit and reset, already guarantees a stored draft only represents live uncommitted work.

### Added
- **Unit tests for the clinical save path** — `useTestingState` (draft restore, debounced autosave, `handleSubmit` field sanitization, reset/clear) and `TestingService` (validation edge cases, skin-test positivity thresholds) are now covered to 100% statements.
- **Unit tests for `isTestingSessionDirty`** — the autosave gate is now fully covered, including malformed-input guards.
- **End-to-end draft-restore test** — a Playwright spec enters a control reading, reloads, and asserts the form state and patient are preserved.

### Changed
- **Stronger types in form handlers** — replaced `field as any` / `value: any` in `handleManualDetailChange`, `ChallengeSection.onChange`, and `PatientTable.updateFilter` with keyed union types derived from the domain models.
- **Hardened `isTestingSessionDirty`** — dirty-checks now coerce values defensively and guard array fields, so a malformed restored draft cannot throw.
- **CI runs tests with coverage** — the unit-test step now runs `test:coverage`, and `vitest.config.ts` enforces minimum coverage thresholds on `src/features/testing/**` so the save-path safety net cannot silently regress.

### Removed
- **Redundant outcome re-check in `handleSubmit`** — the saved `outcome` is already coerced to `SUCCESS | UNSUCCESS | null` during sanitization, so the follow-up guard was dead code.

### Notes
- Larger audit items (decomposing `App.tsx` routing, replacing the `handleSubmit` JSON round-trip with a Zod schema parse, splitting `TestingLogForm.tsx`) remain deferred to a later pass.

### Chore
- Version bump to 0.66.0

## [0.65.0] — 2026-06-09 (Tidy)

Summary: Project cleanup pass covering generated-file hygiene, dead dependency removal, safer tryptase restore handling, shared skin-test threshold logic, and leaner startup bundling.

### Changed
- **Generated test artifacts untracked** — Playwright reports and Vitest result JSON files are now ignored instead of living in source control.
- **Shared skin-test positivity threshold** — the 3 mm threshold now lives in one constant used by clinical result utilities, dashboard analytics, testing services, and research deidentification.
- **Safer tryptase state handling** — restored tryptase samples are normalized before re-entering React state, and tryptase form updates no longer rely on non-null assertions.
- **Lazy Sentry loading** — Sentry initializes after first paint and is dynamically imported only when configured, while web-vital and error-boundary capture still route through Sentry helpers.

### Removed
- **Unused hot-toast compatibility layer** — removed the dead `LegacyToaster` export and dropped the unused `react-hot-toast` package.
- **Stray backup file** — removed `components/ui/index.tsx.backup`.
- **Empty React vendor chunk** — removed the manual chunk entry that produced an empty `react-vendor` build artifact.

### Notes
- CSP enforcement remains out of scope for this pass.
- `next-themes` stays because it is used by the active sonner toast component.
- The drug masterlist remains eagerly loaded; deferring it would require async refactors across synchronous consumers for a small gzip gain.

### Chore
- Version bump to 0.65.0

## [0.64.0] — 2026-06-09 (Measured)

Summary: Diluent text now includes sourced reconstitution volumes for the skin-test request entries that need bedside preparation, while RTU saline entries stay plain.

### Changed
- **Reconstitution volumes in diluent text** — skin/control/experimental protocols for penicillins, cephalosporins, selected anaesthetic agents, PPIs, steroids, vancomycin, and related "Others" entries now include the specific preparation volume in the stacked SPT preparation sub-line.
- **Special preparations preserved explicitly** — penicillin determinant entries now name the 1 mL supplied phosphate-buffered diluent, oral PPI tablet entries say "dissolve in 1 mL", and mepivacaine records the 3% stock dilution volume.

### Notes
- Diluent values still require clinician sign-off before release. Residual confirm items: Cephalexin, Levofloxacin, Levonorgestrel, and insulin SPT preparation volumes; Methoxybenzylpenicillin, Cefuroxime Suspension, Methylene Blue, IV Contrast, and Atropine diluent values.

### Tests
- Updated masterlist diluent coverage for RTU saline, WFI reconstitution volume, saline reconstitution volume, and supplied-buffer preparations.

### Chore
- Version bump to 0.64.0

## [0.63.0] — 2026-06-09 (Stacked)

Summary: Testing request print tables fit again by stacking diluent under SPT preparation, while REDCap "not listed" items stay visibly marked through builder and print.

### Changed
- **Stacked SPT preparation/diluent cell** — the printed skin-test table is back to five columns; diluent now appears as a smaller sub-line under the neat/SPT preparation value so long requests do not overflow the page width.
- **Mobile request preview matches print** — mobile cards now show the same stacked SPT preparation and diluent text instead of a separate Diluent field.

### Added
- **Persistent REDCap provenance marker** — custom items added from REDCap "Others (not listed)" now keep an amber-accented "(not listed)" marker in the builder after the pending callout disappears.
- **Print-safe not-listed tag** — REDCap-origin custom items print with a bordered `not listed` tag beside the item name so the source remains visible on black-and-white clinic printers.

### Tests
- Extended testing-plan builder and print-view coverage for REDCap provenance markers and stacked diluent rendering.

### Chore
- Version bump to 0.63.0

## [0.62.0] — 2026-06-09 (Solvent)

Summary: Testing request forms now omit challenge protocols, show per-drug diluents, and preserve REDCap "Others (not listed)" requests as addable custom items.

### Added
- **Diluent column on testing requests** — the printed skin-test request table now includes a per-drug Diluent column beside SPT Preparation, and the mobile request preview shows the same information.
- **Per-drug diluent dataset** — skin/control/experimental protocols now carry sourced diluent values mined from `/Users/monchee/Projects/scratch/docs/drugs/*.md`; challenge-only protocols keep a blank diluent because the printed challenge section has been removed.
- **REDCap "Others (not listed)" callout** — the testing-plan builder now surfaces imported `testingPlanCustom` text as a read-only callout with one-click "Add as custom item" handling.

### Changed
- **Printed testing request simplified** — removed the "Challenge / Desensitisation Protocols" section from the printed request while leaving the challenge protocol data and live challenge workflow untouched.

### Fixed
- **Cis-atracurium auto-selection** — the testing-plan builder now matches reaction-history drugs tolerant of hyphen/space/case, so a reaction recorded as REDCap's "Cisatracurium" correctly preselects the canonical "Cis-atracurium" (previously it silently dropped on the reaction-history path).
- **Muscle-relaxant recognition** — `MUSCLE_RELAXANTS` aligned to the canonical "Cis-atracurium" spelling so a positive result is correctly treated as a muscle relaxant (MedicAlert / cross-sensitization logic).

### Notes
- Diluent values require clinician sign-off before release. Residual confirm items: Levofloxacin tablet preparation; Methoxybenzylpenicillin, Cefuroxime Suspension, Methylene Blue, IV Contrast, and Atropine diluent values.

### Tests
- Added coverage for REDCap Others callout/add flow, print-view Diluent column plus removed challenge section, representative masterlist diluent values, and regression tests for the Cis-atracurium spelling-tolerant matching and muscle-relaxant recognition.

### Chore
- Version bump to 0.62.0

## [0.61.0] — 2026-06-09 (Lucid)

Summary: Dashboard accessibility, consistency, and clarity pass — semantic headings, keyboard-operable tables, reduced-motion support, and clearer record stats.

### Added
- **Reduced-motion support** — the dashboard count-up numbers and chart/section animations now respect the OS "reduce motion" setting (`useCountUp` short-circuits to the final value; chart width transitions and section reveals are disabled).
- **Timeline legend** — the Record Database table now shows an induction / reaction / medication legend, and each timeline dot carries an accessible label.

### Changed
- **Records overview shows REDCap records and session logs separately** — the "Records" figure now reports the REDCap database count (matching the table below it) with current-session logs shown as a separate "+N this session" line, instead of silently summing the two.
- **Consistent headline rates** — severe and abandoned percentages now share one denominator (REDCap record count) so each count and its percentage line up.
- **Dashboard accessibility** — every dashboard card title is now a real `<h2>`; the Recent Testing Activity rows and Skin Test Breakdown category toggles are keyboard-operable (`aria-expanded`, focus rings); remaining tables gained `scope="col"` headers.
- **Polish** — "Onset" relabelled "Avg Onset" with an explanatory tooltip; normalized chip/header styling to the app's `rounded-none` language; the Skin Test Breakdown table scrolls cleanly on mobile.

### Removed
- **Dead code** — deleted the unused `GradeDistributionChart`, `TopAgentsChart`, and the entire dashboard `services/AnalyticsService` (~360 lines reimplemented inline).

### Tests
- New `useCountUp` reduced-motion test and updated Dashboard tests for the separated record/session figures (175 unit tests).

### Notes
- The session-log severity inference on the dashboard remains a heuristic, flagged in-code for clinician review (no behaviour change).

### Chore
- Version bump to 0.61.0

## [0.60.0] — 2026-06-08 (Trend)

Summary: The Reaction History card now shows every serum tryptase sample with its time and value, peak highlighted, instead of "N samples".

### Changed
- **Full serum tryptase results in Reaction History** — when more than one sample was taken, the card previously collapsed them to "3 samples" / "4 samples", hiding the clinically important trend. It now renders a dedicated **Serum Tryptase** table (Sample · Time · Result μg/L) listing every timed sample in order, with the peak value highlighted (bold + a "Peak" tag, legible in black & white). The header chip is reduced to a short "Tryptase: peak X μg/L" summary.

### Tests
- New `PatientHistory.test.tsx` covering multi-sample ordering, peak highlighting + chip summary, single-sample, non-numeric results, legacy free-text, and the no-data case.

### Chore
- Version bump to 0.60.0

## [0.59.0] — 2026-06-08 (Guarded)

Summary: Hardened the clinical record logic with tests, removed a duplicated cross-sensitization rule, and added a Content-Security-Policy.

### Added
- **Content-Security-Policy (report-only)** — `public/_headers` now ships a `Content-Security-Policy-Report-Only` allowlisting only the origins the app uses (Supabase REST/realtime, Sentry, Google Fonts). Shipped report-only first so any missed origin surfaces in the console before the policy is enforced in a follow-up.
- **`getCrossSensitizedDrugs` helper** — a single tested source of truth in `testingUtils.ts` for the Rocuronium↔Vecuronium cross-sensitization drug list.

### Changed
- **Removed duplicated cross-sensitization logic** — the three report components and the two text exporters re-derived the cross-sensitized drug list by string-matching note text; they now all call `getCrossSensitizedDrugs`. Behaviour is unchanged (same Roc-only→Vecuronium, Vec-only→Rocuronium output).
- **Dev-server CSP tightened** — the Vite dev server CSP now matches production for connect/style/img/font/object directives (`script-src` keeps `'unsafe-inline'`/`'unsafe-eval'` as Vite requires in dev).

### Fixed
- **Cleared all npm audit vulnerabilities** — `npm audit` now reports 0 (bumped the `serialize-javascript` override).

### Tests
- New `reportExporter.test.ts` covering the eMR/handout/letter generators (tryptase sentences, positives/negatives/challenge, cross-sensitization, the redact path, manual-entry letters, and edge inputs).
- New `csvUtils.test.ts` covering REDCap import (valid export, missing required columns, quoted/escaped fields, `(choice=…)` parsing, time formats, empty/header-only files).
- New `getCrossSensitizedDrugs` cases in `testingUtils.test.ts`.

### Chore
- Version bump to 0.59.0

## [0.58.0] — 2026-06-08 (Headline)

Summary: Quick Start release notes now use curated changelog summaries instead of the first bullet.

### Added
- **Curated Quick Start release summaries** — `CHANGELOG.md` now supports a `Summary:` line per release, and the generated `changelog.json` uses it for the Quick Start "What's New" modal instead of always taking the first changelog bullet.

### Fixed
- **Existing release summaries can be refreshed** — the changelog sync script still adds missing versions conservatively, but now updates an existing entry's `summary` when explicit `Summary:` metadata is added to the markdown source.

### Tests
- New `generateChangelog` unit coverage for plain and bold summary metadata, first-bullet fallback behavior, and existing-entry summary refreshes.

### Chore
- Version bump to 0.58.0

## [0.57.0] — 2026-06-08 (Legible)

Summary: Safer B&W report printing, corrected handout contact details, and consistent report typography.

### Fixed
- **Patient Handout clinic phone** — corrected the rendered/printed Patient Handout phone from (02) 9515 8814 to (02) 9515 7586. The text export was fixed in v0.51.0 but the on-screen/printed document was missed, so patients were given the wrong number.
- **Black & white print legibility of all three reports** (the clinic printer is B&W):
  - **Clinical Report** drug-challenge outcome now prints as a **solid black** badge + thick black left rule for POSITIVE (Reaction) vs an **outlined** badge for NEGATIVE (Safe) — previously distinguished only by red/green, which is invisible in greyscale (a safe vs reaction confusion risk).
  - **Patient Handout** "AVOID" now prints as a solid black badge with a thick black left rule, and "SAFE" as an outlined badge — previously red/green only, which rendered as near-identical grey.
  - Patient name, section headings, and "AVOID" directives now print in solid black instead of greying out.
- **Per-page patient identifier on every report** — a print-only running header (Name · MRN · DOB) and footer now repeat on every printed page so a physically separated page stays identifiable (new shared `ReportPrintIdentity` component).
- **Powerchart Letter pagination** — tightened trailing spacing and kept the signature block together so the letter no longer spills a near-empty second page.

### Changed
- **Reports visual consistency** — replaced `rounded-lg` with the app's `rounded-none`, unified raw slate surfaces to theme tokens for dark-mode coherence, re-levelled headings (document title h1→h2 so it sits correctly under the page h1), raised the Contact Information heading off sub-12px, and bumped the 7px print timestamp to 9px.
- **Back button touch target** raised to 44px.

### Tests
- New `ReportsPrintSafety` unit tests covering the corrected phone, per-page print identity + heading levels, the B&W challenge and AVOID/SAFE badges, and blank-SPT formatting.

### Chore
- Version bump to 0.57.0

## [0.56.0] — 2026-06-08 (Composer)

### Added
- **Testing plan: protocol selection** — for drugs with more than one skin-test protocol/presentation, the builder now shows a "Protocol Choices" picker so the clinician chooses which protocol goes onto the request. Previously `selectedProtocols` was always empty, so the document, email export, and testing session silently used the first protocol with no way to choose.
- **Testing plan: draft autosave** — the builder's selections (drugs, protocol choices, custom drugs, notes, urgency, documents) are now saved per patient and restored if you leave and return to the LOG screen, under the same 6-hour TTL purge as other patient data. Previously navigating away discarded the whole plan.
- **Testing plan: duplicate-drug guard** — adding a custom drug that already exists in the master list (or in Additional Items) now selects the existing entry and explains why, instead of creating a confusing duplicate on the request.

### Fixed
- **HelpModal no longer hijacks navigation** — opening the app directly on `/dashboard` or `/research` (or auto-opening Quick Start) no longer forces the user back to the Home/LOG screen.
- **`/research` direct route** — loading `/research` now resolves to the Research screen (it was missing from the route map).
- **Grade III severity colour** — dashboard charts now use the shared `status-grade3` token instead of raw red/orange, so severity colours are consistent and contrast-checked.
- **Patient Handout dark-mode contrast** — "AVOID"/"SAFE" drug-name text now has explicit dark-mode colours so it stays legible.

### Changed
- **Testing plan builder UX** — opens by default when a patient is selected; shows a live "N drugs selected" count in the header; "Clear All" now asks for confirmation (and is disabled when empty).
- **Mobile navigation** — the active section now shows its label (not icon-only) and nav controls keep a ≥44px touch target.
- **Research empty state** — clearer "not configured" messaging with explicit status lines (research database / demo mode) and the setup link.

### Accessibility
- Drug toggle buttons expose `aria-pressed`; the custom-drug remove control is now a real, separately focusable button; the reaction-date field caps at today; Pin/History legend icons have tooltips.
- Stronger, consistent `focus-visible` rings across buttons, inputs, and other primitives; closed dialogs no longer capture pointer events; mobile patient cards are keyboard-activatable.

### Tests
- New unit coverage for the testing plan builder and app navigation; new UX-remediation e2e spec.

### Chore
- Version bump to 0.56.0

## [0.55.0] — 2026-06-07 (Carbon)

### Added
- **Per-page patient identifier on the printed Testing Plan** — the testing plan document now repeats a running header (Name · MRN · DOB) and footer (Name · MRN · date of request) on every printed page, so a page that becomes physically separated is still identifiable. Closes a patient-safety gap where page 2 onward carried no patient details.

### Fixed
- **Black & white printer legibility of the Testing Plan document** — the clinic printer is B&W, so elements that relied on colour now survive greyscale: the URGENT banner prints as a solid black bar, "Documents to Chase" badges print as black-outlined chips, the patient name and section/category headings print in black, and all fill-in-the-blank result lines print in solid black instead of faint grey
- **Testing Plan document heading order** — re-levelled headings (h2 → h3 → h4) so the page no longer skips levels or emits a second h1; added `scope="col"` to the skin-test and challenge tables (WCAG)
- **Sub-12px on-screen text** — the protocol-variant label in the skin-test table was 8px on screen; raised to 12px (A4 print density unchanged)

### Style
- **Testing Plan document visual consistency** — replaced `rounded-lg` corners with the app's sharp `rounded-none`, unified raw slate surfaces to theme tokens for dark-mode coherence, and switched the "Print Now" button to the standard primary variant

### Chore
- Version bump to 0.55.0

## [0.54.0] — 2026-06-07

### Style
- **Visual polish: Testing Plan / Request Form card** — unified raw slate surface tokens to theme tokens (`bg-muted`, `bg-muted/30`) for dark-mode coherence; removed phantom hover background from non-interactive section wrappers; replaced native `<input type="checkbox">` with shadcn `Checkbox` for "Include in drug challenge"; lightened CTA button shadow
- **Visual polish: Reaction History card** — fixed timeline dead space, de-noised nested panels, flattened Clinical Features highlights to label/value rows with left-border accent, fixed sub-12px text on symptom chips and metadata, unified surface tokens for dark mode

### Fixed
- **PWA update loop resolved** — removed `clientsClaim` from the workbox service-worker config, which caused an infinite reload cycle on live deployments after a worker update; the Reload Now toast now applies the update cleanly without looping
- **Service-worker update toast** — converted the `showToast.update` call in `index.tsx` to a static import to eliminate the dynamic-import overhead that could delay the update notification
- **PatientTable keyboard navigation** — removed misused `role="button"` from `<tr>` elements; patient rows now use a semantic `<button>` inside the name cell, restoring correct tab order and keyboard activation

### Improved
- **Privacy Policy and Technical Docs** — updated "local-only" framing to "local-first" to accurately reflect that optional research database submissions send only the deidentified research payload to the configured Supabase project; no identifiable patient data is transmitted

### Chore
- E2E test selectors updated for patient combobox UI
- README dev-server port and storage description updated
- Version bump to 0.54.0

## [0.51.1] — 2026-06-04

### Fixed
- **Changelog page was 3 releases behind** — the Quick Start "What's New" banner and the Changelog page read from `changelog.json`, which had drifted to v0.50.2; backfilled v0.50.3, v0.50.4, and v0.51.0 so both now show the current release
- **Multiple "Latest" badges** — the Changelog page tagged every highlighted version as "Latest" (four at once); now only the newest release carries the badge and emphasis styling
- **Quick Start version banner key** — fixed a corrupted localStorage key that tracked the last-seen version

### Added
- **Release dates on the Changelog page** — each version now shows its date next to the version number
- **Automatic changelog sync** — a `prebuild` script regenerates `changelog.json` from `CHANGELOG.md` before every build, so the in-app changelog can no longer fall behind

### Chore
- Version bump to 0.51.1

## [0.51.0] — 2026-06-04

### Fixed
- **Tryptase line always present in eMR letter** — the tryptase sentence now always appears in the PowerChart letter even when no tryptase data was entered in the form; defaults to "Serial serum tryptase samples were not obtained." so one of the three standardised sentences is always present
- **PowerChart paste encoding** — replaced em dashes (`—`) with ASCII-safe separators in the copied eMR letter text; results now paste cleanly into PowerChart and other legacy clinical systems without garbled characters
- **REDCap testing plan: Cis-atracurium** — fixed drug-name mismatch (`Cisatracurium` → `Cis-atracurium`) that caused Cis-atracurium to appear in the testing plan without its IDT protocol steps
- **Patient Handout phone number** — corrected clinic phone in the Patient Handout text export from (02) 9515 8814 to (02) 9515 7586

### Added
- **Referrer email in eMR letter** — if a referring doctor email address is present in the REDCap data, it now appears at the bottom of the PowerChart letter (both the rendered view and the copied text), making it easier to send correspondence directly from the report
- **REDCap testing plan: Sugammadex** — Sugammadex now auto-selects both Alone and + Rocuronium variants when checked in the REDCap testing plan instrument
- **REDCap testing plan: Parecoxib** — Parecoxib now recognised in the REDCap testing plan instrument

### Chore
- Version bump to 0.51.0

## [0.50.4] — 2026-05-14

### Fixed
- **Nav button transitions** — replaced `transition-all` with specific GPU-composited properties on nav pill buttons and menu trigger (missed in the 0.50.3 CSS utility class pass)

### Chore
- Version bump to 0.50.4

## [0.50.3] — 2026-05-14

### Fixed
- **Nav touch targets** — primary nav buttons and menu trigger increased from 36px (`h-9`) to 44px (`h-11`) to meet WCAG 2.5.5 minimum
- **Disclaimer dismiss button** — added `min-h-[44px] min-w-[44px]` to meet touch target requirements; upload link gets `min-h-[24px]`
- **Research page error state** — replaced raw `TypeError: Failed to fetch` with friendly state that detects unconfigured Supabase and shows contextual message
- **section-label font size** — raised from 10px to 11px (above 10px absolute minimum for readable UI text)
- **Select All/None buttons** — text size increased from 10px to 12px for legibility
- **Subtitle text size** — unified to `text-xs` (12px) for all viewports, removing 10px mobile-only sizing
- **Drug category heading semantics** — replaced `<h3>` with `<p>` for label-styled category headers (semantic/size mismatch)

### Changed
- **Transition performance** — replaced `transition-all` with specific GPU-composited properties (`color, background-color, border-color, transform, opacity, box-shadow`) across 5 utility classes
- **Dark mode color-scheme** — ThemeProvider now sets `root.style.colorScheme` so browser-native UI elements (scrollbars, inputs, date pickers) respect dark mode

### Chore
- Version bump to 0.50.3

## [0.50.2] — 2026-05-09

### Changed
- **PWA update notification** — replaced gradient purple DOM overlay (30s auto-dismiss) with persistent Sonner toast (duration: Infinity, close button, Reload now action).
- **Gate auto-update** — when Screen Lock gate is showing, new SW activates silently (no prompt, no work to lose).
- **Visibility-change polling** — registration.update() fires on visibilitychange for faster catch-up after tab is backgrounded.
- **registerType** — renamed from autoUpdate to prompt for accuracy.

### Chore
- Version bump to 0.50.2

## [0.50.1] — 2026-05-09

### Fixed
- **PIN session persistence** — unlock state now survives page reload via sessionStorage; deep-link redirects preserve original route
- **Dark mode header** — header bar now uses `bg-primary` theme token; no more light-blue residue in dark mode
- **Patient dropdown overflow** — popover capped at `max-h-80` with overflow scroll for 44+ patient lists
- **Mobile nav accessibility** — all icon-only nav buttons now carry `aria-label` attributes
- **Quick Start dialog** — added `DialogDescription` for proper `aria-describedby`; removed empty trailing parenthetical `()` in changelog header
- **Contact page** — email addresses are now clickable `mailto:` links with visible focus rings

### Changed
- **PIN gate copy** — reworded to "Screen Lock" with footnoted disclaimer clarifying it prevents shoulder-surfing; patient data security is governed by database access controls

### Chore
- Version bump to 0.50.1
## [0.50.0] — 2026-05-06

### Added
- **Print pagination** — CSS page-break rules prevent orphaned headings and split drug entries across pages in all three report types
- **Report generation timestamps** — footer on Clinical Report, PowerChart Letter, and Patient Handout shows when the report was saved (uses activeReportSavedAt)
- **Redacted view toggle** — new EyeOff button in the report tab bar replaces patient identifiers with ——- for demos and training; ephemeral (not persisted, print always shows full data)
- **Redact context provider** — useRedact.tsx hook provides isRedacted, toggleRedact, and redact() across all report components and text exports
- **Controls empty state** — Clinical Report shows No controls recorded when all control values are empty
- **Unit tests for testingUtils** — covers isSkinTestPositive, getPositiveResults, getNegativeResults, getCrossSensitizationNotes, buildRecommendations
- **Unit tests for deidentify** — 15 test cases covering name stripping, REDCap passthrough, challenge handling, legacy IDT fields, custom drug names

### Changed
- **ResearchDrugResult type** — idt_100, idt_10, idt_neat consolidated to single idt_results string field
- **ResearchDashboard** — IDT columns consolidated to match new type
- **testingDataFactory** — added missing selectedProtocols to TestingPlanData factory
- **Print headers** — section-card wrappers added to all major report sections

### Fixed
- **Flaky SPT input test** — simplified assertion from waitFor + toHaveValue to direct .value check after fireEvent.change

## [0.49.0] — 2026-05-06 (Pancuronium)

### Added
- **Tryptase paragraph in eMR letter** — new Tryptase section in the testing form captures whether samples were obtained, whether there was clinically significant dynamic elevation, and up to 4 timed sample values; renders as one of three standardised sentences in the PowerChart letter
- **Roc/Vec cross-sensitization** — if Rocuronium tests positive, a cross-sensitization note for Vecuronium is automatically added to both reports (and vice versa); cross-sensitized drug also appears in the AVOID list
- **Restructured Recommendations** — eMR letter and clinical report now lead with `AVOID [DRUG]` in bold for each positive result, followed by standardised bullets (updated eMR allergy, GP/MyHealth Record, MedicAlert for muscle relaxants, patient copy of letter); all-negative records show "No evidence of IgE-mediated allergy to medications tested."
- **Nursing Notes section** — collapsible blue card in the testing form for pre-testing, during, and post-testing observations plus nurse sign-off; renders in the clinical report only (excluded from the eMR PowerChart letter)
- **IV drug challenge in eMR letter** — challenge outcome (tolerated / reaction with details) now appears as a dedicated "Drug Challenge" block in the PowerChart letter
- **REDCap testing-plan parity** — app now reads the explicit testing-plan instrument checkboxes from the REDCap CSV and uses them as the source of truth for auto-selecting drugs; falls back to reaction-drug inference when not present; includes documents-to-chase parsing
- **6-hour report retention** — active report is persisted to localStorage with a 6-hour TTL; a banner on the log screen shows the active report with Open/Clear actions; "Exit" no longer clears the report

### Changed
- **eMR letter simplified** — removed SPT/IDT measurement table; eMR letter now lists drug names only (measurements stay in the full clinical report)
- **Patient handout** — AVOID list now includes cross-sensitized drugs with a "cross-sensitization risk" note

## [0.48.0] — 2025-05-16 (Atracurium)

### Fixed
- **Phone number** — updated contact number to (02) 9515 7586
- **Parecoxib IDT** — removed 1:1,000 dilution step from skin testing protocol
- **Propofol consolidation** — collapsed from two protocols to single IV protocol; removed IDT 1:100 step
- **Sugammadex multi-protocol selection** — Sugammadex Alone and +Rocuronium can now be selected simultaneously without deselecting each other
- **Print headers/footers** — suppressed browser-generated headers (URL, date, page numbers) in Chrome/Edge via `@page { margin: 0 }` with compensating body padding
- **Empty result fields** — changed input type from `number` to `text` with `inputMode="decimal"` so the "-" placeholder displays correctly on all browsers

### Added
- **Drug persistence from testing plan** — drugs selected in the testing plan now carry over to the testing panel when proceeding, pre-populating the test grid
- **`toggleDrugProtocol`** — new hook function allowing per-protocol drug toggling for multi-variant drugs

## [0.47.0] — 2026-05-14 (Neostigmine)

### Fixed
- **Toast notifications** — removed rounded corners from toast notifications for consistent clinical aesthetic
- **Print background** — forced pure white background in print view via CSS variable override
- **Print section headers** — removed gray backgrounds from section headers in print view
- **Signature lines** — signature fields now use bottom border with writing space above

## [0.46.0] — 2026-03-26 (Neostigmine)

### Added
- **Multi-sample tryptase model** — REDCap CSV now parses up to 4 timed tryptase samples (`Serum Tryptase Time/Result` × 4) per patient; clinic investigation fallback (`Biochemical Results: Tryptase 1–4`) also supported
- **Tryptase display with timestamps** — patient history card shows `T1 (08:45): 12 ng/mL · T2 (10:30): 45 ng/mL` for multi-sample data; single-string values from mock data display unchanged
- **Audit export updated** — `Tryptase` column in de-identified CSV serialises all samples as semicolon-separated entries

## [0.45.0] — 2026-03-26 (Suxamethonium-B)

### Added
- **Mock testing session logs** — 12 clinically realistic `LogFormData` records seeded on first load; powers "Recent Skin Testing Activity" in the Clinical Dashboard for demo
- **Mock patient coverage test** — 9 machine-checkable Vitest assertions guard NMBA / antibiotic / NSAID / Grade I–IV / Completed / Chlorhexidine+Latex coverage in `MOCK_PATIENTS`
- **NSAID mock patient** — Natalie Brennan (Aspirin/Celecoxib, Grade II, MRN 44) added to fill coverage gap
- **E2E testing day flow** — Playwright spec covering full hero workflow: patient select → drug grid → save → Clinical Report → print → Dashboard → Recent Testing Activity

---

## [0.44.0] — 2026-03-25 (Suxamethonium)

### Added
- **Drug protocol library** (`drugMasterlist.ts`) — SPT concentration, IDT dilution steps, and challenge flags for all 70+ supported drugs
- **Dynamic IDT columns** — testing grid columns driven by per-drug protocol (replaces hardcoded idt100/10/Neat columns)
- **Multi-variant protocol picker** — drugs with multiple protocols (e.g. Penicillin Major/Minor) show a variant selector
- **Custom protocol editor** — users can override SPT concentration, IDT dilution steps, and challenge flag per drug per session
- **Drug search/filter** — filter field in testing form and plan generator
- **Proton Pump Inhibitors category** — Esomeprazole, Lansoprazole, Omeprazole, Pantoprazole added to drug list

### Changed
- Reports updated with dynamic IDT result display + legacy fallback for older records

---

## [0.43.0] — 2026-03-23 (Rapacuronium)

### Added
- **Skeleton loaders** — PatientTable shows 10-row shimmer skeleton (desktop) / 5-card shimmer (mobile) while mock data loads asynchronously on first render
- **Context-aware empty states** — PatientTable now distinguishes between "no data loaded" (Upload icon + CTA) and "no filter matches" (italic hint), instead of a single generic message
- **Research shimmer** — ResearchDashboard replaces spinning icon with 4 shimmer bars during Supabase fetch
- **Export SkeletonText / SkeletonCard** from `components/ui/index.tsx`

### Changed
- `isLoadingPatients` flag threaded from `usePatientState` → `useAnaestheticApp` → `App.tsx` → `Dashboard` → `PatientTable`

---

## [0.42.0] — 2026-03-22 (Pancuronium)

### Changed
- **Bundle optimisation** — mock patient data lazy-loaded as a separate on-demand chunk (~44 kB removed from initial load); `react-hot-toast` removed from `notifications` manualChunks (stale entry)
- `requestAnimationFrame` replaces `setTimeout(50ms)` for chart animation trigger in Dashboard

---

## [0.41.0] — 2026-03-22 (Orocuronium)

### Added
- **Sonner toasts** — migrated all notifications from `react-hot-toast` to shadcn Sonner (`<Toaster />` already mounted); toast calls in Dashboard, ScreenLayout, HelpModal, and ResearchDashboard now use `title` + `description` API
- Save success toast after test record submission
- Delete feedback toasts in ResearchDashboard (success + error with detail)

### Fixed
- Silent broken toasts — `react-hot-toast` had no `<Toaster>` mounted; all CSV upload and save messages were swallowed

---

## [0.40.0] — 2026-03-21 (Neostigmine)

### Added
- **Required field indicators** (`*`) on Visit Date and "Select Drugs to Test" labels
- **Inline validation error summary** (role="alert") above submit button in TestingLogForm
- **Submit spinner** (Loader2) on save button while submitting
- **"Other" drug row validation** — custom name must be specified before saving

### Fixed
- `aria-label` replaces `title` on lucide Pin and History icons (TS prop error)
- Missing required fields in `testingDataFactory.ts` (`urgent`, `reactionDate`, `documentsToChase`)

---

## [0.39.0] — 2026-03-21 (Mivacuronium)

### Fixed
- ESLint error: removed unused `Plus` import from `App.tsx`
- ESLint: added `coverage/` to ignores to prevent false unused-directive errors
- TS: created missing `hooks/use-mobile.ts` (standard shadcn `useIsMobile`)
- TS: fixed `AdvancedSearchFilters` import alias in `PatientTable.tsx`
- TS: tightened `suggestions` type in `PatientTableProps` to explicit object shape
- TS: replaced `title=` with `aria-label=` on lucide icons in `TestingPlanGenerator.tsx`

---

## [0.38.0] — 2026-03-20 (Laudanosine)

### Added
- Lazy-loaded 7 feature modules (Dashboard, TestingLogForm, ClinicalReport, PatientHandout, PowerchartLetter, TestingPlanPrintView, ResearchDashboard) — initial bundle reduced by ~114 kB

### Changed
- Complete `src/` migration; all root shim directories deleted
