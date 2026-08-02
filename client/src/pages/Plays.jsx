import React, { useState, useEffect } from 'react';
import { Theater, Calendar, MapPin, Ticket, Search, Filter, Sparkles, Globe, X, RefreshCw, MoreVertical, SlidersHorizontal, Check } from 'lucide-react';
import axios from 'axios';
import { PlayBookingModal } from '../components/PlayBookingModal';

const API_BASE = import.meta.env.VITE_API_BASE_URL || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : 'https://primeshow-backend.onrender.com/api');

export const Plays = () => {
  const [playsList, setPlaysList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLanguage, setActiveLanguage] = useState('All');
  const [activeCategory, setActiveCategory] = useState('All');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

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
  const categories = ['All', 'Comedy', 'Drama', 'Musical', 'Classic'];

  const handleResetFilters = () => {
    setActiveLanguage('All');
    setActiveCategory('All');
    setSearchQuery('');
  };

  const filteredPlays = playsList.filter(pl => {
    const matchesLang = activeLanguage === 'All' || pl.language?.toLowerCase() === activeLanguage.toLowerCase();
    const matchesCat = activeCategory === 'All' || (pl.category && pl.category.toLowerCase().includes(activeCategory.toLowerCase()));
    
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
                          pl.title?.toLowerCase().includes(q) || 
                          pl.venue?.toLowerCase().includes(q) ||
                          pl.language?.toLowerCase().includes(q) ||
                          pl.description?.toLowerCase().includes(q) ||
                          (pl.category && pl.category.toLowerCase().includes(q));

    return matchesLang && matchesCat && matchesSearch;
  });

  const handleOpenBooking = (play) => {
    setSelectedPlay(play);
    setIsBookingModalOpen(true);
  };

  const handleBookingSuccess = async () => {
    fetchPlays();
  };

  const activeFilterCount = (activeLanguage !== 'All' ? 1 : 0) + (activeCategory !== 'All' ? 1 : 0);
  const hasActiveFilters = activeFilterCount > 0 || searchQuery.trim() !== '';

  return (
    <div className="min-h-screen bg-[#050508]/90 text-slate-900 dark:text-white pt-6 sm:pt-8 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Header Title */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold font-sans text-slate-900 dark:text-white mb-1">Theater Plays & Drama Shows</h1>
            <p className="text-xs text-amber-600 dark:text-amber-300 font-semibold">Book iconic Gujarati, Hindi, Marathi, and English stage plays & musicals</p>
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="px-3.5 py-1.5 rounded-full bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Search & Filter Bar */}
        <div className="glass-panel p-4 md:p-6 rounded-2xl sm:rounded-3xl border border-slate-300 dark:border-white/10 mb-6 sm:mb-8 space-y-4 shadow-2xl">
          
          {/* Reactive Search Input + Mobile Three-Dot / Filter Drawer Button */}
          <div className="flex items-center gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 dark:text-white/40" />
              <input
                type="text"
                placeholder="Search play title, language, drama genre, or venue..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-3 rounded-xl sm:rounded-2xl glass-input text-xs text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-white/40"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-3.5 text-slate-400">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Mobile Three-Dot / Filter Drawer Button */}
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="md:hidden p-3 rounded-xl bg-amber-500/20 text-amber-500 border border-amber-500/30 flex items-center justify-center gap-1 font-bold text-xs cursor-pointer transition-all shrink-0"
              title="Open Filter Menu"
            >
              <MoreVertical className="w-5 h-5 text-amber-400" />
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-amber-500 text-black text-[10px] font-black flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Desktop Filter Rows (Hidden on mobile < 768px as requested) */}
          <div className="hidden md:block space-y-4 pt-3 border-t border-slate-200 dark:border-white/10">
            
            {/* Language Selection */}
            <div>
              <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Globe className="w-3 h-3" />
                <span>Play Language</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {languages.map(lang => (
                  <button
                    key={lang}
                    onClick={() => setActiveLanguage(lang)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      activeLanguage === lang
                        ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                        : 'bg-slate-200/60 dark:bg-white/5 hover:bg-slate-300 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-white/10'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            {/* Genre Selection */}
            <div>
              <div className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Theater className="w-3 h-3" />
                <span>Drama Genre</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      activeCategory === cat
                        ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                        : 'bg-slate-200/60 dark:bg-white/5 hover:bg-slate-300 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-white/10'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Mobile Slide-Out Filter Drawer Modal (md:hidden) */}
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-[150] md:hidden flex justify-end bg-black/80 backdrop-blur-md animate-fade-in">
            <div className="w-5/6 max-w-xs h-full bg-[#0D0F14] border-l border-white/15 p-5 shadow-2xl flex flex-col justify-between overflow-y-auto z-[160] animate-slide-left">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-bold uppercase tracking-wider text-amber-400">Play Filters</span>
                  </div>
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="p-2 rounded-full bg-white/10 text-white hover:bg-rose-500/20 hover:text-rose-400 transition-all cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Language Selection */}
                  <div>
                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2.5">Play Language</h4>
                    <div className="flex flex-wrap gap-2">
                      {languages.map(lang => (
                        <button
                          key={lang}
                          onClick={() => setActiveLanguage(lang)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            activeLanguage === lang
                              ? 'bg-amber-500 text-black shadow-md'
                              : 'bg-white/5 border border-white/10 text-white/70'
                          }`}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Drama Genre Selection */}
                  <div>
                    <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-2.5">Drama Genre</h4>
                    <div className="flex flex-wrap gap-2">
                      {categories.map(cat => (
                        <button
                          key={cat}
                          onClick={() => setActiveCategory(cat)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            activeCategory === cat
                              ? 'bg-cyan-500 text-black shadow-md'
                              : 'bg-white/5 border border-white/10 text-white/70'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 space-y-2">
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 text-black font-extrabold text-xs shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  Apply Filters ({filteredPlays.length} Plays)
                </button>
                {activeFilterCount > 0 && (
                  <button
                    onClick={handleResetFilters}
                    className="w-full py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 text-xs font-bold cursor-pointer"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Plays Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPlays.map((play) => (
            <div 
              key={play.id}
              className="glass-panel rounded-3xl overflow-hidden border border-slate-300 dark:border-white/10 hover:border-amber-400/50 transition-all duration-300 group flex flex-col sm:flex-row justify-between shadow-xl"
            >
              <div className="sm:w-2/5 relative aspect-[4/3] sm:aspect-auto overflow-hidden">
                <img
                  src={play.image}
                  alt={play.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-purple-500 text-white text-[10px] font-extrabold shadow-md">
                  {play.language}
                </div>
              </div>

              <div className="sm:w-3/5 p-5 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-400/30 text-amber-300 text-[10px] font-bold">
                      {play.category}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-amber-500 dark:group-hover:text-amber-300 transition-colors line-clamp-2 mb-2">
                    {play.title}
                  </h3>
                  
                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-white/70">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="line-clamp-1">{play.venue}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>{play.date} • {play.time}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-white/50 line-clamp-2 mt-3">{play.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-white/50 block">Ticket Price</span>
                    <span className="text-base font-black text-amber-600 dark:text-amber-400">₹{play.price}</span>
                  </div>

                  <button
                    onClick={() => handleOpenBooking(play)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-black font-extrabold text-xs shadow-md shadow-amber-500/20 hover:brightness-110 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Ticket className="w-3.5 h-3.5" />
                    <span>Book Play</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredPlays.length === 0 && (
          <div className="text-center py-16 glass-panel rounded-3xl border border-slate-300 dark:border-white/10 p-6">
            <Theater className="w-10 h-10 text-amber-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">No plays match your filter criteria</h3>
            <p className="text-xs text-slate-500 dark:text-white/60">Try choosing a different language or drama genre.</p>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {isBookingModalOpen && selectedPlay && (
        <PlayBookingModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          playItem={selectedPlay}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
};
