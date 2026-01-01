import React from 'react';
import { Card, CardHeader, CardTitle, Badge } from '../../../../components/ui';
import { Clock } from 'lucide-react';
import { LogFormData } from '../../../../types';
import { formatDate, isSkinTestPositive } from '../../../../lib/utils';

interface RecentTestingActivityProps {
  recentLogs: LogFormData[];
  onViewLog: (log: LogFormData) => void;
}

export const RecentTestingActivity: React.FC<RecentTestingActivityProps> = ({
  recentLogs,
  onViewLog
}) => {
  return (
    <Card className="w-full shadow-sm border-t-4 border-t-green-500 animate-enter-subtle">
      <CardHeader className="py-4 border-b border-slate-100 dark:border-slate-800 bg-green-50/50 dark:bg-green-900/10">
        <CardTitle className="text-lg text-green-800 dark:text-green-400 flex items-center gap-2">
          <Clock className="w-5 h-5" /> Recent Skin Testing Activity
        </CardTitle>
      </CardHeader>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 dark:bg-slate-900 text-xs uppercase text-slate-500 dark:text-slate-400 font-semibold">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Patient</th>
              <th className="px-4 py-3">Results (SPT/IDT)</th>
              <th className="px-4 py-3">Challenge Outcome</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-950">
            {recentLogs.length > 0 ? (
              recentLogs.map((log, idx) => {
                const positives: string[] = [];
                const negatives: string[] = [];

                log.testPanel.forEach(t => {
                  if (isSkinTestPositive(t)) {
                    positives.push(t.drugName);
                  } else {
                    negatives.push(t.drugName);
                  }
                });
                
                return (
                  <tr 
                    key={idx} 
                    className="hover:bg-slate-50 dark:hover:bg-slate-900/50 cursor-pointer transition-colors group"
                    onClick={() => onViewLog(log)}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300">{formatDate(log.visitDate)}</td>
                    <td className="px-4 py-3 font-medium text-[#441170] dark:text-purple-300 group-hover:text-[#6b42d1] dark:group-hover:text-purple-200">{log.lastName}, {log.firstName}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1 items-center">
                        {positives.map(p => <Badge key={p} variant="danger" className="text-[10px] px-1.5 py-0 h-5">{p}</Badge>)}
                        {negatives.map(n => <span key={n} className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">{n}</span>)}
                        {positives.length === 0 && negatives.length === 0 && <span className="text-slate-400 italic text-xs">-</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {log.proceedToChallenge ? (
                        log.outcome === 'SUCCESS' 
                        ? <Badge variant="success" className="text-[10px]">Negative Challenge</Badge> 
                        : <Badge variant="danger" className="text-[10px]">Positive Challenge</Badge>
                      ) : <span className="text-slate-500 dark:text-slate-400">No Challenge</span>}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400 italic">
                  No recent activity recorded in this session.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
