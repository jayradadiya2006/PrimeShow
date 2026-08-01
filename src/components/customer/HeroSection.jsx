import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Sparkles, Play, Ticket, ChevronRight, Star } from 'lucide-react';
import { useBooking } from '../../context/BookingContext';

const videoSources = [
  {
    id: 0,
    name: "Now Showing",
    url: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_081127_0992a171-d3c6-4978-8213-0ec5df8b6d63.mp4",
    tagline: "Epic Sci-Fi Spectacles In IMAX 3D"
  },
  {
    id: 1,
    name: "Premium Experience",
    url: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_092026_dd05b805-ea0f-40b2-8c52-332b88502592.mp4",
    tagline: "Ultra-Luxury Recliners & Gourmet Dining"
  },
  {
    id: 2,
    name: "Book Instantly",
    url: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_081042_df7202bf-bd80-4b2b-bbc6-1f09ba2870e9.mp4",
    tagline: "Instant Seat Booking & Dynamic QR Tickets"
  },
  {
    id: 3,
    name: "Movie Night",
    url: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_080959_4cac5234-3573-464e-a5b7-76b94b8a7d61.mp4",
    tagline: "Live Concerts, Musicals & Private Screenings"
  }
];

export default function HeroSection() {
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [heroSearch, setHeroSearch] = useState('');
  const { selectedCity } = useBooking();
  const navigate = useNavigate();

  const handleHeroSearchSubmit = (e) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      navigate(`/movies?search=${encodeURIComponent(heroSearch)}`);
    } else {
      navigate('/movies');
    }
  };

  return (
    <div className="relative w-full h-[100vh] min-h-[680px] bg-black overflow-hidden flex flex-col justify-between">
      
      {/* BACKGROUND VIDEO ENGINE (4 Stacked Videos with 1000ms crossfade transition) */}
      <div className="absolute inset-0 z-0 bg-black">
        {videoSources.map((v, idx) => (
          <video
            key={v.id}
            autoPlay
            muted
            loop
            playsInline
            src={v.url}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
              activeVideoIndex === idx ? 'opacity-55 scale-100' : 'opacity-0 scale-105 pointer-events-none'
            }`}
          />
        ))}

        {/* Pitch dark vignette overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-black/40 to-black/70 z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/40 to-black/90 z-10" />
      </div>

      {/* ANIMATED NOISE / GRAIN OVERLAY LAYER */}
      <motion.div
        className="absolute inset-0 pointer-events-none z-20 opacity-30 mix-blend-overlay"
        style={{
          backgroundImage: `url("https://soft-zoom-63098134.figma.site/_assets/v11/0b4a435b2df2747593c43d7a1c9b4578f7d8d90c.png")`,
          backgroundSize: '200px 200px'
        }}
        animate={{
          y: [0, -6, 0],
          scale: [1, 1.03, 1]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* HERO CONTENT AREA */}
      <div className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-32 flex-1 flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-3xl space-y-6"
        >
          {/* GLASS BADGE */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full glass-badge border-cyan-500/30 shadow-lg shadow-cyan-500/10">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-indigo-300">
              India's Premium Movie Booking Experience
            </span>
          </div>

          {/* MAIN HEADLINE */}
          <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight text-white leading-[1.05] drop-shadow-2xl">
            Experience Cinema Like <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-purple-400">Never Before</span>
          </h1>

          {/* SUB-HEADING */}
          <p className="text-lg sm:text-xl text-slate-300 font-light max-w-2xl leading-relaxed drop-shadow">
            Book movies, events, premium theatres, and exclusive experiences in seconds.
          </p>

          {/* HERO SEARCH ENGINE WIDGET */}
          <form
            onSubmit={handleHeroSearchSubmit}
            className="p-2 sm:p-2.5 rounded-3xl glass-panel border-white/20 shadow-2xl backdrop-blur-3xl max-w-2xl flex flex-col sm:flex-row items-center gap-2 mt-4"
          >
            <div className="flex-1 flex items-center gap-3 px-4 w-full">
              <Search className="w-5 h-5 text-cyan-400 shrink-0" />
              <input
                type="text"
                placeholder="Search Dune, IMAX, Oppenheimer, Coldplay..."
                value={heroSearch}
                onChange={(e) => setHeroSearch(e.target.value)}
                className="w-full bg-transparent py-3 text-sm text-white focus:outline-none placeholder:text-slate-400 font-medium"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs text-slate-300 border-l border-white/10 shrink-0">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-semibold text-white">{selectedCity}</span>
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-cyan-400 to-indigo-600 text-black font-bold text-sm hover:brightness-110 transition-all glow-cyan flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              >
                <span>Book Now</span>
                <ChevronRight className="w-4 h-4 text-black stroke-[3]" />
              </button>
            </div>
          </form>

          {/* ACTIVE VIDEO TAGLINE */}
          <div className="flex items-center gap-3 pt-2 text-xs text-cyan-300/80 font-medium">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>Currently Featuring: <strong>{videoSources[activeVideoIndex].tagline}</strong></span>
          </div>
        </motion.div>
      </div>

      {/* INTERACTIVE VIDEO SWITCHER CONTROLS OVERLAY AT BOTTOM */}
      <div className="relative z-30 pb-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {videoSources.map((item, idx) => {
            const isActive = activeVideoIndex === idx;
            return (
              <button
                key={item.id}
                onClick={() => setActiveVideoIndex(idx)}
                className={`p-3.5 rounded-2xl transition-all flex items-center gap-3 text-left cursor-pointer border ${
                  isActive
                    ? 'bg-cyan-500/20 border-cyan-400 shadow-xl shadow-cyan-500/20 backdrop-blur-2xl'
                    : 'glass-panel hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                  isActive ? 'bg-cyan-400 text-black glow-cyan' : 'bg-white/10 text-slate-300'
                }`}>
                  0{idx + 1}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className={`text-xs sm:text-sm font-bold truncate ${isActive ? 'text-white' : 'text-slate-300'}`}>
                    {item.name}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate">
                    {idx === 0 ? 'Sci-Fi Action' : idx === 1 ? 'VIP Lounge' : idx === 2 ? 'Quick Reserve' : 'Live Events'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
