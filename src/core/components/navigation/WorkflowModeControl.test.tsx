import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WorkflowModeControl } from './WorkflowModeControl';

describe('WorkflowModeControl', () => {
  it('renders radio buttons with accessible labels and description', () => {
    const onChange = vi.fn();
    render(<WorkflowModeControl mode="clinician" onChange={onChange} />);

    expect(screen.getByText('Workflow view')).toBeInTheDocument();
    expect(screen.getByText('Changes task order only and not access or clinical data.')).toBeInTheDocument();

    const clinicianRadio = screen.getByRole('radio', { name: /Clinician/i });
    const nurseRadio = screen.getByRole('radio', { name: /Nurse/i });

    expect(clinicianRadio).toHaveAttribute('aria-checked', 'true');
    expect(nurseRadio).toHaveAttribute('aria-checked', 'false');

    expect(clinicianRadio).toHaveClass('rounded-none');
    expect(nurseRadio).toHaveClass('rounded-none');
  });

  it('calls onChange with selected mode on click', () => {
    const onChange = vi.fn();
    render(<WorkflowModeControl mode="clinician" onChange={onChange} />);

    const nurseRadio = screen.getByRole('radio', { name: /Nurse/i });
    fireEvent.click(nurseRadio);

    expect(onChange).toHaveBeenCalledWith('nurse');
  });

  it('updates aria-checked when mode is nurse', () => {
    const onChange = vi.fn();
    render(<WorkflowModeControl mode="nurse" onChange={onChange} />);

    const clinicianRadio = screen.getByRole('radio', { name: /Clinician/i });
    const nurseRadio = screen.getByRole('radio', { name: /Nurse/i });

    expect(clinicianRadio).toHaveAttribute('aria-checked', 'false');
    expect(nurseRadio).toHaveAttribute('aria-checked', 'true');
  });
});
