import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui';
import { Users, AlertTriangle, Ban, Timer, PieChart, BarChart3 } from 'lucide-react';

interface StatsPanelProps {
  animatedTotalPatients: number;
  animatedRedcapCount: number;
  sessionLogCount: number;
  animatedSevereCount: number;
  severeRate: string;
  animatedAbandonedCount: number;
  abandonedRate: string;
  animatedAvgTime: number;
  gradeCounts: {
    I: number;
    II: number;
    III: number;
    IV: number;
    Ungraded: number;
  };
  topAgents: { name: string; count: number }[];
  animateCharts: boolean;
  reduceMotion?: boolean;
}

const AnalyticsPanel: React.FC<StatsPanelProps> = ({
  animatedTotalPatients,
  animatedRedcapCount,
  sessionLogCount,
  animatedSevereCount,
  severeRate,
  animatedAbandonedCount,
  abandonedRate,
  animatedAvgTime,
  gradeCounts,
  topAgents,
  animateCharts,
  reduceMotion = false
}) => {
  const totalPatients = animatedTotalPatients || 1;
  const max = topAgents[0]?.count || 1;
  const widthTransitionClass = reduceMotion ? '' : 'transition-[width] duration-500';
  const gradeMeta = [
    { key: 'I', label: 'I - Cutaneous', count: gradeCounts.I, className: 'bg-status-grade1', pattern: 'repeating-linear-gradient(45deg, transparent 0 6px, hsl(var(--background) / 0.35) 6px 8px)' },
    { key: 'II', label: 'II - Mild systemic', count: gradeCounts.II, className: 'bg-status-grade2', pattern: 'repeating-linear-gradient(90deg, transparent 0 5px, hsl(var(--background) / 0.35) 5px 7px)' },
    { key: 'III', label: 'III - Severe systemic', count: gradeCounts.III, className: 'bg-status-grade3', pattern: 'repeating-linear-gradient(135deg, transparent 0 4px, hsl(var(--background) / 0.35) 4px 6px)' },
    { key: 'IV', label: 'IV - Cardiac arrest', count: gradeCounts.IV, className: 'bg-status-grade4', pattern: 'repeating-linear-gradient(0deg, transparent 0 3px, hsl(var(--background) / 0.4) 3px 5px)' },
    { key: 'Ungraded', label: 'Ungraded', count: gradeCounts.Ungraded, className: 'bg-slate-300 dark:bg-muted/60', pattern: 'repeating-linear-gradient(45deg, transparent 0 8px, hsl(var(--foreground) / 0.18) 8px 10px)' },
  ] as const;
  const severitySummary = gradeMeta
    .map(({ label, count }) => `${label}: ${Math.round((count / totalPatients) * 100)}% (${count})`)
    .join(', ');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Left Column - Key Stats */}
      <Card className="lg:col-span-1 shadow-sm">
        <CardHeader className="pb-3 border-b border-border bg-card">
          <CardTitle as="h2" className="text-base text-foreground flex items-center gap-2">
            <Users className="w-4 h-4 text-primary dark:text-primary" /> Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-6">
          <div className="grid grid-cols-2 gap-3">
            {/* Records — REDCap records and session logs shown separately */}
            <div className="bg-card rounded-none p-3 border border-border border-l-4 border-l-primary">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-primary" />
                <span className="section-label">Records</span>
              </div>
              <div className="text-2xl font-bold tabular-nums text-foreground">{animatedRedcapCount}</div>
              <div className="text-xs text-muted-foreground tabular-nums mt-0.5">
                {sessionLogCount > 0 ? `+${sessionLogCount} this session` : 'REDCap database'}
              </div>
            </div>

            {/* Severe */}
            <div className="bg-card rounded-none p-3 border border-border border-l-4 border-l-red-500">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="section-label">Severe</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold tabular-nums text-foreground">{animatedSevereCount}</span>
                <span className="text-xs font-medium tabular-nums text-red-500">{severeRate}%</span>
              </div>
            </div>

            {/* Abandoned */}
            <div className="bg-card rounded-none p-3 border border-border border-l-4 border-l-amber-500">
              <div className="flex items-center gap-2 mb-1">
                <Ban className="w-4 h-4 text-status-grade2" />
                <span className="section-label">Abandoned</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold tabular-nums text-foreground">{animatedAbandonedCount}</span>
                <span className="text-xs font-medium tabular-nums text-status-grade2">{abandonedRate}%</span>
              </div>
            </div>

            {/* Avg Time */}
            <div className="bg-card rounded-none p-3 border border-border border-l-4 border-l-nsw-blue">
              <div className="flex items-center gap-2 mb-1">
                <Timer className="w-4 h-4 text-nsw-blue" />
                <span
                  className="section-label"
                  title="Average induction-to-reaction time in minutes, excluding values outside 0-240 minutes."
                >
                  Avg Onset
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold tabular-nums text-foreground">{animatedAvgTime}</span>
                <span className="text-sm text-muted-foreground">min</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Middle Column - Grade Distribution */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3 border-b border-border bg-card">
          <CardTitle as="h2" className="text-base text-foreground flex items-center gap-2">
            <PieChart className="w-4 h-4 text-primary dark:text-primary" /> Severity Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-6">
          {/* Stacked Bar */}
          <div
            className="flex h-8 w-full rounded-none overflow-hidden mb-4 bg-slate-100 dark:bg-card"
            role="img"
            aria-label={`Severity distribution: ${severitySummary}`}
          >
            {gradeMeta.map(({ key, label, count, className, pattern }, index) => count > 0 && (
              <div
                key={key}
                aria-hidden="true"
                style={{
                  width: animateCharts ? `${(count / totalPatients) * 100}%` : '0%',
                  backgroundImage: pattern,
                }}
                className={`${className} h-full ${widthTransitionClass} ${reduceMotion || index === 0 ? '' : index < 3 ? 'delay-75' : 'delay-100'}`}
                title={`${label}: ${count}`}
              />
            ))}
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs tabular-nums mt-4">
            {gradeMeta.map(({ key, label, count, className }) => (
              <div key={key} className={`flex items-center gap-1.5 ${key === 'Ungraded' ? 'col-span-2' : ''}`}>
                <span className={`inline-flex h-4 min-w-4 items-center justify-center rounded-none text-[0.625rem] font-bold text-white ${className}`}>{key === 'Ungraded' ? '-' : key}</span>
                <span className="text-muted-foreground">{label}: <b className="text-foreground">{count}</b></span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Right Column - Top Agents */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3 border-b border-border bg-card">
          <CardTitle as="h2" className="text-base text-foreground flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary dark:text-primary" /> Top Suspected Agents
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-6">
          {topAgents.length > 0 ? (
            <div className="space-y-2">
              {topAgents.slice(0, 5).map((agent, idx) => {
                const percentage = (agent.count / max) * 100;
                return (
                  <div key={idx} className="group">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-slate-700 dark:text-foreground/80 truncate pr-2">{agent.name}</span>
                      <span className="font-bold tabular-nums text-foreground shrink-0">{agent.count}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-card rounded-none overflow-hidden">
                      <div 
                        className={`h-full bg-primary rounded-none ${widthTransitionClass}`} 
                        style={{ 
                          width: animateCharts ? `${percentage}%` : '0%',
                          transitionDelay: reduceMotion ? undefined : `${idx * 50}ms`
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground italic text-sm">
              No agents recorded yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default React.memo(AnalyticsPanel);
