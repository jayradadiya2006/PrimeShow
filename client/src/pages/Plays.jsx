import React, { useState, useEffect, useRef } from 'react';
import { Theater, Calendar, MapPin, Ticket, Search, Filter, Sparkles, Globe, X, RefreshCw, MoreVertical, SlidersHorizontal, Check, ArrowRight } from 'lucide-react';
import API, { API_BASE } from '../services/api';
import { PlayBookingModal } from '../components/PlayBookingModal';
import { useAuth } from '../context/AuthContext';

export const Plays = () => {
  const { selectedCity } = useAuth();
  const [playsList, setPlaysList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLanguage, setActiveLanguage] = useState('All');
  const [activeCategory, setActiveCategory] = useState('All');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef(null);

  // Booking Modal State
  const [selectedPlay, setSelectedPlay] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const fetchPlays = async () => {
    setLoading(true);
    try {
      const res = await API.get('/plays');
      setPlaysList(res.data);
    } catch (err) {
      setPlaysList([
        {
          id: 'pl_surat_1',
          title: 'Gujjubhai Banya Dabang - Surat Premiere',
          language: 'Gujarati',
          category: 'Comedy Drama',
          badge: 'HOT SELLER',
          venue: 'Sardar Patel Smarak Bhavan, Surat',
          city: 'Surat',
          date: '14 FEB 2027',
          time: '08:00 PM',
          price: 600,
          totalCapacity: 1200,
          availableSeats: 340,
          image: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=800&q=80',
          description: 'Siddharth Randeria returns as the hilarious Gujjubhai in an action-packed Gujarati family comedy play in Surat.'
        },
        {
          id: 'pl_ahmedabad_1',
          title: 'Mughal-E-Azam: The Grand Musical',
          language: 'Hindi',
          category: 'Musical Drama',
          badge: 'PREMIERE',
          venue: 'Town Hall, Ellisbridge, Ahmedabad',
          city: 'Ahmedabad',
          date: '28 FEB 2027',
          time: '07:30 PM',
          price: 1500,
          totalCapacity: 2500,
          availableSeats: 620,
          image: 'https://images.unsplash.com/photo-1469488865564-c2de10f69f96?auto=format&fit=crop&w=800&q=80',
          description: 'Feroz Abbas Khan\'s broadway-style grand musical adaptation featuring original live singing, Manish Malhotra costumes, and mesmerising choreography.'
        },
        {
          id: 'pl_rajkot_1',
          title: 'Kathiyawadi Hasya Rangbhoomi',
          language: 'Gujarati',
          category: 'Comedy',
          badge: 'SUPERHIT',
          venue: 'Hemu Gadhvi Hall, Rajkot',
          city: 'Rajkot',
          date: '08 MAR 2027',
          time: '08:30 PM',
          price: 450,
          totalCapacity: 1000,
          availableSeats: 290,
          image: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=800&q=80',
          description: 'A hilarious social satire play bringing authentic Kathiyawadi humor and stellar stage performances.'
        },
        {
          id: 'pl_vadodara_1',
          title: 'Vadodara Sanskriti Natak Special',
          language: 'Gujarati',
          category: 'Drama',
          badge: 'MUST WATCH',
          venue: 'Sir Sayajirao Gaekwad Auditorium, Vadodara',
          city: 'Vadodara',
          date: '15 MAR 2027',
          time: '07:00 PM',
          price: 500,
          totalCapacity: 1200,
          availableSeats: 410,
          image: 'https://images.unsplash.com/photo-1469488865564-c2de10f69f96?auto=format&fit=crop&w=800&q=80',
          description: 'An emotional family drama highlighting traditional values, modern relationships, and artistic theatrical design.'
        },
        {
          id: 'pl_bhavnagar_1',
          title: 'Bhavnagar Lok Sahitya & Drama Night',
          language: 'Gujarati',
          category: 'Cultural',
          badge: 'CLASSIC',
          venue: 'Yashwantrai Parmar Hall, Bhavnagar',
          city: 'Bhavnagar',
          date: '22 MAR 2027',
          time: '08:00 PM',
          price: 350,
          totalCapacity: 800,
          availableSeats: 220,
          image: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=800&q=80',
          description: 'A poignant theatrical production celebrating historic folklore and classical Gujarati stagecraft.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlays();
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

  const languages = ['All', 'Gujarati', 'Hindi', 'English', 'Marathi'];
  const categories = ['All', 'Comedy Drama', 'Musical Drama', 'Historical', 'Thriller'];

  const handleResetFilters = () => {
    setActiveLanguage('All');
    setActiveCategory('All');
    setSearchQuery('');
  };

  const filteredPlays = playsList.filter(pl => {
    const matchesCity = !selectedCity || selectedCity === 'All' || pl.city === selectedCity || pl.city === 'All' || (Array.isArray(pl.cities) && pl.cities.includes(selectedCity));
    const matchesLang = activeLanguage === 'All' || pl.language?.toLowerCase() === activeLanguage.toLowerCase();
    const matchesCat = activeCategory === 'All' || (pl.category && pl.category.toLowerCase().includes(activeCategory.toLowerCase()));
    
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
                          pl.title?.toLowerCase().includes(q) || 
                          pl.venue?.toLowerCase().includes(q) ||
                          pl.language?.toLowerCase().includes(q) ||
                          pl.description?.toLowerCase().includes(q) ||
                          (pl.category && pl.category.toLowerCase().includes(q));

    return matchesCity && matchesLang && matchesCat && matchesSearch;
  });

  const searchSuggestions = searchQuery.trim()
    ? playsList.filter(pl => {
        const q = searchQuery.toLowerCase().trim();
        return pl.title?.toLowerCase().includes(q) ||
               pl.language?.toLowerCase().includes(q) ||
               pl.venue?.toLowerCase().includes(q) ||
               (pl.category && pl.category.toLowerCase().includes(q));
      })
    : [];

  const handleOpenBooking = (play) => {
    setSelectedPlay(play);
    setIsBookingModalOpen(true);
  };

  const handleSelectSuggestion = (play) => {
    setIsSearchFocused(false);
    handleOpenBooking(play);
  };

  const handleBookingSuccess = async () => {
    fetchPlays();
  };

  const activeFilterCount = (activeLanguage !== 'All' ? 1 : 0) + (activeCategory !== 'All' ? 1 : 0);
  const hasActiveFilters = activeFilterCount > 0 || searchQuery.trim() !== '';

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-slate-900 pt-6 sm:pt-8 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Header Title */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold font-sans text-slate-900 mb-1">Theater Plays & Drama Shows</h1>
            <p className="text-xs text-[#D90000] font-semibold">Book iconic Gujarati, Hindi, Marathi, and English stage plays & musicals</p>
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="px-3.5 py-1.5 rounded-full bg-[#D90000]/10 hover:bg-[#D90000]/20 border border-[#D90000]/30 text-[#D90000] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 md:p-6 rounded-2xl sm:rounded-3xl bg-[#DBCEA5] border border-[#c5ba92] mb-6 sm:mb-8 space-y-4 shadow-md text-slate-900">
          
          {/* Reactive Search Input + Mobile Three-Dot / Filter Drawer Button */}
          <div className="flex items-center gap-2">
            <div className="relative flex-grow" ref={searchContainerRef}>
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search play title, language, drama genre, or venue..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchFocused(true);
                }}
                onFocus={() => setIsSearchFocused(true)}
                className="w-full pl-10 pr-10 py-3 rounded-xl sm:rounded-2xl bg-white text-slate-900 placeholder-slate-500 border border-slate-300 text-xs font-semibold focus:outline-none shadow-inner"
              />
              {searchQuery && (
                <button onClick={() => { setSearchQuery(''); setIsSearchFocused(false); }} className="absolute right-3.5 top-3.5 text-slate-400">
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Auto-Complete Search Dropdown */}
              {isSearchFocused && searchQuery.trim() !== '' && (
                <div className="absolute top-full left-0 right-0 z-[200] mt-2 rounded-2xl bg-white border border-[#c5ba92] p-2 shadow-2xl space-y-1 max-h-72 overflow-y-auto animate-fade-in text-slate-900">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#D90000] border-b border-slate-200 flex items-center justify-between">
                    <span>Matching Plays</span>
                    <span>{searchSuggestions.length} found</span>
                  </div>

                  {searchSuggestions.length > 0 ? (
                    searchSuggestions.map(play => (
                      <button
                        key={play.id}
                        onClick={() => handleSelectSuggestion(play)}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-[#DBCEA5]/40 border border-transparent flex items-center justify-between gap-3 group transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={play.image}
                            alt={play.title}
                            className="w-10 h-10 rounded-lg object-cover shrink-0 shadow-md"
                          />
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#D90000] transition-colors line-clamp-1">{play.title}</h4>
                            <p className="text-[10px] text-slate-600 line-clamp-1">{play.language} • {play.category}</p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#D90000] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-500">
                      No stage plays found matching "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Three-Dot / Filter Drawer Button */}
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="md:hidden p-3 rounded-xl bg-[#D90000] text-white flex items-center justify-center gap-1 font-bold text-xs cursor-pointer transition-all shrink-0 shadow-md"
              title="Open Filter Menu"
            >
              <MoreVertical className="w-5 h-5 text-white" />
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-white text-[#D90000] text-[10px] font-black flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Desktop Filter Rows */}
          <div className="hidden md:block space-y-4 pt-3 border-t border-[#c5ba92]">
            
            {/* Language Selection */}
            <div>
              <div className="text-[10px] font-bold text-slate-800 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Globe className="w-3 h-3 text-[#D90000]" />
                <span>Play Language</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {languages.map(lang => (
                  <button
                    key={lang}
                    onClick={() => setActiveLanguage(lang)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      activeLanguage === lang
                        ? 'bg-[#D90000] text-white shadow-md'
                        : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-300'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            {/* Genre Selection */}
            <div>
              <div className="text-[10px] font-bold text-slate-800 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Theater className="w-3 h-3 text-[#D90000]" />
                <span>Drama Genre</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      activeCategory === cat
                        ? 'bg-[#D90000] text-white shadow-md'
                        : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Mobile Slide-Out Filter Drawer Modal */}
        {isMobileFilterOpen && (
          <div className="fixed top-[90px] bottom-0 left-0 right-0 z-[150] md:hidden flex justify-end bg-black/70 backdrop-blur-md animate-fade-in">
            {/* Backdrop click dismiss */}
            <div className="absolute inset-0" onClick={() => setIsMobileFilterOpen(false)}></div>

            <div className="relative w-5/6 max-w-xs h-full bg-[#DBCEA5] border-l border-[#c5ba92] p-5 shadow-2xl flex flex-col justify-between overflow-y-auto z-[160] animate-slide-left text-slate-900">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-[#c5ba92] mb-6">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-5 h-5 text-[#D90000]" />
                    <span className="text-sm font-bold uppercase tracking-wider text-slate-900">Play Filters</span>
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

                <div className="space-y-6">
                  {/* Language Selection */}
                  <div>
                    <h4 className="text-xs font-bold text-[#D90000] uppercase tracking-widest mb-2.5">Play Language</h4>
                    <div className="flex flex-wrap gap-2">
                      {languages.map(lang => (
                        <button
                          key={lang}
                          onClick={() => setActiveLanguage(lang)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            activeLanguage === lang
                              ? 'bg-[#D90000] text-white shadow-md'
                              : 'bg-white border border-slate-300 text-slate-800'
                          }`}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Drama Genre Selection */}
                  <div>
                    <h4 className="text-xs font-bold text-[#D90000] uppercase tracking-widest mb-2.5">Drama Genre</h4>
                    <div className="flex flex-wrap gap-2">
                      {categories.map(cat => (
                        <button
                          key={cat}
                          onClick={() => setActiveCategory(cat)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            activeCategory === cat
                              ? 'bg-[#D90000] text-white shadow-md'
                              : 'bg-white border border-slate-300 text-slate-800'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-[#c5ba92] mb-6 space-y-2">
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-full py-3 rounded-2xl bg-[#D90000] hover:bg-[#b00000] text-white font-extrabold text-xs shadow-lg cursor-pointer"
                >
                  Apply Filters ({filteredPlays.length} Plays)
                </button>
                {activeFilterCount > 0 && (
                  <button
                    onClick={handleResetFilters}
                    className="w-full py-2.5 rounded-2xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-bold cursor-pointer"
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
              className="bg-[#DBCEA5] rounded-3xl overflow-hidden border border-[#c5ba92] hover:border-[#D90000] transition-all duration-300 group flex flex-col sm:flex-row justify-between shadow-md text-slate-900"
            >
              <div className="sm:w-2/5 relative aspect-[4/3] sm:aspect-auto overflow-hidden">
                <img
                  src={play.image}
                  alt={play.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#D90000] text-white text-[10px] font-extrabold shadow-md">
                  {play.language}
                </div>
              </div>

              <div className="sm:w-3/5 p-5 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-md bg-white text-slate-900 border border-slate-300 text-[10px] font-bold">
                      {play.category}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#D90000] transition-colors line-clamp-2 mb-2">
                    {play.title}
                  </h3>
                  
                  <div className="space-y-1.5 text-xs text-slate-800">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#D90000] shrink-0" />
                      <span className="line-clamp-1">{play.venue}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-[#D90000] shrink-0" />
                      <span>{play.date} • {play.time}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-700 line-clamp-2 mt-3">{play.description}</p>
                </div>

                <div className="pt-3 border-t border-[#c5ba92] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-700 block">Ticket Price</span>
                    <span className="text-base font-black text-[#D90000]">₹{play.price}</span>
                  </div>

                  <button
                    onClick={() => handleOpenBooking(play)}
                    className="px-4 py-2 rounded-xl bg-[#D90000] hover:bg-[#b00000] text-white font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
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
          <div className="text-center py-16 bg-[#DBCEA5] rounded-3xl border border-[#c5ba92] p-6 max-w-lg mx-auto text-slate-900 shadow-md">
            <Theater className="w-10 h-10 text-[#D90000] mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 mb-1">No active shows in {selectedCity || 'this city'} currently</h3>
            <p className="text-xs text-slate-700">No active shows in {selectedCity || 'this city'} currently. Switch city to explore more.</p>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {isBookingModalOpen && selectedPlay && (
        <PlayBookingModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          play={selectedPlay}
          playItem={selectedPlay}
          onBookingSuccess={handleBookingSuccess}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
};
