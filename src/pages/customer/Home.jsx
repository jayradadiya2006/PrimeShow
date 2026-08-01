import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Film, Star, Play, Sparkles, MapPin, Calendar, ArrowRight, ShieldCheck, Percent, Ticket } from 'lucide-react';
import HeroSection from '../../components/customer/HeroSection';
import API from '../../services/api';

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [events, setEvents] = useState([]);
  const [offers, setOffers] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [trailerModalUrl, setTrailerModalUrl] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    API.get('/movies').then(res => setMovies(res.data)).catch(() => {});
    API.get('/events').then(res => setEvents(res.data)).catch(() => {});
    API.get('/coupons').then(res => setOffers(res.data)).catch(() => {});
  }, []);

  const genres = ['All', 'Sci-Fi', 'Action', 'Drama', 'Biography', 'Adventure'];

  const filteredMovies = selectedGenre === 'All' 
    ? movies 
    : movies.filter(m => m.genres?.includes(selectedGenre));

  return (
    <div className="space-y-16 pb-16 bg-[#050508]">
      {/* HERO VIDEO CROSSFADE ENGINE */}
      <HeroSection />

      {/* QUICK CATEGORY PILL FILTER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-8">
          <div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white flex items-center gap-2">
              <Film className="w-7 h-7 text-cyan-400" /> Now Showing Movies
            </h2>
            <p className="text-xs text-slate-400">Discover trending blockbusters across IMAX, 4DX, and Dolby Atmos.</p>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            {genres.map((genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
                  selectedGenre === genre
                    ? 'bg-cyan-500 text-black border-cyan-400 glow-cyan font-bold'
                    : 'glass-panel text-slate-300 hover:border-cyan-500/40 hover:text-white'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        {/* MOVIES GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredMovies.map((movie) => (
            <motion.div
              key={movie.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -8 }}
              transition={{ duration: 0.3 }}
              className="glass-panel glass-panel-hover rounded-3xl overflow-hidden group flex flex-col justify-between border-white/10 relative"
            >
              {/* MOVIE POSTER & TRAILER HOVER OVERLAY */}
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={movie.bannerUrl || movie.posterUrl}
                  alt={movie.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c0d14] via-black/20 to-transparent" />
                
                {/* RATING BADGE */}
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full glass-badge flex items-center gap-1.5 text-xs font-bold text-amber-300 border-amber-400/40">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{movie.rating}</span>
                  <span className="text-[10px] text-slate-400">({movie.votes})</span>
                </div>

                {/* CERTIFICATION */}
                <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-md glass-badge text-[10px] font-bold text-cyan-300 border-cyan-500/30">
                  {movie.certification}
                </div>

                {/* PLAY TRAILER BUTTON OVERLAY */}
                {movie.trailerUrl && (
                  <button
                    onClick={() => setTrailerModalUrl(movie.trailerUrl)}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <div className="w-14 h-14 rounded-full bg-cyan-500 text-black flex items-center justify-center glow-cyan scale-90 group-hover:scale-100 transition-transform">
                      <Play className="w-6 h-6 fill-black ml-1" />
                    </div>
                  </button>
                )}
              </div>

              {/* MOVIE INFO DETAILS */}
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {movie.formats?.map((fmt) => (
                      <span key={fmt} className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                        {fmt}
                      </span>
                    ))}
                  </div>

                  <h3 className="font-serif text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {movie.title}
                  </h3>

                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {movie.synopsis}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">{movie.duration} • {movie.languages?.join(', ')}</span>
                  <Link
                    to={`/movie/${movie.id}`}
                    className="px-5 py-2 rounded-full bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500 hover:text-black font-bold text-xs transition-all flex items-center gap-1.5 glow-cyan"
                  >
                    <span>Book Show</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* EXCLUSIVE CINEMATIC EXPERIENCES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="p-8 sm:p-12 rounded-3xl glass-panel border-cyan-500/30 bg-gradient-to-br from-[#0c0d14] via-black to-[#070b14] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/30">
                Ultra-Luxury Standards
              </span>
              <h2 className="font-serif text-4xl sm:text-5xl font-bold text-white leading-tight">
                Designed for true <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-indigo-400">Cinematics</span>
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed font-light">
                Experience dual-laser 4K projection, 64-channel Dolby Atmos 3D immersive sound, and 180-degree motor-reclining Italian leather lounges with live in-seat waiter service.
              </p>
              <div className="pt-2 flex flex-wrap gap-4">
                <Link to="/theatres" className="px-6 py-3 rounded-full bg-cyan-500 text-black font-bold text-xs hover:brightness-110 glow-cyan">
                  Explore Multiplexes
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl glass-panel border-white/10 hover:border-cyan-500/40 transition-all">
                <h4 className="font-serif text-xl font-bold text-white mb-1">IMAX 3D Laser</h4>
                <p className="text-xs text-slate-400">Expanded aspect ratio with up to 26% more picture than standard screens.</p>
              </div>
              <div className="p-6 rounded-2xl glass-panel border-white/10 hover:border-cyan-500/40 transition-all">
                <h4 className="font-serif text-xl font-bold text-white mb-1">Director's Cut</h4>
                <p className="text-xs text-slate-400">Private lounges, five-star gourmet culinary menu, and vintage wine selection.</p>
              </div>
              <div className="p-6 rounded-2xl glass-panel border-white/10 hover:border-cyan-500/40 transition-all">
                <h4 className="font-serif text-xl font-bold text-white mb-1">4DX Motion</h4>
                <p className="text-xs text-slate-400">Synchronized environmental effects including wind, mist, scents, and motion seats.</p>
              </div>
              <div className="p-6 rounded-2xl glass-panel border-white/10 hover:border-cyan-500/40 transition-all">
                <h4 className="font-serif text-xl font-bold text-white mb-1">Dolby Atmos</h4>
                <p className="text-xs text-slate-400">Overhead object-based audio moving around you in three-dimensional space.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LIVE EVENTS & CONCERTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-8">
          <div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-7 h-7 text-indigo-400" /> Live Concerts & Standup Comedy
            </h2>
            <p className="text-xs text-slate-400">Book tickets for national arena tours and live musical performances.</p>
          </div>
          <Link to="/events" className="text-xs font-bold text-cyan-400 hover:underline flex items-center gap-1">
            View All Events <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {events.map((evt) => (
            <div key={evt.id} className="glass-panel rounded-3xl overflow-hidden border-white/10 hover:border-indigo-500/40 transition-all group">
              <div className="relative h-48 overflow-hidden">
                <img src={evt.image} alt={evt.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full glass-badge text-[10px] font-bold text-indigo-300">
                  {evt.category}
                </div>
              </div>
              <div className="p-5 space-y-3">
                <h3 className="font-serif text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">{evt.title}</h3>
                <div className="text-xs text-slate-400 space-y-1">
                  <p className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-indigo-400" /> {evt.date} • {evt.time}</p>
                  <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-cyan-400" /> {evt.venue}</p>
                </div>
                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-sm font-bold text-cyan-400">{evt.price}</span>
                  <Link to="/events" className="px-4 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs font-semibold hover:bg-indigo-500 hover:text-white">
                    Passes Available
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* BANK OFFERS & DISCOUNTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-8">
          <div>
            <h2 className="font-serif text-3xl font-bold text-white flex items-center gap-2">
              <Percent className="w-7 h-7 text-emerald-400" /> Exclusive Offers & Cashbacks
            </h2>
            <p className="text-xs text-slate-400">Save big on every booking with our payment partners.</p>
          </div>
          <Link to="/offers" className="text-xs font-bold text-cyan-400 hover:underline">View All Coupons →</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {offers.map((off) => (
            <div key={off.id} className="p-6 rounded-3xl glass-panel border-white/10 space-y-4 bg-gradient-to-br from-white/5 to-transparent relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/30">
                  {off.bankPartner}
                </span>
                <span className="font-mono text-xs font-bold text-amber-300 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
                  {off.code}
                </span>
              </div>
              <h3 className="font-serif text-xl font-bold text-white">{off.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{off.description}</p>
              <div className="text-[11px] text-slate-500">Valid till {off.expiryDate}</div>
            </div>
          ))}
        </div>
      </section>

      {/* LIGHTBOX TRAILER MODAL */}
      {trailerModalUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl">
          <div className="relative w-full max-w-4xl aspect-video bg-black rounded-3xl overflow-hidden border border-cyan-500/30 shadow-2xl">
            <button
              onClick={() => setTrailerModalUrl(null)}
              className="absolute top-4 right-4 z-50 px-4 py-2 rounded-full bg-black/60 text-white hover:bg-cyan-500 hover:text-black font-bold text-xs transition-all"
            >
              ✕ Close Trailer
            </button>
            <iframe
              src={trailerModalUrl}
              title="Movie Official Trailer"
              className="w-full h-full border-none"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
}
