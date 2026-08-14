import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DraftSaveIndicator } from './DraftSaveIndicator';

describe('DraftSaveIndicator', () => {
  it('transitions from absent to saving and saved states', () => {
    const savedAt = new Date(2026, 5, 10, 14, 5).getTime();
    const { rerender } = render(
      <DraftSaveIndicator lastSavedAt={null} />
    );

    expect(screen.queryByText(/Saving|Draft saved|Unsaved/)).not.toBeInTheDocument();

    rerender(<DraftSaveIndicator isSaving lastSavedAt={null} />);
    expect(screen.getByText('Saving…')).toHaveAttribute('aria-live', 'polite');

    rerender(<DraftSaveIndicator lastSavedAt={savedAt} />);
    expect(screen.getByText('Draft saved · 14:05')).toHaveAttribute('aria-live', 'polite');
  });

  it('shows unsaved changes when isDirty or hasChanges is true without exposing patient details', () => {
    const { rerender } = render(
      <DraftSaveIndicator isDirty lastSavedAt={null} />
    );

    expect(screen.getByText('Unsaved changes')).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByText('Unsaved changes')).toHaveClass('text-status-warning');

    rerender(<DraftSaveIndicator hasChanges lastSavedAt={null} />);
    expect(screen.getByText('Unsaved changes')).toBeInTheDocument();

    // When saving occurs, saving state takes precedence
    rerender(<DraftSaveIndicator isDirty isSaving lastSavedAt={null} />);
    expect(screen.getByText('Saving…')).toBeInTheDocument();
    expect(screen.queryByText('Unsaved changes')).not.toBeInTheDocument();
  });

  it('renders No draft when showNoDraft is true and no draft exists', () => {
    render(<DraftSaveIndicator showNoDraft lastSavedAt={null} />);
    expect(screen.getByText('No draft')).toBeInTheDocument();
  });
});
