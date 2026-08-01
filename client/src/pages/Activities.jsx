import React, { useState, useEffect } from 'react';
import { Heart, Search, Filter, MapPin, Clock, Check, Ticket, Sparkles, X, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { ActivityBookingModal } from '../components/ActivityBookingModal';

const API_BASE = import.meta.env.VITE_API_BASE_URL || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : 'https://primeshow-backend.onrender.com/api');

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

  const categories = ['All', 'Water Park', 'Trampoline Park', 'Adventure Sport', 'Arcade Zone'];

  const filteredActivities = activitiesList.filter(act => {
    const matchesCat = activeCategory === 'All' || act.category === activeCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
                          act.title?.toLowerCase().includes(q) || 
                          act.location?.toLowerCase().includes(q) ||
                          act.city?.toLowerCase().includes(q) ||
                          act.description?.toLowerCase().includes(q) ||
                          (act.category && act.category.toLowerCase().includes(q)) ||
                          (Array.isArray(act.benefits) && act.benefits.some(b => b.toLowerCase().includes(q)));
    return matchesCat && matchesSearch;
  });

  const handleOpenBooking = (activity) => {
    setSelectedActivity(activity);
    setIsBookingModalOpen(true);
  };

  const handleBookingSuccess = async () => {
    fetchActivities();
  };

  return (
    <div className="min-h-screen bg-[#050508]/90 text-slate-900 dark:text-white pt-6 sm:pt-8 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Header Title */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold font-sans text-slate-900 dark:text-white mb-1">Amusement & Adventure Activities</h1>
            <p className="text-xs text-amber-600 dark:text-amber-300 font-semibold">Book passes for water parks, trampoline arenas, extreme sports, and VR gaming arcades</p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 dark:text-white/40" />
            <input
              type="text"
              placeholder="Search water parks, trampolines, adventure..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 rounded-full glass-input text-xs text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-white/40"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-3 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex overflow-x-auto gap-2 pb-4 mb-8 text-xs font-semibold scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full transition-all cursor-pointer shrink-0 ${
                activeCategory === cat
                  ? 'bg-amber-500 text-black font-extrabold shadow-md shadow-amber-500/20'
                  : 'bg-slate-200/60 dark:bg-white/5 hover:bg-slate-300 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Activities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredActivities.map((act) => (
            <div 
              key={act.id}
              className="glass-panel rounded-3xl overflow-hidden border border-slate-300 dark:border-white/10 hover:border-amber-400/50 transition-all duration-300 group flex flex-col sm:flex-row justify-between shadow-xl"
            >
              <div className="sm:w-2/5 relative aspect-[4/3] sm:aspect-auto overflow-hidden">
                <img
                  src={act.image}
                  alt={act.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-cyan-500 text-black text-[10px] font-extrabold shadow-md">
                  {act.category}
                </div>
              </div>

              <div className="sm:w-3/5 p-5 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-amber-500 dark:group-hover:text-amber-300 transition-colors line-clamp-2 mb-2">
                    {act.title}
                  </h3>
                  
                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-white/70">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="line-clamp-1">{act.location}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>{act.validity}</span>
                    </div>
                  </div>

                  {/* Benefits Chips */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {act.benefits?.slice(0, 3).map((benefit, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-200/60 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-[10px] text-slate-700 dark:text-white/70">
                        ✓ {benefit}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-white/50 block">Pass Rate</span>
                    <span className="text-base font-black text-amber-600 dark:text-amber-400">₹{act.price}</span>
                  </div>

                  <button
                    onClick={() => handleOpenBooking(act)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-black font-extrabold text-xs shadow-md shadow-amber-500/20 hover:brightness-110 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Ticket className="w-3.5 h-3.5" />
                    <span>Book Activity</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredActivities.length === 0 && (
          <div className="text-center py-16 glass-panel rounded-3xl border border-slate-300 dark:border-white/10 p-6">
            <Heart className="w-10 h-10 text-amber-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">No activities match your query</h3>
            <p className="text-xs text-slate-500 dark:text-white/60">Try searching with a different activity category or location.</p>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {isBookingModalOpen && selectedActivity && (
        <ActivityBookingModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          activityItem={selectedActivity}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
};
