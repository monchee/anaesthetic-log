import React from 'react';
import { cn } from '@/lib/utils';

export type ChromeStatusBadgeVariant = 'draft' | 'report';
export type ChromeStatusBadgeSize = 'compact' | 'default' | 'comfortable';

export interface ChromeStatusBadgeProps {
  variant: ChromeStatusBadgeVariant;
  size?: ChromeStatusBadgeSize;
  className?: string;
}

const sizeClasses: Record<ChromeStatusBadgeSize, string> = {
  compact: 'px-1.5 py-0.5',
  default: 'px-2 py-0.5',
  comfortable: 'px-2.5 py-1',
};

const variantConfig: Record<
  ChromeStatusBadgeVariant,
  { label: string; ariaLabel: string; className: string }
> = {
  draft: {
    label: 'Testing draft',
    ariaLabel: 'Testing draft with unsaved changes',
    className: 'bg-status-warning/15 text-status-warning border border-status-warning/30',
  },
  report: {
    label: 'Report active',
    ariaLabel: 'Report active',
    className: 'bg-primary/15 text-primary border border-primary/20 dark:bg-primary/30 dark:text-primary-foreground',
  },
};

export const ChromeStatusBadge: React.FC<ChromeStatusBadgeProps> = ({
  variant,
  size = 'default',
  className,
}) => {
  const config = variantConfig[variant];

  return (
    <span
      role="status"
      aria-label={config.ariaLabel}
      className={cn(
        sizeClasses[size],
        'text-xs font-bold uppercase tracking-wider',
        config.className,
        'rounded-none shrink-0',
        className
      )}
    >
      {config.label}
    </span>
  );
};
