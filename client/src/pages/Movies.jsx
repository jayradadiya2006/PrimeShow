import React, { useState, useRef, useEffect } from 'react';
import { MovieCard } from '../components/MovieCard';
import { useBooking } from '../context/BookingContext';
import { Filter, Search, Sparkles, X, RefreshCw, MoreVertical, SlidersHorizontal, Check, ArrowRight, Film } from 'lucide-react';

import { useAuth } from '../context/AuthContext';

export const Movies = ({ onSelectMovie, onBookNow }) => {
  const { moviesList } = useBooking();
  const { selectedCity } = useAuth();
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [selectedFormat, setSelectedFormat] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef(null);

  const genresList = ['All', 'Sci-Fi', 'Action', 'Adventure', 'Drama', 'Fantasy', 'Mythology'];
  const languagesList = ['All', 'English', 'Hindi', 'Tamil', 'Telugu'];
  const formatsList = ['All', 'IMAX 3D', '4DX', 'Dolby Atmos', '3D'];

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

  const handleResetFilters = () => {
    setSelectedGenre('All');
    setSelectedLanguage('All');
    setSelectedFormat('All');
    setSearchQuery('');
  };

  const filteredMovies = moviesList.filter(movie => {
    // City filtering match
    if (selectedCity && selectedCity !== 'All') {
      const mCity = movie.city;
      const mCities = Array.isArray(movie.cities) ? movie.cities : [];
      const tCities = Array.isArray(movie.theatres) ? movie.theatres.map(t => t.city) : [];
      const allCities = [mCity, ...mCities, ...tCities].filter(Boolean);

      if (allCities.length > 0 && !allCities.includes('All') && !allCities.includes(selectedCity)) {
        return false;
      }
    }

    // Genre match
    if (selectedGenre !== 'All') {
      const gList = Array.isArray(movie.genres) 
        ? movie.genres 
        : (movie.genre ? movie.genre.split(',').map(g => g.trim()) : []);
      if (!gList.some(g => g.toLowerCase() === selectedGenre.toLowerCase())) return false;
    }

    // Language match
    if (selectedLanguage !== 'All') {
      const lList = Array.isArray(movie.languages) 
        ? movie.languages 
        : (movie.language ? movie.language.split(',').map(l => l.trim()) : []);
      if (!lList.some(l => l.toLowerCase() === selectedLanguage.toLowerCase())) return false;
    }

    // Format match
    if (selectedFormat !== 'All') {
      const fList = Array.isArray(movie.formats) 
        ? movie.formats 
        : (movie.format ? movie.format.split(',').map(f => f.trim()) : []);
      if (!fList.some(f => f.toLowerCase() === selectedFormat.toLowerCase())) return false;
    }

    // Search Query match (Title, Cast, Genre, Description)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const titleMatch = movie.title?.toLowerCase().includes(q);
      const genreMatch = movie.genre?.toLowerCase().includes(q) || (Array.isArray(movie.genres) && movie.genres.some(g => g.toLowerCase().includes(q)));
      const langMatch = movie.language?.toLowerCase().includes(q);
      const castMatch = typeof movie.cast === 'string' ? movie.cast.toLowerCase().includes(q) : Array.isArray(movie.cast) && movie.cast.some(c => (c.name || c).toLowerCase().includes(q));
      
      if (!titleMatch && !genreMatch && !langMatch && !castMatch) return false;
    }

    return true;
  });

  // Dynamic Search Suggestions for Dropdown
  const searchSuggestions = searchQuery.trim()
    ? moviesList.filter(m => {
        const q = searchQuery.toLowerCase().trim();
        return m.title?.toLowerCase().includes(q) ||
               m.genre?.toLowerCase().includes(q) ||
               m.language?.toLowerCase().includes(q) ||
               (Array.isArray(m.genres) && m.genres.some(g => g.toLowerCase().includes(q)));
      })
    : [];

  const handleSelectSuggestion = (movie) => {
    setIsSearchFocused(false);
    if (onSelectMovie) {
      onSelectMovie(movie.id);
    }
  };

  const activeFilterCount = (selectedGenre !== 'All' ? 1 : 0) + (selectedLanguage !== 'All' ? 1 : 0) + (selectedFormat !== 'All' ? 1 : 0);
  const hasActiveFilters = activeFilterCount > 0 || searchQuery.trim() !== '';

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-slate-900 pt-6 sm:pt-8 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-8">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold font-sans text-slate-900 mb-1">Explore Cinema Collection</h1>
            <p className="text-xs text-[#D90000] font-semibold">Filter movies dynamically by genre, format, language, and title search</p>
          </div>
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="self-start md:self-auto px-3.5 py-1.5 rounded-full bg-[#D90000]/10 hover:bg-[#D90000]/20 border border-[#D90000]/30 text-[#D90000] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          )}
        </div>

        {/* Search & Filter Bar - Light Brown #DBCEA5 Background */}
        <div className="p-4 md:p-6 rounded-2xl sm:rounded-3xl bg-[#DBCEA5] border border-[#c5ba92] mb-6 sm:mb-8 space-y-4 shadow-md text-slate-900">
          
          {/* Reactive Search Input + Dynamic Dropdown */}
          <div className="flex items-center gap-2">
            <div className="relative flex-grow" ref={searchContainerRef}>
              <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search movie title, cast, language, or genre..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchFocused(true);
                }}
                onFocus={() => setIsSearchFocused(true)}
                className="w-full pl-11 pr-10 py-3 rounded-xl sm:rounded-2xl bg-white text-slate-900 placeholder-slate-500 border border-slate-300 focus:outline-none text-xs font-semibold shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setIsSearchFocused(false);
                  }}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Dynamic Auto-Complete Search Dropdown */}
              {isSearchFocused && searchQuery.trim() !== '' && (
                <div className="absolute top-full left-0 right-0 z-[200] mt-2 rounded-2xl bg-white border border-[#c5ba92] p-2 shadow-2xl space-y-1 max-h-72 overflow-y-auto animate-fade-in text-slate-900">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#D90000] border-b border-slate-200 flex items-center justify-between">
                    <span>Matching Movies</span>
                    <span>{searchSuggestions.length} found</span>
                  </div>

                  {searchSuggestions.length > 0 ? (
                    searchSuggestions.map(movie => (
                      <button
                        key={movie.id}
                        onClick={() => handleSelectSuggestion(movie)}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-[#DBCEA5]/40 border border-transparent flex items-center justify-between gap-3 group transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={movie.poster || movie.image}
                            alt={movie.title}
                            className="w-10 h-12 rounded-lg object-cover shrink-0 shadow-md"
                          />
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#D90000] transition-colors line-clamp-1">{movie.title}</h4>
                            <p className="text-[10px] text-slate-600 line-clamp-1">{movie.language} • {movie.genre || (Array.isArray(movie.genres) && movie.genres.join(', '))}</p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#D90000] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-500">
                      No movies found matching "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Three-Dot (⋮) / Filter Drawer Toggle Button */}
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="md:hidden p-3 rounded-xl bg-[#D90000] text-white flex items-center justify-center gap-1 font-bold text-xs cursor-pointer transition-all hover:bg-[#b00000] active:scale-95 shrink-0 shadow-md"
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

          {/* Desktop Filter Pills */}
          <div className="hidden md:block space-y-4 pt-3 border-t border-[#c5ba92]">
            
            {/* Genre Row */}
            <div>
              <div className="text-[11px] font-black text-[#1A1A1A] uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-[#D90000]" />
                <span>GENRE</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {genresList.map(g => (
                  <button
                    key={g}
                    onClick={() => setSelectedGenre(g)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      selectedGenre === g
                        ? 'bg-[#D90000] text-white shadow-md font-black scale-105'
                        : 'bg-[#2B2B2B] hover:bg-[#4A4A4A] text-white border border-slate-700'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Language Row */}
            <div>
              <div className="text-[11px] font-black text-[#1A1A1A] uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-[#D90000]" />
                <span>LANGUAGE</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {languagesList.map(l => (
                  <button
                    key={l}
                    onClick={() => setSelectedLanguage(l)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      selectedLanguage === l
                        ? 'bg-[#D90000] text-white shadow-md font-black scale-105'
                        : 'bg-[#2B2B2B] hover:bg-[#4A4A4A] text-white border border-slate-700'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Format Row */}
            <div>
              <div className="text-[11px] font-black text-[#1A1A1A] uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-[#D90000]" />
                <span>FORMAT</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {formatsList.map(f => (
                  <button
                    key={f}
                    onClick={() => setSelectedFormat(f)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      selectedFormat === f
                        ? 'bg-[#D90000] text-white shadow-md font-black scale-105'
                        : 'bg-[#2B2B2B] hover:bg-[#4A4A4A] text-white border border-slate-700'
                    }`}
                  >
                    {f}
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

            <div className="relative w-5/6 max-w-xs h-full bg-[#DBCEA5] border-l border-[#c5ba92] p-5 shadow-2xl flex flex-col justify-between overflow-y-auto z-[160] animate-slide-left text-[#1A1A1A]">
              <div>
                {/* Accessible Close (✕) Button & Header */}
                <div className="flex items-center justify-between pb-4 border-b border-[#c5ba92] mb-6">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-5 h-5 text-[#D90000]" />
                    <span className="text-sm font-black uppercase tracking-wider text-[#1A1A1A]">Movie Filters</span>
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

                {/* Filter Sections inside Drawer */}
                <div className="space-y-6">
                  
                  {/* Genre Filter */}
                  <div>
                    <h4 className="text-xs font-black text-[#1A1A1A] uppercase tracking-widest mb-2.5">Select Genre</h4>
                    <div className="flex flex-wrap gap-2">
                      {genresList.map(g => (
                        <button
                          key={g}
                          onClick={() => setSelectedGenre(g)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            selectedGenre === g
                              ? 'bg-[#D90000] text-white shadow-md'
                              : 'bg-[#2B2B2B] hover:bg-[#4A4A4A] text-white'
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Language Filter */}
                  <div>
                    <h4 className="text-xs font-black text-[#1A1A1A] uppercase tracking-widest mb-2.5">Select Language</h4>
                    <div className="flex flex-wrap gap-2">
                      {languagesList.map(l => (
                        <button
                          key={l}
                          onClick={() => setSelectedLanguage(l)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            selectedLanguage === l
                              ? 'bg-[#D90000] text-white shadow-md'
                              : 'bg-[#2B2B2B] hover:bg-[#4A4A4A] text-white'
                          }`}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Format Filter */}
                  <div>
                    <h4 className="text-xs font-black text-[#1A1A1A] uppercase tracking-widest mb-2.5">Select Format</h4>
                    <div className="flex flex-wrap gap-2">
                      {formatsList.map(f => (
                        <button
                          key={f}
                          onClick={() => setSelectedFormat(f)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            selectedFormat === f
                              ? 'bg-[#D90000] text-white shadow-md'
                              : 'bg-[#2B2B2B] hover:bg-[#4A4A4A] text-white'
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

              {/* Drawer Bottom Actions */}
              <div className="pt-6 border-t border-[#c5ba92] space-y-2 pb-6">
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-full py-3 rounded-2xl bg-[#D90000] text-white font-extrabold text-xs shadow-lg hover:bg-[#b00000] cursor-pointer flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Apply Filters ({filteredMovies.length} Movies)</span>
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

        {/* Movies Grid View */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {filteredMovies.map(movie => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onSelect={onSelectMovie}
              onBookNow={onBookNow}
            />
          ))}
        </div>

        {filteredMovies.length === 0 && (
          <div className="text-center py-16 sm:py-20 bg-[#DBCEA5] rounded-3xl border border-[#c5ba92] p-6 text-slate-900 shadow-md">
            <Sparkles className="w-10 h-10 text-[#D90000] mx-auto mb-3" />
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">No active shows in {selectedCity || 'this city'} currently</h3>
            <p className="text-xs text-slate-700 mb-4">No active shows in {selectedCity || 'this city'} currently. Switch city to explore more.</p>
            <button
              onClick={handleResetFilters}
              className="px-5 py-2 rounded-full bg-[#D90000] text-white font-extrabold text-xs shadow-md hover:bg-[#b00000] transition-all cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
