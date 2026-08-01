import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, Ticket, Heart, Award, Settings, Lock, Download, 
  Share2, ShieldCheck, Mail, Phone, Edit, Check, QrCode, XCircle, Bell, Moon, Sun 
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import jsPDF from 'jspdf';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import API from '../../services/api';

export default function ProfilePage() {
  const { user, updateUserProfile, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [bookings, setBookings] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [wishlist, setWishlist] = useState([
    { id: "mov-1", title: "Dune: Part Two", genre: "Sci-Fi", poster: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop" },
    { id: "mov-5", title: "Kalki 2898 AD", genre: "Mythology", poster: "https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=800&auto=format&fit=crop" }
  ]);

  // Profile Form
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [savedMsg, setSavedMsg] = useState('');
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    if (user?.id) {
      API.get(`/bookings/user/${user.id}`)
        .then(res => setBookings(res.data))
        .catch(() => {});
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4 text-slate-400">
        <p>Please sign in to access your Profile Suite.</p>
        <button onClick={() => navigate('/')} className="px-6 py-2.5 rounded-full bg-cyan-500 text-black font-bold text-xs glow-cyan">
          Back to Home
        </button>
      </div>
    );
  }

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateUserProfile({ name, email, phone });
    setSavedMsg('Profile details updated successfully!');
    setTimeout(() => setSavedMsg(''), 3000);
  };

  const handleCancelBooking = async (bookingId) => {
    if (!confirm("Are you sure you want to cancel this booking and release seats?")) return;
    try {
      const res = await API.post(`/bookings/${bookingId}/cancel`);
      setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: 'Cancelled' } : b));
      alert(res.data.message);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveWishlist = (id) => {
    setWishlist(wishlist.filter(w => w.id !== id));
  };

  const handleDownloadPDF = (b) => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("PRIMESHOW DIGITAL TICKET", 20, 20);
    doc.setFontSize(12);
    doc.text(`Booking Ref: ${b.id}`, 20, 35);
    doc.text(`Movie: ${b.movieTitle}`, 20, 45);
    doc.text(`Theatre: ${b.theatreName}`, 20, 55);
    doc.text(`Showtime: ${b.date} at ${b.time}`, 20, 65);
    doc.text(`Seats: ${b.seats?.join(', ')}`, 20, 75);
    doc.text(`Amount Paid: Rs. ${b.finalAmount}`, 20, 85);
    doc.save(`PrimeShow-Ticket-${b.id}.pdf`);
  };

  const tabs = [
    { label: "Overview", path: "/profile", icon: User },
    { label: "My Bookings", path: "/profile/bookings", icon: Ticket },
    { label: "Wishlist", path: "/profile/wishlist", icon: Heart },
    { label: "Rewards & Points", path: "/profile/rewards", icon: Award },
    { label: "Security & Settings", path: "/profile/settings", icon: Settings },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 min-h-screen">
      
      {/* USER PROFILE BANNER */}
      <div className="p-8 rounded-3xl glass-panel border-white/10 flex flex-col sm:flex-row items-center gap-6 bg-gradient-to-r from-white/5 via-cyan-500/10 to-transparent">
        <img src={user.avatar} alt={user.name} className="w-24 h-24 rounded-full object-cover border-2 border-cyan-400 glow-cyan" />
        <div className="space-y-1 text-center sm:text-left flex-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded border border-cyan-500/20">
            VIP Prime Member
          </span>
          <h1 className="font-serif text-3xl font-bold text-white">{user.name}</h1>
          <p className="text-xs text-slate-400">{user.email} • {user.phone}</p>
        </div>
      </div>

      {/* NAVIGATION TABS & MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* SIDEBAR TABS */}
        <div className="md:col-span-4 space-y-2">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.path;
            const Icon = tab.icon;
            return (
              <Link
                key={tab.label}
                to={tab.path}
                className={`flex items-center gap-3 p-4 rounded-2xl text-sm font-semibold transition-all border ${
                  isActive
                    ? 'bg-cyan-500 text-black border-cyan-400 font-bold glow-cyan'
                    : 'glass-panel text-slate-300 hover:border-cyan-500/30'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-black' : 'text-cyan-400'}`} />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>

        {/* MAIN PANEL CONTENT */}
        <div className="md:col-span-8">
          <Routes>
            {/* OVERVIEW & EDIT PROFILE */}
            <Route path="/" element={
              <div className="p-8 rounded-3xl glass-panel border-white/10 space-y-6">
                <h2 className="font-serif text-2xl font-bold text-white">Personal Information</h2>
                {savedMsg && <p className="text-xs text-emerald-400 font-semibold">{savedMsg}</p>}

                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Full Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-3 rounded-xl glass-input text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Email Address</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 rounded-xl glass-input text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Phone Number</label>
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-3 rounded-xl glass-input text-sm" />
                  </div>
                  <button type="submit" className="px-6 py-2.5 rounded-full bg-cyan-500 text-black font-bold text-xs glow-cyan cursor-pointer">
                    Save Details
                  </button>
                </form>
              </div>
            } />

            {/* MY BOOKINGS HISTORY */}
            <Route path="/bookings" element={
              <div className="space-y-4">
                <h2 className="font-serif text-2xl font-bold text-white">My Booking History</h2>
                {bookings.length === 0 ? (
                  <p className="text-xs text-slate-400">No past bookings found.</p>
                ) : (
                  bookings.map((b) => (
                    <div key={b.id} className="p-6 rounded-3xl glass-panel border-white/10 space-y-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">{b.id}</span>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                            b.status === 'Cancelled' ? 'bg-red-500/10 text-red-400 border border-red-500/30' : 'bg-emerald-500/10 text-emerald-400'
                          }`}>
                            {b.status || 'Confirmed'}
                          </span>
                        </div>
                        <h3 className="font-serif text-xl font-bold text-white">{b.movieTitle}</h3>
                        <p className="text-xs text-slate-300">{b.theatreName} • {b.screenName}</p>
                        <p className="text-xs text-slate-400">{b.date} @ {b.time} | Seats: <strong className="text-white">{b.seats?.join(', ')}</strong></p>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                        {b.status !== 'Cancelled' && (
                          <>
                            <button
                              onClick={() => setSelectedTicket(b)}
                              className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold hover:bg-cyan-500 hover:text-black transition-all cursor-pointer"
                            >
                              QR Ticket
                            </button>
                            <button
                              onClick={() => handleCancelBooking(b.id)}
                              className="px-4 py-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                            >
                              Cancel Booking
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            } />

            {/* WISHLIST */}
            <Route path="/wishlist" element={
              <div className="p-8 rounded-3xl glass-panel border-white/10 space-y-6">
                <h2 className="font-serif text-2xl font-bold text-white">Saved Wishlist</h2>
                {wishlist.length === 0 ? (
                  <p className="text-xs text-slate-400">Your wishlist is empty.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {wishlist.map(w => (
                      <div key={w.id} className="p-4 rounded-2xl glass-panel border-white/5 flex items-center justify-between gap-3">
                        <img src={w.poster} alt={w.title} className="w-12 h-16 object-cover rounded-xl" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white truncate">{w.title}</p>
                          <p className="text-[10px] text-slate-400">{w.genre}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveWishlist(w.id)}
                          className="text-xs text-red-400 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            } />

            {/* REWARDS */}
            <Route path="/rewards" element={
              <div className="p-8 rounded-3xl glass-panel border-white/10 space-y-6">
                <h2 className="font-serif text-2xl font-bold text-white">Rewards & Member Credits</h2>
                <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/20 to-purple-600/20 border border-amber-500/30 space-y-2">
                  <p className="text-xs text-amber-300 uppercase tracking-wider font-bold">Prime Lounge Balance</p>
                  <p className="text-3xl font-serif font-bold text-white">1,250 Points</p>
                  <p className="text-xs text-slate-300">Equivalent to ₹125 instant discount on your next reservation.</p>
                </div>
              </div>
            } />

            {/* SECURITY & SETTINGS */}
            <Route path="/settings" element={
              <div className="p-8 rounded-3xl glass-panel border-white/10 space-y-6">
                <h2 className="font-serif text-2xl font-bold text-white">Security & Preferences</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-2xl glass-panel">
                    <span className="text-xs font-bold text-white">Theme Preference</span>
                    <button onClick={toggleTheme} className="px-4 py-1.5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold border border-cyan-500/30">
                      {isDark ? 'Dark Mode' : 'Light Mode'}
                    </button>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">New Security Password</label>
                    <input type="password" placeholder="••••••••" className="w-full p-3 rounded-xl glass-input text-sm" />
                  </div>
                  <button className="px-6 py-2.5 rounded-full bg-cyan-500 text-black font-bold text-xs glow-cyan">
                    Update Password
                  </button>
                </div>
              </div>
            } />
          </Routes>
        </div>

      </div>

      {/* QR TICKET LIGHTBOX MODAL */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#0c0d14] border border-cyan-500/30 rounded-3xl p-6 shadow-2xl space-y-6 relative text-left">
            <button onClick={() => setSelectedTicket(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white">✕</button>

            <div className="text-center space-y-1">
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Digital Entry Pass</span>
              <h3 className="font-serif text-2xl font-bold text-white">{selectedTicket.movieTitle}</h3>
              <p className="text-xs text-slate-400">{selectedTicket.theatreName}</p>
            </div>

            <div className="flex justify-center p-4 bg-white rounded-2xl">
              <QRCodeSVG value={selectedTicket.qrData || 'PRIMESHOW'} size={150} />
            </div>

            <div className="space-y-1 text-xs text-slate-300">
              <p>Showtime: <strong>{selectedTicket.date} at {selectedTicket.time}</strong></p>
              <p>Seats: <strong className="text-cyan-300">{selectedTicket.seats?.join(', ')}</strong></p>
              <p>Amount Paid: <strong>₹{selectedTicket.finalAmount}</strong></p>
            </div>

            <button
              onClick={() => handleDownloadPDF(selectedTicket)}
              className="w-full py-3 rounded-2xl bg-cyan-500 text-black font-bold text-xs glow-cyan flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4 stroke-[2.5]" /> Download PDF Ticket
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
