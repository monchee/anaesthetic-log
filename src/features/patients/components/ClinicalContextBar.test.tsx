import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RedactProvider, useRedact } from '@features/reports/hooks/useRedact';
import { ClinicalContextBar } from './ClinicalContextBar';
import { createClinicalWorkContext } from '@shared/types/clinicalWorkContext';

const baseProps = {
  firstName: 'Jane',
  lastName: 'Doe',
  mrn: 'MrN00aB1',
};

function RedactionToggle() {
  const { toggleRedact } = useRedact();
  return <button onClick={toggleRedact}>Redact identity</button>;
}

describe('ClinicalContextBar', () => {
  it('renders with accessible aria-label "Current patient and encounter"', () => {
    render(<ClinicalContextBar {...baseProps} />);
    const bar = screen.getByLabelText('Current patient and encounter');
    expect(bar).toBeInTheDocument();
    expect(bar).toHaveTextContent('DOE, Jane');
  });

  it('renders MRN font-mono without forcing lowercasing', () => {
    render(<ClinicalContextBar {...baseProps} />);
    const mrn = screen.getByText('MrN00aB1');
    expect(mrn).toBeInTheDocument();
    expect(mrn).toHaveClass('font-mono');
  });

  it('renders clear fallback when DOB is missing', () => {
    render(<ClinicalContextBar {...baseProps} />);
    expect(screen.getByText('DOB not recorded')).toBeInTheDocument();
  });

  it('renders reaction date and visit date when present', () => {
    render(
      <ClinicalContextBar
        {...baseProps}
        dob="1985-04-12"
        reactionDate="2025-06-10"
        visitDate="2026-03-18"
      />
    );
    expect(screen.getByText('Reaction 10/06/2025')).toBeInTheDocument();
    expect(screen.getByText('Visit 18/03/2026')).toBeInTheDocument();
  });

  it('renders direct-entry badge for direct source and never displays REDCap ID', () => {
    const context = createClinicalWorkContext({
      source: 'direct',
      firstName: 'John',
      lastName: 'Smith',
      mrn: 'DIR100',
    });

    render(<ClinicalContextBar context={context} />);
    expect(screen.getByText('Direct Entry')).toBeInTheDocument();
    expect(screen.queryByText(/redcap/i)).not.toBeInTheDocument();
  });

  it('respects redaction mode for all demographic values', () => {
    render(
      <RedactProvider>
        <RedactionToggle />
        <ClinicalContextBar
          {...baseProps}
          dob="1980-05-01"
          reactionDate="2025-06-12"
          visitDate="2026-03-18"
        />
      </RedactProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Redact identity' }));

    const bar = screen.getByLabelText('Current patient and encounter');
    expect(screen.queryByText('MrN00aB1')).not.toBeInTheDocument();
    expect(bar).not.toHaveTextContent('DOE');
    expect(bar).not.toHaveTextContent('01/05/1980');
    expect(bar).not.toHaveTextContent('12/06/2025');
  });
});
