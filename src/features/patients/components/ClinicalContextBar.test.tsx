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

  it('renders MRN font-mono without forcing lowercasing in both mobile and desktop views', () => {
    render(<ClinicalContextBar {...baseProps} />);
    const mrnElements = screen.getAllByText('MrN00aB1');
    expect(mrnElements.length).toBeGreaterThanOrEqual(1);
    mrnElements.forEach((mrn) => {
      expect(mrn).toBeInTheDocument();
      expect(mrn).toHaveClass('font-mono');
    });
  });

  it('renders accessible Details button on mobile strip and opens Popover with full context values', () => {
    render(
      <ClinicalContextBar
        {...baseProps}
        dob="1985-04-12"
        reactionDate="2025-06-10"
        visitDate="2026-03-18"
        source="direct"
      />
    );

    const detailsBtn = screen.getByRole('button', { name: 'View patient details' });
    expect(detailsBtn).toBeInTheDocument();
    expect(detailsBtn).toHaveTextContent('Details');

    // Popover is closed initially
    expect(screen.queryByText('Patient Details')).not.toBeInTheDocument();

    // Click Details button to open Popover
    fireEvent.click(detailsBtn);

    // Verify Popover content displays full patient details
    expect(screen.getByText('Patient Details')).toBeInTheDocument();
    expect(screen.getByText('12/04/1985')).toBeInTheDocument();
    expect(screen.getByText('10/06/2025')).toBeInTheDocument();
    expect(screen.getByText('18/03/2026')).toBeInTheDocument();
    expect(screen.getAllByText('Direct Entry').length).toBeGreaterThanOrEqual(1);
  });

  it('renders clear fallbacks when DOB, MRN, and Name are missing', () => {
    render(<ClinicalContextBar />);

    expect(screen.getByText('DOB not recorded')).toBeInTheDocument();
    expect(screen.getAllByText('NO IDENTITY ENTERED').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(1);

    // Open Details popover and verify fallbacks
    const detailsBtn = screen.getByRole('button', { name: 'View patient details' });
    fireEvent.click(detailsBtn);

    expect(screen.getAllByText('not recorded').length).toBeGreaterThanOrEqual(1);
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

  it('renders direct-entry badge for direct source and displays REDCap ID label', () => {
    const context = createClinicalWorkContext({
      source: 'direct',
      firstName: 'John',
      lastName: 'Smith',
      mrn: 'DIR100',
    });

    render(<ClinicalContextBar context={context} />);
    expect(screen.getAllByText('Direct Entry').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/REDCap ID/i).length).toBeGreaterThanOrEqual(1);
  });

  it('renders manual-entry badge for manual source', () => {
    const context = createClinicalWorkContext({
      source: 'manual',
      firstName: 'Alice',
      lastName: 'Wong',
      mrn: 'MAN200',
    });

    render(<ClinicalContextBar context={context} />);
    expect(screen.getAllByText('Manual Entry').length).toBeGreaterThanOrEqual(1);
  });

  it('respects redaction mode for all demographic values in both bar and Details popover', () => {
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

    // Toggle redaction on
    fireEvent.click(screen.getByRole('button', { name: 'Redact identity' }));

    const bar = screen.getByLabelText('Current patient and encounter');
    expect(screen.queryByText('MrN00aB1')).not.toBeInTheDocument();
    expect(bar).not.toHaveTextContent('DOE');
    expect(bar).not.toHaveTextContent('01/05/1980');
    expect(bar).not.toHaveTextContent('12/06/2025');

    // Open Details popover under redaction mode
    const detailsBtn = screen.getByRole('button', { name: 'View patient details' });
    fireEvent.click(detailsBtn);

    // Popover must also redact patient identity
    expect(screen.queryByText('DOE, Jane')).not.toBeInTheDocument();
    expect(screen.queryByText('MrN00aB1')).not.toBeInTheDocument();
    expect(screen.queryByText('01/05/1980')).not.toBeInTheDocument();
    expect(screen.queryByText('12/06/2025')).not.toBeInTheDocument();
  });
});
