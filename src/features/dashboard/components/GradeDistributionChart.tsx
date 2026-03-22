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
      <CardHeader className="pb-4 border-b border-border bg-muted/30 dark:bg-card/20">
        <CardTitle className="text-lg text-slate-800 dark:text-primary flex items-center gap-2">
          <PieChart className="w-5 h-5" /> Reaction Severity Distribution
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex h-12 w-full rounded-none overflow-hidden mb-6 bg-muted/30 dark:bg-card/50">
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
              className="bg-slate-200 dark:bg-muted h-full transition-all duration-1000 ease-out delay-400" 
              title={`Ungraded: ${gradeCounts.Ungraded}`} 
            />
          )}
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2 group cursor-default">
            <span className="w-3 h-3 rounded-none bg-blue-400 dark:bg-blue-500 group-hover:scale-125 transition-transform"></span>
            <span className="text-slate-600 dark:text-muted-foreground">Grade I: <span className="font-bold text-slate-900 dark:text-foreground">{gradeCounts.I}</span></span>
          </div>
          <div className="flex items-center gap-2 group cursor-default">
            <span className="w-3 h-3 rounded-none bg-amber-400 dark:bg-amber-500 group-hover:scale-125 transition-transform"></span>
            <span className="text-slate-600 dark:text-muted-foreground">Grade II: <span className="font-bold text-slate-900 dark:text-foreground">{gradeCounts.II}</span></span>
          </div>
          <div className="flex items-center gap-2 group cursor-default">
            <span className="w-3 h-3 rounded-none bg-orange-500 dark:bg-orange-600 group-hover:scale-125 transition-transform"></span>
            <span className="text-slate-600 dark:text-muted-foreground">Grade III: <span className="font-bold text-slate-900 dark:text-foreground">{gradeCounts.III}</span></span>
          </div>
          <div className="flex items-center gap-2 group cursor-default">
            <span className="w-3 h-3 rounded-none bg-red-600 group-hover:scale-125 transition-transform"></span>
            <span className="text-slate-600 dark:text-muted-foreground">Grade IV: <span className="font-bold text-slate-900 dark:text-foreground">{gradeCounts.IV}</span></span>
          </div>
          <div className="flex items-center gap-2 group cursor-default">
            <span className="w-3 h-3 rounded-none bg-slate-200 dark:bg-muted group-hover:scale-125 transition-transform"></span>
            <span className="text-slate-600 dark:text-muted-foreground">Ungraded: <span className="font-bold text-slate-900 dark:text-foreground">{gradeCounts.Ungraded}</span></span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
