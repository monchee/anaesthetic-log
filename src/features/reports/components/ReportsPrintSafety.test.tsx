import { render, screen, within } from '@testing-library/react';
import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import ClinicalReport from './ClinicalReport';
import PatientHandout from './PatientHandout';
import PowerchartLetter from './PowerchartLetter';
import { RedactProvider } from '../hooks/useRedact';
import { createMockLogFormData, createMockDrugTestRow } from '@/src/test/factories/testingDataFactory';
import { createMockPatient } from '@/src/test/factories/patientFactory';

function renderReport(ui: ReactElement) {
  return render(<RedactProvider>{ui}</RedactProvider>);
}

describe('reports print safety', () => {
  it('renders the correct patient handout clinic phone number', () => {
    renderReport(<PatientHandout data={createMockLogFormData()} />);

    expect(screen.getByText('Phone: (02) 9515 7586')).toBeInTheDocument();
    expect(screen.queryByText('Phone: (02) 9515 8814')).not.toBeInTheDocument();
  });

  it('adds print-only patient identity to every report document', () => {
    const data = createMockLogFormData({ firstName: 'Wei', lastName: 'Chen', mrn: 'MRN-42', dob: '1980-05-01' });
    const patient = createMockPatient({ firstName: 'Wei', lastName: 'Chen', mrn: 'MRN-42', dob: '1980-05-01' });

    const { rerender } = renderReport(<ClinicalReport data={data} />);
    expect(screen.getByRole('heading', { level: 2, name: 'Anaesthetic Testing Report' })).toBeInTheDocument();
    expect(screen.getAllByText(/Wei Chen · MRN MRN-42 · DOB 01\/05\/1980/).length).toBeGreaterThan(0);
    expect(screen.getByText('Date of Birth')).toBeInTheDocument();
    expect(screen.getAllByText('01/05/1980').length).toBeGreaterThan(0);

    rerender(<RedactProvider><PatientHandout data={data} /></RedactProvider>);
    expect(screen.getByRole('heading', { level: 2, name: 'Allergy Testing Results' })).toBeInTheDocument();
    expect(screen.getAllByText(/Wei Chen · MRN MRN-42 · DOB 01\/05\/1980/).length).toBeGreaterThan(0);
    expect(screen.getByText('Date of Birth')).toBeInTheDocument();
    expect(screen.getAllByText('01/05/1980').length).toBeGreaterThan(0);

    rerender(<RedactProvider><PowerchartLetter data={data} patient={patient} /></RedactProvider>);
    expect(screen.getByRole('heading', { level: 2, name: 'Anaesthetic Allergy Clinic' })).toBeInTheDocument();
    expect(screen.getByText('Powerchart Letter')).toBeInTheDocument();
    expect(screen.getAllByText(/Wei Chen · MRN MRN-42 · DOB 01\/05\/1980/).length).toBeGreaterThan(0);
  });

  it('uses black-and-white distinguishable clinical challenge badges', () => {
    const base = createMockLogFormData({
      proceedToChallenge: true,
      challengeDrug: 'Rocuronium',
      outcome: 'SUCCESS',
    });

    const { rerender } = renderReport(<ClinicalReport data={base} />);
    expect(screen.getByText('NEGATIVE (Safe)')).toHaveClass('border', 'print:bg-black', 'print:text-white');

    rerender(<RedactProvider><ClinicalReport data={{ ...base, outcome: 'UNSUCCESS' }} /></RedactProvider>);
    expect(screen.getByText('POSITIVE (Reaction)')).toHaveClass('bg-status-danger', 'print:bg-black', 'print:text-white');
  });

  it('uses black-and-white distinguishable patient handout safe and avoid badges', () => {
    renderReport(
      <PatientHandout
        data={createMockLogFormData({
          testPanel: [
            createMockDrugTestRow({ drugName: 'Rocuronium', sptWheal: '5', idtResults: [] }),
            createMockDrugTestRow({ drugName: 'Propofol', sptWheal: '0', idtResults: [] }),
          ],
        })}
      />
    );

    expect(screen.getAllByText('AVOID')[0]).toHaveClass('print:bg-black', 'print:text-white');
    expect(screen.getByText('SAFE')).toHaveClass('border', 'print:border-black', 'print:bg-white');
  });

  it('keeps report heading order under the Reports page h1 and formats blank SPT cleanly', () => {
    renderReport(
      <ClinicalReport
        data={createMockLogFormData({
          testPanel: [createMockDrugTestRow({ drugName: 'Rocuronium', sptWheal: '', idtResults: [] })],
        })}
      />
    );

    expect(screen.getByRole('heading', { level: 2, name: 'Anaesthetic Testing Report' })).toBeInTheDocument();

    const row = screen.getByRole('row', { name: /Rocuronium/i });
    expect(within(row).queryByText('- mm')).not.toBeInTheDocument();
    expect(within(row).getAllByText('-').length).toBeGreaterThan(0);
  });
});
