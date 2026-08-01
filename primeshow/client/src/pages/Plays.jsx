import React, { useState, useEffect } from 'react';
import { Theater, Calendar, MapPin, Ticket, Search, Filter, Sparkles, Globe } from 'lucide-react';
import axios from 'axios';
import { PlayBookingModal } from '../components/PlayBookingModal';

const API_BASE = 'http://localhost:5000/api';

export const Plays = () => {
  const [playsList, setPlaysList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLanguage, setActiveLanguage] = useState('All');
  const [activeCategory, setActiveCategory] = useState('All');

  // Booking Modal State
  const [selectedPlay, setSelectedPlay] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const fetchPlays = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/plays`);
      setPlaysList(res.data);
    } catch (err) {
      setPlaysList([
        {
          id: 'pl_1',
          title: 'Gujjubhai Banya Dabang',
          language: 'Gujarati',
          category: 'Comedy Drama',
          badge: 'HOT SELLER',
          venue: 'Royal Opera House, Mumbai',
          city: 'Mumbai',
          date: '14 FEB 2027',
          time: '08:00 PM',
          price: 600,
          totalCapacity: 1200,
          availableSeats: 340,
          image: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=800&q=80',
          description: 'Siddharth Randeria returns as the hilarious Gujjubhai in an action-packed Gujarati family comedy play that will leave you in splits!'
        },
        {
          id: 'pl_2',
          title: 'Mughal-E-Azam: The Grand Musical',
          language: 'Hindi',
          category: 'Musical Drama',
          badge: 'PREMIERE',
          venue: 'NCPA Theatre, Nariman Point, Mumbai',
          city: 'Mumbai',
          date: '20 FEB 2027',
          time: '07:30 PM',
          price: 1500,
          totalCapacity: 1500,
          availableSeats: 210,
          image: 'https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?auto=format&fit=crop&w=800&q=80',
          description: 'Feroz Abbas Khan\'s iconic Broadway-style Indian musical featuring live singing, Manish Malhotra costumes, and breathtaking Kathak dance performances.'
        },
        {
          id: 'pl_3',
          title: 'Hamlet: Shakespeare Masterpiece',
          language: 'English',
          category: 'Classic Tragedy',
          badge: 'CRITICS CHOICE',
          venue: 'Kashinath Ghanekar Natyagruha, Thane',
          city: 'Mumbai',
          date: '02 MAR 2027',
          time: '06:00 PM',
          price: 800,
          totalCapacity: 900,
          availableSeats: 450,
          image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
          description: 'A gripping modern theatrical adaptation of William Shakespeare\'s psychological revenge masterpiece directed by award-winning theater veterans.'
        },
        {
          id: 'pl_4',
          title: 'Sahi Re Sahi - Legendary Comedy',
          language: 'Marathi',
          category: 'Comedy',
          badge: 'HOUSEFULL SOON',
          venue: 'Vishnudas Bhave Natyagruh, Navi Mumbai',
          city: 'Mumbai',
          date: '10 MAR 2027',
          time: '08:30 PM',
          price: 500,
          totalCapacity: 1100,
          availableSeats: 180,
          image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
          description: 'Bharat Jadhav plays quadruple roles in Maharashtra\'s record-breaking theatrical comedy extravaganza about mistaken identities and hilarious chaos.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlays();
  }, []);

  const languages = ['All', 'Gujarati', 'Hindi', 'English', 'Marathi'];
  const categories = ['All', 'Drama', 'Comedy', 'Musical', 'Classic'];

  const filteredPlays = playsList.filter(pl => {
    const matchesLang = activeLanguage === 'All' || pl.language === activeLanguage;
    const matchesCat = activeCategory === 'All' || (pl.category && pl.category.includes(activeCategory));
    const matchesSearch = pl.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          pl.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (pl.language && pl.language.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (pl.category && pl.category.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesLang && matchesCat && matchesSearch;
  });

  const handleOpenBooking = (play) => {
    setSelectedPlay(play);
    setIsBookingModalOpen(true);
  };

  const handleBookingSuccess = async () => {
    fetchPlays();
  };

  return (
    <div className="min-h-screen bg-[#050508] text-white pt-8 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Header Title */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold font-serif text-white mb-2">Theater Plays & Drama Shows</h1>
            <p className="text-xs text-amber-300">Book iconic Gujarati, Hindi, Marathi, and English stage plays & musicals</p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search plays, drama, theater..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full glass-input text-xs text-white placeholder-white/40"
            />
          </div>
        </div>

        {/* Filter Bar: Languages & Categories */}
        <div className="space-y-3 mb-8">
          {/* Languages Row */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span className="text-white/40 text-[11px] uppercase tracking-wider font-bold mr-2 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-amber-400" /> Language:
            </span>
            {languages.map(l => {
              const isActive = activeLanguage === l;
              return (
                <button
                  key={l}
                  onClick={() => setActiveLanguage(l)}
                  className={`px-4 py-1.5 rounded-full transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20'
                      : 'glass-panel text-white/70 hover:text-white hover:bg-white/10 border border-white/10'
                  }`}
                >
                  {l}
                </button>
              );
            })}
          </div>

          {/* Categories Row */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span className="text-white/40 text-[11px] uppercase tracking-wider font-bold mr-2 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-purple-400" /> Genre:
            </span>
            {categories.map(c => {
              const isActive = activeCategory === c;
              return (
                <button
                  key={c}
                  onClick={() => setActiveCategory(c)}
                  className={`px-3.5 py-1 rounded-full transition-all whitespace-nowrap text-[11px] cursor-pointer ${
                    isActive
                      ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-500/20'
                      : 'glass-panel text-white/60 hover:text-white border border-white/10'
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>

        {/* Plays Grid */}
        {loading ? (
          <div className="text-center py-16">
            <div className="w-10 h-10 rounded-full border-4 border-amber-400 border-t-transparent animate-spin mx-auto mb-4"></div>
            <p className="text-xs text-amber-300 font-bold uppercase tracking-widest">Loading Theater Plays Showcase...</p>
          </div>
        ) : filteredPlays.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlays.map(pl => (
              <div 
                key={pl.id} 
                className="glass-panel rounded-3xl overflow-hidden border border-white/10 hover:border-amber-400/50 transition-all flex flex-col justify-between shadow-xl"
              >
                <div>
                  <div className="relative h-56 overflow-hidden">
                    <img src={pl.image} alt={pl.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#090a12] via-transparent to-transparent"></div>
                    
                    <div className="absolute top-4 left-4 flex gap-1.5">
                      <span className="px-3 py-1 rounded-full bg-purple-600/90 text-white font-bold text-[10px] uppercase backdrop-blur-md">
                        {pl.language}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 font-bold text-[10px] uppercase backdrop-blur-md">
                        {pl.category}
                      </span>
                    </div>

                    {/* Dynamic Corner Tap / Badge */}
                    {pl.badge && pl.badge !== 'None' && (
                      <span className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg backdrop-blur-md border ${
                        pl.badge === 'HOT SELLER' ? 'bg-amber-500 text-black border-amber-300 font-extrabold' :
                        pl.badge === 'HOUSEFULL SOON' ? 'bg-rose-500 text-white border-rose-400 animate-pulse' :
                        pl.badge === 'PREMIERE' ? 'bg-purple-600 text-white border-purple-400' :
                        'bg-emerald-500 text-black border-emerald-300 font-extrabold'
                      }`}>
                        🎭 {pl.badge}
                      </span>
                    )}
                  </div>

                  <div className="p-6 space-y-3">
                    <h3 className="text-xl font-bold font-serif text-white line-clamp-1">{pl.title}</h3>
                    <p className="text-xs text-white/60 line-clamp-2 leading-relaxed">{pl.description}</p>

                    <div className="text-xs text-white/70 space-y-1.5 pt-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>{pl.date} @ {pl.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="truncate">{pl.venue}</span>
                      </div>
                      <div className="flex items-center justify-between pt-1 text-[11px]">
                        <span className="text-white/50">Theater Seat Capacity:</span>
                        <span className="font-bold text-emerald-400">
                          {pl.availableSeats ? `${pl.availableSeats.toLocaleString('en-IN')} seats available` : 'Seats Available'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-white/10 mt-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-white/50 block">Play Ticket Rate</span>
                    <span className="text-lg font-bold font-sans text-amber-400">₹{Number(pl.price).toLocaleString('en-IN')} <span className="text-[10px] font-normal text-white/60">/ ticket</span></span>
                  </div>

                  {/* Fixed Click Handler */}
                  <button
                    onClick={() => handleOpenBooking(pl)}
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
            No theater plays found matching your filter criteria.
          </div>
        )}

      </div>

      {/* Dynamic Play Booking Modal */}
      {isBookingModalOpen && (
        <PlayBookingModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          play={selectedPlay}
          onBookingSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
};
