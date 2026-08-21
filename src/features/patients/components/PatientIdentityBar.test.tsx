import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RedactProvider, useRedact } from '@features/reports/hooks/useRedact';
import { PatientIdentityBar } from './PatientIdentityBar';

const baseProps = {
  firstName: 'Jane',
  lastName: 'Doe',
  mrn: 'MrN00aB1',
};

function RedactionToggle() {
  const { toggleRedact } = useRedact();
  return <button onClick={toggleRedact}>Redact identity</button>;
}

describe('PatientIdentityBar', () => {
  it('renders a mixed-case MRN verbatim without lowercasing it', () => {
    render(<PatientIdentityBar {...baseProps} />);

    const mrnElements = screen.getAllByText('MrN00aB1');
    expect(mrnElements.length).toBeGreaterThanOrEqual(1);
    mrnElements.forEach((mrn) => {
      expect(mrn).toBeInTheDocument();
      expect(mrn).toHaveClass('font-mono');
      expect(mrn.className).not.toMatch(/\blowercase\b/);
    });
  });

  it('renders a clear fallback when DOB is absent', () => {
    render(<PatientIdentityBar {...baseProps} />);

    expect(screen.getByText('DOB not recorded')).toBeInTheDocument();
  });

  it('omits the reaction segment and its separator when reactionDate is absent', () => {
    render(<PatientIdentityBar {...baseProps} />);

    const identityBar = screen.getByLabelText('Patient identity');
    expect(identityBar).toHaveTextContent('DOE, Jane·REDCap ID MrN00aB1·DOB not recorded');
    expect(screen.queryByText(/^Reaction/)).not.toBeInTheDocument();
  });

  it('respects the shared report redaction state', () => {
    render(
      <RedactProvider>
        <RedactionToggle />
        <PatientIdentityBar {...baseProps} dob="1980-05-01" reactionDate="2025-06-12" />
      </RedactProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Redact identity' }));

    expect(screen.queryByText('MrN00aB1')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Patient identity')).not.toHaveTextContent('DOE');
    expect(screen.getByLabelText('Patient identity')).not.toHaveTextContent('01/05/1980');
    expect(screen.getByLabelText('Patient identity')).not.toHaveTextContent('12/06/2025');
  });
});
