import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#070816] text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-[#12142B] border border-white/10 rounded-2xl p-8 shadow-2xl">
            <div className="w-16 h-16 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
              !
            </div>
            <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
            <p className="text-gray-400 text-sm mb-6">
              {this.state.error?.message || 'An unexpected error occurred while loading the application.'}
            </p>
            <button
              onClick={() => window.location.assign('/')}
              className="w-full py-3 px-4 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-medium rounded-xl transition-all shadow-lg shadow-[#7C3AED]/25"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
