import React from 'react';
import { X, MapPin, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const CityModal = ({ isOpen, onClose }) => {
  const { selectedCity, changeCity } = useAuth();

  const CITIES = [
    { name: 'Surat', image: 'https://images.unsplash.com/photo-1608447714925-599debaa036e?auto=format&fit=crop&w=400&q=80', tag: 'Default Hub' },
    { name: 'Ahmedabad', image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=400&q=80', tag: 'Multiplex Hub' },
    { name: 'Rajkot', image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=400&q=80', tag: 'Royal City' },
    { name: 'Vadodara', image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=400&q=80', tag: 'Cultural Hub' },
    { name: 'Bhavnagar', image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=400&q=80', tag: 'Coastal City' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
      <div className="relative w-full max-w-2xl glass-modal rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl text-white">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-400/30">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-bold font-serif text-white">Select Your City</h3>
            <p className="text-xs text-white/60">Choose your location to view multiplexes and showtimes</p>
          </div>
        </div>

        {/* City Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {CITIES.map((city) => {
            const isSelected = selectedCity === city.name;
            return (
              <button
                key={city.name}
                onClick={() => {
                  changeCity(city.name);
                  onClose();
                }}
                className={`group relative rounded-2xl overflow-hidden aspect-[4/3] border transition-all duration-300 ${
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

                <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between z-10">
                  <span className="text-sm font-bold text-white group-hover:text-amber-300">{city.name}</span>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-amber-500 text-black flex items-center justify-center font-bold">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
};
