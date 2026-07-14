import { fireEvent, render, screen } from '@/src/test/helpers';
import { describe, expect, it, vi } from 'vitest';
import { ScreenUnavailable } from './ScreenUnavailable';

describe('ScreenUnavailable', () => {
  it('renders its explanation and invokes both recovery actions', () => {
    const onGoHome = vi.fn();
    const onGoDashboard = vi.fn();

    render(
      <ScreenUnavailable
        title="No active report"
        message="The report data is no longer available."
        onGoHome={onGoHome}
        onGoDashboard={onGoDashboard}
      />
    );

    expect(screen.getByRole('heading', { name: 'No active report', level: 2 })).toBeInTheDocument();
    expect(screen.getByText('The report data is no longer available.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Go Home' }));
    fireEvent.click(screen.getByRole('button', { name: 'Go to Dashboard' }));

    expect(onGoHome).toHaveBeenCalledOnce();
    expect(onGoDashboard).toHaveBeenCalledOnce();
  });
});
