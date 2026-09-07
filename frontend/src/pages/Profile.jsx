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

  // Support Message Form State
  const [supportSubject, setSupportSubject] = useState('');
  const [supportText, setSupportText] = useState('');

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
      const savedPic = user.profilePicture || user.avatar;
      if (savedPic) setCurrentAvatar(savedPic);
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
    setSavedMsg('Profile picture updated!');
    setTimeout(() => setSavedMsg(''), 4000);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setValidationError('');

    if (!name.trim()) {
      setValidationError('Full Name is required.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setValidationError('Please enter a valid email address.');
      return;
    }
    if (!phone.trim()) {
      setValidationError('Mobile Number is required.');
      return;
    }

    const updatedData = {
      name: name.trim(),
      username: username.trim() || email.split('@')[0],
      email: email.trim(),
      gender,
      city: city.trim(),
      phone: phone.trim(),
      altPhone: altPhone.trim(),
      whatsappPhone: whatsappPhone.trim() || phone.trim(),
      dob,
      avatar: currentAvatar,
      profilePicture: currentAvatar
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
    setSupportSubject('');
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
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, 210, 297, 'F');
    doc.setTextColor(217, 0, 0);
    doc.setFontSize(22);
    doc.text('PrimeShow Cinema Ticket', 20, 30);
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(12);
    doc.text(`Booking ID: ${b.id}`, 20, 50);
    doc.text(`Movie: ${b.movieTitle}`, 20, 65);
    doc.text(`Multiplex: ${b.theatreName}`, 20, 80);
    doc.text(`Showtime: ${b.showDate} @ ${b.showTime}`, 20, 95);
    doc.text(`Seats: ${b.seats?.join(', ')}`, 20, 110);
    doc.save(`PrimeShow_Ticket_${b.id}.pdf`);
  };

  const userChatList = (supportMessages || [])
    .filter(m => (user && (m.userId === user.id || (user.email && m.userEmail === user.email))))
    .sort((a, b) => {
      const timeA = new Date(a.createdAt || a.timestamp || 0).getTime();
      const timeB = new Date(b.createdAt || b.timestamp || 0).getTime();
      return timeA - timeB;
    });
  const unreadNotifCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-slate-900 pb-20 font-sans">
      
      {/* Dedicated Minimal Header Bar for Profile Page */}
      <header className="sticky top-0 z-50 bg-[#DBCEA5] border-b border-[#c5ba92] px-4 sm:px-8 py-4 flex items-center justify-between shadow-md mb-6 text-slate-900">
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
            <User className="w-4 h-4 text-white" />
          </div>
          <span className="text-base sm:text-lg font-bold tracking-wide text-slate-900">My Account Suite</span>
        </div>

        <div className="w-20"></div> {/* Spacer for symmetry */}
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {savedMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-[#66DD6A]/20 border border-[#66DD6A] text-slate-900 text-xs font-bold text-center flex items-center justify-center gap-2 shadow-sm animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-700" />
            <span>{savedMsg}</span>
          </div>
        )}

        {/* Profile Header Banner Card */}
        <div className="bg-[#DBCEA5] p-6 sm:p-8 rounded-3xl border border-[#c5ba92] mb-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md text-slate-900">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group">
              <img
                src={currentAvatar}
                alt={user?.name || 'User'}
                className="w-24 h-24 rounded-full object-cover border-2 border-slate-300 shadow-xl"
              />
              <button 
                onClick={() => setIsAvatarModalOpen(true)}
                className="absolute bottom-0 right-0 p-2.5 rounded-full bg-[#D90000] hover:bg-[#b00000] text-white shadow-md hover:scale-110 transition-transform cursor-pointer"
                title="Change Profile Photo"
              >
                <Camera className="w-4 h-4 text-white" />
              </button>
            </div>

            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl font-bold font-sans text-slate-900">{user?.name || 'User'}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-[#D90000] text-white text-[10px] font-bold uppercase shadow-xs">
                  {user?.role || 'CUSTOMER'} Member
                </span>
              </div>
              <p className="text-xs text-slate-800 font-semibold mt-1">@{user?.username || email?.split('@')[0]} • {user?.email} • {user?.phone}</p>
              
              <div className="mt-3 flex items-center justify-center sm:justify-start gap-4 text-xs font-semibold">
                <span className="text-[#D90000] font-bold">★ {user?.rewardsPoints || 1250} Reward Points</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-900 font-bold">{myBookings.length} Bookings</span>
                <span className="text-slate-500">•</span>
                <span className="text-[#D90000] font-bold">{city}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => { setIsEditing(!isEditing); setActiveTab('profile-info'); }}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 shadow-md cursor-pointer ${
                isEditing
                  ? 'bg-slate-900 text-white hover:bg-slate-800'
                  : 'bg-[#D90000] hover:bg-[#b00000] text-white'
              }`}
            >
              <Edit3 className="w-4 h-4 text-white" />
              <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
            </button>

            <button
              onClick={() => setIsAvatarModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 hover:bg-slate-100 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Upload className="w-4 h-4 text-[#D90000]" />
              <span>Upload Photo</span>
            </button>
          </div>
        </div>

        {/* Profile Tab Navigation Bar */}
        <div className="flex overflow-x-auto gap-2 p-1.5 bg-[#DBCEA5] rounded-2xl border border-[#c5ba92] mb-8 text-xs font-semibold text-slate-900">
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
                    ? 'bg-[#D90000] text-white font-bold shadow-md'
                    : 'text-slate-900 hover:text-black hover:bg-white/40 font-semibold'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#D90000]'}`} />
                <span>{tab.label}</span>
                {tab.badge > 0 && (
                  <span className="ml-1 w-4 h-4 rounded-full bg-white text-[#D90000] text-[9px] font-bold flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Personal Details */}
        {activeTab === 'profile-info' && (
          <div className="bg-[#DBCEA5] p-6 sm:p-8 rounded-3xl border border-[#c5ba92] space-y-6 text-slate-900 shadow-md">
            <div className="flex items-center justify-between border-b border-[#c5ba92] pb-4">
              <div>
                <h2 className="text-xl font-bold font-sans text-slate-900">Personal Profile & Registration Details</h2>
                <p className="text-xs text-slate-800 font-medium">Manage your profile details. Registration data is automatically pre-populated.</p>
              </div>

              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 rounded-xl bg-[#D90000] hover:bg-[#b00000] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Edit3 className="w-4 h-4 text-white" />
                <span>{isEditing ? 'Exit Editing' : 'Edit Profile'}</span>
              </button>
            </div>

            {validationError && (
              <div className="p-3 rounded-xl bg-rose-100 border border-rose-300 text-rose-900 text-xs font-semibold">
                {validationError}
              </div>
            )}

            {isEditing ? (
              /* EDIT MODE FORM FOR ALL 11 FIELDS + AVATAR SELECTOR */
              <form onSubmit={handleSaveProfile} className="space-y-6">
                
                {/* DEFAULT AVATAR SELECTOR (Men, Female, Kids, Others) */}
                <div className="p-5 rounded-2xl bg-white/70 border border-[#c5ba92] space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-[#D90000]" /> Default Profile Avatar Options
                    </label>
                    <span className="text-[10px] text-slate-700 font-semibold">Click any avatar to select instantly</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {defaultAvatars.map((av) => {
                      const isSelected = currentAvatar === av.url;
                      return (
                        <button
                          key={av.id}
                          type="button"
                          onClick={() => handleSaveAvatar(av.url)}
                          className={`p-3.5 rounded-2xl border transition-all flex flex-col items-center gap-2 cursor-pointer group relative ${
                            isSelected
                              ? 'border-[#D90000] bg-[#D90000]/10 ring-2 ring-[#D90000]/30 shadow-xs'
                              : 'border-slate-300 bg-white hover:border-slate-400'
                          }`}
                        >
                          <div className="relative">
                            <img 
                              src={av.url} 
                              alt={av.label} 
                              className="w-14 h-14 rounded-full object-cover border border-slate-300 group-hover:scale-105 transition-transform" 
                            />
                            {isSelected && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#D90000] text-white flex items-center justify-center shadow-md">
                                <Check className="w-3.5 h-3.5 stroke-[3] text-white" />
                              </div>
                            )}
                          </div>
                          <span className={`text-xs font-extrabold ${isSelected ? 'text-[#D90000]' : 'text-slate-900'}`}>
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
                    <label className="block text-xs font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#D90000]" /> Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-3 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:border-[#D90000]"
                      placeholder="Enter Full Name"
                    />
                  </div>

                  {/* Username */}
                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
                      <AtSign className="w-3.5 h-3.5 text-[#D90000]" /> Username
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full p-3 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:border-[#D90000]"
                      placeholder="e.g. aarav_sharma"
                    />
                  </div>

                  {/* Email Address */}
                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#D90000]" /> Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-3 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:border-[#D90000]"
                      placeholder="name@example.com"
                    />
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1.5">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full p-3 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:border-[#D90000]"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#D90000]" /> City
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full p-3 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:border-[#D90000]"
                      placeholder="e.g. Mumbai, Delhi NCR"
                    />
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#D90000]" /> Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full p-3 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:border-[#D90000]"
                      placeholder="+91 9876543210"
                    />
                  </div>

                  {/* Alternate Mobile Number */}
                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#D90000]" /> Alternate Mobile Number
                    </label>
                    <input
                      type="tel"
                      value={altPhone}
                      onChange={(e) => setAltPhone(e.target.value)}
                      className="w-full p-3 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:border-[#D90000]"
                      placeholder="+91 9123456789 (Optional)"
                    />
                  </div>

                  {/* WhatsApp Mobile Number */}
                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp Mobile Number
                    </label>
                    <input
                      type="tel"
                      value={whatsappPhone}
                      onChange={(e) => setWhatsappPhone(e.target.value)}
                      className="w-full p-3 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:border-[#D90000]"
                      placeholder="+91 9876543210 (For e-tickets)"
                    />
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#D90000]" /> Date of Birth
                    </label>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full p-3 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:border-[#D90000]"
                    />
                  </div>
                </div>

                {/* Secure Password Change Drawer in Edit Mode */}
                <div className="pt-4 border-t border-[#c5ba92] space-y-4">
                  <button
                    type="button"
                    onClick={() => setShowPasswordFields(!showPasswordFields)}
                    className="text-xs font-bold text-[#D90000] hover:underline flex items-center gap-1.5 cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>{showPasswordFields ? 'Hide Password Change' : 'Change Password'}</span>
                  </button>

                  {showPasswordFields && (
                    <div className="p-4 rounded-2xl bg-white/70 border border-[#c5ba92] grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-900 mb-1">Current Password</label>
                        <input
                          type="password"
                          value={currentPass}
                          onChange={(e) => setCurrentPass(e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:border-[#D90000]"
                          placeholder="Current password"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-900 mb-1">New Password</label>
                        <input
                          type="password"
                          value={newPass}
                          onChange={(e) => setNewPass(e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:border-[#D90000]"
                          placeholder="New password"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-[#c5ba92] flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 hover:bg-slate-100 text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-2.5 rounded-xl bg-[#D90000] hover:bg-[#b00000] text-white font-bold text-xs shadow-md cursor-pointer"
                  >
                    Save Profile Changes
                  </button>
                </div>
              </form>
            ) : (
              /* VIEW MODE DISPLAY GRID */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-white/60 border border-[#c5ba92] space-y-1 shadow-xs">
                  <span className="text-[10px] text-slate-700 font-semibold block uppercase">FULL NAME</span>
                  <span className="text-sm font-bold text-slate-900">{name || 'N/A'}</span>
                </div>

                <div className="p-4 rounded-2xl bg-white/60 border border-[#c5ba92] space-y-1 shadow-xs">
                  <span className="text-[10px] text-slate-700 font-semibold block uppercase">USERNAME</span>
                  <span className="text-sm font-bold text-slate-900">@{username || email.split('@')[0]}</span>
                </div>

                <div className="p-4 rounded-2xl bg-white/60 border border-[#c5ba92] space-y-1 shadow-xs">
                  <span className="text-[10px] text-slate-700 font-semibold block uppercase">EMAIL ADDRESS</span>
                  <span className="text-sm font-bold text-slate-900 truncate block">{email || 'N/A'}</span>
                </div>

                <div className="p-4 rounded-2xl bg-white/60 border border-[#c5ba92] space-y-1 shadow-xs">
                  <span className="text-[10px] text-slate-700 font-semibold block uppercase">GENDER</span>
                  <span className="text-sm font-bold text-slate-900">{gender}</span>
                </div>

                <div className="p-4 rounded-2xl bg-white/60 border border-[#c5ba92] space-y-1 shadow-xs">
                  <span className="text-[10px] text-slate-700 font-semibold block uppercase">CITY</span>
                  <span className="text-sm font-bold text-slate-900">{city}</span>
                </div>

                <div className="p-4 rounded-2xl bg-white/60 border border-[#c5ba92] space-y-1 shadow-xs">
                  <span className="text-[10px] text-slate-700 font-semibold block uppercase">MOBILE NUMBER</span>
                  <span className="text-sm font-bold text-slate-900">{phone || 'N/A'}</span>
                </div>

                <div className="p-4 rounded-2xl bg-white/60 border border-[#c5ba92] space-y-1 shadow-xs">
                  <span className="text-[10px] text-slate-700 font-semibold block uppercase">ALTERNATE MOBILE</span>
                  <span className="text-sm font-bold text-slate-900">{altPhone || 'Not set'}</span>
                </div>

                <div className="p-4 rounded-2xl bg-white/60 border border-[#c5ba92] space-y-1 shadow-xs">
                  <span className="text-[10px] text-slate-700 font-semibold block uppercase">WHATSAPP NUMBER</span>
                  <span className="text-sm font-bold text-emerald-800">{whatsappPhone || phone || 'Not set'}</span>
                </div>

                <div className="p-4 rounded-2xl bg-white/60 border border-[#c5ba92] space-y-1 shadow-xs">
                  <span className="text-[10px] text-slate-700 font-semibold block uppercase">DATE OF BIRTH</span>
                  <span className="text-sm font-bold text-slate-900">{dob}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Dynamic Admin Notification Stream System */}
        {activeTab === 'notifications' && (
          <div className="bg-[#DBCEA5] p-6 sm:p-8 rounded-3xl border border-[#c5ba92] space-y-6 text-slate-900 shadow-md">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#c5ba92] pb-4">
              <div>
                <h2 className="text-xl font-bold font-sans text-slate-900">System & Broadcast Notifications</h2>
                <p className="text-xs text-slate-700 font-medium">Real-time alerts, offers, and official announcements broadcasted from Admin Command.</p>
              </div>

              <div className="flex items-center gap-3">
                {unreadNotifCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="px-3.5 py-1.5 rounded-xl bg-[#D90000] text-white text-xs font-bold transition-all cursor-pointer shadow-xs hover:bg-[#b00000]"
                  >
                    Mark All as Read
                  </button>
                )}
                <span className="px-3 py-1 rounded-full bg-[#D90000]/10 text-[#D90000] border border-[#D90000]/30 text-xs font-bold">
                  {unreadNotifCount} Unread
                </span>
              </div>
            </div>

            {(notifications || []).length > 0 ? (
              <div className="space-y-4">
                {(notifications || []).map(n => {
                  const typeLabel = n.type || n.priority || 'Info';
                  let priorityBadge = 'bg-blue-100 text-blue-900 border-blue-300';
                  if (typeLabel.toLowerCase().includes('alert')) {
                    priorityBadge = 'bg-rose-100 text-rose-900 border-rose-300';
                  } else if (typeLabel.toLowerCase().includes('offer') || typeLabel.toLowerCase().includes('promo')) {
                    priorityBadge = 'bg-amber-100 text-amber-900 border-amber-300';
                  }

                  return (
                    <div 
                      key={n.id} 
                      className={`p-5 rounded-3xl border transition-all flex flex-col sm:flex-row items-start justify-between gap-4 ${
                        !n.read 
                          ? 'border-[#D90000] bg-white shadow-md' 
                          : 'border-[#c5ba92] bg-white/70'
                      }`}
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          {!n.read && <span className="w-2.5 h-2.5 rounded-full bg-[#D90000] animate-ping"></span>}
                          <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${priorityBadge}`}>
                            {typeLabel}
                          </span>
                          <h4 className="text-base font-bold text-slate-900 leading-tight">{n.title}</h4>
                        </div>

                        <p className="text-xs text-slate-800 leading-relaxed font-medium">{n.message}</p>

                        <div className="flex items-center gap-3 text-[10px] text-slate-600 pt-1 font-semibold">
                          <span>📅 {new Date(n.createdAt || Date.now()).toLocaleString()}</span>
                          <span>•</span>
                          <span className={n.read ? 'text-emerald-700 font-bold' : 'text-[#D90000] font-bold'}>
                            {n.read ? '✓ Read' : '● Unread'}
                          </span>
                        </div>
                      </div>

                      {!n.read && (
                        <button
                          onClick={() => markNotificationRead(n.id)}
                          className="px-3.5 py-2 rounded-xl bg-[#D90000] text-white hover:bg-[#b00000] text-xs font-bold transition-all shrink-0 cursor-pointer shadow-xs"
                        >
                          Mark Read
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white/60 p-12 rounded-3xl text-center text-slate-700 space-y-2 border border-[#c5ba92]">
                <Bell className="w-10 h-10 text-[#D90000] mx-auto" />
                <h4 className="text-base font-bold text-slate-900">No System Notifications</h4>
                <p className="text-xs text-slate-600">You have no active notifications at this time.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Bookings History */}
        {activeTab === 'bookings' && (
          <div className="bg-[#DBCEA5] p-6 sm:p-8 rounded-3xl border border-[#c5ba92] space-y-6 text-slate-900 shadow-md">
            <h2 className="text-xl font-bold font-sans text-slate-900">Interactive Booking History</h2>

            {myBookings.length > 0 ? (
              myBookings.map(b => (
                <div key={b.id} className="bg-white p-6 rounded-3xl border border-[#c5ba92] flex flex-col md:flex-row items-center justify-between gap-6 shadow-md text-slate-900">
                  <div className="flex items-center gap-4">
                    <img
                      src={b.poster || "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80"}
                      alt={b.movieTitle}
                      className="w-16 h-24 object-cover rounded-xl border border-slate-300 shadow-xs"
                    />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                          {b.status}
                        </span>
                        <span className="text-xs font-bold text-[#D90000]">Order ID: {b.id}</span>
                      </div>
                      <h3 className="text-lg font-bold font-sans text-slate-900">{b.movieTitle}</h3>
                      <p className="text-xs text-slate-700 font-medium">{b.theatreName}</p>
                      <div className="text-xs text-slate-900 font-bold mt-1">
                        Seats: {b.seats?.join(', ')} ({b.tier || 'Recliner'})
                      </div>
                      <div className="text-[11px] text-slate-600 font-medium">{b.showDate} @ {b.showTime}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-slate-200">
                    <div className="bg-white p-2 rounded-xl border border-slate-300 shadow-xs hidden sm:block">
                      <QRCodeSVG value={b.qrCodeData || b.id} size={65} />
                    </div>

                    <button
                      onClick={() => handleDownloadPDF(b)}
                      className="px-4 py-2.5 rounded-xl bg-[#D90000] hover:bg-[#b00000] text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-white" />
                      <span>Download PDF</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white/60 p-12 rounded-3xl text-center text-slate-700 border border-[#c5ba92] font-semibold">
                No past bookings found. Book your first luxury screening today!
              </div>
            )}
          </div>
        )}

        {/* Tab: Movie Wishlist & Saved Favorites */}
        {activeTab === 'wishlist' && (
          <div className="bg-[#DBCEA5] p-6 sm:p-8 rounded-3xl border border-[#c5ba92] space-y-6 text-slate-900 shadow-md">
            <div className="flex items-center justify-between border-b border-[#c5ba92] pb-4">
              <div>
                <h2 className="text-xl font-bold font-sans text-slate-900">Saved Movie Wishlist</h2>
                <p className="text-xs text-slate-700 font-medium">Movies you have liked and saved for quick ticket booking.</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-900 border border-rose-300 text-xs font-bold flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 fill-rose-600 text-rose-600" />
                <span>{(wishlist || []).length} Saved</span>
              </span>
            </div>

            {moviesList.filter(m => (wishlist || []).includes(m.id)).length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {moviesList.filter(m => (wishlist || []).includes(m.id)).map(movie => (
                  <div key={movie.id} className="bg-white rounded-3xl border border-[#c5ba92] overflow-hidden flex flex-col justify-between group shadow-md hover:shadow-lg transition-all">
                    <div className="relative aspect-[2/3] overflow-hidden">
                      <img 
                        src={movie.poster} 
                        alt={movie.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <button
                        onClick={() => toggleWishlist(movie.id)}
                        className="absolute top-3 right-3 p-2 rounded-full bg-white/90 text-rose-600 shadow-md hover:scale-110 transition-transform cursor-pointer"
                        title="Remove from Wishlist"
                      >
                        <Heart className="w-4 h-4 fill-rose-600" />
                      </button>
                      <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-black/80 text-white text-xs font-bold">
                        ★ {movie.rating || 9.0}
                      </div>
                    </div>

                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between text-slate-900">
                      <div>
                        <h4 className="font-bold text-base text-slate-900 line-clamp-1">{movie.title}</h4>
                        <p className="text-xs text-slate-600 font-medium mt-0.5">{movie.duration} • {movie.genres?.join(', ')}</p>
                      </div>

                      <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2">
                        <button
                          onClick={() => {
                            if (movie.theatres?.[0]?.shows?.[0]) {
                              selectShowForBooking(movie, movie.theatres[0], movie.theatres[0].shows[0]);
                            }
                          }}
                          className="w-full py-2 rounded-xl bg-[#D90000] hover:bg-[#b00000] text-white font-extrabold text-xs shadow-md cursor-pointer"
                        >
                          Book Tickets
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white/60 p-12 rounded-3xl text-center text-slate-700 space-y-2 border border-[#c5ba92]">
                <Heart className="w-10 h-10 text-rose-500 mx-auto" />
                <h4 className="text-base font-bold text-slate-900">Your Wishlist is Empty</h4>
                <p className="text-xs text-slate-600">Click the Heart icon on any movie card to save it here for fast booking!</p>
              </div>
            )}
          </div>
        )}

        {/* Tab: Rewards & Wallet */}
        {activeTab === 'rewards' && (
          <div className="bg-[#DBCEA5] p-6 sm:p-8 rounded-3xl border border-[#c5ba92] space-y-6 text-slate-900 shadow-md">
            <div className="flex items-center justify-between border-b border-[#c5ba92] pb-4">
              <div>
                <h2 className="text-xl font-bold font-sans text-slate-900">Rewards & VIP Wallet</h2>
                <p className="text-xs text-slate-700 font-medium">Track your loyalty points, cashback balance, and exclusive vouchers.</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#D90000]/10 text-[#D90000] border border-[#D90000]/30 text-xs font-bold">
                ★ {user?.rewardsPoints || 1250} PTS Balance
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-[#c5ba92] shadow-md space-y-3 text-slate-900">
                <div className="text-[#D90000] text-xs font-bold uppercase tracking-wider">Reward Points Balance</div>
                <div className="text-3xl font-extrabold text-slate-900">★ {user?.rewardsPoints || 1250}</div>
                <p className="text-[11px] text-slate-700 font-medium">Earn 50 points on every movie ticket booking transaction!</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-[#c5ba92] shadow-md space-y-3 text-slate-900">
                <div className="text-emerald-700 text-xs font-bold uppercase tracking-wider">PrimeShow Wallet Balance</div>
                <div className="text-3xl font-extrabold text-slate-900">₹ 450.00</div>
                <p className="text-[11px] text-slate-700 font-medium">Instant cashback refund available for ticket bookings.</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-[#c5ba92] shadow-md space-y-3 text-slate-900">
                <div className="text-purple-700 text-xs font-bold uppercase tracking-wider">Loyalty Club Tier</div>
                <div className="text-2xl font-extrabold text-slate-900">GOLD VIP MEMBER</div>
                <p className="text-[11px] text-slate-700 font-medium">Free gourmet food upgrade & zero cancellation fee unlocked.</p>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <h3 className="text-lg font-bold text-slate-900">Active Promo Vouchers</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/80 p-4 rounded-2xl border border-[#c5ba92] space-y-2 text-slate-900 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-[#D90000]/10 text-[#D90000] font-mono font-bold text-xs">PRIMESHOW50</span>
                    <span className="text-[10px] text-emerald-800 font-bold">50% OFF</span>
                  </div>
                  <p className="text-xs text-slate-800 font-medium">Flat 50% Discount on IMAX 3D recliners up to ₹250.</p>
                </div>

                <div className="bg-white/80 p-4 rounded-2xl border border-[#c5ba92] space-y-2 text-slate-900 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-[#D90000]/10 text-[#D90000] font-mono font-bold text-xs">LUXURY200</span>
                    <span className="text-[10px] text-emerald-800 font-bold">₹200 CASHBACK</span>
                  </div>
                  <p className="text-xs text-slate-800 font-medium">Flat ₹200 Cashback for HDFC & ICICI Credit Cards.</p>
                </div>

                <div className="bg-white/80 p-4 rounded-2xl border border-[#c5ba92] space-y-2 text-slate-900 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-[#D90000]/10 text-[#D90000] font-mono font-bold text-xs">ADMINVIP</span>
                    <span className="text-[10px] text-emerald-800 font-bold">₹500 PASS</span>
                  </div>
                  <p className="text-xs text-slate-800 font-medium">VIP Admin ₹500 Pass for private lounge bookings.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: WhatsApp Live Support Chat */}
        {activeTab === 'support' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <form onSubmit={handleSendSupportMessage} className="bg-[#DBCEA5] p-6 rounded-3xl border border-[#c5ba92] space-y-4 text-slate-900 shadow-md">
              <h3 className="text-lg font-bold font-sans text-slate-900">WhatsApp VIP Support Desk</h3>
              
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={supportSubject}
                  onChange={(e) => setSupportSubject(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:border-[#D90000] focus:ring-1 focus:ring-[#D90000]"
                  placeholder="e.g. Booking inquiry or seat change"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">Message</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Type message to admin support..."
                  value={supportText}
                  onChange={(e) => setSupportText(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:border-[#D90000] focus:ring-1 focus:ring-[#D90000]"
                ></textarea>
              </div>

              <button type="submit" className="w-full py-3 rounded-xl bg-[#D90000] hover:bg-[#b00000] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer">
                <Send className="w-4 h-4 text-white" />
                <span>Send Real-Time Message</span>
              </button>
            </form>

            <div className="bg-[#DBCEA5] p-6 rounded-3xl border border-[#c5ba92] space-y-4 max-h-[500px] overflow-y-auto text-slate-900 shadow-md">
              <h3 className="text-lg font-bold font-sans text-slate-900 border-b border-[#c5ba92] pb-3">WhatsApp Message Stream</h3>

              {userChatList.map(msg => (
                <div key={msg.id} className="space-y-2">
                  <div className="flex justify-end">
                    <div className="max-w-[80%] p-3.5 rounded-2xl rounded-tr-none bg-emerald-100 border border-emerald-300 text-xs text-slate-900 shadow-xs">
                      <div className="text-[10px] font-bold text-emerald-900 mb-1">{msg.subject}</div>
                      <p className="text-slate-800 font-medium">"{msg.message}"</p>
                      <div className="text-[9px] text-slate-600 text-right mt-1 flex items-center justify-end gap-1">
                        <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="text-emerald-700 font-bold">✓✓</span>
                      </div>
                    </div>
                  </div>

                  {msg.reply && (
                    <div className="flex justify-start">
                      <div className="max-w-[80%] p-3.5 rounded-2xl rounded-tl-none bg-white border border-slate-300 text-xs text-slate-900 shadow-xs">
                        <div className="text-[10px] font-bold text-[#D90000] mb-1">Admin Command Support</div>
                        <p className="text-slate-900 font-semibold">{msg.reply}</p>
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
            {/* Password Reset Form */}
            <form onSubmit={handlePasswordReset} className="bg-[#DBCEA5] p-6 rounded-3xl border border-[#c5ba92] space-y-4 max-w-xl text-slate-900 shadow-md">
              <h3 className="text-lg font-bold font-sans text-slate-900">Update Password</h3>
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">Current Password</label>
                <input type="password" required value={currentPass} onChange={(e) => setCurrentPass(e.target.value)} className="w-full p-3 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:border-[#D90000]" placeholder="Enter current password" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">New Password</label>
                <input type="password" required value={newPass} onChange={(e) => setNewPass(e.target.value)} className="w-full p-3 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:border-[#D90000]" placeholder="Enter new password" />
              </div>
              <button type="submit" className="w-full py-3 rounded-xl bg-[#D90000] hover:bg-[#b00000] text-white font-bold text-xs shadow-md cursor-pointer">
                Update Password
              </button>
            </form>
          </div>
        )}

      </div>

      {/* Profile Picture Device Gallery Upload & Default Avatar Selector Modal */}
      {isAvatarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 border border-slate-300 shadow-2xl text-slate-900 space-y-6">
            <button
              onClick={() => setIsAvatarModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5 text-slate-900" />
            </button>

            <div>
              <h3 className="text-xl font-bold font-sans text-slate-900 mb-1">Update Profile Picture</h3>
              <p className="text-xs text-slate-700 font-medium">Choose a default avatar character or upload from your device gallery</p>
            </div>

            {/* 1. DEFAULT AVATAR OPTIONS (Men, Female, Kids, Others) */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
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
                      className={`p-3.5 rounded-2xl border transition-all flex flex-col items-center gap-2 cursor-pointer group relative ${
                        isSelected
                          ? 'border-[#D90000] bg-[#D90000]/10 ring-2 ring-[#D90000]/30 shadow-xs'
                          : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <div className="relative">
                        <img 
                          src={av.url} 
                          alt={av.label} 
                          className="w-14 h-14 rounded-full object-cover border border-slate-300 group-hover:scale-105 transition-transform" 
                        />
                        {isSelected && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#D90000] text-white flex items-center justify-center shadow-md">
                            <Check className="w-3.5 h-3.5 stroke-[3] text-white" />
                          </div>
                        )}
                      </div>
                      <span className={`text-xs font-extrabold ${isSelected ? 'text-[#D90000]' : 'text-slate-800'}`}>
                        {av.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Direct Device Gallery File Input Button */}
            <div>
              <label className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-dashed border-[#D90000]/40 hover:border-[#D90000] flex flex-col items-center justify-center gap-2 cursor-pointer group transition-all">
                <Upload className="w-7 h-7 text-[#D90000] group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-[#D90000]">Click to Select Photo from Device Gallery</span>
                <span className="text-[10px] text-slate-600">Supports JPG, PNG, WEBP, GIF</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUploadFromGallery}
                  className="hidden"
                />
              </label>
            </div>

            {/* 3. Custom URL Input */}
            <div className="pt-4 border-t border-slate-200">
              <label className="block text-xs font-bold text-slate-900 mb-2">Or Paste Custom Image URL</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={customAvatarUrl}
                  onChange={(e) => setCustomAvatarUrl(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:border-[#D90000]"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customAvatarUrl) handleSaveAvatar(customAvatarUrl);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#D90000] hover:bg-[#b00000] text-white font-bold text-xs cursor-pointer shadow-xs"
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
