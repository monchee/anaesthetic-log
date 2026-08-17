import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { GetStartedActions } from './GetStartedActions';

describe('GetStartedActions', () => {
  it('renders both action cards with correct labels, descriptions, and step trails', () => {
    const onUpload = vi.fn();
    const onStartTesting = vi.fn();

    render(
      <GetStartedActions
        onUpload={onUpload}
        onStartTesting={onStartTesting}
      />
    );

    const uploadBtn = screen.getByRole('button', { name: 'Upload REDCap export & review cases' });
    expect(uploadBtn).toBeInTheDocument();
    expect(
      screen.getByText(
        'Import patient records from a REDCap CSV export, then review the clinic worklist and analytics in the Dashboard.'
      )
    ).toBeInTheDocument();
    expect(screen.getByText('UPLOAD')).toBeInTheDocument();
    expect(screen.getByText('DASHBOARD')).toBeInTheDocument();
    expect(screen.getByText('PATIENT')).toBeInTheDocument();
    expect(screen.getByText('PLAN')).toBeInTheDocument();
    expect(screen.getAllByText('TESTING')).toHaveLength(2);

    const testingBtn = screen.getByRole('button', { name: 'Go straight to allergy testing' });
    expect(testingBtn).toBeInTheDocument();
    expect(
      screen.getByText(
        'Open a fresh testing session for bedside entry — no patient record or testing plan required.'
      )
    ).toBeInTheDocument();
    expect(screen.getByText('REPORT')).toBeInTheDocument();
  });

  it('fires onUpload and onStartTesting callbacks on click', () => {
    const onUpload = vi.fn();
    const onStartTesting = vi.fn();

    render(
      <GetStartedActions
        onUpload={onUpload}
        onStartTesting={onStartTesting}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Upload REDCap export & review cases' }));
    expect(onUpload).toHaveBeenCalledOnce();

    fireEvent.click(screen.getByRole('button', { name: 'Go straight to allergy testing' }));
    expect(onStartTesting).toHaveBeenCalledOnce();
  });

  it('handles isUploading state: shows progress copy, disables upload card, and renders spinner', () => {
    const onUpload = vi.fn();
    const onStartTesting = vi.fn();

    render(
      <GetStartedActions
        isUploading={true}
        onUpload={onUpload}
        onStartTesting={onStartTesting}
      />
    );

    const uploadBtn = screen.getByRole('button', { name: 'Upload REDCap export & review cases' });
    expect(uploadBtn).toBeDisabled();
    expect(screen.getByText('Reading and validating patient records…')).toBeInTheDocument();

    const testingBtn = screen.getByRole('button', { name: 'Go straight to allergy testing' });
    expect(testingBtn).not.toBeDisabled();
  });

  it('applies variant styling classes for page vs modal', () => {
    const { rerender } = render(
      <GetStartedActions
        variant="modal"
        onUpload={vi.fn()}
        onStartTesting={vi.fn()}
      />
    );

    let uploadBtn = screen.getByRole('button', { name: 'Upload REDCap export & review cases' });
    expect(uploadBtn).toHaveClass('p-4', 'sm:p-5');

    rerender(
      <GetStartedActions
        variant="page"
        onUpload={vi.fn()}
        onStartTesting={vi.fn()}
      />
    );

    uploadBtn = screen.getByRole('button', { name: 'Upload REDCap export & review cases' });
    expect(uploadBtn).toHaveClass('p-5');
  });
});
