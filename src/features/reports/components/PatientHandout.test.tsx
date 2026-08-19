import { render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import PatientHandout from './PatientHandout';
import { RedactProvider } from '../hooks/useRedact';
import { createMockLogFormData, createMockDrugTestRow } from '@/src/test/factories/testingDataFactory';
import { expectNoAxeViolations } from '@/src/test/helpers/axe';

function renderPatientHandout(ui: ReactElement) {
  return render(<RedactProvider>{ui}</RedactProvider>);
}

describe('PatientHandout', () => {
  it('renders patient identity and encounter metadata', () => {
    const data = createMockLogFormData({
      firstName: 'Jane',
      lastName: 'Doe',
      mrn: 'MRN-789',
      dob: '1992-11-03',
      visitDate: '2024-04-10',
    });

    renderPatientHandout(<PatientHandout data={data} />);

    expect(screen.getByRole('heading', { level: 2, name: 'Allergy Testing Results' })).toBeInTheDocument();
    expect(screen.getByText('Patient Information Handout')).toBeInTheDocument();
    expect(screen.getAllByText('Jane Doe').length).toBeGreaterThan(0);
    expect(screen.getAllByText('03/11/1992').length).toBeGreaterThan(0);
    expect(screen.getByText('10/04/2024')).toBeInTheDocument();
  });

  it('renders drugs to avoid with cross-sensitization warnings', () => {
    const data = createMockLogFormData({
      testPanel: [
        createMockDrugTestRow({
          drugName: 'Rocuronium',
          sptWheal: '6',
          idtResults: ['5'],
        }),
      ],
    });

    renderPatientHandout(<PatientHandout data={data} />);

    expect(screen.getByText('Drugs to avoid')).toBeInTheDocument();
    expect(screen.getByText('Rocuronium')).toBeInTheDocument();
    expect(screen.getByText('Vecuronium')).toBeInTheDocument();
    expect(screen.getByText('cross-sensitization risk')).toBeInTheDocument();
    expect(screen.getAllByText('AVOID')).toHaveLength(2);
  });

  it('renders tolerated drugs with SAFE badges', () => {
    const data = createMockLogFormData({
      testPanel: [
        createMockDrugTestRow({
          drugName: 'Propofol',
          sptWheal: '0',
          idtResults: ['0'],
        }),
        createMockDrugTestRow({
          drugName: 'Fentanyl',
          sptWheal: '0',
          idtResults: ['0'],
        }),
      ],
      proceedToChallenge: false,
    });

    renderPatientHandout(<PatientHandout data={data} />);

    expect(screen.getByText('Drugs tolerated')).toBeInTheDocument();
    expect(screen.getByText('Propofol')).toBeInTheDocument();
    expect(screen.getByText('Fentanyl')).toBeInTheDocument();
    expect(screen.getAllByText('SAFE')).toHaveLength(2);
  });

  it('renders empty fallback states when no positive or negative results exist', () => {
    const data = createMockLogFormData({
      testPanel: [],
      proceedToChallenge: false,
    });

    renderPatientHandout(<PatientHandout data={data} />);

    expect(screen.getByText('No positive reactions recorded today.')).toBeInTheDocument();
    expect(screen.getByText('No negative results recorded.')).toBeInTheDocument();
  });

  it('renders RPAH Clinical Immunology contact information and warning message', () => {
    const data = createMockLogFormData();

    renderPatientHandout(<PatientHandout data={data} />);

    expect(screen.getByText('Department of Clinical Immunology & Allergy')).toBeInTheDocument();
    expect(screen.getByText('Royal Prince Alfred Hospital')).toBeInTheDocument();
    expect(screen.getByText('Phone: (02) 9515 7586')).toBeInTheDocument();
    expect(screen.getByText('Email: SLHD-RPA-ClinicalImmunology@health.nsw.gov.au')).toBeInTheDocument();
    expect(
      screen.getByText('Please provide this document to your anaesthetist before any future surgery.')
    ).toBeInTheDocument();
  });

  it('passes automated unit-level accessibility scan with zero violations', async () => {
    const data = createMockLogFormData({
      testPanel: [
        createMockDrugTestRow({
          drugName: 'Rocuronium',
          sptWheal: '5',
        }),
        createMockDrugTestRow({
          drugName: 'Propofol',
          sptWheal: '0',
        }),
      ],
    });

    const { container } = renderPatientHandout(<PatientHandout data={data} />);

    await expectNoAxeViolations(container);
  });
});
