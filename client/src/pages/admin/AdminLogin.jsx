import React, { useState } from 'react';
import { Shield, Lock, Mail, Sparkles, ArrowRight, Home } from 'lucide-react';
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
      setError('Invalid admin credentials');
    }
  };

  return (
    <div className="min-h-screen bg-[#050508] text-white flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md glass-modal rounded-3xl p-8 border border-cyan-400/30 shadow-2xl relative">
        
        {/* Brand & Portal Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 mb-3 shadow-lg shadow-cyan-500/20">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold font-sans text-white">Admin Command Portal</h2>
          <p className="text-xs text-cyan-300/80 font-sans mt-1">PrimeShow Isolated Operations Control</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-medium mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-cyan-400/60" />
            <input
              type="email"
              required
              placeholder="Admin Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-xs text-white placeholder-white/40"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-cyan-400/60" />
            <input
              type="password"
              required
              placeholder="Admin Security Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-xs text-white placeholder-white/40"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-400 to-cyan-500 text-black font-extrabold text-xs shadow-lg shadow-cyan-500/25 hover:brightness-110 transition-all flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Authenticating Token...' : 'Enter Admin Management Portal'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Action Button: Return to Customer Home Page */}
        <div className="mt-6 pt-4 border-t border-white/10 space-y-3">
          <button
            type="button"
            onClick={onGoHome}
            className="w-full py-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Return to Customer Home Page</span>
          </button>

          <div className="text-center">
            <span className="text-[10px] text-cyan-300/70 font-mono">Demo Admin: admin@primeshow.com / admin123</span>
          </div>
        </div>

      </div>
    </div>
  );
};
