import React, { useState, useEffect } from 'react';
import { 
  MapPin, Film, Shield, Star, PlaySquare, ArrowLeft, Calendar, 
  Clock, Ticket, CheckCircle2, ChevronRight, Award, Sparkles, Building, Lock
} from 'lucide-react';
import API, { API_BASE } from '../services/api';
import { useBooking } from '../context/BookingContext';
import { PrivateTheatreModal } from '../components/PrivateTheatreModal';
import { TheatreMapModal } from '../components/TheatreMapModal';

export const TheatreDetail = ({ theatreId, onBackToTheatres, onBookShowSlot }) => {
  const { moviesList } = useBooking();
  const [theatre, setTheatre] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);

  // Private Theatre Booking State
  const [privateBookingsList, setPrivateBookingsList] = useState([]);
  const [isPrivateModalOpen, setIsPrivateModalOpen] = useState(false);
  const [selectedShowForPrivate, setSelectedShowForPrivate] = useState(null);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  const dates = [
    { label: 'Today', date: '28 Jul', day: 'Tue' },
    { label: 'Tomorrow', date: '29 Jul', day: 'Wed' },
    { label: '30 Jul', date: '30 Jul', day: 'Thu' },
    { label: '31 Jul', date: '31 Jul', day: 'Fri' }
  ];

  const fetchTheatreDetails = async () => {
    setLoading(true);
    try {
      const [thRes, privRes] = await Promise.allSettled([
        API.get(`/theatres/${theatreId || 'th_1'}`),
        API.get('/private-theatre/bookings')
      ]);
      if (thRes.status === 'fulfilled' && thRes.value.data) setTheatre(thRes.value.data);
      if (privRes.status === 'fulfilled' && privRes.value.data) setPrivateBookingsList(privRes.value.data);
    } catch (err) {
      // Fallback seed data if offline
      setTheatre({
        id: theatreId || 'th_1',
        name: 'PVR Director\'s Cut, Palladium Mall',
        city: 'Mumbai',
        state: 'Maharashtra',
        address: '4th Floor, High Street Phoenix, Lower Parel, Mumbai',
        logo: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=150&q=80',
        image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
        facilities: ['VIP Recliners', 'IMAX 3D', 'Dolby Atmos 360', 'Gourmet In-Seat Dining', 'Valet Parking'],
        screensCount: 6,
        totalSeats: 200,
        shows: [
          { id: 'sh_101', movieId: 'mov_1', movieTitle: 'Avatar: Fire and Ash', screenName: 'Screen 1 - IMAX 3D', format: 'IMAX 3D', time: '10:30 AM', price: 450 },
          { id: 'sh_102', movieId: 'mov_1', movieTitle: 'Avatar: Fire and Ash', screenName: 'Screen 1 - IMAX 3D', format: 'IMAX 3D', time: '02:15 PM', price: 480 },
          { id: 'sh_103', movieId: 'mov_2', movieTitle: 'Dune: Part Two', screenName: 'Screen 2 - Luxe Gold Lounge', format: 'Dolby Atmos', time: '06:00 PM', price: 380 },
          { id: 'sh_104', movieId: 'mov_3', movieTitle: 'Kalki 2898 AD', screenName: 'Screen 2 - Luxe Gold Lounge', format: '3D', time: '09:30 PM', price: 400 }
        ]
      });
      setPrivateBookingsList([
        {
          id: 'PRIV-TH-772910',
          theatreId: 'th_1',
          showId: 'sh_104',
          date: '28 Jul'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTheatreDetails();
  }, [theatreId]);

  const handleOpenPrivateBooking = (show) => {
    setSelectedShowForPrivate(show);
    setIsPrivateModalOpen(true);
  };

  const handlePrivateBookingSuccess = async () => {
    try {
      const res = await API.get('/private-theatre/bookings');
      setPrivateBookingsList(res.data);
    } catch (err) {}
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050508] text-white flex items-center justify-center p-4 font-sans">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-amber-400 border-t-transparent animate-spin mx-auto mb-4"></div>
          <p className="text-xs text-amber-300 font-bold uppercase tracking-widest">Loading Multiplex Details...</p>
        </div>
      </div>
    );
  }

  if (!theatre) {
    return (
      <div className="min-h-screen bg-[#050508] text-white flex items-center justify-center p-4 font-sans">
        <div className="glass-panel p-8 rounded-3xl text-center max-w-md">
          <h2 className="text-2xl font-bold font-serif mb-2">Theatre Not Found</h2>
          <button
            onClick={onBackToTheatres}
            className="mt-4 px-6 py-2.5 rounded-xl bg-amber-500 text-black font-bold text-xs"
          >
            Back to Multiplex Directory
          </button>
        </div>
      </div>
    );
  }

  // Group shows by movie
  const showsByMovieMap = {};
  if (theatre.shows && theatre.shows.length > 0) {
    theatre.shows.forEach(s => {
      if (!showsByMovieMap[s.movieId]) {
        showsByMovieMap[s.movieId] = {
          movieId: s.movieId,
          movieTitle: s.movieTitle,
          shows: []
        };
      }
      showsByMovieMap[s.movieId].shows.push(s);
    });
  }

  const movieGroupList = Object.values(showsByMovieMap);
  const selectedDateStr = dates[selectedDateIndex].date;

  return (
    <div className="min-h-screen bg-[#050508] text-white pt-6 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Back Button */}
        <button
          onClick={onBackToTheatres}
          className="mb-6 px-4 py-2 rounded-xl glass-panel hover:bg-white/10 text-white/80 hover:text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border border-white/10"
        >
          <ArrowLeft className="w-4 h-4 text-amber-400" />
          <span>Back to All Multiplexes</span>
        </button>

        {/* Theatre Hero Header Card */}
        <div className="relative rounded-3xl overflow-hidden glass-panel border border-white/15 shadow-2xl mb-8">
          <div className="relative h-64 sm:h-80 w-full overflow-hidden">
            <img
              src={theatre.image || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80"}
              alt={theatre.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-[#050508]/60 to-transparent"></div>
          </div>

          <div className="p-6 sm:p-8 -mt-24 relative z-10 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
            <div className="flex items-center gap-5">
              <img
                src={theatre.logo || "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=150&q=80"}
                alt={theatre.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-amber-400/60 shadow-2xl shrink-0"
              />
              <div>
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold mb-1">
                  <MapPin className="w-4 h-4" />
                  <span>{theatre.city}, {theatre.state || 'Maharashtra'}</span>
                  <span className="text-white/40">•</span>
                  <span className="text-white/80">{theatre.screensCount || 6} Screens ({theatre.totalSeats || 200} Seats)</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-bold font-serif text-white mb-2">{theatre.name}</h1>
                <div className="flex items-center gap-3 flex-wrap">
                  <p className="text-xs text-white/70 max-w-2xl">{theatre.address}</p>
                  <button
                    onClick={() => setIsMapModalOpen(true)}
                    className="px-3 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500 hover:text-black border border-amber-400/40 text-amber-300 text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-md"
                    title="View Interactive Google Map Location"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>📍 View Location / Map</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Facilities Badges */}
            <div className="flex flex-wrap gap-2 max-w-md">
              {(theatre.facilities || []).map((f, idx) => (
                <span key={idx} className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-[11px] font-semibold">
                  ★ {f}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Date Selector Bar */}
        <div className="flex overflow-x-auto gap-3 pb-4 mb-8 text-xs font-semibold">
          {dates.map((d, idx) => {
            const isSelected = selectedDateIndex === idx;
            return (
              <button
                key={idx}
                onClick={() => setSelectedDateIndex(idx)}
                className={`px-5 py-3 rounded-2xl border transition-all flex flex-col items-center min-w-[100px] cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-black border-amber-400 font-bold shadow-lg shadow-amber-500/20'
                    : 'glass-panel text-white/70 hover:text-white border-white/10 hover:bg-white/10'
                }`}
              >
                <span className="text-[10px] uppercase font-bold tracking-wider">{d.label}</span>
                <span className="text-sm font-black">{d.date}</span>
              </button>
            );
          })}
        </div>

        {/* Movies & Showtimes Matrix */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h2 className="text-xl font-bold font-serif text-white flex items-center gap-2">
              <Film className="w-5 h-5 text-amber-400" />
              <span>Available Movie Screenings ({movieGroupList.length})</span>
            </h2>
            <span className="text-xs text-amber-300">Choose Individual Seats or Book Entire Screen Privately</span>
          </div>

          {movieGroupList.length > 0 ? (
            movieGroupList.map(group => {
              const matchedMovie = moviesList.find(m => m.id === group.movieId) || {
                title: group.movieTitle,
                poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
                duration: '2h 30m',
                rating: 9.2,
                genres: ['Action', 'Sci-Fi'],
                parentalRating: 'UA'
              };

              return (
                <div key={group.movieId} className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4 shadow-xl">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={matchedMovie.poster}
                        alt={matchedMovie.title}
                        className="w-14 h-20 object-cover rounded-xl border border-amber-400/40 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                            {matchedMovie.parentalRating || 'UA'}
                          </span>
                          <span className="text-xs text-white/50">{matchedMovie.duration}</span>
                          <span className="text-xs text-amber-400 font-bold">★ {matchedMovie.rating}</span>
                        </div>
                        <h3 className="text-xl font-bold font-serif text-white">{group.movieTitle}</h3>
                        <p className="text-xs text-white/60">{Array.isArray(matchedMovie.genres) ? matchedMovie.genres.join(', ') : matchedMovie.genres}</p>
                      </div>
                    </div>
                  </div>

                  {/* Showtimes Grid with Private Reservation Double Booking Prevention */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                    {group.shows.map(show => {
                      const isPrivateBooked = privateBookingsList.some(b => 
                        b.theatreId === theatre.id && 
                        b.showId === show.id && 
                        (b.date === selectedDateStr || !b.date)
                      );

                      return (
                        <div
                          key={show.id}
                          className="p-4 rounded-2xl glass-panel border border-white/10 hover:border-white/20 flex flex-col justify-between gap-3 shadow-md relative overflow-hidden"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-bold text-amber-400 flex items-center gap-1">
                                <Clock className="w-4 h-4" /> {show.time}
                              </span>
                              <span className="text-xs font-semibold text-emerald-400">₹{show.price || 450} / Seat</span>
                            </div>
                            <div className="text-xs font-medium text-white/80">{show.screenName}</div>
                            <div className="text-[10px] text-white/50">{show.format || 'IMAX 3D'}</div>
                          </div>

                          {/* Action Buttons */}
                          {isPrivateBooked ? (
                            <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center justify-center gap-2 text-center">
                              <Lock className="w-4 h-4 shrink-0" />
                              <span>Already Booked (Private VIP Hall Lock)</span>
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 gap-2 pt-1">
                              <button
                                onClick={() => onBookShowSlot(show)}
                                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer"
                              >
                                Book Seats
                              </button>

                              <button
                                onClick={() => handleOpenPrivateBooking(show)}
                                className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all shadow-md shadow-amber-500/20 cursor-pointer flex items-center justify-center gap-1"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Book Hall</span>
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="glass-panel p-12 rounded-3xl text-center text-white/50">
              No showtimes currently scheduled for this multiplex. Please check back later!
            </div>
          )}
        </div>

      </div>

      {/* Private Theatre Booking Modal */}
      {isPrivateModalOpen && (
        <PrivateTheatreModal
          isOpen={isPrivateModalOpen}
          onClose={() => setIsPrivateModalOpen(false)}
          theatre={theatre}
          show={selectedShowForPrivate}
          selectedDate={selectedDateStr}
          onBookingSuccess={handlePrivateBookingSuccess}
        />
      )}
      {/* Google Map In-App Modal */}
      {isMapModalOpen && theatre && (
        <TheatreMapModal
          isOpen={isMapModalOpen}
          onClose={() => setIsMapModalOpen(false)}
          theatre={theatre}
        />
      )}
    </div>
  );
};
