import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Phone, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AuthModal() {
  const { authModalOpen, setAuthModalOpen, login, register } = useAuth();
  const [tab, setTab] = useState('login'); // 'login' | 'register' | 'otp'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!authModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (tab === 'login') {
        await login(email, password);
      } else if (tab === 'register') {
        await register(name, email, phone, password);
      } else if (tab === 'otp') {
        // Submit OTP demo
        await login(phone ? `${phone}@primeshow.com` : 'user@primeshow.com', 'user123');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed. Please check details.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdminLogin = async () => {
    setLoading(true);
    await login('admin@primeshow.com', 'admin123');
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-md bg-[#0c0d14] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
      >
        {/* Glow accent ambient circle */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        
        {/* CLOSE BUTTON */}
        <button
          onClick={() => setAuthModalOpen(false)}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* HEADER */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-1">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-3xl font-bold text-white">Welcome to PrimeShow</h2>
          <p className="text-xs text-slate-400">Unlock luxury movie reservations & exclusive member perks.</p>
        </div>

        {/* TAB SWITCHER */}
        <div className="flex p-1 rounded-2xl glass-panel mb-6 border-white/10">
          <button
            onClick={() => { setTab('login'); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              tab === 'login' ? 'bg-cyan-500 text-black shadow-md glow-cyan' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setTab('register'); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              tab === 'register' ? 'bg-cyan-500 text-black shadow-md glow-cyan' : 'text-slate-400 hover:text-white'
            }`}
          >
            Register
          </button>
          <button
            onClick={() => { setTab('otp'); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              tab === 'otp' ? 'bg-cyan-500 text-black shadow-md glow-cyan' : 'text-slate-400 hover:text-white'
            }`}
          >
            Mobile OTP
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400">
            {error}
          </div>
        )}

        {/* FORM CONTENT */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === 'register' && (
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3 rounded-2xl text-sm glass-input placeholder:text-slate-500"
              />
            </div>
          )}

          {tab !== 'otp' && (
            <>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-2xl text-sm glass-input placeholder:text-slate-500"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-2xl text-sm glass-input placeholder:text-slate-500"
                />
              </div>
            </>
          )}

          {tab === 'register' && (
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="tel"
                placeholder="Mobile Number (+91)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl text-sm glass-input placeholder:text-slate-500"
              />
            </div>
          )}

          {tab === 'otp' && (
            <div className="space-y-3">
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  placeholder="Mobile Number (+91)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl text-sm glass-input placeholder:text-slate-500"
                />
              </div>
              <p className="text-[11px] text-slate-400 text-center">Enter 4-digit code sent via SMS (Demo code: 1234)</p>
              <div className="flex justify-center gap-3">
                {[0, 1, 2, 3].map((idx) => (
                  <input
                    key={idx}
                    type="text"
                    maxLength={1}
                    value={otp[idx]}
                    onChange={(e) => {
                      const newOtp = [...otp];
                      newOtp[idx] = e.target.value;
                      setOtp(newOtp);
                    }}
                    className="w-12 h-12 text-center text-lg font-bold rounded-2xl glass-input border-cyan-500/30"
                  />
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-cyan-400 to-indigo-600 text-black font-bold text-sm hover:brightness-110 transition-all glow-cyan flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {loading ? 'Processing...' : tab === 'login' ? 'Sign In Now' : tab === 'register' ? 'Create Account' : 'Verify & Continue'}
            <ArrowRight className="w-4 h-4 text-black stroke-[3]" />
          </button>
        </form>

        {/* OAUTH SOCIAL TRIGGERS */}
        <div className="mt-6 pt-4 border-t border-white/10 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => login('google.user@primeshow.com', 'user123')}
              className="py-2.5 px-3 rounded-xl glass-panel hover:border-cyan-500/40 text-xs font-semibold text-slate-300 flex items-center justify-center gap-2"
            >
              <span>Continue with Google</span>
            </button>
            <button
              onClick={() => login('apple.user@primeshow.com', 'user123')}
              className="py-2.5 px-3 rounded-xl glass-panel hover:border-cyan-500/40 text-xs font-semibold text-slate-300 flex items-center justify-center gap-2"
            >
              <span>Continue with Apple</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleQuickAdminLogin}
            className="w-full py-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold hover:bg-purple-500/20 transition-colors flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            Quick Demo Login as Executive Admin
          </button>
        </div>
      </motion.div>
    </div>
  );
}
