
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui';
import { ShieldCheck, LayoutDashboard, Database } from 'lucide-react';
import { Screen } from '../types';

interface ChangelogProps {
  setScreen: (screen: Screen) => void;
  databaseDate: string;
}

const Changelog: React.FC<ChangelogProps> = ({ setScreen }) => {
  const versions = [
    {
      version: "v0.5.0",
      changes: [
        "Codebase Optimization: Comprehensive cleanup and optimization of the entire project structure.",
        "Performance: Removed unnecessary React imports using modern JSX transform for better bundle size.",
        "Dependencies: Cleaned up unused development dependencies and removed unnecessary configuration files.",
        "Architecture: Centralized application constants and removed redundant code across components.",
        "Security: Enhanced SEO protection with comprehensive robots.txt and security headers for clinical data privacy.",
        "Build: Streamlined build process by removing unused assets and optimizing asset loading.",
        "UX: Improved hover interactions with native tooltips for better accessibility and performance.",
        "System: Eliminated service worker and PWA features to focus on web application stability.",
      ]
    },
    {
      version: "v0.4.0",
      changes: [
        "Performance: Optimized dashboard animations with reduced duration and eliminated repeating animations.",
        "Code Quality: Improved type safety with proper enums for Screen and TestOutcome types.",
        "Architecture: Split monolithic utils.ts into specialized modules for better maintainability.",
        "UI: Added ErrorBoundary component for robust error handling and user experience.",
        "Build: Fixed deployment issues with proper base path configuration for Cloudflare Pages.",
        "Linting: Added comprehensive ESLint configuration with TypeScript support.",
        "Documentation: Completely rewrote README.md to reflect the anaesthetic allergy clinic application.",
        "System: Enhanced component performance with React.memo and optimized re-renders.",
      ]
    },
    {
      version: "v0.3.0",
      changes: [
        "Major Refactor: Split patient history and testing into separate screens for improved workflow.",
        "Feature: Added Testing Plan Generator for creating printable request forms.",
        "UI: Enhanced patient selection with search filtering and improved navigation.",
        "System: Improved reaction grade visualization with better accessibility."
      ]
    },
    {
      version: "v0.2.0",
      changes: [
        "Feature: Added CSV upload functionality for patient database updates.",
        "UI: Implemented dashboard with statistics, charts, and patient database view.",
        "System: Added comprehensive patient history timeline with medication tracking.",
        "Feature: Integrated REDCap dataset support with 92+ patient records."
      ]
    },
    {
      version: "v0.1.0",
      changes: [
        "Initial Release: Basic anaesthetic allergy testing log functionality.",
        "UI: Implemented React-based interface with form validation.",
        "Feature: Added clinical report generation and patient handout printing.",
        "System: Basic patient data management and testing result tracking."
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
            </CardContent>
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
