import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, Play, Calendar, MapPin, Clock, Film, User, MessageSquare, 
  ChevronRight, Shield, Award, Check, ThumbsUp, Send 
} from 'lucide-react';
import { useBooking } from '../../context/BookingContext';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';

export default function MovieDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, setAuthModalOpen } = useAuth();
  const { selectedCity, selectedDate, setSelectedDate, setSelectedShow } = useBooking();

  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [trailerOpen, setTrailerOpen] = useState(false);

  // Review submission state
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  useEffect(() => {
    API.get(`/movies/${id}`)
      .then(res => setMovie(res.data))
      .catch(() => {});

    API.get(`/shows?movieId=${id}&city=${encodeURIComponent(selectedCity)}`)
      .then(res => setShows(res.data))
      .catch(() => {});

    API.get(`/reviews/${id}`)
      .then(res => setReviews(res.data))
      .catch(() => {});
  }, [id, selectedCity]);

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        Loading cinematic experience...
      </div>
    );
  }

  const dateOptions = [
    { label: "Today", value: "2026-07-27" },
    { label: "Tomorrow", value: "2026-07-28" },
    { label: "Wed, 29 Jul", value: "2026-07-29" },
    { label: "Thu, 30 Jul", value: "2026-07-30" }
  ];

  const handleSelectShowtime = (show) => {
    setSelectedShow(show);
    navigate(`/seat-booking/${show.id}`);
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    setReviewSubmitting(true);
    try {
      const res = await API.post('/reviews', {
        movieId: id,
        userName: user.name,
        userAvatar: user.avatar,
        rating: newRating,
        comment: newComment
      });
      setReviews([res.data, ...reviews]);
      setNewComment('');
    } catch (err) {
      console.error(err);
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div className="space-y-12 pb-16 bg-[#050508]">
      
      {/* CINEMATIC HERO BANNER */}
      <div className="relative h-[65vh] min-h-[480px] w-full overflow-hidden">
        <img src={movie.bannerUrl || movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-black/50 to-black/80" />

        <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 flex flex-col md:flex-row items-end gap-8">
          {/* FLOATING POSTER */}
          <div className="w-44 sm:w-56 aspect-[2/3] rounded-3xl overflow-hidden shadow-2xl border-2 border-white/20 shrink-0 hidden sm:block glow-cyan">
            <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
          </div>

          {/* MOVIE TITLE & META */}
          <div className="space-y-4 flex-1">
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full glass-badge text-xs font-bold text-cyan-300">
                {movie.certification}
              </span>
              <span className="px-3 py-1 rounded-full glass-badge text-xs font-bold text-amber-300 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {movie.rating} ({movie.votes})
              </span>
              {movie.formats?.map(f => (
                <span key={f} className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-bold text-cyan-300 uppercase">
                  {f}
                </span>
              ))}
            </div>

            <h1 className="font-serif text-4xl sm:text-6xl font-bold text-white leading-tight">
              {movie.title}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              {movie.synopsis}
            </p>

            <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400">
              <span>Duration: <strong className="text-white">{movie.duration}</strong></span>
              <span>Languages: <strong className="text-white">{movie.languages?.join(', ')}</strong></span>
              <span>Release: <strong className="text-white">{movie.releaseDate}</strong></span>
            </div>

            {movie.trailerUrl && (
              <button
                onClick={() => setTrailerOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" /> Watch Official Trailer
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SHOWTIME MATRIX ENGINE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="p-6 rounded-3xl glass-panel border-cyan-500/30 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h2 className="font-serif text-3xl font-bold text-white flex items-center gap-2">
                <Clock className="w-7 h-7 text-cyan-400" /> Select Showtime & Multiplex
              </h2>
              <p className="text-xs text-slate-400">Viewing shows in <strong>{selectedCity}</strong></p>
            </div>

            {/* DATE PICKER SELECTOR */}
            <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1">
              {dateOptions.map(d => (
                <button
                  key={d.value}
                  onClick={() => setSelectedDate(d.value)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all border ${
                    selectedDate === d.value
                      ? 'bg-cyan-500 text-black border-cyan-400 glow-cyan'
                      : 'glass-panel text-slate-300 hover:border-cyan-500/40'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* MULTI-THEATRE SHOWS GRID */}
          {shows.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              No showtimes scheduled for this date in {selectedCity}. Try changing the city or date.
            </div>
          ) : (
            <div className="space-y-6">
              {shows.map(show => (
                <div key={show.id} className="p-5 rounded-2xl glass-panel border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-white">{show.theatreName}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{show.screenName} • {show.format} • {show.language}</p>
                    <div className="flex gap-2 mt-2">
                      {show.theatreFacilities?.slice(0, 3).map(f => (
                        <span key={f} className="text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded">{f}</span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleSelectShowtime(show)}
                      className="px-6 py-3 rounded-2xl bg-cyan-500/20 hover:bg-cyan-500 hover:text-black border border-cyan-500/40 text-cyan-300 font-bold text-xs transition-all glow-cyan flex flex-col items-center cursor-pointer"
                    >
                      <span className="text-sm font-extrabold">{show.time}</span>
                      <span className="text-[10px] opacity-80">₹{show.prices?.Normal || 300} onwards</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CAST & CREW CAROUSEL */}
      {movie.cast && movie.cast.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <h2 className="font-serif text-3xl font-bold text-white">Cast & Crew Spotlight</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {movie.cast.map(c => (
              <div key={c.name} className="p-4 rounded-2xl glass-panel border-white/10 flex items-center gap-3">
                <img src={c.image} alt={c.name} className="w-12 h-12 rounded-full object-cover border border-cyan-500/30" />
                <div>
                  <p className="text-xs font-bold text-white">{c.name}</p>
                  <p className="text-[10px] text-slate-400">{c.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* USER REVIEWS & RATING SUBMISSION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="p-6 rounded-3xl glass-panel border-white/10 space-y-6">
          <h2 className="font-serif text-3xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-7 h-7 text-cyan-400" /> Audience Reviews
          </h2>

          {/* SUBMIT REVIEW FORM */}
          <form onSubmit={handleAddReview} className="p-4 rounded-2xl glass-panel border-white/10 space-y-3">
            <p className="text-xs font-semibold text-slate-300">Submit Your Movie Review</p>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setNewRating(star)}
                  className="cursor-pointer"
                >
                  <Star className={`w-5 h-5 ${star <= newRating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} />
                </button>
              ))}
            </div>
            <textarea
              rows={2}
              placeholder={user ? "Write your thoughts on this movie..." : "Sign in to leave a review"}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={!user}
              required
              className="w-full p-3 rounded-xl glass-input text-xs"
            />
            <button
              type="submit"
              disabled={reviewSubmitting || !user}
              className="px-6 py-2 rounded-full bg-cyan-500 text-black font-bold text-xs glow-cyan disabled:opacity-50 cursor-pointer"
            >
              {user ? (reviewSubmitting ? 'Posting...' : 'Post Review') : 'Sign In to Review'}
            </button>
          </form>

          {/* REVIEWS LIST */}
          <div className="space-y-4">
            {reviews.map(rev => (
              <div key={rev.id} className="p-4 rounded-2xl glass-panel border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src={rev.userAvatar} alt={rev.userName} className="w-8 h-8 rounded-full object-cover" />
                    <span className="text-xs font-bold text-white">{rev.userName}</span>
                  </div>
                  <div className="flex items-center text-xs font-bold text-amber-300">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-1" /> {rev.rating}/5
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{rev.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRAILER MODAL */}
      {trailerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl">
          <div className="relative w-full max-w-4xl aspect-video bg-black rounded-3xl overflow-hidden border border-cyan-500/30">
            <button onClick={() => setTrailerOpen(false)} className="absolute top-4 right-4 z-50 px-4 py-2 rounded-full bg-black/60 text-white font-bold text-xs">
              ✕ Close
            </button>
            <iframe src={movie.trailerUrl} title="Official Trailer" className="w-full h-full border-none" allowFullScreen />
          </div>
        </div>
      )}
    </div>
  );
}
