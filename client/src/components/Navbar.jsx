import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Search, MapPin, User, LogOut, Ticket, Heart, Award, 
  Settings, Menu, X, Film, Sparkles, ChevronDown, Gift, Building2, Tag, PlaySquare, Bell, HelpCircle
} from 'lucide-react';

export const Navbar = ({ activeTab, setActiveTab, onOpenAuth, onOpenCityModal }) => {
  const { user, logout, selectedCity, notifications } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const navCategories = [
    { id: 'movies', label: 'Movies', icon: Film },
    { id: 'theatres', label: 'Theatres', icon: PlaySquare },
    { id: 'events', label: 'Events', icon: Sparkles },
    { id: 'plays', label: 'Plays', icon: Ticket },
    { id: 'activities', label: 'Activities', icon: Heart },
    { id: 'offers', label: 'Offers', icon: Tag },
    { id: 'gift-cards', label: 'Gift Cards', icon: Gift },
    { id: 'corporate', label: 'Corporate', icon: Building2 }
  ];

  const searchSuggestions = [
    { title: 'Avatar: Fire and Ash', category: 'IMAX 3D Movie', id: 'mov_1' },
    { title: 'Dune: Part Two', category: 'Dolby Atmos Movie', id: 'mov_2' },
    { title: 'Kalki 2898 AD', category: 'Sci-Fi Blockbuster', id: 'mov_3' },
    { title: 'PVR Director\'s Cut', category: 'Luxury Multiplex', id: 'th_1' },
    { title: 'Coldplay Live', category: 'Concert Event', id: 'ev_1' }
  ].filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()));

  // Close Mobile Drawer & Redirect to Home Page
  const handleCloseDrawerAndRedirectHome = () => {
    setIsMobileDrawerOpen(false);
    setActiveTab('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-[100] w-full max-h-[20vh] transition-all duration-300">
      {/* Top Primary Glass Navbar */}
      <nav className="bg-[#DBCEA5] border-b border-[#c5ba92] px-3 sm:px-4 md:px-8 py-2.5 sm:py-3.5 flex items-center justify-between relative z-[100]">
        
        {/* Left: Brand Logo & Mobile-Compact Brand Name */}
        <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
          <button 
            onClick={() => { setActiveTab('home'); setIsMobileDrawerOpen(false); }}
            className="flex items-center gap-1.5 sm:gap-2.5 text-left group focus:outline-none cursor-pointer"
          >
            {/* Logo Icon: Compact on mobile (w-7 h-7 / text-base), Desktop intact (w-10 h-10 / text-2xl) */}
            <div className="w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg sm:rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-200 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform duration-300">
              <span className="text-black font-black text-base sm:text-xl md:text-2xl font-sans">P</span>
            </div>
            <div>
              {/* Brand Text: Compact on mobile (text-base sm:text-xl), Desktop intact (text-2xl md:text-3xl) */}
              <span className="text-base sm:text-xl md:text-3xl font-bold font-sans tracking-wide bg-gradient-to-r from-amber-600 via-amber-700 to-amber-900 dark:from-amber-200 dark:via-amber-400 dark:to-amber-100 bg-clip-text text-transparent">
                PrimeShow
              </span>
              <span className="hidden sm:inline-block block text-[9px] sm:text-[10px] tracking-widest text-amber-700 dark:text-amber-400/80 uppercase font-sans font-semibold">
                Ultra Luxury Cinema
              </span>
            </div>
          </button>

          {/* Desktop Location Pin City Selector Button */}
          <button
            onClick={onOpenCityModal}
            className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-400 hover:border-[#D90000] hover:bg-slate-50 transition-all text-xs font-black text-slate-900 cursor-pointer shadow-xs group"
            title="Click to switch city"
          >
            <MapPin className="w-4 h-4 text-[#D90000] group-hover:scale-110 transition-transform fill-[#D90000]/20" />
            <span className="text-slate-900 font-extrabold">{selectedCity || 'Surat'}</span>
            <ChevronDown className="w-3 h-3 text-slate-700 group-hover:text-[#D90000] transition-colors" />
          </button>
        </div>

        {/* Center: Global Live Predictive Search Bar (Desktop View Intact) */}
        <div className="relative hidden md:block w-full max-w-md mx-6">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-slate-700" />
            <input
              type="text"
              placeholder="Search movies, multiplexes, events, actors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-full bg-white border border-slate-400 text-slate-900 font-medium placeholder-slate-600 focus:border-[#D90000] focus:ring-1 focus:ring-[#D90000] focus:outline-none shadow-xs"
            />
          </div>

          {/* Desktop Search Suggestions Dropdown */}
          {isSearchFocused && searchQuery.length > 0 && (
            <div className="absolute left-0 right-0 top-12 glass-modal rounded-2xl p-3 border border-amber-500/30 shadow-2xl z-[100]">
              <div className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 px-3 py-1 uppercase tracking-wider">
                Live Search Suggestions
              </div>
              {searchSuggestions.length > 0 ? (
                searchSuggestions.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setActiveTab('movies');
                      setSearchQuery('');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 flex items-center justify-between group transition-colors cursor-pointer"
                  >
                    <span className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-300">{item.title}</span>
                    <span className="text-xs text-slate-500 dark:text-white/40">{item.category}</span>
                  </button>
                ))
              ) : (
                <div className="px-3 py-2 text-xs text-slate-500 dark:text-white/50">No matches found</div>
              )}
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Mobile Search Toggle Icon */}
          <button
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            className="md:hidden p-2 rounded-full bg-slate-200/60 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/15 border border-slate-300 dark:border-white/10 text-slate-800 dark:text-white/80 transition-all cursor-pointer"
            title="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Desktop Settings Dropdown (hidden on mobile, moved into Mobile Drawer) */}
          <div className="relative hidden md:block z-[100]">
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="p-2.5 rounded-full bg-slate-200/60 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/15 border border-slate-300 dark:border-white/10 text-slate-800 dark:text-white/80 transition-all cursor-pointer"
              title="Settings & Menu"
            >
              <Settings className="w-4 h-4" />
            </button>

            {isSettingsOpen && (
              <div 
                className="absolute right-0 top-12 w-64 glass-modal rounded-2xl p-2 border border-slate-300 dark:border-white/15 shadow-2xl z-[100] text-xs animate-fade-in"
                onMouseLeave={() => setIsSettingsOpen(false)}
              >
                <div className="px-3 py-2 border-b border-slate-200 dark:border-white/10 font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider text-[10px]">
                  Account & Settings Menu
                </div>

                {user ? (
                  <div className="p-2 mb-1 rounded-xl bg-amber-500/10 border border-amber-400/20">
                    <div className="flex items-center gap-2.5 px-1 py-1">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-black font-extrabold flex items-center justify-center text-xs shrink-0 shadow-md">
                        {user.email ? user.email.charAt(0).toUpperCase() : (user.name ? user.name.charAt(0).toUpperCase() : 'U')}
                      </div>
                      <div className="truncate flex-1 min-w-0">
                        <div className="font-bold text-slate-900 dark:text-white truncate text-xs">{user.name || 'Member'}</div>
                        <div className="text-[11px] text-amber-600 dark:text-amber-300 font-mono truncate">{user.email || user.phone || 'Firebase User'}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => { logout(); setIsSettingsOpen(false); setActiveTab('home'); }}
                      className="mt-2 w-full text-left px-3 py-1.5 rounded-lg text-rose-600 dark:text-rose-300 hover:bg-rose-500/20 font-bold flex items-center gap-2 transition-colors cursor-pointer text-xs"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
                      <span>Logout ({user.email ? (user.email.length > 16 ? user.email.slice(0, 14) + '...' : user.email) : 'Account'})</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { onOpenAuth(); setIsSettingsOpen(false); }}
                    className="w-full text-left px-3 py-2.5 mb-1 rounded-xl text-slate-800 dark:text-white hover:bg-amber-500/20 hover:text-amber-600 dark:hover:text-amber-300 font-bold flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <User className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                    <span>Login / Register (Email & OTP)</span>
                  </button>
                )}

                {user && (
                  <button
                    onClick={() => { setActiveTab('profile-info'); setIsSettingsOpen(false); }}
                    className="w-full text-left px-3 py-2 rounded-xl text-slate-700 dark:text-white/80 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 flex items-center gap-2.5 cursor-pointer"
                  >
                    <User className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                    <span>My Personal Details</span>
                  </button>
                )}

                <button
                  onClick={() => { setActiveTab('profile-wishlist'); setIsSettingsOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-xl text-slate-700 dark:text-white/80 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 flex items-center gap-2.5 cursor-pointer"
                >
                  <Heart className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                  <span>Wishlist</span>
                </button>

                <button
                  onClick={() => { setActiveTab('profile-rewards'); setIsSettingsOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-xl text-slate-700 dark:text-white/80 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 flex items-center gap-2.5 cursor-pointer"
                >
                  <Award className="w-4 h-4 text-amber-500 dark:text-amber-300" />
                  <span>Rewards & Wallet</span>
                </button>

                <button
                  onClick={() => { setActiveTab('profile-support'); setIsSettingsOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-xl text-slate-700 dark:text-white/80 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 flex items-center gap-2.5 cursor-pointer"
                >
                  <HelpCircle className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
                  <span>Customer Support 24/7</span>
                </button>
              </div>
            )}
          </div>

          {/* Desktop User Account / Profile Avatar Button (hidden on mobile) */}
          <div className="hidden md:block">
            {!user ? (
              <button
                onClick={onOpenAuth}
                className="px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-black font-extrabold text-xs shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span>Login / Register</span>
              </button>
            ) : (
              <button
                onClick={() => setActiveTab('profile-info')}
                className="flex items-center p-1 rounded-full bg-slate-200/60 dark:bg-white/5 border border-slate-300 dark:border-white/10 hover:border-amber-500 dark:hover:border-amber-400/50 transition-all group cursor-pointer"
                title="View Profile"
              >
                <img
                  src={user.avatar || user.profilePicture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border border-amber-400/60 group-hover:scale-105 transition-transform"
                />
              </button>
            )}
          </div>

          {/* Mobile Hamburger / Three-Lines Menu Icon (☰) */}
          <button
            onClick={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
            className="md:hidden p-2.5 rounded-xl bg-slate-200/80 dark:bg-white/10 text-slate-900 dark:text-white border border-slate-300 dark:border-white/15 cursor-pointer transition-all hover:bg-slate-300 dark:hover:bg-white/20 active:scale-95 flex items-center justify-center"
            aria-label="Open Mobile Menu Drawer"
            title="Menu Options"
          >
            {isMobileDrawerOpen ? (
              <X className="w-5 h-5 text-amber-500 dark:text-amber-400" />
            ) : (
              <Menu className="w-5 h-5 text-amber-500 dark:text-amber-400" />
            )}
          </button>

        </div>
      </nav>

      {/* Expandable Mobile Search Bar (md:hidden) */}
      {isMobileSearchOpen && (
        <div className="md:hidden glass-panel border-b border-slate-300 dark:border-white/10 px-4 py-3 animate-fade-in relative z-[95]">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-slate-400 dark:text-white/40" />
            <input
              type="text"
              autoFocus
              placeholder="Search movies, theatres, events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2 text-xs rounded-full glass-input text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-white/40"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 text-slate-400">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Mobile Search Results */}
          {searchQuery.length > 0 && (
            <div className="mt-2 glass-modal rounded-2xl p-2 border border-amber-500/30 max-h-60 overflow-y-auto">
              {searchSuggestions.length > 0 ? (
                searchSuggestions.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setActiveTab('movies');
                      setSearchQuery('');
                      setIsMobileSearchOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 flex items-center justify-between text-xs"
                  >
                    <span className="font-semibold text-slate-900 dark:text-white">{item.title}</span>
                    <span className="text-[10px] text-amber-500">{item.category}</span>
                  </button>
                ))
              ) : (
                <div className="px-3 py-2 text-xs text-slate-500 dark:text-white/50">No matches found</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Mobile Slide-Out Drawer (Sidebar Menu) - Opens from Right */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-[150] md:hidden flex justify-end bg-black/70 backdrop-blur-md animate-fade-in">
          
          {/* Slide-out Drawer Panel */}
          <div className="w-4/5 max-w-xs h-full bg-[#D7D3BF] border-l border-[#C1BAA1] p-5 shadow-2xl flex flex-col justify-between overflow-y-auto z-[160] animate-slide-left">
            
            {/* Top Bar with Visible Cross (✕) Icon - No separate logo inside drawer */}
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Navigation Menu</span>
                
                {/* Visible Cross (✕) Icon: Closes drawer AND redirects automatically to Home Page */}
                <button
                  onClick={handleCloseDrawerAndRedirectHome}
                  className="p-2 rounded-full bg-white/10 hover:bg-rose-500/20 text-white hover:text-rose-400 transition-all cursor-pointer"
                  title="Close & Go to Home Page"
                  aria-label="Close Drawer and Return to Home Page"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Strictly 3 Navigation Options Inside Drawer */}
              <div className="space-y-3">
                
                {/* 1. City Selection */}
                <button
                  onClick={() => {
                    onOpenCityModal();
                    setIsMobileDrawerOpen(false);
                  }}
                  className="w-full text-left p-3.5 rounded-2xl bg-white/5 hover:bg-amber-500/20 border border-white/10 hover:border-amber-400/50 flex items-center justify-between text-white font-bold text-sm transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <span>City Selection</span>
                      <div className="text-[11px] font-normal text-amber-400">{selectedCity}</div>
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-white/40 -rotate-90" />
                </button>

                {/* 2. Profile / Login */}
                <button
                  onClick={() => {
                    if (user) {
                      setActiveTab('profile-info');
                    } else {
                      onOpenAuth();
                    }
                    setIsMobileDrawerOpen(false);
                  }}
                  className="w-full text-left p-3.5 rounded-2xl bg-white/5 hover:bg-purple-500/20 border border-white/10 hover:border-purple-400/50 flex items-center justify-between text-white font-bold text-sm transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <span>{user ? 'My Profile' : 'Login / Register'}</span>
                      <div className="text-[11px] font-normal text-white/50">{user ? user.name : 'Sign In or Create Account'}</div>
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-white/40 -rotate-90" />
                </button>

                {/* 3. Settings */}
                <button
                  onClick={() => {
                    setActiveTab('settings');
                    setIsMobileDrawerOpen(false);
                  }}
                  className="w-full text-left p-3.5 rounded-2xl bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-400/50 flex items-center justify-between text-white font-bold text-sm transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                      <Settings className="w-5 h-5" />
                    </div>
                    <div>
                      <span>Settings</span>
                      <div className="text-[11px] font-normal text-white/50">Preferences & Theme</div>
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-white/40 -rotate-90" />
                </button>

              </div>
            </div>

            {/* Bottom Drawer Actions */}
            <div className="pt-6 border-t border-white/10 space-y-3">
              {user ? (
                <button
                  onClick={() => {
                    logout();
                    handleCloseDrawerAndRedirectHome();
                  }}
                  className="w-full py-3 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-300 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <LogOut className="w-4 h-4 text-rose-400" />
                  <span>Sign Out</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    onOpenAuth();
                    setIsMobileDrawerOpen(false);
                  }}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer transition-all"
                >
                  <User className="w-4 h-4" />
                  <span>Sign In / Register</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Secondary Category Navigation Bar (Hidden on Movie Details page as requested) */}
      {activeTab !== 'movie-detail' && (
        <div className="bg-[#3E322A] backdrop-blur-md border-b border-[#2C231C] px-2.5 sm:px-4 md:px-8 py-1.5 sm:py-2.5 overflow-x-auto scrollbar-none flex items-center gap-1.5 sm:gap-2 md:gap-3 z-40 text-white">
          {navCategories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeTab === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-extrabold transition-all flex items-center gap-1.5 sm:gap-2 shrink-0 cursor-pointer tracking-wide ${
                  isActive
                    ? 'bg-[#D90000] text-white font-black shadow-lg shadow-red-500/30'
                    : 'text-white font-extrabold hover:text-amber-300 hover:bg-white/10'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isActive ? 'text-white' : 'text-amber-400'}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
