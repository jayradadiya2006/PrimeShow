import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Calendar, MapPin, Ticket, Search, Filter, Clock, ArrowRight, X, MoreVertical, SlidersHorizontal, Check } from 'lucide-react';
import { io } from 'socket.io-client';
import { EventBookingModal } from '../components/EventBookingModal';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

const API_BASE = import.meta.env.VITE_API_BASE_URL || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : 'https://primeshow-api.onrender.com/api');

export const Events = ({ onSelectEvent, onBookEvent }) => {
  const { selectedCity } = useAuth();
  const [eventsList, setEventsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef(null);

  // Booking Modal State
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    let isCancelled = false;

    // Safety Timeout: Never keep user stuck on infinite loading spinner
    const timer = setTimeout(() => {
      if (!isCancelled) setLoading(false);
    }, 6000);

    try {
      const res = await API.get('/events', {
        params: { city: selectedCity || 'Surat', t: Date.now() }
      });
      if (!isCancelled) {
        if (res.data && Array.isArray(res.data)) {
          setEventsList(res.data);
        } else if (res.data && Array.isArray(res.data?.events)) {
          setEventsList(res.data.events);
        } else {
          setEventsList([]);
        }
      }
    } catch (err) {
      console.warn('⚠️ Error fetching live events from MongoDB Atlas:', err.message);
      if (!isCancelled) setEventsList([]);
    } finally {
      clearTimeout(timer);
      if (!isCancelled) setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();

    let socket = null;
    try {
      const SOCKET_BASE = API_BASE.replace('/api', '');
      socket = io(SOCKET_BASE, { transports: ['websocket', 'polling'] });
      socket.on('EVENT_UPDATED', (updatedEvent) => {
        if (updatedEvent && updatedEvent.id) {
          setEventsList(prev => {
            const exists = prev.some(e => e.id === updatedEvent.id);
            if (exists) return prev.map(e => e.id === updatedEvent.id ? { ...e, ...updatedEvent } : e);
            return [updatedEvent, ...prev];
          });
        } else {
          fetchEvents();
        }
      });
      socket.on('EVENT_DELETED', (data) => {
        if (data && data.id) {
          setEventsList(prev => prev.filter(e => e.id !== data.id));
        } else {
          fetchEvents();
        }
      });
    } catch (e) {}

    return () => {
      if (socket) socket.disconnect();
    };
  }, [selectedCity]);

  const categories = ['All', 'Live Concert', 'Standup Comedy', 'Music Concert', 'Expo', 'Workshop', 'Sports', 'Festival', 'Exhibition'];

  const filteredEvents = eventsList.filter(ev => {
    const matchesCity = !selectedCity || selectedCity === 'All' || 
                        (ev.city || '').trim().toLowerCase() === selectedCity.trim().toLowerCase() || 
                        ev.city === 'All';
    const matchesCat = activeCategory === 'All' || ev.category === activeCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
                          ev.title?.toLowerCase().includes(q) || 
                          ev.venue?.toLowerCase().includes(q) ||
                          ev.city?.toLowerCase().includes(q) ||
                          ev.description?.toLowerCase().includes(q) ||
                          (ev.category && ev.category.toLowerCase().includes(q));
    return matchesCity && matchesCat && matchesSearch;
  });

  const searchSuggestions = searchQuery.trim()
    ? eventsList.filter(ev => {
        const q = searchQuery.toLowerCase().trim();
        return ev.title?.toLowerCase().includes(q) ||
               ev.venue?.toLowerCase().includes(q) ||
               ev.city?.toLowerCase().includes(q) ||
               (ev.category && ev.category.toLowerCase().includes(q));
      })
    : [];

  const handleOpenBooking = (evt, e) => {
    if (e) e.stopPropagation();
    if (onSelectEvent) {
      onSelectEvent(evt.id);
    } else {
      setSelectedEvent(evt);
      setIsBookingModalOpen(true);
    }
  };

  const handleSelectSuggestion = (evt) => {
    setIsSearchFocused(false);
    if (onSelectEvent) onSelectEvent(evt.id);
    else handleOpenBooking(evt);
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
            <div className="relative flex-grow" ref={searchContainerRef}>
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 dark:text-white/40" />
              <input
                type="text"
                placeholder="Search event title, artist, or venue..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchFocused(true);
                }}
                onFocus={() => setIsSearchFocused(true)}
                className="w-full pl-10 pr-10 py-2.5 rounded-full glass-input text-xs text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-white/40"
              />
              {searchQuery && (
                <button onClick={() => { setSearchQuery(''); setIsSearchFocused(false); }} className="absolute right-3.5 top-3 text-slate-400">
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Auto-Complete Search Dropdown */}
              {isSearchFocused && searchQuery.trim() !== '' && (
                <div className="absolute top-full left-0 right-0 z-[200] mt-2 rounded-2xl bg-[#0D0F14]/95 backdrop-blur-xl border border-amber-400/30 p-2 shadow-2xl space-y-1 max-h-72 overflow-y-auto animate-fade-in">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-400 border-b border-white/10 flex items-center justify-between">
                    <span>Matching Events</span>
                    <span>{searchSuggestions.length} found</span>
                  </div>

                  {searchSuggestions.length > 0 ? (
                    searchSuggestions.map(evt => (
                      <button
                        key={evt.id}
                        onClick={() => handleSelectSuggestion(evt)}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-amber-500/10 hover:border-amber-400/30 border border-transparent flex items-center justify-between gap-3 group transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={evt.image || evt.poster || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80'}
                            alt={evt.title}
                            className="w-10 h-10 rounded-lg object-cover shrink-0 shadow-md"
                          />
                          <div>
                            <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1">{evt.title}</h4>
                            <p className="text-[10px] text-white/50 line-clamp-1">{evt.category} • {evt.venue}</p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-white/50">
                      No live events found matching "{searchQuery}"
                    </div>
                  )}
                </div>
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

        {/* Desktop Category Filter Pills */}
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

        {/* Mobile Slide-Out Filter Drawer Modal */}
        {isMobileFilterOpen && (
          <div className="fixed top-[90px] bottom-0 left-0 right-0 z-[150] md:hidden flex justify-end bg-black/80 backdrop-blur-md animate-fade-in">
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

        {/* Loading Indicator */}
        {loading && (
          <div className="text-center py-16 space-y-3">
            <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-bold text-amber-400">Loading live events from MongoDB Atlas...</p>
          </div>
        )}

        {/* Events Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredEvents.map((evt) => {
              const languagesStr = Array.isArray(evt.languages) ? evt.languages.join(', ') : (evt.languages || 'English, Hindi, Gujarati');

              return (
                <div 
                  key={evt.id}
                  onClick={() => {
                    if (onSelectEvent) onSelectEvent(evt.id);
                    else handleOpenBooking(evt);
                  }}
                  className="glass-panel rounded-3xl overflow-hidden border border-slate-300 dark:border-white/10 hover:border-amber-400/50 transition-all duration-300 group flex flex-col sm:flex-row justify-between shadow-xl cursor-pointer"
                >
                  <div className="sm:w-2/5 relative aspect-[4/3] sm:aspect-auto overflow-hidden">
                    <img
                      src={evt.image || evt.poster || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80'}
                      alt={evt.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-amber-500 text-black text-[10px] font-extrabold shadow-md uppercase">
                      {evt.badge || evt.category || 'LIVE'}
                    </div>
                  </div>

                  <div className="sm:w-3/5 p-5 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-bold">
                          {evt.category || 'Event'}
                        </span>
                        <span className="text-[10px] text-amber-300 font-semibold">
                          🗣 {languagesStr}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-amber-500 dark:group-hover:text-amber-300 transition-colors line-clamp-2 mb-2">
                        {evt.title}
                      </h3>
                      
                      <div className="space-y-1.5 text-xs text-slate-600 dark:text-white/70">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span className="line-clamp-1">{evt.venue} • <strong className="text-amber-400">{evt.city}</strong></span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span>{evt.date || evt.eventDate || 'Configured'} • {evt.time || '07:00 PM'}</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-white/50 line-clamp-2 mt-3">{evt.description || evt.synopsis}</p>
                    </div>

                    <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-500 dark:text-white/50 block">Starts From</span>
                        <span className="text-base font-black text-amber-600 dark:text-amber-400">₹{evt.price || evt.ticketPrice || 0}</span>
                      </div>

                      {evt.bookingStatus !== false ? (
                        <button
                          onClick={(e) => handleOpenBooking(evt, e)}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-black font-extrabold text-xs shadow-md shadow-amber-500/20 hover:brightness-110 transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <Ticket className="w-3.5 h-3.5" />
                          <span>Book Passes</span>
                        </button>
                      ) : (
                        <button
                          disabled
                          className="px-4 py-2 rounded-xl bg-slate-700/50 text-slate-400 font-extrabold text-xs cursor-not-allowed flex items-center gap-1.5 border border-slate-600/30"
                        >
                          <span>🔴 Booking Closed</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && filteredEvents.length === 0 && (
          <div className="text-center py-16 glass-panel rounded-3xl border border-slate-300 dark:border-white/10 p-6 max-w-lg mx-auto">
            <Sparkles className="w-10 h-10 text-amber-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">No active events in {selectedCity || 'this city'} currently</h3>
            <p className="text-xs text-slate-500 dark:text-white/60">No active events in {selectedCity || 'this city'} currently. Switch city to explore more live concerts and shows.</p>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {isBookingModalOpen && selectedEvent && (
        <EventBookingModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          event={selectedEvent}
          onBookingSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
};
