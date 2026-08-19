import React from 'react';
import { Card, CardHeader, CardTitle, Badge } from '../../../../components/ui';
import { Clock } from 'lucide-react';
import { LogFormData } from '@shared/types';
import { formatDate, isSkinTestPositive } from '@shared/utils';
import { TableEmptyRow } from '@shared/components/states';

interface RecentTestingActivityProps {
  recentLogs: LogFormData[];
  onViewLog: (log: LogFormData) => void;
}

const RecentTestingActivity: React.FC<RecentTestingActivityProps> = ({
  recentLogs,
  onViewLog
}) => {
  const handleRowKeyDown = (event: React.KeyboardEvent<HTMLTableRowElement>, log: LogFormData) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onViewLog(log);
    }
  };

  return (
    <Card elevation="raised" className="w-full border-t-4 border-t-status-grade1 animate-enter-subtle">
      <CardHeader bordered className="py-4 bg-card">
        <CardTitle as="h2" className="text-lg text-foreground dark:text-primary flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary dark:text-primary" /> Recent Skin Testing Activity
        </CardTitle>
      </CardHeader>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-card text-xs uppercase text-muted-foreground font-semibold">
            <tr>
              <th scope="col" className="px-4 py-3">Date</th>
              <th scope="col" className="px-4 py-3">Patient</th>
              <th scope="col" className="px-4 py-3">Results (SPT/IDT)</th>
              <th scope="col" className="px-4 py-3">Challenge Outcome</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-background">
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
                    role="button"
                    tabIndex={0}
                    style={{ '--row-index': Math.min(idx, 9) } as React.CSSProperties}
                    className="hover:bg-muted/50 dark:hover:bg-card/50 cursor-pointer transition-colors group animate-row-enter focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
                    onClick={() => onViewLog(log)}
                    onKeyDown={(event) => handleRowKeyDown(event, log)}
                    aria-label={`View testing log for ${log.firstName} ${log.lastName}`}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground group-hover:text-foreground/80 transition-colors">{formatDate(log.visitDate)}</td>
                    <td className="px-4 py-3 font-medium text-foreground group-hover:text-primary dark:group-hover:text-primary transition-colors">{log.lastName}, {log.firstName}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1 items-center">
                        {positives.map(p => <Badge key={p} variant="danger" className="text-xs px-1.5 py-0 h-5">{p}</Badge>)}
                        {negatives.map(n => <span key={n} className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-none border border-border">{n}</span>)}
                        {positives.length === 0 && negatives.length === 0 && <span className="text-muted-foreground italic text-xs">-</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {log.proceedToChallenge ? (
                        log.outcome === 'SUCCESS' 
                        ? <Badge variant="success" className="text-xs">Negative Challenge</Badge> 
                        : <Badge variant="danger" className="text-xs">Positive Challenge</Badge>
                      ) : <span className="text-muted-foreground">No Challenge</span>}
                    </td>
                  </tr>
                );
              })
            ) : (
              <TableEmptyRow colSpan={4} title="No recent activity recorded in this session." />
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default React.memo(RecentTestingActivity);
