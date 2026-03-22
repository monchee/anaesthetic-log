import React, { useState } from 'react';
import { Button, Card, CardContent } from '@/components/ui';
import { Home, Sparkles, ArrowRight } from 'lucide-react';
import { Screen } from '@shared/types';
import changelogData from '@shared/data/changelog.json';

interface ChangelogProps {
  setScreen: (screen: Screen) => void;
  databaseDate: string;
}

const INITIAL_VISIBLE = 12;

const Changelog: React.FC<ChangelogProps> = ({ setScreen }) => {
  const [showAll, setShowAll] = useState(false);

  const versions = changelogData as Array<{
    version: string;
    codename: string;
    highlight: boolean;
    changes: string[];
  }>;

  const visibleVersions = showAll ? versions : versions.slice(0, INITIAL_VISIBLE);
  const hiddenCount = versions.length - INITIAL_VISIBLE;

  return (
    <div className="py-4 sm:p-6 space-y-6">
      <Card>
        <CardContent className="pt-6">
      {visibleVersions.map((v, idx) => (
        <div key={idx} className="flex flex-col md:flex-row gap-y-3 pb-10">

          {/* Left sidebar */}
          <div className="md:w-44 flex-shrink-0">
            <div className="md:sticky md:top-8 flex flex-row md:flex-col items-start gap-2 md:gap-1.5">
              <code className={`text-sm font-mono font-bold px-2.5 py-1 ${
                v.highlight
                  ? 'bg-primary/10 dark:bg-primary/20 text-primary'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}>
                {v.version}
              </code>
              {v.codename && (
                <span className="text-xs text-slate-400 dark:text-slate-500 italic md:pl-0.5">
                  {v.codename}
                </span>
              )}
              {v.highlight && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 dark:bg-primary/20 md:mt-1">
                  <Sparkles className="w-2.5 h-2.5" /> Latest
                </span>
              )}
            </div>
          </div>

          {/* Right content with timeline */}
          <div className="flex-1 md:pl-8 relative">
            {/* Vertical timeline line */}
            <div className="hidden md:block absolute left-0 top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-800" />
            {/* Timeline dot */}
            <div className={`hidden md:block absolute left-0 top-1.5 -translate-x-1/2 w-3 h-3 rounded-full border-2 ${
              v.highlight
                ? 'bg-primary border-primary'
                : 'bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700'
            }`} />

            <ul className="space-y-2 pt-0.5">
              {v.changes.map((change, cIdx) => (
                <li key={cIdx} className={`flex gap-2.5 text-sm leading-relaxed ${
                  v.highlight
                    ? 'text-slate-700 dark:text-slate-300'
                    : 'text-slate-600 dark:text-slate-400'
                }`}>
                  {v.highlight ? (
                    <ArrowRight className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  ) : (
                    <span className="text-slate-300 dark:text-slate-600 mt-0.5 shrink-0 select-none">—</span>
                  )}
                  <span>{change}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}

      {/* Expand / collapse */}
      {!showAll && hiddenCount > 0 && (
        <div className="md:pl-52">
          <button
            onClick={() => setShowAll(true)}
            className="text-sm text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors underline underline-offset-2"
          >
            Show {hiddenCount} older versions
          </button>
        </div>
      )}
      {showAll && versions.length > INITIAL_VISIBLE && (
        <div className="md:pl-52">
          <button
            onClick={() => setShowAll(false)}
            className="text-sm text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors underline underline-offset-2"
          >
            Show less
          </button>
        </div>
      )}
        </CardContent>
      </Card>

      {/* Return Home */}
      <div className="flex justify-center">
        <Button
          onClick={() => setScreen(Screen.LOG)}
          size="lg"
          className="bg-slate-900 hover:bg-primary text-white px-8"
        >
          <Home className="w-5 h-5 mr-2" />
          Return Home
        </Button>
      </div>
    </div>
  );
};

export default Changelog;
