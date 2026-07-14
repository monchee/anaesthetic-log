import { AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui';
import { cn } from '@shared/utils';

interface HighRiskContextChipsProps {
  chips: string[];
  className?: string;
}

export function HighRiskContextChips({ chips, className }: HighRiskContextChipsProps) {
  if (chips.length === 0) return null;

  return (
    <section
      aria-label="High-risk clinical context"
      className={cn('flex flex-wrap items-center gap-2', className)}
    >
      <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300">
        <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        High-risk context
      </span>
      <div className="flex flex-wrap gap-1.5">
        {chips.map(chip => (
          <Badge
            key={chip}
            variant="warning"
            className="rounded-none border border-amber-300 px-2 py-0.5 text-xs dark:border-amber-700"
          >
            {chip}
          </Badge>
        ))}
      </div>
    </section>
  );
}
