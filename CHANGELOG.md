# Changelog

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
