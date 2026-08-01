import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, Star, Play, Film, ChevronRight } from 'lucide-react';
import API from '../../services/api';

export default function MoviesPage() {
  const [movies, setMovies] = useState([]);
  const [searchParams] = useSearchParams();
  
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [selectedFormat, setSelectedFormat] = useState('All');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  useEffect(() => {
    API.get('/movies').then(res => setMovies(res.data)).catch(() => {});
  }, []);

  const genres = ['All', 'Sci-Fi', 'Action', 'Drama', 'Biography', 'Adventure', 'History', 'Mythology'];
  const languages = ['All', 'English', 'Hindi', 'Telugu', 'Tamil'];
  const formats = ['All', 'IMAX 3D', '4DX', 'Dolby Atmos', '2D'];

  const filteredMovies = movies.filter(m => {
    const matchGenre = selectedGenre === 'All' || m.genres?.includes(selectedGenre);
    const matchLang = selectedLanguage === 'All' || m.languages?.includes(selectedLanguage);
    const matchFmt = selectedFormat === 'All' || m.formats?.includes(selectedFormat);
    const matchQuery = !searchQuery || m.title.toLowerCase().includes(searchQuery.toLowerCase()) || m.synopsis.toLowerCase().includes(searchQuery.toLowerCase());
    return matchGenre && matchLang && matchFmt && matchQuery;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 min-h-screen">
      
      {/* HEADER & SEARCH BAR */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="font-serif text-4xl font-bold text-white flex items-center gap-3">
            <Film className="w-8 h-8 text-cyan-400" /> Explore All Movies
          </h1>
          <p className="text-xs text-slate-400">Filter by your preferred language, format, or genre.</p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search titles or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-full text-sm glass-input placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* FILTER CONTROLS BAR */}
      <div className="p-4 rounded-2xl glass-panel border-white/10 space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
          <Filter className="w-4 h-4" /> Filter Catalog
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* GENRE */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">Genre</label>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="w-full p-2.5 rounded-xl glass-input text-xs font-semibold"
            >
              {genres.map(g => <option key={g} value={g} className="bg-[#0c0d14] text-white">{g}</option>)}
            </select>
          </div>

          {/* LANGUAGE */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">Language</label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full p-2.5 rounded-xl glass-input text-xs font-semibold"
            >
              {languages.map(l => <option key={l} value={l} className="bg-[#0c0d14] text-white">{l}</option>)}
            </select>
          </div>

          {/* FORMAT */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">Format</label>
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="w-full p-2.5 rounded-xl glass-input text-xs font-semibold"
            >
              {formats.map(f => <option key={f} value={f} className="bg-[#0c0d14] text-white">{f}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* RESULTS GRID */}
      {filteredMovies.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-3xl space-y-3">
          <p className="text-lg font-serif text-slate-300">No movies match your filters.</p>
          <button
            onClick={() => { setSelectedGenre('All'); setSelectedLanguage('All'); setSelectedFormat('All'); setSearchQuery(''); }}
            className="px-6 py-2 rounded-full bg-cyan-500 text-black font-bold text-xs glow-cyan"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredMovies.map((movie) => (
            <motion.div
              key={movie.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-panel glass-panel-hover rounded-3xl overflow-hidden group flex flex-col justify-between border-white/10"
            >
              <div className="relative aspect-[3/4] overflow-hidden">
                <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c0d14] via-transparent to-transparent" />
                
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full glass-badge flex items-center gap-1.5 text-xs font-bold text-amber-300">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{movie.rating}</span>
                </div>
              </div>

              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {movie.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{movie.synopsis}</p>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs text-slate-400">{movie.duration}</span>
                  <Link
                    to={`/movie/${movie.id}`}
                    className="px-5 py-2 rounded-full bg-cyan-500 text-black font-bold text-xs hover:brightness-110 glow-cyan flex items-center gap-1"
                  >
                    <span>Book Tickets</span>
                    <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
