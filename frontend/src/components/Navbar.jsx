import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import API from '../services/api';
import { 
  Search, MapPin, User, LogOut, Ticket, Heart, Award, 
  Settings, Menu, X, Film, Sparkles, ChevronDown, Gift, Building2, Tag, PlaySquare, Bell, HelpCircle,
  Loader2, ChevronRight
} from 'lucide-react';

// Header Movie Image Thumbnails (Spider-Man No Way Home default + fallback URLs)
export const HEADER_MOVIE_THUMBNAILS = [
  "https://www.androidauthority.com/wp-content/uploads/2021/12/spider-man-no-way-home-1.jpg",
  "https://i.ytimg.com/vi/5vMWZhHPlaw/maxresdefault.jpg",
  "https://assets-in.bmscdn.com/iedb/movies/images/mobile/listing/medium/dhamaal-4-et00452553-1783600284.jpg",
  "https://mykinoplex.com/media/bdc8eb75-d1b-4853365e10.webp",
  "https://timesofindia.indiatimes.com/thumb/msid-130320231,width-1280,height-720,resizemode-4/130320231.jpg"
];

export const Navbar = ({ 
  activeTab, 
  setActiveTab, 
  onOpenAuth, 
  onOpenCityModal,
  searchQuery = '',
  setSearchQuery,
  onSearchSubmit,
  onSelectMovie,
  onSelectTheatre,
  onSelectEvent
}) => {
  const { user, logout, selectedCity, notifications } = useAuth();
  const { moviesList = [], theatresList = [], upcomingMoviesList = [] } = useBooking();
  
  const [internalQuery, setInternalQuery] = useState(searchQuery || '');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [apiSuggestions, setApiSuggestions] = useState([]);
  const [isSearchingApi, setIsSearchingApi] = useState(false);

  const desktopSearchRef = useRef(null);
  const mobileSearchRef = useRef(null);

  // Sync internal query when parent prop changes
  useEffect(() => {
    if (searchQuery !== undefined) {
      setInternalQuery(searchQuery);
    }
  }, [searchQuery]);

  const currentQuery = searchQuery !== undefined ? searchQuery : internalQuery;
  const updateQuery = (val) => {
    setInternalQuery(val);
    if (setSearchQuery) setSearchQuery(val);
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (desktopSearchRef.current && !desktopSearchRef.current.contains(e.target)) {
        setIsSearchFocused(false);
      }
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(e.target) && !e.target.closest('[data-mobile-search-toggle]')) {
        // Keep mobile search bar open unless user clicks outside of header
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  // 1. Instant local suggestions from active context data (0ms latency)
  const localSuggestions = useMemo(() => {
    const q = currentQuery.trim().toLowerCase();
    if (!q) return [];
    
    const results = [];
    
    // Movies
    (moviesList || []).forEach(m => {
      const titleMatch = m.title?.toLowerCase().includes(q);
      const genreMatch = m.genre?.toLowerCase().includes(q) || (Array.isArray(m.genres) && m.genres.some(g => g.toLowerCase().includes(q)));
      const langMatch = m.language?.toLowerCase().includes(q) || (Array.isArray(m.languages) && m.languages.some(l => l.toLowerCase().includes(q)));
      const castMatch = typeof m.cast === 'string' ? m.cast.toLowerCase().includes(q) : Array.isArray(m.cast) && m.cast.some(c => (c.name || c).toLowerCase().includes(q));

      if (titleMatch || genreMatch || langMatch || castMatch) {
        results.push({
          id: m.id || m._id,
          type: 'movie',
          title: m.title,
          category: 'Movie',
          subtitle: `${Array.isArray(m.languages) ? m.languages.join(', ') : (m.language || 'Hindi')} • ${Array.isArray(m.genres) ? m.genres.join(', ') : (m.genre || 'Action')}`,
          image: m.poster || m.image || m.banner
        });
      }
    });

    // Theatres
    (theatresList || []).forEach(t => {
      if (t.name?.toLowerCase().includes(q) || t.city?.toLowerCase().includes(q) || t.address?.toLowerCase().includes(q)) {
        results.push({
          id: t.id || t._id,
          type: 'theatre',
          title: t.name,
          category: 'Multiplex',
          subtitle: `${t.city || 'Cinema'} • ${t.address || t.location || 'Theatre'}`,
          image: t.image || t.photo || 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=400&q=80'
        });
      }
    });

    // Upcoming Movies
    (upcomingMoviesList || []).forEach(u => {
      if (u.title?.toLowerCase().includes(q) || (Array.isArray(u.genres) && u.genres.some(g => g.toLowerCase().includes(q)))) {
        results.push({
          id: u.id || u._id,
          type: 'upcoming',
          title: u.title,
          category: 'Upcoming',
          subtitle: `${u.release || 'Coming Soon'} • ${Array.isArray(u.genres) ? u.genres.join(', ') : 'Blockbuster'}`,
          image: u.poster || u.image
        });
      }
    });

    return results.slice(0, 8);
  }, [currentQuery, moviesList, theatresList, upcomingMoviesList]);

  // 2. Debounced API search to fetch fresh/backend entries (events, plays, activities, new movies)
  useEffect(() => {
    const q = currentQuery.trim();
    if (q.length < 2) {
      setApiSuggestions([]);
      setIsSearchingApi(false);
      return;
    }

    let isCurrent = true;
    setIsSearchingApi(true);

    const timer = setTimeout(async () => {
      try {
        const res = await API.get('/search', { params: { q, city: selectedCity } });
        if (isCurrent && res.data && Array.isArray(res.data.results)) {
          setApiSuggestions(res.data.results.slice(0, 8));
        }
      } catch (_) {
      } finally {
        if (isCurrent) setIsSearchingApi(false);
      }
    }, 250);

    return () => {
      isCurrent = false;
      clearTimeout(timer);
    };
  }, [currentQuery, selectedCity]);

  // Combine and deduplicate suggestions
  const displaySuggestions = useMemo(() => {
    const map = new Map();
    localSuggestions.forEach(item => map.set(item.id || item.title, item));
    apiSuggestions.forEach(item => {
      if (!map.has(item.id || item.title)) {
        map.set(item.id || item.title, item);
      }
    });
    return Array.from(map.values()).slice(0, 6);
  }, [localSuggestions, apiSuggestions]);

  // Form submission handler
  const handleSearchSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const clean = currentQuery.trim();
    if (!clean) return;

    setIsSearchFocused(false);
    setIsMobileSearchOpen(false);

    if (onSearchSubmit) {
      onSearchSubmit(clean);
    } else {
      setActiveTab('search');
    }
  };

  // Clicking an individual suggestion
  const handleSelectSuggestion = (item) => {
    setIsSearchFocused(false);
    setIsMobileSearchOpen(false);

    if (item.type === 'movie') {
      if (onSelectMovie) onSelectMovie(item.id);
      else setActiveTab('movies');
    } else if (item.type === 'theatre') {
      if (onSelectTheatre) onSelectTheatre(item.id);
      else setActiveTab('theatres');
    } else if (item.type === 'event') {
      if (onSelectEvent) onSelectEvent(item.id);
      else setActiveTab('events');
    } else if (item.type === 'play') {
      setActiveTab('plays');
    } else if (item.type === 'activity') {
      setActiveTab('activities');
    } else if (item.type === 'upcoming') {
      setActiveTab('movies');
    } else {
      handleSearchSubmit();
    }
  };

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
            <div className="w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg sm:rounded-xl bg-[#D90000] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300">
              <span className="text-white font-black text-base sm:text-xl md:text-2xl font-sans">P</span>
            </div>
            <div>
              {/* Brand Text: High-contrast Dark Brown text */}
              <span className="text-base sm:text-xl md:text-3xl font-black font-sans tracking-wide text-[#3B1E08] drop-shadow-xs">
                PrimeShow
              </span>
              <span className="hidden sm:inline-block block text-[9px] sm:text-[10px] tracking-widest text-[#3B1E08] uppercase font-sans font-bold">
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

        {/* Center: Global Live Predictive Search Bar (Desktop View) */}
        <div ref={desktopSearchRef} className="relative hidden md:block w-full max-w-md mx-6">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full">
            <button
              type="submit"
              className="absolute left-3.5 text-slate-700 hover:text-[#D90000] transition-colors cursor-pointer flex items-center justify-center"
              title="Search"
            >
              <Search className="w-4 h-4" />
            </button>
            <input
              type="text"
              placeholder="Search movies, multiplexes, events, actors..."
              value={currentQuery}
              onChange={(e) => {
                updateQuery(e.target.value);
                setIsSearchFocused(true);
              }}
              onFocus={() => setIsSearchFocused(true)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setIsSearchFocused(false);
              }}
              className="w-full pl-10 pr-20 py-2 text-sm rounded-full bg-white border border-slate-400 text-slate-900 font-medium placeholder-slate-600 focus:border-[#D90000] focus:ring-1 focus:ring-[#D90000] focus:outline-none shadow-xs transition-all"
            />
            
            <div className="absolute right-2.5 flex items-center gap-1">
              {isSearchingApi && (
                <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin mr-0.5" />
              )}
              {currentQuery && (
                <button
                  type="button"
                  onClick={() => {
                    updateQuery('');
                    setIsSearchFocused(false);
                  }}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer mr-0.5"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="submit"
                className="px-2.5 py-0.5 rounded-full bg-[#D90000] hover:bg-red-700 text-white text-xs font-black shadow-xs transition-all cursor-pointer"
                title="Search"
              >
                Go
              </button>
            </div>
          </form>

          {/* Desktop Search Suggestions Dropdown */}
          {isSearchFocused && currentQuery.trim().length > 0 && (
            <div className="absolute left-0 right-0 top-12 bg-white rounded-2xl p-2.5 border border-slate-300 shadow-2xl z-[110] animate-fade-in">
              <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-800 px-3 py-1 uppercase tracking-wider border-b border-slate-100 mb-1">
                <span>Live Search Results</span>
                <span className="text-[10px] text-slate-500 font-normal">Press Enter to view all</span>
              </div>
              
              {displaySuggestions.length > 0 ? (
                <div className="max-h-72 overflow-y-auto space-y-1">
                  {displaySuggestions.map((item, idx) => (
                    <button
                      key={item.id || idx}
                      type="button"
                      onClick={() => handleSelectSuggestion(item)}
                      className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-slate-100 flex items-center gap-3 group transition-colors cursor-pointer"
                    >
                      <div className="w-9 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                        <img 
                          src={item.image || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=150&q=80"}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=150&q=80";
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#D90000] truncate">
                            {item.title}
                          </span>
                          <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-sm bg-red-50 text-[#D90000] border border-red-200 shrink-0">
                            {item.category || item.type}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-medium truncate block">
                          {item.subtitle}
                        </span>
                      </div>
                    </button>
                  ))}
                  
                  {/* Footer Action to view all search results */}
                  <button
                    type="button"
                    onClick={handleSearchSubmit}
                    className="w-full mt-1.5 pt-2 border-t border-slate-100 text-center py-1.5 text-xs font-black text-[#D90000] hover:bg-red-50 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span>View all matching results for "{currentQuery}"</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="px-3 py-4 text-center">
                  <p className="text-xs text-slate-600 font-semibold mb-2">No direct matches found for "{currentQuery}"</p>
                  <button
                    type="button"
                    onClick={handleSearchSubmit}
                    className="text-xs font-black text-[#D90000] hover:underline cursor-pointer"
                  >
                    Click to search all categories & archives →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3 header-profile-area">
          
          {/* Mobile Search Toggle Icon */}
          <button
            data-mobile-search-toggle="true"
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            className="md:hidden p-2 rounded-full bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 transition-all cursor-pointer"
            title="Search"
          >
            <Search className="w-4 h-4 text-slate-900" />
          </button>

          {/* Desktop Settings Dropdown (hidden on mobile, moved into Mobile Drawer) */}
          <div className="relative hidden md:block z-[100]">
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="p-2.5 rounded-full bg-white border border-slate-300 text-slate-900 hover:bg-slate-100 transition-all cursor-pointer shadow-xs"
              title="Settings & Menu"
            >
              <Settings className="w-4 h-4 text-slate-900" />
            </button>

            {isSettingsOpen && (
              <div 
                className="absolute right-0 top-12 w-64 bg-white rounded-2xl p-2 border border-slate-300 shadow-2xl z-[100] text-xs animate-fade-in text-slate-900"
                onMouseLeave={() => setIsSettingsOpen(false)}
              >
                <div className="px-3 py-2 border-b border-slate-200 font-extrabold text-slate-800 uppercase tracking-wider text-[10px]">
                  Account & Settings Menu
                </div>

                {user ? (
                  <div className="p-2 mb-1.5 rounded-xl bg-slate-100 border border-slate-200">
                    <div className="flex items-center gap-2.5 px-1 py-1">
                      <div className="w-8 h-8 rounded-full bg-[#D90000] text-white font-extrabold flex items-center justify-center text-xs shrink-0 shadow-md">
                        {user.email ? user.email.charAt(0).toUpperCase() : (user.name ? user.name.charAt(0).toUpperCase() : 'U')}
                      </div>
                      <div className="truncate flex-1 min-w-0">
                        <div className="font-extrabold text-slate-900 truncate text-xs">{user.name || 'Member'}</div>
                        <div className="text-[11px] text-slate-700 font-semibold truncate">{user.email || user.phone || 'Firebase User'}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => { logout(); setIsSettingsOpen(false); setActiveTab('home'); }}
                      className="mt-2 w-full text-left px-3 py-1.5 rounded-lg text-[#D90000] hover:bg-red-50 font-bold flex items-center gap-2 transition-colors cursor-pointer text-xs"
                    >
                      <LogOut className="w-3.5 h-3.5 text-[#D90000]" />
                      <span>Logout ({user.email ? (user.email.length > 16 ? user.email.slice(0, 14) + '...' : user.email) : 'Account'})</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { onOpenAuth(); setIsSettingsOpen(false); }}
                    className="w-full text-left px-3 py-2.5 mb-1 rounded-xl text-slate-900 hover:bg-red-50 hover:text-[#D90000] font-bold flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <User className="w-4 h-4 text-[#D90000]" />
                    <span>Login / Register (Email & OTP)</span>
                  </button>
                )}

                {user && (
                  <button
                    onClick={() => { setActiveTab('profile-info'); setIsSettingsOpen(false); }}
                    className="w-full text-left px-3 py-2 rounded-xl text-slate-900 font-bold hover:text-[#D90000] hover:bg-slate-100 flex items-center gap-2.5 cursor-pointer transition-colors"
                  >
                    <User className="w-4 h-4 text-[#D90000]" />
                    <span>My Personal Details</span>
                  </button>
                )}

                <button
                  onClick={() => { setActiveTab('profile-wishlist'); setIsSettingsOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-xl text-slate-900 font-bold hover:text-rose-600 hover:bg-slate-100 flex items-center gap-2.5 cursor-pointer transition-colors"
                >
                  <Heart className="w-4 h-4 text-rose-600" />
                  <span>Wishlist</span>
                </button>

                <button
                  onClick={() => { setActiveTab('profile-rewards'); setIsSettingsOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-xl text-slate-900 font-bold hover:text-amber-600 hover:bg-slate-100 flex items-center gap-2.5 cursor-pointer transition-colors"
                >
                  <Award className="w-4 h-4 text-amber-600" />
                  <span>Rewards & Wallet</span>
                </button>

                <button
                  onClick={() => { setActiveTab('profile-support'); setIsSettingsOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-xl text-slate-900 font-bold hover:text-cyan-600 hover:bg-slate-100 flex items-center gap-2.5 cursor-pointer transition-colors"
                >
                  <HelpCircle className="w-4 h-4 text-cyan-600" />
                  <span>Customer Support 24/7</span>
                </button>
              </div>
            )}
          </div>

          {/* User Account / Profile Avatar Button */}
          <div>
            {!user ? (
              <button
                onClick={onOpenAuth}
                className="flex items-center p-1 rounded-full bg-slate-200/60 dark:bg-white/5 border border-slate-300 dark:border-white/10 hover:border-amber-500 dark:hover:border-amber-400/50 transition-all group cursor-pointer"
                title="Login / Register"
              >
                <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-600 font-bold border border-amber-400/60 group-hover:scale-105 transition-transform">
                  <User className="w-4 h-4 text-[#D90000]" />
                </div>
              </button>
            ) : (
              <button
                onClick={() => setActiveTab('profile-info')}
                className="flex items-center p-1 rounded-full bg-slate-200/60 dark:bg-white/5 border border-slate-300 dark:border-white/10 hover:border-amber-500 dark:hover:border-amber-400/50 transition-all group cursor-pointer"
                title="View Profile"
              >
                <img
                  src={user.avatar || user.profilePicture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"}
                  alt={user.name || "User Avatar"}
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
        <div ref={mobileSearchRef} className="md:hidden bg-white border-b border-slate-300 px-3 sm:px-4 py-3 animate-fade-in relative z-[95]">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <button
              type="submit"
              className="absolute left-3 text-slate-600 hover:text-[#D90000] cursor-pointer"
              title="Search"
            >
              <Search className="w-4 h-4" />
            </button>
            <input
              type="text"
              autoFocus
              placeholder="Search movies, theatres, events..."
              value={currentQuery}
              onChange={(e) => updateQuery(e.target.value)}
              className="w-full pl-9 pr-20 py-2 text-xs rounded-full bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-500 font-semibold focus:border-[#D90000] focus:outline-none"
            />
            <div className="absolute right-2.5 flex items-center gap-1">
              {isSearchingApi && (
                <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin mr-0.5" />
              )}
              {currentQuery && (
                <button 
                  type="button"
                  onClick={() => updateQuery('')} 
                  className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="submit"
                className="px-2.5 py-0.5 rounded-full bg-[#D90000] text-white text-[11px] font-black cursor-pointer shadow-xs"
                title="Search"
              >
                Go
              </button>
            </div>
          </form>

          {/* Mobile Search Results Suggestions Dropdown */}
          {currentQuery.trim().length > 0 && (
            <div className="mt-2 bg-white rounded-2xl p-2 border border-slate-200 shadow-xl max-h-60 overflow-y-auto">
              {displaySuggestions.length > 0 ? (
                <>
                  {displaySuggestions.map((item, idx) => (
                    <button
                      key={item.id || idx}
                      type="button"
                      onClick={() => handleSelectSuggestion(item)}
                      className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-slate-50 flex items-center justify-between text-xs border-b border-slate-100 last:border-0 cursor-pointer"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <img 
                          src={item.image || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=150&q=80"}
                          alt={item.title}
                          className="w-7 h-9 rounded object-cover shrink-0"
                          onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=150&q=80";
                          }}
                        />
                        <div className="truncate">
                          <span className="font-bold text-slate-900 block truncate">{item.title}</span>
                          <span className="text-[10px] text-slate-500 truncate block">{item.subtitle}</span>
                        </div>
                      </div>
                      <span className="text-[9px] font-extrabold text-[#D90000] uppercase shrink-0 px-1.5 py-0.5 bg-red-50 rounded">
                        {item.category || item.type}
                      </span>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={handleSearchSubmit}
                    className="w-full mt-1 text-center py-1.5 text-xs font-black text-[#D90000] hover:bg-red-50 rounded-lg cursor-pointer"
                  >
                    View all results for "{currentQuery}" →
                  </button>
                </>
              ) : (
                <div className="px-3 py-3 text-center text-xs text-slate-500">
                  <p>No direct matches found.</p>
                  <button
                    type="button"
                    onClick={handleSearchSubmit}
                    className="text-xs font-black text-[#D90000] underline mt-1 cursor-pointer"
                  >
                    Press 'Go' to search all sections →
                  </button>
                </div>
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
