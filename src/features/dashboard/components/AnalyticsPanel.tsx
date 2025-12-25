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

export const AnalyticsPanel: React.FC<StatsPanelProps> = ({
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Left Column - Key Stats */}
      <Card className="lg:col-span-1 shadow-sm">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
          <CardTitle className="text-base text-[#441170] dark:text-purple-300 flex items-center gap-2">
            <Users className="w-4 h-4" /> Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-6">
          <div className="grid grid-cols-2 gap-3">
            {/* Total */}
            <div className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-slate-900 rounded-lg p-3 border border-purple-100 dark:border-purple-900/30">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-[#8055f1]" />
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Records</span>
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{animatedTotalPatients}</div>
            </div>

            {/* Severe */}
            <div className="bg-gradient-to-br from-red-50 to-white dark:from-red-900/20 dark:to-slate-900 rounded-lg p-3 border border-red-100 dark:border-red-900/30">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Severe</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">{animatedSevereCount}</span>
                <span className="text-xs font-medium text-red-500">{severeRate}%</span>
              </div>
            </div>

            {/* Abandoned */}
            <div className="bg-gradient-to-br from-amber-50 to-white dark:from-amber-900/20 dark:to-slate-900 rounded-lg p-3 border border-amber-100 dark:border-amber-900/30">
              <div className="flex items-center gap-2 mb-1">
                <Ban className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Abandoned</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">{animatedAbandonedCount}</span>
                <span className="text-xs font-medium text-amber-500">{abandonedRate}%</span>
              </div>
            </div>

            {/* Avg Time */}
            <div className="bg-gradient-to-br from-cyan-50 to-white dark:from-cyan-900/20 dark:to-slate-900 rounded-lg p-3 border border-cyan-100 dark:border-cyan-900/30">
              <div className="flex items-center gap-2 mb-1">
                <Timer className="w-4 h-4 text-cyan-600" />
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Onset</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">{animatedAvgTime}</span>
                <span className="text-sm text-slate-500">min</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Middle Column - Grade Distribution */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
          <CardTitle className="text-base text-[#441170] dark:text-purple-300 flex items-center gap-2">
            <PieChart className="w-4 h-4" /> Severity Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-6">
          {/* Stacked Bar */}
          <div className="flex h-8 w-full rounded-lg overflow-hidden mb-4 bg-slate-100 dark:bg-slate-800">
            {gradeCounts.I > 0 && (
              <div 
                style={{ width: animateCharts ? `${(gradeCounts.I / totalPatients) * 100}%` : '0%' }} 
                className="bg-blue-400 h-full transition-all duration-700" 
              />
            )}
            {gradeCounts.II > 0 && (
              <div 
                style={{ width: animateCharts ? `${(gradeCounts.II / totalPatients) * 100}%` : '0%' }} 
                className="bg-amber-400 h-full transition-all duration-700 delay-75" 
              />
            )}
            {gradeCounts.III > 0 && (
              <div 
                style={{ width: animateCharts ? `${(gradeCounts.III / totalPatients) * 100}%` : '0%' }} 
                className="bg-orange-500 h-full transition-all duration-700 delay-100" 
              />
            )}
            {gradeCounts.IV > 0 && (
              <div 
                style={{ width: animateCharts ? `${(gradeCounts.IV / totalPatients) * 100}%` : '0%' }} 
                className="bg-red-600 h-full transition-all duration-700 delay-150" 
              />
            )}
            {gradeCounts.Ungraded > 0 && (
              <div 
                style={{ width: animateCharts ? `${(gradeCounts.Ungraded / totalPatients) * 100}%` : '0%' }} 
                className="bg-slate-300 dark:bg-slate-600 h-full transition-all duration-700 delay-200" 
              />
            )}
          </div>
          
          {/* Legend */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
              <span className="text-slate-600 dark:text-slate-400">I: <b className="text-slate-900 dark:text-white">{gradeCounts.I}</b></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              <span className="text-slate-600 dark:text-slate-400">II: <b className="text-slate-900 dark:text-white">{gradeCounts.II}</b></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
              <span className="text-slate-600 dark:text-slate-400">III: <b className="text-slate-900 dark:text-white">{gradeCounts.III}</b></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
              <span className="text-slate-600 dark:text-slate-400">IV: <b className="text-slate-900 dark:text-white">{gradeCounts.IV}</b></span>
            </div>
            <div className="flex items-center gap-1.5 col-span-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600"></span>
              <span className="text-slate-600 dark:text-slate-400">Ungraded: <b className="text-slate-900 dark:text-white">{gradeCounts.Ungraded}</b></span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Right Column - Top Agents */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
          <CardTitle className="text-base text-[#441170] dark:text-purple-300 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" /> Top Suspected Agents
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
                      <span className="font-medium text-slate-700 dark:text-slate-300 truncate pr-2">{agent.name}</span>
                      <span className="font-bold text-slate-900 dark:text-white shrink-0">{agent.count}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#8055f1] rounded-full transition-all duration-700" 
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
            <div className="text-center py-4 text-slate-400 italic text-sm">
              No agents recorded yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
