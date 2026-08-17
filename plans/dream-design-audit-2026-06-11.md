# DREAM Design Audit — 2026-06-11

**App:** Drug Reaction Evaluation & Anaesthetic Management  
**Environment:** RPAH Department of Clinical Immunology & Allergy  
**Auditor:** Role & Context audit (parallel Workstream A UI/UX + Workstream B Typography + Verification pass)  
**Tech stack:** React 19, Tailwind CSS 3.4.19, shadcn/ui (new-york), Public Sans, HSL CSS variables

---

## Executive Summary

DREAM has a well-architected design system — CSS variables are used consistently, dark mode overrides exist at scale, print styles are broadly correct, and grade status colours are properly tokenised. **Workstream A** surfaces three safety-relevant gaps: grade indicators on the Analytics stacked bar rely on colour alone (colourblind risk), the active-report banner exposes a patient's full name outside the redaction system, and the wheal-size result inputs in DrugTestGrid are missing `tabular-nums`, creating a real risk of column-misread at the critical 3 mm positive/negative threshold. **Workstream B** finds three Critical issues: the Assessment & Plan textarea becomes invisible in dark mode due to hardcoded colour tokens, the print stylesheet does not force headings to black (so NSW Health Blue washes out on ward photocopiers), and wheal-size inputs lack `font-mono tabular-nums` on their base class (confirming Workstream A). The design is close to clinical-use ready but is **not safe to ship in a live patient session until the three Critical findings — T-2/5A, 8B, and 9A — and the four priority-safety Majors (D-1, PP-2, 8A, L-1) are resolved.**

---

## Workstream A: UI/UX Findings

### Dashboard

---

**A-D-1**
```
Location: /Users/monchee/Projects/dream/src/features/dashboard/components/AnalyticsPanel.tsx:163–184
Severity: Major
Observation: The Severity Distribution legend uses colour-filled circles (w-2.5 h-2.5 rounded-full) with Roman numeral labels only ("I:", "II:", "III:", "IV:") and no clinical description text.
Impact: A nurse unfamiliar with the grading convention, or a colourblind clinician under deuteranopia simulation, cannot determine severity meaning from the legend alone, increasing misinterpretation risk in a triage context.
Recommendation: Append brief clinical descriptions to each legend item — e.g. change "I:" to "I – Cutaneous", "II – Mild Systemic", "III – Severe Systemic", "IV – Cardiac Arrest" — and add a short text label inside or alongside each coloured dot as a secondary indicator.
```

---

**A-D-2**
```
Location: /Users/monchee/Projects/dream/src/features/dashboard/components/AnalyticsPanel.tsx:120–161
Severity: Major
Observation: The stacked bar chart segments (bg-status-grade1 through bg-status-grade4) use colour as the sole encoding; there is no role="img", no aria-describedby, and no pattern fills.
Impact: Under protanopia/deuteranopia, grade1 (emerald-green) and grade4 (rose-red) can be conflated, and the proportional distribution of the most clinically significant grades becomes unreadable.
Recommendation: Add role="img" and aria-label="Severity distribution: Grade I {n}%, Grade II {n}%…" (computed from props) to the stacked bar container div, and add distinguishing CSS background-image repeating-linear-gradient patterns (e.g. diagonal stripes at different densities) to each segment so grades are separable without colour.
```

---

**A-D-3**
```
Location: /Users/monchee/Projects/dream/src/features/dashboard/components/PatientTable.tsx:201
Severity: Minor
Observation: The date column uses font-mono text-xs without tabular-nums, meaning digit widths vary on monospace fallback fonts.
Impact: Dates in a sorted table appear ragged and misaligned, slowing visual scanning and increasing the chance a clinician misreads year/month boundaries.
Recommendation: Add tabular-nums to the date <td> className alongside font-mono at line 201.
```

---

**A-D-4**
```
Location: /Users/monchee/Projects/dream/src/features/dashboard/components/PatientTable.tsx:123–130
Severity: Minor
Observation: The Upload CSV button uses hardcoded bg-red-600 hover:bg-red-700 text-white, visually reading as a destructive/danger action.
Impact: Red conventionally signals irreversibility; a nurse may hesitate before clicking a routine data-import control styled as a destructive action, adding unnecessary friction at session start.
Recommendation: Change the Upload CSV button to variant="default" (NSW Health blue) to reserve red for genuinely destructive or irreversible actions.
```

---

**A-D-5**
```
Location: /Users/monchee/Projects/dream/src/features/dashboard/components/RecentTestingActivity.tsx:26
Severity: Minor
Observation: The card uses hardcoded border-t-green-500 with no dark-mode override and no semantic token equivalent.
Impact: The hardcoded class makes systematic dark-mode auditing harder and risks visual regressions if the theme is adjusted.
Recommendation: Replace border-t-green-500 with border-t-status-grade1 (the semantic token already mapped to emerald-600 light / 65% green dark).
```

---

**A-D-6**
```
Location: /Users/monchee/Projects/dream/src/features/dashboard/components/AnalyticsPanel.tsx:42–43 and Dashboard.tsx:58–62
Severity: Polish
Observation: The setAnimateCharts(true) call via requestAnimationFrame runs before the prefersReducedMotion flag is confirmed as false in the same useEffect cycle.
Impact: Under prefers-reduced-motion: reduce, the bar width transition may fire for one frame before being disabled, violating WCAG 2.3.3 for vestibular-sensitive users.
Recommendation: Move the prefersReducedMotion check outside the animation useEffect so it is evaluated before requestAnimationFrame is scheduled, and gate setAnimateCharts(true) on !prefersReducedMotion.
```

---

### Log (Patient Selection Screen)

---

**A-L-1**
```
Location: /Users/monchee/Projects/dream/src/core/screens/LogScreen.tsx:87–99
Severity: Major
Observation: The "Active report" banner renders lastSavedRecord.firstName + lastName in plain text, outside any RedactProvider context.
Impact: On a shared clinical workstation the previous patient's full name is visible to the next patient walking up to the terminal before the clinician has chosen to redact, constituting inadvertent PHI disclosure.
Recommendation: Move the banner inside a RedactProvider wrapper and apply the redact() utility to the patient name display, or replace the full name with initials only (e.g. "{lastSavedRecord.firstName[0]}. {lastSavedRecord.lastName}") which cannot be read as an identifier.
```

---

**A-L-2**
```
Location: /Users/monchee/Projects/dream/src/features/patients/components/PatientSelector.tsx:91–108
Severity: Major
Observation: The PatientSelector is built as a custom div-based listbox with role="listbox" and role="option" children, but has no ArrowUp/ArrowDown key handler, no aria-activedescendant management, and no Escape-to-close handler.
Impact: Keyboard-only users cannot operate the patient selector, violating WCAG 2.1 SC 2.1.1; this affects users of screen magnifiers and keyboard navigators common in clinical populations.
Recommendation: Replace the custom listbox with the shadcn Combobox or Radix Select primitive (which provides full keyboard navigation out of the box), or implement the ARIA listbox pattern: ArrowUp/Down moves aria-activedescendant, Enter selects, Escape closes.
```

---

**A-L-3**
```
Location: /Users/monchee/Projects/dream/src/core/screens/LogScreen.tsx:248–280 (manual patient entry dialog)
Severity: Minor
Observation: The manual patient entry dialog accepts empty values for First Name, Last Name, and MRN without validation, and closes on "Save & Close" regardless.
Impact: A clinician may proceed to testing with a blank identity record, producing a medico-legally invalid clinical record that cannot be associated with any patient.
Recommendation: Add required validation on "Save & Close" click: check that firstName, lastName, and mrn are non-empty; show inline error text (text-destructive text-xs mt-1) beneath each empty required field and prevent dialog close until they are populated.
```

---

### Testing (Clinical Test Entry)

---

**A-T-1**
```
Location: /Users/monchee/Projects/dream/src/features/testing/components/SaveActionSection.tsx:14–26
Severity: Major
Observation: The validation error summary renders as a banner immediately above the Save button; the validationErrors array contains plain strings with no field reference, so there is no way to render a jump-link to the offending control.
Impact: When validation fires after a save attempt, errors like "Visit date is required" appear at the bottom of a long form while the offending field is hundreds of pixels above the viewport; the clinician must manually hunt the error during a live testing session.
Recommendation: (1) Add id attributes to key required fields (e.g. id="visit-date" on the VisitDetailsSection Input at VisitDetailsSection.tsx:22); (2) refactor the validationErrors type from string[] to { message: string; fieldId: string }[] in SaveActionSectionProps and propagate from TestingLogForm.tsx validation logic; (3) render each error as <li><a href="#{error.fieldId}" className="underline">{error.message}</a></li> so a single click focuses the offending control.
```

---

**A-T-2** *(merged with Typography finding 5A; Critical severity retained)*
```
Location: /Users/monchee/Projects/dream/src/features/testing/components/DrugTestGrid.tsx:183, 204, 222
Severity: Critical
Observation: SPT and IDT result Input fields have neither font-mono nor tabular-nums on their base className; font-mono only applies conditionally when a result is positive (inside the red-styling conditional string).
Impact: During a live skin test, a nurse typing wheal measurements across a 3–5 column grid sees proportional-width numerals — "1" occupies a different column width than "10" — causing values to appear misaligned, increasing the risk of a transcription error between IDT dilution columns at the 3 mm positive/negative threshold.
Recommendation: Add font-mono tabular-nums to the base Input className at lines 183, 204, and 222 in DrugTestGrid.tsx, unconditional of the result value.
```

---

**A-T-3**
```
Location: /Users/monchee/Projects/dream/src/features/testing/components/DrugTestPanelSection.tsx:173–179
Severity: Minor
Observation: Reference Controls inputs (Histamine SPT, Saline SPT, Saline IDT) use type="number", which on mobile Safari and Chrome iOS renders increment/decrement spinner arrows that can accidentally change mm values during form scrolling.
Impact: A nurse on a tablet may inadvertently increment the Histamine SPT control value while scrolling, corrupting the baseline used to interpret all skin test results on this record.
Recommendation: Change the Reference Controls inputs to type="text" inputMode="decimal" pattern="[0-9]*" with onKeyDown={preventNegativeInput}, matching the pattern already used in DrugTestGrid.tsx lines 185 and 206.
```

---

**A-T-4**
```
Location: /Users/monchee/Projects/dream/src/features/testing/components/AssessmentPlanSection.tsx:27 and AssessmentSection.tsx:17
Severity: Major
Observation: Both Assessment textarea implementations use hardcoded bg-white, border-slate-200, ring-offset-white, and focus-visible:ring-slate-950 instead of semantic CSS variables (confirmed duplicate of Typography finding 8B — see that finding for full description and recommendation).
Impact: In dark mode the textarea renders with a white background and near-white text, making clinical notes entered in dark mode invisible or unreadable — a direct patient safety risk.
Recommendation: See finding B-8B: replace all hardcoded slate/white tokens with bg-background, border-border, text-foreground, placeholder:text-muted-foreground, focus-visible:ring-ring, ring-offset-background, and explicitly add text-foreground to the textarea className.
```

---

**A-T-5**
```
Location: /Users/monchee/Projects/dream/src/features/testing/components/TryptaseSection.tsx:39–43, 62
Severity: Minor
Observation: Both toggle switches use rounded-full (pill shape) while the design system mandates rounded-none everywhere (--radius: 0).
Impact: The shape inconsistency reduces perceived visual coherence; interface familiarity under clinical time pressure reduces cognitive load.
Recommendation: Remove rounded-full from both toggle classNames (lines 38 and 62), keeping the red active-state on the "significant elevation" toggle which is semantically appropriate.
```

---

### Summary (Report View)

---

**A-S-1**
```
Location: /Users/monchee/Projects/dream/src/core/screens/SummaryScreen.tsx:109–120
Severity: Minor
Observation: The report tab bar uses <button> elements with no role="tablist", role="tab", aria-selected, or tabpanel association.
Impact: Screen readers announce the three controls as plain buttons; keyboard users cannot use ← / → arrow keys to navigate tabs as required by the ARIA tab pattern.
Recommendation: Add role="tablist" to the wrapping <div>, role="tab" and aria-selected={activeReportTab === key} to each button, and wrap each report component in <div role="tabpanel" aria-labelledby={key}>.
```

---

**A-S-2**
```
Location: /Users/monchee/Projects/dream/src/core/screens/SummaryScreen.tsx:130–139
Severity: Minor
Observation: The Print / Copy as Text / Email action buttons are arranged in a fixed grid-cols-3 with no mobile stack, making each button approximately 117px wide on a 375px viewport.
Impact: On small-screen devices with gloved users, "Email" is adjacent to "Copy as Text" — the latter silently copies PHI to clipboard rather than sending it, potentially leaving patient data in an unsecured clipboard on a shared device.
Recommendation: Change the action grid to grid-cols-1 sm:grid-cols-3 so buttons stack vertically at full width on mobile viewports.
```

---

**A-S-3**
```
Location: /Users/monchee/Projects/dream/src/features/reports/components/ClinicalReport.tsx:172–184
Severity: Minor
Observation: The "NEGATIVE (Safe)" challenge outcome badge uses bg-transparent for its print state, which renders identically to an unrecorded challenge on a B&W printout.
Impact: A printed report passed to an anaesthetist may fail to distinguish "challenge negative" from an unrecorded challenge, since the transparent background badge loses all colour information on paper.
Recommendation: Add print:bg-black print:text-white print:border-black to the negative/NEGATIVE outcome badge to give it a filled B&W style matching the POSITIVE badge treatment at line 181.
```

---

### Print Plan

---

**A-PP-1**
```
Location: /Users/monchee/Projects/dream/src/features/testing/components/TestingPlanPrintView.tsx:179, 220, 230, 272, 282, 346
Severity: Major
Observation: Fill-in line spans use hardcoded border-gray-400 with no dark:border-* override on all six instances.
Impact: In dark mode, border-gray-400 (#9ca3af) against the dark card background (#242424) achieves approximately 3.5:1 contrast — below WCAG AA 4.5:1 — making fill-in lines barely visible when previewing the plan on screen before printing.
Recommendation: Add dark:border-gray-500 (or dark:border-border) to all six border-gray-400 span instances; the dark: override is needed on all six regardless of whether they also carry print:border-black, since dark mode and print mode are orthogonal.
```

---

**A-PP-2**
```
Location: /Users/monchee/Projects/dream/src/features/testing/components/TestingPlanPrintView.tsx:41–49 and /Users/monchee/Projects/dream/index.css:198–202
Severity: Major
Observation: The print-only running header and footer use print:fixed print:top-0 / print:bottom-0, but @page { margin: 0 } is set in index.css with content margins applied via body { padding: 20mm 15mm 16mm }, creating a conflict where fixed-position elements overlap the body padding zone.
Impact: On A4 output the patient name in the running header may overlap the document title or the top row of the drug testing table, creating an illegible document handed to the nurse.
Recommendation: Remove print:fixed from both the header and footer divs in TestingPlanPrintView.tsx and convert them to normal document flow with print:block; change @page in index.css to @page { size: A4; margin-top: 25mm; margin-bottom: 20mm; margin-left: 15mm; margin-right: 15mm; } and remove the body { padding } approach from the print block.
```

---

**A-PP-3**
```
Location: /Users/monchee/Projects/dream/src/features/testing/components/TestingPlanPrintView.tsx:351–363
Severity: Minor
Observation: Signature area fill-in lines use a single border-b (1px) with no print:border-b-2 override.
Impact: On a 300 DPI laser printer in toner-saving mode, a 1px border renders at approximately 0.08mm — effectively invisible — making signature fields appear as plain unseparated text.
Recommendation: Change border-b to border-b-2 on the signature lines and add print:border-b-2 explicitly.
```

---

**A-PP-4**
```
Location: /Users/monchee/Projects/dream/index.css:196–234 (@media print)
Severity: Minor
Observation: The print stylesheet has no orphans or widows declarations.
Impact: On long testing plans with many drugs, a category table with an odd number of rows may break between the category header and its first data row, leaving a dangling header at the bottom of a page.
Recommendation: Add orphans: 2; widows: 2; to the @media print body rule in index.css.
```

---

### Info Page

---

**A-I-1**
```
Location: /Users/monchee/Projects/dream/src/core/screens/InfoPageScreen.tsx:17–35
Severity: Minor
Observation: Info page content (FAQ, About, Drug Reference) is rendered inside ScreenLayout's <main> but with no inner <article> or landmark wrapping the per-route content.
Impact: Screen reader users navigating to info pages cannot use landmarks to skip directly to the page-specific content; they must tab through the entire navigation chrome.
Recommendation: Wrap <PageComponent> in <article aria-label={route.title}> to create a per-page content landmark that screen readers can jump to directly.
```

---

### Cross-Screen Patterns

---

**A-X-1**
```
Location: /Users/monchee/Projects/dream/src/core/components/ScreenLayout.tsx:148–155
Severity: Minor
Observation: Nav button labels are hidden below the sm breakpoint (640px) with hidden sm:inline — only the icon is visible — including on the active screen item.
Impact: A nurse at 640px viewport (common on older Android clinic tablets) sees three identical pill buttons with no text labels and cannot confirm which screen is currently active without reading a page heading.
Recommendation: Change the label visibility logic to show the label for the active item at all breakpoints: replace 'hidden sm:inline' with ${isActive ? 'inline' : 'hidden sm:inline'} so the active screen name is always visible regardless of viewport width.
```

---

**A-X-2**
```
Location: /Users/monchee/Projects/dream/src/core/components/ScreenLayout.tsx:182–184
Severity: Minor
Observation: The hamburger DropdownMenuTrigger has aria-label="Menu" but the aria-expanded state injection from Radix requires the trigger to use asChild with a button child to reliably pass through; the current pattern may not reflect open/closed state to screen readers.
Impact: Screen reader users may not be notified of the menu's open/closed state, which is a navigation accessibility gap.
Recommendation: Add asChild to the DropdownMenuTrigger and pass a <button> child, or inspect the rendered DOM to confirm Radix injects aria-expanded automatically; if not, add aria-expanded={menuOpen} with corresponding state tracking.
```

---

## Workstream B: Typography Findings

### Dimension 1: Font Appropriateness

**B-1A** *(confirmed duplicate of B-8B; see that finding — Critical severity)*
```
Location: /Users/monchee/Projects/dream/src/features/testing/components/AssessmentSection.tsx:17 and AssessmentPlanSection.tsx:27
Severity: Critical (see B-8B)
Observation: Both Assessment textarea implementations use hardcoded slate/white Tailwind tokens instead of semantic CSS variables.
Impact: In dark mode the textarea background and text become indistinguishable, making clinical notes entered in dark mode invisible.
Recommendation: See B-8B.
```

---

**B-1B**
```
Location: /Users/monchee/Projects/dream/src/features/patients/components/PatientHistory.tsx:108
Severity: Minor
Observation: A separator pipe character uses font-light (weight 300) at text-xl — below Public Sans's optimal legibility weight at small optical sizes.
Impact: At 85% font scale the pipe renders at approximately 17px at weight 300, producing insufficient stroke contrast against the muted foreground on low-contrast displays.
Recommendation: Remove font-light from the separator span at line 108 and use font-normal (400) with text-muted-foreground/30 to keep it visually recessive without relying on a light weight.
```

---

### Dimension 2: Type Scale Coherence

**B-2A**
```
Location: /Users/monchee/Projects/dream/index.css:276–280 (@layer base heading definitions)
Severity: Major
Observation: h4 is defined as text-base (16px) with font-bold, while h3 is text-xl (20px) with font-semibold — the 4px size difference is compensated by a heavier weight on the smaller element, creating an inverted weight-to-size relationship.
Impact: In tables and form sections where h3 section headings appear adjacent to h4 card titles, a nurse scanning quickly cannot reliably distinguish hierarchical levels by shape alone, increasing cognitive load during a time-pressured clinical session.
Recommendation: Change h4 in @layer base from text-base font-bold to text-lg font-semibold, eliminating the inverted-weight anomaly while maintaining a clear size step between h3 (text-xl) and h4 (text-lg).
```

---

**B-2B**
```
Location: /Users/monchee/Projects/dream/src/features/reports/components/ClinicalReport.tsx:265
Severity: Major
Observation: The "Assessment & Plan" h3 heading uses font-semibold without uppercase, without tracking-wider, and without a border-b underline, while all other report section headings (Skin & Intradermal Testing, Drug Challenge Details, Recommendations) use uppercase tracking-wider font-bold with border-b-2 border-primary.
Impact: The Assessment & Plan section — containing the clinician's final clinical decision — is the lowest-contrast heading in the printed report; the most actionable section is the hardest to locate by visual scan.
Recommendation: Change the Assessment & Plan h3 className at ClinicalReport.tsx:265 to match the other section headings: add font-bold, uppercase, tracking-wider, and border-b-2 border-primary pb-2 mb-4 print:text-xs print:mb-2.
```

---

**B-2C**
```
Location: /Users/monchee/Projects/dream/src/core/screens/DashboardScreen.tsx and /Users/monchee/Projects/dream/src/features/dashboard/
Severity: Minor
Observation: The Dashboard heading hierarchy jumps directly from the screen-title h1 (text-3xl via ScreenLayout) down to text-base CardTitle elements (h2 by default in CardTitle) with no intermediate h2.
Impact: Screen readers and users relying on heading navigation cannot traverse the Dashboard at an intermediate semantic level; all card titles appear as direct children of the screen h1.
Recommendation: Add a visually styled (or visually hidden) h2 wrapping the Analytics and Table sections in Dashboard.tsx, giving screen readers an intermediate level and aligning visible hierarchy with heading semantics.
```

---

### Dimension 3: Section Label Usage

**B-3A**
```
Location: /Users/monchee/Projects/dream/src/features/dashboard/components/AdvancedSearchFilters.tsx:131, 169, 206, 239
Severity: Minor
Observation: Popover section labels use the bespoke combination "text-xs font-bold text-foreground uppercase tracking-[0.1em] mb-3 block opacity-70" — functionally equivalent to .section-label but with a looser tracking value (0.1em vs 0.05em) and opacity-70 for colour.
Impact: Popover filter labels appear at a different visible weight from every other section label in the application; at 85% font scale the opacity compounding may push these labels below WCAG 4.5:1 contrast on the card background.
Recommendation: Replace all four bespoke label strings with the .section-label utility class, adding only layout modifiers (mb-3 block) alongside it; the opacity-70 colour approach should be removed in favour of the semantic text-muted-foreground token already present in .section-label.
```

---

**B-3B**
```
Location: /Users/monchee/Projects/dream/src/features/testing/components/DrugTestGrid.tsx:112, 121, 170 and DrugTestPanelSection.tsx:61 and TestingPlanPrintView.tsx:171
Severity: Minor
Observation: Multiple inline-label patterns ("text-xs font-semibold uppercase tracking-wide", "text-xs uppercase text-muted-foreground font-semibold tracking-wider") duplicate the semantic intent of .section-label but use tracking-wide instead of tracking-wider and font-semibold instead of font-bold.
Impact: SPT/IDT column headers and reference control labels render at a fractionally lighter weight and tighter spacing than all PatientHistory.tsx section labels, creating a visually inconsistent hierarchy within the same workflow screen navigated continuously during a testing session.
Recommendation: Replace each bespoke pattern with the .section-label utility class; where layout modifiers are needed (e.g. shrink-0 w-7), add them alongside .section-label rather than duplicating the full typography string.
```

---

**B-3C**
```
Location: /Users/monchee/Projects/dream/src/core/screens/LogScreen.tsx:248–264 (new patient dialog)
Severity: Minor
Observation: New Patient Details dialog field labels use "text-xs uppercase mb-1.5 block text-muted-foreground" — missing font-bold and tracking-wider from the .section-label spec.
Impact: Dialog field labels appear lighter than PatientHistory section labels and identical to disabled caption text, causing visual ambiguity between an inactive label and an active field group header during manual patient entry.
Recommendation: Replace "text-xs uppercase mb-1.5 block text-muted-foreground" with "section-label mb-1.5 block" across all six label instances in the dialog.
```

---

### Dimension 4: Line Height and Measure

**B-4A**
```
Location: /Users/monchee/Projects/dream/src/features/reports/components/PowerchartLetter.tsx:109 and PatientHandout.tsx:99 and PatientHistory.tsx:168
Severity: Major
Observation: All multi-sentence narrative blocks — the PowerchartLetter paragraph, PatientHandout department info, and PatientHistory reaction summary — have no max-width constraint; no max-w-prose, no ch-based max-width, and no prose class is used anywhere in the codebase.
Impact: On a 1440px viewport, narrative paragraphs can span 130+ characters per line (well beyond the legible 65–80ch threshold), increasing mis-reading risk when a clinician reviews a long reaction narrative under time pressure.
Recommendation: Add max-w-prose to a new inner <div> wrapper around only the paragraph text inside each container (not the outer section div) at PowerchartLetter.tsx:109, PatientHandout.tsx:99, and PatientHistory.tsx:168 — the inner wrapper avoids constraining adjacent headings and structured data elements.
```

---

**B-4B**
```
Location: /Users/monchee/Projects/dream/index.css:209–210 (@media print body)
Severity: Major
Observation: The print stylesheet sets font-size: 10px and line-height: 1.3 globally; clinical narrative text (tryptase paragraphs, Recommendations lists) prints at this size across all report formats.
Impact: 10px / 1.3 leading is at the physiological lower bound for comfortable reading; on a poorly calibrated ward printer or under fluorescent clinical lighting, this falls below WCAG's print guideline of ≥12pt for documents read by patients and handed to anaesthetists pre-operatively.
Recommendation: Raise the print body font-size to 11px and line-height to 1.45 in index.css, and add print:text-xs (12px) to all narrative <p> elements in ClinicalReport.tsx, PatientHandout.tsx, and PowerchartLetter.tsx that do not already carry a print size override.
```

---

### Dimension 5: Numerical Data and Tabular Figures

**B-5A** *(merged with UI/UX finding A-T-2; Critical severity; see that finding for full description)*
```
Location: /Users/monchee/Projects/dream/src/features/testing/components/DrugTestGrid.tsx:183, 204, 222
Severity: Critical
```

---

**B-5B**
```
Location: /Users/monchee/Projects/dream/src/features/dashboard/components/SkinTestBreakdown.tsx:109–115
Severity: Major
Observation: SPT, IDT 1:100, IDT 1:10, IDT Neat, and Challenge Positive count cells do not carry tabular-nums.
Impact: When a column contains single-digit counts alongside double-digit counts, proportional numerals cause column misalignment, making it harder to compare positive-test frequencies — a core epidemiological task for immunologists reviewing the database.
Recommendation: Add tabular-nums to the className of every data <td> in SkinTestBreakdown.tsx lines 109–115 and to the total <td> cell.
```

---

**B-5C**
```
Location: /Users/monchee/Projects/dream/src/features/reports/components/ClinicalReport.tsx:91–95
Severity: Major
Observation: Control values (Histamine SPT, Saline SPT, Saline IDT) are displayed as <strong>{value || '-'}</strong> without tabular-nums or font-mono, and the "mm" unit is rendered in the same typographic weight and colour as the numeric value.
Impact: A clinician comparing control values cannot visually separate quantity from unit; on print, proportional numerals on different rows will not column-align, reducing readability of a safety-critical reference row.
Recommendation: Wrap each control value in <span className="font-mono tabular-nums">{value}</span> and apply text-muted-foreground to each " mm" unit suffix at ClinicalReport.tsx lines 91–95.
```

---

### Dimension 6: Font Scaling Extremes (85%–125%)

**B-6A**
```
Location: /Users/monchee/Projects/dream/src/features/dashboard/components/AdvancedSearchFilters.tsx:214, 221, 246
Severity: Major
Observation: Date range inputs and the hospital dropdown use text-[11px] — a hardcoded absolute pixel value that does not respond to FontSizeProvider's rem-based CSS scaling.
Impact: At 85% FontSizeProvider scale, these inputs remain at 11px while all surrounding labels correctly scale down to ~10px, making the input text appear disproportionately large; at 125% scale the inputs remain at 11px, appearing disproportionately small against their labels.
Recommendation: Replace text-[11px] with text-xs (0.75rem) at all three instances so the inputs participate in the rem-based scaling chain.
```

---

**B-6B**
```
Location: /Users/monchee/Projects/dream/src/features/testing/components/TestingPlanGenerator.tsx:603 and PatientHistory.tsx:216
Severity: Minor
Observation: text-[10px] is used in two places (a protocol label and a "Peak" tryptase badge) as fixed pixel values outside the rem scaling system.
Impact: At 85% scale these elements do not scale down; at 125% scale they do not grow proportionally, appearing too small relative to surrounding text.
Recommendation: Replace text-[10px] with text-[0.625rem] at both locations so FontSizeProvider scaling applies correctly.
```

---

**B-6C**
```
Location: /Users/monchee/Projects/dream/src/core/screens/LogScreen.tsx:96–97 (active report banner buttons)
Severity: Minor
Observation: The "Open Report" and "Clear" buttons in the active-report banner use h-7 (28px) at 100% scale; at 85% FontSizeProvider scale, rem-scaled height would be ~24px.
Impact: Buttons at 24px height are below the WCAG 2.5.5 44px touch-target recommendation for users with motor impairments or gloved hands.
Recommendation: Increase both button sizes from h-7 to h-9 (36px), which provides ≥32px at 85% scale and better approaches the touch-target minimum.
```

---

### Dimension 7: Heading Weight and Contrast

**B-7A** *(confirmed duplicate of B-2B — same location and issue)*
```
Location: /Users/monchee/Projects/dream/src/features/reports/components/ClinicalReport.tsx:265
Severity: Major
Observation: Assessment & Plan heading uses font-semibold with no uppercase/tracking/border, visually identical to adjacent body text. See finding B-2B.
```

---

**B-7B**
```
Location: /Users/monchee/Projects/dream/src/features/dashboard/components/RecentTestingActivity.tsx:26
Severity: Minor
Observation: The card title uses text-slate-800 dark:text-primary instead of the semantic text-foreground dark:text-primary used in AnalyticsPanel and PatientTable CardTitles.
Impact: In light mode text-slate-800 (#1e293b) is slightly lower contrast than text-foreground (near-black), creating a visual inconsistency where one card title appears lighter than its peers in a horizontal grid.
Recommendation: Change text-slate-800 to text-foreground at RecentTestingActivity.tsx line 26.
```

---

### Dimension 8: Dark Mode Typography

**B-8A**
```
Location: /Users/monchee/Projects/dream/index.css:85 (.dark --muted-foreground)
Severity: Major
Observation: The dark-mode --muted-foreground token is 0 0% 60% (#999999); the dark background --background is 0 0% 10% (#1a1a1a). Contrast ratio: approximately 3.8:1, below WCAG AA 4.5:1.
Impact: Every element using text-muted-foreground in dark mode — .section-label labels, PatientTable thead, SkinTestBreakdown thead, IDT column headers in DrugTestGrid, and all secondary captions — fails WCAG AA in dark mode, covering a significant proportion of information-bearing text read during a testing session.
Recommendation: Raise --muted-foreground in the .dark block from 0 0% 60% to 0 0% 65% (#a6a6a6), which achieves 4.5:1 against #1a1a1a; verify with a contrast checker (e.g. WebAIM Contrast Checker) before shipping.
```

---

**B-8B**
```
Location: /Users/monchee/Projects/dream/src/features/testing/components/AssessmentPlanSection.tsx:27 and AssessmentSection.tsx:17
Severity: Critical
Observation: Both Assessment textarea implementations use bg-white (hardcoded, not bg-background) with dark:bg-background, and do not explicitly set text-foreground — body text colour inherits correctly in dark mode, but the bg-white prevents proper surface switching before dark:bg-background applies.
Impact: Clinical plan text typed in dark mode is rendered as near-white text on a white or near-white background — invisible — creating a direct risk that clinical assessment notes are entered but not visible, and the clinician cannot verify content before saving.
Recommendation: Replace bg-white ring-offset-white border-slate-200 text-slate-500 placeholder:text-slate-400 focus-visible:ring-slate-950 with bg-background ring-offset-background border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-ring in both textarea classNames, and explicitly add text-foreground.
```

---

**B-8C**
```
Location: /Users/monchee/Projects/dream/src/core/components/PasswordGate.tsx:90
Severity: Minor
Observation: The application subtitle uses text-slate-600 dark:text-slate-400 (hardcoded tokens).
Impact: dark:text-slate-400 (#94a3b8) on the dark background (#1a1a1a) achieves approximately 4.2:1 — narrowly failing WCAG AA 4.5:1 — at the very first screen a clinician sees.
Recommendation: Replace text-slate-600 dark:text-slate-400 with text-muted-foreground; after fixing B-8A (raising --muted-foreground to 65%), this will clear the WCAG threshold.
```

---

### Dimension 9: Print Typography

**B-9A**
```
Location: /Users/monchee/Projects/dream/index.css:197–235 (@media print) and ClinicalReport.tsx:219 and PatientHandout.tsx:65
Severity: Critical
Observation: The print stylesheet does not reset --foreground or heading colour to black; headings using color: hsl(var(--primary)) print in NSW Health Blue (#002664) which reproduces as dark grey on a monochrome laser printer and may wash out entirely on low-quality ward printers. The "AVOID" label in ClinicalReport.tsx:219 already has print:text-black but lacks print:font-bold; the "AVOID" equivalent in PatientHandout.tsx:65 (text-red-900 font-semibold) has no print override at all.
Impact: "AVOID [DRUG]" — the most safety-critical text in any clinical document — may be visually indistinguishable from body text when photocopied in B&W, removing the urgency signal from the one piece of information an anaesthetist must act on.
Recommendation: (1) Add to the @media print block in index.css: h1, h2, h3, h4, h5, h6 { color: #000 !important; }; (2) at ClinicalReport.tsx:219, add print:font-bold to the AVOID badge className (print:text-black already present); (3) at PatientHandout.tsx:65, add print:text-black print:font-bold to the avoidance text element.
```

---

**B-9B**
```
Location: /Users/monchee/Projects/dream/src/features/testing/components/TestingPlanPrintView.tsx:42–47
Severity: Major
Observation: The print running header and footer use print:text-[9px] — below the 10px absolute minimum for print body text.
Impact: The running header contains the patient name and MRN; at 9px on a 300 DPI inkjet (common in clinic environments), Public Sans letterforms blur, making the identity information illegible and preventing the form from being matched to the correct patient.
Recommendation: Raise print:text-[9px] to print:text-[10px] on both the header and footer divs.
```

---

**B-9C**
```
Location: /Users/monchee/Projects/dream/src/features/testing/components/TestingPlanPrintView.tsx:81
Severity: Minor
Observation: The "URGENT — Priority Testing Required" banner uses tracking-widest (0.1em) at print:text-xs (12px), which at this combination may cause the text to overflow the banner container on narrow A4 margins.
Impact: An urgent testing plan banner that wraps onto two lines or overflows its background loses its immediate visual impact, undermining the safety signal.
Recommendation: Change tracking-widest to tracking-wider on the urgent banner and increase its font size to print:text-sm to maintain visual weight without relying on extreme tracking at small print sizes.
```

---

### Dimension 10: Letter-Spacing Consistency

**B-10A**
```
Location: (tracking-wide — not tracking-wider — instances):
  /Users/monchee/Projects/dream/src/core/components/PasswordGate.tsx:90, 133
  /Users/monchee/Projects/dream/src/features/patients/components/PatientHistory.tsx:109, 117
  /Users/monchee/Projects/dream/src/features/research/components/ResearchDashboard.tsx:35, 46, 79, 99, 289, 305, 321, 339
  /Users/monchee/Projects/dream/src/features/dashboard/components/SkinTestBreakdown.tsx:87
  /Users/monchee/Projects/dream/src/features/testing/components/DrugChallengeReactionFields.tsx:26
  /Users/monchee/Projects/dream/src/features/testing/components/DrugSelectionPanel.tsx:43
  /Users/monchee/Projects/dream/src/features/testing/components/DrugTestGrid.tsx:112, 121, 170
  /Users/monchee/Projects/dream/src/features/testing/components/ChallengeSection.tsx:178
  /Users/monchee/Projects/dream/src/features/testing/components/TestingPlanPrintView.tsx:129, 135, 141, 171, 244, 310
(tracking-[0.1em] — AdvancedSearchFilters.tsx bespoke):
  /Users/monchee/Projects/dream/src/features/dashboard/components/AdvancedSearchFilters.tsx:131, 169, 206, 239, 283
Severity: Major
Observation: Four distinct tracking values are used for functionally equivalent uppercase label text: tracking-wide (0.025em, ~20 locations), tracking-wider (0.05em, via .section-label and direct use), tracking-widest (0.1em, 3 locations), and tracking-[0.1em] (5 locations in AdvancedSearchFilters) — with no documented rule distinguishing when each is appropriate.
Impact: During a testing session a clinician moves between PatientHistory (tracking-wider), DrugTestGrid (tracking-wide), and ClinicalReport headings (tracking-wider and tracking-widest mixed) — the visual rhythm of uppercase labels shifts unpredictably, adding cognitive noise in an environment where rapid visual pattern recognition is essential.
Recommendation: Establish a single rule: (a) use .section-label (tracking-wider) for all UI field-group labels and table column headers; (b) use tracking-widest only for document-level section headers in TestingPlanPrintView (print only); (c) replace all 20 tracking-wide instances with .section-label or tracking-wider; (d) replace all 5 tracking-[0.1em] instances in AdvancedSearchFilters with .section-label.
```

---

**B-10B**
```
Location: /Users/monchee/Projects/dream/src/core/components/PasswordGate.tsx:89
Severity: Minor
Observation: The "DREAM" wordmark uses tracking-widest at text-5xl — correct for a logotype — but this value is applied via Tailwind utility, making it indistinguishable from other tracking-widest uses in the codebase.
Impact: A developer may inadvertently apply tracking-widest to clinical headings expecting the same branded effect, propagating the logotype style to functional heading text.
Recommendation: Extract the DREAM wordmark to a dedicated CSS class (.app-wordmark) in @layer components in index.css with a comment marking tracking-widest as reserved for the login wordmark only.
```

---

**B-10C**
```
Location: /Users/monchee/Projects/dream/src/features/testing/components/TestingPlanPrintView.tsx:244
Severity: Minor
Observation: The print protocol table thead row uses tracking-wide instead of the tracking-wider used on every other table thead in the application (PatientTable, SkinTestBreakdown, RecentTestingActivity all use tracking-wider via .section-label or direct use).
Impact: Column labels on the printed testing plan appear slightly compressed compared to on-screen table headers; this inconsistency is noticeable when the form is used daily as a reference.
Recommendation: Change tracking-wide to tracking-wider on the TestingPlanPrintView print protocol table thead row at line 244.
```

---

## Prioritised Fix List

| # | Title | Rationale | Workstream | Effort |
|---|-------|-----------|------------|--------|
| 1 | **Critical: DrugTestGrid wheal inputs missing font-mono tabular-nums** | Proportional digits in result columns create a direct transcription error risk at the 3 mm positive/negative threshold — a nurse may enter a value in the wrong IDT dilution column | A-T-2 / B-5A | S |
| 2 | **Critical: Assessment textarea invisible in dark mode** | Clinical notes typed in dark mode become invisible; a clinician may save a blank or overwritten plan without realising it | B-8B / A-T-4 | S |
| 3 | **Critical: Print headings not forced to black; AVOID text not bold** | "AVOID [DRUG]" — the most safety-critical text in a clinical document — may be indistinguishable from body text on B&W ward photocopies | B-9A | S |
| 4 | **Major: Grade legend and stacked bar are colour-only** | Colourblind clinicians cannot read the severity distribution; no secondary indicator (pattern, label, aria) exists on the chart segments or legend dots | A-D-1 / A-D-2 | M |
| 5 | **Major: Dark mode muted-foreground below WCAG AA (3.8:1)** | Section labels, table headers, IDT column headers, and all secondary text fail contrast in dark mode — a large proportion of information-bearing text is affected | B-8A | S |
| 6 | **Major: Active report banner exposes full patient name outside redaction** | PHI inadvertently visible to the next patient approaching the workstation before the clinician has chosen to redact | A-L-1 | S |
| 7 | **Major: Print header/footer use print:fixed, conflicting with body-padding margin approach** | Running header may overlap content on A4, producing an illegible printed testing plan passed to nursing staff | A-PP-2 | M |
| 8 | **Major: Assessment & Plan heading visually buried in clinical report** | The most clinically actionable section of any clinical record is the lowest-contrast heading; hard to locate by visual scan | B-2B | S |
| 9 | **Major: PatientSelector has no keyboard navigation** | Keyboard-only users cannot operate patient selection; WCAG 2.1 SC 2.1.1 violation | A-L-2 | M |
| 10 | **Major: Validation errors have no field jump-links; form field ids absent** | A nurse hunting for an error during a live testing session must scroll the entire form to find the offending control | A-T-1 | M |

---

## What Is Working Well

1. **Grade colour token system** — `--status-grade1` through `--status-grade4` are fully tokenised as CSS variables in `index.css` (lines 41–45) with well-chosen dark-mode variants in the `.dark` block. All badge variants in `components/ui/badge.tsx` consume these tokens correctly, and no hardcoded hex colours appear in JSX className strings for grade indicators. This gives the system a solid foundation for future theming.

2. **`prefers-reduced-motion` suppression** — Every animation class (`.animate-screen-enter`, `.animate-row-enter`, `.animate-section-reveal`, `.btn-press`, `.hover-scale`, `.card-interactive`) is suppressed in a single `@media (prefers-reduced-motion: reduce)` block in `index.css` (lines 247–253) with `animation: none !important; transform: none !important`. This is the correct implementation pattern and means no clinical user with vestibular conditions will experience motion.

3. **`tabular-nums` deployment on analytics figures** — `AnalyticsPanel.tsx` uses `tabular-nums` consistently on all animated count displays (total records, severe rate percentage, average onset time), ensuring the counting animation does not cause layout jitter. The same pattern is applied in `PatientHistory.tsx` tryptase columns. This is a well-established clinical data pattern applied in the right places.

4. **`ConfirmDialog` component for destructive actions** — A reusable `ConfirmDialog` with three semantic variants (`danger`, `warning`, `info`) exists at `components/ui/confirm-dialog.tsx` and is used for both "Clear testing plan" (naming the consequence: "This removes every selected drug and all custom protocol details — this cannot be undone") and patient record deletion in `ResearchDashboard.tsx`. The named-consequence pattern is correctly implemented where it matters most.

5. **Print CSS architecture** — The print stylesheet in `index.css` and the `print:` Tailwind utility classes in report components form a coherent B&W system: `print:bg-white`, `print:text-black`, `print:border-black` are systematically applied; `body { -webkit-print-color-adjust: exact; print-color-adjust: exact }` forces colour output when needed; and all animation/transition effects are disabled in print context. The architecture is correct — the issues found are gaps in coverage, not structural flaws.

---

## Appendix: Deduplicated and Corrected Findings Reference

The following findings were merged or removed after the verification pass:

- **A-T-2 / B-5A** → merged into a single Critical finding (A-T-2); Critical severity retained; line numbers 183, 204, 222 from Workstream A are the accurate action targets.
- **B-1A / B-8B** → B-1A removed as a duplicate; B-8B retained at Critical severity as the canonical finding.
- **B-7A / B-2B** → B-7A removed as an acknowledged duplicate; B-2B retained.
- **A-PP-1** → Corrected to clarify that `dark:border-gray-500` must be added to all six `border-gray-400` instances, not just the subset lacking `print:border-black` (dark mode and print mode are orthogonal).
- **B-9A** → Corrected to remove `print:text-black` from the ClinicalReport.tsx:219 recommendation (it already exists); changed `print:font-black` to `print:font-bold`.
- **A-T-1** → Corrected to specify that form field `id` attributes are currently absent in VisitDetailsSection.tsx (no `htmlFor`/`id` association exists), and the `validationErrors` type must be refactored from `string[]` to `{ message: string; fieldId: string }[]` before jump-links can be implemented.
- **B-4A** → Clarified that `max-w-prose` must be applied on an inner wrapper around prose text only (not the outer container div), to avoid constraining adjacent headings and structured data.
