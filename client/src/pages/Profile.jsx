import React, { useState, useEffect } from 'react';
import { 
  User, Ticket, Heart, Award, Shield, Lock, Download, Share2, QrCode, 
  CheckCircle2, Edit3, Camera, Bell, HelpCircle, Send, MessageSquare, Sun, Moon, X, Image, Laptop, Check, Upload, Calendar, MapPin, Phone, Mail, Smartphone, AtSign, Eye, EyeOff, ArrowLeft
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { jsPDF } from 'jspdf';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';

export const Profile = ({ initialTab = 'profile-info', onReturnHome }) => {
  const { 
    user, updateUserProfile, themePreference, setThemePreference, effectiveTheme, 
    supportMessages, sendMessageToSupport, notifications, markNotificationRead, markAllNotificationsRead,
    wishlist, toggleWishlist 
  } = useAuth();
  const { myBookings, moviesList, selectShowForBooking } = useBooking();
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
  const [currentAvatar, setCurrentAvatar] = useState(user?.profilePicture || user?.avatar || "https://api.dicebear.com/7.x/lorelei/svg?seed=Alexander&backgroundColor=0f172a");

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
      if (user.profilePicture || user.avatar) setCurrentAvatar(user.profilePicture || user.avatar);
    }
  }, [user, isEditing]);

  // Profile Picture Upload Modal & Default Avatar Selector State
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');

  const defaultAvatars = [
    { 
      id: 'men', 
      label: 'Men', 
      desc: '3D Anime Male Character',
      url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Alexander&backgroundColor=0f172a' 
    },
    { 
      id: 'female', 
      label: 'Female', 
      desc: '3D Anime Female Character',
      url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Isabella&backgroundColor=831843' 
    },
    { 
      id: 'kids', 
      label: 'Kids', 
      desc: 'Cute Kid Anime Character',
      url: 'https://api.dicebear.com/7.x/open-peeps/svg?seed=Leo&backgroundColor=78350f' 
    },
    { 
      id: 'others', 
      label: 'Others', 
      desc: 'Sleek Neutral 3D Avatar',
      url: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=CyberUser&backgroundColor=312e81' 
    }
  ];

  const handleSaveAvatar = (url) => {
    setCurrentAvatar(url);
    updateUserProfile({ avatar: url, profilePicture: url });
    setIsAvatarModalOpen(false);
    setSavedMsg('Profile picture updated & saved successfully!');
    setTimeout(() => setSavedMsg(''), 4000);
  };

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
    <div className="min-h-screen bg-slate-100 dark:bg-[#050508] text-slate-900 dark:text-white pb-20 font-sans transition-colors duration-300">
      
      {/* Dedicated Minimal Header Bar for Profile Page */}
      <header className="sticky top-0 z-50 glass-panel border-b border-slate-300 dark:border-white/10 px-4 sm:px-8 py-4 flex items-center justify-between shadow-lg mb-6">
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
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
            <User className="w-4 h-4" />
          </div>
          <span className="text-base sm:text-lg font-bold tracking-wide">My Account Suite</span>
        </div>

        <div className="w-20"></div> {/* Spacer for symmetry */}
      </header>

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
              /* EDIT MODE FORM FOR ALL 11 FIELDS + AVATAR SELECTOR */
              <form onSubmit={handleSaveProfile} className="space-y-6">
                
                {/* DEFAULT AVATAR SELECTOR (Men, Female, Kids, Others) */}
                <div className="p-5 rounded-2xl glass-panel border border-amber-400/30 space-y-3 bg-amber-500/5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-amber-400" /> Default Profile Avatar Options
                    </label>
                    <span className="text-[10px] text-white/50">Click any avatar to select instantly</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {defaultAvatars.map((av) => {
                      const isSelected = currentAvatar === av.url;
                      return (
                        <button
                          key={av.id}
                          type="button"
                          onClick={() => handleSaveAvatar(av.url)}
                          className={`p-3.5 rounded-2xl glass-panel border transition-all flex flex-col items-center gap-2 cursor-pointer group relative ${
                            isSelected
                              ? 'border-amber-400 bg-amber-500/20 ring-2 ring-amber-400/50 shadow-lg shadow-amber-500/20'
                              : 'border-white/10 hover:border-amber-400/50 hover:bg-white/5'
                          }`}
                        >
                          <div className="relative">
                            <img 
                              src={av.url} 
                              alt={av.label} 
                              className="w-14 h-14 rounded-full object-cover border border-amber-400/60 group-hover:scale-105 transition-transform" 
                            />
                            {isSelected && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-black flex items-center justify-center shadow-md">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </div>
                            )}
                          </div>
                          <span className={`text-xs font-extrabold ${isSelected ? 'text-amber-300' : 'text-white/80 group-hover:text-white'}`}>
                            {av.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
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

        {/* Tab 2: Dynamic Admin Notification Stream System */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h2 className="text-xl font-bold font-sans text-white">System & Broadcast Notifications</h2>
                <p className="text-xs text-white/60">Real-time alerts, offers, and official announcements broadcasted from Admin Command.</p>
              </div>

              <div className="flex items-center gap-3">
                {unreadNotifCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500 hover:text-black border border-amber-400/40 text-amber-300 text-xs font-bold transition-all cursor-pointer"
                  >
                    Mark All as Read
                  </button>
                )}
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 text-xs font-bold">
                  {unreadNotifCount} Unread
                </span>
              </div>
            </div>

            {(notifications || []).length > 0 ? (
              <div className="space-y-4">
                {(notifications || []).map(n => {
                  const typeLabel = n.type || n.priority || 'Info';
                  let priorityBadge = 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40';
                  if (typeLabel.toLowerCase().includes('alert')) {
                    priorityBadge = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
                  } else if (typeLabel.toLowerCase().includes('offer') || typeLabel.toLowerCase().includes('promo')) {
                    priorityBadge = 'bg-amber-500/20 text-amber-300 border-amber-400/40';
                  }

                  return (
                    <div 
                      key={n.id} 
                      className={`glass-panel p-5 rounded-3xl border transition-all flex flex-col sm:flex-row items-start justify-between gap-4 ${
                        !n.read 
                          ? 'border-amber-400/60 bg-amber-500/10 shadow-lg shadow-amber-500/10' 
                          : 'border-white/10 opacity-80'
                      }`}
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          {!n.read && <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>}
                          <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${priorityBadge}`}>
                            {typeLabel}
                          </span>
                          <h4 className="text-base font-bold text-white leading-tight">{n.title}</h4>
                        </div>

                        <p className="text-xs text-white/80 leading-relaxed">{n.message}</p>

                        <div className="flex items-center gap-3 text-[10px] text-white/40 pt-1">
                          <span>📅 {new Date(n.createdAt || Date.now()).toLocaleString()}</span>
                          <span>•</span>
                          <span className={n.read ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
                            {n.read ? '✓ Read' : '● Unread'}
                          </span>
                        </div>
                      </div>

                      {!n.read && (
                        <button
                          onClick={() => markNotificationRead(n.id)}
                          className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500 hover:text-black border border-amber-400/40 text-amber-300 text-xs font-bold transition-all shrink-0 cursor-pointer"
                        >
                          Mark Read
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="glass-panel p-12 rounded-3xl text-center text-white/50 space-y-2">
                <Bell className="w-10 h-10 text-amber-400/40 mx-auto" />
                <h4 className="text-base font-bold text-white">No System Notifications</h4>
                <p className="text-xs text-white/60">You have no active notifications at this time.</p>
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

        {/* Tab: Movie Wishlist & Saved Favorites */}
        {activeTab === 'wishlist' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-xl font-bold font-sans text-white">Saved Movie Wishlist</h2>
                <p className="text-xs text-white/60">Movies you have liked and saved for quick ticket booking.</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                <span>{(wishlist || []).length} Saved</span>
              </span>
            </div>

            {moviesList.filter(m => (wishlist || []).includes(m.id)).length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {moviesList.filter(m => (wishlist || []).includes(m.id)).map(movie => (
                  <div key={movie.id} className="glass-panel rounded-3xl border border-white/10 overflow-hidden flex flex-col justify-between group hover:border-amber-400/50 transition-all shadow-xl">
                    <div className="relative aspect-[2/3] overflow-hidden">
                      <img 
                        src={movie.poster} 
                        alt={movie.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <button
                        onClick={() => toggleWishlist(movie.id)}
                        className="absolute top-3 right-3 p-2 rounded-full bg-black/60 backdrop-blur-md text-rose-500 hover:scale-110 transition-transform cursor-pointer"
                        title="Remove from Wishlist"
                      >
                        <Heart className="w-4 h-4 fill-rose-500" />
                      </button>
                      <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-amber-300 text-xs font-bold">
                        ★ {movie.rating || 9.0}
                      </div>
                    </div>

                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-base text-white line-clamp-1">{movie.title}</h4>
                        <p className="text-xs text-white/60 mt-0.5">{movie.duration} • {movie.genres?.join(', ')}</p>
                      </div>

                      <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                        <button
                          onClick={() => {
                            if (movie.theatres?.[0]?.shows?.[0]) {
                              selectShowForBooking(movie, movie.theatres[0], movie.theatres[0].shows[0]);
                            }
                          }}
                          className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-md shadow-amber-500/20 cursor-pointer"
                        >
                          Book Tickets
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-panel p-12 rounded-3xl text-center text-white/50 space-y-2">
                <Heart className="w-10 h-10 text-rose-500/50 mx-auto" />
                <h4 className="text-base font-bold text-white">Your Wishlist is Empty</h4>
                <p className="text-xs text-white/60">Click the Heart icon on any movie card to save it here for fast booking!</p>
              </div>
            )}
          </div>
        )}

        {/* Tab: Rewards & Wallet */}
        {activeTab === 'rewards' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-xl font-bold font-sans text-white">Rewards & VIP Wallet</h2>
                <p className="text-xs text-white/60">Track your loyalty points, cashback balance, and exclusive vouchers.</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 text-xs font-bold">
                ★ {user.rewardsPoints || 1250} PTS Balance
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-panel p-6 rounded-3xl border border-amber-400/40 bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-950 shadow-xl space-y-3">
                <div className="text-amber-400 text-xs font-bold uppercase tracking-wider">Reward Points Balance</div>
                <div className="text-3xl font-extrabold text-white">★ {user.rewardsPoints || 1250}</div>
                <p className="text-[11px] text-white/60">Earn 50 points on every movie ticket booking transaction!</p>
              </div>

              <div className="glass-panel p-6 rounded-3xl border border-emerald-400/40 bg-gradient-to-br from-emerald-500/10 via-slate-900 to-slate-950 shadow-xl space-y-3">
                <div className="text-emerald-400 text-xs font-bold uppercase tracking-wider">PrimeShow Wallet Balance</div>
                <div className="text-3xl font-extrabold text-white">₹ 450.00</div>
                <p className="text-[11px] text-white/60">Instant cashback refund available for ticket bookings.</p>
              </div>

              <div className="glass-panel p-6 rounded-3xl border border-purple-400/40 bg-gradient-to-br from-purple-500/10 via-slate-900 to-slate-950 shadow-xl space-y-3">
                <div className="text-purple-400 text-xs font-bold uppercase tracking-wider">Loyalty Club Tier</div>
                <div className="text-2xl font-extrabold text-white">GOLD VIP MEMBER</div>
                <p className="text-[11px] text-white/60">Free gourmet food upgrade & zero cancellation fee unlocked.</p>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <h3 className="text-lg font-bold text-white">Active Promo Vouchers</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-panel p-4 rounded-2xl border border-amber-400/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold text-xs">PRIMESHOW50</span>
                    <span className="text-[10px] text-emerald-400 font-bold">50% OFF</span>
                  </div>
                  <p className="text-xs text-white/80">Flat 50% Discount on IMAX 3D recliners up to ₹250.</p>
                </div>

                <div className="glass-panel p-4 rounded-2xl border border-amber-400/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold text-xs">LUXURY200</span>
                    <span className="text-[10px] text-emerald-400 font-bold">₹200 CASHBACK</span>
                  </div>
                  <p className="text-xs text-white/80">Flat ₹200 Cashback for HDFC & ICICI Credit Cards.</p>
                </div>

                <div className="glass-panel p-4 rounded-2xl border border-amber-400/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold text-xs">ADMINVIP</span>
                    <span className="text-[10px] text-emerald-400 font-bold">₹500 PASS</span>
                  </div>
                  <p className="text-xs text-white/80">VIP Admin ₹500 Pass for private lounge bookings.</p>
                </div>
              </div>
            </div>
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

      {/* Profile Picture Device Gallery Upload & Default Avatar Selector Modal */}
      {isAvatarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in">
          <div className="relative w-full max-w-lg glass-modal rounded-3xl p-6 sm:p-8 border border-amber-400/40 shadow-2xl text-white space-y-6">
            <button
              onClick={() => setIsAvatarModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/15 text-white/70 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-xl font-bold font-sans text-white mb-1">Update Profile Picture</h3>
              <p className="text-xs text-amber-300">Choose a default avatar character or upload from your device gallery</p>
            </div>

            {/* 1. DEFAULT AVATAR OPTIONS (Men, Female, Kids, Others) */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-white uppercase tracking-wider">
                Default Avatar Options
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {defaultAvatars.map((av) => {
                  const isSelected = currentAvatar === av.url;
                  return (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => handleSaveAvatar(av.url)}
                      className={`p-3.5 rounded-2xl glass-panel border transition-all flex flex-col items-center gap-2 cursor-pointer group relative ${
                        isSelected
                          ? 'border-amber-400 bg-amber-500/20 ring-2 ring-amber-400/50 shadow-lg shadow-amber-500/20'
                          : 'border-white/10 hover:border-amber-400/50 hover:bg-white/5'
                      }`}
                    >
                      <div className="relative">
                        <img 
                          src={av.url} 
                          alt={av.label} 
                          className="w-14 h-14 rounded-full object-cover border border-amber-400/60 group-hover:scale-105 transition-transform" 
                        />
                        {isSelected && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-black flex items-center justify-center shadow-md">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <span className={`text-xs font-extrabold ${isSelected ? 'text-amber-300' : 'text-white/80 group-hover:text-white'}`}>
                        {av.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Direct Device Gallery File Input Button */}
            <div>
              <label className="w-full p-4 rounded-2xl glass-panel border-2 border-dashed border-amber-400/50 hover:border-amber-400 flex flex-col items-center justify-center gap-2 cursor-pointer group transition-all">
                <Upload className="w-7 h-7 text-amber-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-amber-300">Click to Select Photo from Device Gallery</span>
                <span className="text-[10px] text-white/50">Supports JPG, PNG, WEBP, GIF</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUploadFromGallery}
                  className="hidden"
                />
              </label>
            </div>

            {/* 3. Custom URL Input */}
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
                  type="button"
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
