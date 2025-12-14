
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui';
import { ShieldCheck, LayoutDashboard, Database } from 'lucide-react';
import { Screen } from '../types';
import { versions } from '../data/changelogData';

interface ChangelogProps {
  setScreen: (screen: Screen) => void;
}

const Changelog: React.FC<ChangelogProps> = ({ setScreen }) => {

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
