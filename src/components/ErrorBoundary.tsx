import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-neutral-950 text-white font-sans text-center space-y-6">
          <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-xl max-w-xl space-y-4 shadow-2xl">
            <span className="text-4xl">🚨</span>
            <h1 className="text-xl font-bold font-serif text-amber-500">Application Error</h1>
            <p className="text-xs text-neutral-400 leading-relaxed">
              A runtime exception was encountered in the storefront component tree.
            </p>
            <div className="p-3 bg-neutral-950 rounded border border-neutral-850 text-left text-[11px] font-mono text-red-400 overflow-x-auto whitespace-pre-wrap max-h-48">
              {this.state.error?.stack || this.state.error?.message || String(this.state.error)}
            </div>
            <div className="flex justify-center space-x-3 pt-2">
              <button
                onClick={this.handleReset}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold rounded uppercase tracking-wider transition-colors cursor-pointer"
              >
                Reset App & Clear Cache
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold rounded uppercase tracking-wider transition-colors cursor-pointer"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
