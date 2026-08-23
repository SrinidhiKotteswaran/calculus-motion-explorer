import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button, Panel } from './ui';

interface Props { children: ReactNode; }
interface State { hasError: boolean; message: string; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message || 'An unexpected error occurred.' };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Motion Explorer runtime error:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, message: '' });
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <main className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg)' }}>
        <Panel>
          <div className="max-w-lg space-y-4">
            <h1 className="text-xl font-semibold">Something went wrong</h1>
            <p className="text-sm text-secondary">Motion Explorer hit an unexpected error. Your work was not submitted anywhere; try resetting this view.</p>
            <details className="text-xs text-secondary">
              <summary className="cursor-pointer">Technical details</summary>
              <pre className="mt-2 whitespace-pre-wrap">{this.state.message}</pre>
            </details>
            <Button variant="primary" onClick={this.handleReset}>Reset view</Button>
          </div>
        </Panel>
      </main>
    );
  }
}
