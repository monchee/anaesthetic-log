import { cn, formatTime } from '@shared/utils';

interface DraftSaveIndicatorProps {
  isSaving?: boolean;
  isDirty?: boolean;
  hasChanges?: boolean;
  lastSavedAt?: number | null;
  showNoDraft?: boolean;
  className?: string;
}

export function DraftSaveIndicator({
  isSaving = false,
  isDirty = false,
  hasChanges = false,
  lastSavedAt = null,
  showNoDraft = false,
  className,
}: DraftSaveIndicatorProps) {
  const dirty = isDirty || hasChanges;
  const status = isSaving
    ? 'Saving…'
    : lastSavedAt
      ? `Draft saved · ${formatTime(lastSavedAt)}`
      : dirty
        ? 'Unsaved changes'
        : showNoDraft
          ? 'No draft'
          : '';

  if (!status) return null;

  return (
    <span
      aria-live="polite"
      aria-atomic="true"
      className={cn(
        'text-xs font-medium tabular-nums transition-colors',
        isSaving && 'text-muted-foreground animate-pulse',
        !isSaving && !lastSavedAt && dirty && 'text-status-warning font-semibold',
        !isSaving && (lastSavedAt || !dirty) && 'text-muted-foreground',
        className,
      )}
    >
      {status}
    </span>
  );
}
