import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui';
import { ShieldCheck, LayoutDashboard, Database } from 'lucide-react';
import { Screen } from '../types';

interface ChangelogProps {
  setScreen: (screen: Screen) => void;
  databaseDate: string;
}

const Changelog: React.FC<ChangelogProps> = ({ setScreen, databaseDate }) => {
  const versions = [
    {
        version: "v0.3.16",
        changes: [
            "UI: Fixed an issue where the Outcome and Save Record sections in the Testing Log were cut off or inaccessible on some mobile devices by significantly increasing bottom spacing.",
            "UI: Improved responsiveness of the Outcome selection buttons in the Testing Log to prevent text truncation on small screens.",
            "UI: Enhanced patient detail visibility on mobile view."
        ]
    },
    {
        version: "v0.3.15",
        changes: [
            "Rebranding: Updated application title to 'Anaesthetic Allergy Clinic' and department subtitle to 'RPAH Department of Clinical Immunology & Allergy'.",
            "Data: Standardized mock patient data so all dates of birth default to the 1st of the month for consistency.",
            "UI: Redesigned the application footer for a more professional appearance and improved information hierarchy."
        ]
    },
    {
        version: "v0.3.14",
        changes: [
            "Data: Complete restoration of the 92-record mock patient dataset, covering a wider geographical area (NSW Regional Hospitals) and diverse reaction types.",
            "UI: Global animation improvements for smoother transitions."
        ]
    },
    {
        version: "v0.3.13",
        changes: [
            "Data: Restored and expanded mock patient database to 40 records, covering a wider range of agents (Antibiotics, NMBAs, Dyes, Latex).",
            "Data: Added specific cases for Chlorhexidine, Patent Blue, Protamine, and Sugammadex reactions."
        ]
    },
    {
        version: "v0.3.12",
        changes: [
            "UI: Added spacing to the top of the Testing Plan Preview for better visibility.",
            "Feature: Added 'Proceed to Testing Panel' button to the Testing Plan Preview screen to streamline workflow."
        ]
    },
    {
        version: "v0.3.11",
        changes: [
            "Fix: Resolved an issue where printing the Testing Plan Request Form would result in empty pages.",
            "Refactor: Moved the Testing Plan printing view to a dedicated screen to ensure reliable rendering.",
            "UI: Improved the 'Testing Plan Preview' interface."
        ]
    },
    {
        version: "v0.3.10",
        changes: [
            "UI: Renamed 'Post-induction' section in Patient History to 'Induction & Post-induction' for clarity.",
            "Fix: Improved CSV import time parsing logic to ensure medications are correctly categorized based on induction time.",
            "Data: Updated sample patient data to include examples of induction/post-induction medications.",
            "System: Standardized time comparison to handle mixed time formats (e.g. 9:00 vs 09:00)."
        ]
    },
    {
        version: "v0.3.9",
        changes: [
            "UI: Fixed inconsistent header heights between Dashboard and Log screens by standardizing subtitles.",
            "UI: Added 'RPAH Immunology & Allergy' subtitle to all main application screens for consistent branding.",
            "System: Minor layout optimizations in App.tsx."
        ]
    },
    {
        version: "v0.3.8",
        changes: [
            "Refactor: Implemented centralized ScreenLayout component to standardize page structure.",
            "Fix: Resolved duplicate header issue on Dashboard screen.",
            "Cleanup: Optimized App.tsx and child components by removing redundant layout code.",
            "UI: Improved consistency of theme toggles and header actions across all screens."
        ]
    },
    {
      version: "v0.3.7",
      changes: [
        "Mobile: Completely refactored Skin Testing Log for small screens. Now uses a card-based layout with clearer labels to prevent cramping.",
        "Mobile: Optimised Clinical Report layout for mobile devices, switching tables to stacked lists.",
        "UI: Increased touch target sizes for primary action buttons on the Clinical Report screen.",
        "Fix: Resolved an issue where the Testing Plan / Request Form print preview would appear blank.",
        "UI: Replaced 'Cancel' button with a close icon in the Testing Plan modal."
      ]
    },
    {
      version: "v0.3.6",
      changes: [
        "UI: Standardised page width across Dashboard, Log, and Reports for a uniform experience.",
        "UI: Adjusted header styling to be consistent across all screens.",
        "Fix: Resolved readability issues in Patient Handout contact section in Dark Mode.",
        "System: General layout optimisations."
      ]
    },
    {
      version: "v0.3.5",
      changes: [
        "Patient History: Enhanced visual design with card-based layout and improved information hierarchy.",
        "System: Centralised logic for reaction grading and test interpretation to improve performance and consistency.",
        "Data: Added robust error handling and validation for CSV database uploads.",
        "Data: Database 'Updated Date' now dynamically reflects the last CSV upload time.",
        "UI: Refined reaction grade colour palette for better accessibility and distinction."
      ]
    },
    {
      version: "v0.3.4",
      changes: [
        "Feature: Added full Dark Mode support across the entire application.",
        "System: Theme preference (Light/Dark) is now persisted between sessions.",
        "UI: Added Theme Toggle button to the header of all screens.",
        "UI: Updated all components (Cards, Inputs, Tables) for high contrast in dark mode."
      ]
    },
    {
      version: "v0.3.3",
      changes: [
        "Testing Log: Enhanced 'IV Challenge' dropdown with custom text input for 'Other' drugs.",
        "Dashboard: Implemented accordion layout for 'Positive Skin Test Breakdown' to save space.",
        "Dashboard: Added 'Expand/Collapse All' controls for the breakdown table.",
        "UI: Improved alignment of custom drug inputs in the testing grid.",
        "System: Demo disclaimer dismissal is now remembered across sessions."
      ]
    },
    {
      version: "v0.3.2",
      changes: [
        "Dashboard: Positive Skin Test Breakdown is now grouped by drug category.",
        "Dashboard: Top Suspected Agents chart filters out zero-count agents and sorts 'Other' to bottom.",
        "UI: Added standardized footer to all screens.",
        "UI: Fixed print preview formatting in Testing Plan Generator (bullets instead of checkboxes).",
        "UI: Demo Disclaimer now persists on all screens until dismissed."
      ]
    },
    {
      version: "v0.3.1",
      changes: [
        "Updated Dashboard to display skin test statistics grouped by drug category.",
        "Added consistent footer across all application screens.",
        "Refined printing layouts for reports."
      ]
    },
    {
      version: "v0.3.0",
      changes: [
        "Major Refactor: Split 'Patient History' and 'Testing' into separate screens for better workflow.",
        "Introduced 'Testing Plan Generator' to creating printable request forms.",
        "Enhanced 'Patient Selection' with search filtering.",
        "Improved 'Reaction Grade' visualisation with tooltips."
      ]
    },
    {
      version: "v0.2.9",
      changes: [
        "Added CSV upload functionality to update the patient database.",
        "Implemented pagination for the Patient Database in Dashboard.",
        "Added visual charts for Reaction Severity and Top Suspected Agents.",
        "Refined Dashboard layout for better information density."
      ]
    },
    {
      version: "v0.2.8",
      changes: [
        "Added Changelog page accessible from footer.",
        "Updated Dashboard to include recent skin testing activity.",
        "Enhanced 'Positive Skin Test Breakdown' table with specific test columns.",
        "Improved layout for statistics cards in Dashboard."
      ]
    },
    {
      version: "v0.2.7",
      changes: [
        "Implemented dynamic patient database search.",
        "Added 'Hospital' field to demographics display.",
        "Refined Patient History card styling with better spacing and layout.",
        "Added 'Anaesthetic Allergy Testing' section header."
      ]
    },
    {
      version: "v0.2.6",
      changes: [
        "Integrated full REDCap dataset (92 records).",
        "Added logic to parse induction and reaction times.",
        "Implemented 'Other' grouping for non-standard drugs in dashboard analytics."
      ]
    },
     {
      version: "v0.2.5",
      changes: [
        "Migrated application to React with Shadcn UI components.",
        "Implemented accordion view for patient history.",
        "Added PDF-style print layouts for Clinical Report and Patient Handout."
      ]
    }
  ];

  return (
    <div className="p-6 space-y-6">
        <Card>
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#e6e1fd] dark:bg-purple-900/40 rounded-full">
                        <ShieldCheck className="w-6 h-6 text-[#8055f1] dark:text-purple-300" />
                    </div>
                    <div>
                        <CardTitle className="text-xl text-[#441170] dark:text-purple-300">Version History</CardTitle>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Track updates and improvements to the Anaesthetic Allergy Log.</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-3 space-y-8">
                    {versions.map((v, idx) => (
                        <div key={idx} className="relative pl-8">
                            {/* Timeline Dot */}
                            <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 border-white dark:border-slate-900 bg-[#8055f1] shadow-sm" />
                            
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{v.version}</h3>
                            </div>
                            
                            <ul className="list-disc list-outside text-sm text-slate-600 dark:text-slate-300 space-y-1 ml-4">
                                {v.changes.map((change, cIdx) => (
                                    <li key={cIdx}>{change}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full border-l-4 border-l-blue-500" onClick={() => setScreen('dashboard')}>
                <CardContent className="p-6 flex items-center gap-4 h-full">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-full shrink-0">
                        <LayoutDashboard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-slate-100">View Dashboard</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">See aggregate statistics and recent activity.</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full border-l-4 border-l-green-500" onClick={() => setScreen('log')}>
                <CardContent className="p-6 flex items-center gap-4 h-full">
                    <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-full shrink-0">
                        <Database className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-slate-100">Return to Log</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Enter new patient data or testing results.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
  );
};

export default Changelog;