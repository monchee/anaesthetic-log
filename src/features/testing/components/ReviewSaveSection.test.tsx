import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ReviewSaveSection } from './ReviewSaveSection';
import { LogFormData } from '@shared/types';

const baseForm: LogFormData = {
  mrn: 'MRN-REV-01',
  firstName: 'Review',
  lastName: 'Patient',
  visitDate: '2026-06-15',
  controls: {
    histamineSpt: '5',
    salineSpt: '0',
    salineIdt: '0',
  },
  testPanel: [
    {
      drugName: 'Rocuronium',
      sptWheal: '4',
      idtResults: ['0', '5'],
      protocolIndex: 0,
    },
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
  plan: 'Review plan details',
  nurseNotes: {
    preTesting: 'Pre notes',
    signedBy: 'RN Reviewer',
  },
  tryptase: {
    obtained: true,
    significantElevation: false,
    values: [{ time: '1h', result: '5.2' }],
  },
};

describe('ReviewSaveSection', () => {
  it('renders all section summary cards and positive wheal indicators', () => {
    const onSave = vi.fn();
    const onJump = vi.fn();

    render(
      <ReviewSaveSection
        formData={baseForm}
        validationErrors={[]}
        errorSummaryRef={React.createRef()}
        onSave={onSave}
        onJumpToSection={onJump}
      />
    );

    expect(screen.getByText('Review Testing Session & Save')).toBeInTheDocument();
    expect(screen.getByText(/1\. Patient & Visit/i)).toBeInTheDocument();
    expect(screen.getByText(/2\. SPT & IDT/i)).toBeInTheDocument();
    expect(screen.getByText(/3\. Drug Challenge/i)).toBeInTheDocument();
    expect(screen.getByText(/4\. Serial Tryptase/i)).toBeInTheDocument();
    expect(screen.getByText(/5\. Assessment & Plan/i)).toBeInTheDocument();
    expect(screen.getByText(/6\. Nursing Notes/i)).toBeInTheDocument();

    expect(screen.getByText(/1 positive wheal\(s\)/i)).toBeInTheDocument();
  });

  it('triggers onJumpToSection when Edit buttons are clicked', () => {
    const onJump = vi.fn();

    render(
      <ReviewSaveSection
        formData={baseForm}
        validationErrors={[]}
        errorSummaryRef={React.createRef()}
        onSave={vi.fn()}
        onJumpToSection={onJump}
      />
    );

    const editButtons = screen.getAllByRole('button', { name: /Edit/i });
    expect(editButtons.length).toBeGreaterThanOrEqual(5);

    fireEvent.click(editButtons[0]);
    expect(onJump).toHaveBeenCalledWith(0);
  });

  it('renders validation errors and jumps to corresponding sections', () => {
    const onJump = vi.fn();
    const errors = [
      { message: 'REDCap ID is required', fieldId: 'mrn-input' },
      { message: 'Challenge drug must be selected', fieldId: 'challenge-drug' },
      { message: 'Drug test panel required', fieldId: 'drug-panel' },
      { message: 'Plan is required', fieldId: 'plan-text' },
    ];

    render(
      <ReviewSaveSection
        formData={baseForm}
        validationErrors={errors}
        errorSummaryRef={React.createRef()}
        onSave={vi.fn()}
        onJumpToSection={onJump}
      />
    );

    expect(screen.getByText(/Please fix the following issues before saving:/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /REDCap ID is required/i }));
    expect(onJump).toHaveBeenCalledWith(0, 'mrn-input');

    fireEvent.click(screen.getByRole('button', { name: /Challenge drug must be selected/i }));
    expect(onJump).toHaveBeenCalledWith(2, 'challenge-drug');

    fireEvent.click(screen.getByRole('button', { name: /Drug test panel required/i }));
    expect(onJump).toHaveBeenCalledWith(1, 'drug-panel');

    fireEvent.click(screen.getByRole('button', { name: /Plan is required/i }));
    expect(onJump).toHaveBeenCalledWith(4, 'plan-text');
  });

  it('calls onSave when primary save button is clicked', () => {
    const onSave = vi.fn();

    render(
      <ReviewSaveSection
        formData={baseForm}
        validationErrors={[]}
        errorSummaryRef={React.createRef()}
        onSave={onSave}
        onJumpToSection={vi.fn()}
      />
    );

    const saveBtn = screen.getByRole('button', { name: /Save Clinical Record/i });
    fireEvent.click(saveBtn);
    expect(onSave).toHaveBeenCalledTimes(1);
  });
});
