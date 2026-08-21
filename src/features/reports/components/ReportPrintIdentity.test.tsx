import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ReportPrintIdentity } from './ReportPrintIdentity';
import { expectNoAxeViolations } from '@/src/test/helpers/axe';

describe('ReportPrintIdentity', () => {
  it('renders patient name, MRN, DOB, title, and report date in print headers and footers', () => {
    render(
      <ReportPrintIdentity
        patientName="Wei Chen"
        mrn="MRN-12345"
        dob="1985-05-01"
        reportTitle="Anaesthetic Testing Report"
        requestDate="2024-03-15"
      />
    );

    // Top print header
    expect(screen.getByText('Wei Chen · REDCap ID MRN-12345 · DOB 01/05/1985')).toBeInTheDocument();
    expect(screen.getByText('Anaesthetic Testing Report')).toBeInTheDocument();

    // Bottom print footer
    expect(screen.getByText('Wei Chen · REDCap ID MRN-12345')).toBeInTheDocument();
    expect(screen.getByText('Date of report: 15/03/2024')).toBeInTheDocument();
  });

  it('renders correctly without optional DOB and requestDate (uses fallback date)', () => {
    render(
      <ReportPrintIdentity
        patientName="John Doe"
        mrn="MRN-999"
        reportTitle="Patient Handout"
      />
    );

    expect(screen.getAllByText('John Doe · REDCap ID MRN-999')).toHaveLength(2);
    expect(screen.getByText('Patient Handout')).toBeInTheDocument();
    expect(screen.getByText(/Date of report:/)).toBeInTheDocument();
  });

  it('passes unit-level accessibility scan', async () => {
    const { container } = render(
      <ReportPrintIdentity
        patientName="Jane Smith"
        mrn="MRN-777"
        dob="1990-01-01"
        reportTitle="Powerchart Letter"
      />
    );

    await expectNoAxeViolations(container);
  });
});
