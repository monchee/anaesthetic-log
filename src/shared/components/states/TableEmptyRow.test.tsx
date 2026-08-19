import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TableEmptyRow } from './TableEmptyRow';
import { expectNoAxeViolations } from '@/src/test/helpers/axe';

describe('TableEmptyRow', () => {
  it('renders a tr containing a td with the specified colSpan', () => {
    const { container } = render(
      <table>
        <tbody>
          <TableEmptyRow colSpan={6} title="No matching records found." />
        </tbody>
      </table>
    );

    const td = container.querySelector('td');
    expect(td).toBeInTheDocument();
    expect(td).toHaveAttribute('colspan', '6');
    expect(screen.getByText('No matching records found.')).toBeInTheDocument();
  });

  it('forwards EmptyState props such as description and action', () => {
    render(
      <table>
        <tbody>
          <TableEmptyRow
            colSpan={4}
            title="No patient data loaded"
            description="Upload a REDCap CSV to get started."
            action={<button type="button">Upload CSV</button>}
          />
        </tbody>
      </table>
    );

    expect(screen.getByText('No patient data loaded')).toBeInTheDocument();
    expect(screen.getByText('Upload a REDCap CSV to get started.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Upload CSV' })).toBeInTheDocument();
  });

  it('has zero accessibility violations in a table structure', async () => {
    const { container } = render(
      <table>
        <thead>
          <tr>
            <th>Column 1</th>
            <th>Column 2</th>
          </tr>
        </thead>
        <tbody>
          <TableEmptyRow colSpan={2} title="No data available." />
        </tbody>
      </table>
    );

    await expectNoAxeViolations(container);
  });
});
