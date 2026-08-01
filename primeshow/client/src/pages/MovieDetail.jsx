import React, { useState, useEffect } from 'react';
import { Star, Clock, Calendar, Film, Play, Sparkles, MapPin, ChevronRight, CheckCircle2, Send, MessageSquare, User, Video, Shield, Award, AlertCircle } from 'lucide-react';
import { CastCarousel } from '../components/CastCarousel';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';

export const MovieDetail = ({ movieId, onOpenSeatPicker, onBookTickets, onBackToMovies }) => {
  const { user } = useAuth();
  const { moviesList, selectShowForBooking } = useBooking();
  const [movie, setMovie] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedCityFilter, setSelectedCityFilter] = useState('All');
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  
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
        comment: 'Mind-blowing visuals! James Cameron has outdone himself again. The native 3D in IMAX was so immersive.',
        createdAt: '2 days ago'
      },
      {
        id: 'rev_2',
        userName: 'Vikram Mehta',
        rating: 5,
        comment: 'The sound design of Hans Zimmer and director execution is unmatched. Absolutely legendary film experience.',
        createdAt: '3 days ago'
      }
    ]);
  }, [movieId, moviesList]);

  if (!movie) return null;

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
    // Fallback default if no show dates specified
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

  // Dynamic Theatre & Showtimes Retrieval based strictly on selected date and Admin schedules
  const getTheatresForCurrentDate = () => {
    if (movie.schedules && movie.schedules[currentDateSelection]) {
      return movie.schedules[currentDateSelection];
    }
    return movie.theatres || [];
  };

  const theatreShows = getTheatresForCurrentDate();
  const filteredTheatres = selectedCityFilter === 'All'
    ? theatreShows
    : theatreShows.filter(t => t.city?.toLowerCase() === selectedCityFilter.toLowerCase());

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

  const handleShowClick = (theatre, show) => {
    selectShowForBooking(movie, theatre, show);
    if (typeof onOpenSeatPicker === 'function') {
      onOpenSeatPicker();
    } else if (typeof onBookTickets === 'function') {
      onBookTickets();
    }
  };

  const youtubeEmbedUrl = getYouTubeEmbedUrl(movie.trailerUrl);

  return (
    <div className="min-h-screen bg-[#050508] text-white pb-20 font-sans">
      
      {/* Hero Banner Header */}
      <div className="relative w-full h-[65vh] min-h-[450px] overflow-hidden bg-black">
        <img
          src={movie.banner || movie.poster}
          alt={movie.title}
          className="w-full h-full object-cover opacity-50 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-[#050508]/60 to-transparent"></div>

        {/* Back Button */}
        <button
          onClick={onBackToMovies}
          className="absolute top-6 left-6 px-4 py-2 rounded-2xl glass-panel text-xs font-bold text-white/90 hover:text-white hover:bg-white/20 transition-all flex items-center gap-2 border border-white/10 z-20 cursor-pointer"
        >
          ← Back to Movies
        </button>

        {/* Floating Poster & Movie Meta Overlays */}
        <div className="absolute bottom-8 left-0 right-0 max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-end md:items-end gap-6 z-10">
          <img
            src={movie.poster}
            alt={movie.title}
            className="w-36 h-52 sm:w-48 sm:h-72 rounded-3xl object-cover border-2 border-white/20 shadow-2xl shrink-0"
          />

          <div className="space-y-3 flex-1 text-left">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 text-xs font-bold uppercase tracking-wider">
                {movie.parentalRating || 'UA'}
              </span>
              <span className="px-3 py-1 rounded-full bg-red-600/30 text-red-300 border border-red-500/40 text-xs font-bold uppercase tracking-wider">
                {movie.status || 'Now Showing'}
              </span>
              <span className="text-xs text-white/60">Released: {movie.releaseDate || '2026'}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black font-serif text-white tracking-tight leading-none">
              {movie.title}
            </h1>

            {movie.tagline && (
              <p className="text-sm text-amber-300/90 font-medium italic">{movie.tagline}</p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-white/80">
              <span className="flex items-center gap-1.5 text-amber-400">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <strong className="text-sm">{movie.rating || 9.2}</strong> ({((movie.votesCount || 25000)/1000).toFixed(1)}k votes)
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                {movie.duration || '2h 30m'}
              </span>
              <span>•</span>
              <span>Director: {movie.director || 'James Cameron'}</span>
              {movie.producer && (
                <>
                  <span>•</span>
                  <span>Producer: {movie.producer}</span>
                </>
              )}
            </div>

            {/* Genres & Formats */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {Array.isArray(movie.genres) && movie.genres.map((g, i) => (
                <span key={i} className="px-2.5 py-0.5 rounded-lg bg-white/10 text-white/80 text-[11px] font-medium border border-white/10">
                  {g}
                </span>
              ))}
              {Array.isArray(movie.formats) && movie.formats.map((f, i) => (
                <span key={i} className="px-2.5 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 text-[11px] font-bold border border-amber-500/30">
                  {f}
                </span>
              ))}
            </div>

            {/* Trailer CTA Button */}
            {movie.trailerUrl && (
              <div className="pt-2">
                <button
                  onClick={() => setIsTrailerOpen(true)}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-red-600/30 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Watch Trailer</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Details Body */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-10 space-y-12">
        
        {/* Synopsis / Description */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-3">
          <h3 className="text-xl font-bold font-sans text-white flex items-center gap-2">
            <Film className="w-5 h-5 text-amber-400" />
            <span>About The Movie</span>
          </h3>
          <p className="text-sm text-white/70 leading-relaxed max-w-4xl">
            {movie.synopsis || movie.description || 'Experience the epic cinematic journey with high-definition Dolby Atmos soundscapes and IMAX 3D visual effects.'}
          </p>
        </div>

        {/* Dynamic Cast & Crew Section */}
        {movie.cast && movie.cast.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold font-sans text-white flex items-center gap-2">
              <User className="w-5 h-5 text-amber-400" />
              <span>Cast & Star Performers</span>
            </h3>
            <CastCarousel cast={movie.cast} />
          </div>
        )}

        {/* Dynamic Date-Scoped Theatre Showtimes & Booking Section */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h3 className="text-2xl font-bold font-sans text-white">Select Showtimes & Theatre</h3>
              <p className="text-xs text-amber-300">Showing available dates & theatres configured by Admin</p>
            </div>

            {/* Date Selector Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
              {availableDates.map((d) => (
                <button
                  key={d.date}
                  onClick={() => setSelectedDate(d.date)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
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
                <div key={theatre.id} className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                    <div>
                      <h4 className="text-lg font-bold text-white flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>{theatre.name}</span>
                      </h4>
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
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    {theatre.shows?.map((show) => (
                      <button
                        key={show.id}
                        onClick={() => handleShowClick(theatre, show)}
                        className="px-5 py-3 rounded-2xl glass-panel hover:bg-amber-500 hover:text-black text-amber-400 border border-amber-400/40 font-bold transition-all text-center group cursor-pointer shadow-md hover:scale-105"
                      >
                        <div className="text-sm font-extrabold group-hover:text-black">{show.time}</div>
                        <div className="text-[10px] text-white/60 group-hover:text-black font-medium">{show.format || 'IMAX 3D'} • ₹{show.price}</div>
                      </button>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 rounded-3xl glass-panel border border-white/10 text-center space-y-2">
                <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
                <h4 className="text-base font-bold text-white">No Theatre Schedules Configured for {currentDateSelection}</h4>
                <p className="text-xs text-white/60">This movie is not scheduled for screening on this specific date. Please select another date above or check back later for Admin updates.</p>
              </div>
            )}
          </div>
        </div>

        {/* User Reviews & Ratings Section */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
          <h3 className="text-xl font-bold font-sans text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-amber-400" />
            <span>Audience Reviews & Ratings</span>
          </h3>

          {/* Add Review Form */}
          <form onSubmit={handleReviewSubmit} className="space-y-4 p-4 rounded-2xl bg-white/5 border border-white/10">
            <h4 className="text-xs font-bold text-amber-300 uppercase">Write Your Review</h4>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/70 font-semibold">Your Rating:</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setUserRating(star)}
                    className="p-1 cursor-pointer"
                  >
                    <Star className={`w-5 h-5 ${star <= userRating ? 'fill-amber-400 text-amber-400' : 'text-white/30'}`} />
                  </button>
                ))}
              </div>
            </div>

            <textarea
              rows={3}
              required
              placeholder="Share your thoughts about the movie..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="w-full p-3 rounded-xl glass-input text-xs text-white"
            ></textarea>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-md shadow-amber-500/20 cursor-pointer"
            >
              Post Review
            </button>

            {reviewSubmitted && (
              <span className="ml-3 text-xs text-emerald-400 font-bold">Review posted successfully!</span>
            )}
          </form>

          {/* Reviews List */}
          <div className="space-y-4 pt-2">
            {reviewsList.map((rev) => (
              <div key={rev.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">{rev.userName}</span>
                  <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{rev.rating} / 5</span>
                  </div>
                </div>
                <p className="text-xs text-white/70 leading-relaxed">{rev.comment}</p>
                <span className="text-[10px] text-white/40 block">{rev.createdAt}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

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

    </div>
  );
};
