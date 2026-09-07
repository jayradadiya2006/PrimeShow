import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Star, Ticket, Play, Sparkles, Clock, Globe, ShieldCheck, Pause } from 'lucide-react';
import { useBooking } from '../context/BookingContext';

export const MovieCarousel = ({ onBookNow, onSelectMovie }) => {
  const { moviesList, heroSlidesList } = useBooking();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);

  // Dynamic hero slides list from store (or fallback)
  const carouselMovies = (heroSlidesList && heroSlidesList.length > 0)
    ? heroSlidesList
    : ((moviesList && moviesList.length > 0) ? moviesList : [
        {
          id: 'hero_1',
          movieId: 'mov_1',
          title: 'Avatar: Fire and Ash',
          tagline: 'Enter the Uncharted Regions of Pandora in Native IMAX 3D',
          badge: 'BLOCKBUSTER',
          rating: 9.4,
          votesCount: 42800,
          duration: '3h 12m',
          genres: ['Sci-Fi', 'Action', 'Adventure'],
          languages: ['English', 'Hindi', 'Tamil', 'Telugu'],
          price: 480,
          banner: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80',
          synopsis: 'Jake Sully and Neytiri encounter the Ash People, a volcanic Na\'vi clan whose aggressive nature challenges their perception of Pandora.'
        }
      ]);

  // Reset index if carousel list length shrinks
  useEffect(() => {
    if (currentIndex >= carouselMovies.length) {
      setCurrentIndex(0);
    }
  }, [carouselMovies.length]);

  // Auto-play interval and animated progress bar (4 seconds)
  useEffect(() => {
    if (isPaused || carouselMovies.length <= 1) return;

    const intervalTime = 4000;
    const stepTime = 40;
    const increment = (stepTime / intervalTime) * 100;

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCurrentIndex((curr) => (curr + 1) % carouselMovies.length);
          return 0;
        }
        return prev + increment;
      });
    }, stepTime);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, carouselMovies.length]);

  const handlePrev = () => {
    setProgress(0);
    setCurrentIndex((prev) => (prev - 1 + carouselMovies.length) % carouselMovies.length);
  };

  const handleNext = () => {
    setProgress(0);
    setCurrentIndex((prev) => (prev + 1) % carouselMovies.length);
  };

  const handleSelectDot = (idx) => {
    setProgress(0);
    setCurrentIndex(idx);
  };

  if (carouselMovies.length === 0) return null;

  const currentMovie = carouselMovies[currentIndex] || carouselMovies[0];

  return (
    <div className="w-full mb-8 sm:mb-12 space-y-3 font-sans">
      
      {/* Top Header Label */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold text-amber-300 uppercase tracking-widest">
            Featured Blockbuster Slideshow
          </span>
          {isPaused && (
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold flex items-center gap-1 animate-pulse">
              <Pause className="w-3 h-3 text-amber-400" /> Auto-Slide Paused
            </span>
          )}
        </div>
      </div>

      {/* Main Animated Movie Carousel Hero Frame with Mouse & Touch Event Handlers */}
      <div
        className="relative w-full h-[280px] xs:h-[340px] sm:h-[420px] md:h-[480px] rounded-3xl overflow-hidden border border-white/15 shadow-2xl group select-none"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Background Image with Gradient Overlay & Smooth Cross-Fade */}
        <div className="absolute inset-0 transition-opacity duration-700">
          <img
            key={currentMovie.id || currentIndex}
            src={currentMovie.banner || currentMovie.poster}
            alt={currentMovie.title}
            className="w-full h-full object-cover transition-all duration-700 ease-out transform scale-105 group-hover:scale-100 animate-fade-in"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/75 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-transparent to-transparent"></div>
        </div>

        {/* Dynamic Overlay Content */}
        <div className="relative h-full flex flex-col justify-between p-4 xs:p-6 sm:p-10 md:p-12 max-w-2xl z-10">
          
          {/* Top Badges & Ratings */}
          <div className="space-y-2 sm:space-y-3 animate-fade-in">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="px-2.5 py-0.5 sm:px-3.5 sm:py-1 rounded-full bg-amber-500 text-black font-black text-[10px] sm:text-[11px] uppercase tracking-wider shadow-lg">
                {currentMovie.badge || 'BLOCKBUSTER'}
              </span>

              <div className="flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/10 border border-amber-400/40 text-amber-300 font-bold text-[10px] sm:text-xs backdrop-blur-md">
                <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400 text-amber-400" />
                <span>{currentMovie.rating || 9.4}/10</span>
                {currentMovie.votesCount && (
                  <span className="text-[9px] sm:text-[10px] text-white/50">({(currentMovie.votesCount / 1000).toFixed(1)}k votes)</span>
                )}
              </div>
            </div>

            {/* Title & Tagline */}
            <h2 className="text-xl xs:text-2xl sm:text-4xl md:text-5xl font-extrabold font-serif text-white leading-tight drop-shadow-lg truncate max-w-full">
              {currentMovie.title}
            </h2>

            <p className="text-[11px] sm:text-xs md:text-sm text-amber-300 font-semibold italic line-clamp-2">
              "{currentMovie.tagline || currentMovie.synopsis}"
            </p>

            {/* Genres & Details */}
            <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-xs text-white/80 pt-0.5">
              <span className="flex items-center gap-1 text-white/60">
                <Clock className="w-3 h-3 text-amber-400" /> {currentMovie.duration || '2h 45m'}
              </span>
              <span className="text-white/30">•</span>
              <span className="flex items-center gap-1 text-white/60 truncate max-w-[200px] sm:max-w-none">
                <Globe className="w-3 h-3 text-amber-400" /> {Array.isArray(currentMovie.languages) ? currentMovie.languages.join(', ') : currentMovie.languages || 'Hindi, English'}
              </span>
            </div>
          </div>

          {/* Bottom Action Section: Pricing & Compact Buttons */}
          <div className="space-y-3 pt-3 border-t border-white/10 animate-fade-in">
            <div className="flex flex-wrap items-center justify-between sm:justify-start gap-3">
              <div>
                <span className="text-[9px] sm:text-[10px] text-white/50 uppercase font-bold tracking-wider block">Ticket Price</span>
                <span className="text-base sm:text-xl font-bold text-amber-400 font-sans">
                  ₹{currentMovie.price || 480} <span className="text-[9px] font-normal text-white/60">/ seat</span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Action Button 1: Book Ticket Now */}
                <button
                  onClick={() => {
                    const targetId = currentMovie.movieId || currentMovie.id || 'mov_1';
                    if (onBookNow) onBookNow(targetId);
                    else if (onSelectMovie) onSelectMovie(targetId);
                  }}
                  className="px-3.5 py-2 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-110 text-black font-extrabold text-[11px] sm:text-xs shadow-xl shadow-amber-500/25 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Ticket className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Book Now</span>
                </button>

                {/* Action Button 2: More Details */}
                {onSelectMovie && (
                  <button
                    onClick={() => {
                      const targetId = currentMovie.movieId || currentMovie.id || 'mov_1';
                      onSelectMovie(targetId);
                    }}
                    className="px-3 py-2 sm:px-5 sm:py-3 rounded-xl sm:rounded-2xl glass-panel hover:bg-white/15 text-white font-bold text-[11px] sm:text-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>Show Info</span>
                  </button>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Left Navigation Arrow */}
        <button
          onClick={handlePrev}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-black/50 hover:bg-black/80 text-white/80 hover:text-white border border-white/15 backdrop-blur-md transition-all cursor-pointer z-20 opacity-90 sm:opacity-80 hover:opacity-100"
          title="Previous Movie"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Right Navigation Arrow */}
        <button
          onClick={handleNext}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-black/50 hover:bg-black/80 text-white/80 hover:text-white border border-white/15 backdrop-blur-md transition-all cursor-pointer z-20 opacity-90 sm:opacity-80 hover:opacity-100"
          title="Next Movie"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Dot Indicators */}
        <div className="absolute bottom-3 right-4 sm:bottom-4 sm:right-6 flex items-center gap-1.5 z-20">
          {carouselMovies.map((_, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectDot(idx)}
              className={`h-1.5 sm:h-2 rounded-full transition-all cursor-pointer ${
                currentIndex === idx
                  ? 'w-6 sm:w-7 bg-amber-400 shadow-md shadow-amber-400/50'
                  : 'w-1.5 sm:w-2 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>

        {/* Animated Progress Bar at Bottom */}
        {!isPaused && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 z-20">
            <div
              className="h-full bg-amber-400 transition-all duration-75 ease-linear"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}

      </div>
    </div>
  );
};
