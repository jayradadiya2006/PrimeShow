import React, { useState } from 'react';
import { Shield, Lock, Mail, ArrowRight, Home, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLogin = ({ onLoginSuccess, onGoHome }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@primeshow.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (res.success) {
      onLoginSuccess();
    } else {
      setError('Invalid admin credentials. Please verify your email and password.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-white flex items-center justify-center p-4 font-sans selection:bg-[#D90000] selection:text-white relative overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#D90000]/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-[#141A26] rounded-3xl p-8 border border-slate-700/80 shadow-2xl relative z-10 space-y-6">
        
        {/* Brand & Portal Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#D90000]/20 border border-[#D90000]/50 text-[#D90000] shadow-lg shadow-red-950/40">
            <Shield className="w-8 h-8 text-[#D90000]" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Admin Command Portal</h2>
          <p className="text-xs text-slate-400 font-medium">PrimeShow Real-Time Operations & CMS Control</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-700/60 text-red-200 text-xs font-semibold text-center shadow-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300">Admin Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                placeholder="admin@primeshow.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0F172A] border border-slate-600 text-sm font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-[#D90000] focus:ring-1 focus:ring-[#D90000] transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300">Security Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0F172A] border border-slate-600 text-sm font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-[#D90000] focus:ring-1 focus:ring-[#D90000] transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#D90000] hover:bg-[#b00000] text-white font-black text-sm shadow-xl shadow-red-900/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <span>{loading ? 'Authenticating...' : 'Enter Admin Management Portal'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Credentials Pill & Return Home */}
        <div className="pt-4 border-t border-slate-700/80 space-y-3">
          <div className="p-3 rounded-xl bg-[#0F172A] border border-slate-700/80 text-center space-y-1">
            <div className="text-[11px] text-slate-400 font-semibold">Pre-configured Admin Access:</div>
            <div className="text-xs font-mono font-bold text-[#DBCEA5]">
              admin@primeshow.com &bull; admin123
            </div>
          </div>

          <button
            type="button"
            onClick={onGoHome}
            className="w-full py-3 rounded-xl bg-[#1E293B] hover:bg-[#334155] border border-slate-600 text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <Home className="w-4 h-4 text-slate-400" />
            <span>Return to Customer Home Page</span>
          </button>
        </div>

      </div>
    </div>
  );
};
