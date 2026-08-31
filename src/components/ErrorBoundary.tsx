import React, { Component, ReactNode, ErrorInfo } from 'react';
import { ShieldAlert, RotateCcw, Home, Sparkles } from 'lucide-react';
import { logger } from '../utils/logger';

export interface ErrorBoundaryProps {
  children?: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
  moduleName?: string;
  onReset?: () => void;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public override state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    const module = this.props.moduleName || 'GlobalErrorBoundary';
    logger.error(module, `Caught runtime rendering exception: ${error.message}`, error, {
      componentStack: errorInfo.componentStack,
    });
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="w-full my-4 p-6 sm:p-8 rounded-2xl bg-[#081816] text-[#E8D5B5] border-2 border-[#C59B27]/40 shadow-xl text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#DFB76C]/15 border border-[#C59B27]/40 flex items-center justify-center text-[#DFB76C]">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="font-serif-luxury text-lg sm:text-xl font-bold text-white tracking-wide flex items-center justify-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#DFB76C]" />
              <span>{this.props.fallbackTitle || 'Component Temporarily Unavailable'}</span>
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 font-sans-modern leading-relaxed">
              {this.props.fallbackMessage || 'An unexpected rendering error occurred. The rest of the showroom remains fully functional.'}
            </p>
          </div>

          {process.env.NODE_ENV !== 'production' && this.state.error && (
            <div className="bg-black/50 p-3 rounded-lg border border-stone-800 text-left font-mono text-[11px] text-rose-300 max-w-xl mx-auto overflow-x-auto">
              <p className="font-bold">{this.state.error.name}: {this.state.error.message}</p>
              {this.state.errorInfo?.componentStack && (
                <pre className="text-[10px] text-stone-400 mt-1 whitespace-pre-wrap line-clamp-3">
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </div>
          )}

          <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
            <button
              type="button"
              onClick={this.handleReset}
              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#DFB76C] via-[#C59B27] to-[#996515] text-[#061715] text-xs font-semibold uppercase tracking-wider hover:brightness-110 shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reload Component</span>
            </button>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2.5 rounded-full bg-stone-900 border border-stone-700 text-stone-300 hover:text-white text-xs font-medium tracking-wider transition flex items-center gap-1.5 cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Refresh Page</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
