import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DraftSaveIndicator } from './DraftSaveIndicator';

describe('DraftSaveIndicator', () => {
  it('transitions from absent to saving and saved states', () => {
    const savedAt = new Date(2026, 5, 10, 14, 5).getTime();
    const { rerender } = render(
      <DraftSaveIndicator lastSavedAt={null} />
    );

    expect(screen.queryByText(/Saving|Draft saved/)).not.toBeInTheDocument();

    rerender(<DraftSaveIndicator isSaving lastSavedAt={null} />);
    expect(screen.getByText('Saving…')).toHaveAttribute('aria-live', 'polite');

    rerender(<DraftSaveIndicator lastSavedAt={savedAt} />);
    expect(screen.getByText('Draft saved · 14:05')).toHaveAttribute('aria-live', 'polite');
  });
});
