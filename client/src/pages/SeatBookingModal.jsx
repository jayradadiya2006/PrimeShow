import React, { useState } from 'react';
import { X, Sparkles, AlertCircle, Film, ShoppingBag, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { useBooking } from '../context/BookingContext';

export const SeatBookingModal = ({ isOpen, onClose, onProceedToCheckout }) => {
  const { activeBooking, toggleSeatSelection, showBookedSeatsMap, getScreenLayout } = useBooking();
  const [isInfoExpanded, setIsInfoExpanded] = useState(false);

  if (!isOpen || !activeBooking.movie) return null;

  const { movie, theatre, show, selectedSeats } = activeBooking;
  const screenId = show.screenId || 'sc_1';

  // Dynamic Seat Rows & Layout Tiers configured by Admin for this screen
  const screenLayout = getScreenLayout(screenId);
  const SEAT_ROWS = screenLayout.rows && screenLayout.rows.length > 0 ? screenLayout.rows : [
    { row: 'N', tier: 'Classic Normal (Screen Front)', price: Math.round(show.price * 0.7) || 280, seatsCount: 12 },
    { row: 'P', tier: 'Premium Tier', price: show.price || 480, seatsCount: 12 },
    { row: 'R', tier: 'Luxury Recliner', price: Math.round(show.price * 1.35) || 650, seatsCount: 10 },
    { row: 'V', tier: 'VIP Gold Lounge (Back Tier)', price: Math.round(show.price * 1.95) || 950, seatsCount: 8 }
  ];

  // Dynamic booked & blocked seats for this show + screen
  const showId = show.id || 'sh_101';
  const dynamicallyBooked = showBookedSeatsMap[showId] || [];
  const defaultBooked = ['R3', 'R4', 'P6', 'P7', 'N1', 'N2'];
  const allBookedSeats = Array.from(new Set([...defaultBooked, ...dynamicallyBooked]));

  const blockedSeatsList = screenLayout.blockedSeats || ['V1', 'V2'];
  const customStatuses = screenLayout.customStatuses || {};

  const getSeatStatus = (seatId) => {
    if (selectedSeats.includes(seatId)) return 'selected';
    if (allBookedSeats.includes(seatId) || customStatuses[seatId] === 'BOOKED') return 'booked';
    if (blockedSeatsList.includes(seatId) || customStatuses[seatId] === 'BLOCKED' || customStatuses[seatId] === 'OUT_OF_SERVICE') return 'blocked';
    return 'available';
  };

  const calculateSubtotal = () => {
    return selectedSeats.reduce((sum, seatId) => {
      const rowChar = seatId.charAt(0);
      const rowObj = SEAT_ROWS.find(r => r.row === rowChar);
      return sum + (rowObj ? Number(rowObj.price) : Number(show.price || 480));
    }, 0);
  };

  const subtotal = calculateSubtotal();

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-2 sm:p-4 bg-black/95 backdrop-blur-2xl animate-fade-in font-sans">
      <div className="relative w-full max-w-4xl max-h-[96vh] glass-modal rounded-3xl p-4 sm:p-6 border border-white/15 shadow-2xl flex flex-col justify-between text-white overflow-hidden">
        
        {/* Header Bar with Movie Info Toggle */}
        <div className="border-b border-white/10 pb-3 mb-2 shrink-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px] uppercase border border-amber-400/30">
                  {show.format || 'IMAX 3D'}
                </span>
                <h2 className="text-base sm:text-xl font-bold font-sans text-white truncate max-w-[200px] sm:max-w-md">
                  {movie.title}
                </h2>
              </div>
              
              <div className="text-[11px] text-white/60 mt-1 flex items-center gap-1.5 flex-wrap">
                <span>{theatre.name}</span>
                <span>•</span>
                <span className="text-amber-400 font-bold">{show.time}</span>
                <span>({show.screenName || 'Screen 1'})</span>
                {movie.synopsis && (
                  <button
                    onClick={() => setIsInfoExpanded(!isInfoExpanded)}
                    className="text-amber-300 underline font-semibold text-[10px] cursor-pointer ml-1 inline-flex items-center gap-0.5"
                  >
                    <span>{isInfoExpanded ? 'Less' : 'Info'}</span>
                    {isInfoExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                )}
              </div>

              {isInfoExpanded && movie.synopsis && (
                <p className="text-[11px] text-white/70 mt-1.5 max-w-xl animate-fade-in bg-white/5 p-2 rounded-xl border border-white/10">
                  {movie.synopsis}
                </p>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-rose-500/30 text-white transition-colors cursor-pointer shrink-0"
              title="Close Seat Selector"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Compact Seat Legends Grid */}
        <div className="grid grid-cols-4 gap-1 sm:gap-4 my-1.5 text-[10px] sm:text-xs bg-white/5 p-2 rounded-2xl border border-white/10 shrink-0">
          <div className="flex items-center justify-center gap-1.5">
            <div className="w-4 h-4 rounded-md bg-white/10 border border-white/20"></div>
            <span className="text-white/70">Available</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <div className="w-4 h-4 rounded-md bg-amber-500 border border-amber-400 shadow-sm"></div>
            <span className="text-amber-300 font-bold">Selected</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <div className="w-4 h-4 rounded-md bg-white/5 border border-white/5 text-white/30 flex items-center justify-center text-[9px]">✕</div>
            <span className="text-white/40">Sold</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <div className="w-4 h-4 rounded-md bg-rose-500/20 border border-rose-500/40 text-rose-300 flex items-center justify-center text-[9px]">🔒</div>
            <span className="text-rose-300">Blocked</span>
          </div>
        </div>

        {/* Screen Indicator */}
        <div className="w-full max-w-md mx-auto my-1 text-center shrink-0">
          <div className="screen-curve mb-1"></div>
          <span className="text-[9px] sm:text-[10px] font-bold tracking-widest text-amber-300/90 uppercase">
            ▲ CINEMATIC SCREEN THIS WAY (FRONT) ▲
          </span>
        </div>

        {/* Controlled Scrollable Container (Increased Seat Button & Font Sizes with Touch Scrolling) */}
        <div className="w-full flex-1 overflow-auto max-h-[55vh] sm:max-h-[62vh] p-2 sm:p-4 my-2 rounded-2xl bg-black/40 border border-white/10 flex flex-col items-center select-none">
          <div className="min-w-max flex flex-col items-center justify-center space-y-3 sm:space-y-4 py-2 px-2">
            {SEAT_ROWS.map((tierObj) => (
              <div key={tierObj.row} className="flex flex-col items-center">
                <div className="text-xs font-bold text-amber-400 mb-1.5 uppercase tracking-wider flex items-center gap-2">
                  <span>{tierObj.tier}</span>
                  <span className="px-2 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">₹{tierObj.price}</span>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="w-6 text-xs font-bold text-white/50 text-center shrink-0">{tierObj.row}</span>

                  <div className="flex items-center gap-1.5 sm:gap-2.5">
                    {Array.from({ length: tierObj.seatsCount }).map((_, idx) => {
                      const seatNum = idx + 1;
                      const seatId = `${tierObj.row}${seatNum}`;
                      const status = getSeatStatus(seatId);

                      return (
                        <button
                          key={seatId}
                          disabled={status === 'booked' || status === 'blocked'}
                          onClick={() => toggleSeatSelection(seatId, tierObj.price, tierObj.tier)}
                          className={`w-8 h-8 sm:w-9.5 sm:h-9.5 rounded-xl font-mono text-xs sm:text-sm font-bold transition-all duration-200 flex items-center justify-center cursor-pointer shrink-0 ${
                            status === 'selected'
                              ? 'bg-amber-500 text-black border-2 border-amber-300 shadow-lg shadow-amber-500/50 scale-110'
                              : status === 'booked'
                              ? 'bg-white/5 border border-white/5 text-white/20 cursor-not-allowed'
                              : status === 'blocked'
                              ? 'bg-rose-500/20 border border-rose-500/40 text-rose-300 cursor-not-allowed'
                              : 'bg-white/10 hover:bg-white/25 border border-white/20 text-white/90 hover:text-white hover:scale-105'
                          }`}
                          title={status === 'blocked' ? `${seatId} - Blocked by Admin` : `${seatId} - ₹${tierObj.price}`}
                        >
                          {status === 'booked' ? '✕' : (status === 'blocked' ? '🔒' : seatNum)}
                        </button>
                      );
                    })}
                  </div>

                  <span className="w-6 text-xs font-bold text-white/50 text-center shrink-0">{tierObj.row}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Summary & Proceed Button */}
        <div className="border-t border-white/10 pt-3 mt-1 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="space-y-0.5 text-center sm:text-left">
            <div className="text-[11px] text-white/60">
              Selected Seats: <strong className="text-amber-300">{selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}</strong>
            </div>
            <div className="text-base sm:text-lg font-black text-white">
              Total Amount: <span className="text-amber-400 font-mono">₹{subtotal}</span>
            </div>
          </div>

          <button
            disabled={selectedSeats.length === 0}
            onClick={onProceedToCheckout}
            className={`w-full sm:w-auto px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
              selectedSeats.length > 0
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black shadow-xl shadow-amber-500/30 scale-105'
                : 'bg-white/10 text-white/40 border border-white/10 cursor-not-allowed'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Proceed to Payment (₹{subtotal})</span>
          </button>
        </div>

      </div>
    </div>
  );
};
