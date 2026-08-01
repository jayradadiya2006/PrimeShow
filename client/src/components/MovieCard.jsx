import React from 'react';
import { Star, Heart, Clock, Ticket } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const MovieCard = ({ movie, onSelect, onBookNow }) => {
  const { user, toggleWishlist } = useAuth();
  const isWishlisted = user?.wishlist?.includes(movie.id);

  return (
    <div 
      onClick={() => onSelect(movie.id)}
      className="group relative rounded-2xl sm:rounded-3xl overflow-hidden glass-panel border border-slate-300/80 dark:border-slate-800 hover:border-red-500/60 card-hover-3d cursor-pointer shadow-lg hover:shadow-2xl flex flex-col justify-between transition-all duration-300 active:scale-[0.98]"
    >
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-950 shrink-0">
        <img
          src={movie.poster}
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Ambient Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity"></div>

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
          <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-amber-400/40 text-[9px] sm:text-[10px] font-extrabold text-amber-400 uppercase tracking-wider">
            {movie.parentalRating || 'UA'}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(movie.id);
            }}
            aria-label="Wishlist movie"
            className="p-1.5 sm:p-2 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700/70 text-slate-200 hover:text-rose-500 transition-colors"
          >
            <Heart className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>
        </div>

        {/* Formats Overlay */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex flex-wrap gap-1 z-10">
          {movie.formats?.slice(0, 3).map((fmt, i) => (
            <span key={i} className="px-1.5 py-0.5 rounded bg-slate-950/80 backdrop-blur-md border border-slate-700/60 text-[8px] sm:text-[9px] font-bold text-slate-200">
              {fmt}
            </span>
          ))}
        </div>
      </div>

      {/* Card Content Info */}
      <div className="p-3 sm:p-4 flex flex-col justify-between flex-1 bg-white dark:bg-slate-900/95 text-slate-900 dark:text-slate-100 transition-colors duration-300">
        <div>
          {/* Title */}
          <h3 className="text-xs sm:text-base font-bold font-serif text-slate-900 dark:text-slate-100 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-1 leading-snug">
            {movie.title}
          </h3>

          {/* Genres & Duration */}
          <div className="flex items-center justify-between gap-1 mt-1 mb-1.5 text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-400 font-medium">
            <span className="truncate">{movie.genres?.join(', ')}</span>
            <span className="flex items-center gap-0.5 text-amber-600 dark:text-amber-400 font-bold shrink-0">
              <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              {movie.duration}
            </span>
          </div>

          {/* Rating */}
          <div className="flex items-center justify-between gap-1 text-[10px] sm:text-xs mb-2.5">
            <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
              <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-500 dark:fill-amber-400 text-amber-500 dark:text-amber-400" />
              <span>{movie.rating || 9.0}</span>
              <span className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 font-normal">({((movie.votesCount || 10000) / 1000).toFixed(1)}k)</span>
            </div>
            <span className="text-[9px] sm:text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-tight">Now Showing</span>
          </div>
        </div>

        {/* Action Button: Book Now (Electric Crimson CTA) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onBookNow) onBookNow(movie.id);
            else onSelect(movie.id);
          }}
          className="w-full py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 text-white font-extrabold text-[11px] sm:text-xs neon-btn-primary flex items-center justify-center gap-1 sm:gap-1.5 shadow-md shadow-red-600/30 cursor-pointer active:scale-95 transition-transform"
        >
          <Ticket className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Book Tickets</span>
        </button>
      </div>
    </div>
  );
};
