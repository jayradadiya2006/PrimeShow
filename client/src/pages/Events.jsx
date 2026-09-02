import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Calendar, MapPin, Ticket, Search, Filter, Clock, ArrowRight, X, MoreVertical, SlidersHorizontal, Check } from 'lucide-react';
import { io } from 'socket.io-client';
import { EventBookingModal } from '../components/EventBookingModal';
import { useAuth } from '../context/AuthContext';
import API, { API_BASE } from '../services/api';

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
    const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    if (isLocal) {
      try {
        socket = io('http://localhost:5000', {
          transports: ['polling', 'websocket'],
          autoConnect: false,
          reconnection: false
        });
        socket.on('connect_error', () => {});
      } catch (e) {}
    }

    if (socket) {
      socket.on('connect_error', () => {});
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
    }

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
    <div className="min-h-screen bg-[#FFFFFF] text-slate-900 pt-6 sm:pt-8 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Header Title */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold font-sans text-slate-900 mb-1">Live Events & Concerts</h1>
            <p className="text-xs text-[#D90000] font-semibold">Book tickets for stadium concerts, comedy shows, music festivals, and live performances</p>
          </div>

          {/* Search Bar + Mobile Three-Dot / Filter Drawer Button */}
          <div className="flex items-center gap-2 w-full md:w-80">
            <div className="relative flex-grow" ref={searchContainerRef}>
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search event title, artist, or venue..."
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
                    <span>Matching Events</span>
                    <span>{searchSuggestions.length} found</span>
                  </div>

                  {searchSuggestions.length > 0 ? (
                    searchSuggestions.map(evt => (
                      <button
                        key={evt.id}
                        onClick={() => handleSelectSuggestion(evt)}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-[#DBCEA5]/40 border border-transparent flex items-center justify-between gap-3 group transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={evt.image || evt.poster || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80'}
                            alt={evt.title}
                            className="w-10 h-10 rounded-lg object-cover shrink-0 shadow-md"
                          />
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#D90000] transition-colors line-clamp-1">{evt.title}</h4>
                            <p className="text-[10px] text-slate-600 line-clamp-1">{evt.category} • {evt.venue}</p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#D90000] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-500">
                      No live events found matching "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Three-Dot / Filter Drawer Button */}
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="md:hidden p-2.5 rounded-full bg-[#D90000] text-white flex items-center justify-center shrink-0 cursor-pointer shadow-md"
              title="Filter Event Categories"
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
                  ? 'bg-[#D90000] text-white font-extrabold shadow-md scale-105'
                  : 'bg-[#2B2B2B] hover:bg-[#4A4A4A] text-white border border-slate-700'
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

            <div className="relative w-5/6 max-w-xs h-full bg-[#DBCEA5] border-l border-[#c5ba92] p-5 shadow-2xl flex flex-col justify-between overflow-y-auto z-[160] animate-slide-left text-[#1A1A1A]">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-[#c5ba92] mb-6">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-5 h-5 text-[#D90000]" />
                    <span className="text-sm font-black uppercase tracking-wider text-[#1A1A1A]">Event Category</span>
                  </div>
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="p-2.5 rounded-full bg-[#D90000] text-white hover:bg-[#b00000] transition-all cursor-pointer shadow-lg flex items-center justify-center shrink-0"
                    title="Close Filters"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-black text-[#1A1A1A] uppercase tracking-widest mb-2.5">Select Category</h4>
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
                            : 'bg-[#2B2B2B] hover:bg-[#4A4A4A] text-white'
                        }`}
                      >
                        <span>{cat}</span>
                        {activeCategory === cat && <Check className="w-4 h-4 text-white" />}
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
                  Apply Category ({filteredEvents.length} Events)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="text-center py-16 space-y-3">
            <div className="w-8 h-8 border-4 border-[#D90000] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-bold text-[#D90000]">Loading live events from MongoDB Atlas...</p>
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
                  className="bg-[#DBCEA5] rounded-3xl overflow-hidden border border-[#c5ba92] hover:border-[#D90000] transition-all duration-300 group flex flex-col sm:flex-row justify-between shadow-md cursor-pointer text-slate-900"
                >
                  <div className="sm:w-2/5 relative aspect-[4/3] sm:aspect-auto overflow-hidden">
                    <img
                      src={evt.image || evt.poster || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80'}
                      alt={evt.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#D90000] text-white text-[10px] font-extrabold shadow-md uppercase">
                      {evt.badge || evt.category || 'LIVE'}
                    </div>
                  </div>

                  <div className="sm:w-3/5 p-5 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="px-2 py-0.5 rounded bg-white text-slate-900 text-[10px] font-bold border border-slate-300">
                          {evt.category || 'Event'}
                        </span>
                        <span className="text-[10px] text-slate-800 font-semibold">
                          🗣 {languagesStr}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#D90000] transition-colors line-clamp-2 mb-2">
                        {evt.title}
                      </h3>
                      
                      <div className="space-y-1.5 text-xs text-slate-800">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-[#D90000] shrink-0" />
                          <span className="line-clamp-1">{evt.venue} • <strong className="text-slate-900">{evt.city}</strong></span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-[#D90000] shrink-0" />
                          <span>{evt.date || evt.eventDate || 'Configured'} • {evt.time || '07:00 PM'}</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-700 line-clamp-2 mt-3">{evt.description || evt.synopsis}</p>
                    </div>

                    <div className="pt-3 border-t border-[#c5ba92] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-700 block">Starts From</span>
                        <span className="text-base font-black text-[#D90000]">₹{evt.price || evt.ticketPrice || 0}</span>
                      </div>

                      {evt.bookingStatus !== false ? (
                        <button
                          onClick={(e) => handleOpenBooking(evt, e)}
                          className="px-4 py-2 rounded-xl bg-[#D90000] hover:bg-[#b00000] text-white font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <Ticket className="w-3.5 h-3.5" />
                          <span>Book Passes</span>
                        </button>
                      ) : (
                        <button
                          disabled
                          className="px-4 py-2 rounded-xl bg-slate-400 text-slate-700 font-extrabold text-xs cursor-not-allowed flex items-center gap-1.5 border border-slate-400/30"
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
          <div className="text-center py-16 bg-[#DBCEA5] rounded-3xl border border-[#c5ba92] p-6 max-w-lg mx-auto space-y-3 text-slate-900 shadow-md">
            <Sparkles className="w-10 h-10 text-[#D90000] mx-auto" />
            <h3 className="text-base font-bold text-slate-900 mb-1">No active events matching "{activeCategory !== 'All' ? activeCategory : (selectedCity || 'this city')}"</h3>
            <p className="text-xs text-slate-700">No specific events found for this filter. Switch city or clear filters to explore live concerts and shows.</p>
            <button
              onClick={() => {
                setActiveCategory('All');
                setSearchQuery('');
                fetchEvents();
              }}
              className="mt-2 px-6 py-2.5 rounded-full bg-[#D90000] hover:bg-[#b00000] text-white font-extrabold text-xs shadow-lg transition cursor-pointer"
            >
              Explore All Live Events & Concerts
            </button>
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
