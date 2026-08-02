import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Film, Shield, Star, PlaySquare, Search, Filter, ArrowRight, X, MoreVertical, SlidersHorizontal, Check } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_BASE_URL || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : 'https://primeshow-backend.onrender.com/api');

export const Theatres = ({ onSelectTheatre }) => {
  const { selectedCity } = useAuth();
  const [theatresList, setTheatresList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCityFilter, setActiveCityFilter] = useState('All');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef(null);

  useEffect(() => {
    const fetchTheatres = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE}/theatres`);
        setTheatresList(res.data);
      } catch (err) {
        setTheatresList([
          {
            id: 'th_1',
            name: 'PVR Director\'s Cut, Palladium Mall',
            city: 'Mumbai',
            state: 'Maharashtra',
            address: '4th Floor, High Street Phoenix, Lower Parel, Mumbai',
            facilities: ['VIP Recliners', 'IMAX 3D', 'Dolby Atmos 360', 'Gourmet In-Seat Dining', 'Valet Parking'],
            screensCount: 6,
            totalSeats: 200,
            image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80'
          },
          {
            id: 'th_2',
            name: 'INOX Megaplex, Inorbit Mall',
            city: 'Mumbai',
            state: 'Maharashtra',
            address: '3rd Floor, Link Road, Malad West, Mumbai',
            facilities: ['IMAX 3D', 'ScreenX 270°', 'MX4D Motion Seats', 'Live Food Counters'],
            screensCount: 11,
            totalSeats: 350,
            image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80'
          },
          {
            id: 'th_3',
            name: 'Cinepolis VIP, Orion Mall',
            city: 'Bengaluru',
            state: 'Karnataka',
            address: 'Dr. Rajkumar Road, Rajajinagar, Bengaluru',
            facilities: ['Plush Recliners', 'Dolby Atmos', 'Butler Service', 'Private Lounge'],
            screensCount: 8,
            totalSeats: 240,
            image: 'https://images.unsplash.com/photo-1595769816263-9b910be24d5f?auto=format&fit=crop&w=800&q=80'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchTheatres();
  }, []);

  // Handle clicking outside of search dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const citiesList = ['All', ...new Set(theatresList.map(t => t.city))];

  const filteredTheatres = theatresList.filter(t => {
    const matchesCity = activeCityFilter === 'All' || t.city === activeCityFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
                          t.name?.toLowerCase().includes(q) || 
                          t.address?.toLowerCase().includes(q) ||
                          t.city?.toLowerCase().includes(q) ||
                          (Array.isArray(t.facilities) && t.facilities.some(f => f.toLowerCase().includes(q)));
    return matchesCity && matchesSearch;
  });

  const searchSuggestions = searchQuery.trim()
    ? theatresList.filter(t => {
        const q = searchQuery.toLowerCase().trim();
        return t.name?.toLowerCase().includes(q) ||
               t.city?.toLowerCase().includes(q) ||
               t.address?.toLowerCase().includes(q) ||
               (Array.isArray(t.facilities) && t.facilities.some(f => f.toLowerCase().includes(q)));
      })
    : [];

  const handleSelectSuggestion = (theatre) => {
    setIsSearchFocused(false);
    if (onSelectTheatre) {
      onSelectTheatre(theatre.id);
    }
  };

  return (
    <div className="min-h-screen bg-[#050508]/90 text-slate-900 dark:text-white pt-6 sm:pt-8 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Header Title */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold font-sans text-slate-900 dark:text-white mb-1">Ultra-Luxury Multiplex Directory</h1>
            <p className="text-xs text-amber-600 dark:text-amber-300 font-semibold">Browse multiplexes across cities with IMAX 3D, Dolby Atmos, and VIP Recliners</p>
          </div>

          {/* Search Bar + Mobile Three-Dot / Filter Drawer Button */}
          <div className="flex items-center gap-2 w-full md:w-80">
            <div className="relative flex-grow" ref={searchContainerRef}>
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 dark:text-white/40" />
              <input
                type="text"
                placeholder="Search theatre or location..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchFocused(true);
                }}
                onFocus={() => setIsSearchFocused(true)}
                className="w-full pl-10 pr-10 py-2.5 rounded-full glass-input text-xs text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-white/40"
              />
              {searchQuery && (
                <button onClick={() => { setSearchQuery(''); setIsSearchFocused(false); }} className="absolute right-3.5 top-3 text-slate-400">
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Auto-Complete Search Dropdown */}
              {isSearchFocused && searchQuery.trim() !== '' && (
                <div className="absolute top-full left-0 right-0 z-[200] mt-2 rounded-2xl bg-[#0D0F14]/95 backdrop-blur-xl border border-amber-400/30 p-2 shadow-2xl space-y-1 max-h-72 overflow-y-auto animate-fade-in">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-400 border-b border-white/10 flex items-center justify-between">
                    <span>Matching Multiplexes</span>
                    <span>{searchSuggestions.length} found</span>
                  </div>

                  {searchSuggestions.length > 0 ? (
                    searchSuggestions.map(theatre => (
                      <button
                        key={theatre.id}
                        onClick={() => handleSelectSuggestion(theatre)}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-amber-500/10 hover:border-amber-400/30 border border-transparent flex items-center justify-between gap-3 group transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={theatre.image}
                            alt={theatre.name}
                            className="w-10 h-10 rounded-lg object-cover shrink-0 shadow-md"
                          />
                          <div>
                            <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1">{theatre.name}</h4>
                            <p className="text-[10px] text-white/50 line-clamp-1">{theatre.city} • {theatre.screensCount} Screens</p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-white/50">
                      No multiplexes found matching "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Three-Dot / Filter Drawer Button */}
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="md:hidden p-2.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 cursor-pointer"
              title="Filter Cities"
            >
              <MoreVertical className="w-5 h-5 text-amber-400" />
            </button>
          </div>
        </div>

        {/* Desktop City Filter Pills (Hidden on mobile < 768px as requested) */}
        <div className="hidden md:flex overflow-x-auto gap-2 pb-4 mb-8 text-xs font-semibold scrollbar-none">
          {citiesList.map(city => (
            <button
              key={city}
              onClick={() => setActiveCityFilter(city)}
              className={`px-4 py-2 rounded-full transition-all cursor-pointer shrink-0 ${
                activeCityFilter === city
                  ? 'bg-amber-500 text-black font-extrabold shadow-md shadow-amber-500/20'
                  : 'bg-slate-200/60 dark:bg-white/5 hover:bg-slate-300 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-white/10'
              }`}
            >
              {city}
            </button>
          ))}
        </div>

        {/* Mobile Slide-Out Filter Drawer Modal (Strictly Positioned BELOW Fixed Navbars: top-[90px]) */}
        {isMobileFilterOpen && (
          <div className="fixed top-[90px] bottom-0 left-0 right-0 z-[150] md:hidden flex justify-end bg-black/80 backdrop-blur-md animate-fade-in">
            {/* Backdrop click dismiss */}
            <div className="absolute inset-0" onClick={() => setIsMobileFilterOpen(false)}></div>

            <div className="relative w-5/6 max-w-xs h-full bg-[#0D0F14] border-l border-white/15 p-5 shadow-2xl flex flex-col justify-between overflow-y-auto z-[160] animate-slide-left">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-5 h-5 text-amber-400" />
                    <span className="text-sm font-bold uppercase tracking-wider text-amber-400">City Filter</span>
                  </div>
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="p-2.5 rounded-full bg-white/15 text-white hover:bg-rose-500/30 hover:text-rose-400 transition-all cursor-pointer shadow-lg flex items-center justify-center shrink-0"
                    title="Close Filters"
                    aria-label="Close Filters"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2.5">Select City</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {citiesList.map(city => (
                      <button
                        key={city}
                        onClick={() => {
                          setActiveCityFilter(city);
                          setIsMobileFilterOpen(false);
                        }}
                        className={`w-full text-left p-3 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                          activeCityFilter === city
                            ? 'bg-amber-500 text-black shadow-md'
                            : 'bg-white/5 border border-white/10 text-white/80 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{city}</span>
                        </div>
                        {activeCityFilter === city && <Check className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 mb-6">
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 text-black font-extrabold text-xs shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  Apply City Filter ({filteredTheatres.length} Theatres)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Theatres Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTheatres.map((theatre) => (
            <div 
              key={theatre.id}
              className="glass-panel rounded-3xl overflow-hidden border border-slate-300 dark:border-white/10 hover:border-amber-400/50 transition-all duration-300 group flex flex-col justify-between shadow-xl"
            >
              <div>
                <div className="relative aspect-[16/9] overflow-hidden">
                  <img
                    src={theatre.image}
                    alt={theatre.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-transparent to-transparent"></div>
                  
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-amber-400 text-[10px] font-bold border border-amber-400/30 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span>4.9 / 5.0</span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3">
                    <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-bold uppercase">
                      {theatre.screensCount} Screens • {theatre.totalSeats} Recliners
                    </span>
                    <h3 className="text-lg font-bold text-white mt-1 group-hover:text-amber-300 transition-colors line-clamp-1">{theatre.name}</h3>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-white/60">
                    <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{theatre.address}</span>
                  </div>

                  {/* Facilities Badges */}
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {theatre.facilities?.map((facility, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-slate-200/60 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-[10px] font-semibold text-slate-700 dark:text-slate-300"
                      >
                        {facility}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <button
                  onClick={() => onSelectTheatre && onSelectTheatre(theatre.id)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-black font-extrabold text-xs shadow-md shadow-amber-500/20 hover:brightness-110 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Select Theatre & View Shows</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredTheatres.length === 0 && (
          <div className="text-center py-16 glass-panel rounded-3xl border border-slate-300 dark:border-white/10 p-6">
            <PlaySquare className="w-10 h-10 text-amber-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">No multiplexes match your search</h3>
            <p className="text-xs text-slate-500 dark:text-white/60">Try searching for another city, location, or facility name.</p>
          </div>
        )}
      </div>
    </div>
  );
};
