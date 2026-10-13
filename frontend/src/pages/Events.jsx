import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Calendar, MapPin, Ticket, Search, Filter, Clock, ArrowRight, X, MoreVertical, SlidersHorizontal, Check } from 'lucide-react';
import { io } from 'socket.io-client';
import { EventBookingModal } from '../components/EventBookingModal';
import { useAuth } from '../context/AuthContext';
import API, { API_BASE } from '../services/api';

const getSocketBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, '').replace(/\/api$/, '');
  }
  return typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5000'
    : '';
};
const SOCKET_BASE = getSocketBaseUrl();

const DEFAULT_GUJARAT_EVENTS = [
  {
    id: "ev_surat_garba",
    title: "Garba Nights: Rangilo Gujarat",
    category: "Live Concert",
    badge: "SELLING FAST",
    languages: ["Gujarati", "Hindi"],
    city: "Surat",
    venue: "SIECC Convention Centre, Sarsana, Surat",
    date: "2026-10-24",
    time: "07:00 PM",
    price: 799,
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80",
    description: "A festive Gujarati garba night with live singers, traditional music and a massive dance floor."
  },
  {
    id: "ev_ahmedabad_indie",
    title: "Ahmedabad Indie Music Festival",
    category: "Music Concert",
    badge: "LIVE",
    languages: ["Hindi", "English", "Gujarati"],
    city: "Ahmedabad",
    venue: "EKA Club, Kankaria, Ahmedabad",
    date: "2026-11-07",
    time: "06:30 PM",
    price: 1299,
    image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=800&q=80",
    description: "An evening of indie music, emerging artists, food stalls and live performances."
  },
  {
    id: "ev_rajkot_rock",
    title: "Rajkot Rock & Rhythm Live",
    category: "Live Concert",
    badge: "NEW",
    languages: ["Gujarati", "Hindi"],
    city: "Rajkot",
    venue: "Race Course Ground, Rajkot",
    date: "2026-11-14",
    time: "07:00 PM",
    price: 599,
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80",
    description: "A high-energy regional music event featuring live bands and popular Gujarati tracks."
  },
  {
    id: "ev_vadodara_beats",
    title: "Vadodara Cultural Beats",
    category: "Live Concert",
    badge: "POPULAR",
    languages: ["Gujarati", "Hindi"],
    city: "Vadodara",
    venue: "Navlakhi Ground, Vadodara",
    date: "2026-10-31",
    time: "06:00 PM",
    price: 499,
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80",
    description: "A family-friendly evening showcasing folk dance, music and regional performances."
  },
  {
    id: "ev_gandhinagar_comedy",
    title: "Gandhinagar Comedy Night",
    category: "Standup Comedy",
    badge: "LIVE",
    languages: ["Gujarati", "Hindi"],
    city: "Gandhinagar",
    venue: "Mahatma Mandir, Gandhinagar",
    date: "2026-11-21",
    time: "07:30 PM",
    price: 399,
    image: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=800&q=80",
    description: "A stand-up comedy evening with observational humour and Gujarati crowd interaction."
  },
  {
    id: "ev_bhavnagar_folk",
    title: "Bhavnagar Folk Music Evening",
    category: "Music Concert",
    badge: "NEW",
    languages: ["Gujarati"],
    city: "Bhavnagar",
    venue: "Town Hall, Bhavnagar",
    date: "2026-11-28",
    time: "06:30 PM",
    price: 299,
    image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=800&q=80",
    description: "An intimate folk music programme celebrating Gujarati melodies and traditional instruments."
  },
  {
    id: "ev_jamnagar_fest",
    title: "Jamnagar Dance & Music Fest",
    category: "Live Concert",
    badge: "SELLING FAST",
    languages: ["Gujarati", "Hindi"],
    city: "Jamnagar",
    venue: "Darbargadh Grounds, Jamnagar",
    date: "2026-12-05",
    time: "06:00 PM",
    price: 449,
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80",
    description: "A lively regional festival with dance performances, music and local food vendors."
  },
  {
    id: "ev_anand_youth",
    title: "Anand Youth Live Sessions",
    category: "Music Concert",
    badge: "LIVE",
    languages: ["Gujarati", "Hindi", "English"],
    city: "Anand",
    venue: "Shastri Maidan, Anand",
    date: "2026-12-12",
    time: "06:30 PM",
    price: 349,
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80",
    description: "College youth music fest featuring live rock and fusion tracks."
  },
  {
    id: "ev_junagadh_heritage",
    title: "Girnar Heritage Musical Night",
    category: "Music Concert",
    badge: "POPULAR",
    languages: ["Gujarati"],
    city: "Junagadh",
    venue: "Bahauddin College Grounds, Junagadh",
    date: "2026-12-19",
    time: "07:00 PM",
    price: 399,
    image: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=800&q=80",
    description: "Sufi and Santvani musical night under the stars in the historic town of Junagadh."
  },
  {
    id: "ev_navsari_art",
    title: "South Gujarat Art & Cultural Expo",
    category: "Expo",
    badge: "NEW",
    languages: ["Gujarati", "English"],
    city: "Navsari",
    venue: "Lunsikui Ground, Navsari",
    date: "2026-12-26",
    time: "10:00 AM",
    price: 199,
    image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80",
    description: "Exhibition displaying handlooms, handicrafts, live pottery, and organic regional goods."
  },
  {
    id: "ev_morbi_ceramic",
    title: "Morbi Rock & Beats Concert",
    category: "Live Concert",
    badge: "SELLING FAST",
    languages: ["Hindi", "Gujarati"],
    city: "Morbi",
    venue: "Circuit House Grounds, Morbi",
    date: "2027-01-02",
    time: "07:30 PM",
    price: 499,
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80",
    description: "Electric live performance featuring powerhouse percussionists and live synthesizers."
  },
  {
    id: "ev_surat_standup",
    title: "Surat Laugh Riot: Live Standup",
    category: "Standup Comedy",
    badge: "HOT SELLER",
    languages: ["Gujarati", "Hindi"],
    city: "Surat",
    venue: "Sanjeev Kumar Auditorium, Pal, Surat",
    date: "2027-01-09",
    time: "08:00 PM",
    price: 599,
    image: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=800&q=80",
    description: "90 minutes of nonstop laughter by Gujarat’s top viral stand-up comedians."
  }
];

export const Events = ({ onSelectEvent, onBookEvent }) => {
  const { selectedCity } = useAuth();
  const [eventsList, setEventsList] = useState(DEFAULT_GUJARAT_EVENTS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCity, setActiveCity] = useState('All');
  const [activeCategory, setActiveCategory] = useState('All');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef(null);

  // Booking Modal State
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const fetchEvents = async () => {
    try {
      const res = await API.get('/events', {
        params: { t: Date.now() }
      });
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        setEventsList(res.data);
      } else if (res.data && Array.isArray(res.data?.events) && res.data.events.length > 0) {
        setEventsList(res.data.events);
      }
    } catch (err) {
      console.warn('⚠️ Error fetching live events:', err.message);
    }
  };

  useEffect(() => {
    fetchEvents();

    let socket = null;
    try {
      socket = io(SOCKET_BASE, {
        transports: ['polling', 'websocket'],
        autoConnect: true,
        reconnectionAttempts: 5,
        timeout: 5000
      });
      socket.on('connect_error', () => {});

      const handleEventUpdate = (updatedEvent) => {
        if (!updatedEvent) {
          fetchEvents();
          return;
        }
        if (updatedEvent.deletedId) {
          setEventsList(prev => prev.filter(e => e.id !== updatedEvent.deletedId && e._id !== updatedEvent.deletedId));
          return;
        }
        if (updatedEvent.id || updatedEvent._id) {
          const docId = updatedEvent.id || updatedEvent._id;
          setEventsList(prev => {
            const exists = prev.some(e => e.id === docId || e._id === docId);
            if (exists) return prev.map(e => (e.id === docId || e._id === docId) ? { ...e, ...updatedEvent } : e);
            return [updatedEvent, ...prev];
          });
        } else {
          fetchEvents();
        }
      };

      socket.on('EVENT_UPDATED', handleEventUpdate);
      socket.on('EVENTS_UPDATED', handleEventUpdate);
      socket.on('EVENT_DELETED', (data) => {
        const idToDelete = data?.id || data?.deletedId;
        if (idToDelete) {
          setEventsList(prev => prev.filter(e => e.id !== idToDelete && e._id !== idToDelete));
        } else {
          fetchEvents();
        }
      });
      socket.on('EVENTS_DELETED', (data) => {
        const idToDelete = data?.id || data?.deletedId;
        if (idToDelete) {
          setEventsList(prev => prev.filter(e => e.id !== idToDelete && e._id !== idToDelete));
        } else {
          fetchEvents();
        }
      });
      socket.on('GLOBAL_ADMIN_UPDATE', () => fetchEvents());
    } catch (e) {}

    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  const citiesList = ['All', 'Surat', 'Ahmedabad', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Gandhinagar', 'Jamnagar', 'Anand', 'Junagadh', 'Navsari', 'Morbi'];
  const categories = ['All', 'Live Concert', 'Music Concert', 'Standup Comedy', 'Cultural Event', 'Expo', 'Workshop', 'Sports', 'Festival'];

  const filteredEvents = eventsList.filter(ev => {
    const matchesCity = activeCity === 'All' 
      ? true 
      : (ev.city || '').trim().toLowerCase() === activeCity.trim().toLowerCase();
    const matchesCat = activeCategory === 'All' || 
                       (ev.category || '').toLowerCase().includes(activeCategory.toLowerCase());
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

        {/* City Filter Pills */}
        <div className="flex overflow-x-auto gap-2 pb-2 mb-3 text-xs font-semibold scrollbar-none items-center">
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 font-bold shrink-0 text-[11px] border border-slate-200">
            <MapPin className="w-3.5 h-3.5 text-[#D90000]" />
            <span>City:</span>
          </div>
          {citiesList.map(city => (
            <button
              key={city}
              onClick={() => setActiveCity(city)}
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer shrink-0 text-xs ${
                activeCity === city
                  ? 'bg-[#D90000] text-white font-extrabold shadow-md scale-105'
                  : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-300'
              }`}
            >
              {city}
            </button>
          ))}
        </div>

        {/* Desktop Category Filter Pills */}
        <div className="hidden md:flex overflow-x-auto gap-2 pb-4 mb-8 text-xs font-semibold scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full transition-all cursor-pointer shrink-0 ${
                activeCategory === cat
                  ? 'bg-[#2B2B2B] text-white font-extrabold shadow-md scale-105 border border-slate-900'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
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
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#c5ba92]">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-5 h-5 text-[#D90000]" />
                    <span className="text-sm font-black uppercase tracking-wider text-[#1A1A1A]">Filters</span>
                  </div>
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="p-2.5 rounded-full bg-[#D90000] text-white hover:bg-[#b00000] transition-all cursor-pointer shadow-lg flex items-center justify-center shrink-0"
                    title="Close Filters"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>

                {/* City Selection */}
                <div>
                  <h4 className="text-xs font-black text-[#1A1A1A] uppercase tracking-widest mb-2">City</h4>
                  <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto p-1">
                    {citiesList.map(city => (
                      <button
                        key={city}
                        onClick={() => setActiveCity(city)}
                        className={`p-2 rounded-xl text-xs font-bold transition-all text-left ${
                          activeCity === city
                            ? 'bg-[#D90000] text-white'
                            : 'bg-white text-slate-800 border border-slate-300'
                        }`}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category Selection */}
                <div>
                  <h4 className="text-xs font-black text-[#1A1A1A] uppercase tracking-widest mb-2">Category</h4>
                  <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto p-1">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`w-full text-left p-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                          activeCategory === cat
                            ? 'bg-[#2B2B2B] text-white shadow-md'
                            : 'bg-white text-slate-800 border border-slate-300'
                        }`}
                      >
                        <span>{cat}</span>
                        {activeCategory === cat && <Check className="w-4 h-4 text-white" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#c5ba92]">
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-full py-3 rounded-2xl bg-[#D90000] hover:bg-[#b00000] text-white font-extrabold text-xs shadow-lg cursor-pointer"
                >
                  Apply Filters ({filteredEvents.length} Events)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="text-center py-16 space-y-3">
            <div className="w-8 h-8 border-4 border-[#D90000] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-bold text-[#D90000]">Loading live events from Local MongoDB...</p>
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
                      src={evt.image || evt.thumbnailImageUrl || evt.poster || evt.backdropBannerUrl || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80'}
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
          <div className="text-center py-16 bg-[#DBCEA5] rounded-3xl border border-[#c5ba92] p-8 max-w-lg mx-auto space-y-4 text-slate-900 shadow-md">
            <Sparkles className="w-12 h-12 text-[#D90000] mx-auto" />
            <h3 className="text-lg font-bold text-slate-900 mb-1">No active events in {activeCity !== 'All' ? activeCity : 'this selection'}</h3>
            <p className="text-xs text-slate-700">No events matched the chosen city or category filter. You can explore all live events and concerts across Gujarat.</p>
            <button
              onClick={() => {
                setActiveCity('All');
                setActiveCategory('All');
                setSearchQuery('');
                fetchEvents();
              }}
              className="mt-2 px-6 py-2.5 rounded-full bg-[#D90000] hover:bg-[#b00000] text-white font-extrabold text-xs shadow-lg transition cursor-pointer inline-flex items-center gap-2"
            >
              <span>Explore All Live Events & Concerts ({eventsList.length})</span>
              <ArrowRight className="w-4 h-4" />
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
