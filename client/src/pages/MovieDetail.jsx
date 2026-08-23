import React, { useState, useEffect } from 'react';
import { Star, Clock, Calendar, Film, Play, Sparkles, MapPin, ChevronRight, CheckCircle2, Send, MessageSquare, User, Video, Shield, Award, AlertCircle, ArrowLeft, ChevronDown, ChevronUp, Ticket } from 'lucide-react';
import { CastCarousel } from '../components/CastCarousel';
import { TheatreMapModal } from '../components/TheatreMapModal';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';

export const MovieDetail = ({ movieId, onOpenSeatPicker, onBookTickets, onBackToMovies }) => {
  const { user, selectedCity } = useAuth();
  const { moviesList, theatresList, selectShowForBooking } = useBooking();
  const [movie, setMovie] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedCityFilter, setSelectedCityFilter] = useState(selectedCity || 'All');
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [selectedTheatreForMap, setSelectedTheatreForMap] = useState(null);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  useEffect(() => {
    if (selectedCity) {
      setSelectedCityFilter(selectedCity);
    }
  }, [selectedCity]);
  
  // Read More / Read Less States
  const [isAboutReadMore, setIsAboutReadMore] = useState(false);
  const [expandedReviewIds, setExpandedReviewIds] = useState([]);

  // Reviews state
  const [userRating, setUserRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewsList, setReviewsList] = useState([]);

  // Helper to extract YouTube embed URL
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    if (url.includes('youtube.com/embed/')) return url;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0`;
    }
    return null;
  };

  useEffect(() => {
    const found = moviesList.find(m => m.id === movieId) || moviesList[0];
    if (found) {
      setMovie(found);
    }
    setReviewsList([
      {
        id: 'rev_1',
        userName: 'Aarav Sharma',
        rating: 5,
        comment: 'Mind-blowing visuals! James Cameron has outdone himself again. The native 3D in IMAX was so immersive and high frame rate sequence was unbelievable.',
        createdAt: '2 days ago'
      },
      {
        id: 'rev_2',
        userName: 'Vikram Mehta',
        rating: 5,
        comment: 'The sound design of Hans Zimmer and director execution is unmatched. Absolutely legendary film experience that must be watched on IMAX screen.',
        createdAt: '3 days ago'
      }
    ]);
  }, [movieId, moviesList]);

  if (!movie) return null;

  // Reliable Back Button Handler
  const handleBackClick = () => {
    if (typeof onBackToMovies === 'function') {
      onBackToMovies();
    } else {
      window.location.hash = '';
    }
  };

  // Dynamic Date Chips Generator based strictly on movie.showDates configured by Admin
  const generateDynamicDates = () => {
    if (Array.isArray(movie.showDates) && movie.showDates.length > 0) {
      return movie.showDates.map((dStr, idx) => {
        const dObj = new Date(dStr);
        const dayLabel = idx === 0 ? 'TODAY' : (idx === 1 ? 'TOMORROW' : dObj.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase());
        const dayFormatted = isNaN(dObj.getTime()) ? dStr : dObj.toLocaleDateString('en-US', { day: '2-digit', month: 'short' }).toUpperCase();
        return { date: dStr, label: dayLabel, day: dayFormatted };
      });
    }
    const today = new Date();
    return [0, 1, 2].map(offset => {
      const d = new Date(today);
      d.setDate(today.getDate() + offset);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = offset === 0 ? 'TODAY' : (offset === 1 ? 'TOMORROW' : d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase());
      const dayFormatted = d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' }).toUpperCase();
      return { date: dateStr, label: dayLabel, day: dayFormatted };
    });
  };

  const availableDates = generateDynamicDates();
  const currentDateSelection = selectedDate || (availableDates[0]?.date || '2026-07-31');

  // Dynamic Theatre & Showtimes Retrieval based STRICTLY on selected date and Admin schedules in MongoDB Atlas
  const getTheatresForCurrentDate = () => {
    if (movie && movie.schedules && Array.isArray(movie.schedules[currentDateSelection])) {
      return movie.schedules[currentDateSelection];
    }
    return [];
  };

  const theatreShows = getTheatresForCurrentDate();
  const activeCityToUse = selectedCityFilter || selectedCity || 'All';
  const filteredTheatres = (!activeCityToUse || activeCityToUse === 'All')
    ? theatreShows
    : theatreShows.filter(t => t && t.city && t.city.trim().toLowerCase() === activeCityToUse.trim().toLowerCase());

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!reviewText) return;
    const newRev = {
      id: `rev_${Date.now()}`,
      userName: user ? user.name : 'Guest User',
      rating: userRating,
      comment: reviewText,
      createdAt: 'Just now'
    };
    setReviewsList([newRev, ...reviewsList]);
    setReviewSubmitted(true);
    setReviewText('');
    setTimeout(() => setReviewSubmitted(false), 4000);
  };

  const toggleReviewExpand = (revId) => {
    setExpandedReviewIds(prev => 
      prev.includes(revId) ? prev.filter(id => id !== revId) : [...prev, revId]
    );
  };

  const handleShowClick = (theatre, show) => {
    selectShowForBooking(movie, theatre, show);
    if (typeof onOpenSeatPicker === 'function') {
      onOpenSeatPicker();
    } else if (typeof onBookTickets === 'function') {
      onBookTickets();
    }
  };

  const handleScrollToShowtimes = () => {
    const el = document.getElementById('showtimes-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const youtubeEmbedUrl = getYouTubeEmbedUrl(movie.trailerUrl);
  const synopsisText = movie.synopsis || movie.description || 'Experience the epic cinematic journey with high-definition Dolby Atmos soundscapes and IMAX 3D visual effects.';
  const isLongSynopsis = synopsisText.length > 140;

  // Filter out any empty/dummy cast members
  const validCast = Array.isArray(movie.cast) ? movie.cast.filter(c => c && (c.name || typeof c === 'string')) : [];

  return (
    <div className="min-h-screen bg-[#050508] text-white pb-20 font-sans">
      
      {/* 1. Prominent Top Sub-Header Bar (Strictly Below First Navbar, Fixed Back Arrow Navigation) */}
      <div className="bg-[#0A0D14]/90 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 py-3 sticky top-[56px] sm:top-[64px] z-30 flex items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBackClick}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-amber-500 hover:text-black text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold shrink-0"
            title="Return to Home"
            aria-label="Back Arrow Navigation"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Home</span>
          </button>

          <h2 className="text-sm sm:text-lg font-bold font-sans text-white truncate max-w-[200px] sm:max-w-md">
            {movie.title}
          </h2>
        </div>

        <button
          onClick={handleScrollToShowtimes}
          className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 text-black font-extrabold text-xs shadow-md hover:brightness-110 transition-all flex items-center gap-1 cursor-pointer shrink-0"
        >
          <Ticket className="w-3.5 h-3.5" />
          <span>Book Now</span>
        </button>
      </div>

      {/* 2. Hero Banner Header & Left-Aligned Movie Information */}
      <div className="relative w-full overflow-hidden bg-black border-b border-white/10">
        
        {/* Backdrop Banner Image (Dynamic Admin Uploaded Background Banner) */}
        <div className="relative w-full h-[40vh] sm:h-[55vh] min-h-[280px]">
          <img
            src={movie.banner || movie.poster}
            alt={`${movie.title} Background Banner`}
            className="w-full h-full object-cover opacity-40 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-[#050508]/70 to-transparent"></div>
        </div>

        {/* Floating Left-Aligned Movie Poster & Meta Overview */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-24 sm:-mt-36 relative z-10 pb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 sm:gap-6">
            
            {/* Movie Poster & Repositioned Watch Trailer CTA Button Beside Poster */}
            <div className="flex flex-col items-start gap-2 shrink-0">
              <img
                src={movie.poster}
                alt={`${movie.title} Poster`}
                className="w-28 sm:w-44 aspect-[2/3] rounded-2xl sm:rounded-3xl object-cover border-2 border-white/20 shadow-2xl shrink-0"
              />

              {/* Repositioned 'Watch Trailer' Button Directly Beside/Adjacent to Movie Poster */}
              {movie.trailerUrl && (
                <button
                  onClick={() => setIsTrailerOpen(true)}
                  className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-[11px] font-extrabold flex items-center justify-center gap-1.5 shadow-lg shadow-red-600/30 cursor-pointer"
                  title="Watch Official Trailer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Watch Trailer</span>
                </button>
              )}
            </div>

            {/* Movie Details (Left-Aligned) */}
            <div className="space-y-2 sm:space-y-3 flex-1 text-left">
              
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[10px] sm:text-xs font-bold uppercase">
                  {movie.parentalRating || 'UA'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-red-600/30 text-red-300 border border-red-500/40 text-[10px] sm:text-xs font-bold uppercase">
                  {movie.status || 'Now Showing'}
                </span>
                <span className="text-[11px] sm:text-xs text-white/60">Release: {movie.releaseDate || '2026'}</span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-4xl font-black font-serif text-white tracking-tight leading-tight">
                {movie.title}
              </h1>

              {movie.tagline && (
                <p className="text-xs sm:text-sm text-amber-300/90 font-medium italic">{movie.tagline}</p>
              )}

              {/* Ratings & Duration (Director & Producer removed from here to prevent duplication) */}
              <div className="flex items-center gap-2 sm:gap-4 text-xs font-semibold text-white/80">
                <span className="flex items-center gap-1 text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <strong className="text-xs sm:text-sm">{movie.rating || 9.2}</strong> ({((movie.votesCount || 25000)/1000).toFixed(1)}k votes)
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  {movie.duration || '2h 30m'}
                </span>
              </div>

              {/* Genres & Formats (Hidden Visible Scrollbar while preserving touch scrolling) */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pt-1">
                {Array.isArray(movie.genres) && movie.genres.map((g, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-white/10 text-white/90 text-[10px] sm:text-xs font-semibold border border-white/10 shrink-0">
                    {g}
                  </span>
                ))}
                {Array.isArray(movie.formats) && movie.formats.map((f, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 text-[10px] sm:text-xs font-bold border border-amber-500/30 shrink-0">
                    {f}
                  </span>
                ))}
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Main Details Body */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6 sm:pt-10 space-y-8 sm:space-y-12">
        
        {/* 3. About Movie Section (Contains Director & Producer strictly to avoid duplicate text) */}
        <div className="glass-panel p-5 sm:p-8 rounded-3xl border border-white/10 space-y-4">
          <h3 className="text-base sm:text-xl font-bold font-sans text-white flex items-center gap-2">
            <Film className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
            <span>About The Movie</span>
          </h3>
          
          <div className="text-xs sm:text-sm text-white/70 leading-relaxed max-w-4xl">
            <p>
              {isLongSynopsis && !isAboutReadMore 
                ? `${synopsisText.slice(0, 140)}...`
                : synopsisText
              }
              {isLongSynopsis && (
                <button
                  onClick={() => setIsAboutReadMore(!isAboutReadMore)}
                  className="text-amber-400 font-bold text-xs cursor-pointer ml-2 hover:underline inline-flex items-center gap-0.5"
                >
                  <span>{isAboutReadMore ? 'Read Less' : 'Read More'}</span>
                  {isAboutReadMore ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              )}
            </p>
          </div>

          {/* Director & Producer Meta Strictly Kept Inside About Section */}
          <div className="pt-3 border-t border-white/10 flex flex-wrap gap-4 text-xs text-white/70">
            <div><span className="text-amber-400 font-semibold">Director:</span> {movie.director || 'James Cameron'}</div>
            {movie.producer && <div><span className="text-amber-400 font-semibold">Producer:</span> {movie.producer}</div>}
            {movie.language && <div><span className="text-amber-400 font-semibold">Language:</span> {movie.language}</div>}
          </div>
        </div>

        {/* 4. Conditional Cast & Crew Section (Rendered ONLY IF cast data exists from Admin) */}
        {validCast.length > 0 && (
          <div className="space-y-4">
            <CastCarousel cast={validCast} director={movie.director} />
          </div>
        )}

        {/* 5. Select Showtimes & Theatre Section */}
        <div id="showtimes-section" className="space-y-6 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h3 className="text-lg sm:text-2xl font-bold font-sans text-white">Select Showtimes & Theatre</h3>
              <p className="text-xs text-amber-300">Showing available dates & theatres configured by Admin</p>
            </div>

            {/* Date Selector Chips (Hidden Scrollbar) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none no-scrollbar [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {availableDates.map((d) => (
                <button
                  key={d.date}
                  onClick={() => setSelectedDate(d.date)}
                  className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    currentDateSelection === d.date
                      ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                      : 'glass-panel text-white/70 hover:text-white hover:bg-white/10 border border-white/10'
                  }`}
                >
                  <span className="block text-[9px] opacity-75">{d.label}</span>
                  <span>{d.day}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Theatre Shows List */}
          <div className="space-y-4">
            {filteredTheatres.length > 0 ? (
              filteredTheatres.map((theatre) => (
                <div key={theatre.id} className="glass-panel p-4 sm:p-6 rounded-3xl border border-white/10 space-y-4 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                          <span>{theatre.name}</span>
                        </h4>
                        <button
                          onClick={() => {
                            setSelectedTheatreForMap(theatre);
                            setIsMapModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500 hover:text-black border border-amber-400/40 text-amber-300 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                          title="View Interactive Google Map Location"
                        >
                          <MapPin className="w-3.5 h-3.5 text-amber-400 group-hover:text-black" />
                          <span>📍 Location / Map</span>
                        </button>
                      </div>
                      <p className="text-xs text-white/50">{theatre.address}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {theatre.facilities?.map((fac, idx) => (
                        <span key={idx} className="px-2.5 py-0.5 rounded-md bg-white/5 text-[10px] text-amber-300 border border-white/10 font-medium">
                          {fac}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Show Time Slots Buttons */}
                  <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-1">
                    {theatre.shows?.map((show) => {
                      const datePriceConfig = theatre.pricingByDate?.[currentDateSelection] || theatre.datePricing?.[currentDateSelection];
                      const isUnavailable = datePriceConfig && datePriceConfig.status === 'UNAVAILABLE';
                      const effectivePrice = datePriceConfig && (datePriceConfig.status === 'APPROVED' || datePriceConfig.status === 'AVAILABLE')
                        ? ((show.format || '').toLowerCase().includes('imax') ? datePriceConfig.imaxPrice : ((show.format || '').toLowerCase().includes('vip') ? datePriceConfig.vipPrice : datePriceConfig.standardPrice))
                        : (show.price || 250);

                      if (isUnavailable) {
                        return (
                          <div key={show.id} className="px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl glass-panel text-white/30 border border-white/10 text-center font-bold opacity-60 cursor-not-allowed">
                            <div className="text-xs sm:text-sm font-extrabold">{show.time}</div>
                            <div className="text-[9px] sm:text-[10px] text-rose-400 font-medium">Slot Offline ({currentDateSelection})</div>
                          </div>
                        );
                      }

                      return (
                        <button
                          key={show.id}
                          onClick={() => handleShowClick(theatre, { ...show, price: effectivePrice })}
                          className="px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl glass-panel hover:bg-amber-500 hover:text-black text-amber-400 border border-amber-400/40 font-bold transition-all text-center group cursor-pointer shadow-md hover:scale-105"
                        >
                          <div className="text-xs sm:text-sm font-extrabold group-hover:text-black">{show.time}</div>
                          <div className="text-[9px] sm:text-[10px] text-white/60 group-hover:text-black font-medium">
                            {show.format || 'IMAX 3D'} • ₹{effectivePrice}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/10 text-center space-y-3">
                <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
                <h4 className="text-base font-bold text-white">No Theatre Schedules Found in {activeCityToUse} for {currentDateSelection}</h4>
                <p className="text-xs text-white/60 max-w-md mx-auto">
                  No showtimes currently scheduled for {activeCityToUse} on this date. You can select another date above or view showtimes across all cities.
                </p>
                {activeCityToUse !== 'All' && (
                  <div className="pt-1 flex justify-center">
                    <button
                      type="button"
                      onClick={() => setSelectedCityFilter('All')}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs cursor-pointer shadow-lg shadow-amber-500/20"
                    >
                      View All Cities
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 6. User Reviews Section Optimization (Compact Size & Read More Toggle) */}
        <div className="glass-panel p-5 sm:p-8 rounded-3xl border border-white/10 space-y-5">
          <h3 className="text-base sm:text-xl font-bold font-sans text-white flex items-center gap-2">
            <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
            <span>Audience Reviews & Ratings</span>
          </h3>

          {/* Add Review Form */}
          <form onSubmit={handleReviewSubmit} className="space-y-3 p-3.5 sm:p-4 rounded-2xl bg-white/5 border border-white/10">
            <h4 className="text-xs font-bold text-amber-300 uppercase">Write Your Review</h4>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/70 font-semibold">Your Rating:</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setUserRating(star)}
                    className="p-0.5 cursor-pointer"
                  >
                    <Star className={`w-4 h-4 sm:w-5 sm:h-5 ${star <= userRating ? 'fill-amber-400 text-amber-400' : 'text-white/30'}`} />
                  </button>
                ))}
              </div>
            </div>

            <textarea
              rows={2}
              required
              placeholder="Share your thoughts about the movie..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="w-full p-2.5 rounded-xl glass-input text-xs text-white placeholder-white/40"
            ></textarea>

            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-md shadow-amber-500/20 cursor-pointer"
              >
                Post Review
              </button>
              {reviewSubmitted && (
                <span className="text-xs text-emerald-400 font-bold">Posted!</span>
              )}
            </div>
          </form>

          {/* Compact Reviews List with Read More toggle */}
          <div className="space-y-3 pt-1">
            {reviewsList.map((rev) => {
              const isExpanded = expandedReviewIds.includes(rev.id);
              const isLongComment = rev.comment.length > 80;

              return (
                <div key={rev.id} className="p-3.5 sm:p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-bold text-white">{rev.userName}</span>
                    <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{rev.rating} / 5</span>
                    </div>
                  </div>
                  
                  <p className="text-xs text-white/70 leading-relaxed">
                    {isLongComment && !isExpanded
                      ? `${rev.comment.slice(0, 80)}...`
                      : rev.comment
                    }
                    {isLongComment && (
                      <button
                        onClick={() => toggleReviewExpand(rev.id)}
                        className="text-amber-400 font-bold text-[11px] cursor-pointer ml-1.5 hover:underline inline-block"
                      >
                        {isExpanded ? 'Read Less' : 'Read More'}
                      </button>
                    )}
                  </p>

                  <span className="text-[10px] text-white/40 block">{rev.createdAt}</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* 7. Clean Compact Footer at the Bottom */}
      <footer className="mt-16 border-t border-white/10 bg-[#07090E] py-8 text-center text-xs text-white/50 space-y-3">
        <div className="flex items-center justify-center gap-2 text-amber-400 font-bold text-sm">
          <span>PrimeShow Ultra Luxury Cinema</span>
        </div>
        <div className="flex flex-wrap justify-center gap-4 text-[11px] text-white/60">
          <button onClick={handleBackClick} className="hover:text-amber-400 cursor-pointer">Home</button>
          <span>•</span>
          <button onClick={handleScrollToShowtimes} className="hover:text-amber-400 cursor-pointer">Select Showtimes</button>
          <span>•</span>
          <span className="hover:text-amber-400 cursor-pointer">Privacy Policy</span>
          <span>•</span>
          <span className="hover:text-amber-400 cursor-pointer">Terms & Conditions</span>
        </div>
        <p className="text-[10px] text-white/40">© 2026 PrimeShow Entertainment Ltd. All rights reserved.</p>
      </footer>

      {/* Trailer Video Player Modal */}
      {isTrailerOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl aspect-video rounded-3xl overflow-hidden glass-panel border border-white/20 shadow-2xl">
            <button
              onClick={() => setIsTrailerOpen(false)}
              className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-black/80 text-white hover:bg-red-600 transition-colors cursor-pointer"
            >
              ✕
            </button>

            {youtubeEmbedUrl ? (
              <iframe
                src={youtubeEmbedUrl}
                title={`${movie.title} Official Trailer`}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            ) : (
              <video
                src={movie.trailerUrl}
                controls
                autoPlay
                className="w-full h-full object-cover"
              ></video>
            )}
          </div>
        </div>
      )}

      {/* Google Map In-App Modal */}
      {isMapModalOpen && selectedTheatreForMap && (
        <TheatreMapModal
          isOpen={isMapModalOpen}
          onClose={() => setIsMapModalOpen(false)}
          theatre={selectedTheatreForMap}
        />
      )}

    </div>
  );
};
