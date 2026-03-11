import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui';
import { PieChart } from 'lucide-react';

interface GradeDistributionChartProps {
  gradeCounts: {
    I: number;
    II: number;
    III: number;
    IV: number;
    Ungraded: number;
  };
  totalPatients: number;
  animateCharts: boolean;
}

export const GradeDistributionChart: React.FC<GradeDistributionChartProps> = ({
  gradeCounts,
  totalPatients,
  animateCharts
}) => {
  return (
    <Card className="shadow-sm h-full">
      <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
        <CardTitle className="text-lg text-slate-800 dark:text-primary flex items-center gap-2">
          <PieChart className="w-5 h-5" /> Reaction Severity Distribution
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex h-12 w-full rounded-lg overflow-hidden mb-6 bg-slate-50 dark:bg-slate-800/50">
          {gradeCounts.I > 0 && (
            <div 
              style={{ width: animateCharts ? `${(gradeCounts.I / totalPatients) * 100}%` : '0%' }} 
              className="bg-blue-400 dark:bg-blue-500 h-full transition-all duration-1000 ease-out" 
              title={`Grade I: ${gradeCounts.I}`} 
            />
          )}
          {gradeCounts.II > 0 && (
            <div 
              style={{ width: animateCharts ? `${(gradeCounts.II / totalPatients) * 100}%` : '0%' }} 
              className="bg-amber-400 dark:bg-amber-500 h-full transition-all duration-1000 ease-out delay-100" 
              title={`Grade II: ${gradeCounts.II}`} 
            />
          )}
          {gradeCounts.III > 0 && (
            <div 
              style={{ width: animateCharts ? `${(gradeCounts.III / totalPatients) * 100}%` : '0%' }} 
              className="bg-orange-500 dark:bg-orange-600 h-full transition-all duration-1000 ease-out delay-200" 
              title={`Grade III: ${gradeCounts.III}`} 
            />
          )}
          {gradeCounts.IV > 0 && (
            <div 
              style={{ width: animateCharts ? `${(gradeCounts.IV / totalPatients) * 100}%` : '0%' }} 
              className="bg-red-600 dark:bg-red-600 h-full transition-all duration-1000 ease-out delay-300" 
              title={`Grade IV: ${gradeCounts.IV}`} 
            />
          )}
          {gradeCounts.Ungraded > 0 && (
            <div 
              style={{ width: animateCharts ? `${(gradeCounts.Ungraded / totalPatients) * 100}%` : '0%' }} 
              className="bg-slate-200 dark:bg-slate-700 h-full transition-all duration-1000 ease-out delay-400" 
              title={`Ungraded: ${gradeCounts.Ungraded}`} 
            />
          )}
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2 group cursor-default">
            <span className="w-3 h-3 rounded-full bg-blue-400 dark:bg-blue-500 group-hover:scale-125 transition-transform"></span>
            <span className="text-slate-600 dark:text-slate-400">Grade I: <span className="font-bold text-slate-900 dark:text-slate-100">{gradeCounts.I}</span></span>
          </div>
          <div className="flex items-center gap-2 group cursor-default">
            <span className="w-3 h-3 rounded-full bg-amber-400 dark:bg-amber-500 group-hover:scale-125 transition-transform"></span>
            <span className="text-slate-600 dark:text-slate-400">Grade II: <span className="font-bold text-slate-900 dark:text-slate-100">{gradeCounts.II}</span></span>
          </div>
          <div className="flex items-center gap-2 group cursor-default">
            <span className="w-3 h-3 rounded-full bg-orange-500 dark:bg-orange-600 group-hover:scale-125 transition-transform"></span>
            <span className="text-slate-600 dark:text-slate-400">Grade III: <span className="font-bold text-slate-900 dark:text-slate-100">{gradeCounts.III}</span></span>
          </div>
          <div className="flex items-center gap-2 group cursor-default">
            <span className="w-3 h-3 rounded-full bg-red-600 group-hover:scale-125 transition-transform"></span>
            <span className="text-slate-600 dark:text-slate-400">Grade IV: <span className="font-bold text-slate-900 dark:text-slate-100">{gradeCounts.IV}</span></span>
          </div>
          <div className="flex items-center gap-2 group cursor-default">
            <span className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-700 group-hover:scale-125 transition-transform"></span>
            <span className="text-slate-600 dark:text-slate-400">Ungraded: <span className="font-bold text-slate-900 dark:text-slate-100">{gradeCounts.Ungraded}</span></span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
