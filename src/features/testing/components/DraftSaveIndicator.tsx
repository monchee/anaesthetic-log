import { cn, formatTime } from '@shared/utils';

interface DraftSaveIndicatorProps {
  isSaving?: boolean;
  lastSavedAt: number | null;
  className?: string;
}

export function DraftSaveIndicator({
  isSaving = false,
  lastSavedAt,
  className,
}: DraftSaveIndicatorProps) {
  const status = isSaving
    ? 'Saving…'
    : lastSavedAt
      ? `Draft saved · ${formatTime(lastSavedAt)}`
      : '';

  return (
    <span
      aria-live="polite"
      aria-atomic="true"
      className={cn('text-xs font-medium text-muted-foreground tabular-nums', className)}
    >
      {status}
    </span>
  );
}
