---
name: DREAM Allergy Management
description: Local-first clinical workbench for perioperative anaesthetic allergy assessment, testing, and reporting.
colors:
  primary: "hsl(217, 100%, 19.6%)"
  primary-foreground: "hsl(210, 40%, 98%)"
  background: "hsl(210, 40%, 98%)"
  foreground: "hsl(222.2, 84%, 4.9%)"
  card: "hsl(0, 0%, 100%)"
  card-foreground: "hsl(222.2, 84%, 4.9%)"
  secondary: "hsl(210, 40%, 96.1%)"
  secondary-foreground: "hsl(222.2, 47.4%, 11.2%)"
  muted: "hsl(210, 40%, 96.1%)"
  muted-foreground: "hsl(215.4, 16.3%, 44%)"
  accent: "hsl(199, 92%, 89%)"
  accent-foreground: "hsl(218, 100%, 20%)"
  destructive: "hsl(0, 84.2%, 60.2%)"
  destructive-foreground: "hsl(210, 40%, 98%)"
  border: "hsl(214.3, 31.8%, 91.4%)"
  input: "hsl(214.3, 31.8%, 91.4%)"
  ring: "hsl(217, 100%, 19.6%)"
  status-grade1: "hsl(142.1, 76.2%, 36.3%)"
  status-grade2: "hsl(37.7, 92.1%, 50.2%)"
  status-grade3: "hsl(24.6, 95%, 53.1%)"
  status-grade4: "hsl(346.8, 77.2%, 49.8%)"
  status-success: "hsl(142.1, 76.2%, 36.3%)"
  status-warning: "hsl(37.7, 92.1%, 42%)"
  status-danger: "hsl(0, 84.2%, 60.2%)"
  status-info: "hsl(220, 54%, 39%)"
  status-neutral: "hsl(215.4, 16.3%, 44%)"
  path-testing: "hsl(174, 72%, 28%)"
  path-testing-foreground: "hsl(0, 0%, 100%)"
  nsw-blue: "hsl(218, 98%, 54%)"
  nsw-blue-light: "hsl(199, 92%, 89%)"
  nsw-info: "hsl(220, 54%, 39%)"
  nsw-info-bg: "hsl(228, 33%, 93%)"
typography:
  display:
    fontFamily: "Public Sans, sans-serif"
    fontSize: "3rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.1em"
  headline:
    fontFamily: "Public Sans, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Public Sans, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Public Sans, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Public Sans, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.05em"
rounded:
  none: "0px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.none}"
    padding: "8px 16px"
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.secondary-foreground}"
    rounded: "{rounded.none}"
    padding: "8px 16px"
  button-destructive:
    backgroundColor: "{colors.destructive}"
    textColor: "{colors.destructive-foreground}"
    rounded: "{rounded.none}"
    padding: "8px 16px"
---

# Design System: DREAM Allergy Management

## Overview

**Creative North Star: "Clinical Workbench"**

The DREAM design system embodies a rigorous, professional clinical instrument. Designed for clinicians, allergists, and nurses evaluating high-stakes perioperative anaphylaxis cases, the interface prioritizes immediate clarity, rapid data entry, error prevention, and dense visual scannability over consumer decoration or trendy gradients.

Every surface is crisp, rectangular, and purposeful. Visual rhythm is defined by precise 1px structural borders, distinct severity status badges, high-contrast typography, and restrained interactive feedback. The aesthetic draws direct authority from the NSW Health institutional design palette (NSW Health Navy `#002664`, NSW Supplementary Blue `#146CFD`, and NSW Brand Light Blue `#CBEDFD`).

**Key Characteristics:**
- **Zero Radius / Sharp Geometry:** True rectangular corners (`rounded-none` / `0px`) across all cards, dialogs, inputs, buttons, and badges.
- **High-Density Clinical Utility:** Compact tables, structured form grids, visible keyboard focus indicators, and distinct grade indicators (Grade I–IV).
- **Semantic Consistency:** Direct reliance on theme-aware CSS custom properties (`--primary`, `--card`, `--border`, `--status-gradeX`) without one-off hardcoded color utilities.
- **Dual-Theme Fidelity:** Clean medical slate light theme and deep dark mode (`#1a1a1a` background, `#242424` cards, `#383838` borders) with calibrated high-contrast status colors.
- **Print-First Hygiene:** Comprehensive print stylesheets optimized for A4 clinical documentation and eMR medical record archiving.

## Colors

The palette combines authoritative NSW Health clinical navy with functional alert and reaction severity tokens.

### Primary
- **NSW Health Navy** (`hsl(217 100% 19.6%)` / `#002664` in Light Mode, `hsl(217 90% 62%)` in Dark Mode): Used for the application header bar, active navigation indicators, primary action buttons, key brand headings, and active focus rings.

### Secondary
- **Clinical Slate Neutral** (`hsl(210 40% 96.1%)` / `#f1f5f9` in Light Mode, `hsl(0 0% 18%)` in Dark Mode): Used for secondary buttons, subtle container backdrops, and table sub-headers.

### Status & Severity (Clinical Grading & State Feedback)
- **Grade I — Mild (Cutaneous/Mucosal)** (`hsl(142.1 76.2% 36.3%)` / `#16a34a` in Light, `hsl(142 65% 48%)` in Dark): Emerald badge for generalized erythema, urticaria, or angioedema.
- **Grade II — Moderate (Multi-system)** (`hsl(37.7 92.1% 50.2%)` / `#f59e0b` in Light, `hsl(44 90% 52%)` in Dark): Amber badge for cutaneous signs plus mild respiratory/cardiovascular features.
- **Grade III — Severe (Life-threatening)** (`hsl(24.6 95% 53.1%)` / `#f97316` in Light, `hsl(25 90% 55%)` in Dark): Orange badge for bronchospasm, cardiovascular collapse, or profound shock.
- **Grade IV — Critical (Cardiac Arrest)** (`hsl(346.8 77.2% 49.8%)` / `#e11d48` in Light, `hsl(347 75% 55%)` in Dark): Rose/red badge for circulatory arrest requiring CPR.
- **Status Success** (`--status-success`): Feedback state for successful observations, completed protocols, and verified data.
- **Status Warning** (`--status-warning`): Feedback state for unsaved draft changes, outstanding documents, and pharmacy preparation alerts.
- **Status Danger** (`--status-danger`): Feedback state for positive test wheals (≥3mm), adverse challenge reactions, and suspected culprit agents.
- **Status Info** (`--status-info`): Informational state for drafted plans and guidance callouts.
- **Status Neutral** (`--status-neutral`): Neutral baseline state for referral worklist items and unflagged records.
- **Direct Testing Path** (`--path-testing`): Dedicated deep teal token (`hsl(174 72% 28%)` in Light, `hsl(174 58% 46%)` in Dark) for the direct-testing onboarding path card. It is deliberately NOT a clinical status colour, preserving the integrity of clinical severity feedback.

### Drug Category Tokens
All 10 clinical drug categories and default categories consume semantic CSS tokens (`--cat-<category>-*`) mapped through Tailwind namespaces (`bg-category-...`, `text-category-...`, `border-l-category-...`):
- `Muscle Relaxants` (`--cat-muscle-relaxants-*`): Blue semantic namespace.
- `Penicillins` (`--cat-penicillins-*`): Emerald semantic namespace.
- `Cephalosporins` (`--cat-cephalosporins-*`): Amber semantic namespace.
- `Hypnotics` (`--cat-hypnotics-*`): Indigo semantic namespace.
- `Local Anaesthetics` (`--cat-local-anaesthetics-*`): Teal semantic namespace.
- `Opioids` (`--cat-opioids-*`): Orange semantic namespace.
- `Antiseptics` (`--cat-antiseptics-*`): Rose semantic namespace.
- `Others` (`--cat-others-*`): Slate semantic namespace.
- `Reversal Agents` (`--cat-reversal-agents-*`): Violet semantic namespace.
- `Proton Pump Inhibitors` (`--cat-proton-pump-inhibitors-*`): Cyan semantic namespace.
- `Default Category` (`--cat-default-*`): Muted slate fallback.

### App Navigation Chrome Tokens
App navigation chrome uses a dedicated semantic token namespace (`--masthead-*`) that intentionally stays deep navy in BOTH light and dark themes to ensure accessible contrast (white-on-navy ≥12:1 and accent-on-navy ≥9:1) while allowing the main viewport canvas to transition into deep dark mode. These tokens style the persistent desktop sidebar and the compact mobile identity row:
- `--masthead` (`hsl(217 100% 19.6%)` in Light, `hsl(217 100% 14%)` in Dark): Navigation sidebar and mobile identity row background.
- `--masthead-foreground` (`hsl(0 0% 100%)` in Light and Dark): Pure white navigation chrome text and icons.
- `--masthead-accent` (`hsl(199 92% 89%)` in Light, `hsl(199 92% 85%)` in Dark): Pale NSW blue leading indicator and focus ring indicator for active sidebar navigation.
- `--masthead-border` (`hsl(217 100% 30%)` in Light, `hsl(217 60% 26%)` in Dark): Divider and border framing within navigation chrome.
- `--masthead-edge` (`hsl(349 82.2% 46.3%)` / `#D7153A` in Light, `hsl(347 100% 66.1%)` / `#FF5277` in Dark): SCRATCH's restrained red identity edge. Rendered as a 3px vertical border on the persistent desktop sidebar rail (`border-r-[3px] border-r-masthead-edge`) at the sidebar/content boundary and as a 3px bottom edge on the PIN gate's central lock-station frame (`border-b-[3px] border-b-masthead-edge`). It is a chrome-only identity signal — deliberately separate from `--status-danger`, `--status-grade4`, and clinical warning semantics. It must never be reused for errors, positive test wheals, severity grades, or any clinical feedback; red carries clinical meaning elsewhere in DREAM, and this token is reserved exclusively for application identity framing.

### Chrome Cohesion
**Chrome Cohesion.** `AppTopBar`'s page-icon chip (light `--primary` tint + border, solid `--primary` icon) and its `xl:`-only 3px top border extend `--primary` beyond the "Report active" badge to visually tether the top bar to the navy sidebar/masthead system, without tinting body text or backgrounds. The application chrome features a restrained 3px `masthead-edge` identity signal (see `--masthead-edge` above) on the desktop sidebar boundary (`border-r-[3px] border-r-masthead-edge`) and the PIN gate lock-station frame (`border-b-[3px] border-b-masthead-edge`), while the top bar and standalone headers maintain clean neutral dividers (`border-b border-border` on the outer header, `border-b border-masthead-border` on mobile/tablet identity rows). `ClinicalContextBar` (the patient identity bar) uses a single 6px `border-l-primary` accent stripe — reusing `--primary` rather than a dedicated token, since the stripe signals "verified institutional chrome," the same meaning `--primary` already carries elsewhere, not a new clinical category. Patient name/MRN/DOB text in this bar is always `text-foreground` in both themes — never `--primary` — because `--primary` on `--card` measures only ~4.6:1 in dark mode, too close to the AA floor for the app's single highest-stakes anti-mix-up string.

### Neutral
- **Background** (`hsl(210 40% 98%)` / `#f8fafc` Light, `hsl(0 0% 10%)` / `#1a1a1a` Dark): Main viewport canvas.
- **Card / Surface** (`hsl(0 0% 100%)` / `#ffffff` Light, `hsl(0 0% 14%)` / `#242424` Dark): Elevated clinical cards, tables, and dialog sheets.
- **Foreground Text** (`hsl(222.2 84% 4.9%)` / `#020817` Light, `hsl(0 0% 95%)` / `#f2f2f2` Dark): Primary reading text with high contrast.
- **Muted Foreground** (`hsl(215.4 16.3% 44%)` / `#5f6f82` Light, `hsl(0 0% 65%)` / `#a6a6a6` Dark): Field descriptions, timestamps, and secondary table metadata (targeting ≥4.5:1 contrast ratio).
- **Border / Divider** (`hsl(214.3 31.8% 91.4%)` / `#e2e8f0` Light, `hsl(0 0% 22%)` / `#383838` Dark): 1px structural gridlines.

### Named Rules
**The Clinical Palette Rule.** Color is never merely decorative; color carries diagnostic, navigational, or interactive meaning. Status hues (green, amber, orange, red) are reserved strictly for clinical grade, positive/negative test outcomes, or validation errors. Grade severity tokens (`--status-grade1` through `--status-grade4`) remain strictly decoupled from drug category themes.

**The Semantic Status Rule.** Feedback and alert states must use semantic status tokens (`--status-success`, `--status-warning`, `--status-danger`, `--status-info`, `--status-neutral`) rather than raw color utilities (`bg-red-600`, `bg-amber-50`, `text-green-600`).

**The Semantic Token Rule.** All UI components must consume semantic theme tokens (`--background`, `--foreground`, `--border`, `--muted`, `--primary`, `--status-*`, `--cat-*`, `--masthead-*`) rather than hardcoding static Tailwind slate or zinc values.

## Typography

**Display Font:** Public Sans (fallback: Inter, sans-serif)  
**Body Font:** Public Sans (fallback: Inter, sans-serif)  
**Monospace / Data Font:** ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace (used for numeric IDs, timestamps, MRN, wheal measurements, and concentrations with `tabular-nums`)

**Character:** Clean, objective grotesque sans-serif with high x-height and exceptional legibility across dense medical data grids and printed consultation letters. All on-screen sub-12px text sizes are migrated to scalable `text-xs` or `.section-label` (`text-[0.625rem]`), while preserving print-specific sub-12px sizing (`print:text-[8px]`, `print:text-[9px]`, `print:text-[10px]`).

### Hierarchy
- **Display** (Bold 700, `3rem` / `48px`, Line-height 1, Tracking `0.1em`): Reserved strictly for the login wordmark (`.app-wordmark`).
- **Headline (h1)** (Semibold 600, `1.875rem` / `30px`, Line-height 1.25, Tracking `-0.01em`): Main view headers and screen titles.
- **Title (h2)** (Semibold 600, `1.5rem` / `24px`, Line-height 1.3, Tracking `-0.01em`): Section headings and major card titles.
- **Subtitle (h3)** (Semibold 600, `1.25rem` / `20px`, Line-height 1.35): Subsection headings and dialog titles.
- **Card Header (h4)** (Semibold 600, `1.125rem` / `18px`, Line-height 1.4): Card titles and table group headers.
- **Body** (Regular 400, `0.875rem` / `14px` to `1rem` / `16px`, Line-height 1.5): Standard reading text and form values. Max line length 65–75ch for narrative blocks.
- **Section Label** (Bold 700, `0.75rem` / `12px`, Line-height 1.2, Tracking `0.05em`, Uppercase): Field group badges and table column headers (`.section-label`).

### Named Rules
**The Heading Balance Rule.** Major headings use `text-wrap: balance` and tight tracking (`-0.01em`) to prevent orphaned words and maintain compact vertical rhythm.

**The Dynamic Scalability Rule.** All typography respects the global `FontSizeProvider` scale multiplier (85% to 125%) to support varying clinical workstation viewing distances.

**The Print Typography Exception Rule.** High-density A4 consultation letters and testing plans intentionally utilize print-specific sub-12px typography (`print:text-[8px]`, `print:text-[9px]`, `print:text-[10px]`) and high-contrast print borders for paper print legibility and ADR stickers, while screen UI strictly adheres to the standard type ramp (`text-xs` / 12px minimum).

## Layout

The DREAM layout is structured around a single-page clinical workstation model:
- **Responsive Shell Topology:**
  - On desktop viewports (Tailwind `xl`, 1280px+), the shell renders a persistent, expanded 256px labelled left sidebar (`AppSidebar`) spanning the full viewport height with an independent scroll region, remaining visible while the content column scrolls.
  - Below `xl` (<1280px), the sidebar collapses completely (reserving zero width) and navigation is accessed via an accessible slide-over left drawer (`AppNavigationDrawer`) for tablets and phones.
  - Content column renders a dedicated Page Top Bar (`AppTopBar`) containing contextual view titles, subtitles, non-interactive status badges ("Testing draft", "Report active"), page actions, display settings, and theme toggle. Top bar contains no destination links.
- **Unified Sticky Chrome Stack:** A single measured sticky chrome stack in the content column containing the top bar, optional clinical context bar, and disclaimer/warning banners. It measures its total rendered height and publishes `--app-chrome-height` to the root element (unaffected by the sidebar), powering smooth scroll margins and sticky offsets without layout jank or competing sticky layers.
- **Container Max-Width:** Content container constrained to `max-w-6xl` (1152px) with responsive horizontal padding (`px-4 sm:px-5 md:px-6`) ensuring dense readability on desktop monitors and clinical tablets.
- **Spacing Rhythm:** Based on an 8px modular baseline (4px / 8px / 16px / 24px / 32px). Dense data grids use 4px–8px internal cell padding; card sections use 16px–24px gaps.
- **Responsive Adaptability & Table Safeguards:**
  - In intermediate viewports (768px–1024px), table columns for patient names, procedures, and suspect agents enforce safe width constraints (`max-w-[130px] md:max-w-[150px] lg:max-w-[180px] truncate`) with full-value accessible `title` attributes.
  - Mobile card views and pagination touch controls enforce a minimum 44px tap target height.

### Named Rules
**The Responsive Header & No-Overflow Rule.** The page top bar, and clinical context layers stack within a single measured sticky chrome container that publishes `--app-chrome-height`. The navigation and header chrome must adapt responsively across viewports without horizontal scrolling, line breaking, or title truncation, holding robustly even at 125% root font scaling. Content containers strictly enforce `max-w-6xl` with `px-4 sm:px-5 md:px-6` responsive padding, and dense data tables must use bounded column widths with accessible text truncation.

**The App-Navigation Surface Rule.** Exactly one primary app-navigation surface is visible per breakpoint: a persistent 256px left sidebar at `xl` (1280px+) and an off-canvas drawer below `xl`. App navigation and in-page workflow navigation can both be vertical but must differ by location (viewport sidebar vs content card), grouping, background token (`--masthead` vs `--card`), and active treatment: desktop sidebar active rows use subtle masthead-toned contrast plus a 1px pale-blue leading indicator (`border-masthead-accent`), drawer active rows use accent surface plus a 1px leading indicator, and in-page step navigation uses workflow active surface tokens.

## Browser Surfaces & Interaction

- **Selection:** `::selection` uses `hsl(var(--accent))` and `hsl(var(--accent-foreground))` to harmonize highlighted text with NSW Health brand accents.
- **Caret:** Text inputs and textareas enforce `caret-color: hsl(var(--primary))` for consistent brand feedback during data entry.
- **Custom Scrollbars:** Thin zero-radius scrollbars (`scrollbar-width: thin; scrollbar-color: hsl(var(--border)) transparent;` with rectangular thumb) align with the rectangular clinical workstation aesthetic.
- **Focus & Motion:** All interactive elements provide crisp keyboard focus outlines (`*:focus-visible` with 2px ring and ring offset). Screen transitions use subtle CSS reveals (`animate-screen-enter`, `btn-press`) and strictly respect `prefers-reduced-motion` with zero decorative spring bounce animations.

### Named Rules
**The Browser Surfaces Rule.** Browser surfaces, selection highlights, input carets, and scrollbars must strictly mirror the application's semantic color tokens and zero-radius geometry.

**The Accessible Focus & Motion Rule.** All interactive controls must provide distinct, high-contrast `:focus-visible` indicators. Motion is restrained and functional, never decorative or disorienting.

## Elevation & Depth

Surfaces in DREAM are intentionally flat and architectural. Depth is established through subtle 1px border lines (`border border-border`) and tonal background shifts rather than heavy floating drop shadows.

### Shadow Vocabulary
- **Resting Flat** (`box-shadow: none` / `border: 1px solid hsl(var(--border))`): Default state for cards, tables, and form sections.
- **Resting Subtle** (`shadow-sm` / `0 1px 2px 0 rgb(0 0 0 / 0.05)`): Applied to top header and primary action cards.
- **Interactive Hover** (`shadow-lg` / `0 10px 15px -3px rgb(0 0 0 / 0.1)` + `-translate-y-1`): Applied strictly to clickable card selection tiles (`.card-interactive`).
- **Modal / Dialog** (`shadow-xl` / `0 20px 25px -5px rgb(0 0 0 / 0.1)`): Applied to dialog popups, dropdown menus, and slide-over sheets.

### Named Rules
**The Flat-By-Default Rule.** Surfaces rest flat with clean 1px structural borders. Shadows exist only to indicate active elevation (modals, dropdowns) or interactive hover affordances.

## Shapes

DREAM adopts a strict, authoritative **sharp-corner form language** (`radius: 0` / `rounded-none`).

- **Corners:** 0px border radius across all cards, buttons, inputs, dropdown menus, tabs, tooltips, dialogs, and status badges.
- **Borders:** Consistent 1px solid borders using `hsl(var(--border))` to frame clinical cards, table cells, and input controls.
- **Visual Silhouette:** Rectangular, laboratory-instrument aesthetic that conveys institutional stability, clinical precision, and alignment with NSW Health digital guidelines.

## Components & Clinical Affordances

### Buttons
- **Shape:** Rectangular (`rounded-none`).
- **Primary:** Background `hsl(var(--primary))`, text `hsl(var(--primary-foreground))`, padding `8px 16px` (`h-10 px-4`), semibold font. Hover darkens or lifts subtly.
- **Secondary:** Background `hsl(var(--secondary))`, text `hsl(var(--secondary-foreground))`, border `1px solid hsl(var(--border))`.
- **Destructive:** Background `hsl(var(--destructive))`, text `hsl(var(--destructive-foreground))`.
- **Ghost / Outline:** Transparent background, visible border or text on hover.
- **Interaction:** Micro-press tactile feedback (`active:scale-[0.96]`), visible focus ring with 2px offset (`focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`).

### Cards & Containers
- **Shape:** Rectangular (`rounded-none`), border `1px solid hsl(var(--border))`, background `hsl(var(--card))`.
- **Card Header:** Border-bottom `1px solid hsl(var(--border))` where distinct division is required; padding `16px 20px`.
- **Interactive Card:** Card with `.card-interactive` class providing subtle hover lift and shadow for clickable patient or tool selection.

### Form Inputs & Textareas
- **Shape:** Rectangular (`rounded-none`), border `1px solid hsl(var(--input))`, background `hsl(var(--background))` or `hsl(var(--card))`.
- **Focus:** Crisp 2px outline `outline-2 outline-ring outline-offset-0` or `ring-2 ring-ring`.
- **Disabled State:** Opacity 50%, cursor not-allowed.

### Tables & Data Grids
- **Header:** Background `hsl(var(--muted))`, text `hsl(var(--muted-foreground))`, uppercase tracking-wider font (`text-xs font-bold`).
- **Rows:** Alternating subtle hover state (`hover:bg-muted/50`), border-bottom `1px solid hsl(var(--border))`.
- **Clinical Badges:** Pill-free rectangular badges with high-contrast text and border matching clinical status colors.

### Clinical Affordances
- **DraftSaveIndicator:** Unobtrusive status text displaying draft lifecycle states:
  - *Unsaved changes:* `text-status-warning font-semibold` without exposing patient details.
  - *Saving:* `text-muted-foreground animate-pulse` ("Saving…").
  - *Saved:* `text-muted-foreground` ("Draft saved · HH:mm").
  - *No draft:* Hidden or subdued label ("No draft").
- **Pharmacy Verification Alert:** On-screen uses `border border-status-warning bg-status-warning/10 text-status-warning font-semibold text-xs` with `⚠ Confirm preparation with pharmacy`. Print views override to high-contrast black-and-white (`print:border-black print:bg-white print:text-[8px] print:text-black rounded-none`).

## Do's and Don'ts

### Do:
- **Do** maintain strict zero-radius (`rounded-none` / `0px`) styling across all UI elements and shadcn components.
- **Do** use semantic CSS tokens (`--primary`, `--background`, `--card`, `--border`, `--muted-foreground`, `--status-*`, `--cat-*`) across all screens.
- **Do** ensure all interactive buttons and controls have visible keyboard focus indicators (`*:focus-visible`).
- **Do** target WCAG AA minimum 4.5:1 text contrast ratios across light and dark themes.
- **Do** ensure all print views (testing plans, clinical reports, patient handouts) contain `@media print` break controls and zero animations.
- **Do** maintain the 4-digit PIN screen-lock as a shoulder-surfing safeguard on shared clinic terminals.

### Don't:
- **Don't** apply rounded corners (`rounded-md`, `rounded-lg`, `rounded-full`, etc.) to any component or card container.
- **Don't** use decorative purple, cyan, or rainbow gradient text fills or neon border glows.
- **Don't** add decorative or bouncy spring animations that slow down clinical workflows.
- **Don't** hardcode static Tailwind color utilities (e.g. `text-slate-900`, `bg-white`, `border-slate-200`) where semantic variables exist.
- **Don't** break table rows or clinical signatures across pages when rendering print sheets.
- **Don't** exfiltrate or send any patient identifying information to external network services.
