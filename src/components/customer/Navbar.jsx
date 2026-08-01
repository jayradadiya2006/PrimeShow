import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, MapPin, User, LogOut, Ticket, Heart, Award, Settings, 
  Menu, X, Sparkles, Shield, ChevronDown, Film, Calendar, Gift, 
  Briefcase, Percent, Moon, Sun, Bell, HelpCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useBooking } from '../../context/BookingContext';
import { useTheme } from '../../context/ThemeContext';
import API from '../../services/api';

const navItems = [
  { name: 'Movies', path: '/movies', icon: Film },
  { name: 'Theatres', path: '/theatres', icon: MapPin },
  { name: 'Events', path: '/events', icon: Calendar },
  { name: 'Plays', path: '/plays', icon: Sparkles },
  { name: 'Activities', path: '/activities', icon: Ticket },
  { name: 'Offers', path: '/offers', icon: Percent },
  { name: 'Gift Cards', path: '/gift-cards', icon: Gift },
  { name: 'Corporate', path: '/corporate', icon: Briefcase },
];

const cities = ["Mumbai", "Delhi NCR", "Bengaluru", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad"];

export default function Navbar() {
  const { user, logout, setAuthModalOpen, isAdmin } = useAuth();
  const { selectedCity, setSelectedCity } = useBooking();
  const { theme, toggleTheme, isDark } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [cityModalOpen, setCityModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      API.get(`/movies?search=${encodeURIComponent(searchQuery)}`)
        .then(res => {
          setSearchResults(res.data || []);
          setShowSearchDropdown(true);
        })
        .catch(() => setShowSearchDropdown(false));
    } else {
      setShowSearchDropdown(false);
    }
  }, [searchQuery]);

  const handleSelectMovie = (movieId) => {
    setShowSearchDropdown(false);
    setSearchQuery('');
    navigate(`/movie/${movieId}`);
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-nav transition-all duration-300">
      {/* TOP PRIMARY NAVBAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* LEFT: BRANDING LOGO */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 flex items-center justify-center glow-cyan transition-transform group-hover:scale-105">
              <Film className="w-6 h-6 text-black stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-3xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-indigo-400 to-purple-400">
                PrimeShow
              </span>
              <span className="text-[10px] tracking-[0.25em] text-cyan-400 font-semibold uppercase -mt-1">
                Luxury Cinema
              </span>
            </div>
          </Link>

          {/* CENTER: PREDICTIVE SEARCH BAR */}
          <div className="hidden md:flex flex-1 max-w-md relative">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search Movies, Cast, Theatres, Events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.length > 1 && setShowSearchDropdown(true)}
                className="w-full pl-11 pr-8 py-2.5 rounded-full text-sm glass-input transition-all placeholder:text-slate-500"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs">✕</button>
              )}
            </div>

            {/* PREDICTIVE SEARCH DROPDOWN */}
            <AnimatePresence>
              {showSearchDropdown && searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-[#0c0d14] border border-cyan-500/20 rounded-2xl shadow-2xl overflow-hidden z-50 backdrop-blur-2xl"
                >
                  <div className="p-2 text-xs font-medium text-slate-400 uppercase tracking-wider px-3 border-b border-white/5">
                    Suggested Titles ({searchResults.length})
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-white/5">
                    {searchResults.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleSelectMovie(item.id)}
                        className="flex items-center gap-3 p-3 hover:bg-cyan-500/10 cursor-pointer transition-colors"
                      >
                        <img src={item.posterUrl} alt={item.title} className="w-10 h-14 object-cover rounded-lg" />
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-white">{item.title}</span>
                          <span className="text-xs text-slate-400">{item.genres?.join(', ')} • {item.certification}</span>
                        </div>
                        <span className="ml-auto text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded-md border border-cyan-500/20">
                          ★ {item.rating}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT CONTROLS: THEME TOGGLE + CITY SELECTOR + SETTINGS / PROFILE */}
          <div className="hidden md:flex items-center gap-3">
            
            {/* THEME TOGGLE BUTTON */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full glass-badge hover:border-cyan-500/50 text-slate-200 transition-all cursor-pointer"
              title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-indigo-400" />}
            </button>

            {/* CITY SELECTOR BUTTON */}
            <button
              onClick={() => setCityModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full glass-badge hover:border-cyan-500/50 text-sm text-slate-200 transition-all cursor-pointer"
            >
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span>{selectedCity}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* SETTINGS MENU TRIGGER */}
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className="p-2.5 rounded-full glass-panel hover:border-cyan-500/40 text-slate-300 transition-all cursor-pointer"
              title="Platform Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* AUTH STATE BUTTON OR PROFILE MENU */}
            {!user ? (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-600 text-black font-semibold text-sm hover:brightness-110 transition-all glow-cyan cursor-pointer"
              >
                Sign In
              </button>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-3 p-1.5 pr-3 rounded-full glass-panel hover:border-cyan-500/40 transition-all cursor-pointer"
                >
                  <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover border border-cyan-400/40" />
                  <span className="text-sm font-medium text-white max-w-[100px] truncate">{user.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* USER DROPDOWN */}
                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-64 bg-[#0c0d14] border border-cyan-500/20 rounded-2xl shadow-2xl p-2 z-50 backdrop-blur-2xl"
                    >
                      <div className="p-3 border-b border-white/10 mb-1">
                        <p className="text-sm font-bold text-white">{user.name}</p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                        {isAdmin && (
                          <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-widest text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
                            Administrator
                          </span>
                        )}
                      </div>

                      <Link to="/profile" onClick={() => setUserDropdownOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm text-slate-200 hover:bg-white/5 rounded-xl transition-colors">
                        <User className="w-4 h-4 text-cyan-400" /> Profile Overview
                      </Link>
                      <Link to="/profile/bookings" onClick={() => setUserDropdownOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm text-slate-200 hover:bg-white/5 rounded-xl transition-colors">
                        <Ticket className="w-4 h-4 text-indigo-400" /> My Bookings
                      </Link>
                      <Link to="/profile/wishlist" onClick={() => setUserDropdownOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm text-slate-200 hover:bg-white/5 rounded-xl transition-colors">
                        <Heart className="w-4 h-4 text-pink-400" /> Wishlist
                      </Link>
                      <Link to="/profile/rewards" onClick={() => setUserDropdownOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm text-slate-200 hover:bg-white/5 rounded-xl transition-colors">
                        <Award className="w-4 h-4 text-amber-400" /> Rewards & Points
                      </Link>
                      
                      {isAdmin && (
                        <Link to="/admin" onClick={() => setUserDropdownOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm font-semibold text-cyan-300 hover:bg-cyan-500/20 rounded-xl transition-colors my-1 border border-cyan-500/30">
                          <Shield className="w-4 h-4 text-cyan-400" /> Admin Dashboard
                        </Link>
                      )}

                      <div className="border-t border-white/10 my-1 pt-1">
                        <button
                          onClick={() => { setUserDropdownOpen(false); logout(); }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* MOBILE HAMBURGER TOGGLE */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl glass-panel text-slate-200 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* SECONDARY LIQUID NAVIGATION BAR */}
      <div className="hidden md:block border-t border-white/5 bg-black/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-center space-x-1 py-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                    isActive ? 'text-cyan-300 font-bold' : 'text-slate-400 hover:text-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                  {isActive && (
                    <motion.div
                      layoutId="navPill"
                      className="absolute inset-0 bg-cyan-500/15 border border-cyan-500/30 rounded-full -z-10"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* SETTINGS DRAWER MODAL */}
      <AnimatePresence>
        {settingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-[#0c0d14] border border-cyan-500/30 rounded-3xl p-6 shadow-2xl space-y-6 relative"
            >
              <button
                onClick={() => setSettingsOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <Settings className="w-6 h-6 text-cyan-400" />
                <h3 className="font-serif text-2xl font-bold text-white">Platform Settings</h3>
              </div>

              <div className="space-y-4 text-xs">
                {/* THEME TOGGLE OPTION */}
                <div className="flex items-center justify-between p-3 rounded-2xl glass-panel">
                  <div className="flex items-center gap-2">
                    {isDark ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
                    <span className="font-bold text-white">Interface Theme Mode</span>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className="px-4 py-1.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30"
                  >
                    {isDark ? 'Dark Mode' : 'Light Mode'}
                  </button>
                </div>

                {/* NOTIFICATIONS TOGGLE */}
                <div className="flex items-center justify-between p-3 rounded-2xl glass-panel">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-cyan-400" />
                    <span className="font-bold text-white">Push Notifications</span>
                  </div>
                  <button
                    onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                    className={`px-4 py-1.5 rounded-full font-bold transition-all ${
                      notificationsEnabled ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {notificationsEnabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>

                {/* QUICK LINKS */}
                <Link
                  to="/profile/wishlist"
                  onClick={() => setSettingsOpen(false)}
                  className="flex items-center justify-between p-3 rounded-2xl glass-panel text-slate-200 hover:border-cyan-500/30"
                >
                  <span className="flex items-center gap-2"><Heart className="w-4 h-4 text-pink-400" /> Saved Wishlist</span>
                  <ChevronDown className="w-4 h-4 -rotate-90 text-slate-500" />
                </Link>

                <Link
                  to="/offers"
                  onClick={() => setSettingsOpen(false)}
                  className="flex items-center justify-between p-3 rounded-2xl glass-panel text-slate-200 hover:border-cyan-500/30"
                >
                  <span className="flex items-center gap-2"><Percent className="w-4 h-4 text-emerald-400" /> Offers & Discounts</span>
                  <ChevronDown className="w-4 h-4 -rotate-90 text-slate-500" />
                </Link>

                {!user && (
                  <button
                    onClick={() => { setSettingsOpen(false); setAuthModalOpen(true); }}
                    className="w-full py-3 rounded-2xl bg-cyan-500 text-black font-bold text-sm glow-cyan"
                  >
                    Sign In / Register Account
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CITY SELECTION MODAL */}
      <AnimatePresence>
        {cityModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg bg-[#0c0d14] border border-cyan-500/30 rounded-3xl p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setCityModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="font-serif text-2xl text-white mb-2">Select Your City</h3>
              <p className="text-xs text-slate-400 mb-6">Choose location to customize showtimes and nearby multiplexes.</p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {cities.map((city) => (
                  <button
                    key={city}
                    onClick={() => { setSelectedCity(city); setCityModalOpen(false); }}
                    className={`p-3 rounded-2xl text-center text-sm font-semibold transition-all border cursor-pointer ${
                      selectedCity === city
                        ? 'bg-cyan-500 text-black border-cyan-400 font-bold glow-cyan'
                        : 'glass-panel text-slate-300 hover:border-cyan-500/40 hover:text-white'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MOBILE GLASS SLIDING HAMBURGER MENU */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#050508]/95 border-b border-cyan-500/20 backdrop-blur-2xl overflow-hidden"
          >
            <div className="p-4 space-y-3">
              <button
                onClick={() => { setCityModalOpen(true); setMobileMenuOpen(false); }}
                className="w-full flex items-center justify-between p-3 rounded-xl glass-panel text-slate-200"
              >
                <span className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-cyan-400" /> City: <strong>{selectedCity}</strong>
                </span>
                <ChevronDown className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-2 gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 p-3 rounded-xl glass-panel text-sm text-slate-200 hover:border-cyan-500/40"
                  >
                    <item.icon className="w-4 h-4 text-cyan-400" />
                    <span>{item.name}</span>
                  </Link>
                ))}
              </div>

              {!user ? (
                <button
                  onClick={() => { setAuthModalOpen(true); setMobileMenuOpen(false); }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-black font-bold text-sm"
                >
                  Sign In / Register
                </button>
              ) : (
                <div className="p-3 glass-panel rounded-xl space-y-2">
                  <p className="text-xs text-slate-400">Signed in as <strong>{user.email}</strong></p>
                  <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-cyan-400 font-semibold">
                    My Account Suite →
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
