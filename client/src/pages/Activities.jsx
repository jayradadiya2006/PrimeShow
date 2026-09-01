import React, { useState, useEffect, useRef } from 'react';
import { Heart, Search, Filter, MapPin, Clock, Check, Ticket, Sparkles, X, RefreshCw, MoreVertical, SlidersHorizontal, ArrowRight } from 'lucide-react';
import API, { API_BASE } from '../services/api';
import { ActivityBookingModal } from '../components/ActivityBookingModal';
import { useAuth } from '../context/AuthContext';

export const Activities = () => {
  const { selectedCity } = useAuth();
  const [activitiesList, setActivitiesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef(null);

  // Booking Modal State
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const res = await API.get('/activities');
      setActivitiesList(res.data);
    } catch (err) {
      setActivitiesList([
        {
          id: 'act_surat_1',
          title: 'Amaazia Water Park & Snow World',
          category: 'Water Park',
          badge: 'UNLIMITED ACCESS',
          location: 'Opp. BRTS Bus Stop, Dumbhal, Surat',
          city: 'Surat',
          validity: 'Full Day Pass (10:30 AM - 07:00 PM)',
          price: 999,
          totalCapacity: 3000,
          availableSeats: 850,
          benefits: ['Unlimited Water Slides', 'Free Snow World Access', 'Wave Pool Entry', 'Complimentary Buffet Lunch'],
          image: 'https://images.unsplash.com/photo-1582650625119-3a31f8fa2699?auto=format&fit=crop&w=800&q=80',
          description: 'Surat\'s premier international water park featuring high-thrill slides, wave pools, lazy rivers, and sub-zero snow world!'
        },
        {
          id: 'act_ahmedabad_1',
          title: 'Shott Go-Karting & VR Gaming Arena',
          category: 'Arcade Zone',
          badge: 'HIGH SPEED',
          location: 'Sindhu Bhavan Road, Ahmedabad',
          city: 'Ahmedabad',
          validity: '3-Hour All-Access Pass',
          price: 899,
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

  const searchSuggestions = searchQuery.trim()
    ? activitiesList.filter(act => {
        const q = searchQuery.toLowerCase().trim();
        return act.title?.toLowerCase().includes(q) ||
               act.location?.toLowerCase().includes(q) ||
               act.city?.toLowerCase().includes(q) ||
               (act.category && act.category.toLowerCase().includes(q));
      })
    : [];

  const handleOpenBooking = (activity) => {
    setSelectedActivity(activity);
    setIsBookingModalOpen(true);
  };

  const handleSelectSuggestion = (act) => {
    setIsSearchFocused(false);
    handleOpenBooking(act);
  };

  const handleBookingSuccess = async () => {
    fetchActivities();
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-slate-900 pt-6 sm:pt-8 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Header Title */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold font-sans text-slate-900 mb-1">Amusement & Adventure Activities</h1>
            <p className="text-xs text-[#D90000] font-semibold">Book passes for water parks, trampoline arenas, extreme sports, and VR gaming arcades</p>
          </div>

          {/* Search Bar + Mobile Three-Dot / Filter Drawer Button */}
          <div className="flex items-center gap-2 w-full md:w-80">
            <div className="relative flex-grow" ref={searchContainerRef}>
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search water parks, trampolines, adventure..."
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
                    <span>Matching Activities</span>
                    <span>{searchSuggestions.length} found</span>
                  </div>

                  {searchSuggestions.length > 0 ? (
                    searchSuggestions.map(act => (
                      <button
                        key={act.id}
                        onClick={() => handleSelectSuggestion(act)}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-[#DBCEA5]/40 border border-transparent flex items-center justify-between gap-3 group transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={act.image}
                            alt={act.title}
                            className="w-10 h-10 rounded-lg object-cover shrink-0 shadow-md"
                          />
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#D90000] transition-colors line-clamp-1">{act.title}</h4>
                            <p className="text-[10px] text-slate-600 line-clamp-1">{act.category} • {act.location}</p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#D90000] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-500">
                      No activities found matching "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Three-Dot / Filter Drawer Button */}
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="md:hidden p-2.5 rounded-full bg-[#D90000] text-white flex items-center justify-center shrink-0 cursor-pointer shadow-md"
              title="Filter Categories"
            >
              <MoreVertical className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Desktop Category Filter Pills */}
        <div className="hidden md:flex overflow-x-auto gap-2 pb-4 mb-8 text-xs font-semibold scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full transition-all cursor-pointer shrink-0 ${
                activeCategory === cat
                  ? 'bg-[#D90000] text-white font-extrabold shadow-md'
                  : 'bg-[#DBCEA5] hover:bg-[#caba8e] text-slate-900 border border-[#c5ba92]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Mobile Slide-Out Filter Drawer Modal */}
        {isMobileFilterOpen && (
          <div className="fixed top-[90px] bottom-0 left-0 right-0 z-[150] md:hidden flex justify-end bg-black/70 backdrop-blur-md animate-fade-in">
            <div className="absolute inset-0" onClick={() => setIsMobileFilterOpen(false)}></div>

            <div className="relative w-5/6 max-w-xs h-full bg-[#DBCEA5] border-l border-[#c5ba92] p-5 shadow-2xl flex flex-col justify-between overflow-y-auto z-[160] animate-slide-left text-slate-900">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-[#c5ba92] mb-6">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-5 h-5 text-[#D90000]" />
                    <span className="text-sm font-bold uppercase tracking-wider text-slate-900">Activity Category</span>
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
                  <h4 className="text-xs font-bold text-[#D90000] uppercase tracking-widest mb-2.5">Select Category</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => {
                          setActiveCategory(cat);
                          setIsMobileFilterOpen(false);
                        }}
                        className={`w-full text-left p-3 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                          activeCategory === cat
                            ? 'bg-[#D90000] text-white shadow-md'
                            : 'bg-white border border-slate-300 text-slate-800'
                        }`}
                      >
                        <span>{cat}</span>
                        {activeCategory === cat && <Check className="w-4 h-4" />}
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
                  Apply Category ({filteredActivities.length} Activities)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Activities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredActivities.map((act) => (
            <div 
              key={act.id}
              className="bg-[#DBCEA5] rounded-3xl overflow-hidden border border-[#c5ba92] hover:border-[#D90000] transition-all duration-300 group flex flex-col sm:flex-row justify-between shadow-md text-slate-900"
            >
              <div className="sm:w-2/5 relative aspect-[4/3] sm:aspect-auto overflow-hidden">
                <img
                  src={act.image}
                  alt={act.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#D90000] text-white text-[10px] font-extrabold shadow-md">
                  {act.category}
                </div>
              </div>

              <div className="sm:w-3/5 p-5 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#D90000] transition-colors line-clamp-2 mb-2">
                    {act.title}
                  </h3>
                  
                  <div className="space-y-1.5 text-xs text-slate-800">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#D90000] shrink-0" />
                      <span className="line-clamp-1">{act.location}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#D90000] shrink-0" />
                      <span>{act.validity}</span>
                    </div>
                  </div>

                  {/* Benefits Chips */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {act.benefits?.slice(0, 3).map((benefit, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md bg-white border border-slate-300 text-[10px] text-slate-800 font-semibold shadow-xs">
                        ✓ {benefit}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#c5ba92] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-700 block">Pass Rate</span>
                    <span className="text-base font-black text-[#D90000]">₹{act.price}</span>
                  </div>

                  <button
                    onClick={() => handleOpenBooking(act)}
                    className="px-4 py-2 rounded-xl bg-[#D90000] hover:bg-[#b00000] text-white font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
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
          <div className="text-center py-16 bg-[#DBCEA5] rounded-3xl border border-[#c5ba92] p-6 max-w-lg mx-auto text-slate-900 shadow-md">
            <Heart className="w-10 h-10 text-[#D90000] mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 mb-1">No active shows in {selectedCity || 'this city'} currently</h3>
            <p className="text-xs text-slate-700">No active shows in {selectedCity || 'this city'} currently. Switch city to explore more.</p>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {isBookingModalOpen && selectedActivity && (
        <ActivityBookingModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          activity={selectedActivity}
          activityItem={selectedActivity}
          onBookingSuccess={handleBookingSuccess}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
};
