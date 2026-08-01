import React, { useState } from 'react';
import { MovieCard } from '../components/MovieCard';
import { useBooking } from '../context/BookingContext';
import { Filter, Search, Sparkles } from 'lucide-react';

export const Movies = ({ onSelectMovie, onBookNow }) => {
  const { moviesList } = useBooking();
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [selectedFormat, setSelectedFormat] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const genresList = ['All', 'Sci-Fi', 'Action', 'Adventure', 'Drama', 'Fantasy', 'Mythology'];
  const languagesList = ['All', 'English', 'Hindi', 'Tamil', 'Telugu'];
  const formatsList = ['All', 'IMAX 3D', '4DX', 'Dolby Atmos', '3D'];

  const filteredMovies = moviesList.filter(movie => {
    if (selectedGenre !== 'All' && movie.genres && !movie.genres.includes(selectedGenre)) return false;
    if (selectedLanguage !== 'All' && movie.languages && !movie.languages.includes(selectedLanguage)) return false;
    if (selectedFormat !== 'All' && movie.formats && !movie.formats.includes(selectedFormat)) return false;
    if (searchQuery && !movie.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#050508]/80 text-white pt-8 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-8">
        
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold font-sans text-white mb-1.5 sm:mb-2">Explore Cinema Collection</h1>
          <p className="text-xs text-amber-300">Filter movies by genre, format, language, and audience ratings</p>
        </div>

        {/* Multi-Faceted Filter Controls Bar */}
        <div className="glass-panel p-4 md:p-6 rounded-2xl sm:rounded-3xl border border-white/10 mb-6 sm:mb-8 space-y-4 shadow-2xl">
          
          {/* Search Row */}
          <div className="relative">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search movie title or cast..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl sm:rounded-2xl glass-input text-xs text-white"
            />
          </div>

          {/* Filter Chips Rows */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-white/10">
            <div>
              <label className="text-[11px] font-bold text-white/60 uppercase block mb-1.5">Genre</label>
              <div className="flex flex-wrap gap-1.5">
                {genresList.map(g => (
                  <button
                    key={g}
                    onClick={() => setSelectedGenre(g)}
                    className={`px-3 py-1 rounded-xl text-xs transition-all cursor-pointer ${
                      selectedGenre === g
                        ? 'bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20'
                        : 'bg-white/5 hover:bg-white/10 text-white/70'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-white/60 uppercase block mb-1.5">Language</label>
              <div className="flex flex-wrap gap-1.5">
                {languagesList.map(l => (
                  <button
                    key={l}
                    onClick={() => setSelectedLanguage(l)}
                    className={`px-3 py-1 rounded-xl text-xs transition-all cursor-pointer ${
                      selectedLanguage === l
                        ? 'bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20'
                        : 'bg-white/5 hover:bg-white/10 text-white/70'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-white/60 uppercase block mb-1.5">Format</label>
              <div className="flex flex-wrap gap-1.5">
                {formatsList.map(f => (
                  <button
                    key={f}
                    onClick={() => setSelectedFormat(f)}
                    className={`px-3 py-1 rounded-xl text-xs transition-all cursor-pointer ${
                      selectedFormat === f
                        ? 'bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20'
                        : 'bg-white/5 hover:bg-white/10 text-white/70'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Mobile Movies Grid */}
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
          <div className="text-center py-16 sm:py-20 glass-panel rounded-3xl border border-white/10">
            <Sparkles className="w-10 h-10 text-amber-400 mx-auto mb-3" />
            <h3 className="text-base sm:text-lg font-bold text-white mb-1">No movies match your filter criteria</h3>
            <p className="text-xs text-white/60">Try resetting your genre, language, or search term filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};
