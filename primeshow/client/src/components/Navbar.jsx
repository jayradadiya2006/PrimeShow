import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Search, MapPin, User, LogOut, Ticket, Heart, Award, 
  Settings, Menu, X, Film, Sparkles, ChevronDown, Gift, Building2, Tag, PlaySquare, Bell, HelpCircle, Shield
} from 'lucide-react';

export const Navbar = ({ activeTab, setActiveTab, onOpenAuth, onOpenCityModal }) => {
  const { user, logout, selectedCity } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  return (
    <header className="sticky top-0 z-[100] w-full transition-all duration-300">
      {/* Top Primary Glass Navbar */}
      <nav className="glass-panel border-b border-slate-300 dark:border-white/10 px-4 md:px-8 py-3.5 flex items-center justify-between relative z-[100]">
        
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2.5 text-left group focus:outline-none cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-200 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform duration-300">
              <span className="text-black font-black text-2xl font-sans">P</span>
            </div>
            <div>
              <span className="text-2xl md:text-3xl font-bold font-sans tracking-wide bg-gradient-to-r from-amber-600 via-amber-700 to-amber-900 dark:from-amber-200 dark:via-amber-400 dark:to-amber-100 bg-clip-text text-transparent">
                PrimeShow
              </span>
              <span className="hidden sm:inline-block block text-[10px] tracking-widest text-amber-700 dark:text-amber-400/80 uppercase font-sans font-semibold">
                Ultra Luxury Cinema
              </span>
            </div>
          </button>

          {/* City Selector Button */}
          <button
            onClick={onOpenCityModal}
            className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-200/60 dark:bg-white/5 border border-slate-300 dark:border-white/10 hover:border-amber-500 dark:hover:border-amber-400/50 hover:bg-slate-200 dark:hover:bg-white/10 transition-all text-xs font-medium text-amber-800 dark:text-amber-200 cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>{selectedCity}</span>
            <ChevronDown className="w-3 h-3 text-slate-500 dark:text-white/50" />
          </button>
        </div>

        {/* Center: Global Live Predictive Search Bar */}
        <div className="relative hidden md:block w-full max-w-md mx-6">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-slate-400 dark:text-white/40" />
            <input
              type="text"
              placeholder="Search movies, multiplexes, events, actors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-full glass-input text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-white/40"
            />
          </div>

          {/* Live Search Suggestions Dropdown */}
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
        <div className="flex items-center gap-3">
          
          {/* Settings Menu Dropdown with Z-100 Stacking Context */}
          <div className="relative z-[100]">
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

                {!user ? (
                  <button
                    onClick={() => { onOpenAuth(); setIsSettingsOpen(false); }}
                    className="w-full text-left px-3 py-2 rounded-xl text-slate-800 dark:text-white hover:bg-amber-500/20 hover:text-amber-600 dark:hover:text-amber-300 font-bold flex items-center gap-2.5 cursor-pointer"
                  >
                    <User className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                    <span>Login / Register</span>
                  </button>
                ) : (
                  <button
                    onClick={() => { logout(); setIsSettingsOpen(false); setActiveTab('home'); }}
                    className="w-full text-left px-3 py-2 rounded-xl text-rose-600 dark:text-rose-300 hover:bg-rose-500/20 font-bold flex items-center gap-2.5 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                    <span>Sign Out</span>
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
                  onClick={() => { setActiveTab('profile-notifications'); setIsSettingsOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-xl text-slate-700 dark:text-white/80 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 flex items-center gap-2.5 cursor-pointer"
                >
                  <Bell className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                  <span>Notifications</span>
                </button>

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

          {/* User Account / Profile CTA Button */}
          {!user ? (
            <button
              onClick={onOpenAuth}
              className="px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-black font-extrabold text-xs shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('profile-info')}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-200/60 dark:bg-white/5 border border-slate-300 dark:border-white/10 hover:border-amber-500 dark:hover:border-amber-400/40 transition-all group cursor-pointer"
            >
              <img
                src={user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"}
                alt={user.name}
                className="w-7 h-7 rounded-full object-cover border border-amber-400/50"
              />
              <span className="hidden md:inline-block text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-300">
                {user.name.split(' ')[0]}
              </span>
            </button>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2.5 rounded-xl glass-panel text-slate-900 dark:text-white"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

        </div>
      </nav>

      {/* Secondary Category Navigation Bar */}
      <div className="bg-slate-200/90 dark:bg-[#07090e]/90 backdrop-blur-md border-b border-slate-300/80 dark:border-white/5 px-4 md:px-8 py-2 overflow-x-auto scrollbar-none flex items-center gap-2 md:gap-3 z-40">
        {navCategories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeTab === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300/50 dark:hover:bg-white/10'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-amber-600 dark:text-amber-400'}`} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
