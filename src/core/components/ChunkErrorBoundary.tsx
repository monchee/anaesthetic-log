import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui';

interface ChunkErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onRetry?: () => void;
}

interface ChunkErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

/**
 * Scoped error boundary for lazy-loaded route and component chunks.
 *
 * Catches dynamic import() failures (e.g. stale deployment hashes, transient network drops)
 * without unmounting the entire application or corrupting parent clinical workflow state.
 */
export class ChunkErrorBoundary extends Component<ChunkErrorBoundaryProps, ChunkErrorBoundaryState> {
  public state: ChunkErrorBoundaryState = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): ChunkErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('Chunk load error caught by ChunkErrorBoundary:', error, errorInfo);
  }

  private handleRetry = () => {
    this.props.onRetry?.();
    this.setState({ hasError: false, error: undefined });
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          role="alert"
          aria-live="polite"
          className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[300px]"
        >
          <div className="max-w-md w-full flex flex-col items-center gap-4 bg-card p-6 border border-border shadow-sm">
            <AlertTriangle className="h-10 w-10 text-status-warning" aria-hidden="true" />
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-foreground">
                Unable to load this section
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                A network interruption or application update prevented this screen from loading.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full pt-2">
              <Button
                type="button"
                onClick={this.handleRetry}
                variant="default"
                className="flex-1 rounded-none flex items-center justify-center gap-2"
                aria-label="Retry loading this section"
              >
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                <span>Retry</span>
              </Button>
              <Button
                type="button"
                onClick={this.handleReload}
                variant="outline"
                className="flex-1 rounded-none"
                aria-label="Reload the page"
              >
                Reload Page
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ChunkErrorBoundary;
