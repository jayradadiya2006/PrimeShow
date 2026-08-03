import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, Sun, Moon, Laptop, Bell, Shield, Lock, 
  MapPin, Check, ArrowLeft, Smartphone, Key, Sliders, Save, CheckCircle2, User, HelpCircle, LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Settings = ({ onReturnHome }) => {
  const { user, logout, themePreference, setThemePreference, effectiveTheme, selectedCity, changeCity, updateUserProfile } = useAuth();

  // Notification Toggles State
  const [bookingAlerts, setBookingAlerts] = useState(true);
  const [promoAlerts, setPromoAlerts] = useState(true);
  const [releaseAlerts, setReleaseAlerts] = useState(false);
  const [whatsappNotifications, setWhatsappNotifications] = useState(true);

  // Security Form State
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passMsg, setPassMsg] = useState({ text: '', isError: false });
  const [savingPass, setSavingPass] = useState(false);

  // Quick Account Info State
  const [cityInput, setCityInput] = useState(selectedCity || 'Mumbai');
  const [savedCityMsg, setSavedCityMsg] = useState(false);

  const handleCitySave = (e) => {
    e.preventDefault();
    changeCity(cityInput);
    setSavedCityMsg(true);
    setTimeout(() => setSavedCityMsg(false), 2500);
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    setPassMsg({ text: '', isError: false });

    if (!currentPass) {
      setPassMsg({ text: 'Please enter your current password.', isError: true });
      return;
    }
    if (newPass.length < 6) {
      setPassMsg({ text: 'New password must be at least 6 characters long.', isError: true });
      return;
    }
    if (newPass !== confirmPass) {
      setPassMsg({ text: 'New password and confirmation do not match.', isError: true });
      return;
    }

    setSavingPass(true);
    setTimeout(() => {
      setSavingPass(false);
      setPassMsg({ text: 'Password successfully updated!', isError: false });
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
      setTimeout(() => setPassMsg({ text: '', isError: false }), 3000);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#07090e] text-slate-900 dark:text-white transition-colors duration-300 pb-16">
      
      {/* Dedicated Minimal Header Bar for Settings Page */}
      <header className="sticky top-0 z-50 glass-panel border-b border-slate-300 dark:border-white/10 px-4 sm:px-8 py-4 flex items-center justify-between shadow-lg">
        <button
          onClick={onReturnHome}
          className="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center group-hover:-translate-x-1 transition-transform">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span>Back to Home</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
            <SettingsIcon className="w-4 h-4" />
          </div>
          <span className="text-base sm:text-lg font-bold tracking-wide">Platform Settings</span>
        </div>

        <div className="w-20"></div> {/* Spacer for symmetry */}
      </header>

      {/* Main Settings Body */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        
        {/* Banner Section */}
        <div className="relative rounded-3xl overflow-hidden glass-panel p-6 sm:p-8 border border-slate-300 dark:border-white/10 bg-gradient-to-r from-cyan-900/30 via-slate-900/40 to-amber-900/20">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-amber-500 flex items-center justify-center text-black font-black text-2xl shadow-xl">
              <Sliders className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black font-sans tracking-wide">System & Account Settings</h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-white/60">Customize preferences, security settings, and notifications</p>
            </div>
          </div>
        </div>

        {/* 1. Theme & Appearance Settings */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-300 dark:border-white/10 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-white/10">
            <Sun className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold">Theme & Appearance Mode</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <button
              onClick={() => setThemePreference('dark')}
              className={`p-4 rounded-2xl border flex items-center gap-3 text-xs font-bold transition-all cursor-pointer ${
                themePreference === 'dark'
                  ? 'bg-amber-500/20 border-amber-500 text-amber-600 dark:text-amber-300 shadow-md'
                  : 'bg-slate-200/50 dark:bg-white/5 border-slate-300 dark:border-white/10 hover:border-amber-400/40'
              }`}
            >
              <Moon className="w-5 h-5 text-amber-400" />
              <div className="text-left">
                <div>Dark Mode</div>
                <div className="text-[10px] font-normal text-slate-500 dark:text-white/50">Ultra Dark Luxury View</div>
              </div>
            </button>

            <button
              onClick={() => setThemePreference('light')}
              className={`p-4 rounded-2xl border flex items-center gap-3 text-xs font-bold transition-all cursor-pointer ${
                themePreference === 'light'
                  ? 'bg-amber-500/20 border-amber-500 text-amber-600 dark:text-amber-300 shadow-md'
                  : 'bg-slate-200/50 dark:bg-white/5 border-slate-300 dark:border-white/10 hover:border-amber-400/40'
              }`}
            >
              <Sun className="w-5 h-5 text-amber-500" />
              <div className="text-left">
                <div>Light Mode</div>
                <div className="text-[10px] font-normal text-slate-500 dark:text-white/50">Clean High Contrast</div>
              </div>
            </button>

            <button
              onClick={() => setThemePreference('system')}
              className={`p-4 rounded-2xl border flex items-center gap-3 text-xs font-bold transition-all cursor-pointer ${
                themePreference === 'system'
                  ? 'bg-amber-500/20 border-amber-500 text-amber-600 dark:text-amber-300 shadow-md'
                  : 'bg-slate-200/50 dark:bg-white/5 border-slate-300 dark:border-white/10 hover:border-amber-400/40'
              }`}
            >
              <Laptop className="w-5 h-5 text-cyan-400" />
              <div className="text-left">
                <div>System Mode</div>
                <div className="text-[10px] font-normal text-slate-500 dark:text-white/50">Sync with System</div>
              </div>
            </button>
          </div>
        </div>

        {/* 2. Regional & City Settings */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-300 dark:border-white/10 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-white/10">
            <MapPin className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold">Default City & Regional Preferences</h2>
          </div>

          <form onSubmit={handleCitySave} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <div className="relative flex-grow">
              <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-amber-500" />
              <select
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs font-bold text-slate-900 dark:text-white border border-slate-300 dark:border-white/15 cursor-pointer"
              >
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi NCR">Delhi NCR</option>
                <option value="Bengaluru">Bengaluru</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Ahmedabad">Ahmedabad</option>
                <option value="Pune">Pune</option>
                <option value="Chennai">Chennai</option>
                <option value="Kolkata">Kolkata</option>
              </select>
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Update City</span>
            </button>
          </form>
          {savedCityMsg && (
            <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 animate-fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>City preference saved successfully!</span>
            </div>
          )}
        </div>

        {/* 3. Notification Preferences */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-300 dark:border-white/10 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-white/10">
            <Bell className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold">Alerts & Notification Preferences</h2>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-200/50 dark:bg-white/5 border border-slate-300 dark:border-white/10">
              <div>
                <h4 className="text-xs font-bold">Booking Confirmations & Tickets</h4>
                <p className="text-[11px] text-slate-500 dark:text-white/50">Instant SMS and email notifications for movie bookings</p>
              </div>
              <input
                type="checkbox"
                checked={bookingAlerts}
                onChange={(e) => setBookingAlerts(e.target.checked)}
                className="w-5 h-5 accent-amber-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-200/50 dark:bg-white/5 border border-slate-300 dark:border-white/10">
              <div>
                <h4 className="text-xs font-bold">Promotions & Exclusive Discounts</h4>
                <p className="text-[11px] text-slate-500 dark:text-white/50">Receive discount codes, bank offers, and festive deals</p>
              </div>
              <input
                type="checkbox"
                checked={promoAlerts}
                onChange={(e) => setPromoAlerts(e.target.checked)}
                className="w-5 h-5 accent-amber-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-200/50 dark:bg-white/5 border border-slate-300 dark:border-white/10">
              <div>
                <h4 className="text-xs font-bold">WhatsApp Ticket Delivery</h4>
                <p className="text-[11px] text-slate-500 dark:text-white/50">Send QR tickets and movie updates straight to WhatsApp</p>
              </div>
              <input
                type="checkbox"
                checked={whatsappNotifications}
                onChange={(e) => setWhatsappNotifications(e.target.checked)}
                className="w-5 h-5 accent-amber-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* 4. Password & Security Management */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-300 dark:border-white/10 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-white/10">
            <Lock className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold">Password & Security Management</h2>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-3 pt-2 max-w-md">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Current Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">New Password</label>
              <input
                type="password"
                placeholder="At least 6 characters"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Confirm New Password</label>
              <input
                type="password"
                placeholder="Repeat new password"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-slate-900 dark:text-white"
              />
            </div>

            {passMsg.text && (
              <div className={`text-xs font-bold p-3 rounded-xl border ${passMsg.isError ? 'bg-rose-500/20 border-rose-500/40 text-rose-300' : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'}`}>
                {passMsg.text}
              </div>
            )}

            <button
              type="submit"
              disabled={savingPass}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 text-black font-extrabold text-xs shadow-lg hover:brightness-110 transition-all cursor-pointer"
            >
              {savingPass ? 'Updating Password...' : 'Change Password'}
            </button>
          </form>
        </div>

        {/* 5. Account Session & Mobile Logout Section */}
        <div className="glass-panel rounded-3xl p-6 border border-rose-500/30 bg-rose-500/5 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-rose-500/20">
            <LogOut className="w-5 h-5 text-rose-500" />
            <h2 className="text-base font-bold text-rose-400">Account Session & Mobile Logout</h2>
          </div>
          
          <p className="text-xs text-slate-600 dark:text-white/60">
            Signing out will end your active session on this device and clear secure local storage tokens.
          </p>

          <button
            onClick={() => {
              logout();
              if (onReturnHome) onReturnHome();
            }}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-500 to-rose-600 hover:from-rose-500 hover:to-rose-400 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <LogOut className="w-4 h-4 text-white" />
            <span>Sign Out of PrimeShow Account</span>
          </button>
        </div>

      </div>
    </div>
  );
};
