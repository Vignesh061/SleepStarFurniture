import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled UI Exception caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    try {
      // Clear potentially corrupt local cache
      localStorage.removeItem('ss_cached_products');
      localStorage.removeItem('ss_cached_categories');
      localStorage.removeItem('ss_cached_services');
      localStorage.removeItem('ss_cached_projects');
      localStorage.removeItem('ss_cached_offers');
      localStorage.removeItem('ss_cached_enquiries');
      localStorage.removeItem('ss_cached_settings');
    } catch (_) {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white rounded-2xl border border-neutral-200 p-8 shadow-sm space-y-5 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
                An unexpected display error occurred
              </h2>
              <p className="text-xs text-neutral-500">
                The application encountered an error while rendering this page.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-left font-mono text-[11px] text-red-700 overflow-x-auto max-h-36">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="flex-1 inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Cache & Reload</span>
              </button>

              <a
                href="/"
                className="flex-1 inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 text-xs font-semibold hover:bg-neutral-50 transition-colors"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Return to Home</span>
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

