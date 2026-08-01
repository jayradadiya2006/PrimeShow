import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Star, Ticket, Play, Sparkles, Clock, Globe, ShieldCheck, Pause } from 'lucide-react';
import { useBooking } from '../context/BookingContext';

export const MovieCarousel = ({ onBookNow, onSelectMovie }) => {
  const { moviesList } = useBooking();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);

  // Fallback featured carousel movies if store list is loading
  const carouselMovies = (moviesList && moviesList.length > 0) ? moviesList : [
    {
      id: 'mov_1',
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
    },
    {
      id: 'mov_3',
      title: 'Kalki 2898 AD: Chapter II',
      tagline: 'The Epic Battle of the Millennia Unleashed',
      badge: 'TRENDING',
      rating: 9.1,
      votesCount: 65200,
      duration: '3h 05m',
      genres: ['Action', 'Sci-Fi', 'Mythology'],
      languages: ['Hindi', 'Telugu', 'Tamil'],
      price: 420,
      banner: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1920&q=80',
      synopsis: 'Set in a post-apocalyptic world in the year 2898 AD, the modern avatar of Vishnu descends to protect humanity from dark forces.'
    },
    {
      id: 'mov_2',
      title: 'Dune: Part Two',
      tagline: 'Long Live The Fighters of Arrakis',
      badge: 'CRITICS CHOICE',
      rating: 9.3,
      votesCount: 89400,
      duration: '2h 46m',
      genres: ['Sci-Fi', 'Adventure', 'Drama'],
      languages: ['English', 'Hindi'],
      price: 380,
      banner: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1920&q=80',
      synopsis: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.'
    }
  ];

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
    <div className="w-full mb-12 space-y-4 font-sans">
      
      {/* Top Header Label */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold text-amber-300 uppercase tracking-widest">
            Featured Blockbuster Slideshow
          </span>
          {isPaused && (
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold flex items-center gap-1">
              <Pause className="w-3 h-3 text-amber-400" /> Auto-Slide Paused
            </span>
          )}
        </div>
      </div>

      {/* Main Animated Movie Carousel Hero Frame */}
      <div
        className="relative w-full h-[360px] sm:h-[420px] md:h-[480px] rounded-3xl overflow-hidden border border-white/15 shadow-2xl group"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
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
        <div className="relative h-full flex flex-col justify-between p-6 sm:p-10 md:p-12 max-w-2xl z-10">
          
          {/* Top Badges & Ratings */}
          <div className="space-y-3 animate-fade-in">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3.5 py-1 rounded-full bg-amber-500 text-black font-black text-[11px] uppercase tracking-wider shadow-lg">
                {currentMovie.badge || 'BLOCKBUSTER'}
              </span>

              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-amber-400/40 text-amber-300 font-bold text-xs backdrop-blur-md">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{currentMovie.rating || 9.4}/10</span>
                {currentMovie.votesCount && (
                  <span className="text-[10px] text-white/50">({(currentMovie.votesCount / 1000).toFixed(1)}k votes)</span>
                )}
              </div>
            </div>

            {/* Title & Tagline */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-serif text-white leading-tight drop-shadow-lg">
              {currentMovie.title}
            </h2>

            <p className="text-xs sm:text-sm text-amber-300 font-semibold italic">
              "{currentMovie.tagline || currentMovie.synopsis}"
            </p>

            {/* Genres & Details */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-white/80 pt-1">
              <span className="flex items-center gap-1 text-white/60">
                <Clock className="w-3.5 h-3.5 text-amber-400" /> {currentMovie.duration || '2h 45m'}
              </span>
              <span className="text-white/30">•</span>
              <span className="flex items-center gap-1 text-white/60">
                <Globe className="w-3.5 h-3.5 text-amber-400" /> {(currentMovie.languages || ['Hindi', 'English']).join(', ')}
              </span>
            </div>
          </div>

          {/* Bottom Action Section: Pricing & "Book Ticket Now" Button */}
          <div className="space-y-4 pt-4 border-t border-white/10 animate-fade-in">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <span className="text-[10px] text-white/50 uppercase font-bold tracking-wider block">Ticket Price Rate</span>
                <span className="text-xl font-bold text-amber-400 font-sans">
                  ₹{currentMovie.price || 450} <span className="text-[10px] font-normal text-white/60">/ recliner</span>
                </span>
              </div>

              {/* Action Button 1: Book Ticket Now */}
              <button
                onClick={() => {
                  if (onBookNow) onBookNow(currentMovie.id);
                  else if (onSelectMovie) onSelectMovie(currentMovie.id);
                }}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-110 text-black font-extrabold text-xs shadow-xl shadow-amber-500/25 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Ticket className="w-4 h-4" />
                <span>Book Ticket Now</span>
              </button>

              {/* Action Button 2: More Details */}
              {onSelectMovie && (
                <button
                  onClick={() => onSelectMovie(currentMovie.id)}
                  className="px-5 py-3 rounded-2xl glass-panel hover:bg-white/15 text-white font-bold text-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>Showtimes & Info</span>
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Left Navigation Arrow */}
        <button
          onClick={handlePrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 hover:bg-black/80 text-white/70 hover:text-white border border-white/10 backdrop-blur-md transition-all cursor-pointer z-20 opacity-80 hover:opacity-100"
          title="Previous Movie"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Right Navigation Arrow */}
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 hover:bg-black/80 text-white/70 hover:text-white border border-white/10 backdrop-blur-md transition-all cursor-pointer z-20 opacity-80 hover:opacity-100"
          title="Next Movie"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Dot Indicators */}
        <div className="absolute bottom-4 right-6 flex items-center gap-2 z-20">
          {carouselMovies.map((_, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectDot(idx)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                currentIndex === idx
                  ? 'w-7 bg-amber-400 shadow-md shadow-amber-400/50'
                  : 'w-2 bg-white/40 hover:bg-white/70'
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
