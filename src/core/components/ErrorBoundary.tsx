import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui';
import { captureException } from '@/src/lib/sentry';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Single-boundary error isolation for the DREAM clinical application.
 *
 * A single top-level ErrorBoundary is safer than per-route boundaries for a
 * clinical app because partial recovery could corrupt data-entry state (e.g.
 * half-saved test results, incomplete challenge recording). One reset point
 * keeps recovery simple and prevents stale, inconsistent state from rendering.
 *
 * Falls back to a minimal recovery UI with error details for IT support.
 */
class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error info:', errorInfo);
    console.error('Component stack:', errorInfo.componentStack);
    void captureException(error, {
      extra: {
        componentStack: errorInfo.componentStack,
      },
    });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full">
            <div className="bg-card rounded-none shadow-lg p-6 text-center">
              <div className="flex justify-center mb-4">
                <AlertTriangle className="h-12 w-12 text-red-500" aria-hidden="true" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Something went wrong
              </h2>
              <p className="text-muted-foreground mb-2">
                An unexpected error occurred. Don't worry, your data is safe.
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Try these steps to recover:
              </p>
              <div className="space-y-3 text-left mb-6">
                <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                  <li>Click <strong>"Try Again"</strong> to reset the current screen</li>
                  <li>Click <strong>"Reload Page"</strong> to refresh the application</li>
                  <li>If the issue persists, contact IT support with the error details below</li>
                </ol>
              </div>
              <div className="space-y-3">
                <Button onClick={this.handleReset} className="w-full" aria-label="Try again">
                  <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
                  Try Again
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="w-full"
                  aria-label="Reload the page"
                >
                  Reload Page
                </Button>
              </div>
              {this.state.error && (
                <details className="mt-4 text-left">
                  <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                    Error Details (for IT support)
                  </summary>
                  <div className="mt-2 text-xs bg-muted p-3 rounded overflow-auto space-y-2">
                    <div><strong>Message:</strong> {this.state.error.message}</div>
                    {this.state.error.stack && (
                      <div>
                        <strong>Stack:</strong>
                        <pre className="mt-1 whitespace-pre-wrap text-xs">{this.state.error.stack}</pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
