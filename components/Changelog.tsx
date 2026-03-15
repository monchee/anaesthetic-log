import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button } from './ui';
import { ShieldCheck, Home, Sparkles } from 'lucide-react';
import { Screen } from '../types';
import changelogData from '../data/changelog.json';

interface ChangelogProps {
  setScreen: (screen: Screen) => void;
  databaseDate: string;
}

const Changelog: React.FC<ChangelogProps> = ({ setScreen }) => {
  // NOTE: Set highlight: true on the most recent version release in data/changelog.json
  // This displays the "Latest" badge in the changelog
  const versions = changelogData as Array<{
    version: string;
    codename: string;
    highlight: boolean;
    changes: string[];
  }>;

  return (
    <div className="p-6 space-y-6">
        <Card>
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary dark:bg-slate-900/40 rounded-none">
                        <ShieldCheck className="w-6 h-6 text-white dark:text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-xl text-slate-900 dark:text-slate-100">What's New</CardTitle>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Recent updates and improvements to the application</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="space-y-6">
                    {versions.map((v, idx) => (
                        <div key={idx} className="bg-slate-50 dark:bg-slate-900 rounded-none p-5 border border-slate-200 dark:border-slate-800">
                            {/* Version Header */}
                            <div className="flex items-center gap-2 mb-4">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{v.version}</h3>
                                {v.codename && (
                                    <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                                      {v.codename}
                                    </span>
                                )}
                                {v.highlight && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-none text-xs font-medium bg-gradient-to-r from-primary to-[var(--primary)] text-white ml-auto">
                                        <Sparkles className="w-3 h-3" />
                                        Latest
                                    </span>
                                )}
                            </div>

                            {/* Changes List */}
                            <ul className="space-y-2.5">
                                {v.changes.map((change, cIdx) => (
                                    <li key={cIdx} className="flex gap-2 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                        <span className="text-primary dark:text-primary mt-1 shrink-0">•</span>
                                        <span>{change}</span>
                                    </li>
                                ))}
                            </ul>
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
