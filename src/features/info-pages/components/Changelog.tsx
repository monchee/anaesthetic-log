import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, Button } from '@/components/ui';
import { Tag, Home, Sparkles, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { Screen } from '@shared/types';
import changelogData from '@shared/data/changelog.json';

interface ChangelogProps {
  setScreen: (screen: Screen) => void;
  databaseDate: string;
}

const INITIAL_VISIBLE = 12;

const Changelog: React.FC<ChangelogProps> = ({ setScreen }) => {
  const [showAll, setShowAll] = useState(false);

  // NOTE: Set highlight: true on the most recent version release in data/changelog.json
  const versions = changelogData as Array<{
    version: string;
    codename: string;
    highlight: boolean;
    changes: string[];
  }>;

  const highlightedVersion = versions.find(v => v.highlight);
  const olderVersions = versions.filter(v => !v.highlight);
  const visibleVersions = showAll ? olderVersions : olderVersions.slice(0, INITIAL_VISIBLE);
  const hiddenCount = olderVersions.length - INITIAL_VISIBLE;

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <Card>
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary dark:bg-slate-900/40 rounded-none">
              <Tag className="w-6 h-6 text-white dark:text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl text-slate-900 dark:text-slate-100">What's New</CardTitle>
              <p className="text-sm text-slate-500 dark:text-slate-400">Version history and release notes</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Latest release hero */}
      {highlightedVersion && (
        <div className="border-l-4 border-primary bg-gradient-to-r from-primary/5 to-transparent dark:from-primary/10 dark:to-transparent p-6 border border-primary/20 dark:border-primary/30">
          <div className="flex items-start justify-between mb-4 gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <code className="text-base font-mono font-bold bg-primary/10 dark:bg-primary/20 text-primary px-3 py-1">
                {highlightedVersion.version}
              </code>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400 italic">
                "{highlightedVersion.codename}"
              </span>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 dark:bg-primary/20 shrink-0">
              <Sparkles className="w-3 h-3" /> Latest
            </span>
          </div>
          <ul className="space-y-2">
            {highlightedVersion.changes.map((change, i) => (
              <li key={i} className="flex gap-2.5 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                <ArrowRight className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span>{change}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Version timeline */}
      <div className="relative pl-8">
        {/* Vertical rail */}
        <div className="absolute left-[7px] top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-800" />

        {visibleVersions.map((v, idx) => (
          <div key={idx} className="relative mb-5 last:mb-0">
            {/* Timeline dot */}
            <div className="absolute -left-[25px] top-2 w-3.5 h-3.5 rounded-full bg-white dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-700" />

            <div className="border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 p-4">
              <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                <code className="text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-slate-700 dark:text-slate-300">
                  {v.version}
                </code>
                {v.codename && (
                  <span className="text-xs text-slate-400 dark:text-slate-500 italic">{v.codename}</span>
                )}
              </div>
              <ul className="space-y-1.5">
                {v.changes.map((change, cIdx) => (
                  <li key={cIdx} className="flex gap-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    <span className="text-slate-300 dark:text-slate-600 mt-0.5 shrink-0">—</span>
                    <span>{change}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}

        {/* Expand / collapse toggle */}
        {!showAll && hiddenCount > 0 && (
          <button
            onClick={() => setShowAll(true)}
            className="relative ml-4 mt-3 flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          >
            <ChevronDown className="w-4 h-4" />
            Show {hiddenCount} older versions
          </button>
        )}
        {showAll && (
          <button
            onClick={() => setShowAll(false)}
            className="relative ml-4 mt-3 flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          >
            <ChevronUp className="w-4 h-4" />
            Show less
          </button>
        )}
      </div>

      {/* Return Home */}
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
