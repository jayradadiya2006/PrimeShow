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
    <div className="min-h-screen bg-[#FFFFFF] text-slate-900 pb-16 font-sans">
      
      {/* Dedicated Minimal Header Bar for Settings Page */}
      <header className="sticky top-0 z-50 bg-[#DBCEA5] border-b border-[#c5ba92] px-4 sm:px-8 py-4 flex items-center justify-between shadow-md text-slate-900">
        <button
          onClick={onReturnHome}
          className="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-[#D90000] hover:text-[#b00000] transition-colors group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-[#D90000]/10 flex items-center justify-center group-hover:-translate-x-1 transition-transform">
            <ArrowLeft className="w-4 h-4 text-[#D90000]" />
          </div>
          <span>Back to Home</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#D90000] flex items-center justify-center text-white">
            <SettingsIcon className="w-4 h-4 text-white" />
          </div>
          <span className="text-base sm:text-lg font-bold tracking-wide text-slate-900">Platform Settings</span>
        </div>

        <div className="w-20"></div> {/* Spacer for symmetry */}
      </header>

      {/* Main Settings Body */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        
        {/* Banner Section */}
        <div className="relative rounded-3xl overflow-hidden bg-[#DBCEA5] p-6 sm:p-8 border border-[#c5ba92] text-slate-900 shadow-md">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#D90000] flex items-center justify-center text-white font-black text-2xl shadow-md">
              <Sliders className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold font-sans tracking-wide text-slate-900">System & Account Settings</h1>
              <p className="text-xs sm:text-sm text-slate-700 font-medium">Customize preferences, security settings, and notifications</p>
            </div>
          </div>
        </div>

        {/* 2. Regional & City Settings */}
        <div className="bg-[#DBCEA5] rounded-3xl p-6 border border-[#c5ba92] space-y-4 text-slate-900 shadow-md">
          <div className="flex items-center gap-3 pb-3 border-b border-[#c5ba92]">
            <MapPin className="w-5 h-5 text-[#D90000]" />
            <h2 className="text-base font-bold text-slate-900">Default City & Regional Preferences</h2>
          </div>

          <form onSubmit={handleCitySave} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <div className="relative flex-grow">
              <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-[#D90000]" />
              <select
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white text-xs font-bold text-slate-900 border border-slate-300 cursor-pointer focus:outline-none"
              >
                <option value="Mumbai">Mumbai</option>
                <option value="Surat">Surat</option>
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
              className="px-6 py-2.5 rounded-xl bg-[#D90000] hover:bg-[#b00000] text-white font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4 text-white" />
              <span>Update City</span>
            </button>
          </form>
          {savedCityMsg && (
            <div className="text-xs font-bold text-[#66DD6A] flex items-center gap-1.5 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-[#66DD6A]" />
              <span>City preference saved successfully!</span>
            </div>
          )}
        </div>

        {/* 3. Notification Preferences */}
        <div className="bg-[#DBCEA5] rounded-3xl p-6 border border-[#c5ba92] space-y-4 text-slate-900 shadow-md">
          <div className="flex items-center gap-3 pb-3 border-b border-[#c5ba92]">
            <Bell className="w-5 h-5 text-[#D90000]" />
            <h2 className="text-base font-bold text-slate-900">Alerts & Notification Preferences</h2>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-300 shadow-xs">
              <div>
                <h4 className="text-xs font-bold text-slate-900">Booking Confirmations & Tickets</h4>
                <p className="text-[11px] text-slate-600 font-medium">Instant SMS and email notifications for movie bookings</p>
              </div>
              <input
                type="checkbox"
                checked={bookingAlerts}
                onChange={(e) => setBookingAlerts(e.target.checked)}
                className="w-5 h-5 accent-[#D90000] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-300 shadow-xs">
              <div>
                <h4 className="text-xs font-bold text-slate-900">Promotions & Exclusive Discounts</h4>
                <p className="text-[11px] text-slate-600 font-medium">Receive discount codes, bank offers, and festive deals</p>
              </div>
              <input
                type="checkbox"
                checked={promoAlerts}
                onChange={(e) => setPromoAlerts(e.target.checked)}
                className="w-5 h-5 accent-[#D90000] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-300 shadow-xs">
              <div>
                <h4 className="text-xs font-bold text-slate-900">WhatsApp Ticket Delivery</h4>
                <p className="text-[11px] text-slate-600 font-medium">Send QR tickets and movie updates straight to WhatsApp</p>
              </div>
              <input
                type="checkbox"
                checked={whatsappNotifications}
                onChange={(e) => setWhatsappNotifications(e.target.checked)}
                className="w-5 h-5 accent-[#D90000] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* 4. Password & Security Management */}
        <div className="bg-[#DBCEA5] rounded-3xl p-6 border border-[#c5ba92] space-y-4 text-slate-900 shadow-md">
          <div className="flex items-center gap-3 pb-3 border-b border-[#c5ba92]">
            <Lock className="w-5 h-5 text-[#D90000]" />
            <h2 className="text-base font-bold text-slate-900">Password & Security Management</h2>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-3 pt-2 max-w-md">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Current Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 shadow-inner"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">New Password</label>
              <input
                type="password"
                placeholder="At least 6 characters"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 shadow-inner"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Confirm New Password</label>
              <input
                type="password"
                placeholder="Repeat new password"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 shadow-inner"
              />
            </div>

            {passMsg.text && (
              <div className={`text-xs font-bold p-3 rounded-xl border ${passMsg.isError ? 'bg-red-100 border-red-300 text-red-700' : 'bg-[#66DD6A]/20 border-[#66DD6A] text-slate-900'}`}>
                {passMsg.text}
              </div>
            )}

            <button
              type="submit"
              disabled={savingPass}
              className="w-full py-3 rounded-xl bg-[#D90000] hover:bg-[#b00000] text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
            >
              {savingPass ? 'Updating Password...' : 'Change Password'}
            </button>
          </form>
        </div>

        {/* 5. Account Session & Mobile Logout Section */}
        <div className="bg-[#DBCEA5] rounded-3xl p-6 border border-[#c5ba92] space-y-4 text-slate-900 shadow-md">
          <div className="flex items-center gap-3 pb-3 border-b border-[#c5ba92]">
            <LogOut className="w-5 h-5 text-[#D90000]" />
            <h2 className="text-base font-bold text-[#D90000]">Account Session & Mobile Logout</h2>
          </div>
          
          <p className="text-xs text-slate-700 font-medium">
            Signing out will end your active session on this device and clear secure local storage tokens.
          </p>

          <button
            onClick={() => {
              logout();
              if (onReturnHome) onReturnHome();
            }}
            className="w-full py-3.5 rounded-2xl bg-[#D90000] hover:bg-[#b00000] text-white font-extrabold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <LogOut className="w-4 h-4 text-white" />
            <span>Sign Out of PrimeShow Account</span>
          </button>
        </div>

      </div>
    </div>
  );
};
