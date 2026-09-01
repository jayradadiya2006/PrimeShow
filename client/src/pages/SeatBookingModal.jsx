import React, { useState } from 'react';
import { X, Sparkles, AlertCircle, Film, ShoppingBag, Info, ChevronDown, ChevronUp, Lock } from 'lucide-react';
import { useBooking } from '../context/BookingContext';

export const SeatBookingModal = ({ isOpen, onClose, onProceedToPayment, onProceedToCheckout }) => {
  const { activeBooking, toggleSeatSelection, showBookedSeatsMap, getScreenLayout, lockSeatsForShow } = useBooking();
  const [isInfoExpanded, setIsInfoExpanded] = useState(false);
  const [isLocking, setIsLocking] = useState(false);

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

  // Smooth Payment Transition & Real-Time Seat Hold
  const handleProceedToPayment = async () => {
    if (selectedSeats.length === 0) return;

    setIsLocking(true);

    // 1. Temporarily Lock / Hold seats in real-time store & backend
    if (lockSeatsForShow) {
      await lockSeatsForShow(showId, selectedSeats);
    }

    setIsLocking(false);

    // 2. Smoothly open Payment Gateway / Checkout Modal
    if (typeof onProceedToPayment === 'function') {
      onProceedToPayment();
    } else if (typeof onProceedToCheckout === 'function') {
      onProceedToCheckout();
    }
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-4xl max-h-[96vh] bg-[#DBCEA5] rounded-3xl p-4 sm:p-6 border border-[#c5ba92] shadow-2xl flex flex-col justify-between text-slate-900 overflow-hidden">
        
        {/* Header Bar with Movie Info Toggle */}
        <div className="border-b border-[#c5ba92] pb-3 mb-2 shrink-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-[#D90000] text-white font-bold text-[10px] uppercase shadow-xs">
                  {show.format || 'IMAX 3D'}
                </span>
                <h2 className="text-base sm:text-xl font-bold font-sans text-slate-900 truncate max-w-[200px] sm:max-w-md">
                  {movie.title}
                </h2>
              </div>
              
              <div className="text-[11px] text-slate-700 mt-1 flex items-center gap-1.5 flex-wrap">
                <span>{theatre.name}</span>
                <span>•</span>
                <span className="text-[#D90000] font-bold">{show.time}</span>
                <span>({show.screenName || 'Screen 1'})</span>
                {movie.synopsis && (
                  <button
                    onClick={() => setIsInfoExpanded(!isInfoExpanded)}
                    className="text-[#D90000] underline font-semibold text-[10px] cursor-pointer ml-1 inline-flex items-center gap-0.5"
                  >
                    <span>{isInfoExpanded ? 'Less' : 'Info'}</span>
                    {isInfoExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                )}
              </div>

              {isInfoExpanded && movie.synopsis && (
                <p className="text-[11px] text-slate-800 mt-1.5 max-w-xl animate-fade-in bg-white p-2.5 rounded-xl border border-slate-300">
                  {movie.synopsis}
                </p>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-[#D90000] hover:bg-[#b00000] text-white transition-colors cursor-pointer shrink-0 shadow-md"
              title="Close Seat Selector"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Compact Seat Legends Grid */}
        <div className="grid grid-cols-4 gap-1 sm:gap-4 my-1.5 text-[10px] sm:text-xs bg-white p-2 rounded-2xl border border-slate-300 shrink-0 text-slate-900">
          <div className="flex items-center justify-center gap-1.5">
            <div className="w-4 h-4 rounded-md bg-white border border-slate-400"></div>
            <span className="text-slate-700">Available</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <div className="w-4 h-4 rounded-md bg-[#D90000] border border-[#D90000] shadow-sm"></div>
            <span className="text-[#D90000] font-bold">Selected</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <div className="w-4 h-4 rounded-md bg-slate-200 border border-slate-300 text-slate-400 flex items-center justify-center text-[9px]">✕</div>
            <span className="text-slate-500">Sold</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <div className="w-4 h-4 rounded-md bg-red-100 border border-red-300 text-red-600 flex items-center justify-center text-[9px]">🔒</div>
            <span className="text-red-600">Blocked</span>
          </div>
        </div>

        {/* Screen Indicator */}
        <div className="w-full max-w-md mx-auto my-1 text-center shrink-0">
          <div className="screen-curve mb-1 border-t-4 border-[#D90000]"></div>
          <span className="text-[9px] sm:text-[10px] font-bold tracking-widest text-[#D90000] uppercase">
            ▲ CINEMATIC SCREEN THIS WAY (FRONT) ▲
          </span>
        </div>

        {/* Controlled Scrollable Container */}
        <div className="w-full flex-1 overflow-auto max-h-[55vh] sm:max-h-[62vh] p-2 sm:p-4 my-2 rounded-2xl bg-white border border-slate-300 flex flex-col items-center select-none shadow-inner">
          <div className="min-w-max flex flex-col items-center justify-center space-y-3 sm:space-y-4 py-2 px-2">
            {SEAT_ROWS.map((tierObj) => (
              <div key={tierObj.row} className="flex flex-col items-center">
                <div className="text-xs font-bold text-[#D90000] mb-1.5 uppercase tracking-wider flex items-center gap-2">
                  <span>{tierObj.tier}</span>
                  <span className="px-2 py-0.5 rounded bg-[#DBCEA5] text-slate-900 border border-[#c5ba92] font-mono text-[10px]">₹{tierObj.price}</span>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="w-6 text-xs font-bold text-slate-500 text-center shrink-0">{tierObj.row}</span>

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
                              ? 'bg-[#D90000] text-white border-2 border-red-700 shadow-md scale-110'
                              : status === 'booked'
                              ? 'bg-slate-200 border border-slate-300 text-slate-400 cursor-not-allowed'
                              : status === 'blocked'
                              ? 'bg-red-100 border border-red-300 text-red-600 cursor-not-allowed'
                              : 'bg-white hover:bg-[#DBCEA5] border border-slate-300 text-slate-900 hover:scale-105'
                          }`}
                          title={status === 'blocked' ? `${seatId} - Blocked by Admin` : `${seatId} - ₹${tierObj.price}`}
                        >
                          {status === 'booked' ? '✕' : (status === 'blocked' ? '🔒' : seatNum)}
                        </button>
                      );
                    })}
                  </div>

                  <span className="w-6 text-xs font-bold text-slate-500 text-center shrink-0">{tierObj.row}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Summary & Enabled Proceed to Payment Button */}
        <div className="border-t border-[#c5ba92] pt-3 mt-1 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 text-slate-900">
          <div className="space-y-0.5 text-center sm:text-left">
            <div className="text-[11px] text-slate-700">
              Selected Seats: <strong className="text-[#D90000]">{selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}</strong>
            </div>
            <div className="text-base sm:text-lg font-black text-slate-900">
              Total Amount: <span className="text-[#D90000] font-mono">₹{subtotal}</span>
            </div>
          </div>

          <button
            disabled={selectedSeats.length === 0 || isLocking}
            onClick={handleProceedToPayment}
            className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
              selectedSeats.length > 0
                ? 'bg-[#D90000] hover:bg-[#b00000] text-white shadow-lg cursor-pointer opacity-100'
                : 'bg-slate-300 text-slate-500 border border-slate-300 cursor-not-allowed opacity-50'
            }`}
          >
            {isLocking ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                <span>Locking Seats...</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span>Proceed to Payment (₹{subtotal})</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
