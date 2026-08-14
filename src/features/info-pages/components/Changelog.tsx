import React, { useState } from 'react';
import { Button, Card, CardContent } from '@/components/ui';
import { Home, Sparkles, ArrowRight } from 'lucide-react';
import { Screen } from '@shared/types';
import changelogData from '@shared/data/changelog.json';

interface ChangelogProps {
  setScreen: (screen: Screen) => void;
  databaseDate?: string;
}

const INITIAL_VISIBLE = 12;

const Changelog: React.FC<ChangelogProps> = ({ setScreen }) => {
  const [showAll, setShowAll] = useState(false);

  const versions = changelogData as Array<{
    version: string;
    codename: string;
    date?: string;
    highlight: boolean;
    changes: string[];
  }>;

  const visibleVersions = showAll ? versions : versions.slice(0, INITIAL_VISIBLE);
  const hiddenCount = versions.length - INITIAL_VISIBLE;

  return (
    <div className="py-4 sm:p-6 space-y-6">
      <Card className="rounded-none border-border shadow-none">
        <CardContent className="pt-6">
          {visibleVersions.map((v, idx) => {
            const isLatest = idx === 0;
            return (
              <div key={idx} className="flex flex-col md:flex-row gap-y-3 pb-10 last:pb-2">
                {/* Left sidebar */}
                <div className="md:w-48 flex-shrink-0">
                  <div className="md:sticky md:top-8 flex flex-row md:flex-col items-start gap-2 md:gap-1.5">
                    <span
                      className={`text-sm font-mono font-bold px-2.5 py-1 inline-flex items-center gap-1 rounded-none ${
                        isLatest
                          ? 'bg-primary/10 dark:bg-primary/20 text-primary border border-primary/20'
                          : 'bg-muted text-foreground/80 border border-border'
                      }`}
                    >
                      {v.version}
                    </span>
                    {v.codename && (
                      <span className="text-xs text-muted-foreground italic md:pl-0.5">
                        {v.codename}
                      </span>
                    )}
                    {v.date && (
                      <span className="text-xs text-muted-foreground font-mono md:pl-0.5">
                        {v.date}
                      </span>
                    )}
                    {isLatest && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 dark:bg-primary/20 border border-primary/30 md:mt-1 rounded-none">
                        <Sparkles className="w-2.5 h-2.5" /> Latest
                      </span>
                    )}
                  </div>
                </div>

                {/* Right content with timeline */}
                <div className="flex-1 md:pl-8 relative">
                  {/* Vertical timeline line */}
                  <div className="hidden md:block absolute left-0 top-0 bottom-0 w-px bg-border" />
                  {/* Timeline dot */}
                  <div
                    className={`hidden md:block absolute left-0 top-1.5 -translate-x-1/2 w-3 h-3 rounded-full border-2 ${
                      isLatest
                        ? 'bg-primary border-primary'
                        : 'bg-background border-border'
                    }`}
                  />

                  <ul className="space-y-2 pt-0.5">
                    {v.changes.map((change, cIdx) => (
                      <li
                        key={cIdx}
                        className={`flex gap-2.5 text-sm leading-relaxed ${
                          isLatest
                            ? 'text-foreground font-medium'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {isLatest ? (
                          <ArrowRight className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        ) : (
                          <span className="text-muted-foreground mt-0.5 shrink-0 select-none">—</span>
                        )}
                        <span>{change}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}

          {/* Expand / collapse */}
          {!showAll && hiddenCount > 0 && (
            <div className="md:pl-48 pt-2">
              <button
                type="button"
                onClick={() => setShowAll(true)}
                className="text-sm text-primary hover:text-primary/80 font-medium transition-colors underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-none"
              >
                Show {hiddenCount} older versions
              </button>
            </div>
          )}
          {showAll && versions.length > INITIAL_VISIBLE && (
            <div className="md:pl-48 pt-2">
              <button
                type="button"
                onClick={() => setShowAll(false)}
                className="text-sm text-primary hover:text-primary/80 font-medium transition-colors underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-none"
              >
                Show less
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Return Home */}
      <div className="flex justify-center print:hidden">
        <Button
          onClick={() => setScreen(Screen.LOG)}
          size="lg"
          className="rounded-none bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-8 shadow-sm btn-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Home className="w-5 h-5 mr-2" />
          Return Home
        </Button>
      </div>
    </div>
  );
};

export default Changelog;
