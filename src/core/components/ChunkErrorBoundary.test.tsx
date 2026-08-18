import { fireEvent, render, screen } from '@testing-library/react';
import React, { useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ChunkErrorBoundary } from './ChunkErrorBoundary';

function ProblemChild({ shouldThrow }: { shouldThrow?: boolean }) {
  if (shouldThrow) {
    throw new Error('Failed to fetch dynamically imported module: /assets/DashboardScreen.js');
  }
  return <div data-testid="child-content">Lazy route loaded successfully</div>;
}

function RetryableComponent() {
  const [hasFailed, setHasFailed] = useState(true);

  return (
    <ChunkErrorBoundary onRetry={() => setHasFailed(false)}>
      <ProblemChild shouldThrow={hasFailed} />
    </ChunkErrorBoundary>
  );
}

describe('ChunkErrorBoundary', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('renders children normally when no error occurs', () => {
    render(
      <ChunkErrorBoundary>
        <ProblemChild shouldThrow={false} />
      </ChunkErrorBoundary>
    );

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByText('Lazy route loaded successfully')).toBeInTheDocument();
    expect(screen.queryByText('Unable to load this section')).not.toBeInTheDocument();
  });

  it('catches thrown lazy-load error and renders fallback UI instead of crashing', () => {
    render(
      <ChunkErrorBoundary>
        <ProblemChild shouldThrow={true} />
      </ChunkErrorBoundary>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Unable to load this section')).toBeInTheDocument();
    expect(
      screen.getByText(/A network interruption or application update prevented this screen from loading/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reload/i })).toBeInTheDocument();
    expect(screen.queryByTestId('child-content')).not.toBeInTheDocument();
  });

  it('renders custom fallback when provided via props', () => {
    render(
      <ChunkErrorBoundary fallback={<div data-testid="custom-fallback">Custom Error View</div>}>
        <ProblemChild shouldThrow={true} />
      </ChunkErrorBoundary>
    );

    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
    expect(screen.getByText('Custom Error View')).toBeInTheDocument();
    expect(screen.queryByText('Unable to load this section')).not.toBeInTheDocument();
  });

  it('retries rendering and invokes onRetry callback when Retry button is clicked', () => {
    render(<RetryableComponent />);

    expect(screen.getByText('Unable to load this section')).toBeInTheDocument();

    const retryButton = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(retryButton);

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.queryByText('Unable to load this section')).not.toBeInTheDocument();
  });

  it('calls window.location.reload when Reload Page button is clicked', () => {
    const reloadMock = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: reloadMock },
      writable: true,
      configurable: true,
    });

    render(
      <ChunkErrorBoundary>
        <ProblemChild shouldThrow={true} />
      </ChunkErrorBoundary>
    );

    const reloadButton = screen.getByRole('button', { name: /reload the page/i });
    fireEvent.click(reloadButton);

    expect(reloadMock).toHaveBeenCalledTimes(1);
  });

  it('logs a warning when a chunk load error is caught', () => {
    const warnSpy = vi.spyOn(console, 'warn');

    render(
      <ChunkErrorBoundary>
        <ProblemChild shouldThrow={true} />
      </ChunkErrorBoundary>
    );

    expect(warnSpy).toHaveBeenCalledWith(
      'Chunk load error caught by ChunkErrorBoundary:',
      expect.any(Error),
      expect.objectContaining({ componentStack: expect.any(String) })
    );
  });
});
