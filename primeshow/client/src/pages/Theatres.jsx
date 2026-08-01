import React, { useState, useEffect } from 'react';
import { MapPin, Film, Shield, Star, PlaySquare, Search, Filter, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_BASE = 'http://localhost:5000/api';

export const Theatres = ({ onSelectTheatre }) => {
  const { selectedCity } = useAuth();
  const [theatresList, setTheatresList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCityFilter, setActiveCityFilter] = useState('All');

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

  const citiesList = ['All', ...new Set(theatresList.map(t => t.city))];

  const filteredTheatres = theatresList.filter(t => {
    const matchesCity = activeCityFilter === 'All' || t.city === activeCityFilter;
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.city.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCity && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#050508] text-white pt-8 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Header Title */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold font-serif text-white mb-2">Ultra-Luxury Multiplex Directory</h1>
            <p className="text-xs text-amber-300">Browse multiplexes across cities with IMAX 3D, Dolby Atmos, and VIP Recliners</p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search theatre or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full glass-input text-xs text-white placeholder-white/40"
            />
          </div>
        </div>

        {/* City Filter Pills */}
        <div className="flex overflow-x-auto gap-2 pb-4 mb-8 text-xs font-semibold">
          {citiesList.map(c => {
            const isActive = activeCityFilter === c;
            return (
              <button
                key={c}
                onClick={() => setActiveCityFilter(c)}
                className={`px-4 py-2 rounded-full transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20'
                    : 'glass-panel text-white/70 hover:text-white hover:bg-white/10 border border-white/10'
                }`}
              >
                {c === 'All' ? 'All Cities' : c}
              </button>
            );
          })}
        </div>

        {/* Theatres List */}
        {loading ? (
          <div className="text-center py-16">
            <div className="w-10 h-10 rounded-full border-4 border-amber-400 border-t-transparent animate-spin mx-auto mb-4"></div>
            <p className="text-xs text-amber-300 font-bold uppercase tracking-widest">Loading Multiplex Directory...</p>
          </div>
        ) : filteredTheatres.length > 0 ? (
          <div className="space-y-6">
            {filteredTheatres.map(m => (
              <div key={m.id} className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col md:flex-row items-center gap-6 shadow-xl hover:border-amber-400/40 transition-all">
                <img
                  src={m.image || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80"}
                  alt={m.name}
                  className="w-full md:w-64 h-48 object-cover rounded-2xl border border-amber-400/30 shrink-0"
                />
                
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-bold mb-1">
                    <MapPin className="w-4 h-4" />
                    <span>{m.city}, {m.state || 'Maharashtra'}</span>
                    <span className="text-white/40">•</span>
                    <span className="text-white/80">{m.screensCount || (m.screens ? m.screens.length : 6)} Screens ({m.totalSeats || 200} Seats)</span>
                  </div>
                  <h3 className="text-2xl font-bold font-serif text-white mb-2">{m.name}</h3>
                  <p className="text-xs text-white/60 mb-4 leading-relaxed">{m.address}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {(m.facilities || []).map((f, i) => (
                      <span key={i} className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/20 text-[11px] font-semibold text-amber-200">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="shrink-0 w-full md:w-auto">
                  <button
                    onClick={() => onSelectTheatre(m.id)}
                    className="w-full md:w-auto px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <span>View Theatre & Showtimes</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-panel p-12 rounded-3xl text-center text-white/50">
            No multiplexes found matching your criteria.
          </div>
        )}

      </div>
    </div>
  );
};
