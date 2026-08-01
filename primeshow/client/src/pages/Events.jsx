import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar, MapPin, Ticket, Search, Filter, Clock, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { EventBookingModal } from '../components/EventBookingModal';

const API_BASE = 'http://localhost:5000/api';

export const Events = () => {
  const [eventsList, setEventsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

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
    const matchesSearch = ev.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ev.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (ev.category && ev.category.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleOpenBooking = (ev) => {
    setSelectedEvent(ev);
    setIsBookingModalOpen(true);
  };

  const handleBookingSuccess = async () => {
    fetchEvents();
  };

  return (
    <div className="min-h-screen bg-[#050508] text-white pt-8 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Header Title */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold font-serif text-white mb-2">Live Concerts & Stand-up Shows</h1>
            <p className="text-xs text-amber-300">Book stadium concerts, comedy specials, singing performances, and music festivals</p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search events, comedy, venue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full glass-input text-xs text-white placeholder-white/40"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex overflow-x-auto gap-2 pb-4 mb-8 text-xs font-semibold">
          {categories.map(c => {
            const isActive = activeCategory === c;
            return (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                className={`px-4 py-2 rounded-full transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20'
                    : 'glass-panel text-white/70 hover:text-white hover:bg-white/10 border border-white/10'
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="text-center py-16">
            <div className="w-10 h-10 rounded-full border-4 border-amber-400 border-t-transparent animate-spin mx-auto mb-4"></div>
            <p className="text-xs text-amber-300 font-bold uppercase tracking-widest">Loading Live Events Showcase...</p>
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map(ev => (
              <div 
                key={ev.id} 
                className="glass-panel rounded-3xl overflow-hidden border border-white/10 hover:border-amber-400/50 transition-all flex flex-col justify-between shadow-xl"
              >
                <div>
                  <div className="relative h-52 overflow-hidden">
                    <img src={ev.image} alt={ev.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#090a12] via-transparent to-transparent"></div>
                    <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 font-bold text-[10px] uppercase backdrop-blur-md">
                      {ev.category}
                    </span>

                    {/* Dynamic Corner Tap / Badge */}
                    {ev.badge && ev.badge !== 'None' && (
                      <span className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg backdrop-blur-md border ${
                        ev.badge === 'LIVE NOW' ? 'bg-rose-500/90 text-white border-rose-400 animate-pulse' :
                        ev.badge === 'LIMITED SEATS' ? 'bg-purple-600/90 text-white border-purple-400' :
                        ev.badge === 'FILLING FAST' ? 'bg-emerald-500/90 text-black border-emerald-300 font-extrabold' :
                        'bg-amber-400/90 text-black border-amber-300 font-extrabold'
                      }`}>
                        🔥 {ev.badge}
                      </span>
                    )}
                  </div>

                  <div className="p-6 space-y-3">
                    <h3 className="text-xl font-bold font-serif text-white line-clamp-1">{ev.title}</h3>
                    <p className="text-xs text-white/60 line-clamp-2 leading-relaxed">{ev.description}</p>

                    <div className="text-xs text-white/70 space-y-1.5 pt-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>{ev.date} @ {ev.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="truncate">{ev.venue}</span>
                      </div>
                      <div className="flex items-center justify-between pt-1 text-[11px]">
                        <span className="text-white/50">Capacity Status:</span>
                        <span className="font-bold text-emerald-400">
                          {ev.availableSeats ? `${ev.availableSeats.toLocaleString('en-IN')} seats available` : 'Seats Available'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-white/10 mt-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-white/50 block">Ticket Price</span>
                    <span className="text-lg font-bold font-sans text-amber-400">₹{Number(ev.price).toLocaleString('en-IN')} <span className="text-[10px] font-normal text-white/60">/ person</span></span>
                  </div>

                  {/* Fixed Responsive Interactive Click Handler */}
                  <button
                    onClick={() => handleOpenBooking(ev)}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Ticket className="w-4 h-4" />
                    <span>Book Ticket</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-panel p-12 rounded-3xl text-center text-white/50">
            No live events found matching your filter criteria.
          </div>
        )}

      </div>

      {/* Dynamic Event Booking Modal */}
      {isBookingModalOpen && (
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
