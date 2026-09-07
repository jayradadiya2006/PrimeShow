import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Star, Ticket, Info, Sparkles } from 'lucide-react';
import { useBooking } from '../context/BookingContext';

// Pre-populated Default Slides featuring requested high-res movie image URLs
const DEFAULT_HERO_SLIDES = [
  {
    id: 'hero_1',
    displayOrder: 1,
    isActive: true,
    title: 'Spider-Man: No Way Home',
    badgeText: 'MULTIVERSE BLOCKBUSTER',
    badge: 'MULTIVERSE BLOCKBUSTER',
    subtitle: 'The Multiverse Unleashed In Ultra 4K Dolby',
    tagline: 'The Multiverse Unleashed In Ultra 4K Dolby',
    description: 'Peter Parker seeks help from Doctor Strange to restore his secret, but a dangerous spell tears open the multiverse and unleashes legendary villains.',
    synopsis: 'Peter Parker seeks help from Doctor Strange to restore his secret, but a dangerous spell tears open the multiverse and unleashes legendary villains.',
    imageUrl: 'https://androidauthority.com/wp-content/uploads/2021/12/spider-man-no-way-home-1.jpg',
    banner: 'https://androidauthority.com/wp-content/uploads/2021/12/spider-man-no-way-home-1.jpg',
    backdrop: 'https://androidauthority.com/wp-content/uploads/2021/12/spider-man-no-way-home-1.jpg',
    rating: '9.6',
    votesCount: 245000,
    languages: ['English', 'Hindi', 'Tamil', 'Telugu'],
    genres: ['Action', 'Sci-Fi', 'Superhero'],
    imageFit: 'cover',
    imagePosition: 'center',
    bookLink: '/movies/mov_1',
    detailsLink: '/movies/mov_1',
    movieId: 'mov_1'
  },
  {
    id: 'hero_2',
    displayOrder: 2,
    isActive: true,
    title: 'Pushpa 2: The Rule',
    badgeText: 'MASS BLOCKBUSTER RAGE',
    badge: 'MASS BLOCKBUSTER RAGE',
    subtitle: 'The Rule Begins Across All Multiplexes',
    tagline: 'The Rule Begins Across All Multiplexes',
    description: 'Pushpa Raj expands his red sandalwood empire while facing ruthless opposition from SP Bhanwar Singh Shekhawat in an explosive showdown.',
    synopsis: 'Pushpa Raj expands his red sandalwood empire while facing ruthless opposition from SP Bhanwar Singh Shekhawat in an explosive showdown.',
    imageUrl: 'https://i.ytimg.com/vi/5vMWZhHPlaw/maxresdefault.jpg',
    banner: 'https://i.ytimg.com/vi/5vMWZhHPlaw/maxresdefault.jpg',
    backdrop: 'https://i.ytimg.com/vi/5vMWZhHPlaw/maxresdefault.jpg',
    rating: '9.5',
    votesCount: 198000,
    languages: ['Hindi', 'Telugu', 'Tamil', 'Kannada', 'Malayalam'],
    genres: ['Action', 'Thriller', 'Mass Drama'],
    imageFit: 'cover',
    imagePosition: 'center',
    bookLink: '/movies/mov_2',
    detailsLink: '/movies/mov_2',
    movieId: 'mov_2'
  },
  {
    id: 'hero_3',
    displayOrder: 3,
    isActive: true,
    title: 'Dhamaal 4',
    badgeText: 'ULTIMATE FAMILY COMEDY',
    badge: 'ULTIMATE FAMILY COMEDY',
    subtitle: 'Crazy Laughter Ride In Cinema Halls',
    tagline: 'Crazy Laughter Ride In Cinema Halls',
    description: 'The iconic comedy gang returns for an even wilder treasure hunt filled with non-stop laughter, hilarious twists, and fun surprises.',
    synopsis: 'The iconic comedy gang returns for an even wilder treasure hunt filled with non-stop laughter, hilarious twists, and fun surprises.',
    imageUrl: 'https://assets-in.bmscdn.com/iedb/movies/images/mobile/listing/medium/dhamaal-4-et00452553-1783600284.jpg',
    banner: 'https://assets-in.bmscdn.com/iedb/movies/images/mobile/listing/medium/dhamaal-4-et00452553-1783600284.jpg',
    backdrop: 'https://assets-in.bmscdn.com/iedb/movies/images/mobile/listing/medium/dhamaal-4-et00452553-1783600284.jpg',
    rating: '9.1',
    votesCount: 87000,
    languages: ['Hindi', 'Gujarati'],
    genres: ['Comedy', 'Family', 'Adventure'],
    imageFit: 'contain',
    imagePosition: 'center',
    bookLink: '/movies/mov_3',
    detailsLink: '/movies/mov_3',
    movieId: 'mov_3'
  },
  {
    id: 'hero_4',
    displayOrder: 4,
    isActive: true,
    title: 'Avatar: Fire and Ash',
    badgeText: 'IMAX 3D SPECTACLE',
    badge: 'IMAX 3D SPECTACLE',
    subtitle: 'Return To Pandora in 4K High Frame Rate',
    tagline: 'Return To Pandora in 4K High Frame Rate',
    description: 'Jake Sully and Neytiri encounter a new aggressive Ash People clan on Pandora as an unprecedented epic war unfolds across land and sky.',
    synopsis: 'Jake Sully and Neytiri encounter a new aggressive Ash People clan on Pandora as an unprecedented epic war unfolds across land and sky.',
    imageUrl: 'https://mykinoplex.com/media/bdc8eb75-d1b-4853365e10.webp',
    banner: 'https://mykinoplex.com/media/bdc8eb75-d1b-4853365e10.webp',
    backdrop: 'https://mykinoplex.com/media/bdc8eb75-d1b-4853365e10.webp',
    rating: '9.7',
    votesCount: 310000,
    languages: ['English', 'Hindi', 'Tamil', 'Telugu'],
    genres: ['Sci-Fi', 'Action', 'Adventure'],
    imageFit: 'cover',
    imagePosition: 'center',
    bookLink: '/movies/mov_1',
    detailsLink: '/movies/mov_1',
    movieId: 'mov_1'
  },
  {
    id: 'hero_5',
    displayOrder: 5,
    isActive: true,
    title: 'Housefull 5',
    badgeText: 'BIGGEST ENTERTAINER OF 2026',
    badge: 'BIGGEST ENTERTAINER OF 2026',
    subtitle: 'Double The Madness On Luxury Cruise',
    tagline: 'Double The Madness On Luxury Cruise',
    description: 'A grand luxury cruise becomes a chaotic battlefield of epic misunderstandings and unstoppable comedy when five couples get entangled.',
    synopsis: 'A grand luxury cruise becomes a chaotic battlefield of epic misunderstandings and unstoppable comedy when five couples get entangled.',
    imageUrl: 'https://timesofindia.indiatimes.com/thumb/msid-130320231,width-1280,height-720,resizemode-4/130320231.jpg',
    banner: 'https://timesofindia.indiatimes.com/thumb/msid-130320231,width-1280,height-720,resizemode-4/130320231.jpg',
    backdrop: 'https://timesofindia.indiatimes.com/thumb/msid-130320231,width-1280,height-720,resizemode-4/130320231.jpg',
    rating: '9.0',
    votesCount: 112000,
    languages: ['Hindi'],
    genres: ['Comedy', 'Romance'],
    imageFit: 'cover',
    imagePosition: 'center',
    bookLink: '/movies/mov_2',
    detailsLink: '/movies/mov_2',
    movieId: 'mov_2'
  }
];

export const HeroCrossfader = ({ onSelectMovie, onBookNow, setActiveTab }) => {
  const { heroSlidesList, moviesList } = useBooking();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  
  const touchStartXRef = useRef(null);
  const touchEndXRef = useRef(null);

  // Map and sanitize slides from CMS/backend store with fallback to DEFAULT_HERO_SLIDES
  const rawSlides = (heroSlidesList && heroSlidesList.length > 0)
    ? heroSlidesList.map((slide, idx) => ({
        id: slide.id || `hero_${idx}`,
        displayOrder: slide.displayOrder !== undefined ? Number(slide.displayOrder) : idx + 1,
        isActive: slide.isActive !== undefined ? Boolean(slide.isActive) : true,
        movieId: slide.movieId || 'mov_1',
        eventId: slide.eventId || '',
        badgeText: slide.badgeText || slide.badge || DEFAULT_HERO_SLIDES[idx % DEFAULT_HERO_SLIDES.length].badgeText,
        badge: slide.badgeText || slide.badge || DEFAULT_HERO_SLIDES[idx % DEFAULT_HERO_SLIDES.length].badge,
        title: slide.title || slide.name || DEFAULT_HERO_SLIDES[idx % DEFAULT_HERO_SLIDES.length].title,
        subtitle: slide.subtitle || slide.tagline || slide.sub || DEFAULT_HERO_SLIDES[idx % DEFAULT_HERO_SLIDES.length].subtitle,
        tagline: slide.subtitle || slide.tagline || slide.sub || DEFAULT_HERO_SLIDES[idx % DEFAULT_HERO_SLIDES.length].tagline,
        description: slide.description || slide.synopsis || slide.tagline || DEFAULT_HERO_SLIDES[idx % DEFAULT_HERO_SLIDES.length].description,
        synopsis: slide.description || slide.synopsis || slide.tagline || DEFAULT_HERO_SLIDES[idx % DEFAULT_HERO_SLIDES.length].synopsis,
        rating: slide.rating ? String(slide.rating) : DEFAULT_HERO_SLIDES[idx % DEFAULT_HERO_SLIDES.length].rating,
        votesCount: slide.votesCount || DEFAULT_HERO_SLIDES[idx % DEFAULT_HERO_SLIDES.length].votesCount,
        languages: Array.isArray(slide.languages)
          ? slide.languages
          : (typeof slide.languages === 'string' ? slide.languages.split(',').map(s=>s.trim()) : DEFAULT_HERO_SLIDES[idx % DEFAULT_HERO_SLIDES.length].languages),
        genres: Array.isArray(slide.genres)
          ? slide.genres
          : (typeof slide.genres === 'string' ? slide.genres.split(',').map(s=>s.trim()) : DEFAULT_HERO_SLIDES[idx % DEFAULT_HERO_SLIDES.length].genres),
        imageUrl: slide.imageUrl || slide.banner || slide.backdrop || slide.poster || DEFAULT_HERO_SLIDES[idx % DEFAULT_HERO_SLIDES.length].imageUrl,
        banner: slide.imageUrl || slide.banner || slide.backdrop || slide.poster || DEFAULT_HERO_SLIDES[idx % DEFAULT_HERO_SLIDES.length].banner,
        backdrop: slide.imageUrl || slide.banner || slide.backdrop || slide.poster || DEFAULT_HERO_SLIDES[idx % DEFAULT_HERO_SLIDES.length].backdrop,
        imageFit: slide.imageFit || 'split', // 'split' | 'cover' | 'contain'
        imagePosition: slide.imagePosition || 'top', // 'top' | 'center' | 'bottom'
        bookLink: slide.bookLink || '',
        detailsLink: slide.detailsLink || ''
      }))
    : DEFAULT_HERO_SLIDES;

  // Filter Active slides and Sort by displayOrder ascending
  const activeSlides = rawSlides
    .filter(slide => slide.isActive !== false)
    .sort((a, b) => (a.displayOrder || 99) - (b.displayOrder || 99));

  const slides = activeSlides.length > 0 ? activeSlides : DEFAULT_HERO_SLIDES;
  const totalSlides = slides.length;

  // Autoplay functionality: 4.5s slide transition, paused on hover
  useEffect(() => {
    if (isHovered || totalSlides <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }, 4500);
    return () => clearInterval(timer);
  }, [isHovered, totalSlides]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  };

  // Touch & Swipe gesture handling for mobile/tablet viewports
  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartXRef.current || !touchEndXRef.current) return;
    const distance = touchStartXRef.current - touchEndXRef.current;
    const minSwipeDistance = 40;

    if (distance > minSwipeDistance) {
      handleNext();
    } else if (distance < -minSwipeDistance) {
      handlePrev();
    }
    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  const activeSlide = slides[currentIndex % totalSlides] || slides[0];

  const resolveTargetMovieId = (slide) => {
    if (!slide) return 'mov_1';
    
    if (Array.isArray(moviesList) && moviesList.length > 0) {
      const match = moviesList.find(m => 
        m.id === slide.movieId || 
        m._id === slide.movieId || 
        (m.title && slide.title && m.title.toLowerCase() === slide.title.toLowerCase())
      );
      if (match) {
        return match.id || match._id || 'mov_1';
      }
      if (slide.movieId && moviesList.some(m => m.id === slide.movieId || m._id === slide.movieId)) {
        return slide.movieId;
      }
      return moviesList[0].id || moviesList[0]._id || 'mov_1';
    }
    
    return slide.movieId || 'mov_1';
  };

  const handleBookClick = () => {
    if (activeSlide.bookLink) {
      const link = String(activeSlide.bookLink).toLowerCase();
      if (link.includes('event')) {
        if (setActiveTab) setActiveTab('events');
        return;
      } else if (link.includes('theatre')) {
        if (setActiveTab) setActiveTab('theatres');
        return;
      } else if (link.includes('offer')) {
        if (setActiveTab) setActiveTab('offers');
        return;
      }
    }

    if (activeSlide.eventId) {
      if (setActiveTab) setActiveTab('events');
      else if (onSelectMovie) onSelectMovie('mov_1');
      return;
    }

    const targetId = resolveTargetMovieId(activeSlide);
    if (onBookNow) onBookNow(targetId);
    else if (onSelectMovie) onSelectMovie(targetId);
  };

  const handleDetailsClick = () => {
    if (activeSlide.detailsLink) {
      const link = String(activeSlide.detailsLink).toLowerCase();
      if (link.includes('event')) {
        if (setActiveTab) setActiveTab('events');
        return;
      } else if (link.includes('theatre')) {
        if (setActiveTab) setActiveTab('theatres');
        return;
      } else if (link.includes('offer')) {
        if (setActiveTab) setActiveTab('offers');
        return;
      }
    }

    if (activeSlide.eventId) {
      if (setActiveTab) setActiveTab('events');
      else if (onSelectMovie) onSelectMovie('mov_1');
      return;
    }

    const targetId = resolveTargetMovieId(activeSlide);
    if (onSelectMovie) onSelectMovie(targetId);
    else if (onBookNow) onBookNow(targetId);
  };

  return (
    <section
      className="relative w-full h-[360px] xs:h-[400px] sm:h-[440px] md:h-[480px] lg:h-[500px] min-h-[360px] max-h-[520px] overflow-hidden bg-[#0A0C10] select-none shadow-2xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background & Artwork Showcase Layers with Smooth Crossfade */}
      {slides.map((slide, idx) => {
        const isCurrent = idx === (currentIndex % totalSlides);
        const imgSrc = slide.imageUrl || slide.backdrop || slide.banner;
        const fitMode = slide.imageFit || 'split';
        const posMode = slide.imagePosition || 'top';

        const posClass = posMode === 'top' ? 'object-top' : (posMode === 'bottom' ? 'object-bottom' : 'object-center');

        return (
          <div
            key={slide.id || idx}
            className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
              isCurrent ? 'opacity-100 scale-100 z-0' : 'opacity-0 scale-105 z-0 pointer-events-none'
            }`}
            style={{ transitionProperty: 'opacity, transform' }}
          >
            {/* 1. Ambient Background Blur Layer (Fills entire screen with rich color/lighting) */}
            <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
              <img
                src={imgSrc}
                alt=""
                className="w-full h-full object-cover blur-3xl scale-125 opacity-40 brightness-50"
              />
            </div>

            {/* 2. Foreground Artwork Layer (Un-cropped Presentation) */}
            {fitMode === 'split' || fitMode === 'contain' ? (
              <div className="absolute right-0 top-0 bottom-0 w-full md:w-3/4 lg:w-3/5 h-full flex items-center justify-end z-5 pointer-events-none pr-0 sm:pr-6 md:pr-10">
                <div className="relative h-full w-full flex items-center justify-center md:justify-end">
                  <img
                    src={imgSrc}
                    alt={slide.title}
                    className={`h-full w-auto max-w-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)] transition-all duration-700 ${posClass}`}
                  />
                  {/* Subtle Right-side Edge Softening Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0A0C10] via-transparent to-transparent w-1/3 pointer-events-none" />
                </div>
              </div>
            ) : (
              <img
                src={imgSrc}
                alt={slide.title}
                className={`w-full h-full object-cover transition-all duration-700 pointer-events-none ${posClass}`}
              />
            )}
          </div>
        );
      })}

      {/* High-Contrast Linear Gradient Overlay Safety Mask */}
      {/* Heavy Left to Right Gradient (0% -> 45% -> 100%) */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0A0C10] via-[#0A0C10]/90 to-transparent w-full sm:w-4/5 md:w-3/5 z-10 pointer-events-none" />
      {/* Bottom to Top Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C10] via-[#0A0C10]/60 to-transparent z-10 pointer-events-none" />
      {/* Top Subtle Vignette */}
      <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/70 to-transparent z-10 pointer-events-none" />

      {/* Main Left-Aligned Slide Content Container */}
      <div className="relative z-20 max-w-7xl mx-auto h-full px-4 sm:px-8 md:px-12 flex flex-col justify-center text-left">
        <div className="max-w-xl md:max-w-2xl space-y-2.5">
          
          {/* Badge / Pill Tag */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-[#D90000] to-rose-600 text-white font-black text-[10px] sm:text-xs uppercase tracking-wider shadow-lg shadow-red-900/40 w-fit">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>{activeSlide.badgeText || activeSlide.badge || 'BLOCKBUSTER HIT'}</span>
          </div>

          {/* Main Title */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight drop-shadow-2xl line-clamp-1 sm:line-clamp-2 leading-tight font-sans">
            {activeSlide.title}
          </h1>

          {/* Subtitle / Tagline */}
          {(activeSlide.subtitle || activeSlide.tagline) && (
            <p className="text-xs sm:text-sm font-extrabold text-amber-400/95 line-clamp-1 drop-shadow-md max-w-xl">
              {activeSlide.subtitle || activeSlide.tagline}
            </p>
          )}

          {/* 2-Line Description / Synopsis */}
          {activeSlide.description && (
            <p className="text-xs sm:text-sm text-slate-200 font-medium line-clamp-2 drop-shadow-md max-w-lg leading-relaxed">
              {activeSlide.description}
            </p>
          )}

          {/* Metadata Tags Row (Rating, Languages, Genres) */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 text-xs font-semibold pt-1">
            {/* Rating Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-300 font-extrabold text-xs shadow-md backdrop-blur-md">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>⭐ {activeSlide.rating || '9.4'} {activeSlide.votesCount ? `(${activeSlide.votesCount >= 1000 ? Math.round(activeSlide.votesCount/1000) + 'K' : activeSlide.votesCount})` : ''}</span>
            </div>

            {/* Language Chips */}
            <div className="px-3 py-1 rounded-xl bg-white/10 border border-white/20 text-slate-100 text-xs font-bold backdrop-blur-md">
              {Array.isArray(activeSlide.languages) ? activeSlide.languages.join(' • ') : activeSlide.languages}
            </div>

            {/* Genre Chips */}
            <div className="hidden xs:flex items-center gap-1.5">
              {(Array.isArray(activeSlide.genres) ? activeSlide.genres : []).map((genre, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-red-950/50 border border-red-500/40 text-rose-300 text-[11px] font-extrabold backdrop-blur-md"
                >
                  {genre}
                </span>
              ))}
            </div>
          </div>

          {/* Call-to-Action Buttons */}
          <div className="flex items-center gap-3 pt-3">
            {/* Primary Solid Red CTA Button */}
            <button
              onClick={handleBookClick}
              className="px-6 sm:px-8 py-3 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-red-600/40 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Ticket className="w-4.5 h-4.5 fill-white/20" />
              <span>Book Tickets</span>
            </button>

            {/* Secondary Glass/Outline CTA Button */}
            <button
              onClick={handleDetailsClick}
              className="px-6 sm:px-8 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/30 backdrop-blur-md text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-md"
            >
              <Info className="w-4.5 h-4.5 text-slate-200" />
              <span>View Details</span>
            </button>
          </div>

        </div>
      </div>

      {/* Bottom-Right Navigation Arrow Controls & Active Dash Progress Indicator */}
      <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-8 z-30 flex items-center gap-3">
        {/* Active Dash / Linear Progress Indicator */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/70 border border-white/20 backdrop-blur-md shadow-xl">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`transition-all duration-300 rounded-full cursor-pointer ${
                idx === (currentIndex % totalSlides)
                  ? 'w-6 h-2 bg-gradient-to-r from-red-500 to-rose-600 shadow-md shadow-red-500/50'
                  : 'w-2 h-2 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Circular Arrow Navigation Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/70 hover:bg-red-600 border border-white/25 hover:border-red-500 text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer shadow-xl active:scale-90"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/70 hover:bg-red-600 border border-white/25 hover:border-red-500 text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer shadow-xl active:scale-90"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

    </section>
  );
};
