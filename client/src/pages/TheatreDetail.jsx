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
      <div className="min-h-screen bg-[#FFFFFF] text-slate-900 flex items-center justify-center p-4 font-sans">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-[#D90000] border-t-transparent animate-spin mx-auto mb-4"></div>
          <p className="text-xs text-[#D90000] font-bold uppercase tracking-widest">Loading Multiplex Details...</p>
        </div>
      </div>
    );
  }

  if (!theatre) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] text-slate-900 flex items-center justify-center p-4 font-sans">
        <div className="bg-[#DBCEA5] p-8 rounded-3xl border border-[#c5ba92] text-center max-w-md shadow-md text-slate-900">
          <h2 className="text-2xl font-bold font-sans mb-2 text-slate-900">Theatre Not Found</h2>
          <button
            onClick={onBackToTheatres}
            className="mt-4 px-6 py-2.5 rounded-xl bg-[#D90000] hover:bg-[#b00000] text-white font-bold text-xs shadow-md cursor-pointer"
          >
            Back to Multiplex Directory
          </button>
        </div>
      </div>
    );
  }

  // Dynamic Date List Generator (combines Admin Configured Dates + Upcoming 7 Days)
  const getDynamicDatesList = () => {
    const today = new Date();
    const isoDates = new Set();

    // 1. Add next 7 days starting from today (YYYY-MM-DD)
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      isoDates.add(d.toISOString().split('T')[0]);
    }

    // 2. Add any dates configured in theatre.hallSlotsByDate, dateHalls, pricingByDate
    if (theatre) {
      const hallMap = theatre.hallSlotsByDate || theatre.dateHalls || {};
      Object.keys(hallMap).forEach(dKey => {
        if (dKey && dKey.length === 10) isoDates.add(dKey);
      });
      if (theatre.pricingByDate) {
        Object.keys(theatre.pricingByDate).forEach(dKey => {
          if (dKey && dKey.length === 10) isoDates.add(dKey);
        });
      }
      if (Array.isArray(theatre.shows)) {
        theatre.shows.forEach(s => {
          if (s.date && s.date.length === 10) isoDates.add(s.date);
        });
      }
    }

    const sortedIsoList = Array.from(isoDates).sort();

    return sortedIsoList.map((isoStr, index) => {
      const dObj = new Date(isoStr + 'T00:00:00');
      const dayName = dObj.toLocaleDateString('en-US', { weekday: 'short' });
      const monthName = dObj.toLocaleDateString('en-US', { month: 'short' });
      const dayNum = dObj.getDate();

      let label = `${dayNum} ${monthName}`;
      if (isoStr === today.toISOString().split('T')[0]) label = 'TODAY';
      else if (index === 1) label = 'TOMORROW';

      return {
        label: label,
        date: isoStr,
        day: dayName,
        monthDay: `${dayNum} ${monthName}`
      };
    });
  };

  const dates = getDynamicDatesList();

  const selectedDateStr = dates[selectedDateIndex]?.date || new Date().toISOString().split('T')[0];

  // Group shows & halls by movie strictly filtered by selected date
  const showsByMovieMap = {};

  // 1. Collect from theatre.shows
  if (theatre?.shows && Array.isArray(theatre.shows)) {
    theatre.shows.forEach(s => {
      if (s.date === selectedDateStr || !s.date) {
        const mId = s.movieId || 'mov_1';
        if (!showsByMovieMap[mId]) {
          showsByMovieMap[mId] = {
            movieId: mId,
            movieTitle: s.movieTitle || 'Avatar: Fire and Ash',
            shows: []
          };
        }
        showsByMovieMap[mId].shows.push(s);
      }
    });
  }

  // 2. Collect from theatre.hallSlotsByDate or dateHalls for selectedDateStr
  const hallMap = theatre?.hallSlotsByDate || theatre?.dateHalls || {};
  const activeDateHalls = Array.isArray(hallMap[selectedDateStr]) ? hallMap[selectedDateStr] : [];
  if (activeDateHalls.length > 0) {
    activeDateHalls.forEach(h => {
      const mId = h.movieId || 'mov_1';
      if (!showsByMovieMap[mId]) {
        showsByMovieMap[mId] = {
          movieId: mId,
          movieTitle: h.movieTitle || 'Toxic',
          shows: []
        };
      }
      showsByMovieMap[mId].shows.push({
        id: h.id,
        movieId: mId,
        movieTitle: h.movieTitle || 'Toxic',
        screenName: h.hallName || 'Hall 1',
        format: h.format || 'IMAX 3D',
        time: h.time || '10:30 AM',
        price: h.price || 4500,
        date: selectedDateStr
      });
    });
  }

  const movieGroupList = Object.values(showsByMovieMap);

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-slate-900 pt-6 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Back Button */}
        <button
          onClick={onBackToTheatres}
          className="mb-6 px-4 py-2 rounded-xl bg-[#DBCEA5] border border-[#c5ba92] text-slate-900 hover:bg-[#caba8e] text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-4 h-4 text-[#D90000]" />
          <span>Back to All Multiplexes</span>
        </button>

        {/* Theatre Hero Header Card */}
        <div className="relative rounded-3xl overflow-hidden bg-[#DBCEA5] border border-[#c5ba92] shadow-md mb-8 text-slate-900">
          <div className="relative h-64 sm:h-80 w-full overflow-hidden">
            <img
              src={theatre.image || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80"}
              alt={theatre.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#DBCEA5] via-[#DBCEA5]/40 to-transparent"></div>
          </div>

          <div className="p-6 sm:p-8 -mt-24 relative z-10 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
            <div className="flex items-center gap-5">
              <img
                src={theatre.logo || "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=150&q=80"}
                alt={theatre.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-slate-300 shadow-xl shrink-0"
              />
              <div>
                <div className="flex items-center gap-2 text-[#D90000] text-xs font-bold mb-1">
                  <MapPin className="w-4 h-4" />
                  <span>{theatre.city}, {theatre.state || 'Gujarat'}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-700">{theatre.screensCount || 6} Screens ({theatre.totalSeats || 200} Seats)</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-bold font-sans text-slate-900 mb-2">{theatre.name}</h1>
                <div className="flex items-center gap-3 flex-wrap">
                  <p className="text-xs text-slate-700 max-w-2xl font-medium">{theatre.address}</p>
                  <button
                    onClick={() => setIsMapModalOpen(true)}
                    className="px-3 py-1 rounded-xl bg-[#D90000] hover:bg-[#b00000] text-white text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-md"
                    title="View Interactive Google Map Location"
                  >
                    <MapPin className="w-3.5 h-3.5 text-white" />
                    <span>📍 View Location / Map</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Facilities Badges */}
            <div className="flex flex-wrap gap-2 max-w-md">
              {(theatre.facilities || []).map((f, idx) => (
                <span key={idx} className="px-3 py-1 rounded-full bg-white border border-slate-300 text-slate-900 text-[11px] font-bold shadow-xs">
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
                key={d.date || idx}
                onClick={() => setSelectedDateIndex(idx)}
                className={`px-5 py-3 rounded-2xl border transition-all flex flex-col items-center min-w-[110px] cursor-pointer ${
                  isSelected
                    ? 'bg-[#D90000] text-white border-[#D90000] font-bold shadow-md scale-105'
                    : 'bg-white text-slate-800 hover:bg-slate-100 border-slate-300'
                }`}
              >
                <span className="text-[10px] uppercase font-bold tracking-wider">{d.day || d.label}</span>
                <span className="text-sm font-black">{d.monthDay || d.date}</span>
                <span className="text-[9px] opacity-70 font-mono">{d.date}</span>
              </button>
            );
          })}
        </div>

        {/* Date-Wise Available Halls Section */}
        {(() => {
          const hallMap = theatre.hallSlotsByDate || theatre.dateHalls || {};
          const activeDateHalls = Array.isArray(hallMap[selectedDateStr]) ? hallMap[selectedDateStr] : [];

          return (
            <div className="bg-[#DBCEA5] p-6 rounded-3xl border border-[#c5ba92] space-y-4 mb-8 text-slate-900 shadow-md">
              <div className="flex items-center justify-between border-b border-[#c5ba92] pb-3">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span>🏛️ Configured Halls for {selectedDateStr}</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#D90000] text-white text-xs font-mono font-bold">
                    {activeDateHalls.length} {activeDateHalls.length === 1 ? 'Hall' : 'Halls'} Available
                  </span>
                </h3>
                <span className="text-xs text-[#D90000] font-bold">Live MongoDB Synced</span>
              </div>

              {activeDateHalls.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeDateHalls.map((hall, idx) => (
                    <div key={hall.id || idx} className="p-4 rounded-2xl bg-white border border-slate-300 space-y-2 hover:border-[#D90000] transition-all shadow-xs text-slate-900">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-sm">{hall.hallName}</span>
                        <span className="px-2 py-0.5 rounded bg-[#DBCEA5] text-slate-900 border border-[#c5ba92] text-[10px] font-bold">{hall.format}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-700">
                        <span>Showtime: <strong className="text-slate-900">{hall.time}</strong></span>
                        <span className="font-extrabold text-[#D90000] text-sm">₹{hall.price} / Seat</span>
                      </div>
                      <button
                        onClick={() => onBookShowSlot({ id: hall.id, time: hall.time, format: hall.format, price: hall.price, screenName: hall.hallName, date: selectedDateStr })}
                        className="w-full py-2 rounded-xl bg-[#D90000] hover:bg-[#b00000] text-white font-bold text-xs shadow-md cursor-pointer transition-all mt-1"
                      >
                        Reserve Seat in {hall.hallName}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-white border border-slate-300 text-center space-y-1 text-slate-900">
                  <div className="text-sm font-bold text-slate-800">No Available Halls Configured for {selectedDateStr}</div>
                  <div className="text-xs text-slate-600">No halls were added for this specific date. Please pick another date above to view available screens.</div>
                </div>
              )}
            </div>
          );
        })()}

        {/* Movies & Showtimes Matrix */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-300 pb-3">
            <h2 className="text-xl font-bold font-sans text-slate-900 flex items-center gap-2">
              <Film className="w-5 h-5 text-[#D90000]" />
              <span>Available Movie Screenings ({movieGroupList.length})</span>
            </h2>
            <span className="text-xs text-[#D90000] font-bold">Choose Individual Seats or Book Entire Screen Privately</span>
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
                <div key={group.movieId} className="bg-[#DBCEA5] p-6 rounded-3xl border border-[#c5ba92] space-y-4 shadow-md text-slate-900">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#c5ba92] pb-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={matchedMovie.poster}
                        alt={matchedMovie.title}
                        className="w-14 h-20 object-cover rounded-xl border border-slate-300 shrink-0 shadow-xs"
                      />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded bg-[#D90000] text-white text-[10px] font-bold">
                            {matchedMovie.parentalRating || 'UA'}
                          </span>
                          <span className="text-xs text-slate-700 font-semibold">{matchedMovie.duration}</span>
                          <span className="text-xs text-[#D90000] font-bold">★ {matchedMovie.rating}</span>
                        </div>
                        <h3 className="text-xl font-bold font-sans text-slate-900">{group.movieTitle}</h3>
                        <p className="text-xs text-slate-700 font-medium">{Array.isArray(matchedMovie.genres) ? matchedMovie.genres.join(', ') : matchedMovie.genres}</p>
                      </div>
                    </div>
                  </div>

                  {/* Showtimes Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                    {group.shows.map(show => {
                      const isPrivateBooked = privateBookingsList.some(b => 
                        b.theatreId === theatre.id && 
                        b.showId === show.id && 
                        (b.date === selectedDateStr || !b.date)
                      );

                      const datePriceConfig = theatre.pricingByDate?.[selectedDateStr] || theatre.datePricing?.[selectedDateStr];
                      const isUnavailable = datePriceConfig && datePriceConfig.status === 'UNAVAILABLE';
                      const effectivePrice = datePriceConfig && (datePriceConfig.status === 'APPROVED' || datePriceConfig.status === 'AVAILABLE')
                        ? ((show.format || '').toLowerCase().includes('imax') ? datePriceConfig.imaxPrice : ((show.format || '').toLowerCase().includes('vip') ? datePriceConfig.vipPrice : datePriceConfig.standardPrice))
                        : (show.price || 250);

                      return (
                        <div
                          key={show.id}
                          className="p-4 rounded-2xl bg-white border border-slate-300 hover:border-[#D90000] flex flex-col justify-between gap-3 shadow-xs relative overflow-hidden text-slate-900"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-bold text-[#D90000] flex items-center gap-1">
                                <Clock className="w-4 h-4" /> {show.time}
                              </span>
                              <span className="text-xs font-bold text-slate-900">
                                ₹{effectivePrice} / Seat {datePriceConfig?.status === 'APPROVED' ? '⚡' : ''}
                              </span>
                            </div>
                            <div className="text-xs font-bold text-slate-800">{show.screenName}</div>
                            <div className="text-[10px] text-slate-600 font-medium">
                              {show.format || 'IMAX 3D'} • Date: {selectedDateStr}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          {isUnavailable ? (
                            <div className="p-3 rounded-xl bg-red-100 border border-red-300 text-red-700 text-xs font-bold text-center">
                              Show Slot Offline on {selectedDateStr}
                            </div>
                          ) : isPrivateBooked ? (
                            <div className="p-3 rounded-xl bg-red-100 border border-red-300 text-red-700 text-xs font-bold flex items-center justify-center gap-2 text-center">
                              <Lock className="w-4 h-4 shrink-0" />
                              <span>Already Booked (Private VIP Hall Lock)</span>
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 gap-2 pt-1">
                              <button
                                onClick={() => onBookShowSlot({ ...show, price: effectivePrice, date: selectedDateStr })}
                                className="px-3 py-2 rounded-xl bg-[#DBCEA5] hover:bg-[#caba8e] border border-[#c5ba92] text-slate-900 text-xs font-bold transition-all cursor-pointer"
                              >
                                Book Seats
                              </button>

                              <button
                                onClick={() => handleOpenPrivateBooking(show)}
                                className="px-3 py-2 rounded-xl bg-[#D90000] hover:bg-[#b00000] text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-1"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-white" />
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
            <div className="bg-[#DBCEA5] p-12 rounded-3xl text-center text-slate-700 border border-[#c5ba92] font-semibold">
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
