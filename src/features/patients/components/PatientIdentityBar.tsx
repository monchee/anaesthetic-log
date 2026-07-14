import { useRedact } from '@features/reports/hooks/useRedact';
import { cn, formatDate } from '@shared/utils';

export interface PatientIdentityBarProps {
  firstName: string;
  lastName: string;
  mrn: string;
  dob?: string;
  reactionDate?: string;
  className?: string;
}

export function PatientIdentityBar({
  firstName,
  lastName,
  mrn,
  dob,
  reactionDate,
  className,
}: PatientIdentityBarProps) {
  const { redact } = useRedact();

  return (
    <aside
      aria-label="Patient identity"
      className={cn(
        'sticky top-0 z-40 w-full overflow-x-auto border border-primary/30 border-l-4 bg-slate-50/95 px-3 py-2 shadow-sm backdrop-blur-sm dark:bg-card/95 print:hidden',
        className,
      )}
    >
      <div className="flex min-w-max items-center gap-2 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-primary">
        <span className="font-semibold">
          {redact(lastName.toUpperCase())}, {redact(firstName)}
        </span>
        <span aria-hidden="true" className="text-muted-foreground">·</span>
        <span>
          MRN <span className="font-mono font-semibold">{redact(mrn)}</span>
        </span>
        <span aria-hidden="true" className="text-muted-foreground">·</span>
        <span>DOB {dob ? redact(formatDate(dob)) : 'not recorded'}</span>
        {reactionDate ? (
          <>
            <span aria-hidden="true" className="text-muted-foreground">·</span>
            <span>Reaction {redact(formatDate(reactionDate))}</span>
          </>
        ) : null}
      </div>
    </aside>
  );
}
