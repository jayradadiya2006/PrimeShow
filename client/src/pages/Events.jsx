import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar, MapPin, Ticket, Search, Filter, Clock, ArrowRight, X, MoreVertical, SlidersHorizontal, Check } from 'lucide-react';
import axios from 'axios';
import { EventBookingModal } from '../components/EventBookingModal';

const API_BASE = import.meta.env.VITE_API_BASE_URL || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : 'https://primeshow-backend.onrender.com/api');

export const Events = () => {
  const [eventsList, setEventsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Booking Modal State
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/events`);
      setEventsList(res.data);
    } catch (err) {
      setEventsList([
        {
          id: 'ev_1',
          title: 'Coldplay: Music of the Spheres World Tour',
          category: 'Live Concert',
          venue: 'DY Patil Stadium, Mumbai',
          city: 'Mumbai',
          date: '18 JAN 2027',
          time: '07:00 PM',
          price: 3500,
          totalCapacity: 50000,
          availableSeats: 12400,
          image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
          description: 'Experience Coldplay live in Mumbai performing classics like Yellow, Fix You, Viva La Vida, and Higher Power in an immersive LED wristband stadium experience.'
        },
        {
          id: 'ev_2',
          title: 'Zakir Khan Live - Tathastu Special',
          category: 'Stand-up Comedy',
          venue: 'Siri Fort Auditorium, Delhi NCR',
          city: 'Delhi NCR',
          date: '04 FEB 2027',
          time: '08:00 PM',
          price: 999,
          totalCapacity: 2500,
          availableSeats: 480,
          image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
          description: 'India\'s beloved Sakht Launda, Zakir Khan, returns with his brand-new 90-minute stand-up special filled with relatable storytelling, laughter, and poetry.'
        },
        {
          id: 'ev_3',
          title: 'Sunburn Goa EDM Music Festival 2026',
          category: 'Festival',
          venue: 'Vagator Beach, Goa',
          city: 'Goa',
          date: '28 DEC 2026',
          time: '04:00 PM onwards',
          price: 4999,
          totalCapacity: 30000,
          availableSeats: 8200,
          image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
          description: 'Asia\'s biggest electronic dance music festival featuring international headliner DJs, laser shows, pyrotechnics, and beach vibes across 3 massive stages.'
        },
        {
          id: 'ev_4',
          title: 'Arijit Singh Live in Concert - Soulful Night',
          category: 'Singing',
          venue: 'Jawaharlal Nehru Stadium, Delhi NCR',
          city: 'Delhi NCR',
          date: '15 MAR 2027',
          time: '06:30 PM',
          price: 2500,
          totalCapacity: 40000,
          availableSeats: 9500,
          image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=800&q=80',
          description: 'An unforgettable evening with Arijit Singh performing his hit romantic and soulful melodies backed by a 50-piece symphony orchestra.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const categories = ['All', 'Live Concert', 'Stand-up Comedy', 'Festival', 'Singing'];

  const filteredEvents = eventsList.filter(ev => {
    const matchesCat = activeCategory === 'All' || ev.category === activeCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
                          ev.title?.toLowerCase().includes(q) || 
                          ev.venue?.toLowerCase().includes(q) ||
                          ev.city?.toLowerCase().includes(q) ||
                          ev.description?.toLowerCase().includes(q) ||
                          (ev.category && ev.category.toLowerCase().includes(q));
    return matchesCat && matchesSearch;
  });

  const handleOpenBooking = (evt) => {
    setSelectedEvent(evt);
    setIsBookingModalOpen(true);
  };

  const handleBookingSuccess = async () => {
    fetchEvents();
  };

  return (
    <div className="min-h-screen bg-[#050508]/90 text-slate-900 dark:text-white pt-6 sm:pt-8 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Header Title */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold font-sans text-slate-900 dark:text-white mb-1">Live Events & Concerts</h1>
            <p className="text-xs text-amber-600 dark:text-amber-300 font-semibold">Book tickets for stadium concerts, comedy shows, music festivals, and live performances</p>
          </div>

          {/* Search Bar + Mobile Three-Dot / Filter Drawer Button */}
          <div className="flex items-center gap-2 w-full md:w-80">
            <div className="relative flex-grow">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 dark:text-white/40" />
              <input
                type="text"
                placeholder="Search event title, artist, or venue..."
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

            {/* Mobile Three-Dot / Filter Drawer Button */}
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="md:hidden p-2.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 cursor-pointer"
              title="Filter Event Categories"
            >
              <MoreVertical className="w-5 h-5 text-amber-400" />
            </button>
          </div>
        </div>

        {/* Desktop Category Filter Pills (Hidden on mobile < 768px as requested) */}
        <div className="hidden md:flex overflow-x-auto gap-2 pb-4 mb-8 text-xs font-semibold scrollbar-none">
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
                    <span className="text-sm font-bold uppercase tracking-wider text-amber-400">Event Category</span>
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
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2.5">Select Category</h4>
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
                            ? 'bg-amber-500 text-black shadow-md'
                            : 'bg-white/5 border border-white/10 text-white/80 hover:bg-white/10'
                        }`}
                      >
                        <span>{cat}</span>
                        {activeCategory === cat && <Check className="w-4 h-4" />}
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
                  Apply Category ({filteredEvents.length} Events)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredEvents.map((evt) => (
            <div 
              key={evt.id}
              className="glass-panel rounded-3xl overflow-hidden border border-slate-300 dark:border-white/10 hover:border-amber-400/50 transition-all duration-300 group flex flex-col sm:flex-row justify-between shadow-xl"
            >
              <div className="sm:w-2/5 relative aspect-[4/3] sm:aspect-auto overflow-hidden">
                <img
                  src={evt.image}
                  alt={evt.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-amber-500 text-black text-[10px] font-extrabold shadow-md">
                  {evt.category}
                </div>
              </div>

              <div className="sm:w-3/5 p-5 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-amber-500 dark:group-hover:text-amber-300 transition-colors line-clamp-2 mb-2">
                    {evt.title}
                  </h3>
                  
                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-white/70">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="line-clamp-1">{evt.venue}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>{evt.date} • {evt.time}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-white/50 line-clamp-2 mt-3">{evt.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-white/50 block">Starts From</span>
                    <span className="text-base font-black text-amber-600 dark:text-amber-400">₹{evt.price}</span>
                  </div>

                  <button
                    onClick={() => handleOpenBooking(evt)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-black font-extrabold text-xs shadow-md shadow-amber-500/20 hover:brightness-110 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Ticket className="w-3.5 h-3.5" />
                    <span>Book Passes</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-16 glass-panel rounded-3xl border border-slate-300 dark:border-white/10 p-6">
            <Sparkles className="w-10 h-10 text-amber-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">No live events match your filter</h3>
            <p className="text-xs text-slate-500 dark:text-white/60">Try searching with a different category or search keyword.</p>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {isBookingModalOpen && selectedEvent && (
        <EventBookingModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          eventItem={selectedEvent}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
};
