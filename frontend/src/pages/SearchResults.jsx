import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Film, PlaySquare, Sparkles, Ticket, Heart, 
  MapPin, Star, Calendar, Clock, ChevronRight, X, ArrowLeft,
  Filter, CheckCircle2, AlertCircle, Loader2
} from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

const TRENDING_KEYWORDS = [
  'Stree 2', 'Jawan', 'Pushpa 2', 'IMAX 3D', 'Horror', 'Action', 'Comedy', 'PVR', 'Surat'
];

export const SearchResults = ({
  searchQuery = '',
  setSearchQuery,
  onSelectMovie,
  onBookNow,
  onSelectTheatre,
  onSelectEvent,
  setActiveTab
}) => {
  const { moviesList = [], theatresList = [], upcomingMoviesList = [] } = useBooking();
  const { selectedCity } = useAuth();
  
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [activeCategory, setActiveCategory] = useState('all');
  const [apiData, setApiData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Keep local query in sync if parent changes searchQuery
  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  // Fetch from backend /api/search with debounce
  useEffect(() => {
    const q = (searchQuery || '').trim();
    if (!q) {
      setApiData(null);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    const timer = setTimeout(async () => {
      try {
        const res = await API.get('/search', {
          params: { q, city: selectedCity }
        });
        if (isMounted && res.data) {
          setApiData(res.data);
        }
      } catch (err) {
        console.warn('Backend search error (fallback to local state):', err.message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }, 250);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [searchQuery, selectedCity]);

  // Combine local state and API state for fast, resilient search
  const searchResults = useMemo(() => {
    const q = (searchQuery || '').trim().toLowerCase();
    if (!q) {
      return {
        all: [],
        movies: [],
        upcoming: [],
        theatres: [],
        events: [],
        plays: [],
        activities: [],
        total: 0
      };
    }

    // 1. If API data is available and has results, prioritize it
    if (apiData?.success && Array.isArray(apiData?.results) && apiData.results.length > 0) {
      const cats = apiData.categories || {};
      return {
        all: apiData.results,
        movies: cats.movies || [],
        upcoming: cats.upcoming || [],
        theatres: cats.theatres || [],
        events: cats.events || [],
        plays: cats.plays || [],
        activities: cats.activities || [],
        total: apiData.total || apiData.results.length
      };
    }

    // 2. Client-side fallback matching
    const matchText = (text) => text && String(text).toLowerCase().includes(q);
    const matchArray = (arr) => Array.isArray(arr) && arr.some(item => {
      if (typeof item === 'string') return matchText(item);
      if (typeof item === 'object' && item !== null) {
        return matchText(item.name || item.title || item.role);
      }
      return false;
    });

    const matchedMovies = (moviesList || []).filter(m => {
      const inTitle = matchText(m.title);
      const inGenre = matchText(m.genre) || matchArray(m.genres);
      const inLang = matchText(m.language) || matchArray(m.languages);
      const inCast = matchText(m.cast) || matchArray(m.cast);
      const inSynopsis = matchText(m.synopsis) || matchText(m.description);
      const inFormat = matchText(m.format) || matchArray(m.formats);
      return inTitle || inGenre || inLang || inCast || inSynopsis || inFormat;
    }).map(m => ({
      id: m.id || m._id,
      type: 'movie',
      category: 'Movie',
      title: m.title,
      subtitle: `${Array.isArray(m.languages) ? m.languages.join(', ') : (m.language || 'Hindi')} • ${Array.isArray(m.genres) ? m.genres.join(', ') : (m.genre || 'Action')}`,
      image: m.poster || m.image || m.banner,
      rating: m.rating || 9.0,
      price: m.price || 250,
      city: m.city || selectedCity || 'Surat',
      formats: m.formats || ['2D'],
      raw: m
    }));

    const matchedUpcoming = (upcomingMoviesList || []).filter(u => {
      const inTitle = matchText(u.title);
      const inGenre = matchArray(u.genres);
      const inSynopsis = matchText(u.synopsis);
      return inTitle || inGenre || inSynopsis;
    }).map(u => ({
      id: u.id || u._id,
      type: 'upcoming',
      category: 'Upcoming Movie',
      title: u.title,
      subtitle: `${u.release || u.releaseDateTag || 'Coming Soon'} • ${Array.isArray(u.genres) ? u.genres.join(', ') : 'Blockbuster'}`,
      image: u.poster || u.image,
      city: 'All',
      raw: u
    }));

    const matchedTheatres = (theatresList || []).filter(t => {
      const inName = matchText(t.name);
      const inCity = matchText(t.city);
      const inAddress = matchText(t.address) || matchText(t.location);
      const inFacilities = matchArray(t.facilities);
      return inName || inCity || inAddress || inFacilities;
    }).map(t => ({
      id: t.id || t._id,
      type: 'theatre',
      category: 'Multiplex',
      title: t.name,
      subtitle: `${t.city || selectedCity || 'Surat'} • ${t.address || t.location || 'Cinema'}`,
      image: t.image || t.photo || 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=400&q=80',
      city: t.city,
      raw: t
    }));

    const all = [...matchedMovies, ...matchedTheatres, ...matchedUpcoming];

    return {
      all,
      movies: matchedMovies,
      upcoming: matchedUpcoming,
      theatres: matchedTheatres,
      events: [],
      plays: [],
      activities: [],
      total: all.length
    };
  }, [searchQuery, apiData, moviesList, theatresList, upcomingMoviesList, selectedCity]);

  // Form submission handler
  const handleFormSubmit = (e) => {
    e.preventDefault();
    const clean = localQuery.trim();
    if (setSearchQuery) {
      setSearchQuery(clean);
    }
    if (typeof window !== 'undefined' && window.history) {
      const url = clean ? `?q=${encodeURIComponent(clean)}` : window.location.pathname;
      window.history.pushState(null, '', url);
    }
  };

  const handleClear = () => {
    setLocalQuery('');
    if (setSearchQuery) setSearchQuery('');
    if (typeof window !== 'undefined' && window.history) {
      window.history.pushState(null, '', window.location.pathname);
    }
  };

  const handleSelectKeyword = (kw) => {
    setLocalQuery(kw);
    if (setSearchQuery) setSearchQuery(kw);
    if (typeof window !== 'undefined' && window.history) {
      window.history.pushState(null, '', `?q=${encodeURIComponent(kw)}`);
    }
  };

  // Determine items to show based on activeCategory
  const displayedItems = useMemo(() => {
    if (activeCategory === 'all') return searchResults.all;
    if (activeCategory === 'movies') return [...searchResults.movies, ...searchResults.upcoming];
    if (activeCategory === 'theatres') return searchResults.theatres;
    if (activeCategory === 'events') return searchResults.events;
    if (activeCategory === 'plays') return searchResults.plays;
    if (activeCategory === 'activities') return searchResults.activities;
    return searchResults.all;
  }, [activeCategory, searchResults]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-sans">
      {/* Top Search Bar & Header */}
      <div className="bg-[#DBCEA5] border-b border-[#c5ba92] py-8 sm:py-10 px-4 sm:px-6 md:px-8 shadow-xs">
        <div className="max-w-5xl mx-auto">
          {/* Back button and title */}
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => {
                if (setActiveTab) setActiveTab('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="p-2 rounded-full bg-white/80 hover:bg-white text-slate-800 border border-slate-300 shadow-xs transition-colors cursor-pointer"
              title="Return to Home"
            >
              <ArrowLeft className="w-4 h-4 text-slate-900" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-[#3B1E08] tracking-tight">
                {searchQuery ? `Search Results for "${searchQuery}"` : 'Explore & Search PrimeShow'}
              </h1>
              <p className="text-xs sm:text-sm text-[#4E2B12] font-semibold">
                {searchQuery 
                  ? `Found ${searchResults.total} matching result${searchResults.total === 1 ? '' : 's'}`
                  : 'Search across movies, IMAX screens, multiplexes, events, and actors'
                }
              </p>
            </div>
          </div>

          {/* Search Input Form */}
          <form onSubmit={handleFormSubmit} className="relative flex items-center w-full max-w-3xl mt-4">
            <div className="relative w-full flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-slate-500 pointer-events-none" />
              <input
                type="text"
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                placeholder="Search movies, genres, languages, cinemas, events..."
                className="w-full pl-12 pr-28 py-3.5 text-sm sm:text-base rounded-full bg-white border-2 border-slate-300 text-slate-900 font-semibold placeholder-slate-500 focus:border-[#D90000] focus:ring-2 focus:ring-[#D90000]/20 focus:outline-none shadow-md transition-all"
              />
              
              <div className="absolute right-3 flex items-center gap-1.5">
                {isLoading && (
                  <Loader2 className="w-4 h-4 text-slate-400 animate-spin mr-1" />
                )}
                {localQuery && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    title="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-full bg-[#D90000] hover:bg-red-700 text-white text-xs sm:text-sm font-extrabold shadow-sm transition-all cursor-pointer"
                >
                  Search
                </button>
              </div>
            </div>
          </form>

          {/* Quick Trending Keywords Chips */}
          <div className="flex items-center gap-2 mt-4 overflow-x-auto scrollbar-none py-1">
            <span className="text-xs font-bold text-[#4E2B12] shrink-0">Trending:</span>
            {TRENDING_KEYWORDS.map((kw, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelectKeyword(kw)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  searchQuery.toLowerCase() === kw.toLowerCase()
                    ? 'bg-[#3B1E08] text-white'
                    : 'bg-white/80 hover:bg-white text-slate-800 border border-slate-300'
                }`}
              >
                {kw}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 mt-6 sm:mt-8">
        {/* Category Tabs */}
        {searchResults.total > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-4 border-b border-slate-200 mb-6">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-black transition-all shrink-0 cursor-pointer ${
                activeCategory === 'all'
                  ? 'bg-[#D90000] text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              All Results ({searchResults.total})
            </button>

            {(searchResults.movies.length > 0 || searchResults.upcoming.length > 0) && (
              <button
                onClick={() => setActiveCategory('movies')}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-black transition-all shrink-0 cursor-pointer ${
                  activeCategory === 'movies'
                    ? 'bg-[#D90000] text-white shadow-md'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                Movies ({searchResults.movies.length + searchResults.upcoming.length})
              </button>
            )}

            {searchResults.theatres.length > 0 && (
              <button
                onClick={() => setActiveCategory('theatres')}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-black transition-all shrink-0 cursor-pointer ${
                  activeCategory === 'theatres'
                    ? 'bg-[#D90000] text-white shadow-md'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                Theatres ({searchResults.theatres.length})
              </button>
            )}

            {searchResults.events.length > 0 && (
              <button
                onClick={() => setActiveCategory('events')}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-black transition-all shrink-0 cursor-pointer ${
                  activeCategory === 'events'
                    ? 'bg-[#D90000] text-white shadow-md'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                Events ({searchResults.events.length})
              </button>
            )}

            {searchResults.plays.length > 0 && (
              <button
                onClick={() => setActiveCategory('plays')}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-black transition-all shrink-0 cursor-pointer ${
                  activeCategory === 'plays'
                    ? 'bg-[#D90000] text-white shadow-md'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                Plays ({searchResults.plays.length})
              </button>
            )}

            {searchResults.activities.length > 0 && (
              <button
                onClick={() => setActiveCategory('activities')}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-black transition-all shrink-0 cursor-pointer ${
                  activeCategory === 'activities'
                    ? 'bg-[#D90000] text-white shadow-md'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                Activities ({searchResults.activities.length})
              </button>
            )}
          </div>
        )}

        {/* Loading State Skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map(n => (
              <div key={n} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex gap-4">
                <div className="w-24 h-36 bg-slate-200 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2 py-2">
                  <div className="h-4 bg-slate-200 rounded-md w-3/4" />
                  <div className="h-3 bg-slate-200 rounded-md w-1/2" />
                  <div className="h-3 bg-slate-200 rounded-md w-2/3" />
                  <div className="h-8 bg-slate-200 rounded-xl mt-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty Query State */}
        {!isLoading && !searchQuery && (
          <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-200 shadow-sm max-w-2xl mx-auto my-8">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 mx-auto flex items-center justify-center mb-4">
              <Search className="w-8 h-8" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">What would you like to watch?</h2>
            <p className="text-sm text-slate-600 mb-6">
              Search by movie title, director, cast, language, IMAX format, or cinema multiplex.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {['Horror Movies', 'Action Blockbusters', 'Comedy Hits', 'IMAX 3D Shows', 'PVR Cinemas'].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectKeyword(item.split(' ')[0])}
                  className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-300 transition-colors cursor-pointer"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* No Results Found State */}
        {!isLoading && searchQuery && searchResults.total === 0 && (
          <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-200 shadow-sm max-w-xl mx-auto my-8">
            <div className="w-16 h-16 rounded-full bg-red-50 text-[#D90000] mx-auto flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">No results found for "{searchQuery}"</h2>
            <p className="text-sm text-slate-600 mb-6">
              We couldn't find any movies, theatres, or events matching your search. Please check the spelling or try searching for another title.
            </p>
            <div className="space-y-3">
              <div className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Popular Suggestions</div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {TRENDING_KEYWORDS.slice(0, 5).map((kw, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectKeyword(kw)}
                    className="px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-red-50 hover:text-[#D90000] text-slate-800 text-xs font-bold border border-slate-200 transition-colors cursor-pointer"
                  >
                    {kw}
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  if (setActiveTab) setActiveTab('movies');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#D90000] hover:bg-red-700 text-white font-black text-sm shadow-md transition-all cursor-pointer"
              >
                <span>Browse All Movies</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Results Grid */}
        {!isLoading && displayedItems.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedItems.map((item, idx) => {
              const isMovie = item.type === 'movie' || item.type === 'upcoming';
              const isTheatre = item.type === 'theatre';
              const isEvent = item.type === 'event';
              const isPlay = item.type === 'play';
              const isActivity = item.type === 'activity';

              return (
                <div
                  key={item.id || idx}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-[#D90000]/40 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                >
                  <div className="flex p-4 gap-4">
                    {/* Item Image */}
                    <div className="relative w-24 h-36 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                      <img
                        src={item.image || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=400&q=80"}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=400&q=80";
                        }}
                      />
                      {item.rating && (
                        <div className="absolute top-1.5 left-1.5 bg-black/80 backdrop-blur-xs text-amber-400 text-[10px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                          <Star className="w-3 h-3 fill-amber-400" />
                          <span>{item.rating}</span>
                        </div>
                      )}
                    </div>

                    {/* Item Info */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        {/* Category Pill */}
                        <div className="inline-block px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide bg-red-50 text-[#D90000] border border-red-200 mb-1.5">
                          {item.category || item.type}
                        </div>
                        
                        {/* Title */}
                        <h3 className="text-base font-extrabold text-slate-900 group-hover:text-[#D90000] transition-colors line-clamp-2 leading-snug">
                          {item.title}
                        </h3>

                        {/* Subtitle / Details */}
                        <p className="text-xs text-slate-600 font-medium mt-1 line-clamp-2">
                          {item.subtitle}
                        </p>

                        {/* City / Venue if applicable */}
                        {item.city && item.city !== 'All' && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-500 font-semibold mt-1.5">
                            <MapPin className="w-3 h-3 text-[#D90000]" />
                            <span>{item.city}</span>
                          </div>
                        )}
                      </div>

                      {/* Price Tag if available */}
                      {item.price && (
                        <div className="text-xs font-black text-slate-900 mt-2">
                          From <span className="text-[#D90000]">₹{item.price}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Actions Bottom Bar */}
                  <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
                    {isMovie && item.type === 'movie' && (
                      <>
                        <button
                          onClick={() => {
                            if (onSelectMovie) onSelectMovie(item.id);
                          }}
                          className="flex-1 py-2 px-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-bold transition-colors cursor-pointer text-center"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => {
                            if (onBookNow) onBookNow(item.id);
                            else if (onSelectMovie) onSelectMovie(item.id);
                          }}
                          className="flex-1 py-2 px-3 rounded-xl bg-[#D90000] hover:bg-red-700 text-white text-xs font-extrabold shadow-xs transition-colors cursor-pointer text-center"
                        >
                          Book Tickets
                        </button>
                      </>
                    )}

                    {item.type === 'upcoming' && (
                      <button
                        onClick={() => {
                          if (setActiveTab) setActiveTab('movies');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-800 text-xs font-bold transition-colors cursor-pointer text-center"
                      >
                        Coming Soon (Explore)
                      </button>
                    )}

                    {isTheatre && (
                      <button
                        onClick={() => {
                          if (onSelectTheatre) onSelectTheatre(item.id);
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-[#D90000] hover:bg-red-700 text-white text-xs font-extrabold shadow-xs transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5"
                      >
                        <PlaySquare className="w-3.5 h-3.5" />
                        <span>View Shows & Screens</span>
                      </button>
                    )}

                    {isEvent && (
                      <button
                        onClick={() => {
                          if (onSelectEvent) onSelectEvent(item.id);
                          else if (setActiveTab) setActiveTab('events');
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-[#D90000] hover:bg-red-700 text-white text-xs font-extrabold shadow-xs transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Book Event Tickets</span>
                      </button>
                    )}

                    {isPlay && (
                      <button
                        onClick={() => {
                          if (setActiveTab) setActiveTab('plays');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-[#D90000] hover:bg-red-700 text-white text-xs font-extrabold shadow-xs transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5"
                      >
                        <Ticket className="w-3.5 h-3.5" />
                        <span>View Play Details</span>
                      </button>
                    )}

                    {isActivity && (
                      <button
                        onClick={() => {
                          if (setActiveTab) setActiveTab('activities');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-[#D90000] hover:bg-red-700 text-white text-xs font-extrabold shadow-xs transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5"
                      >
                        <Heart className="w-3.5 h-3.5" />
                        <span>Explore Activities</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
