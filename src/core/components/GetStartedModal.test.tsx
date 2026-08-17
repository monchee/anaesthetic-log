import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { GetStartedModal } from './GetStartedModal';
import { Screen } from '@/types';
import changelogData from '@shared/data/changelog.json';

const currentVersion = changelogData[0].version;

describe('GetStartedModal launcher behaviour', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders correctly when isOpen is true', () => {
    render(<GetStartedModal isOpen={true} onViewExportSteps={vi.fn()} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Get Started/i })).toBeInTheDocument();
    expect(
      screen.getByText('Choose how to begin. All patient data stays on this device.')
    ).toBeInTheDocument();
  });

  it('acknowledges version and first-run on "Close" button click and persists to localStorage', () => {
    const onOpenChange = vi.fn();
    render(
      <GetStartedModal
        isOpen={true}
        onOpenChange={onOpenChange}
        onViewExportSteps={vi.fn()}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    const closeButtons = screen.getAllByRole('button', { name: 'Close' });
    fireEvent.click(closeButtons[0]);

    expect(localStorage.setItem).toHaveBeenCalledWith('dream:last_seen_version', currentVersion);
    expect(localStorage.setItem).toHaveBeenCalledWith('dream:get_started_seen', '1');
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('navigates to changelog screen when "View changelog →" is clicked', () => {
    const setScreen = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <GetStartedModal
        isOpen={true}
        onOpenChange={onOpenChange}
        setScreen={setScreen}
        onViewExportSteps={vi.fn()}
      />
    );

    const changelogBtn = screen.getByRole('button', { name: /View changelog/i });
    fireEvent.click(changelogBtn);

    expect(setScreen).toHaveBeenCalledWith(Screen.CHANGELOG);
    expect(localStorage.setItem).toHaveBeenCalledWith('dream:last_seen_version', currentVersion);
    expect(localStorage.setItem).toHaveBeenCalledWith('dream:get_started_seen', '1');
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('calls onViewExportSteps, marks seen, and closes when "View the export steps" is clicked', () => {
    const onViewExportSteps = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <GetStartedModal
        isOpen={true}
        onOpenChange={onOpenChange}
        onViewExportSteps={onViewExportSteps}
      />
    );

    const exportStepsBtn = screen.getByRole('button', { name: /View the export steps/i });
    fireEvent.click(exportStepsBtn);

    expect(onViewExportSteps).toHaveBeenCalledOnce();
    expect(localStorage.setItem).toHaveBeenCalledWith('dream:last_seen_version', currentVersion);
    expect(localStorage.setItem).toHaveBeenCalledWith('dream:get_started_seen', '1');
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('does not display dialog when isOpen is false', () => {
    render(<GetStartedModal isOpen={false} onViewExportSteps={vi.fn()} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders both action choices with accessible button names and descriptions', () => {
    render(<GetStartedModal isOpen={true} onViewExportSteps={vi.fn()} />);

    const uploadAction = screen.getByRole('button', {
      name: 'Upload REDCap export & review cases',
    });
    expect(uploadAction).toBeInTheDocument();
    expect(
      screen.getByText(
        'Import patient records from a REDCap CSV export, then review the clinic worklist and analytics in the Dashboard.'
      )
    ).toBeInTheDocument();

    const directTestingAction = screen.getByRole('button', {
      name: 'Go straight to allergy testing',
    });
    expect(directTestingAction).toBeInTheDocument();
    expect(
      screen.getByText(
        'Open a fresh testing session for bedside entry — no patient record or testing plan required.'
      )
    ).toBeInTheDocument();
  });

  it('triggers file input when "Upload REDCap export & review cases" is clicked', () => {
    render(<GetStartedModal isOpen={true} onViewExportSteps={vi.fn()} />);

    const fileInput = screen.getByLabelText(/Upload CSV file/i) as HTMLInputElement;
    const clickSpy = vi.spyOn(fileInput, 'click');

    const uploadAction = screen.getByRole('button', {
      name: 'Upload REDCap export & review cases',
    });
    fireEvent.click(uploadAction);

    expect(clickSpy).toHaveBeenCalled();
  });

  it('clean direct testing: invokes onStartDirectTesting, marks seen, and closes modal', () => {
    const onStartDirectTesting = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <GetStartedModal
        isOpen={true}
        onOpenChange={onOpenChange}
        onStartDirectTesting={onStartDirectTesting}
        isTestingDraftDirty={false}
        onViewExportSteps={vi.fn()}
      />
    );

    const directTestingAction = screen.getByRole('button', {
      name: 'Go straight to allergy testing',
    });
    fireEvent.click(directTestingAction);

    expect(onStartDirectTesting).toHaveBeenCalledOnce();
    expect(localStorage.setItem).toHaveBeenCalledWith('dream:last_seen_version', currentVersion);
    expect(localStorage.setItem).toHaveBeenCalledWith('dream:get_started_seen', '1');
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('dirty direct testing: prompts confirmation without calling callback, cancelling preserves draft, and confirming invokes callback', () => {
    const onStartDirectTesting = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <GetStartedModal
        isOpen={true}
        onOpenChange={onOpenChange}
        onStartDirectTesting={onStartDirectTesting}
        isTestingDraftDirty={true}
        onViewExportSteps={vi.fn()}
      />
    );

    const directTestingAction = screen.getByRole('button', {
      name: 'Go straight to allergy testing',
    });
    fireEvent.click(directTestingAction);

    // Should NOT call callback yet
    expect(onStartDirectTesting).not.toHaveBeenCalled();

    // Confirmation dialog should be open
    expect(screen.getByText('Start fresh testing session?')).toBeInTheDocument();
    expect(
      screen.getByText(
        /You have unsaved changes in your current testing session. Starting a fresh session will discard these changes./i
      )
    ).toBeInTheDocument();

    // Cancel confirmation
    const cancelBtn = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelBtn);

    expect(onStartDirectTesting).not.toHaveBeenCalled();
    expect(screen.queryByText('Start fresh testing session?')).not.toBeInTheDocument();

    // Click again and confirm
    fireEvent.click(directTestingAction);
    const confirmBtn = screen.getByRole('button', { name: 'Start fresh session' });
    fireEvent.click(confirmBtn);

    expect(onStartDirectTesting).toHaveBeenCalledOnce();
    expect(localStorage.setItem).toHaveBeenCalledWith('dream:last_seen_version', currentVersion);
    expect(localStorage.setItem).toHaveBeenCalledWith('dream:get_started_seen', '1');
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('handles CSV upload parsing, forwards file.lastModified, and invokes onUploadPatients and onUploadComplete', async () => {
    const onUploadPatients = vi.fn();
    const onUploadComplete = vi.fn();
    const onOpenChange = vi.fn();

    render(
      <GetStartedModal
        isOpen={true}
        onOpenChange={onOpenChange}
        onUploadPatients={onUploadPatients}
        onUploadComplete={onUploadComplete}
        onViewExportSteps={vi.fn()}
      />
    );

    const fileInput = screen.getByLabelText(/Upload CSV file/i) as HTMLInputElement;
    const csvContent =
      'Record ID,First Name,Last Name,Date of Reaction:\n101,John,Doe,2023-01-01';
    const testLastModified = 1705000000000;
    const file = new File([csvContent], 'test.csv', {
      type: 'text/csv',
      lastModified: testLastModified,
    });

    fireEvent.change(fileInput, { target: { files: [file] } });

    // Wait for FileReader onload to process
    await waitFor(() => {
      expect(onUploadPatients).toHaveBeenCalledWith(expect.any(Array), testLastModified);
      expect(onUploadComplete).toHaveBeenCalled();
    });

    expect(localStorage.setItem).toHaveBeenCalledWith('dream:last_seen_version', currentVersion);
    expect(localStorage.setItem).toHaveBeenCalledWith('dream:get_started_seen', '1');
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
