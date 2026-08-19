import { render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import PowerchartLetter from './PowerchartLetter';
import { RedactProvider } from '../hooks/useRedact';
import { createMockPatient, createMockPatientHistory } from '@/src/test/factories/patientFactory';
import { createMockLogFormData, createMockDrugTestRow } from '@/src/test/factories/testingDataFactory';
import { expectNoAxeViolations } from '@/src/test/helpers/axe';

function renderPowerchartLetter(ui: ReactElement) {
  return render(<RedactProvider>{ui}</RedactProvider>);
}

describe('PowerchartLetter', () => {
  it('renders clinical narrative, patient history, and reaction background for linked database patient', () => {
    const patient = createMockPatient({
      id: 'DB-001',
      firstName: 'Wei',
      lastName: 'Chen',
      mrn: 'MRN-444',
      redcapId: 'REDCAP-777',
      history: createMockPatientHistory({
        date: '2024-01-15',
        hospital: 'Royal Prince Alfred Hospital',
        procedure: 'Laparoscopic Cholecystectomy',
        procedureOutcome: 'Completed',
        inductionTime: '08:45',
        reactionTime: '09:00',
        symptoms: [{ label: 'Hypotension' }, { label: 'Bronchospasm' }],
        treatment: ['Adrenaline', 'IV Fluids'],
        referringEmail: 'anaesthetist@example.com',
      }),
    });

    const data = createMockLogFormData({
      firstName: 'Wei',
      lastName: 'Chen',
      mrn: 'MRN-444',
      visitDate: '2024-03-20',
      tryptase: {
        obtained: true,
        significantElevation: true,
        values: [
          { result: '16.5', time: '+1h' },
          { result: '3.0', time: 'baseline' },
        ],
      },
      testPanel: [
        createMockDrugTestRow({ drugName: 'Rocuronium', sptWheal: '6', idtResults: ['8'] }),
        createMockDrugTestRow({ drugName: 'Propofol', sptWheal: '0', idtResults: ['0'] }),
      ],
      proceedToChallenge: false,
    });

    renderPowerchartLetter(<PowerchartLetter data={data} patient={patient} />);

    expect(screen.getByRole('heading', { level: 2, name: 'Anaesthetic Allergy Clinic' })).toBeInTheDocument();
    expect(screen.getByText('Powerchart Letter')).toBeInTheDocument();
    expect(screen.getAllByText('Wei Chen').length).toBeGreaterThan(0);
    expect(screen.getAllByText('MRN-444').length).toBeGreaterThan(0);
    expect(screen.getByText('REDCAP-777')).toBeInTheDocument();

    // Narrative text
    expect(screen.getByText(/presented to Royal Prince Alfred Hospital for a laparoscopic cholecystectomy/i)).toBeInTheDocument();
    expect(screen.getByText(/Approximately 15 minutes after induction/i)).toBeInTheDocument();
    expect(screen.getByText(/treated with adrenaline and IV fluids/i)).toBeInTheDocument();

    // Tryptase sentence
    expect(screen.getByText(/Serial serum tryptase samples revealed clinically significant dynamic tryptase elevation/i)).toBeInTheDocument();

    // Tested agent list
    expect(screen.getAllByText('Rocuronium').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Propofol').length).toBeGreaterThan(0);

    // Results summary & recommendations
    expect(screen.getByText('AVOID Rocuronium')).toBeInTheDocument();
    expect(screen.getByText('AVOID Vecuronium')).toBeInTheDocument();
    expect(screen.getByText('Propofol: negative')).toBeInTheDocument();

    // Referrer email & MDT signoff
    expect(screen.getByText(/anaesthetist@example.com/)).toBeInTheDocument();
    expect(screen.getByText(/Allergy MDT: Dr. D Zalcberg, Dr. A Stoyanov and CNC K. Wells./)).toBeInTheDocument();
  });

  it('renders correctly for manual patients without full background narrative', () => {
    const manualPatient = createMockPatient({
      id: 'manual',
      firstName: 'Direct',
      lastName: 'Entry',
      mrn: 'MANUAL-001',
    });

    const data = createMockLogFormData({
      firstName: 'Direct',
      lastName: 'Entry',
      mrn: 'MANUAL-001',
      visitDate: '2024-04-01',
      testPanel: [
        createMockDrugTestRow({ drugName: 'Cefazolin', sptWheal: '0', idtResults: ['0'] }),
      ],
      proceedToChallenge: true,
      challengeDrug: 'Cefazolin',
      outcome: 'SUCCESS',
    });

    renderPowerchartLetter(<PowerchartLetter data={data} patient={manualPatient} />);

    expect(screen.queryByText(/presented to.*for a/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Drug challenge with Cefazolin — tolerated./)).toBeInTheDocument();
    expect(screen.getByText(/Serial serum tryptase samples were not obtained./)).toBeInTheDocument();
  });

  it('renders challenge reaction details when outcome is UNSUCCESS', () => {
    const data = createMockLogFormData({
      proceedToChallenge: true,
      challengeDrug: 'Amoxicillin',
      outcome: 'UNSUCCESS',
      reactionTime: '15',
      symptoms: ['Urticaria', 'Hypotension'],
      interventionType: 'Adrenaline',
    });

    renderPowerchartLetter(<PowerchartLetter data={data} patient={null} />);

    expect(
      screen.getByText(
        /Drug challenge with Amoxicillin — reaction at 15 minutes; symptoms: Urticaria, Hypotension; treated with: Adrenaline./
      )
    ).toBeInTheDocument();
  });

  it('passes automated unit-level accessibility scan with zero violations', async () => {
    const patient = createMockPatient();
    const data = createMockLogFormData({
      testPanel: [
        createMockDrugTestRow({ drugName: 'Rocuronium', sptWheal: '5' }),
      ],
    });

    const { container } = renderPowerchartLetter(<PowerchartLetter data={data} patient={patient} />);

    await expectNoAxeViolations(container);
  });
});
