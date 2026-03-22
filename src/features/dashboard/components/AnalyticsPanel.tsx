import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui';
import { Users, AlertTriangle, Ban, Timer, PieChart, BarChart3 } from 'lucide-react';

interface StatsPanelProps {
  animatedTotalPatients: number;
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
}

const AnalyticsPanel: React.FC<StatsPanelProps> = ({
  animatedTotalPatients,
  animatedSevereCount,
  severeRate,
  animatedAbandonedCount,
  abandonedRate,
  animatedAvgTime,
  gradeCounts,
  topAgents,
  animateCharts
}) => {
  const totalPatients = animatedTotalPatients || 1;
  const max = topAgents[0]?.count || 1;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Left Column - Key Stats */}
      <Card className="lg:col-span-1 shadow-sm">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-border bg-slate-50 dark:bg-card">
          <CardTitle className="text-base text-slate-900 dark:text-foreground flex items-center gap-2">
            <Users className="w-4 h-4 text-primary dark:text-primary" /> Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-6">
          <div className="grid grid-cols-2 gap-3">
            {/* Total */}
            <div className="bg-slate-50 dark:bg-card rounded-none p-3 border border-slate-200 dark:border-border border-l-4 border-l-primary">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-primary" />
                <span className="section-label">Records</span>
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{animatedTotalPatients}</div>
            </div>

            {/* Severe */}
            <div className="bg-slate-50 dark:bg-card rounded-none p-3 border border-slate-200 dark:border-border border-l-4 border-l-red-500">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="section-label">Severe</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">{animatedSevereCount}</span>
                <span className="text-xs font-medium text-red-500">{severeRate}%</span>
              </div>
            </div>

            {/* Abandoned */}
            <div className="bg-slate-50 dark:bg-card rounded-none p-3 border border-slate-200 dark:border-border border-l-4 border-l-amber-500">
              <div className="flex items-center gap-2 mb-1">
                <Ban className="w-4 h-4 text-status-grade2" />
                <span className="section-label">Abandoned</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">{animatedAbandonedCount}</span>
                <span className="text-xs font-medium text-status-grade2">{abandonedRate}%</span>
              </div>
            </div>

            {/* Avg Time */}
            <div className="bg-slate-50 dark:bg-card rounded-none p-3 border border-slate-200 dark:border-border border-l-4 border-l-nsw-blue">
              <div className="flex items-center gap-2 mb-1">
                <Timer className="w-4 h-4 text-nsw-blue" />
                <span className="section-label">Onset</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">{animatedAvgTime}</span>
                <span className="text-sm text-muted-foreground">min</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Middle Column - Grade Distribution */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-border bg-slate-50 dark:bg-card">
          <CardTitle className="text-base text-slate-900 dark:text-foreground flex items-center gap-2">
            <PieChart className="w-4 h-4 text-primary dark:text-primary" /> Severity Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-6">
          {/* Stacked Bar */}
          <div className="flex h-8 w-full rounded-none overflow-hidden mb-4 bg-slate-100 dark:bg-card">
            {gradeCounts.I > 0 && (
              <div 
                style={{ width: animateCharts ? `${(gradeCounts.I / totalPatients) * 100}%` : '0%' }} 
                className="bg-status-grade1 h-full transition-all duration-500" 
              />
            )}
            {gradeCounts.II > 0 && (
              <div 
                style={{ width: animateCharts ? `${(gradeCounts.II / totalPatients) * 100}%` : '0%' }} 
                className="bg-status-grade2 h-full transition-all duration-500 delay-75" 
              />
            )}
            {gradeCounts.III > 0 && (
              <div 
                style={{ width: animateCharts ? `${(gradeCounts.III / totalPatients) * 100}%` : '0%' }} 
                className="bg-red-500 h-full transition-all duration-500 delay-75" 
              />
            )}
            {gradeCounts.IV > 0 && (
              <div 
                style={{ width: animateCharts ? `${(gradeCounts.IV / totalPatients) * 100}%` : '0%' }} 
                className="bg-status-grade4 h-full transition-all duration-500 delay-100" 
              />
            )}
            {gradeCounts.Ungraded > 0 && (
              <div 
                style={{ width: animateCharts ? `${(gradeCounts.Ungraded / totalPatients) * 100}%` : '0%' }} 
                className="bg-slate-300 dark:bg-muted/60 h-full transition-all duration-500 delay-100"
              />
            )}
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs mt-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-status-grade1"></span>
              <span className="text-slate-600 dark:text-muted-foreground">I: <b className="text-slate-900 dark:text-white">{gradeCounts.I}</b></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-status-grade2"></span>
              <span className="text-slate-600 dark:text-muted-foreground">II: <b className="text-slate-900 dark:text-white">{gradeCounts.II}</b></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              <span className="text-slate-600 dark:text-muted-foreground">III: <b className="text-slate-900 dark:text-white">{gradeCounts.III}</b></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-status-grade4"></span>
              <span className="text-slate-600 dark:text-muted-foreground">IV: <b className="text-slate-900 dark:text-white">{gradeCounts.IV}</b></span>
            </div>
            <div className="flex items-center gap-1.5 col-span-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-muted/60"></span>
              <span className="text-slate-600 dark:text-muted-foreground">Ungraded: <b className="text-slate-900 dark:text-white">{gradeCounts.Ungraded}</b></span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Right Column - Top Agents */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-border bg-slate-50 dark:bg-card">
          <CardTitle className="text-base text-slate-900 dark:text-foreground flex items-center gap-2">
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
                      <span className="font-bold text-slate-900 dark:text-white shrink-0">{agent.count}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-card rounded-none overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-none transition-all duration-500" 
                        style={{ 
                          width: animateCharts ? `${percentage}%` : '0%',
                          transitionDelay: `${idx * 50}ms`
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
