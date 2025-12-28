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
      version: "v0.11.0",
      codename: "Suxamethonium",
      highlight: true,
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
                    <div className="p-2 bg-[#e6e1fd] dark:bg-purple-900/40 rounded-full">
                        <ShieldCheck className="w-6 h-6 text-[#8055f1] dark:text-purple-300" />
                    </div>
                    <div>
                        <CardTitle className="text-xl text-[#441170] dark:text-purple-300">What's New</CardTitle>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Recent updates and improvements to the application</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-3 space-y-8">
                    {versions.map((v, idx) => (
                        <div key={idx} className="relative pl-8">
                            {/* Timeline Dot */}
                            <div className={`absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 border-white dark:border-slate-900 shadow-sm ${
                              v.highlight ? 'bg-gradient-to-r from-[#8055f1] to-[#6b42d1] animate-pulse' : 'bg-[#8055f1]'
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
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-[#8055f1] to-[#6b42d1] text-white">
                                        <Sparkles className="w-3 h-3" />
                                        Latest
                                    </span>
                                )}
                            </div>
                            
                            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 border border-slate-100 dark:border-slate-800">
                                <ul className="space-y-2.5">
                                    {v.changes.map((change, cIdx) => (
                                        <li key={cIdx} className="flex gap-2 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                            <span className="text-[#8055f1] dark:text-purple-400 mt-1 shrink-0">•</span>
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
                className="bg-[#441170] hover:bg-[#5a1a8a] text-white px-8"
            >
                <Home className="w-5 h-5 mr-2" />
                Return Home
            </Button>
        </div>
    </div>
  );
};

export default Changelog;
