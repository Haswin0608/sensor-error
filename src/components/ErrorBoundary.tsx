/**
 * React Error Boundary component for SensorSure
 * Catches render errors and displays the actual error message on screen.
 */

import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

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

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('SensorSure Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0B1020] text-[#E6EAF2] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-slate-900/80 backdrop-blur-xl border border-red-500/30 rounded-2xl p-8 shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/30">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
            <p className="text-sm text-slate-400 mb-6">
              SensorSure caught an unexpected error during rendering. You can try reloading the application.
            </p>
            {this.state.error && (
              <div className="bg-black/40 border border-red-500/20 rounded-lg p-3 text-left font-mono text-xs text-red-300 mb-6 overflow-x-auto max-h-32">
                {this.state.error.toString()}
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-semibold hover:opacity-95 transition shadow-lg shadow-teal-500/20 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
