import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Film, Shield, Star, PlaySquare, Search, Filter, ArrowRight, X, MoreVertical, SlidersHorizontal, Check } from 'lucide-react';
import { io } from 'socket.io-client';
import API, { API_BASE } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import { TheatreMapModal } from '../components/TheatreMapModal';
import { getSafeImageUrl, SAFE_IMAGE_FALLBACK } from '../utils/imageStorage';

const getSocketBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, '').replace(/\/api$/, '');
  }
  return typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5000'
    : '';
};
const SOCKET_BASE = getSocketBaseUrl();

export const Theatres = ({ onSelectTheatre }) => {
  const { selectedCity } = useAuth();
  const { theatresList: contextTheatres } = useBooking();
  const [theatresList, setTheatresList] = useState(contextTheatres && contextTheatres.length > 0 ? contextTheatres : []);
  const [loading, setLoading] = useState(theatresList.length === 0);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCityFilter, setActiveCityFilter] = useState('All');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedTheatreForMap, setSelectedTheatreForMap] = useState(null);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const searchContainerRef = useRef(null);

  const fetchTheatres = async () => {
    try {
      const res = await API.get('/theatres');
      if (Array.isArray(res.data) && res.data.length > 0) {
        setTheatresList(res.data);
      }
    } catch (err) {
      console.warn('⚠️ Fetching theatres fallback:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (contextTheatres && contextTheatres.length > 0) {
      setTheatresList(contextTheatres);
      setLoading(false);
    }
    fetchTheatres();
  }, [contextTheatres]);

  // Real-Time Socket Synchronization for Theatres (Insert, Update, Delete)
  useEffect(() => {
    let socket = null;
    try {
      socket = io(SOCKET_BASE, {
        transports: ['polling', 'websocket'],
        autoConnect: true,
        reconnectionAttempts: 5,
        timeout: 5000
      });
      socket.on('connect_error', () => {});

      const handleTheatreUpdate = (theatreDoc) => {
        if (!theatreDoc) {
          fetchTheatres();
          return;
        }
        if (theatreDoc.deletedId) {
          setTheatresList(prev => prev.filter(t => t.id !== theatreDoc.deletedId && t._id !== theatreDoc.deletedId));
          return;
        }
        if (theatreDoc.id || theatreDoc._id) {
          const docId = theatreDoc.id || theatreDoc._id;
          setTheatresList(prev => {
            const exists = prev.some(t => t.id === docId || t._id === docId);
            if (exists) {
              return prev.map(t => (t.id === docId || t._id === docId) ? { ...t, ...theatreDoc } : t);
            }
            return [theatreDoc, ...prev];
          });
        } else {
          fetchTheatres();
        }
      };

      socket.on('THEATRE_UPDATED', handleTheatreUpdate);
      socket.on('THEATRES_UPDATED', handleTheatreUpdate);
      socket.on('THEATRE_DELETED', (data) => {
        const idToDelete = data?.id || data?.deletedId;
        if (idToDelete) {
          setTheatresList(prev => prev.filter(t => t.id !== idToDelete && t._id !== idToDelete));
        } else {
          fetchTheatres();
        }
      });
      socket.on('THEATRES_DELETED', (data) => {
        const idToDelete = data?.id || data?.deletedId;
        if (idToDelete) {
          setTheatresList(prev => prev.filter(t => t.id !== idToDelete && t._id !== idToDelete));
        } else {
          fetchTheatres();
        }
      });
      socket.on('GLOBAL_ADMIN_UPDATE', () => fetchTheatres());
    } catch (e) {}

    return () => {
      if (socket) socket.disconnect();
    };
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

  const GUJARAT_PRIMARY_CITIES = ['Surat', 'Ahmedabad', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Gandhinagar', 'Jamnagar'];
  const dynamicCities = theatresList.map(t => t.city).filter(Boolean);
  const citiesList = ['All', ...new Set([...dynamicCities, ...GUJARAT_PRIMARY_CITIES])];

  const filteredTheatres = theatresList.filter(t => {
    const matchesCity = activeCityFilter === 'All' 
      ? true 
      : (t.city || '').trim().toLowerCase() === activeCityFilter.trim().toLowerCase();
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
    <div className="min-h-screen bg-[#FFFFFF] text-slate-900 pt-6 sm:pt-8 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Header Title */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold font-sans text-slate-900 mb-1">Ultra-Luxury Multiplex Directory</h1>
            <p className="text-xs text-[#D90000] font-semibold">Browse multiplexes across cities with IMAX 3D, Dolby Atmos, and VIP Recliners</p>
          </div>

          {/* Search Bar + Mobile Three-Dot / Filter Drawer Button */}
          <div className="flex items-center gap-2 w-full md:w-80">
            <div className="relative flex-grow" ref={searchContainerRef}>
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search theatre or location..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchFocused(true);
                }}
                onFocus={() => setIsSearchFocused(true)}
                className="w-full pl-10 pr-10 py-2.5 rounded-full bg-white text-slate-900 placeholder-slate-500 border border-slate-300 text-xs font-semibold focus:outline-none shadow-inner"
              />
              {searchQuery && (
                <button onClick={() => { setSearchQuery(''); setIsSearchFocused(false); }} className="absolute right-3.5 top-3 text-slate-400">
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Auto-Complete Search Dropdown */}
              {isSearchFocused && searchQuery.trim() !== '' && (
                <div className="absolute top-full left-0 right-0 z-[200] mt-2 rounded-2xl bg-white border border-[#c5ba92] p-2 shadow-2xl space-y-1 max-h-72 overflow-y-auto animate-fade-in text-slate-900">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#D90000] border-b border-slate-200 flex items-center justify-between">
                    <span>Matching Multiplexes</span>
                    <span>{searchSuggestions.length} found</span>
                  </div>

                  {searchSuggestions.length > 0 ? (
                    searchSuggestions.map(theatre => (
                      <button
                        key={theatre.id}
                        onClick={() => handleSelectSuggestion(theatre)}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-[#DBCEA5]/40 border border-transparent flex items-center justify-between gap-3 group transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={getSafeImageUrl(theatre.image)}
                            alt={theatre.name}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = SAFE_IMAGE_FALLBACK;
                            }}
                            className="w-10 h-10 rounded-lg object-cover shrink-0 shadow-md"
                          />
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#D90000] transition-colors line-clamp-1">{theatre.name}</h4>
                            <p className="text-[10px] text-slate-600 line-clamp-1">{theatre.city} • {theatre.screensCount} Screens</p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#D90000] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-500">
                      No multiplexes found matching "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Three-Dot / Filter Drawer Button */}
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="md:hidden p-2.5 rounded-full bg-[#D90000] text-white flex items-center justify-center shrink-0 cursor-pointer shadow-md"
              title="Filter Cities"
            >
              <MoreVertical className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Desktop City Filter Pills */}
        <div className="hidden md:flex overflow-x-auto gap-2 pb-4 mb-8 text-xs font-semibold scrollbar-none">
          {citiesList.map(city => (
            <button
              key={city}
              onClick={() => setActiveCityFilter(city)}
              className={`px-4 py-2 rounded-full transition-all cursor-pointer shrink-0 ${
                activeCityFilter === city
                  ? 'bg-[#D90000] text-white font-extrabold shadow-md scale-105'
                  : 'bg-[#2B2B2B] hover:bg-[#4A4A4A] text-white border border-slate-700'
              }`}
            >
              {city}
            </button>
          ))}
        </div>

        {/* Mobile Slide-Out Filter Drawer Modal */}
        {isMobileFilterOpen && (
          <div className="fixed top-[90px] bottom-0 left-0 right-0 z-[150] md:hidden flex justify-end bg-black/70 backdrop-blur-md animate-fade-in">
            {/* Backdrop click dismiss */}
            <div className="absolute inset-0" onClick={() => setIsMobileFilterOpen(false)}></div>

            <div className="relative w-5/6 max-w-xs h-full bg-[#DBCEA5] border-l border-[#c5ba92] p-5 shadow-2xl flex flex-col justify-between overflow-y-auto z-[160] animate-slide-left text-[#1A1A1A]">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-[#c5ba92] mb-6">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-5 h-5 text-[#D90000]" />
                    <span className="text-sm font-black uppercase tracking-wider text-[#1A1A1A]">City Filter</span>
                  </div>
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="p-2.5 rounded-full bg-[#D90000] text-white hover:bg-[#b00000] transition-all cursor-pointer shadow-lg flex items-center justify-center shrink-0"
                    title="Close Filters"
                    aria-label="Close Filters"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-black text-[#1A1A1A] uppercase tracking-widest mb-2.5">Select City</h4>
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
                            ? 'bg-[#D90000] text-white shadow-md'
                            : 'bg-[#2B2B2B] hover:bg-[#4A4A4A] text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-[#D90000]" />
                          <span>{city}</span>
                        </div>
                        {activeCityFilter === city && <Check className="w-4 h-4 text-white" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-[#c5ba92] mb-6">
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-full py-3 rounded-2xl bg-[#D90000] hover:bg-[#b00000] text-white font-extrabold text-xs shadow-lg cursor-pointer"
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
              className="bg-[#DBCEA5] rounded-3xl overflow-hidden border border-[#c5ba92] hover:border-[#D90000] transition-all duration-300 group flex flex-col justify-between shadow-md text-slate-900"
            >
              <div>
                <div className="relative aspect-[16/9] overflow-hidden">
                  <img
                    src={getSafeImageUrl(theatre.image)}
                    alt={theatre.name}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = SAFE_IMAGE_FALLBACK;
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                  
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-slate-900/80 text-amber-300 text-[10px] font-bold border border-amber-400/30 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                    <span>4.9 / 5.0</span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3">
                    <span className="px-2.5 py-0.5 rounded-md bg-[#D90000] text-white text-[10px] font-bold uppercase shadow-sm">
                      {theatre.screensCount} Screens • {theatre.totalSeats} Recliners
                    </span>
                    <h3 className="text-lg font-bold text-white mt-1 group-hover:text-[#66DD6A] transition-colors line-clamp-1">{theatre.name}</h3>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2 text-xs text-slate-800">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-[#D90000] shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{theatre.address}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTheatreForMap(theatre);
                        setIsMapModalOpen(true);
                      }}
                      className="px-2 py-1 rounded-lg bg-white border border-slate-300 hover:bg-[#D90000] hover:text-white text-slate-900 text-[10px] font-bold transition-all shrink-0 flex items-center gap-1 cursor-pointer"
                      title="View Interactive Google Map Location"
                    >
                      <MapPin className="w-3 h-3" />
                      <span>📍 Map</span>
                    </button>
                  </div>

                  {/* Facilities Badges */}
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {(Array.isArray(theatre.facilities) ? theatre.facilities : (typeof theatre.facilities === 'string' ? theatre.facilities.split(',').map(s => s.trim()).filter(Boolean) : [])).map((facility, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-[10px] font-semibold text-slate-800 shadow-xs"
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
                  className="w-full py-2.5 rounded-xl bg-[#D90000] hover:bg-[#b00000] text-white font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Select Theatre & View Shows</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredTheatres.length === 0 && (
          <div className="text-center py-16 bg-[#DBCEA5] rounded-3xl border border-[#c5ba92] p-8 max-w-lg mx-auto text-slate-900 shadow-md space-y-4">
            <PlaySquare className="w-12 h-12 text-[#D90000] mx-auto mb-2" />
            <h3 className="text-lg font-bold text-slate-900">No multiplexes found in {activeCityFilter !== 'All' ? activeCityFilter : (selectedCity || 'this filter')}</h3>
            <p className="text-xs text-slate-700">Currently no active cinemas registered under this filter. You can explore all Gujarat multiplexes or clear your search query.</p>
            <button
              onClick={() => {
                setActiveCityFilter('All');
                setSearchQuery('');
              }}
              className="px-6 py-2.5 rounded-full bg-[#D90000] hover:bg-[#b00000] text-white font-extrabold text-xs shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <span>View All Gujarat Multiplexes ({theatresList.length})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Google Map In-App Modal */}
      {isMapModalOpen && selectedTheatreForMap && (
        <TheatreMapModal
          isOpen={isMapModalOpen}
          onClose={() => setIsMapModalOpen(false)}
          theatre={selectedTheatreForMap}
        />
      )}
    </div>
  );
};
