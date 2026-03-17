# RPAH Anaesthetic Allergy Clinic — Stakeholder Brief

**Date:** 19 March 2026
**Prepared for:** Clinical Team, Department of Clinical Immunology & Allergy
**Document type:** Project brief

---

## Executive Summary

The Anaesthetic Allergy Clinic Management System is a purpose-built web application designed to streamline how our clinic manages patient data, records skin testing results, and generates clinical documentation. It replaces fragmented manual workflows with a single, unified tool accessible from any browser — including offline on clinic devices.

---

## The Problem

Our current workflow relies on a combination of REDCap data exports, spreadsheets, and paper-based recording during testing sessions. This creates several pain points:

- **Fragmented data access** — clinicians must navigate between REDCap, printed summaries, and handwritten notes during a testing session.
- **Manual transcription** — SPT and IDT results are recorded on paper and later transferred to digital records, increasing the risk of transcription errors.
- **Limited visibility** — there is no consolidated view of clinic-wide analytics such as reaction severity distributions, common culprit agents, or outcome trends.
- **Time-consuming reporting** — generating patient handouts, clinical reports, and testing plans requires manual formatting.

---

## The Solution

A responsive web application that provides:

| Capability | Description |
|---|---|
| **Patient Dashboard** | Searchable database with reaction grading, severity statistics, and advanced filtering by grade, date, hospital, outcome, and suspected agents. |
| **Skin Testing Log** | Structured recording of SPT, IDT (1:100, 1:10, Neat), drug challenge outcomes, reaction timing, symptoms, and treatment interventions. |
| **Clinical Reports** | Auto-generated clinical reports and patient handouts, formatted for print. |
| **Testing Plan Generator** | Pre-populated testing plans based on patient history and suspected agents. |
| **REDCap Integration** | Direct CSV upload from REDCap exports with validation, duplicate detection, and error reporting. |
| **Offline Access** | Progressive Web App (PWA) — works without internet once loaded. Installable on clinic tablets and laptops. |

---

## Progress to Date

| Metric | Value |
|---|---|
| Total releases | 33 (v0.1.0 → v0.25.0) |
| Current version | v0.25.0 "Vecuronium" |
| Key milestone | v0.10.0 — Offline capability and PWA support |
| Recent focus | Performance optimisation, accessibility compliance, dark mode |

**Notable capabilities delivered:**
- Full dark mode with automatic device preference detection
- WCAG accessibility compliance (keyboard navigation, screen reader support)
- Advanced search and filtering across the patient database
- Animated analytics dashboard with real-time statistics
- CSV import with validation, duplicate detection, and detailed error feedback

---

## Technology Highlights

- **Frontend:** React 19 with TypeScript — modern, maintainable codebase
- **Hosting:** Cloudflare Pages — fast global delivery, zero server management
- **Data:** Client-side storage with REDCap CSV import/export — no separate database required
- **Quality:** Automated testing (Playwright E2E, Vitest unit tests), accessibility scanning (axe-core), error monitoring (Sentry)
- **Standards:** WCAG 2.1 compliant, responsive design, NSW Health alignment

---

## Next Steps

| Action | Owner | Timeline |
|---|---|---|
| Clinical team demo and feedback collection | [Presenter] | This week |
| Incorporate feedback from stakeholder session | Development | Following 2 weeks |
| Expanded testing with live clinic data | Clinical team | Ongoing |
| Explore integration options with hospital systems | IT / Clinical | Q2 2026 |

---

## Contact

For questions, feedback, or access requests, please contact the development team via the application's **Contact / Support** page or raise items directly during the stakeholder session.
