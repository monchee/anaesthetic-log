import React from 'react';
import { cn } from '@/lib/utils';

export interface StatTileProps {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon?: React.ReactNode;
  tone?: 'primary' | 'warning' | 'danger' | 'neutral';
  className?: string;
  title?: string;
}

const toneChipClasses: Record<NonNullable<StatTileProps['tone']>, string> = {
  primary: 'bg-primary/10 dark:bg-primary/20 text-primary',
  warning: 'bg-status-warning/10 text-status-warning',
  danger: 'bg-status-danger/10 text-status-danger',
  neutral: 'bg-muted text-muted-foreground',
};

export const StatTile: React.FC<StatTileProps> = ({
  label,
  value,
  hint,
  icon,
  tone = 'primary',
  className,
  title,
}) => {
  return (
    <div className={cn('border border-border bg-card p-4', className)}>
      <div className="flex items-center justify-between mb-2">
        <span className="section-label" title={title}>
          {label}
        </span>
        {icon && (
          <div
            className={cn(
              'p-1.5 shrink-0 flex items-center justify-center',
              toneChipClasses[tone]
            )}
            aria-hidden="true"
          >
            {React.isValidElement(icon)
              ? React.cloneElement(
                  icon as React.ReactElement<{
                    className?: string;
                    'aria-hidden'?: boolean | 'true' | 'false';
                  }>,
                  {
                    className: cn(
                      'w-3.5 h-3.5',
                      (icon.props as { className?: string })?.className
                    ),
                    'aria-hidden': true,
                  }
                )
              : icon}
          </div>
        )}
      </div>
      <div className="text-2xl sm:text-3xl font-bold text-foreground tabular-nums leading-none mb-1">
        {value}
      </div>
      {hint !== undefined && hint !== null && (
        <div className="text-xs text-muted-foreground">
          {hint}
        </div>
      )}
    </div>
  );
};
