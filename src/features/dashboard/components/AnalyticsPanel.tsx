import React from 'react';
import { Card, CardContent } from '../../../../components/ui';
import { Users, AlertTriangle, Ban, Timer, CheckCircle2 } from 'lucide-react';

interface AnalyticsPanelProps {
  animatedTotalPatients: number;
  animatedSevereCount: number;
  severeRate: string;
  animatedAbandonedCount: number;
  abandonedRate: string;
  animatedAvgTime: number;
  animateCharts: boolean;
}

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({
  animatedTotalPatients,
  animatedSevereCount,
  severeRate,
  animatedAbandonedCount,
  abandonedRate,
  animatedAvgTime,
  animateCharts
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Records */}
      <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-none shadow-md bg-gradient-to-br from-white to-purple-50/50 dark:from-slate-900 dark:to-slate-900/50 animate-enter-subtle">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Users className="w-24 h-24 text-[#8055f1]" />
        </div>
        <CardContent className="pb-6 px-6 pt-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-[#f0ebff] dark:bg-[#441170]/30 rounded-xl text-[#8055f1] dark:text-purple-300 shadow-inner group-hover:scale-110 transition-transform duration-300">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Database</span>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
              {animatedTotalPatients}
            </h3>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-green-500" /> Active Records
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Severe Reactions */}
      <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-none shadow-md bg-gradient-to-br from-white to-red-50/50 dark:from-slate-900 dark:to-slate-900/50 animate-enter-subtle">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <AlertTriangle className="w-24 h-24 text-red-500" />
        </div>
        <CardContent className="pb-6 px-6 pt-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-600 dark:text-red-400 shadow-inner group-hover:scale-110 transition-transform duration-300">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Anaphylaxis</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-end gap-2">
              <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
                {animatedSevereCount}
              </h3>
              <span className="text-sm font-medium text-red-600 dark:text-red-400 mb-1 bg-red-50 dark:bg-red-900/30 px-1.5 rounded">
                {severeRate}%
              </span>
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Grade III / IV Reactions
            </p>
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-3 overflow-hidden">
              <div 
                className="h-full bg-red-500 rounded-full transition-all duration-1000 ease-out" 
                style={{ width: animateCharts ? `${Math.min(parseFloat(severeRate), 100)}%` : '0%' }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Procedures Abandoned */}
      <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-none shadow-md bg-gradient-to-br from-white to-amber-50/50 dark:from-slate-900 dark:to-slate-900/50 animate-enter-subtle">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Ban className="w-24 h-24 text-amber-500" />
        </div>
        <CardContent className="pb-6 px-6 pt-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-amber-600 dark:text-amber-400 shadow-inner group-hover:scale-110 transition-transform duration-300">
              <Ban className="w-6 h-6" />
            </div>
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Procedures Abandoned</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-end gap-2">
              <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
                {animatedAbandonedCount}
              </h3>
              <span className="text-sm font-medium text-amber-600 dark:text-amber-400 mb-1 bg-amber-50 dark:bg-amber-900/30 px-1.5 rounded">
                {abandonedRate}%
              </span>
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
              Due to reaction severity
            </p>
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-3 overflow-hidden">
              <div 
                className="h-full bg-amber-500 rounded-full transition-all duration-1000 ease-out" 
                style={{ width: animateCharts ? `${Math.min(parseFloat(abandonedRate), 100)}%` : '0%' }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Avg Reaction Onset */}
      <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-none shadow-md bg-gradient-to-br from-white to-cyan-50/50 dark:from-slate-900 dark:to-slate-900/50 animate-enter-subtle">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Timer className="w-24 h-24 text-cyan-600" />
        </div>
        <CardContent className="pb-6 px-6 pt-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-xl text-cyan-600 dark:text-cyan-400 shadow-inner group-hover:scale-110 transition-transform duration-300">
              <Timer className="w-6 h-6" />
            </div>
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Avg. Reaction Onset</span>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight flex items-baseline gap-1">
              {animatedAvgTime} <span className="text-lg font-medium text-slate-500 dark:text-slate-400">min</span>
            </h3>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              From induction to first sign
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
