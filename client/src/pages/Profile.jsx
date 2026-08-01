import React, { useState, useEffect } from 'react';
import { 
  User, Ticket, Heart, Award, Shield, Lock, Download, Share2, QrCode, 
  CheckCircle2, Edit3, Camera, Bell, HelpCircle, Send, MessageSquare, Sun, Moon, X, Image, Laptop, Check, Upload, Calendar, MapPin, Phone, Mail, Smartphone, AtSign, Eye, EyeOff
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { jsPDF } from 'jspdf';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';

export const Profile = ({ initialTab = 'profile-info' }) => {
  const { 
    user, updateUserProfile, themePreference, setThemePreference, effectiveTheme, 
    supportMessages, sendMessageToSupport, notifications, markNotificationRead 
  } = useAuth();
  const { myBookings } = useBooking();
  const [activeTab, setActiveTab] = useState(initialTab || 'profile-info');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Edit Mode Toggle State
  const [isEditing, setIsEditing] = useState(false);

  // Editable Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [gender, setGender] = useState(user?.gender || 'Male');
  const [city, setCity] = useState(user?.city || 'Mumbai');
  const [phone, setPhone] = useState(user?.phone || '');
  const [altPhone, setAltPhone] = useState(user?.altPhone || '');
  const [whatsappPhone, setWhatsappPhone] = useState(user?.whatsappPhone || '');
  const [dob, setDob] = useState(user?.dob || '1998-05-15');
  const [currentAvatar, setCurrentAvatar] = useState(user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80");

  const [savedMsg, setSavedMsg] = useState('');
  const [validationError, setValidationError] = useState('');

  // Password Reset State
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  // Sync state whenever user object changes (including registration data), but only when NOT editing
  useEffect(() => {
    if (user && !isEditing) {
      setName(user.name || '');
      setUsername(user.username || user.email?.split('@')[0] || '');
      setEmail(user.email || '');
      setGender(user.gender || 'Male');
      setCity(user.city || 'Mumbai');
      setPhone(user.phone || '');
      setAltPhone(user.altPhone || '');
      setWhatsappPhone(user.whatsappPhone || user.phone || '');
      setDob(user.dob || '1998-05-15');
      if (user.avatar) setCurrentAvatar(user.avatar);
    }
  }, [user, isEditing]);

  // Profile Picture Upload Modal State
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');

  const avatarPresets = [
    { name: 'Glamour VIP', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80' },
    { name: 'Director Suite', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80' },
    { name: 'Cinema Fan', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80' },
    { name: 'Star Club', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80' }
  ];

  // WhatsApp-Style Support Chat State
  const [supportSubject, setSupportSubject] = useState('General Support');
  const [supportText, setSupportText] = useState('');

  if (!user) {
    return (
      <div className="min-h-screen bg-[#050508] text-white flex items-center justify-center p-4">
        <div className="glass-panel p-8 rounded-3xl text-center max-w-md">
          <h2 className="text-2xl font-bold font-sans mb-2">Please Sign In</h2>
          <p className="text-xs text-white/60 mb-4">You must be logged in to view your profile and bookings suite.</p>
        </div>
      </div>
    );
  }

  // Handle Save Profile Form
  const handleSaveProfile = (e) => {
    e.preventDefault();
    setValidationError('');

    // Validations
    if (!name.trim()) {
      setValidationError('Full Name cannot be empty.');
      return;
    }
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      setValidationError('Please enter a valid email address.');
      return;
    }
    if (!phone.trim()) {
      setValidationError('Mobile Number is required.');
      return;
    }

    const updatedData = {
      name: name.trim(),
      username: (username || email.split('@')[0]).trim(),
      email: email.trim(),
      gender,
      city: city.trim(),
      phone: phone.trim(),
      altPhone: altPhone.trim(),
      whatsappPhone: whatsappPhone.trim(),
      dob,
      avatar: currentAvatar
    };

    updateUserProfile(updatedData);
    setIsEditing(false);
    setShowPasswordFields(false);
    setSavedMsg('Profile information updated & saved successfully!');
    setTimeout(() => setSavedMsg(''), 4000);
  };

  const handleSaveAvatar = (url) => {
    setCurrentAvatar(url);
    updateUserProfile({ avatar: url });
    setIsAvatarModalOpen(false);
    setSavedMsg('Profile picture updated successfully!');
    setTimeout(() => setSavedMsg(''), 4000);
  };

  // Direct Gallery File Upload Handler
  const handleFileUploadFromGallery = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      handleSaveAvatar(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSendSupportMessage = async (e) => {
    e.preventDefault();
    if (!supportText.trim()) return;
    await sendMessageToSupport(supportSubject, supportText);
    setSupportText('');
    setSavedMsg('WhatsApp inquiry sent to Admin Support desk!');
    setTimeout(() => setSavedMsg(''), 4000);
  };

  const handlePasswordReset = (e) => {
    e.preventDefault();
    if (!currentPass || !newPass) {
      setValidationError('Please enter current and new passwords.');
      return;
    }
    setCurrentPass('');
    setNewPass('');
    setShowPasswordFields(false);
    setSavedMsg('Account Security Password updated successfully!');
    setTimeout(() => setSavedMsg(''), 4000);
  };

  const handleDownloadPDF = (b) => {
    const doc = new jsPDF();
    doc.setFillColor(5, 5, 8);
    doc.rect(0, 0, 210, 297, 'F');
    doc.setTextColor(245, 158, 11);
    doc.setFontSize(22);
    doc.text('PrimeShow Cinema Ticket', 20, 30);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text(`Booking ID: ${b.id}`, 20, 50);
    doc.text(`Movie: ${b.movieTitle}`, 20, 65);
    doc.text(`Multiplex: ${b.theatreName}`, 20, 80);
    doc.text(`Showtime: ${b.showDate} @ ${b.showTime}`, 20, 95);
    doc.text(`Seats: ${b.seats?.join(', ')}`, 20, 110);
    doc.save(`PrimeShow_Ticket_${b.id}.pdf`);
  };

  const userChatList = supportMessages.filter(m => m.userId === user.id);
  const unreadNotifCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-[#050508] text-white pt-8 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {savedMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-center flex items-center justify-center gap-2 shadow-lg animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>{savedMsg}</span>
          </div>
        )}

        {/* Profile Header Banner Card */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 mb-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group">
              <img
                src={currentAvatar}
                alt={user.name}
                className="w-24 h-24 rounded-full object-cover border-2 border-amber-400/60 shadow-2xl"
              />
              <button 
                onClick={() => setIsAvatarModalOpen(true)}
                className="absolute bottom-0 right-0 p-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-black shadow-lg hover:scale-110 transition-transform cursor-pointer"
                title="Change Profile Photo"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl font-bold font-sans text-white">{user.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[10px] font-bold uppercase">
                  {user.role} Member
                </span>
              </div>
              <p className="text-xs text-white/60 mt-1">@{user.username || email.split('@')[0]} • {user.email} • {user.phone}</p>
              
              <div className="mt-3 flex items-center justify-center sm:justify-start gap-4 text-xs font-semibold">
                <span className="text-amber-300">★ {user.rewardsPoints || 1250} Reward Points</span>
                <span className="text-white/40">•</span>
                <span className="text-white/80">{myBookings.length} Bookings</span>
                <span className="text-white/40">•</span>
                <span className="text-amber-400">{city}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => { setIsEditing(!isEditing); setActiveTab('profile-info'); }}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 shadow-lg cursor-pointer ${
                isEditing
                  ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                  : 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20'
              }`}
            >
              <Edit3 className="w-4 h-4" />
              <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
            </button>

            <button
              onClick={() => setIsAvatarModalOpen(true)}
              className="px-4 py-2.5 rounded-xl glass-panel hover:bg-white/10 text-white/80 text-xs font-bold transition-all flex items-center gap-1.5 border border-white/10 cursor-pointer"
            >
              <Upload className="w-4 h-4 text-amber-400" />
              <span>Upload Photo</span>
            </button>
          </div>
        </div>

        {/* Profile Tab Navigation Bar */}
        <div className="flex overflow-x-auto gap-2 p-1.5 glass-panel rounded-2xl border border-white/10 mb-8 text-xs font-semibold">
          {[
            { id: 'profile-info', label: 'Personal Details', icon: User },
            { id: 'notifications', label: `Notifications (${unreadNotifCount})`, icon: Bell, badge: unreadNotifCount },
            { id: 'bookings', label: 'My Bookings', icon: Ticket },
            { id: 'wishlist', label: 'Wishlist', icon: Heart },
            { id: 'rewards', label: 'Rewards & Wallet', icon: Award },
            { id: 'support', label: 'WhatsApp Support', icon: HelpCircle },
            { id: 'settings', label: 'Theme & Settings', icon: Lock }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap cursor-pointer relative ${
                  isActive
                    ? 'bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-amber-400'}`} />
                <span>{tab.label}</span>
                {tab.badge > 0 && (
                  <span className="ml-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Personal Details (Auto-Populated & Fully Editable) */}
        {activeTab === 'profile-info' && (
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-xl font-bold font-sans text-white">Personal Profile & Registration Details</h2>
                <p className="text-xs text-white/60">Manage your profile details. Registration data is automatically pre-populated.</p>
              </div>

              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500 hover:text-black border border-amber-400/40 text-amber-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
                <span>{isEditing ? 'Exit Editing' : 'Edit Profile'}</span>
              </button>
            </div>

            {/* Quick Theme Mode Switcher in Personal Details */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-400">
                  {effectiveTheme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Appearance & Theme Preference</h4>
                  <p className="text-xs text-slate-400">Current Theme: <span className="font-bold uppercase text-amber-400">{effectiveTheme} MODE</span> (Saved in browser)</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-800 border border-slate-700">
                <button
                  type="button"
                  onClick={() => setThemePreference('dark')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    themePreference === 'dark'
                      ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span>Dark</span>
                </button>

                <button
                  type="button"
                  onClick={() => setThemePreference('light')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    themePreference === 'light'
                      ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                  <span>Light</span>
                </button>

                <button
                  type="button"
                  onClick={() => setThemePreference('system')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    themePreference === 'system'
                      ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Laptop className="w-3.5 h-3.5" />
                  <span>System</span>
                </button>
              </div>
            </div>

            {validationError && (
              <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-semibold">
                {validationError}
              </div>
            )}

            {isEditing ? (
              /* EDIT MODE FORM FOR ALL 11 FIELDS */
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-white mb-1.5 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-amber-400" /> Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-3 rounded-xl glass-input text-xs text-white"
                      placeholder="Enter Full Name"
                    />
                  </div>

                  {/* Username */}
                  <div>
                    <label className="block text-xs font-bold text-white mb-1.5 flex items-center gap-1.5">
                      <AtSign className="w-3.5 h-3.5 text-amber-400" /> Username
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full p-3 rounded-xl glass-input text-xs text-white"
                      placeholder="e.g. aarav_sharma"
                    />
                  </div>

                  {/* Email Address */}
                  <div>
                    <label className="block text-xs font-bold text-white mb-1.5 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-amber-400" /> Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-3 rounded-xl glass-input text-xs text-white"
                      placeholder="name@example.com"
                    />
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-xs font-bold text-white mb-1.5">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full p-3 rounded-xl glass-input text-xs text-white bg-[#0c0d14]"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-xs font-bold text-white mb-1.5 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" /> City
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full p-3 rounded-xl glass-input text-xs text-white"
                      placeholder="e.g. Mumbai, Delhi NCR"
                    />
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label className="block text-xs font-bold text-white mb-1.5 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-amber-400" /> Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full p-3 rounded-xl glass-input text-xs text-white"
                      placeholder="+91 9876543210"
                    />
                  </div>

                  {/* Alternate Mobile Number */}
                  <div>
                    <label className="block text-xs font-bold text-white mb-1.5 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-amber-400" /> Alternate Mobile Number
                    </label>
                    <input
                      type="tel"
                      value={altPhone}
                      onChange={(e) => setAltPhone(e.target.value)}
                      className="w-full p-3 rounded-xl glass-input text-xs text-white"
                      placeholder="+91 9123456789 (Optional)"
                    />
                  </div>

                  {/* WhatsApp Mobile Number */}
                  <div>
                    <label className="block text-xs font-bold text-white mb-1.5 flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-emerald-400" /> WhatsApp Mobile Number
                    </label>
                    <input
                      type="tel"
                      value={whatsappPhone}
                      onChange={(e) => setWhatsappPhone(e.target.value)}
                      className="w-full p-3 rounded-xl glass-input text-xs text-white"
                      placeholder="+91 9876543210 (For e-tickets)"
                    />
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label className="block text-xs font-bold text-white mb-1.5 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" /> Date of Birth
                    </label>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full p-3 rounded-xl glass-input text-xs text-white"
                    />
                  </div>
                </div>

                {/* Secure Password Change Drawer in Edit Mode */}
                <div className="pt-4 border-t border-white/10 space-y-4">
                  <button
                    type="button"
                    onClick={() => setShowPasswordFields(!showPasswordFields)}
                    className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1.5 cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>{showPasswordFields ? 'Hide Password Change' : 'Change Password'}</span>
                  </button>

                  {showPasswordFields && (
                    <div className="p-4 rounded-2xl glass-panel border border-amber-400/30 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-white mb-1">Current Password</label>
                        <input
                          type="password"
                          value={currentPass}
                          onChange={(e) => setCurrentPass(e.target.value)}
                          className="w-full p-2.5 rounded-xl glass-input text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-white mb-1">New Password</label>
                        <input
                          type="password"
                          value={newPass}
                          onChange={(e) => setNewPass(e.target.value)}
                          className="w-full p-2.5 rounded-xl glass-input text-xs text-white"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-2.5 rounded-xl glass-panel text-white/70 hover:text-white text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-lg shadow-amber-500/20 cursor-pointer"
                  >
                    Save Profile Changes
                  </button>
                </div>
              </form>
            ) : (
              /* VIEW MODE DISPLAY GRID */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl glass-panel border border-white/5 space-y-1">
                  <span className="text-[10px] text-white/50 font-semibold block uppercase">Full Name</span>
                  <span className="text-sm font-bold text-white">{name || 'N/A'}</span>
                </div>

                <div className="p-4 rounded-2xl glass-panel border border-white/5 space-y-1">
                  <span className="text-[10px] text-white/50 font-semibold block uppercase">Username</span>
                  <span className="text-sm font-bold text-amber-300">@{username || email.split('@')[0]}</span>
                </div>

                <div className="p-4 rounded-2xl glass-panel border border-white/5 space-y-1">
                  <span className="text-[10px] text-white/50 font-semibold block uppercase">Email Address</span>
                  <span className="text-sm font-bold text-white truncate block">{email || 'N/A'}</span>
                </div>

                <div className="p-4 rounded-2xl glass-panel border border-white/5 space-y-1">
                  <span className="text-[10px] text-white/50 font-semibold block uppercase">Gender</span>
                  <span className="text-sm font-bold text-white">{gender}</span>
                </div>

                <div className="p-4 rounded-2xl glass-panel border border-white/5 space-y-1">
                  <span className="text-[10px] text-white/50 font-semibold block uppercase">City</span>
                  <span className="text-sm font-bold text-amber-300">{city}</span>
                </div>

                <div className="p-4 rounded-2xl glass-panel border border-white/5 space-y-1">
                  <span className="text-[10px] text-white/50 font-semibold block uppercase">Mobile Number</span>
                  <span className="text-sm font-bold text-white">{phone || 'N/A'}</span>
                </div>

                <div className="p-4 rounded-2xl glass-panel border border-white/5 space-y-1">
                  <span className="text-[10px] text-white/50 font-semibold block uppercase">Alternate Mobile</span>
                  <span className="text-sm font-bold text-white">{altPhone || 'Not set'}</span>
                </div>

                <div className="p-4 rounded-2xl glass-panel border border-white/5 space-y-1">
                  <span className="text-[10px] text-white/50 font-semibold block uppercase">WhatsApp Number</span>
                  <span className="text-sm font-bold text-emerald-400">{whatsappPhone || phone || 'Not set'}</span>
                </div>

                <div className="p-4 rounded-2xl glass-panel border border-white/5 space-y-1">
                  <span className="text-[10px] text-white/50 font-semibold block uppercase">Date of Birth</span>
                  <span className="text-sm font-bold text-white">{dob}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Admin Notification Stream System */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-xl font-bold font-sans text-white">System Notifications</h2>
                <p className="text-xs text-white/60">Live updates and promotional announcements broadcasted by Admin Command.</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 text-xs font-bold">
                {unreadNotifCount} Unread
              </span>
            </div>

            {notifications.length > 0 ? (
              <div className="space-y-4">
                {notifications.map(n => (
                  <div 
                    key={n.id} 
                    className={`glass-panel p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                      !n.read 
                        ? 'border-amber-400/50 bg-amber-500/10 shadow-lg shadow-amber-500/10' 
                        : 'border-white/10 opacity-80'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {!n.read && <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>}
                        <h4 className="text-sm font-bold text-white">{n.title}</h4>
                        <span className="px-2 py-0.5 rounded bg-white/10 text-[9px] font-bold uppercase text-amber-300">
                          {n.type || 'NOTICE'}
                        </span>
                      </div>
                      <p className="text-xs text-white/80 leading-relaxed">{n.message}</p>
                      <div className="text-[10px] text-white/40 pt-1">
                        {new Date(n.createdAt).toLocaleString()}
                      </div>
                    </div>

                    {!n.read && (
                      <button
                        onClick={() => markNotificationRead(n.id)}
                        className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500 hover:text-black border border-amber-400/40 text-amber-300 text-xs font-bold transition-all shrink-0 cursor-pointer"
                      >
                        Mark Read
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-panel p-12 rounded-3xl text-center text-white/50">
                No notifications broadcasted yet. Check back soon!
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Bookings History */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold font-sans text-white">Interactive Booking History</h2>

            {myBookings.length > 0 ? (
              myBookings.map(b => (
                <div key={b.id} className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
                  <div className="flex items-center gap-4">
                    <img
                      src={b.poster || "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80"}
                      alt={b.movieTitle}
                      className="w-16 h-24 object-cover rounded-xl border border-amber-400/40"
                    />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                          {b.status}
                        </span>
                        <span className="text-xs font-bold text-amber-400">Order ID: {b.id}</span>
                      </div>
                      <h3 className="text-lg font-bold font-sans text-white">{b.movieTitle}</h3>
                      <p className="text-xs text-white/70">{b.theatreName}</p>
                      <div className="text-xs text-amber-300 font-semibold mt-1">
                        Seats: {b.seats?.join(', ')} ({b.tier || 'Recliner'})
                      </div>
                      <div className="text-[11px] text-white/50">{b.showDate} @ {b.showTime}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-white/10">
                    <div className="bg-white p-2 rounded-xl shadow-md hidden sm:block">
                      <QRCodeSVG value={b.qrCodeData || b.id} size={65} />
                    </div>

                    <button
                      onClick={() => handleDownloadPDF(b)}
                      className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="glass-panel p-12 rounded-3xl text-center text-white/50">
                No past bookings found. Book your first luxury screening today!
              </div>
            )}
          </div>
        )}

        {/* Tab 4: WhatsApp Live Support Chat */}
        {activeTab === 'support' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <form onSubmit={handleSendSupportMessage} className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
              <h3 className="text-lg font-bold font-sans text-white">WhatsApp VIP Support Desk</h3>
              
              <div>
                <label className="block text-xs font-bold text-white mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={supportSubject}
                  onChange={(e) => setSupportSubject(e.target.value)}
                  className="w-full p-3 rounded-xl glass-input text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white mb-1">Message</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Type message to admin..."
                  value={supportText}
                  onChange={(e) => setSupportText(e.target.value)}
                  className="w-full p-3 rounded-xl glass-input text-xs text-white"
                ></textarea>
              </div>

              <button type="submit" className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer">
                <Send className="w-4 h-4" />
                <span>Send Real-Time Message</span>
              </button>
            </form>

            <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4 max-h-[500px] overflow-y-auto">
              <h3 className="text-lg font-bold font-sans text-white border-b border-white/10 pb-3">WhatsApp Message Stream</h3>

              {userChatList.map(msg => (
                <div key={msg.id} className="space-y-2">
                  <div className="flex justify-end">
                    <div className="max-w-[80%] p-3.5 rounded-2xl rounded-tr-none bg-emerald-600/30 border border-emerald-400/40 text-xs text-white shadow-md">
                      <div className="text-[10px] font-bold text-emerald-300 mb-1">{msg.subject}</div>
                      <p className="text-white/90">"{msg.message}"</p>
                      <div className="text-[9px] text-emerald-200/70 text-right mt-1 flex items-center justify-end gap-1">
                        <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="text-emerald-300 font-bold">✓✓</span>
                      </div>
                    </div>
                  </div>

                  {msg.reply && (
                    <div className="flex justify-start">
                      <div className="max-w-[80%] p-3.5 rounded-2xl rounded-tl-none bg-white/10 border border-white/15 text-xs text-white shadow-md">
                        <div className="text-[10px] font-bold text-amber-400 mb-1">Admin Command Support</div>
                        <p className="text-amber-100">{msg.reply}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Account & Theme Settings */}
        {activeTab === 'settings' && (
          <div className="space-y-8">
            
            {/* Dedicated Theme Selection Section */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4 max-w-3xl">
              <h3 className="text-xl font-bold font-sans text-white">Application Theme Preference</h3>
              <p className="text-xs text-white/60">
                Choose your visual atmosphere. Theme is saved in your browser and persists across logins and page refreshes.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                {[
                  { id: 'dark', label: 'Dark Theme', desc: '#050508 Luxury Pitch Dark', icon: Moon },
                  { id: 'light', label: 'Light Theme', desc: '#f8fafc Clean Slate Theme', icon: Sun },
                  { id: 'system', label: 'System Default', desc: 'Auto-sync with OS theme', icon: Laptop }
                ].map(item => {
                  const Icon = item.icon;
                  const isSelected = themePreference === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setThemePreference(item.id)}
                      className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-xl shadow-amber-500/20'
                          : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <Icon className={`w-5 h-5 ${isSelected ? 'text-amber-400' : 'text-white/60'}`} />
                        {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">{item.label}</div>
                        <div className="text-[10px] text-white/50 mt-0.5">{item.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="text-xs text-amber-300 pt-2 font-semibold">
                Active Rendered Atmosphere: <strong className="uppercase">{effectiveTheme} MODE</strong>
              </div>
            </div>

            {/* Password Reset Form */}
            <form onSubmit={handlePasswordReset} className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4 max-w-xl">
              <h3 className="text-lg font-bold font-sans text-white">Update Password</h3>
              <div>
                <label className="block text-xs font-bold text-white mb-1">Current Password</label>
                <input type="password" required value={currentPass} onChange={(e) => setCurrentPass(e.target.value)} className="w-full p-3 rounded-xl glass-input text-xs text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-white mb-1">New Password</label>
                <input type="password" required value={newPass} onChange={(e) => setNewPass(e.target.value)} className="w-full p-3 rounded-xl glass-input text-xs text-white" />
              </div>
              <button type="submit" className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs cursor-pointer">
                Update Password
              </button>
            </form>

          </div>
        )}

      </div>

      {/* Profile Picture Device Gallery Upload Modal */}
      {isAvatarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
          <div className="relative w-full max-w-md glass-modal rounded-3xl p-6 border border-amber-400/40 shadow-2xl text-white">
            <button
              onClick={() => setIsAvatarModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/15 text-white/70 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold font-sans text-white mb-1">Update Profile Picture</h3>
            <p className="text-xs text-amber-300 mb-6">Upload an image directly from your device gallery or choose a preset</p>

            {/* Direct Device Gallery File Input Button */}
            <div className="mb-6">
              <label className="w-full p-4 rounded-2xl glass-panel border-2 border-dashed border-amber-400/50 hover:border-amber-400 flex flex-col items-center justify-center gap-2 cursor-pointer group transition-all">
                <Upload className="w-8 h-8 text-amber-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-amber-300">Click to Select Photo from Gallery</span>
                <span className="text-[10px] text-white/50">Supports JPG, PNG, WEBP, GIF</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUploadFromGallery}
                  className="hidden"
                />
              </label>
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {avatarPresets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => handleSaveAvatar(preset.url)}
                  className="p-3 rounded-2xl glass-panel border border-white/10 hover:border-amber-400 flex flex-col items-center gap-2 group transition-all cursor-pointer"
                >
                  <img src={preset.url} alt={preset.name} className="w-14 h-14 rounded-full object-cover border border-amber-400/60 group-hover:scale-105 transition-transform" />
                  <span className="text-xs font-bold text-white group-hover:text-amber-300">{preset.name}</span>
                </button>
              ))}
            </div>

            {/* Custom URL Input */}
            <div className="pt-4 border-t border-white/10">
              <label className="block text-xs font-bold text-white mb-2">Or Paste Custom Image URL</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={customAvatarUrl}
                  onChange={(e) => setCustomAvatarUrl(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl glass-input text-xs text-white"
                />
                <button
                  onClick={() => {
                    if (customAvatarUrl) handleSaveAvatar(customAvatarUrl);
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs cursor-pointer"
                >
                  Apply
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
