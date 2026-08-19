import { render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import ClinicalReport from './ClinicalReport';
import { RedactProvider } from '../hooks/useRedact';
import { createMockLogFormData, createMockDrugTestRow } from '@/src/test/factories/testingDataFactory';
import { expectNoAxeViolations } from '@/src/test/helpers/axe';

function renderClinicalReport(ui: ReactElement) {
  return render(<RedactProvider>{ui}</RedactProvider>);
}

describe('ClinicalReport', () => {
  it('renders standard patient header and encounter details', () => {
    const data = createMockLogFormData({
      firstName: 'Wei',
      lastName: 'Chen',
      mrn: 'MRN-12345',
      dob: '1985-05-01',
      visitDate: '2024-03-15',
    });

    renderClinicalReport(<ClinicalReport data={data} />);

    expect(screen.getByRole('heading', { level: 2, name: 'Anaesthetic Testing Report' })).toBeInTheDocument();
    expect(screen.getByText(/Clinical Immunology & Allergy/)).toBeInTheDocument();
    expect(screen.getAllByText('Wei Chen').length).toBeGreaterThan(0);
    expect(screen.getAllByText('MRN-12345').length).toBeGreaterThan(0);
    expect(screen.getAllByText('01/05/1985').length).toBeGreaterThan(0);
    expect(screen.getByText('15/03/2024')).toBeInTheDocument();
  });

  it('renders skin and intradermal test controls and panel results', () => {
    const data = createMockLogFormData({
      controls: {
        histamineSpt: '6',
        salineSpt: '0',
        salineIdt: '0',
      },
      testPanel: [
        createMockDrugTestRow({
          drugName: 'Rocuronium',
          sptWheal: '5',
          idtResults: ['4', '8'],
          notes: 'Definite positive',
        }),
        createMockDrugTestRow({
          drugName: 'Other',
          customName: 'Cefazolin',
          sptWheal: '0',
          idtResults: ['0', '0'],
          notes: 'Tolerated',
        }),
      ],
    });

    renderClinicalReport(<ClinicalReport data={data} />);

    expect(screen.getByText('Histamine SPT:')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
    expect(screen.getAllByText('Rocuronium').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Cefazolin').length).toBeGreaterThan(0);
    expect(screen.getAllByText('5 mm').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Definite positive/).length).toBeGreaterThan(0);
  });

  it('renders successful (negative/safe) drug challenge results', () => {
    const data = createMockLogFormData({
      proceedToChallenge: true,
      challengeDrug: 'Propofol',
      outcome: 'SUCCESS',
    });

    renderClinicalReport(<ClinicalReport data={data} />);

    expect(screen.getByText('Propofol')).toBeInTheDocument();
    expect(screen.getByText('NEGATIVE (Safe)')).toBeInTheDocument();
    expect(screen.queryByText(/Reaction Time:/)).not.toBeInTheDocument();
  });

  it('renders unsuccessful (positive/reaction) challenge with symptoms and intervention', () => {
    const data = createMockLogFormData({
      proceedToChallenge: true,
      challengeDrug: 'Other',
      challengeDrugCustom: 'CustomDrugZ',
      outcome: 'UNSUCCESS',
      reactionTime: '12',
      symptoms: ['Hypotension', 'Other'],
      symptomsOther: 'Generalised erythema',
      interventionType: 'Other',
      interventionOther: 'Adrenaline 0.5mg IM + IV saline bolus',
    });

    renderClinicalReport(<ClinicalReport data={data} />);

    expect(screen.getByText('CustomDrugZ')).toBeInTheDocument();
    expect(screen.getByText('POSITIVE (Reaction)')).toBeInTheDocument();
    expect(screen.getByText('12 mins')).toBeInTheDocument();
    expect(screen.getByText('Hypotension, Other (Generalised erythema)')).toBeInTheDocument();
    expect(screen.getByText('Other: Adrenaline 0.5mg IM + IV saline bolus')).toBeInTheDocument();
  });

  it('renders cross-sensitization warnings and avoid recommendations for positive NMBAs', () => {
    const data = createMockLogFormData({
      testPanel: [
        createMockDrugTestRow({
          drugName: 'Rocuronium',
          sptWheal: '6',
          idtResults: ['8'],
        }),
      ],
    });

    renderClinicalReport(<ClinicalReport data={data} />);

    // Positive Rocuronium generates avoid recommendations & NMBD cross-sensitization notes
    expect(screen.getByText('AVOID Rocuronium')).toBeInTheDocument();
    expect(screen.getByText('AVOID Vecuronium')).toBeInTheDocument();
    expect(screen.getByText(/molecular similarity between Rocuronium and Vecuronium/i)).toBeInTheDocument();
  });

  it('renders default no-allergy recommendations when all tests are negative', () => {
    const data = createMockLogFormData({
      testPanel: [
        createMockDrugTestRow({
          drugName: 'Propofol',
          sptWheal: '0',
          idtResults: ['0'],
        }),
      ],
      proceedToChallenge: false,
    });

    renderClinicalReport(<ClinicalReport data={data} />);

    expect(screen.getByText(/No evidence of IgE-mediated allergy to medications tested/i)).toBeInTheDocument();
  });

  it('renders comprehensive nursing notes when provided', () => {
    const data = createMockLogFormData({
      nurseNotes: {
        preTesting: 'Cannula inserted 20G in left forearm. Baseline vitals stable.',
        duringTesting: 'Patient observed for 30 minutes post IDT. No adverse symptoms.',
        postTesting: 'Cannula removed, dressing intact. Accompanied by family.',
        signedBy: 'K. Wells',
      },
    });

    renderClinicalReport(<ClinicalReport data={data} />);

    expect(screen.getByRole('heading', { name: /Nursing Notes/i })).toBeInTheDocument();
    expect(screen.getByText(/Cannula inserted 20G in left forearm/)).toBeInTheDocument();
    expect(screen.getByText(/Patient observed for 30 minutes post IDT/)).toBeInTheDocument();
    expect(screen.getByText(/Cannula removed, dressing intact/)).toBeInTheDocument();
    expect(screen.getByText('K. Wells')).toBeInTheDocument();
  });

  it('renders clinical assessment and plan', () => {
    const data = createMockLogFormData({
      plan: 'Confirmed severe IgE-mediated anaphylaxis to Rocuronium. Recommend Sugammadex alert and avoidance of aminosteroid NMBAs.',
    });

    renderClinicalReport(<ClinicalReport data={data} />);

    expect(screen.getByRole('heading', { name: /Assessment & Plan/i })).toBeInTheDocument();
    expect(
      screen.getByText(
        'Confirmed severe IgE-mediated anaphylaxis to Rocuronium. Recommend Sugammadex alert and avoidance of aminosteroid NMBAs.'
      )
    ).toBeInTheDocument();
  });

  it('passes automated unit-level accessibility scan with zero violations', async () => {
    const data = createMockLogFormData({
      testPanel: [
        createMockDrugTestRow({
          drugName: 'Rocuronium',
          sptWheal: '5',
          idtResults: ['4', '6'],
        }),
      ],
      proceedToChallenge: true,
      challengeDrug: 'Propofol',
      outcome: 'SUCCESS',
      plan: 'Follow-up in clinic in 6 months.',
    });

    const { container } = renderClinicalReport(<ClinicalReport data={data} />);

    await expectNoAxeViolations(container);
  });
});
