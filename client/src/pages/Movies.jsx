import React, { useState } from 'react';
import { MovieCard } from '../components/MovieCard';
import { useBooking } from '../context/BookingContext';
import { Filter, Search, Sparkles, X, RefreshCw } from 'lucide-react';

export const Movies = ({ onSelectMovie, onBookNow }) => {
  const { moviesList } = useBooking();
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [selectedFormat, setSelectedFormat] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const genresList = ['All', 'Sci-Fi', 'Action', 'Adventure', 'Drama', 'Fantasy', 'Mythology'];
  const languagesList = ['All', 'English', 'Hindi', 'Tamil', 'Telugu'];
  const formatsList = ['All', 'IMAX 3D', '4DX', 'Dolby Atmos', '3D'];

  const handleResetFilters = () => {
    setSelectedGenre('All');
    setSelectedLanguage('All');
    setSelectedFormat('All');
    setSearchQuery('');
  };

  const filteredMovies = moviesList.filter(movie => {
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

  const hasActiveFilters = selectedGenre !== 'All' || selectedLanguage !== 'All' || selectedFormat !== 'All' || searchQuery.trim() !== '';

  return (
    <div className="min-h-screen bg-[#050508]/90 text-slate-900 dark:text-white pt-6 sm:pt-8 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-8">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold font-sans text-slate-900 dark:text-white mb-1">Explore Cinema Collection</h1>
            <p className="text-xs text-amber-600 dark:text-amber-300 font-semibold">Filter movies dynamically by genre, format, language, and title search</p>
          </div>
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="self-start md:self-auto px-3.5 py-1.5 rounded-full bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          )}
        </div>

        {/* Multi-Faceted Filter Controls Bar */}
        <div className="glass-panel p-4 md:p-6 rounded-2xl sm:rounded-3xl border border-slate-300 dark:border-white/10 mb-6 sm:mb-8 space-y-4 shadow-2xl">
          
          {/* Dynamic Reactive Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400 dark:text-white/40" />
            <input
              type="text"
              placeholder="Search movie title, cast, language, or genre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-10 py-3 rounded-xl sm:rounded-2xl glass-input text-xs text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-white/40"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Structured Filter Pills */}
          <div className="space-y-4 pt-3 border-t border-slate-200 dark:border-white/10">
            
            {/* Genre Row */}
            <div>
              <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Filter className="w-3 h-3" />
                <span>Genre</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {genresList.map(g => (
                  <button
                    key={g}
                    onClick={() => setSelectedGenre(g)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      selectedGenre === g
                        ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                        : 'bg-slate-200/60 dark:bg-white/5 hover:bg-slate-300 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-white/10'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Language Row */}
            <div>
              <div className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Filter className="w-3 h-3" />
                <span>Language</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {languagesList.map(l => (
                  <button
                    key={l}
                    onClick={() => setSelectedLanguage(l)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      selectedLanguage === l
                        ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                        : 'bg-slate-200/60 dark:bg-white/5 hover:bg-slate-300 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-white/10'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Format Row */}
            <div>
              <div className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Filter className="w-3 h-3" />
                <span>Format</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {formatsList.map(f => (
                  <button
                    key={f}
                    onClick={() => setSelectedFormat(f)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      selectedFormat === f
                        ? 'bg-purple-500 text-black shadow-md shadow-purple-500/20'
                        : 'bg-slate-200/60 dark:bg-white/5 hover:bg-slate-300 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-white/10'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

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
          <div className="text-center py-16 sm:py-20 glass-panel rounded-3xl border border-slate-300 dark:border-white/10 p-6">
            <Sparkles className="w-10 h-10 text-amber-400 mx-auto mb-3" />
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-1">No movies match your filter criteria</h3>
            <p className="text-xs text-slate-500 dark:text-white/60 mb-4">Try clearing your search query or choosing another genre/language.</p>
            <button
              onClick={handleResetFilters}
              className="px-5 py-2 rounded-full bg-amber-500 text-black font-extrabold text-xs shadow-md hover:bg-amber-400 transition-all cursor-pointer"
            >
              Show All Movies
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
