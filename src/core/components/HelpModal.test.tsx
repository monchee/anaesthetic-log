import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { HelpModal } from './HelpModal';
import { Screen } from '@/types';
import changelogData from '@shared/data/changelog.json';

const currentVersion = changelogData[0].version;

describe('HelpModal Quick Start behaviour', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders correctly when isOpen is true', () => {
    render(<HelpModal isOpen={true} hasData={false} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Quick Start/i })).toBeInTheDocument();
    expect(screen.getByText(/Patient-linked path/i)).toBeInTheDocument();
    expect(screen.getByText(/Direct path/i)).toBeInTheDocument();
  });

  it('acknowledges new version via "Got it" button and persists to localStorage', () => {
    const onOpenChange = vi.fn();
    render(<HelpModal isOpen={true} onOpenChange={onOpenChange} hasData={true} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    const gotItBtn = screen.getByRole('button', { name: 'Got it' });
    fireEvent.click(gotItBtn);

    expect(localStorage.setItem).toHaveBeenCalledWith('dream:last_seen_version', currentVersion);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('acknowledges new version via "Skip for now" and persists to localStorage', () => {
    const onOpenChange = vi.fn();
    render(<HelpModal isOpen={true} onOpenChange={onOpenChange} hasData={false} />);

    const skipBtn = screen.getByRole('button', { name: 'Skip for now' });
    fireEvent.click(skipBtn);

    expect(localStorage.setItem).toHaveBeenCalledWith('dream:last_seen_version', currentVersion);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('navigates to changelog screen when "View full changelog →" is clicked', () => {
    const setScreen = vi.fn();
    const onOpenChange = vi.fn();
    render(<HelpModal isOpen={true} onOpenChange={onOpenChange} hasData={true} setScreen={setScreen} />);

    const changelogBtn = screen.getByRole('button', { name: /View full changelog/i });
    fireEvent.click(changelogBtn);

    expect(setScreen).toHaveBeenCalledWith(Screen.CHANGELOG);
    expect(localStorage.setItem).toHaveBeenCalledWith('dream:last_seen_version', currentVersion);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('does not display dialog when isOpen is false', () => {
    render(<HelpModal isOpen={false} hasData={true} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders both action choices with accessible button names and descriptions', () => {
    render(<HelpModal isOpen={true} hasData={false} />);

    const uploadAction = screen.getByRole('button', { name: /Upload REDCap export & review records/i });
    expect(uploadAction).toBeInTheDocument();
    expect(screen.getByText(/Import patient records from a REDCap CSV export/i)).toBeInTheDocument();

    const directTestingAction = screen.getByRole('button', { name: /Open Allergy Testing/i });
    expect(directTestingAction).toBeInTheDocument();
    expect(screen.getByText(/Start a fresh testing session directly without selecting a patient/i)).toBeInTheDocument();
  });

  it('triggers file input when "Upload REDCap export & review records" is clicked', () => {
    render(<HelpModal isOpen={true} hasData={false} />);

    const fileInput = screen.getByLabelText(/Upload CSV file/i) as HTMLInputElement;
    const clickSpy = vi.spyOn(fileInput, 'click');

    const uploadAction = screen.getByRole('button', { name: /Upload REDCap export & review records/i });
    fireEvent.click(uploadAction);

    expect(clickSpy).toHaveBeenCalled();
  });

  it('clean direct testing: invokes onStartDirectTesting, acknowledges version, and closes modal', () => {
    const onStartDirectTesting = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <HelpModal
        isOpen={true}
        onOpenChange={onOpenChange}
        hasData={false}
        onStartDirectTesting={onStartDirectTesting}
        isTestingDraftDirty={false}
      />
    );

    const directTestingAction = screen.getByRole('button', { name: /Open Allergy Testing/i });
    fireEvent.click(directTestingAction);

    expect(onStartDirectTesting).toHaveBeenCalledOnce();
    expect(localStorage.setItem).toHaveBeenCalledWith('dream:last_seen_version', currentVersion);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('dirty direct testing: prompts confirmation without calling callback, cancelling preserves draft, and confirming invokes callback', () => {
    const onStartDirectTesting = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <HelpModal
        isOpen={true}
        onOpenChange={onOpenChange}
        hasData={false}
        onStartDirectTesting={onStartDirectTesting}
        isTestingDraftDirty={true}
      />
    );

    const directTestingAction = screen.getByRole('button', { name: /Open Allergy Testing/i });
    fireEvent.click(directTestingAction);

    // Should NOT call callback yet
    expect(onStartDirectTesting).not.toHaveBeenCalled();

    // Confirmation dialog should be open
    expect(screen.getByText('Start fresh testing session?')).toBeInTheDocument();
    expect(
      screen.getByText(/You have unsaved changes in your current testing session. Starting a fresh session will discard these changes./i)
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
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('opens modal when clicking the Quick Start Guide trigger button with data-help-modal-trigger', () => {
    render(<HelpModal hideTrigger={false} hasData={true} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    const triggerBtn = screen.getByRole('button', { name: /Quick Start Guide/i });
    expect(triggerBtn).toHaveAttribute('data-help-modal-trigger');
    fireEvent.click(triggerBtn);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('handles CSV upload parsing and invokes onUploadPatients and onUploadComplete', async () => {
    const onUploadPatients = vi.fn();
    const onUploadComplete = vi.fn();
    const onOpenChange = vi.fn();

    render(
      <HelpModal
        isOpen={true}
        onOpenChange={onOpenChange}
        hasData={false}
        onUploadPatients={onUploadPatients}
        onUploadComplete={onUploadComplete}
      />
    );

    const fileInput = screen.getByLabelText(/Upload CSV file/i) as HTMLInputElement;
    const csvContent = 'Record ID,First Name,Last Name,Date of Reaction:\n101,John,Doe,2023-01-01';
    const file = new File([csvContent], 'test.csv', { type: 'text/csv' });

    fireEvent.change(fileInput, { target: { files: [file] } });

    // Wait for FileReader onload to process
    await waitFor(() => {
      expect(onUploadPatients).toHaveBeenCalled();
      expect(onUploadComplete).toHaveBeenCalled();
    });

    expect(localStorage.setItem).toHaveBeenCalledWith('dream:last_seen_version', currentVersion);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
