import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Film, Sparkles, Check, ChevronRight } from 'lucide-react';
import { useBooking } from '../../context/BookingContext';
import API from '../../services/api';

export default function TheatresPage() {
  const [theatres, setTheatres] = useState([]);
  const { selectedCity, setSelectedCity } = useBooking();

  useEffect(() => {
    API.get(`/theatres?city=${encodeURIComponent(selectedCity)}`)
      .then(res => setTheatres(res.data))
      .catch(() => {});
  }, [selectedCity]);

  const cities = ["Mumbai", "Delhi NCR", "Bengaluru", "Hyderabad", "Chennai", "Kolkata"];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 min-h-screen">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="font-serif text-4xl font-bold text-white flex items-center gap-3">
            <MapPin className="w-8 h-8 text-cyan-400" /> Multiplexes & Cinema Halls
          </h1>
          <p className="text-xs text-slate-400">Discover premium auditoriums in {selectedCity}.</p>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 max-w-full">
          {cities.map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer transition-all border ${
                selectedCity === city
                  ? 'bg-cyan-500 text-black border-cyan-400 font-bold glow-cyan'
                  : 'glass-panel text-slate-300 hover:border-cyan-500/40'
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {theatres.map((th) => (
          <motion.div
            key={th.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 sm:p-8 rounded-3xl glass-panel border-white/10 hover:border-cyan-500/30 transition-all space-y-6"
          >
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div>
                <h3 className="font-serif text-2xl font-bold text-white">{th.name}</h3>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> {th.address}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 items-center">
                {th.facilities?.map((fac) => (
                  <span key={fac} className="px-3 py-1 rounded-full text-[11px] font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 flex items-center gap-1">
                    <Check className="w-3 h-3 text-cyan-400" /> {fac}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Available Auditoriums & Screens</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {th.screens?.map((scr) => (
                  <div key={scr.id} className="p-3 rounded-2xl glass-panel border-white/5 flex items-center justify-between text-xs">
                    <span className="font-medium text-white">{scr.name}</span>
                    <span className="text-slate-500 text-[10px]">{scr.totalSeats} Recliners</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
