import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button } from './ui';
import { FileText, ArrowLeft, GitCommit, ShieldCheck, LayoutDashboard, Database } from 'lucide-react';
import { Screen } from '../types';

interface ChangelogProps {
  setScreen: (screen: Screen) => void;
}

const Changelog: React.FC<ChangelogProps> = ({ setScreen }) => {
  const versions = [
    {
      version: "v4.8",
      date: "2025-05-20",
      changes: [
        "Added Changelog page accessible from footer.",
        "Updated Dashboard to include recent skin testing activity.",
        "Enhanced 'Positive Skin Test Breakdown' table with specific test columns.",
        "Improved layout for statistics cards in Dashboard."
      ]
    },
    {
      version: "v4.7",
      date: "2025-05-18",
      changes: [
        "Implemented dynamic patient database search.",
        "Added 'Hospital' field to demographics display.",
        "Refined Patient History card styling with better spacing and layout.",
        "Added 'Anaesthetic Allergy Testing' section header."
      ]
    },
    {
      version: "v4.6",
      date: "2025-05-15",
      changes: [
        "Integrated full REDCap dataset (92 records).",
        "Added logic to parse induction and reaction times.",
        "Implemented 'Other' grouping for non-standard drugs in dashboard analytics."
      ]
    },
     {
      version: "v4.5",
      date: "2025-05-10",
      changes: [
        "Migrated application to React with Shadcn UI components.",
        "Implemented accordion view for patient history.",
        "Added PDF-style print layouts for Clinical Report and Patient Handout."
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto min-h-screen bg-[#fbfaff] pb-10">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#441170] text-white p-4 shadow-md flex justify-between items-center no-print">
        <h1 className="font-bold text-lg flex items-center gap-2">
            <GitCommit className="w-5 h-5" /> Application Changelog
        </h1>
        <Button onClick={() => setScreen('log')} variant="headerAction" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Log
        </Button>
      </div>

      <div className="p-6 space-y-6">
        <Card>
            <CardHeader className="border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#e6e1fd] rounded-full">
                        <ShieldCheck className="w-6 h-6 text-[#8055f1]" />
                    </div>
                    <div>
                        <CardTitle className="text-xl text-[#441170]">Version History</CardTitle>
                        <p className="text-sm text-slate-500">Track updates and improvements to the Anaesthetic Allergy Log.</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="relative border-l-2 border-slate-200 ml-3 space-y-8">
                    {versions.map((v, idx) => (
                        <div key={idx} className="relative pl-8">
                            {/* Timeline Dot */}
                            <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 border-white bg-[#8055f1] shadow-sm" />
                            
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                                <h3 className="text-lg font-bold text-slate-900">{v.version}</h3>
                                <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{v.date}</span>
                            </div>
                            
                            <ul className="list-disc list-outside text-sm text-slate-600 space-y-1 ml-4">
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
             <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setScreen('dashboard')}>
                <CardContent className="p-6 flex items-center gap-4">
                    <div className="p-3 bg-blue-50 rounded-full">
                        <LayoutDashboard className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900">View Dashboard</h3>
                        <p className="text-xs text-slate-500">See aggregate statistics and recent activity.</p>
                    </div>
                </CardContent>
             </Card>

             <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setScreen('log')}>
                <CardContent className="p-6 flex items-center gap-4">
                    <div className="p-3 bg-green-50 rounded-full">
                        <Database className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900">Return to Log</h3>
                        <p className="text-xs text-slate-500">Enter new patient data or testing results.</p>
                    </div>
                </CardContent>
             </Card>
        </div>
      </div>
    </div>
  );
};

export default Changelog;