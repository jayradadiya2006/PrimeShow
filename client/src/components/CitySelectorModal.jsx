import React, { useState, useMemo } from 'react';
import { X, MapPin, Check, Search, Sparkles, Navigation, Building2, Flame } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GUJARAT_CITIES } from '../constants/cities';

// 4 Top Popular Hubs with Custom Visual Badges
const POPULAR_HUBS = [
  { 
    name: 'Ahmedabad', 
    badge: 'Mega Hub', 
    tagline: 'Multiplex Capital',
    image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=400&q=80' 
  },
  { 
    name: 'Surat', 
    badge: 'Default Hub', 
    tagline: 'Diamond City',
    image: 'https://images.unsplash.com/photo-1608447714925-599debaa036e?auto=format&fit=crop&w=400&q=80' 
  },
  { 
    name: 'Vadodara', 
    badge: 'Cultural Hub', 
    tagline: 'Gaekwad City',
    image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=400&q=80' 
  },
  { 
    name: 'Rajkot', 
    badge: 'Royal Hub', 
    tagline: 'Saurashtra Center',
    image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=400&q=80' 
  }
];

export const CitySelectorModal = ({ isOpen, onClose }) => {
  const { selectedCity, changeCity } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  // Alphabetically sorted cities list
  const sortedCities = useMemo(() => {
    return [...GUJARAT_CITIES].sort((a, b) => a.localeCompare(b));
  }, []);

  // Filter cities based on search term
  const filteredCities = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return sortedCities;
    return sortedCities.filter(c => c.toLowerCase().includes(term));
  }, [searchTerm, sortedCities]);

  if (!isOpen) return null;

  const currentSelected = selectedCity || 'Surat';

  const handleSelect = (cityName) => {
    if (changeCity) changeCity(cityName);
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-3xl bg-[#DBCEA5] rounded-3xl p-5 sm:p-7 border border-[#c5ba92] shadow-2xl text-slate-900 max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-[#D90000] hover:bg-[#b00000] text-white transition-all cursor-pointer z-10 shadow-md"
          title="Close Modal"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-5 shrink-0 pr-10">
          <div className="w-12 h-12 rounded-2xl bg-[#D90000] text-white flex items-center justify-center font-bold shadow-md shrink-0">
            <MapPin className="w-6 h-6 stroke-[2.5] text-white" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold font-sans text-slate-900 flex items-center gap-2">
              Select Your City
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#D90000] text-white font-mono shadow-xs">
                18 Cities
              </span>
            </h3>
            <p className="text-xs text-slate-700 font-medium">Choose location to explore movies, multiplex showtimes & live events across Gujarat</p>
          </div>
        </div>

        {/* Search Bar Input */}
        <div className="relative mb-5 shrink-0">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search Gujarat city (e.g. Surat, Ahmedabad, Vadodara, Rajkot, Bharuch...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#D90000] transition-all shadow-inner font-semibold"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Scrollable Main Content Container */}
        <div className="overflow-y-auto custom-scrollbar pr-1 space-y-6 flex-1">
          
          {/* SECTION 1: Popular Cities Badge Grid (Shown when no search term is typed) */}
          {!searchTerm && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#D90000] flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-[#D90000] fill-[#D90000]/20" /> Popular Cities
                </span>
                <span className="text-[11px] text-slate-600 font-medium">Top Gujarat Multiplex Hubs</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {POPULAR_HUBS.map((hub) => {
                  const isSelected = currentSelected.toLowerCase() === hub.name.toLowerCase();
                  return (
                    <button
                      key={hub.name}
                      onClick={() => handleSelect(hub.name)}
                      className={`group relative rounded-2xl overflow-hidden aspect-[16/10] border text-left transition-all duration-300 cursor-pointer shadow-xs ${
                        isSelected
                          ? 'border-[#D90000] ring-2 ring-[#D90000] shadow-md scale-[1.02]'
                          : 'border-slate-300 hover:border-slate-400 hover:scale-[1.01]'
                      }`}
                    >
                      <img
                        src={hub.image}
                        alt={hub.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-70 group-hover:opacity-85"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

                      <div className="absolute inset-x-3 bottom-2.5 flex items-end justify-between z-10">
                        <div>
                          <div className="text-xs font-bold text-white group-hover:text-amber-300">{hub.name}</div>
                          <div className="text-[10px] text-white/80 font-medium">{hub.tagline}</div>
                        </div>

                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-[#D90000] text-white flex items-center justify-center font-bold shrink-0 shadow-md">
                            <Check className="w-3 h-3 stroke-[3] text-white" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 2: Alphabetical Clean Responsive Grid View (All 18 Cities) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#D90000]" />
                {searchTerm ? `Search Results (${filteredCities.length})` : 'All 18 Supported Cities'}
              </span>
            </div>

            {filteredCities.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-2.5">
                {filteredCities.map((cityName) => {
                  const isSelected = currentSelected.toLowerCase() === cityName.toLowerCase();
                  return (
                    <button
                      key={cityName}
                      onClick={() => handleSelect(cityName)}
                      className={`px-4 py-3 rounded-2xl border text-xs font-bold transition-all flex items-center justify-between gap-2 cursor-pointer ${
                        isSelected
                          ? 'bg-[#D90000] text-white border-[#D90000] shadow-md font-bold scale-[1.01]'
                          : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <MapPin className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-[#D90000]'}`} />
                        <span className="truncate">{cityName}</span>
                      </div>

                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-white text-[#D90000] flex items-center justify-center shrink-0">
                          <Check className="w-2.5 h-2.5 stroke-[3] text-[#D90000]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10 bg-white rounded-2xl border border-slate-300 p-6 text-slate-900">
                <MapPin className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <p className="text-xs text-slate-700 font-semibold">No Gujarat cities found matching "{searchTerm}"</p>
                <button
                  onClick={() => setSearchTerm('')}
                  className="mt-3 text-xs text-[#D90000] hover:underline font-bold cursor-pointer"
                >
                  Clear search filter
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer Info */}
        <div className="pt-3 mt-4 border-t border-[#c5ba92] flex items-center justify-between text-[11px] text-slate-700 font-medium shrink-0">
          <div className="flex items-center gap-1.5 text-slate-900">
            <Navigation className="w-3 h-3 text-[#D90000]" />
            <span>Currently Active: <strong className="text-[#D90000] font-bold">{currentSelected}</strong></span>
          </div>
          <span>Automatic local multiplex filtering</span>
        </div>

      </div>
    </div>
  );
};

// Alias export for backward compatibility
export const CityModal = CitySelectorModal;
