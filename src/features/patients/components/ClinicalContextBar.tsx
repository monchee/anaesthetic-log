import React from 'react';
import { useRedact } from '@features/reports/hooks/useRedact';
import { cn, formatDate } from '@shared/utils';
import { ClinicalWorkContext, ClinicalWorkSource } from '@shared/types/clinicalWorkContext';

export interface ClinicalContextBarProps {
  context?: ClinicalWorkContext | null;
  firstName?: string;
  lastName?: string;
  mrn?: string;
  dob?: string;
  reactionDate?: string;
  visitDate?: string;
  source?: ClinicalWorkSource;
  className?: string;
  'aria-label'?: string;
  ariaLabel?: string;
}

export function ClinicalContextBar({
  context,
  firstName: propFirstName,
  lastName: propLastName,
  mrn: propMrn,
  dob: propDob,
  reactionDate: propReactionDate,
  visitDate: propVisitDate,
  source: propSource,
  className,
  'aria-label': ariaLabelProp,
  ariaLabel,
}: ClinicalContextBarProps) {
  const { redact } = useRedact();

  const firstName = propFirstName ?? context?.firstName ?? '';
  const lastName = propLastName ?? context?.lastName ?? '';
  const mrn = propMrn ?? context?.mrn ?? '';
  const dob = propDob ?? context?.dob;
  const reactionDate = propReactionDate ?? context?.reactionDate;
  const visitDate = propVisitDate ?? context?.testingVisitDate;
  const source = propSource ?? context?.source;

  const hasName = Boolean(firstName || lastName);
  const formattedName = hasName
    ? `${redact(lastName.toUpperCase())}, ${redact(firstName)}`
    : 'NO IDENTITY ENTERED';

  const accessibleLabel = ariaLabelProp || ariaLabel || 'Current patient and encounter';

  return (
    <aside
      aria-label={accessibleLabel}
      className={cn(
        'sticky top-0 z-30 w-full overflow-x-auto border border-primary/30 bg-card/95 px-3 py-2 shadow-sm backdrop-blur-sm print:hidden',
        className,
      )}
    >
      <div className="flex min-w-max items-center gap-2 whitespace-nowrap text-sm font-medium text-foreground dark:text-primary">
        <span className="font-semibold">{formattedName}</span>

        <span aria-hidden="true" className="text-muted-foreground">·</span>
        <span>
          MRN <span className="font-mono font-semibold">{mrn ? redact(mrn) : '—'}</span>
        </span>

        <span aria-hidden="true" className="text-muted-foreground">·</span>
        <span>DOB {dob ? redact(formatDate(dob)) : 'not recorded'}</span>

        {reactionDate ? (
          <>
            <span aria-hidden="true" className="text-muted-foreground">·</span>
            <span>Reaction {redact(formatDate(reactionDate))}</span>
          </>
        ) : null}

        {visitDate ? (
          <>
            <span aria-hidden="true" className="text-muted-foreground">·</span>
            <span>Visit {formatDate(visitDate)}</span>
          </>
        ) : null}

        {source === 'direct' && (
          <>
            <span aria-hidden="true" className="text-muted-foreground">·</span>
            <span className="border border-status-info/40 bg-status-info/10 text-status-info text-xs px-1.5 py-0.5 rounded-none font-semibold uppercase tracking-wider">
              Direct Entry
            </span>
          </>
        )}

        {source === 'manual' && (
          <>
            <span aria-hidden="true" className="text-muted-foreground">·</span>
            <span className="border border-border bg-muted text-muted-foreground text-xs px-1.5 py-0.5 rounded-none font-semibold uppercase tracking-wider">
              Manual Entry
            </span>
          </>
        )}
      </div>
    </aside>
  );
}

export default ClinicalContextBar;
