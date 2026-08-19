import React from 'react';
import { EmptyState, EmptyStateProps } from './EmptyState';
import { cn } from '@/lib/utils';

export interface TableEmptyRowProps extends EmptyStateProps {
  colSpan: number;
}

export const TableEmptyRow: React.FC<TableEmptyRowProps> = ({
  colSpan,
  className,
  ...emptyStateProps
}) => {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-8 text-center">
        <EmptyState className={cn('py-0', className)} {...emptyStateProps} />
      </td>
    </tr>
  );
};
