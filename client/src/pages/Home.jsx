import React, { useState } from 'react';
import { HeroCrossfader } from '../components/HeroCrossfader';
import { MovieCarousel } from '../components/MovieCarousel';
import { MovieCard } from '../components/MovieCard';
import { useBooking } from '../context/BookingContext';
import { Sparkles, Film, Award, Ticket, Star, ChevronRight, Shield, Zap, Gift, Play } from 'lucide-react';

export const Home = ({ onSelectMovie, onBookNow, selectedCity, onOpenCityModal, setActiveTab }) => {
  const { moviesList } = useBooking();

  const upcomingMovies = [
    {
      id: 'mov_up_1',
      title: 'Avengers: Secret Wars',
      release: 'Dec 2026',
      poster: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80',
      genres: ['Action', 'Superhero']
    },
    {
      id: 'mov_up_2',
      title: 'The Dark Knight: Legacy',
      release: 'Nov 2026',
      poster: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
      genres: ['Action', 'Crime']
    }
  ];

  return (
    <div className="min-h-screen bg-[#050508] text-white font-sans overflow-x-hidden">
      
      {/* 100vh Hero Crossfader Section */}
      <HeroCrossfader
        onSelectMovie={onSelectMovie}
        onBookNow={onBookNow}
        selectedCity={selectedCity}
        onOpenCityModal={onOpenCityModal}
        setActiveTab={setActiveTab}
      />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-8 space-y-12 sm:space-y-16 py-8 sm:py-12">
        
        {/* Section 0: Automated Movie Slide Show (Carousel) */}
        <MovieCarousel
          onBookNow={onBookNow}
          onSelectMovie={onSelectMovie}
        />

        {/* Section 1: Now Showing Mobile 2-Column Responsive Grid */}
        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-row items-center justify-between gap-2 mb-4 sm:mb-6">
            <div>
              <div className="flex items-center gap-1.5 text-amber-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-0.5 sm:mb-1">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Premier Blockbusters</span>
              </div>
              <h2 className="text-xl sm:text-3xl md:text-4xl font-bold font-sans text-white">Now Showing in {selectedCity}</h2>
            </div>

            <button
              onClick={() => setActiveTab('movies')}
              className="text-[11px] sm:text-xs font-bold text-amber-300 hover:text-white flex items-center gap-1 transition-colors cursor-pointer shrink-0"
            >
              <span>Explore All ({moviesList.length})</span>
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>

          {/* Dynamic 2-Column Mobile Grid Layout (2 cards per row on mobile, 3 on tablet, 4 on desktop) */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {moviesList.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onSelect={onSelectMovie}
                onBookNow={onBookNow}
              />
            ))}
          </div>
        </div>

        {/* Section 2: Promotional Banners Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-amber-500/20 via-amber-500/5 to-transparent border border-amber-400/30 flex items-center gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">Instant UPI Ticket Pass</h3>
              <p className="text-[11px] sm:text-xs text-white/60">Scan Jay Hiralal Radadiya QR for instant pass generation</p>
            </div>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-purple-500/20 via-purple-500/5 to-transparent border border-purple-400/30 flex items-center gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-400 shrink-0">
              <Film className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">Private Cinema Screen</h3>
              <p className="text-[11px] sm:text-xs text-white/60">Book full theatre lounge for private birthday parties</p>
            </div>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-emerald-500/20 via-emerald-500/5 to-transparent border border-emerald-400/30 flex items-center gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Gift className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">Exclusive Promo Vouchers</h3>
              <p className="text-[11px] sm:text-xs text-white/60">Flat 50% discount on IMAX 3D recliners using PRIMESHOW50</p>
            </div>
          </div>
        </div>

        {/* Section 3: Upcoming Releases Showcase */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-1.5 text-purple-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-0.5 sm:mb-1">
                <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Coming Soon</span>
              </div>
              <h2 className="text-xl sm:text-3xl font-bold font-sans text-white">Upcoming Big Releases</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {upcomingMovies.map((mov) => (
              <div key={mov.id} className="glass-panel p-4 rounded-2xl sm:rounded-3xl border border-white/10 flex items-center gap-4 hover:border-purple-400/50 transition-all">
                <img src={mov.poster} alt={mov.title} className="w-20 h-28 sm:w-24 sm:h-32 rounded-xl sm:rounded-2xl object-cover border border-white/10 shrink-0" />
                <div className="space-y-1.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[9px] sm:text-[10px] font-bold uppercase">
                    Releasing {mov.release}
                  </span>
                  <h3 className="text-sm sm:text-lg font-bold text-white">{mov.title}</h3>
                  <p className="text-[11px] sm:text-xs text-white/60">{mov.genres.join(' • ')}</p>
                  <button className="px-3.5 py-1 sm:px-4 sm:py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] sm:text-xs font-bold transition-all cursor-pointer">
                    Set Reminder
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
