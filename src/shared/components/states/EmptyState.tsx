import React from 'react';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  size?: 'sm' | 'md';
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  size = 'md',
  className,
}) => {
  const isSm = size === 'sm';

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2 text-muted-foreground text-center',
        isSm ? 'py-4' : 'py-10',
        className
      )}
    >
      {icon && (
        <div
          className={cn(
            'flex items-center justify-center opacity-40',
            isSm ? 'w-6 h-6 [&_svg]:w-6 [&_svg]:h-6' : 'w-8 h-8 [&_svg]:w-8 [&_svg]:h-8'
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
                    isSm ? 'w-6 h-6' : 'w-8 h-8',
                    (icon.props as { className?: string })?.className
                  ),
                  'aria-hidden': true,
                }
              )
            : icon}
        </div>
      )}
      <p className={cn('font-medium', isSm ? 'text-xs' : 'text-sm')}>{title}</p>
      {description && <p className="text-xs">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
};
