import { fireEvent, render, screen } from '@testing-library/react';
import React, { useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ErrorBoundary from './ErrorBoundary';
import * as sentry from '@/src/lib/sentry';

vi.mock('@/src/lib/sentry', () => ({
  captureException: vi.fn(),
}));

function ProblemChild({
  shouldThrow,
  errorMessage = 'Test application crash',
}: {
  shouldThrow?: boolean;
  errorMessage?: string;
}) {
  if (shouldThrow) {
    throw new Error(errorMessage);
  }
  return <div data-testid="app-content">Normal Application Content</div>;
}

function ResettableApp() {
  const [shouldThrow, setShouldThrow] = useState(true);

  return (
    <div>
      <button type="button" onClick={() => setShouldThrow(false)}>
        Disable Error
      </button>
      <ErrorBoundary>
        <ProblemChild shouldThrow={shouldThrow} />
      </ErrorBoundary>
    </div>
  );
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByTestId('app-content')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  it('catches error and displays full-screen clinical recovery UI', () => {
    render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={true} errorMessage="Clinical form error" />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(
      screen.getByText("An unexpected error occurred. Don't worry, your data is safe.")
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reload the page/i })).toBeInTheDocument();
  });

  it('logs error details to console and sends exception to Sentry', () => {
    const errorSpy = vi.spyOn(console, 'error');
    const captureSpy = vi.spyOn(sentry, 'captureException');

    render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={true} errorMessage="Sentry test error" />
      </ErrorBoundary>
    );

    expect(errorSpy).toHaveBeenCalledWith('Uncaught error:', expect.any(Error));
    expect(errorSpy).toHaveBeenCalledWith('Error message:', 'Sentry test error');
    expect(errorSpy).toHaveBeenCalledWith('Error stack:', expect.any(String));
    expect(captureSpy).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Sentry test error' }),
      expect.objectContaining({
        extra: expect.objectContaining({ componentStack: expect.any(String) }),
      })
    );
  });

  it('resets error boundary state when Try Again button is clicked', () => {
    render(<ResettableApp />);

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    // Disable the error condition first
    const disableButton = screen.getByRole('button', { name: /disable error/i });
    fireEvent.click(disableButton);

    // Now click Try Again on the error boundary
    const tryAgainButton = screen.getByRole('button', { name: /try again/i });
    fireEvent.click(tryAgainButton);

    expect(screen.getByTestId('app-content')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  it('reloads page when Reload Page button is clicked', () => {
    const reloadMock = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: reloadMock },
      writable: true,
      configurable: true,
    });

    render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>
    );

    const reloadButton = screen.getByRole('button', { name: /reload the page/i });
    fireEvent.click(reloadButton);

    expect(reloadMock).toHaveBeenCalledTimes(1);
  });

  it('always displays a support-friendly error ID, and includes it in the Sentry report', () => {
    const captureSpy = vi.spyOn(sentry, 'captureException');

    render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={true} errorMessage="Error ID test" />
      </ErrorBoundary>
    );

    const errorIdText = screen.getByText(/Error ID:/);
    expect(errorIdText).toBeInTheDocument();
    expect(errorIdText.textContent).toMatch(/Error ID: \S+/);
    expect(captureSpy).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Error ID test' }),
      expect.objectContaining({
        extra: expect.objectContaining({ errorId: expect.any(String) }),
      })
    );
  });

  it('clears the error ID when Try Again is clicked', () => {
    render(<ResettableApp />);

    expect(screen.getByText(/Error ID:/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /disable error/i }));
    fireEvent.click(screen.getByRole('button', { name: /try again/i }));

    expect(screen.queryByText(/Error ID:/)).not.toBeInTheDocument();
  });

  it('renders stack trace in details block in development mode', () => {
    render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={true} errorMessage="Dev mode error message" />
      </ErrorBoundary>
    );

    expect(screen.getByText('Error Details (development only)')).toBeInTheDocument();
    expect(screen.getByText(/Message:/)).toBeInTheDocument();
    expect(screen.getByText('Stack:')).toBeInTheDocument();
    expect(screen.getAllByText(/Dev mode error message/).length).toBeGreaterThan(0);
  });
});
