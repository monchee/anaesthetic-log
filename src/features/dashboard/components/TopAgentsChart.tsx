import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui';
import { BarChart3 } from 'lucide-react';

interface TopAgent {
  name: string;
  count: number;
}

interface TopAgentsChartProps {
  topAgents: TopAgent[];
  animateCharts: boolean;
}

export const TopAgentsChart: React.FC<TopAgentsChartProps> = ({
  topAgents,
  animateCharts
}) => {
  const max = topAgents[0]?.count || 1;

  return (
    <Card className="shadow-sm h-full">
      <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
        <CardTitle className="text-lg text-slate-800 dark:text-primary flex items-center gap-2">
          <BarChart3 className="w-5 h-5" /> Top 5 Suspected Agents
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {topAgents.length > 0 ? (
          topAgents.map((agent, idx) => {
            const percentage = (agent.count / max) * 100;
            return (
              <div key={idx} className="space-y-1 group">
                <div className="flex justify-between text-sm font-medium text-slate-700 dark:text-slate-300">
                  <span>{agent.name}</span>
                  <span>{agent.count}</span>
                </div>
                <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-none overflow-hidden">
                  <div 
                    className="h-full bg-primary dark:bg-primary rounded-none transition-all duration-1000 ease-out group-hover:bg-primary dark:group-hover:bg-primary" 
                    style={{ 
                      width: animateCharts ? `${percentage}%` : '0%',
                      transitionDelay: `${idx * 100}ms`
                    }}
                  />
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-slate-400 italic">
            No positive agents recorded yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
