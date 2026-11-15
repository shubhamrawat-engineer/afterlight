import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Optional fallback UI to render on error. */
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * React error boundary that catches rendering errors in its subtree
 * and displays a user-friendly fallback.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log to console in development. Replace with reporting service in production.
    console.error('[AFTERLIGHT] Uncaught error:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 text-center">
          <AlertTriangle
            className="h-12 w-12"
            style={{ color: 'var(--color-accent-primary)' }}
          />
          <h2
            className="text-xl font-semibold"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Something went wrong
          </h2>
          <p
            className="max-w-md text-sm"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            An unexpected error occurred. Please try again or contact support if the
            issue persists.
          </p>
          {this.state.error && (
            <pre
              className="mt-2 max-w-lg overflow-auto rounded-md p-3 text-left text-xs"
              style={{
                background: 'var(--color-bg-tertiary)',
                color: 'var(--color-text-tertiary)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {this.state.error.message}
            </pre>
          )}
          <button
            type="button"
            onClick={this.handleRetry}
            className="mt-2 rounded-md px-4 py-2 text-sm font-medium transition-colors"
            style={{
              background: 'var(--color-accent-primary)',
              color: 'var(--color-text-primary)',
            }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
