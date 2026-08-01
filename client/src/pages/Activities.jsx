import React, { useState, useEffect } from 'react';
import { Heart, Search, Filter, MapPin, Clock, Check, Ticket, Sparkles } from 'lucide-react';
import axios from 'axios';
import { ActivityBookingModal } from '../components/ActivityBookingModal';

const API_BASE = 'http://localhost:5000/api';

export const Activities = () => {
  const [activitiesList, setActivitiesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // Booking Modal State
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/activities`);
      setActivitiesList(res.data);
    } catch (err) {
      setActivitiesList([
        {
          id: 'act_1',
          title: 'Imagicaa Water Park & Snow World',
          category: 'Water Park',
          badge: 'UNLIMITED ACCESS',
          location: 'Khopoli, Mumbai-Pune Expressway',
          city: 'Mumbai',
          validity: 'Full Day Pass (10:30 AM - 07:00 PM)',
          price: 1299,
          totalCapacity: 3000,
          availableSeats: 850,
          benefits: ['Unlimited Water Rides', 'Free Snow World Access', 'Wave Pool Entry', 'Complimentary Buffet Lunch'],
          image: 'https://images.unsplash.com/photo-1582650625119-3a31f8fa2699?auto=format&fit=crop&w=800&q=80',
          description: 'Experience India\'s premier international water park featuring high-thrill slides, lazy rivers, wave pools, and sub-zero snow world adventures!'
        },
        {
          id: 'act_2',
          title: 'Bounce Inc Trampoline Park & Ninja Course',
          category: 'Trampoline Park',
          badge: 'BEST VALUE',
          location: 'Inorbit Mall, Malad West, Mumbai',
          city: 'Mumbai',
          validity: '2-Hour All-Access Pass',
          price: 899,
          totalCapacity: 500,
          availableSeats: 120,
          benefits: ['Free Grip Socks', 'Freestyle Trampoline Arena', 'Slam Dunk & Dodgeball', 'Ninja Warrior Obstacle Course'],
          image: 'https://images.unsplash.com/photo-1526676037777-05a232554f77?auto=format&fit=crop&w=800&q=80',
          description: 'Wall-to-wall trampolines, foam pits, cliff jumping, and high-energy indoor ninja courses for adrenaline junkies of all ages!'
        },
        {
          id: 'act_3',
          title: 'Della Adventure Park Extreme Sports Pass',
          category: 'Adventure Sport',
          badge: 'POPULAR',
          location: 'Lonavala, Maharashtra',
          city: 'Lonavala',
          validity: 'Full Day Extreme Pass',
          price: 1999,
          totalCapacity: 1500,
          availableSeats: 410,
          benefits: ['Swoop Swing (100ft Drop)', 'Sky Cycling & Zipline', 'ATV Dirt Track Ride', 'Paintball Battle Zone'],
          image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80',
          description: 'India\'s largest extreme adventure park offering over 50 thrill activities, ATV dirt racing, sky cycling, and high-altitude drop swings.'
        },
        {
          id: 'act_4',
          title: 'Smaaash VR & Laser Tag Gaming Arena',
          category: 'Arcade Zone',
          badge: 'UNLIMITED ACCESS',
          location: 'Lower Parel, Mumbai',
          city: 'Mumbai',
          validity: '3-Hour Unlimited Gaming Pass',
          price: 999,
          totalCapacity: 800,
          availableSeats: 260,
          benefits: ['Unlimited Arcade Games', 'VR Coaster Simulation', 'Multiplayer Laser Tag Arena', '10-Pin Bowling Alley'],
          image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80',
          description: 'Next-gen virtual reality gaming hub featuring interactive 9D simulators, immersive laser tag battles, bowling lanes, and arcade classics.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const categories = ['All', 'Water Park', 'Theme Park', 'Trampoline Park', 'Adventure Sport', 'Arcade Zone'];

  const filteredActivities = activitiesList.filter(act => {
    const matchesCat = activeCategory === 'All' || act.category === activeCategory;
    const matchesSearch = act.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          act.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (act.category && act.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (act.benefits && act.benefits.some(b => b.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesCat && matchesSearch;
  });

  const handleOpenBooking = (act) => {
    setSelectedActivity(act);
    setIsBookingModalOpen(true);
  };

  const handleBookingSuccess = () => {
    fetchActivities();
  };

  return (
    <div className="min-h-screen bg-[#050508] text-white pt-8 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Header Title */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold font-serif text-white mb-2">Adventure & Activity Passes</h1>
            <p className="text-xs text-amber-300">Book all-inclusive passes for Water Parks, Trampoline Arenas, Theme Parks & Extreme Sports</p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search water parks, adventure..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full glass-input text-xs text-white placeholder-white/40"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-8 text-xs font-semibold">
          <span className="text-white/40 text-[11px] uppercase tracking-wider font-bold mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-amber-400" /> Category:
          </span>
          {categories.map(c => {
            const isActive = activeCategory === c;
            return (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                className={`px-4 py-2 rounded-full transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20'
                    : 'glass-panel text-white/70 hover:text-white border border-white/10'
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>

        {/* Activities Grid */}
        {loading ? (
          <div className="text-center py-16">
            <div className="w-10 h-10 rounded-full border-4 border-amber-400 border-t-transparent animate-spin mx-auto mb-4"></div>
            <p className="text-xs text-amber-300 font-bold uppercase tracking-widest">Loading Adventure Passes...</p>
          </div>
        ) : filteredActivities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {filteredActivities.map(act => (
              <div 
                key={act.id} 
                className="glass-panel rounded-3xl overflow-hidden border border-white/10 hover:border-amber-400/50 transition-all flex flex-col justify-between shadow-xl group"
              >
                <div>
                  <div className="relative h-64 overflow-hidden">
                    <img src={act.image} alt={act.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#090a12] via-black/20 to-transparent"></div>
                    
                    <div className="absolute top-4 left-4">
                      <span className="px-3.5 py-1 rounded-full bg-amber-500/90 text-black font-extrabold text-[10px] uppercase backdrop-blur-md shadow-lg">
                        {act.category}
                      </span>
                    </div>

                    {/* Dynamic Corner Badge */}
                    {act.badge && act.badge !== 'None' && (
                      <span className={`absolute top-4 right-4 px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg backdrop-blur-md border ${
                        act.badge === 'UNLIMITED ACCESS' ? 'bg-purple-600 text-white border-purple-400' :
                        act.badge === 'BEST VALUE' ? 'bg-emerald-500 text-black border-emerald-300 font-extrabold' :
                        'bg-amber-500 text-black border-amber-300 font-extrabold'
                      }`}>
                        ⭐ {act.badge}
                      </span>
                    )}
                  </div>

                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-xl font-bold font-serif text-white line-clamp-1">{act.title}</h3>
                      <p className="text-xs text-white/60 line-clamp-2 leading-relaxed mt-1">{act.description}</p>
                    </div>

                    <div className="text-xs text-white/70 space-y-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="truncate">{act.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>{act.validity}</span>
                      </div>
                    </div>

                    {/* Included Pass Benefits List */}
                    {act.benefits && act.benefits.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-white/10">
                        <span className="text-[10px] text-amber-400 uppercase font-bold tracking-wider block flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> Included Benefits:
                        </span>
                        <div className="grid grid-cols-2 gap-1.5">
                          {act.benefits.map((benefit, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 text-[11px] text-white/80">
                              <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                              <span className="truncate">{benefit}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-white/10 mt-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-white/50 block">Pass Price Rate</span>
                    <span className="text-xl font-bold font-sans text-amber-400">₹{Number(act.price).toLocaleString('en-IN')} <span className="text-[10px] font-normal text-white/60">/ pass</span></span>
                  </div>

                  {/* Fixed Click Handler */}
                  <button
                    onClick={() => handleOpenBooking(act)}
                    className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Ticket className="w-4 h-4" />
                    <span>Book Pass</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-panel p-12 rounded-3xl text-center text-white/50">
            No adventure activities found matching your criteria.
          </div>
        )}

      </div>

      {/* Dynamic Activity Booking Modal */}
      {isBookingModalOpen && (
        <ActivityBookingModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          activity={selectedActivity}
          onBookingSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
};
