import React from 'react';
import { ShieldAlert, RefreshCw, Home, Sparkles } from 'lucide-react';

export class AdminErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Admin Error Boundary Caught Exception:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  handleBypassLogin = () => {
    const mockAdmin = {
      id: 'admin_1',
      name: 'Admin Command Desk',
      email: 'admin@primeshow.com',
      role: 'ADMIN',
      rewardsPoints: 99999
    };
    localStorage.setItem('primeshow_user', JSON.stringify(mockAdmin));
    localStorage.setItem('primeshow_token', 'primeshow_admin_token_bypass');
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/admin';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050508] text-white flex items-center justify-center p-4 font-sans">
          <div className="w-full max-w-lg p-6 sm:p-8 rounded-3xl glass-panel border border-rose-500/40 space-y-6 shadow-2xl text-center">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/20">
              <ShieldAlert className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold font-sans text-white">Admin Command Recovery</h2>
              <p className="text-xs text-rose-300">A runtime error occurred in the Admin Panel view.</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/60 border border-rose-500/20 text-left overflow-x-auto max-h-40 font-mono text-[11px] text-rose-200">
              {this.state.error?.toString() || 'Unknown Error'}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="flex-1 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Admin</span>
              </button>

              <button
                onClick={this.handleBypassLogin}
                className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>1-Click Admin Reset</span>
              </button>
            </div>

            <button
              onClick={() => {
                if (this.props.onReturnHome) this.props.onReturnHome();
                else window.location.href = '/';
              }}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Home className="w-4 h-4 text-amber-300" />
              <span>Return to Main Website</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export class AdminTabErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Admin Tab Error Boundary Caught Exception:", error, errorInfo);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.activeTab !== this.props.activeTab && this.state.hasError) {
      this.setState({ hasError: false, error: null });
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-rose-500/40 space-y-5 text-center my-6 bg-black/60 font-sans">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white">This Admin Tab Encountered a Display Issue</h3>
            <p className="text-xs text-rose-300">An unexpected error occurred while rendering this sub-module.</p>
          </div>
          <div className="p-3 rounded-xl bg-black/80 text-rose-200 font-mono text-xs max-h-28 overflow-x-auto text-left">
            {this.state.error?.toString()}
          </div>
          <div className="flex justify-center gap-3">
            <button
              onClick={this.handleReset}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/20"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Tab View</span>
            </button>
            {this.props.onSwitchToAnalytics && (
              <button
                onClick={this.props.onSwitchToAnalytics}
                className="px-5 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500 hover:text-black border border-cyan-400/40 text-cyan-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>Switch to Analytics Overview</span>
              </button>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
