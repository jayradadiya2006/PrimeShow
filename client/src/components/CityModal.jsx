import React, { useState, useMemo } from 'react';
import { X, MapPin, Check, Search, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GUJARAT_CITIES, POPULAR_GUJARAT_CITIES } from '../constants/cities';

export const CityModal = ({ isOpen, onClose }) => {
  const { selectedCity, changeCity } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const POPULAR_CITY_DETAILS = [
    { name: 'Surat', image: 'https://images.unsplash.com/photo-1608447714925-599debaa036e?auto=format&fit=crop&w=400&q=80', tag: 'Default Hub' },
    { name: 'Ahmedabad', image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=400&q=80', tag: 'Multiplex Hub' },
    { name: 'Rajkot', image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=400&q=80', tag: 'Royal City' },
    { name: 'Vadodara', image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=400&q=80', tag: 'Cultural Hub' },
    { name: 'Bhavnagar', image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=400&q=80', tag: 'Coastal City' },
    { name: 'Gandhinagar', image: 'https://images.unsplash.com/photo-1617854818583-09e7f077a156?auto=format&fit=crop&w=400&q=80', tag: 'Capital Hub' }
  ];

  const filteredCities = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return GUJARAT_CITIES;
    return GUJARAT_CITIES.filter(c => c.toLowerCase().includes(term));
  }, [searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-3xl glass-modal rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl text-white max-h-[90vh] flex flex-col">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Section */}
        <div className="flex items-center gap-3 mb-4 shrink-0">
          <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-400/30">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-bold font-sans text-white flex items-center gap-2">
              Select Your Gujarat City
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono border border-amber-400/30">
                {GUJARAT_CITIES.length} Cities
              </span>
            </h3>
            <p className="text-xs text-white/60">Choose your location to view nearby multiplexes and showtimes across Gujarat</p>
          </div>
        </div>

        {/* Search Bar Input */}
        <div className="relative mb-5 shrink-0">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
          <input
            type="text"
            placeholder="Search Gujarat city (e.g. Surat, Ahmedabad, Jamnagar, Bharuch, Bhuj...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-10 py-3 rounded-2xl glass-input text-xs sm:text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-white/50 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Scrollable Content Container */}
        <div className="overflow-y-auto custom-scrollbar pr-1 space-y-6 flex-1">
          
          {/* Popular Hubs Section (Shown when no search term is entered) */}
          {!searchTerm && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400/90 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Popular Gujarat Hubs
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {POPULAR_CITY_DETAILS.map((city) => {
                  const isSelected = selectedCity === city.name;
                  return (
                    <button
                      key={city.name}
                      onClick={() => {
                        changeCity(city.name);
                        onClose();
                      }}
                      className={`group relative rounded-2xl overflow-hidden aspect-[4/3] border transition-all duration-300 cursor-pointer ${
                        isSelected
                          ? 'border-amber-400 shadow-lg shadow-amber-500/30 ring-2 ring-amber-400/50'
                          : 'border-white/10 hover:border-white/30'
                      }`}
                    >
                      <img
                        src={city.image}
                        alt={city.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-60 group-hover:opacity-80"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"></div>

                      <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between z-10">
                        <span className="text-xs font-bold text-white group-hover:text-amber-300 line-clamp-1">{city.name}</span>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-amber-500 text-black flex items-center justify-center font-bold shrink-0">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* All Cities Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-white/70">
                {searchTerm ? `Search Results (${filteredCities.length})` : 'All Gujarat Cities & Districts'}
              </span>
            </div>

            {filteredCities.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {filteredCities.map((cityName) => {
                  const isSelected = selectedCity === cityName;
                  return (
                    <button
                      key={cityName}
                      onClick={() => {
                        changeCity(cityName);
                        onClose();
                      }}
                      className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-between gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500 text-black border-amber-400 shadow-md shadow-amber-500/20 font-extrabold'
                          : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/15 hover:text-white hover:border-white/20'
                      }`}
                    >
                      <span className="truncate">{cityName}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 shrink-0 stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10 glass-panel rounded-2xl border border-white/10 p-4">
                <MapPin className="w-8 h-8 text-white/40 mx-auto mb-2" />
                <p className="text-xs text-white/70">No Gujarat cities found matching "{searchTerm}"</p>
                <button
                  onClick={() => setSearchTerm('')}
                  className="mt-2 text-xs text-amber-400 hover:underline font-bold"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
