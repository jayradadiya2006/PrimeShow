import React from 'react';
import { X, Sparkles, AlertCircle, Film, ShoppingBag } from 'lucide-react';
import { useBooking } from '../context/BookingContext';

export const SeatBookingModal = ({ isOpen, onClose, onProceedToCheckout }) => {
  const { activeBooking, toggleSeatSelection, showBookedSeatsMap, getScreenLayout } = useBooking();

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl animate-fade-in font-sans">
      <div className="relative w-full max-w-4xl h-[90vh] glass-modal rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl flex flex-col justify-between text-white overflow-y-auto">
        
        {/* Header Bar */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold text-xs">
                {show.format || 'IMAX 3D'}
              </span>
              <h2 className="text-xl md:text-2xl font-bold font-sans text-white">{movie.title}</h2>
            </div>
            <p className="text-xs text-white/60 mt-1">
              {theatre.name} • {show.time} ({show.screenName || 'Screen 1'})
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Screen Indicator */}
        <div className="w-full max-w-xl mx-auto my-3 text-center">
          <div className="screen-curve mb-2"></div>
          <span className="text-[10px] font-bold tracking-widest text-amber-300/90 uppercase">
            ▲ CINEMATIC SCREEN THIS WAY (FRONT) ▲
          </span>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 sm:gap-8 my-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-lg bg-white/10 border border-white/20"></div>
            <span className="text-white/60">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-lg bg-amber-500 border border-amber-400 shadow-md shadow-amber-500/40"></div>
            <span className="text-amber-300 font-bold">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-lg bg-white/5 border border-white/5 text-white/30 flex items-center justify-center text-[10px]">✕</div>
            <span className="text-white/40">Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 flex items-center justify-center text-[10px]">🔒</div>
            <span className="text-rose-300">Blocked / Disabled</span>
          </div>
        </div>

        {/* Liquid Glass Seat Grid */}
        <div className="flex-1 flex flex-col justify-center space-y-5 my-3 overflow-x-auto py-2">
          {SEAT_ROWS.map((tierObj) => (
            <div key={tierObj.row} className="flex flex-col items-center">
              <div className="text-[11px] font-bold text-amber-400 mb-1.5 uppercase tracking-wider flex items-center gap-2">
                <span>{tierObj.tier}</span>
                <span className="px-2 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">₹{tierObj.price}</span>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <span className="w-6 text-xs font-bold text-white/40 text-center">{tierObj.row}</span>

                <div className="flex items-center gap-2 sm:gap-3">
                  {Array.from({ length: tierObj.seatsCount }).map((_, idx) => {
                    const seatNum = idx + 1;
                    const seatId = `${tierObj.row}${seatNum}`;
                    const status = getSeatStatus(seatId);

                    return (
                      <button
                        key={seatId}
                        disabled={status === 'booked' || status === 'blocked'}
                        onClick={() => toggleSeatSelection(seatId, tierObj.price, tierObj.tier)}
                        className={`w-7 h-7 sm:w-9 sm:h-9 rounded-xl font-mono text-xs font-bold transition-all duration-200 flex items-center justify-center cursor-pointer ${
                          status === 'selected'
                            ? 'bg-amber-500 text-black border border-amber-300 shadow-lg shadow-amber-500/50 scale-110'
                            : status === 'booked'
                            ? 'bg-white/5 border border-white/5 text-white/20 cursor-not-allowed'
                            : status === 'blocked'
                            ? 'bg-rose-500/20 border border-rose-500/40 text-rose-300 cursor-not-allowed'
                            : 'bg-white/10 hover:bg-white/25 border border-white/20 text-white/80 hover:text-white hover:scale-105'
                        }`}
                        title={status === 'blocked' ? `${seatId} - Blocked by Admin` : `${seatId} - ₹${tierObj.price}`}
                      >
                        {status === 'booked' ? '✕' : (status === 'blocked' ? '🔒' : seatNum)}
                      </button>
                    );
                  })}
                </div>

                <span className="w-6 text-xs font-bold text-white/40 text-center">{tierObj.row}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Summary & Proceed Button */}
        <div className="border-t border-white/10 pt-4 mt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-0.5 text-center sm:text-left">
            <div className="text-xs text-white/60">
              Selected Seats: <strong className="text-amber-300">{selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}</strong>
            </div>
            <div className="text-lg font-black text-white">
              Total Amount: <span className="text-amber-400 font-mono">₹{subtotal}</span>
            </div>
          </div>

          <button
            disabled={selectedSeats.length === 0}
            onClick={onProceedToCheckout}
            className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
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
