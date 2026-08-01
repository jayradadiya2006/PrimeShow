import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Sparkles, Play, Film, ChevronRight, ShieldCheck, Ticket, Loader2, ArrowRight, X, Heart, Building2, Tag } from 'lucide-react';
import { useBooking } from '../context/BookingContext';

const VIDEO_SOURCES = [
  {
    id: 0,
    label: "Now Showing",
    url: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_081127_0992a171-d3c6-4978-8213-0ec5df8b6d63.mp4",
    title: "Avatar: Fire and Ash",
    sub: "Native IMAX 3D Experience"
  },
  {
    id: 1,
    label: "Premium Experience",
    url: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_092026_dd05b805-ea0f-40b2-8c52-332b88502592.mp4",
    title: "Dune: Part Two",
    sub: "Dolby Atmos 360 Surround Sound"
  },
  {
    id: 2,
    label: "Book Instantly",
    url: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_081042_df7202bf-bd80-4b2b-bbc6-1f09ba2870e9.mp4",
    title: "Kalki 2898 AD: Chapter II",
    sub: "Exclusive VIP Recliner Seats"
  },
  {
    id: 3,
    label: "Cinematic Reel",
    url: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260606_154941_df1a96e1-a06f-450c-bd02-d863414cc1a0.mp4",
    title: "VANGUARD Cinema Showreel",
    sub: "Ultra HD Dynamic Character Highlights"
  }
];

export const HeroCrossfader = ({ onSelectMovie, onBookNow, selectedCity, onOpenCityModal, setActiveTab }) => {
  const { moviesList, eventsList, playsList, activitiesList, theatresList } = useBooking();
  const [activeVideoIdx, setActiveVideoIdx] = useState(0);
  const [activeCategory, setActiveCategory] = useState('movies');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const searchContainerRef = useRef(null);

  // Categories Funnel Menu Items
  const categoryMenu = [
    { id: 'movies', label: '🎬 Movies', videoIdx: 0 },
    { id: 'theatres', label: '🍿 Theatres', videoIdx: 1 },
    { id: 'events', label: '🎸 Events', videoIdx: 3 },
    { id: 'plays', label: '🎭 Plays', videoIdx: 2 },
    { id: 'activities', label: '🎢 Activities', videoIdx: 0 },
    { id: 'offers', label: '🏷️ Offers', videoIdx: 1 }
  ];

  // Auto-switch video every 8 seconds if user doesn't manually click
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveVideoIdx(prev => (prev + 1) % VIDEO_SOURCES.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  // Search Debounce Simulation
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      setIsSearching(true);
      setIsDropdownOpen(true);
      const timer = setTimeout(() => {
        setIsSearching(false);
      }, 250);
      return () => clearTimeout(timer);
    } else {
      setIsDropdownOpen(false);
      setIsSearching(false);
      setSelectedIndex(-1);
    }
  }, [searchQuery]);

  // Click Outside to Dismiss Search Dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Combined Search Results across Movies, Events, Plays, Activities, and Theatres
  const getSearchResults = () => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase().trim();
    const results = [];

    // Search Movies
    (moviesList || []).forEach(m => {
      if (m.title?.toLowerCase().includes(query) || m.genres?.some(g => g.toLowerCase().includes(query))) {
        results.push({
          id: m.id,
          title: m.title,
          type: 'MOVIE',
          badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
          image: m.poster,
          subInfo: `⭐ ${m.rating || 9.0} • ₹${m.price || 450}`,
          action: () => {
            if (onBookNow) onBookNow(m.id);
            else if (onSelectMovie) onSelectMovie(m.id);
            setIsDropdownOpen(false);
          }
        });
      }
    });

    // Search Events
    (eventsList || []).forEach(e => {
      if (e.title?.toLowerCase().includes(query) || e.venue?.toLowerCase().includes(query)) {
        results.push({
          id: e.id,
          title: e.title,
          type: 'EVENT',
          badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-400/30',
          image: e.image,
          subInfo: `${e.venue} • ₹${e.price || 999}`,
          action: () => {
            if (setActiveTab) setActiveTab('events');
            setIsDropdownOpen(false);
          }
        });
      }
    });

    // Search Plays
    (playsList || []).forEach(p => {
      if (p.title?.toLowerCase().includes(query) || p.venue?.toLowerCase().includes(query)) {
        results.push({
          id: p.id,
          title: p.title,
          type: 'PLAY',
          badgeColor: 'bg-red-500/20 text-red-300 border-red-500/30',
          image: p.image,
          subInfo: `${p.venue} • ₹${p.price || 500}`,
          action: () => {
            if (setActiveTab) setActiveTab('plays');
            setIsDropdownOpen(false);
          }
        });
      }
    });

    // Search Activities
    (activitiesList || []).forEach(a => {
      if (a.title?.toLowerCase().includes(query) || a.location?.toLowerCase().includes(query)) {
        results.push({
          id: a.id,
          title: a.title,
          type: 'ACTIVITY',
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
          image: a.image,
          subInfo: `${a.location} • ₹${a.price || 800}`,
          action: () => {
            if (setActiveTab) setActiveTab('activities');
            setIsDropdownOpen(false);
          }
        });
      }
    });

    // Search Theatres
    (theatresList || []).forEach(t => {
      if (t.name?.toLowerCase().includes(query) || t.city?.toLowerCase().includes(query)) {
        results.push({
          id: t.id,
          title: t.name,
          type: 'THEATRE',
          badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30',
          image: t.image || 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=300&q=80',
          subInfo: `${t.city || 'Mumbai'} • Luxury Multiplex`,
          action: () => {
            if (setActiveTab) setActiveTab('theatres');
            setIsDropdownOpen(false);
          }
        });
      }
    });

    return results.slice(0, 8);
  };

  const searchResults = getSearchResults();

  // Keyboard Navigation Logic
  const handleKeyDown = (e) => {
    if (!isDropdownOpen || searchResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % searchResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + searchResults.length) % searchResults.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && searchResults[selectedIndex]) {
        searchResults[selectedIndex].action();
      } else if (searchResults[0]) {
        searchResults[0].action();
      }
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false);
    }
  };

  const handleSelectCategory = (cat) => {
    setActiveCategory(cat.id);
    setActiveVideoIdx(cat.videoIdx);
    if (setActiveTab) {
      setActiveTab(cat.id);
    }
  };

  return (
    <section className="relative w-full h-screen min-h-[680px] overflow-hidden bg-[#0A0C10] flex items-center justify-center font-sans">
      
      {/* 4 Stacked Crossfade Movie & Character Reel Video Elements */}
      {VIDEO_SOURCES.map((video, idx) => (
        <video
          key={video.id}
          autoPlay
          muted
          loop
          playsInline
          src={video.url}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[1000ms] ease-in-out pointer-events-none ${
            activeVideoIdx === idx ? 'opacity-65 scale-105' : 'opacity-0 scale-100'
          }`}
          style={{ transitionProperty: 'opacity, transform' }}
        />
      ))}

      {/* Sleek Dark Gradient & Vignette Overlay Mask for High Contrast Readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C10] via-[#0A0C10]/75 to-black/85 z-10 pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#0A0C10]/60 to-[#07080B]/95 z-10 pointer-events-none"></div>

      {/* Hero Content Container */}
      <div className="relative z-20 max-w-5xl mx-auto px-4 md:px-8 text-center flex flex-col items-center justify-center pt-16">
        
        {/* Glass Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/60 backdrop-blur-xl mb-6 shadow-xl">
          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          <span className="text-xs md:text-sm font-bold tracking-wide text-slate-200 uppercase">
            India's Premier Ticket & Experience Booking
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold font-serif tracking-tight text-slate-100 mb-4 leading-[1.1] drop-shadow-2xl">
          Experience Cinema <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-red-500 via-amber-400 to-rose-400 bg-clip-text text-transparent italic">
            Like Never Before
          </span>
        </h1>

        {/* Sub-heading */}
        <p className="max-w-2xl text-base md:text-lg text-slate-300 font-sans font-normal mb-8 leading-relaxed">
          Book movies, concerts, theater plays, adventure passes, and private screens with instant liquid glass booking.
        </p>

        {/* Interactive Search Engine Widget with Floating Auto-Suggest Dropdown */}
        <div ref={searchContainerRef} className="relative w-full max-w-3xl mb-8">
          <div className="w-full glass-panel rounded-3xl p-3 md:p-4 shadow-2xl border border-slate-700/70">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              
              {/* City Trigger */}
              <button
                onClick={onOpenCityModal}
                className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-semibold text-amber-400 flex items-center justify-between sm:justify-start gap-2 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <span>{selectedCity}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              {/* Live Search Input with Keyboard Controls */}
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search movies, IMAX 3D, concerts, plays, or activities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.trim() && setIsDropdownOpen(true)}
                  onKeyDown={handleKeyDown}
                  className="w-full pl-11 pr-10 py-3 rounded-2xl glass-input text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none"
                />
                
                {/* Clear Query or Spinner Icon */}
                {isSearching ? (
                  <Loader2 className="absolute right-3.5 top-3.5 w-4 h-4 text-red-500 animate-spin" />
                ) : searchQuery ? (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setIsDropdownOpen(false);
                    }}
                    className="absolute right-3.5 top-3.5 p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : null}
              </div>

              {/* Book Now Action CTA (Electric Crimson Button) */}
              <button
                onClick={() => {
                  if (onBookNow) onBookNow('mov_1');
                  else if (onSelectMovie) onSelectMovie('mov_1');
                }}
                className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:brightness-110 text-white font-extrabold text-sm shadow-xl shadow-red-600/30 flex items-center justify-center gap-2 transition-all hover:scale-105 cursor-pointer"
              >
                <Film className="w-4 h-4" />
                <span>Book Now</span>
              </button>
            </div>
          </div>

          {/* Floating Dropdown Auto-Suggest Menu (Z-Index 100) */}
          {isDropdownOpen && (
            <div className="absolute left-0 right-0 top-full mt-3 z-[100] max-h-96 overflow-y-auto glass-modal border border-slate-300 dark:border-slate-700 rounded-3xl shadow-2xl p-3 text-left animate-scale-up">
              
              <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200 dark:border-slate-700/60 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <span>Matching Live Results ({searchResults.length})</span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono">Use ↑ ↓ & Enter</span>
              </div>

              {isSearching ? (
                <div className="p-8 text-center text-xs text-red-500 font-semibold flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-red-500" /> Searching database...
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-1 mt-2">
                  {searchResults.map((item, idx) => {
                    const isSelected = selectedIndex === idx;
                    return (
                      <div
                        key={item.id + idx}
                        onClick={item.action}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`flex items-center justify-between p-3 rounded-2xl transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-slate-200 dark:bg-slate-800 border border-red-500/50 text-slate-900 dark:text-white shadow-lg'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-300 dark:border-slate-700 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${item.badgeColor}`}>
                                {item.type}
                              </span>
                              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{item.title}</h4>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 truncate">{item.subInfo}</p>
                          </div>
                        </div>

                        <button className="px-3 py-1.5 rounded-xl bg-red-600/20 text-red-400 font-bold text-xs flex items-center gap-1 shrink-0 hover:bg-red-600 hover:text-white transition-all">
                          <span>Select</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center space-y-1">
                  <div className="text-sm font-bold text-slate-100">No results found for "{searchQuery}"</div>
                  <p className="text-xs text-slate-400">Try searching for "Avatar", "Coldplay", "PVR Luxe", or "Imagicaa"</p>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Interactive Clickable & Filterable Category Funnel Menu */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {categoryMenu.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleSelectCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold backdrop-blur-xl border transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-red-600 text-white border-red-500 font-extrabold shadow-lg shadow-red-600/30 scale-105'
                    : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:border-red-500/40 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

      </div>

      {/* Floating Video Feature Info Badge */}
      <div className="hidden lg:flex absolute bottom-8 right-8 z-30 glass-panel rounded-2xl p-3 px-4 border border-slate-700 flex items-center gap-3">
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></div>
        <div className="text-left">
          <div className="text-xs font-bold text-slate-100">{VIDEO_SOURCES[activeVideoIdx].title}</div>
          <div className="text-[10px] text-amber-400">{VIDEO_SOURCES[activeVideoIdx].sub}</div>
        </div>
      </div>

    </section>
  );
};
