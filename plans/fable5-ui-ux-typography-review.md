# Fable 5 Prompt — DREAM UI/UX & Typography Design Review

> **Purpose:** A ready-to-run prompt for Claude Fable 5 (or Mythos 5) to conduct a formal
> design audit of the DREAM application's UI/UX and typography.
>
> **How to use:** Paste the contents of the [Prompt](#prompt) section below into a Fable 5
> session pointed at this repository. Set `effort: high`. Expect a long-running, multi-minute
> request because of the parallel-subagent fan-out.
>
> **Why these patterns:** Notes on the Fable-5-specific structure are in
> [Fable 5 design rationale](#fable-5-design-rationale) at the bottom.

---

## Quick reference

| Item | Value |
|------|-------|
| Target model | Claude Fable 5 (fallback: Claude Opus 4.8) |
| Recommended effort | `high` |
| Deliverable | Written design audit (not a code change) |
| Subagents | 3 — UI/UX, Typography, Verifier |
| Primary evidence | `index.css`, `tailwind.config.js`, `src/core/`, `src/features/`, `components/ui/` |

---

## Prompt

Copy everything inside the fenced block below into the Fable 5 session.

```text
## Role and context

You are a senior product designer conducting a formal design audit of DREAM — Drug Reaction
Evaluation & Anaesthetic Management — a private clinical Progressive Web App for the RPAH
Department of Clinical Immunology & Allergy, Sydney. DREAM is used in a high-stakes hospital
environment by immunologists and nurses managing patients with suspected drug reactions. The
core workflows are: importing patients from REDCap, planning and recording skin prick /
intradermal / IV challenge outcomes, and generating clinical reports, handouts, and
PowerChart letters.

Why this audit matters: in this environment, a Grade IV drug result must be unmistakably
communicated, a nurse entering wheal measurements under time pressure must not misread a
field, and every printed document must be trustworthy in a B&W paper form. UI clarity is
patient safety infrastructure, not polish.

---

## Tech stack (read before inspecting source)

- React 19 + TypeScript, Vite, deployed as a PWA
- Tailwind CSS v3.4.19 with shadcn/ui (new-york preset) and Radix UI primitives
- Font: Public Sans (Google Fonts, weights 100-900), fallback Inter / sans-serif
- Color system: HSL CSS custom properties in index.css
  - Primary: NSW Health Blue #002664 (--primary: 217 100% 19.6%)
  - Background: slate-50 (--background: 210 40% 98%)
  - Accent: NSW Blue Light #CBEDFD (--accent: 199 92% 89%)
- Medical grade colors:
  - Grade I (Safe): emerald-600 (142.1 76.2% 36.3%)
  - Grade II (Equivocal): amber-500 (37.7 92.1% 50.2%)
  - Grade III (Caution): orange-500 (24.6 95% 53.1%)
  - Grade IV (Avoid): rose-600 (346.8 77.2% 49.8%)
- Dark mode: class-based via next-themes, with an inverted HSL palette
- Border radius: 0 everywhere (sharp professional aesthetic)
- FontSizeProvider: user-adjustable 85%-125% font scaling for accessibility
- Section labels: `.section-label` utility (text-xs, font-bold, uppercase, tracking-wider)
- Six named animation keyframes; all suppressed under prefers-reduced-motion
- Print utilities: A4-specific, B&W-safe overrides for clinical output

---

## Source map

Read these files as your primary evidence base:

- /index.css - all color tokens, typography rules, animation keyframes, print utilities,
  and utility classes (.card-compact, .section-label, .hover-scale, etc.)
- /tailwind.config.js - fontFamily extension, border-radius zeroing, chart colors,
  custom keyframes, dark mode strategy
- /src/core/components/ScreenLayout.tsx - main app shell and navigation chrome
- /src/core/components/Footer.tsx - theme toggle, metadata, links
- /src/core/screens/ - DashboardScreen, LogScreen, TestingScreen, SummaryScreen,
  PrintPlanScreen, InfoPageScreen, ResearchScreen
- /src/features/dashboard/ - AnalyticsPanel, PatientTable, RecentTestingActivity,
  SkinTestBreakdown
- /src/features/testing/ - testing plan builder and clinical test logging
- /src/features/reports/ - Clinical, Handout, and Letter report formats
- /src/features/patients/ - patient selection and history management
- /components/ui/ - all 30+ shadcn/ui primitive components

---

## Task

Produce an actionable written audit of the DREAM application's UI/UX design and
typography. This is a review deliverable - not a code change. Every finding must be
something a developer can act on in a single PR without further clarification from you.

Run the two workstreams below as parallel subagents. Each subagent reads the source
files independently and returns a structured finding list. A third verifier subagent
then checks both lists before you assemble the final report.

---

### Workstream A - UI/UX design

For each finding, use this structure exactly:
  Location: <file path>:<line> or <ScreenName> > <ComponentName>
  Severity: Critical | Major | Minor | Polish
  Observation: one sentence - what is happening
  Impact: one sentence - why it matters in a clinical context
  Recommendation: one sentence - the specific change to make

Cover all of the following dimensions across every major screen:

1. Visual hierarchy
   Is the most important information on each screen at the top of the visual weight
   stack? On TestingScreen and SummaryScreen, are Grade I-IV indicators visually
   dominant over surrounding content, not competing with it?

2. Information density
   On TestingScreen and LogScreen, is data density appropriate for use under clinical
   time pressure? Are table rows scannable without horizontal scrolling? Are there
   elements that could be collapsed or progressively disclosed?

3. Navigation and wayfinding
   Is the current screen always identifiable without reading a heading? Can the user
   reach every workflow from every screen in two taps or fewer? Are back/cancel paths
   always visible?

4. Form design
   On LogScreen and TestingScreen, do field labels sit adjacent to their inputs? Are
   required vs. optional fields distinguished? Do inline validation messages appear
   close to the offending field, not in a banner or toast? Are numeric inputs (wheal
   size in mm, concentration) correctly typed (inputmode="decimal", no spin arrows)?

5. Feedback states
   Are loading, saving, success, and error states communicated consistently - same
   component, same position on screen, across all workflows? Are irreversible actions
   (deleting a patient record, submitting deidentified research data) guarded with an
   explicit confirmation that names the consequence?

6. Empty states
   What does each screen show when no patient is loaded, no test results exist, or no
   report has been generated? Are empty states instructive (tell the user what to do
   next) rather than blank?

7. Dark mode consistency
   Does every screen render correctly in dark mode? Check specifically whether the
   medical grade colors (Grade I-IV) remain WCAG AA compliant on dark backgrounds. Flag
   any component that uses a hardcoded hex color instead of a CSS variable, which will
   break in dark mode.

8. Clinical-specific UX and colorblind safety
   Are drug allergy grades communicated with both color AND a secondary, non-color
   indicator (an icon, a text label, or a pattern) so the interface remains usable for
   colorblind users and in printed B&W? Flag any grade indicator that relies on color
   alone.

9. Print layout
   Do the clinical report, patient handout, and PowerChart letter render with correct
   B&W-safe styling at A4? Are page breaks sensible (no heading at the bottom of a page
   with its content on the next)? Is the print layout free of navigation chrome, focus
   rings, and dark-mode artifacts?

10. Micro-interactions
    Are hover, focus, and active states legible and consistent? Are transition durations
    appropriate for a clinical context (fast, functional - not playful)? Are there any
    interactions that animate when prefers-reduced-motion is active?

11. Responsive / tablet behavior
    Does the app degrade gracefully on a 768 px viewport (a clinician's tablet at
    bedside)? Are any interactive targets smaller than 44x44 px at this breakpoint?

---

### Workstream B - Typography

Use the same Location / Severity / Observation / Impact / Recommendation structure.

Cover all of the following dimensions:

1. Font appropriateness
   Assess Public Sans for a clinical app: legibility at small sizes, sense of authority
   and trustworthiness for hospital professionals. Note any weight that feels mismatched
   to its context (e.g., light-weight text used for critical information).

2. Type scale coherence
   Does the h1 -> h2 -> h3 -> h4 -> body -> .section-label hierarchy feel intentional? Are
   size jumps proportional? Are any two adjacent levels so close in size that hierarchy
   is unclear without relying solely on weight?

3. Section label usage
   The `.section-label` class (text-xs, bold, uppercase, tracking-wider) functions as
   a category marker. Is it applied consistently across all screens, or used ad-hoc?
   Does it appear in places where it creates noise rather than structure?

4. Line height and measure
   For body copy on InfoPageScreen, SummaryScreen reports, and patient handouts: is
   line-height sufficient for comfortable sustained reading? Is line length (measure)
   controlled with a max-width or prose class, or does text span full-width container
   widths?

5. Numerical data and tabular figures
   On TestingScreen and SummaryScreen, are numeric measurements (wheal sizes, drug
   concentrations, dilution ratios) displayed with font-variant-numeric: tabular-nums
   to prevent column misalignment? Are units (mm, mg/mL) visually subordinate to
   values, or competing with them?

6. Font scaling extremes (85% and 125%)
   At the minimum and maximum FontSizeProvider scale, do any labels truncate or
   overlap? Do any interactive elements shrink below 44 px tap target? Are card
   headers or section labels clipped in their containers at 125%?

7. Heading weight and contrast
   Are headings consistently semibold as intended in index.css? Are there any places
   where two adjacent text nodes are the same size but different weights are the only
   distinguishing signal - making hierarchy ambiguous in low-vision or bright-glare
   conditions?

8. Dark mode typography
   Does every text color token resolve to a CSS variable (not a hardcoded value) so
   that dark mode contrast is preserved? Are there muted text colors (text-muted-
   foreground equivalents) that drop below WCAG AA on dark backgrounds?

9. Print typography
   In the three printed output formats (clinical, handout, letter), are font size,
   weight, and line-height appropriate for A4 paper? Are headings distinguishable from
   body copy in B&W? Is any text so light-weight that it may not survive photocopying?

10. Letter-spacing consistency
    The -0.01em heading tracking and uppercase tracking on .section-label - are these
    applied to all equivalent elements throughout the codebase, or only where the
    utility class is explicitly used? Grep for inline tracking-* utilities or letter-
    spacing inline styles that might diverge from the intended spec.

---

## Verification pass

After both workstreams complete, dispatch a third subagent with fresh context. Give it:
- The complete finding lists from Workstreams A and B
- This instruction:

  "Check every Critical and Major finding:
   (1) Confirm it has a specific file-path citation - flag any finding that only
       references a screen name without a file path.
   (2) Confirm the Recommendation is specific enough to act on without asking the
       author - flag any recommendation that says 'consider' or 'review' without
       naming the specific change.
   (3) Check for duplicates: flag any finding that appears in both workstreams
       describing the same issue.
   Return a short correction list. If a finding passes all three checks, do not
   mention it."

Incorporate the verifier's corrections before writing the final report.

---

## Output structure

Deliver the report in this exact order:

### Executive Summary
3-5 sentences. One key takeaway per workstream and one overall health verdict for
the design. State plainly whether the current design is fit for clinical use as-is,
or whether Critical findings must be resolved before it is safe to use in a live
patient session.

### Workstream A: UI/UX Findings
Group findings by screen (Dashboard, Log, Testing, Summary, Print Plan, Info, Research,
and a final group for cross-screen patterns). Within each screen, order by severity
descending.

### Workstream B: Typography Findings
Group findings by the 10 dimensions above, in order. Within each dimension, order by
severity descending.

### Prioritised Fix List
A flat, ranked list of the 10 highest-impact findings across both workstreams, ordered
by clinical risk (a misread Grade IV result outranks a line-height preference). For
each entry:
  - Rank and title (e.g. "1. Grade IV indicator lacks non-color signal")
  - One-line rationale for its rank
  - Source workstream and finding reference
  - Effort estimate: S (< 30 min), M (half-day), L (full day+)

### What is working well
3-5 specific things the current design does right. Name the component, class, or
pattern - no generic praise.

---

## Autonomy and communication instructions

Operate autonomously. Read the source files, grep for class usage, and form
observations from actual file contents - not from memory of common React patterns or
shadcn/ui defaults. The user is not watching in real time.

Before reporting any finding, verify it against a file read or grep result from this
session. If something is not yet confirmed, say so explicitly rather than asserting it.

Pause only if you encounter a genuine blocker: a file that does not exist, a dependency
that prevents reading a component, or a clinical requirement ambiguity that only the
developer can resolve. Do not pause to narrate options.

Lead with the finding, not with the investigation. Supporting detail comes after.
Spell out file paths, class names, and CSS variable names in full. Do not invent
shorthand or abbreviations.
```

---

## Fable 5 design rationale

Why this prompt is structured the way it is, mapped to the official
[Fable 5 prompting guide](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5):

- **Parallel subagents (A, B, verifier).** Fable 5 dispatches and sustains parallel
  subagents more reliably than prior models. Splitting UI/UX from Typography keeps the two
  finding lists from contaminating each other, and the fresh-context verifier is the
  guide's recommended alternative to self-critique.
- **Ground progress claims.** The "verify against a file read or grep result from this
  session" instruction is taken directly from the guide's anti-fabrication pattern. It is
  the single most important guard against invented line-number citations in a long audit.
- **State the boundaries.** The prompt explicitly frames this as a *review deliverable, not
  a code change*, so Fable 5 reports findings and stops rather than taking the unrequested
  action of opening a PR.
- **Strong instruction following / brevity.** Severity tiers and the one-sentence-per-field
  finding format steer output concisely without enumerating every formatting rule.
- **Give the reason, not only the request.** The "Why this audit matters" paragraph supplies
  clinical intent (patient safety, B&W print trust) so the model connects findings to real
  stakes rather than generic design heuristics.
- **No reasoning reproduction.** Findings are stated as conclusions; there is no
  "show your thinking" instruction, which the guide flags as a `reasoning_extraction`
  refusal trigger on Fable 5.
- **Readability when communicating.** The closing instruction to spell out paths and class
  names in full, and avoid shorthand, matches the guide's communication-style addendum for
  agentic runs.

### Run settings

| Setting | Recommendation |
|---------|----------------|
| `effort` | `high` (use `xhigh` only if the first run feels shallow) |
| Fallback | Configure server/client fallback to Claude Opus 4.8 for any `stop_reason: "refusal"` |
| Timeouts | Allow several minutes per request; the subagent fan-out extends wall-clock time |
| Follow-up | After the report lands, a `/code-review` or `/design-review` pass can turn the Prioritised Fix List into actual PRs |
