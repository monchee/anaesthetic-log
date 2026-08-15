import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AssessmentPlanSection } from './AssessmentPlanSection';
import { NurseNotesSection } from './NurseNotesSection';
import { SaveActionSection } from './SaveActionSection';
import { VisitDetailsSection } from './VisitDetailsSection';
import { LogFormData } from '@/types';

describe('AssessmentPlanSection', () => {
  it('renders plan text and triggers onInputChange on change', () => {
    const onInputChange = vi.fn();
    render(<AssessmentPlanSection plan="Initial plan" onInputChange={onInputChange} />);

    const textarea = screen.getByLabelText(/Comments \/ Plan/i);
    expect(textarea).toHaveValue('Initial plan');

    fireEvent.change(textarea, { target: { value: 'Updated plan text' } });
    expect(onInputChange).toHaveBeenCalledWith('plan', 'Updated plan text');
  });
});

describe('NurseNotesSection', () => {
  it('renders collapsed state and toggles open on click', () => {
    const setIsOpen = vi.fn();
    const formData = {
      nurseNotes: {
        preTesting: 'Pre notes',
        duringTesting: 'During notes',
        postTesting: 'Post notes',
        signedBy: 'RN Tester',
      },
    } as unknown as LogFormData;

    const { rerender } = render(
      <NurseNotesSection
        formData={formData}
        setFormData={vi.fn()}
        isOpen={false}
        setIsOpen={setIsOpen}
      />
    );

    expect(screen.getByText('Nursing Notes')).toBeInTheDocument();
    expect(screen.queryByLabelText(/Pre-Testing Observations/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Nursing Notes/i }));
    expect(setIsOpen).toHaveBeenCalled();

    rerender(
      <NurseNotesSection
        formData={formData}
        setFormData={vi.fn()}
        isOpen={true}
        setIsOpen={setIsOpen}
      />
    );

    expect(screen.getByLabelText(/Pre-Testing Observations/i)).toHaveValue('Pre notes');
    expect(screen.getByLabelText(/During Testing/i)).toHaveValue('During notes');
    expect(screen.getByLabelText(/Post-Testing \/ Discharge/i)).toHaveValue('Post notes');
    expect(screen.getByLabelText(/Signed by \(RN\)/i)).toHaveValue('RN Tester');
  });

  it('updates form data when fields are edited in open state', () => {
    const setFormData = vi.fn();
    const formData = {} as LogFormData;

    render(
      <NurseNotesSection
        formData={formData}
        setFormData={setFormData}
        isOpen={true}
        setIsOpen={vi.fn()}
      />
    );

    const preInput = screen.getByLabelText(/Pre-Testing Observations/i);
    fireEvent.change(preInput, { target: { value: 'Vitals stable' } });
    expect(setFormData).toHaveBeenCalled();

    const signedInput = screen.getByLabelText(/Signed by \(RN\)/i);
    fireEvent.change(signedInput, { target: { value: 'Nurse Joy' } });
    expect(setFormData).toHaveBeenCalled();
  });
});

describe('SaveActionSection', () => {
  it('renders save button and triggers onSave', () => {
    const onSave = vi.fn();
    render(
      <SaveActionSection
        validationErrors={[]}
        errorSummaryRef={React.createRef()}
        onSave={onSave}
      />
    );

    const saveBtn = screen.getByRole('button', { name: /Save Clinical Record/i });
    fireEvent.click(saveBtn);
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('renders validation error summary when errors exist', () => {
    const errors = [
      { message: 'MRN is required', fieldId: 'patient-mrn' },
      { message: 'Plan is required', fieldId: 'clinical-plan' },
    ];
    render(
      <SaveActionSection
        validationErrors={errors}
        errorSummaryRef={React.createRef()}
        onSave={vi.fn()}
      />
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('MRN is required')).toBeInTheDocument();
    expect(screen.getByText('Plan is required')).toBeInTheDocument();
  });
});

describe('VisitDetailsSection', () => {
  it('renders visit date input and triggers onChange', () => {
    const onChange = vi.fn();
    render(<VisitDetailsSection visitDate="2026-06-10" onChange={onChange} />);

    const input = screen.getByLabelText(/Visit Date:/i);
    expect(input).toHaveValue('2026-06-10');

    fireEvent.change(input, { target: { value: '2026-06-15' } });
    expect(onChange).toHaveBeenCalledWith('2026-06-15');
  });
});
