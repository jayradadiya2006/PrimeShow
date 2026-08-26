import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Calendar, MapPin, Ticket, ArrowLeft, Clock, ShieldCheck, 
  Compass, Share2, Heart, Award, Info, AlertCircle, CheckCircle2, ChevronRight
} from 'lucide-react';
import { EventBookingModal } from '../components/EventBookingModal';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

export const EventDetail = ({ eventId, onBackToEvents, onSelectMovie }) => {
  const { selectedCity } = useAuth();
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const fetchEventDetail = async () => {
    if (!eventId) return;
    setLoading(true);
    setError(null);
    let isCancelled = false;

    const timer = setTimeout(() => {
      if (!isCancelled) setLoading(false);
    }, 6000);

    try {
      const res = await API.get(`/events/${eventId}`, {
        params: { t: Date.now() }
      });
      if (!isCancelled) {
        if (res.data) {
          setEventData(res.data);
          
          // Auto-select initial date
          const slotsMap = res.data.slots || res.data.schedules || {};
          const availableDates = res.data.eventDates || res.data.dates || Object.keys(slotsMap);
          if (availableDates && availableDates.length > 0) {
            setSelectedDate(availableDates[0]);
          } else if (res.data.date || res.data.eventDate) {
            setSelectedDate(res.data.date || res.data.eventDate);
          }
        } else {
          setError('Event not found.');
        }
      }
    } catch (err) {
      console.warn('⚠️ Error fetching live event from MongoDB Atlas:', err.message);
      if (!isCancelled) setError('Unable to load event details from database.');
    } finally {
      clearTimeout(timer);
      if (!isCancelled) setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventDetail();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [eventId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050508] text-white flex flex-col items-center justify-center p-8 space-y-4 font-sans">
        <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-amber-300">Fetching live event details from MongoDB Atlas...</p>
      </div>
    );
  }

  if (error || !eventData) {
    return (
      <div className="min-h-screen bg-[#050508] text-white flex flex-col items-center justify-center p-8 space-y-4 font-sans">
        <AlertCircle className="w-12 h-12 text-rose-500" />
        <h3 className="text-xl font-bold text-white">{error || 'Event Not Found'}</h3>
        <button
          onClick={onBackToEvents}
          className="px-6 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs transition cursor-pointer"
        >
          ← Return to All Events
        </button>
      </div>
    );
  }

  // Derive dates & slots maps
  const slotsMap = eventData.slots || eventData.schedules || {};
  const rawDates = eventData.eventDates || eventData.dates || Object.keys(slotsMap);
  const availableDates = Array.from(new Set([
    ...rawDates,
    ...(eventData.date ? [eventData.date] : [])
  ])).filter(Boolean);

  const activeDateSlots = (selectedDate && slotsMap[selectedDate] && Array.isArray(slotsMap[selectedDate]))
    ? slotsMap[selectedDate]
    : [];

  const languagesList = Array.isArray(eventData.languages) 
    ? eventData.languages.join(', ') 
    : (eventData.languages || 'English, Hindi, Gujarati');

  const bannerImg = eventData.bannerUrl || eventData.banner || eventData.image || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80';
  const posterImg = eventData.image || eventData.poster || bannerImg;

  const handleBookSlotClick = (slotObj) => {
    setSelectedSlot(slotObj);
    setIsBookingModalOpen(true);
  };

  const handleShareEvent = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: eventData.title,
          text: `Check out ${eventData.title} at ${eventData.venue}! Book tickets on PrimeShow.`,
          url: window.location.href
        });
      } catch (e) {}
    } else {
      alert(`Event Link Copied: ${eventData.title}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#050508] text-white font-sans pb-24">
      {/* Top Back Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-4 pb-2 flex items-center justify-between">
        <button
          onClick={onBackToEvents}
          className="flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Events</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsLiked(!isLiked)}
            className={`p-2.5 rounded-full border transition cursor-pointer ${
              isLiked ? 'bg-rose-500/20 border-rose-500/40 text-rose-400' : 'bg-white/5 border-white/10 text-white/70 hover:text-white'
            }`}
            title="Add to Wishlist"
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500' : ''}`} />
          </button>
          <button
            onClick={handleShareEvent}
            className="p-2.5 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white transition cursor-pointer"
            title="Share Event"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Event Hero Backdrop Banner */}
      <div className="relative w-full max-w-7xl mx-auto px-4 md:px-8 mt-2">
        <div className="relative h-64 sm:h-80 md:h-96 rounded-3xl overflow-hidden border border-white/15 shadow-2xl">
          <img
            src={bannerImg}
            alt={eventData.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-[#050508]/60 to-transparent"></div>

          {/* Floating Badges */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full bg-amber-500 text-black text-xs font-extrabold shadow-lg uppercase tracking-wider">
              {eventData.badge || 'LIVE'}
            </span>
            <span className="px-3 py-1 rounded-full bg-cyan-500/80 backdrop-blur-md text-black text-xs font-extrabold shadow-lg">
              {eventData.category || 'Event'}
            </span>
            <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-amber-300 border border-amber-400/30 text-xs font-bold">
              {eventData.ageRating || 'All Ages'}
            </span>
          </div>
        </div>

        {/* Floating Content Card Superimposed */}
        <div className="-mt-20 sm:-mt-28 relative z-10 max-w-6xl mx-auto px-2 sm:px-6">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/15 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-[#0c0e17]/90 backdrop-blur-2xl">
            <div className="flex items-start gap-5">
              <img
                src={posterImg}
                alt={eventData.title}
                className="w-28 h-36 sm:w-36 sm:h-48 rounded-2xl object-cover border-2 border-amber-400/60 shadow-2xl shrink-0 hidden sm:block"
              />
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-4xl font-extrabold text-white font-sans tracking-tight">
                  {eventData.title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-3 text-xs text-white/70">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                    <MapPin className="w-4 h-4 shrink-0" />
                    <span>{eventData.venue} • <strong className="text-white">{eventData.city}</strong></span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1.5 text-cyan-300 font-semibold">
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <span>Languages: {languagesList}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-baseline gap-2">
                  <span className="text-xs text-white/50">Ticket Price starting from:</span>
                  <span className="text-2xl font-black text-emerald-400">₹{eventData.price || eventData.ticketPrice || 0}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                const el = document.getElementById('slots-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full md:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-black font-black text-sm shadow-xl shadow-amber-500/25 hover:scale-105 transition-transform cursor-pointer shrink-0 flex items-center justify-center gap-2"
            >
              <Ticket className="w-5 h-5" />
              <span>Select Date & Book Slot</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Details Grid */}
      <div id="slots-section" className="max-w-7xl mx-auto px-4 md:px-8 mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Dates & Showtimes Selector */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Section A: Date Selector */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-400" />
              <span>Select Event Date</span>
            </h3>

            {availableDates.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {availableDates.map((dateStr) => {
                  const isActive = selectedDate === dateStr;
                  return (
                    <button
                      key={dateStr}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`px-5 py-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center min-w-[110px] ${
                        isActive
                          ? 'bg-amber-500 text-black border-amber-400 shadow-lg shadow-amber-500/20 scale-105'
                          : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
                      }`}
                    >
                      <span className="text-[10px] uppercase opacity-75 font-mono">Date</span>
                      <span className="text-sm font-extrabold">{dateStr}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-white/5 text-xs text-white/60">
                Single Date Event: {eventData.date || 'Scheduled Date'}
              </div>
            )}
          </div>

          {/* Section B: Showtimes & Hall Slot Cards */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-cyan-400" />
                <span>Available Showtime Slots ({activeDateSlots.length})</span>
              </h3>
              <span className="text-xs text-cyan-300 font-mono">Live MongoDB Atlas Sync</span>
            </div>

            {activeDateSlots.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activeDateSlots.map((slot, idx) => (
                  <div
                    key={slot.id || idx}
                    className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-400/50 transition-all space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 text-[10px] font-extrabold uppercase">
                          {slot.tier || slot.category || 'VIP'}
                        </span>
                        <span className="text-xs font-mono text-white/50">{slot.screen || slot.hall || 'Main Stage'}</span>
                      </div>

                      <h4 className="text-xl font-black text-amber-300 font-mono pt-1">
                        {slot.startTime || slot.time} {slot.endTime ? ` - ${slot.endTime}` : ''}
                      </h4>

                      <div className="text-xs text-white/60 flex items-center justify-between">
                        <span>Seat Capacity: {slot.totalCapacity || eventData.totalCapacity || 1000}</span>
                        <span className="text-emerald-400 font-bold">Available</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-white/40 block">Ticket Price</span>
                        <span className="text-lg font-black text-emerald-400">₹{slot.price || eventData.price || 1500}</span>
                      </div>

                      <button
                        onClick={() => handleBookSlotClick(slot)}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-md shadow-amber-500/20 transition cursor-pointer flex items-center gap-1"
                      >
                        <Ticket className="w-3.5 h-3.5" />
                        <span>Book Slot</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center glass-panel rounded-2xl space-y-3">
                <Ticket className="w-8 h-8 text-amber-400 mx-auto" />
                <h4 className="text-sm font-bold text-white">General Admission Ticket</h4>
                <p className="text-xs text-white/60">Standard entry passes available for {selectedDate || eventData.date || 'this event'}.</p>
                <button
                  onClick={() => handleBookSlotClick(null)}
                  className="mt-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-lg shadow-amber-500/20 transition cursor-pointer inline-flex items-center gap-2"
                >
                  <Ticket className="w-4 h-4" />
                  <span>Book Admission Ticket (₹{eventData.price || 1500})</span>
                </button>
              </div>
            )}
          </div>

          {/* Section C: Synopsis & Terms */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-6 shadow-xl">
            <div>
              <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-400" />
                <span>About the Event</span>
              </h3>
              <p className="text-xs text-white/70 leading-relaxed">
                {eventData.description || eventData.synopsis || 'Exclusive live event experience hosted on PrimeShow.'}
              </p>
            </div>

            <div className="pt-4 border-t border-white/10">
              <h3 className="text-base font-bold text-amber-400 mb-2 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Terms & Conditions</span>
              </h3>
              <p className="text-xs text-white/60 leading-relaxed font-mono">
                {eventData.termsAndConditions || 'Entry permits one person per ticket. Passes are non-refundable. Please bring valid ID proof.'}
              </p>
            </div>
          </div>

        </div>

        {/* Right Col: Venue Address & Google Map View */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-amber-400" />
              <span>Venue & Location</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="font-bold text-amber-300 text-sm">{eventData.venue}</div>
              <p className="text-white/70 leading-relaxed">{eventData.address || eventData.venueLocation || eventData.venue}</p>
              <div className="text-cyan-300 font-semibold">City: {eventData.city || selectedCity || 'Surat'}</div>
            </div>

            {eventData.mapLocationUrl ? (
              <div className="pt-3 border-t border-white/10 space-y-3">
                <a
                  href={eventData.mapLocationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500 hover:text-black border border-cyan-400/40 text-cyan-300 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-md"
                >
                  <Compass className="w-4 h-4" />
                  <span>Open Google Maps Directions</span>
                </a>

                {/* Embedded Map Frame if Google Map Embed Link */}
                {eventData.mapLocationUrl.includes('embed') && (
                  <div className="h-48 rounded-2xl overflow-hidden border border-white/10">
                    <iframe
                      src={eventData.mapLocationUrl}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen=""
                      loading="lazy"
                      title="Venue Map"
                    ></iframe>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-white/5 text-[11px] text-white/50 text-center font-mono">
                📍 {eventData.venue}, {eventData.city}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Booking Pass Modal */}
      {isBookingModalOpen && (
        <EventBookingModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          event={{
            ...eventData,
            date: selectedDate || eventData.date,
            time: selectedSlot ? selectedSlot.startTime : eventData.time,
            price: selectedSlot ? selectedSlot.price : eventData.price
          }}
        />
      )}
    </div>
  );
};
