# Changelog

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
