import React from 'react';
import { Card } from '@/components/ui';
import { cn } from '@/lib/utils';

export interface ErrorStateProps {
  icon?: React.ReactNode;
  title: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  /** Heading level for the title. Defaults to h2; callers nested deeper can pass h3. */
  titleAs?: 'h2' | 'h3';
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  icon,
  title,
  children,
  actions,
  titleAs: Title = 'h2',
  className,
}) => {
  return (
    <Card
      elevation="raised"
      className={cn('w-full max-w-md p-6 text-center', className)}
    >
      {icon && (
        <div className="mb-4 flex justify-center" aria-hidden="true">
          {icon}
        </div>
      )}
      <Title>{title}</Title>
      {children && <div className="mb-6">{children}</div>}
      {actions && <div>{actions}</div>}
    </Card>
  );
};
