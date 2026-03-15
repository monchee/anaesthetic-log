import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button } from './ui';
import { ShieldCheck, Home, Sparkles } from 'lucide-react';
import { Screen } from '../types';

interface ChangelogProps {
  setScreen: (screen: Screen) => void;
  databaseDate: string;
}

const Changelog: React.FC<ChangelogProps> = ({ setScreen }) => {
  const versions = [
    {
      version: "v0.24.0",
      codename: "Suxamethonium",
      highlight: true,
      changes: [
        "Comprehensive dark mode overhaul with NSW Health Blue branding maintained across light and dark themes.",
        "Replaced 100+ instances of hardcoded dark mode classes with semantic CSS variables for consistency.",
        "Softer dark backgrounds (slate-900 instead of slate-950) to reduce eye strain during extended use.",
        "Enhanced ThemeProvider with system preference detection - respects OS dark mode setting on first load.",
        "Added smooth theme transitions (200ms) for polished theme switching experience.",
        "Improved contrast ratios across all components meeting WCAG AA accessibility standards.",
        "Standardized medical status colors (Grade I-IV) to remain bright for clinical safety in dark mode.",
      ]
    },
    {
      version: "v0.23.0",
      codename: "Rocuronium",
      highlight: false,
      changes: [
        "Removed 8 unused animated wrapper components (~350 lines) and replaced with TailwindCSS utilities for cleaner code.",
        "Eliminated framer-motion dependency, reducing bundle size by ~40KB gzipped.",
        "Added reusable utility classes to index.css (.card-compact, .card-interactive, .hover-scale, etc.).",
        "Standardized animation patterns using TailwindCSS and Radix UI built-in animations.",
        "Updated documentation to reflect modern TailwindCSS-first approach.",
      ]
    },
    {
      version: "v0.22.0",
      codename: "Propofol",
      highlight: false,
      changes: [
        "Optimized mobile and tablet experience with progressive responsive spacing (25-50% reduction on mobile, 15-25% on tablet).",
        "Fixed inverted padding bug in TestingLogForm where mobile had more padding than desktop.",
        "Enhanced content visibility on mobile devices with 15-20% more content above the fold.",
        "Refined responsive breakpoints across ScreenLayout, Cards, Dialogs, Forms, and Footer components.",
      ]
    },
    {
      version: "v0.21.0",
      codename: "Etomidate",
      highlight: true,
      changes: [
        "Resolved tooltip contrast issues by removing hardcoded white text overriding themed backgrounds.",
        "Refactored Dashboard test suite for improved selector reliability and responsive view handling.",
        "Standardized status badges and challenge section buttons with theme-aware text tokens.",
        "Enhanced accessibility of HoverCard components with adaptive contrast across light and dark modes.",
      ]
    },
    {
      version: "v0.20.0",
      codename: "Ketamine",
      highlight: false,
      changes: [
        "Implemented path-based deep linking, enabling direct access to pages via specific URLs.",
        "Synchronized application state with browser history for a seamless back/forward navigation experience.",
        "Configured SPA routing support for production deployment environments.",
        "Refined navigation hooks for improved performance and state reliability.",
      ]
    },
    {
      version: "v0.19.0",
      codename: "Cisatracurium",
      highlight: false,
      changes: [
        "Standardized top bar button interactions with consistent white text on hover for high contrast against dark backgrounds.",
        "Refined Dashboard 'Upload CSV' trigger with enhanced hover states and responsive background transitions.",
        "Optimized core Sheet animations by cleaning up Tailwind config conflicts, restoring clean horizontal slide-in/out patterns.",
        "Harmonized navigation menu styling with translucent hover backgrounds and responsive visual feedback.",
      ]
    },
    {
      version: "v0.18.0",
      codename: "Sugammadex",
      highlight: false,
      changes: [
        "Implemented 'Utility Belt' horizontal filter bar with Popover-based controls for severity, outcome, date, and hospital.",
        "Redesigned filter navigation to reclaim dashboard space while ensuring filters apply instantly (auto-apply).",
        "Enhanced Reaction Severity selection with a custom grid-wrap layout for improved touch ergonomics.",
        "Refactored Suspected Agents selection into an inline expandable panel with integrated search.",
      ]
    },
    {
      version: "v0.17.0",
      codename: "Remifentanil",
      highlight: false,
      changes: [
        "Implemented Route-based Code Splitting using React.lazy and Suspense, reducing initial bundle size by ~85KB.",
        "Conducted comprehensive Security Review against OWASP Top 10 standards.",
        "Remediated 14 dependency vulnerabilities including deep-tree security overrides for serialize-javascript.",
        "Optimized application shell with a shared loading state for lazy-loaded clinical resources.",
      ]
    },
    {
      version: "v0.16.0",
      codename: "Bupivacaine",
      highlight: false,
      changes: [
        "System-wide elimination of rounded corners for a sharp, clinical design profile.",
        "Standardized all UI primitives (Buttons, Cards, Inputs, Dialogs) with 'rounded-none' geometry.",
        "Refined dashboard analytics and charts with high-precision, square-edged layouts.",
        "Updated technical documentation and privacy policies to match the new clinical aesthetic.",
      ]
    },
    {
      version: "v0.15.0",
      codename: "Lignocaine",
      highlight: false,
      changes: [
        "Comprehensive typography overhaul aligning with NSW Health standards.",
        "Integrated 'Public Sans' font and NSW Health Blue branding throughout the application.",
        "Standardized clinical form layouts (Testing Log, Patient History) and print views for professional presentation.",
        "Unified top bar button styling and internal accessibility labels for improved usability.",
      ]
    },
    {
      version: "v0.14.0",
      codename: "Rocuronium",
      highlight: false,
      changes: [
        "Internal improvements - code quality checks now run faster and more reliably.",
        "Better test coverage helps catch bugs before they reach you.",
        "Performance optimisations make updates smoother.",
      ]
    },
    {
      version: "v0.13.0",
      codename: "Neostigmine",
      highlight: false,
      changes: [
        "Added legal and governance documentation pages (Privacy Policy, Clinical Governance, Terms of Use, Technical Documentation, Disclaimer).",
        "Content aligned with Australian healthcare standards (OAIC Privacy Principles, NSQHS Clinical Governance Standard, NSW Health guidelines).",
        "New footer section with legal links for easy access to compliance information.",
      ]
    },
    {
      version: "v0.12.0",
      codename: "Propofol",
      highlight: false,
      changes: [
        "Condensed Quick Start Guide - now more compact and easier to scan.",
        "Upload CSV now opens instruction side sheet (matches Dashboard).",
        "Added step-by-step REDCap export instructions to upload flow.",
      ]
    },
    {
      version: "v0.11.0",
      codename: "Suxamethonium",
      highlight: false,
      changes: [
        "Improved accessibility throughout the app - better keyboard navigation and screen reader support.",
        "Updated notification messages to be clearer and less intrusive.",
        "Enhanced visual consistency across all screens and menus.",
        "Improved allergy grade badges with clearer colour coding for quick identification.",
        "Better support for light and dark themes across all components.",
        "Menu items are now easier to tap on mobile devices.",
      ]
    },
    {
      version: "v0.10.0",
      codename: "Sevoflurane",
      changes: [
        "App now works offline - you can use it without an internet connection.",
        "Faster loading times and quicker access to patient data.",
        "Added proper app icons when installed on phones and tablets.",
        "Cleaner header with a new menu button for easier navigation.",
        "Quick Start Guide and other links moved to the new menu.",
        "New version notifications - you'll be prompted when updates are available.",
      ]
    },
    {
      version: "v0.9.0",
      codename: "Desflurane",
      changes: [
        "Added new information pages: About, FAQ, Drug Reference, Contact, and Resources.",
        "Redesigned dashboard with cleaner statistics display.",
        "Search filters are now visible by default for easier access.",
        "Quick Start Guide opens automatically when you first use the app.",
      ]
    },
    {
      version: "v0.8.0",
      codename: "Propofol",
      changes: [
        "New Quick Start Guide to help you get started.",
        "Advanced Search with filters for reaction grade, date range, hospital, outcome, and suspected agents.",
        "Better patient search and filtering in the dashboard.",
        "Help button moved to the top navigation bar.",
      ]
    },
    {
      version: "v0.7.0",
      codename: "Sevoflurane",
      changes: [
        "Improved layout and spacing in the testing forms.",
        "Printed reports no longer include the header - cleaner printed output.",
        "Easier to read changelog with clearer descriptions.",
      ]
    },
    {
      version: "v0.6.0",
      codename: "Fentanyl",
      changes: [
        "Fixed issues with saving clinical records - forms now save correctly.",
        "Better error messages when something goes wrong.",
        "All text now uses Australian English spelling.",
        "Printed reports now fit neatly on a single page.",
      ]
    },
    {
      version: "v0.5.0",
      codename: "Midazolam",
      changes: [
        "Enhanced security to better protect patient information.",
        "Faster loading and uses less data.",
        "Improved tooltips and helpful information when hovering over items.",
      ]
    },
    {
      version: "v0.4.0",
      codename: "Rocuronium",
      changes: [
        "Smoother, less distracting animations in the dashboard.",
        "More stable - fewer crashes and errors.",
      ]
    },
    {
      version: "v0.3.0",
      codename: "Ketamine",
      changes: [
        "Easier workflow for viewing patient history and entering test results.",
        "New Testing Plan Generator for printable request forms.",
        "Faster patient search.",
        "Clearer display of reaction grades.",
      ]
    },
    {
      version: "v0.2.0",
      codename: "Atracurium",
      changes: [
        "Upload patient databases from CSV files.",
        "New dashboard with statistics and patient overview.",
        "Detailed patient history timeline showing medications and reactions.",
        "Support for REDCap patient records.",
      ]
    },
    {
      version: "v0.1.0",
      codename: "Lignocaine",
      changes: [
        "Initial release of the Anaesthetic Allergy Clinic application.",
        "Record skin tests and drug challenges.",
        "Generate clinical reports and patient handouts.",
        "Manage patient data and track testing results.",
      ]
    }
  ];

  return (
    <div className="p-6 space-y-6">
        <Card>
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary dark:bg-slate-900/40 rounded-none">
                        <ShieldCheck className="w-6 h-6 text-primary dark:text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-xl text-slate-900 dark:text-primary">What's New</CardTitle>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Recent updates and improvements to the application</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-3 space-y-8">
                    {versions.map((v, idx) => (
                        <div key={idx} className="relative pl-8">
                            {/* Timeline Dot */}
                            <div className={`absolute -left-[9px] top-0 h-4 w-4 rounded-none border-2 border-white dark:border-slate-900 shadow-sm ${
                              v.highlight ? 'bg-gradient-to-r from-primary to-[var(--primary)] animate-pulse' : 'bg-primary'
                            }`} />
                            
                            <div className="flex items-center gap-2 mb-3">
                                <div className="flex items-center gap-2">
                                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{v.version}</h3>
                                  {v.codename && (
                                    <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
                                      {v.codename}
                                    </span>
                                  )}
                                </div>
                                {v.highlight && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-none text-xs font-medium bg-gradient-to-r from-primary to-[var(--primary)] text-white">
                                        <Sparkles className="w-3 h-3" />
                                        Latest
                                    </span>
                                )}
                            </div>
                            
                            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-none p-4 border border-slate-100 dark:border-slate-800">
                                <ul className="space-y-2.5">
                                    {v.changes.map((change, cIdx) => (
                                        <li key={cIdx} className="flex gap-2 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                            <span className="text-primary dark:text-primary mt-1 shrink-0">•</span>
                                            <span>{change}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>

        <div className="flex justify-center pt-4">
            <Button 
                onClick={() => setScreen(Screen.LOG)}
                size="lg"
                className="bg-slate-900 hover:bg-[var(--primary)] text-white px-8"
            >
                <Home className="w-5 h-5 mr-2" />
                Return Home
            </Button>
        </div>
    </div>
  );
};

export default Changelog;
