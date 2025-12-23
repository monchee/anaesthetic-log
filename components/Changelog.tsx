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
      version: "v0.7.0",
      date: "December 2024",
      highlight: true,
      changes: [
        "Reorganised the application structure to make it easier to maintain and update.",
        "Improved the testing form layout with better spacing and clearer labels.",
        "Enhanced print layouts - the header now hides automatically when printing reports.",
        "Updated version numbering to follow industry standards (semantic versioning).",
        "Made the changelog easier to read with clear descriptions of what changed.",
        "Added Cloudflare Pages deployment configuration.",
      ]
    },
    {
      version: "v0.6.0",
      date: "November 2024",
      changes: [
        "Fixed issues with saving clinical records - forms now save correctly without errors.",
        "Improved error messages to be more helpful when something goes wrong.",
        "Updated all text to use Australian English spelling throughout the application.",
        "Optimised print layouts so reports fit on a single page when printed.",
        "Made the application more stable and reliable for daily use.",
      ]
    },
    {
      version: "v0.5.0",
      date: "October 2024",
      changes: [
        "Improved application security to better protect patient information.",
        "Made the application load faster and use less data.",
        "Enhanced tooltips and hover information for better usability.",
        "Cleaned up the codebase for better long-term maintenance.",
      ]
    },
    {
      version: "v0.4.0",
      date: "September 2024",
      changes: [
        "Made the dashboard animations smoother and less distracting.",
        "Added better error handling to prevent crashes.",
        "Improved the overall stability and performance of the application.",
      ]
    },
    {
      version: "v0.3.0",
      date: "August 2024",
      changes: [
        "Reorganised the workflow to make it easier to view patient history and enter test results.",
        "Added the Testing Plan Generator to create printable request forms.",
        "Improved patient search to help you find patients faster.",
        "Enhanced the display of reaction grades for better clarity.",
      ]
    },
    {
      version: "v0.2.0",
      date: "July 2024",
      changes: [
        "Added ability to upload patient databases from CSV files.",
        "Created the dashboard with statistics and patient overview.",
        "Added detailed patient history timeline showing medications and reactions.",
        "Integrated support for REDCap patient records.",
      ]
    },
    {
      version: "v0.1.0",
      date: "June 2024",
      changes: [
        "Initial release of the Anaesthetic Allergy Clinic application.",
        "Basic functionality for recording skin tests and drug challenges.",
        "Ability to generate clinical reports and patient handouts.",
        "Patient data management and testing result tracking.",
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
                            
                            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 mb-3">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{v.version}</h3>
                                    {v.highlight && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-[#8055f1] to-[#6b42d1] text-white">
                                            <Sparkles className="w-3 h-3" />
                                            Latest
                                        </span>
                                    )}
                                </div>
                                {v.date && (
                                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{v.date}</span>
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
