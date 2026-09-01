import React, { useState } from 'react';
import { HeroCrossfader } from '../components/HeroCrossfader';
import { MovieCarousel } from '../components/MovieCarousel';
import { MovieCard } from '../components/MovieCard';
import { useBooking } from '../context/BookingContext';
import { Sparkles, Film, Award, Ticket, Star, ChevronRight, Shield, Zap, Gift, Play, Bell } from 'lucide-react';

export const Home = ({ onSelectMovie, onBookNow, selectedCity, onOpenCityModal, setActiveTab }) => {
  const { moviesList, featureStripsList, upcomingMoviesList } = useBooking();
  const [remindersSet, setRemindersSet] = useState({});

  const toggleReminder = (id) => {
    setRemindersSet(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getIconComponent = (iconName) => {
    switch (iconName) {
      case 'Zap': return Zap;
      case 'Film': return Film;
      case 'Gift': return Gift;
      case 'Sparkles': return Sparkles;
      case 'Shield': return Shield;
      case 'Ticket': return Ticket;
      default: return Zap;
    }
  };

  return (
    <div className="min-h-screen bg-[#ECEBDE] text-slate-900 font-sans overflow-x-hidden">
      
      {/* 100vh Hero Crossfader Section */}
      <HeroCrossfader
        onSelectMovie={onSelectMovie}
        onBookNow={onBookNow}
        selectedCity={selectedCity}
        onOpenCityModal={onOpenCityModal}
        setActiveTab={setActiveTab}
      />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-8 space-y-10 sm:space-y-16 py-6 sm:py-12">
        
        {/* Section 0: Feature Chips / Quick Action Strip (Single-Row Horizontal Scroll & Hidden Scrollbar) */}
        <div className="w-full">
          <div className="flex flex-row flex-nowrap items-center gap-2.5 sm:gap-4 overflow-x-auto scrollbar-none no-scrollbar py-1 w-full max-w-full">
            {(featureStripsList && featureStripsList.length > 0 ? featureStripsList : [
              { id: 'feat_1', title: 'Instant UPI Pass', subtitle: 'Instant QR generation', icon: 'Zap', color: 'amber', badge: 'INSTANT' },
              { id: 'feat_2', title: 'Private Cinema Screen', subtitle: 'Book full lounge', icon: 'Film', color: 'purple', badge: 'LUXURY' },
              { id: 'feat_3', title: 'Promo Vouchers', subtitle: 'Flat 50% discount', icon: 'Gift', color: 'emerald', badge: 'OFFER' },
              { id: 'feat_4', title: 'Expert VIP Concierge', subtitle: 'Lounge & gourmet dining', icon: 'Sparkles', color: 'cyan', badge: 'VIP' }
            ]).map((feat) => {
              const IconComp = getIconComponent(feat.icon);
              return (
                <div
                  key={feat.id}
                  className="px-3.5 py-2.5 sm:px-5 sm:py-3.5 rounded-2xl border text-xs font-bold shrink-0 flex items-center gap-2.5 sm:gap-3 bg-[#D7D3BF] border-[#C1BAA1] hover:bg-[#ECEBDE] transition-all cursor-pointer select-none"
                >
                  <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-[#A59D84]/20 border border-[#C1BAA1] flex items-center justify-center text-amber-700 shrink-0">
                    <IconComp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs sm:text-sm font-bold text-slate-900 whitespace-nowrap">{feat.title}</span>
                      {feat.badge && (
                        <span className="px-1.5 py-0.2 rounded bg-[#A59D84]/20 text-amber-900 text-[9px] font-black uppercase">
                          {feat.badge}
                        </span>
                      )}
                    </div>
                    {feat.subtitle && (
                      <p className="text-[10px] sm:text-xs text-slate-600 whitespace-nowrap font-normal">{feat.subtitle}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 1: Automated Movie Slide Show (Carousel) */}
        <MovieCarousel
          onBookNow={onBookNow}
          onSelectMovie={onSelectMovie}
        />

        {/* Section 2: Now Showing Mobile 2-Column Responsive Grid */}
        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-row items-center justify-between gap-2 mb-3 sm:mb-6">
            <div>
              <div className="flex items-center gap-1.5 text-amber-700 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-0.5 sm:mb-1">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Premier Blockbusters</span>
              </div>
              <h2 className="text-xl sm:text-3xl md:text-4xl font-bold font-sans text-slate-900">Now Showing in {selectedCity}</h2>
            </div>

            <button
              onClick={() => setActiveTab('movies')}
              className="text-[11px] sm:text-xs font-bold text-amber-800 hover:text-slate-900 flex items-center gap-1 transition-colors cursor-pointer shrink-0"
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

        {/* Section 3: Upcoming Releases Showcase (Single-Row Mobile Scrollable Line / Carousel) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-purple-700 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-0.5">
                <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Coming Soon</span>
              </div>
              <h2 className="text-xl sm:text-3xl font-bold font-sans text-slate-900">Upcoming Big Releases</h2>
            </div>
          </div>

          {/* Single-Row Mobile Layout Carousel with Compact Cards */}
          <div className="flex flex-row flex-nowrap items-stretch gap-3 sm:gap-5 overflow-x-auto scrollbar-none no-scrollbar py-2 w-full max-w-full">
            {(upcomingMoviesList && upcomingMoviesList.length > 0 ? upcomingMoviesList : [
              { id: 'up_1', title: 'Avengers: Secret Wars', release: 'Dec 2026', poster: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80', genres: ['Action', 'Superhero'] },
              { id: 'up_2', title: 'The Dark Knight: Legacy', release: 'Nov 2026', poster: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80', genres: ['Action', 'Crime'] },
              { id: 'up_3', title: 'Interstellar II', release: 'Jan 2027', poster: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=800&q=80', genres: ['Sci-Fi', 'Adventure'] },
              { id: 'up_4', title: 'Gladiator II', release: 'Oct 2026', poster: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80', genres: ['Action', 'Drama'] }
            ]).map((mov) => (
              <div 
                key={mov.id} 
                className="w-[140px] xs:w-[155px] sm:w-[190px] shrink-0 bg-[#D7D3BF] p-2.5 sm:p-3.5 rounded-2xl sm:rounded-3xl border border-[#C1BAA1] flex flex-col justify-between hover:border-[#A59D84] transition-all group"
              >
                <div>
                  <div className="relative w-full h-[170px] sm:h-[220px] rounded-xl sm:rounded-2xl overflow-hidden border border-[#C1BAA1] mb-2">
                    <img 
                      src={mov.poster} 
                      alt={mov.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-[#A59D84] text-white font-black text-[8px] sm:text-[9px] uppercase tracking-wider shadow-md">
                      {mov.release}
                    </span>
                  </div>

                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate max-w-full">{mov.title}</h3>
                  <p className="text-[10px] sm:text-xs text-slate-600 truncate max-w-full mt-0.5">
                    {Array.isArray(mov.genres) ? mov.genres.join(' • ') : mov.genres}
                  </p>
                </div>

                <button
                  onClick={() => toggleReminder(mov.id)}
                  className={`w-full mt-2.5 py-1.5 rounded-xl text-[10px] sm:text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    remindersSet[mov.id]
                      ? 'bg-[#A59D84] text-white shadow-md'
                      : 'bg-[#ECEBDE] hover:bg-[#C1BAA1] text-slate-900 border border-[#C1BAA1]'
                  }`}
                >
                  <Bell className="w-3 h-3" />
                  <span>{remindersSet[mov.id] ? 'Reminder Set ✓' : 'Set Reminder'}</span>
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
