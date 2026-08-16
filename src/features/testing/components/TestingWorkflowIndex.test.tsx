import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TestingWorkflowIndex, deriveSectionStatus, WORKFLOW_SECTIONS } from './TestingWorkflowIndex';
import { LogFormData } from '@/types';

const emptyForm: LogFormData = {
  mrn: '',
  firstName: '',
  lastName: '',
  visitDate: '',
  controls: { histamineSpt: '', salineSpt: '', salineIdt: '' },
  testPanel: [],
  proceedToChallenge: false,
  challengeDrug: '',
  challengeDrugCustom: '',
  outcome: null,
  reactionTime: '',
  symptoms: [],
  symptomsOther: '',
  interventionType: '',
  interventionOther: '',
  plan: '',
};

const completeForm: LogFormData = {
  mrn: 'MRN123',
  firstName: 'Jane',
  lastName: 'Doe',
  visitDate: '2026-06-10',
  controls: { histamineSpt: '5', salineSpt: '0', salineIdt: '0' },
  testPanel: [
    { drugName: 'Cefazolin', sptWheal: '3', idtResults: ['0', '4'], protocolIndex: 0 },
    { drugName: 'Other', customName: 'CustomDrug', sptWheal: '0', idtResults: ['0'], protocolIndex: 0 },
  ],
  proceedToChallenge: true,
  challengeDrug: 'Cefazolin',
  challengeDrugCustom: '',
  outcome: 'SUCCESS',
  reactionTime: '',
  symptoms: [],
  symptomsOther: '',
  interventionType: '',
  interventionOther: '',
  plan: 'May receive cefazolin safely.',
  nurseNotes: {
    preTesting: 'Normal baseline',
    duringTesting: 'No reaction',
    postTesting: 'Discharged safely',
    signedBy: 'RN Tester',
  },
  tryptase: {
    obtained: true,
    significantElevation: false,
    values: [{ time: '09:00', result: '4.5' }],
  },
};

describe('deriveSectionStatus', () => {
  describe('patient-visit', () => {
    it('returns Not started when all 4 fields are empty', () => {
      expect(deriveSectionStatus('patient-visit', emptyForm)).toBe('Not started');
    });

    it('returns In progress when some fields are filled', () => {
      expect(deriveSectionStatus('patient-visit', { ...emptyForm, firstName: 'Jane' })).toBe('In progress');
      expect(deriveSectionStatus('patient-visit', { ...emptyForm, mrn: '123', lastName: 'Doe' })).toBe('In progress');
    });

    it('returns Ready for review when all 4 fields (mrn, firstName, lastName, visitDate) are filled', () => {
      expect(deriveSectionStatus('patient-visit', {
        ...emptyForm,
        mrn: '123',
        firstName: 'Jane',
        lastName: 'Doe',
        visitDate: '2026-06-10',
      })).toBe('Ready for review');
    });
  });

  describe('spt-idt', () => {
    it('returns Not started when controls and results are empty', () => {
      expect(deriveSectionStatus('spt-idt', emptyForm)).toBe('Not started');
    });

    it('returns In progress when controls or results are partial', () => {
      expect(deriveSectionStatus('spt-idt', {
        ...emptyForm,
        controls: { histamineSpt: '5', salineSpt: '', salineIdt: '' },
      })).toBe('In progress');

      expect(deriveSectionStatus('spt-idt', {
        ...emptyForm,
        controls: { histamineSpt: '5', salineSpt: '0', salineIdt: '0' },
        testPanel: [{ drugName: 'Cefazolin', sptWheal: '', idtResults: [] }],
      })).toBe('In progress');

      expect(deriveSectionStatus('spt-idt', {
        ...emptyForm,
        controls: { histamineSpt: '5', salineSpt: '0', salineIdt: '0' },
        testPanel: [{ drugName: 'Other', customName: '', sptWheal: '3', idtResults: [] }],
      })).toBe('In progress');
    });

    it('returns Ready for review when controls, results, and named other rows exist', () => {
      expect(deriveSectionStatus('spt-idt', {
        ...emptyForm,
        controls: { histamineSpt: '5', salineSpt: '0', salineIdt: '0' },
        testPanel: [
          { drugName: 'Cefazolin', sptWheal: '3', idtResults: [] },
          { drugName: 'Other', customName: 'SpecialDrug', sptWheal: '0', idtResults: ['4'] },
        ],
      })).toBe('Ready for review');
    });
  });

  describe('drug-challenge', () => {
    it('returns Not included when proceedToChallenge is false', () => {
      expect(deriveSectionStatus('drug-challenge', emptyForm)).toBe('Not included');
    });

    it('returns In progress when challenge is selected but drug/outcome are incomplete', () => {
      expect(deriveSectionStatus('drug-challenge', {
        ...emptyForm,
        proceedToChallenge: true,
        challengeDrug: 'Cefazolin',
        outcome: null,
      })).toBe('In progress');

      expect(deriveSectionStatus('drug-challenge', {
        ...emptyForm,
        proceedToChallenge: true,
        challengeDrug: 'Other',
        challengeDrugCustom: '',
        outcome: 'SUCCESS',
      })).toBe('In progress');

      expect(deriveSectionStatus('drug-challenge', {
        ...emptyForm,
        proceedToChallenge: true,
        challengeDrug: 'Cefazolin',
        outcome: 'UNSUCCESS',
        reactionTime: '',
        symptoms: [],
      })).toBe('In progress');
    });

    it('returns Ready for review when challenge is complete for passed or unsuccessful outcome', () => {
      expect(deriveSectionStatus('drug-challenge', {
        ...emptyForm,
        proceedToChallenge: true,
        challengeDrug: 'Cefazolin',
        outcome: 'SUCCESS',
      })).toBe('Ready for review');

      expect(deriveSectionStatus('drug-challenge', {
        ...emptyForm,
        proceedToChallenge: true,
        challengeDrug: 'Other',
        challengeDrugCustom: 'SpecialDrug',
        outcome: 'UNSUCCESS',
        reactionTime: '15 min',
        symptoms: ['Rash'],
      })).toBe('Ready for review');
    });
  });

  describe('tryptase', () => {
    it('returns Not included when not obtained and no samples', () => {
      expect(deriveSectionStatus('tryptase', emptyForm)).toBe('Not included');
    });

    it('returns In progress when obtained but sample values are missing or blank', () => {
      expect(deriveSectionStatus('tryptase', {
        ...emptyForm,
        tryptase: { obtained: true, significantElevation: false, values: [] },
      })).toBe('In progress');

      expect(deriveSectionStatus('tryptase', {
        ...emptyForm,
        tryptase: { obtained: true, significantElevation: false, values: [{ time: '', result: '' }] },
      })).toBe('In progress');
    });

    it('returns Ready for review when obtained and sample values are recorded', () => {
      expect(deriveSectionStatus('tryptase', {
        ...emptyForm,
        tryptase: { obtained: true, significantElevation: false, values: [{ time: '1h', result: '12.5' }] },
      })).toBe('Ready for review');
    });
  });

  describe('assessment-plan', () => {
    it('returns Not started when plan is empty', () => {
      expect(deriveSectionStatus('assessment-plan', emptyForm)).toBe('Not started');
    });

    it('returns Ready for review when plan has text', () => {
      expect(deriveSectionStatus('assessment-plan', { ...emptyForm, plan: 'Avoid rocuronium' })).toBe('Ready for review');
    });
  });

  describe('nursing-notes', () => {
    it('returns Not included when notes are empty', () => {
      expect(deriveSectionStatus('nursing-notes', emptyForm)).toBe('Not included');
    });

    it('returns In progress when notes exist but unsigned', () => {
      expect(deriveSectionStatus('nursing-notes', {
        ...emptyForm,
        nurseNotes: { preTesting: 'Normal baseline' },
      })).toBe('In progress');
    });

    it('returns Ready for review when signed', () => {
      expect(deriveSectionStatus('nursing-notes', {
        ...emptyForm,
        nurseNotes: { signedBy: 'RN Test' },
      })).toBe('Ready for review');
    });
  });

  describe('review-save', () => {
    it('returns In progress when form is invalid', () => {
      expect(deriveSectionStatus('review-save', emptyForm)).toBe('In progress');
    });

    it('returns Ready for review when form is valid', () => {
      expect(deriveSectionStatus('review-save', completeForm)).toBe('Ready for review');
    });
  });
});

describe('TestingWorkflowIndex Component', () => {
  it('renders all 7 sections with labels and status', () => {
    const onSelect = vi.fn();
    render(
      <TestingWorkflowIndex
        activeIndex={0}
        onSelectSection={onSelect}
        formData={completeForm}
      />
    );

    expect(screen.getByText('Workflow')).toBeInTheDocument();
    expect(screen.getByText('1 of 7')).toBeInTheDocument();

    WORKFLOW_SECTIONS.forEach((section) => {
      expect(screen.getByText(section.label)).toBeInTheDocument();
    });
  });

  it('calls onSelectSection when section is clicked', () => {
    const onSelect = vi.fn();
    render(
      <TestingWorkflowIndex
        activeIndex={0}
        onSelectSection={onSelect}
        formData={completeForm}
      />
    );

    const sptButton = screen.getByRole('button', { name: /2\. SPT and IDT/i });
    fireEvent.click(sptButton);

    expect(onSelect).toHaveBeenCalledWith(1);
  });

  it('renders the aggregate status summary from the shared workflow model', () => {
    const summaryForm = {
      ...emptyForm,
      mrn: 'MRN123',
      firstName: 'Jane',
      lastName: 'Doe',
      visitDate: '2026-06-10',
      plan: 'Proceed with observation.',
      nurseNotes: { preTesting: 'Baseline recorded' },
    };

    render(
      <TestingWorkflowIndex
        activeIndex={0}
        onSelectSection={vi.fn()}
        formData={summaryForm}
      />
    );

    expect(screen.getByText('2 ready')).toBeInTheDocument();
    expect(screen.getByText('3 need attention')).toBeInTheDocument();
    expect(screen.getByText('2 not included')).toBeInTheDocument();
  });

  it('uses the active step location cue and informational readiness styling', () => {
    render(
      <TestingWorkflowIndex
        activeIndex={0}
        onSelectSection={vi.fn()}
        formData={completeForm}
      />
    );

    const activeButton = screen.getByRole('button', { name: /1\. Patient and visit \(Ready for review\)/i });
    expect(activeButton).toHaveAttribute('aria-current', 'step');

    const readyButton = screen.getByRole('button', { name: /2\. SPT and IDT \(Ready for review\)/i });
    const readyStatus = within(readyButton).getByText('Ready for review').parentElement;
    expect(readyStatus).toHaveClass('text-primary');
    expect(readyStatus).not.toHaveClass('text-status-success');
  });

  it('renders the mobile navigator with destination-aware controls and boundaries', () => {
    const onSelect = vi.fn();
    render(
      <TestingWorkflowIndex
        variant="mobile"
        activeIndex={1}
        onSelectSection={onSelect}
        formData={emptyForm}
      />
    );

    expect(screen.getByText('Section 2 of 7')).toBeInTheDocument();
    expect(screen.getByText('SPT and IDT')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous section: Patient and visit' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next section: Drug challenge' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Next section: Drug challenge' }));
    expect(onSelect).toHaveBeenCalledWith(2);

    const { rerender } = render(
      <TestingWorkflowIndex
        variant="mobile"
        activeIndex={0}
        onSelectSection={onSelect}
        formData={emptyForm}
      />
    );
    expect(screen.getByRole('button', { name: 'Previous section' })).toBeDisabled();

    rerender(
      <TestingWorkflowIndex
        variant="mobile"
        activeIndex={WORKFLOW_SECTIONS.length - 1}
        onSelectSection={onSelect}
        formData={emptyForm}
      />
    );
    expect(screen.getByRole('button', { name: 'Next section' })).toBeDisabled();
  });

  it('opens the mobile section Sheet, selects a section, and closes it', () => {
    const onSelect = vi.fn();
    render(
      <TestingWorkflowIndex
        variant="mobile"
        activeIndex={1}
        onSelectSection={onSelect}
        formData={emptyForm}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'All sections' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('All workflow sections')).toBeInTheDocument();
    expect(screen.getByText('Drug challenge')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /3\. Drug challenge \(Not included\)/i }));
    expect(onSelect).toHaveBeenCalledWith(2);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
