import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Copy, Check, Tag, Sparkles, ArrowRight, Pause, Play } from 'lucide-react';
import API, { API_BASE } from '../services/api';

export const OfferCarousel = ({ onSelectCategory }) => {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('All');
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);

  const defaultBanners = [
    {
      id: 'ban_1',
      title: 'Buy 1 Get 1 FREE on IMAX 3D & VIP Movies',
      tagline: 'Experience Avatar: Fire & Ash in Native IMAX 3D with complimentary popcorn & recliner upgrades.',
      code: 'BOGOIMAX',
      category: 'Movies',
      categoryBadge: '🎬 MOVIES SPECIAL',
      image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1600&q=80',
      expiryDate: '2026-12-31',
      ctaText: 'Book Movie Ticket',
      ctaLink: 'movies'
    },
    {
      id: 'ban_2',
      title: 'Flat 20% OFF on Full Private Theater Reservation',
      tagline: 'Book an entire luxury screen privately for birthdays, anniversaries, or corporate events with double-booking lock protection.',
      code: 'PRIVATETHEATRE20',
      category: 'Theaters',
      categoryBadge: '🍿 THEATER BOOKING',
      image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1600&q=80',
      expiryDate: '2026-12-31',
      ctaText: 'Book Private Screen',
      ctaLink: 'theatres'
    },
    {
      id: 'ban_3',
      title: 'Weekend Play Specials - 15% Instant Cashback',
      tagline: 'Reserve stage seats for Gujjubhai Banya Dabang, Mughal-E-Azam, and Hamlet with instant cashback.',
      code: 'DRAMAPLAY15',
      category: 'Plays',
      categoryBadge: '🎭 PLAYS & DRAMA',
      image: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=1600&q=80',
      expiryDate: '2026-12-31',
      ctaText: 'Book Stage Pass',
      ctaLink: 'plays'
    },
    {
      id: 'ban_4',
      title: 'Coldplay & Sunburn Goa - Save Flat ₹1,000',
      tagline: 'Get exclusive VIP stadium pit access & LED wristbands for live music concerts and EDM festivals.',
      code: 'COLDPLAYVIP',
      category: 'Events',
      categoryBadge: '🎸 LIVE CONCERTS',
      image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1600&q=80',
      expiryDate: '2026-12-31',
      ctaText: 'Get Concert Ticket',
      ctaLink: 'events'
    },
    {
      id: 'ban_5',
      title: 'Imagicaa & Della Adventure Pass - Flat ₹300 OFF',
      tagline: 'All-inclusive day passes for Water Parks, Trampoline Arenas, VR Laser Tag, and Extreme Sports.',
      code: 'ADVENTURE300',
      category: 'Activities',
      categoryBadge: '🎢 ADVENTURE PARKS',
      image: 'https://images.unsplash.com/photo-1582650625119-3a31f8fa2699?auto=format&fit=crop&w=1600&q=80',
      expiryDate: '2026-12-31',
      ctaText: 'Get Activity Pass',
      ctaLink: 'activities'
    }
  ];

  const fetchBanners = async () => {
    try {
      const res = await API.get('/offers/banners');
      if (res.data && res.data.length > 0) {
        setBanners(res.data);
      } else {
        setBanners(defaultBanners);
      }
    } catch (err) {
      setBanners(defaultBanners);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const filteredBanners = banners.filter(b => 
    activeCategoryFilter === 'All' || b.category === activeCategoryFilter
  );

  // Auto-play & Smooth Progress Bar Animation
  useEffect(() => {
    if (isPaused || filteredBanners.length <= 1) return;

    const intervalTime = 4000; // 4 seconds interval
    const stepTime = 40; // update progress every 40ms
    const increment = (stepTime / intervalTime) * 100;

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCurrentIndex((curr) => (curr + 1) % filteredBanners.length);
          return 0;
        }
        return prev + increment;
      });
    }, stepTime);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, filteredBanners.length]);

  const handlePrev = () => {
    setProgress(0);
    setCurrentIndex((prev) => (prev - 1 + filteredBanners.length) % filteredBanners.length);
  };

  const handleNext = () => {
    setProgress(0);
    setCurrentIndex((prev) => (prev + 1) % filteredBanners.length);
  };

  const handleSelectDot = (idx) => {
    setProgress(0);
    setCurrentIndex(idx);
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  if (filteredBanners.length === 0) return null;

  const currentSlide = filteredBanners[currentIndex] || filteredBanners[0];

  return (
    <div className="w-full mb-10 space-y-4 font-sans">
      {/* Category Filter Pills Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold text-amber-300 uppercase tracking-widest">Featured Offer Carousel</span>
          {isPaused && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold flex items-center gap-1">
              <Pause className="w-3 h-3 text-amber-400" /> Auto-Slide Paused
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5 text-[11px] font-semibold">
          {['All', 'Movies', 'Theaters', 'Plays', 'Events', 'Activities'].map((cat) => {
            const isActive = activeCategoryFilter === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategoryFilter(cat);
                  setCurrentIndex(0);
                  setProgress(0);
                }}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20'
                    : 'glass-panel text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Animated Carousel Frame */}
      <div 
        className="relative w-full h-[320px] sm:h-[380px] md:h-[420px] rounded-3xl overflow-hidden border border-white/15 shadow-2xl group transition-all"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Animated Background Image with Gradient Overlay & Smooth Cross-Fade */}
        <div className="absolute inset-0 transition-opacity duration-700">
          <img
            key={currentSlide.id || currentIndex}
            src={currentSlide.image}
            alt={currentSlide.title}
            className="w-full h-full object-cover transition-all duration-700 ease-out transform scale-105 group-hover:scale-100 animate-fade-in"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/75 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-transparent to-transparent"></div>
        </div>

        {/* Slide Content Box */}
        <div className="relative h-full flex flex-col justify-between p-6 sm:p-10 md:p-12 max-w-2xl z-10">
          
          {/* Top Category Badge */}
          <div className="animate-fade-in">
            <span className="inline-block px-3.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 font-extrabold text-[11px] uppercase tracking-wider backdrop-blur-md mb-3 shadow-lg">
              {currentSlide.categoryBadge || `${currentSlide.category} OFFER`}
            </span>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-serif text-white leading-tight drop-shadow-md">
              {currentSlide.title}
            </h2>
            
            <p className="text-xs sm:text-sm text-white/70 mt-2 line-clamp-2 leading-relaxed max-w-lg">
              {currentSlide.tagline}
            </p>
          </div>

          {/* Bottom Controls & Promo Code Box */}
          <div className="space-y-4 pt-4 animate-fade-in">
            
            {/* Promo Code Box & CTA Button */}
            <div className="flex flex-wrap items-center gap-3">
              
              {/* Copy Code Pill */}
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 border border-amber-400/40 backdrop-blur-md">
                <Tag className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-mono font-bold text-amber-300">{currentSlide.code}</span>
                <button
                  onClick={() => handleCopyCode(currentSlide.code)}
                  className="p-1 rounded-md hover:bg-white/20 text-white/80 transition-all cursor-pointer"
                  title="Copy Promo Code"
                >
                  {copiedCode === currentSlide.code ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Toast alert when copied */}
              {copiedCode === currentSlide.code && (
                <span className="text-[11px] text-emerald-400 font-bold animate-pulse">
                  Code Copied!
                </span>
              )}

              {/* CTA Action Button */}
              {onSelectCategory && (
                <button
                  onClick={() => onSelectCategory(currentSlide.ctaLink || 'movies')}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-lg shadow-amber-500/25 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>{currentSlide.ctaText || 'Claim Offer'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

          </div>

        </div>

        {/* Left Navigation Arrow */}
        <button
          onClick={handlePrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 hover:bg-black/80 text-white/70 hover:text-white border border-white/10 backdrop-blur-md transition-all cursor-pointer z-20 opacity-80 hover:opacity-100"
          title="Previous Offer Slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Right Navigation Arrow */}
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 hover:bg-black/80 text-white/70 hover:text-white border border-white/10 backdrop-blur-md transition-all cursor-pointer z-20 opacity-80 hover:opacity-100"
          title="Next Offer Slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Dot Indicators */}
        <div className="absolute bottom-4 right-6 flex items-center gap-2 z-20">
          {filteredBanners.map((_, idx) => (
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

        {/* Progress Bar Timer Bar at Bottom of Carousel */}
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
