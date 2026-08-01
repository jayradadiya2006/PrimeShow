import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Film, ArrowLeft, Ticket, ShieldAlert, Check, Sparkles } from 'lucide-react';
import { useBooking } from '../../context/BookingContext';
import API from '../../services/api';

export default function SeatBookingPage() {
  const { showId } = useParams();
  const navigate = useNavigate();
  const { selectedShow, setSelectedShow, selectedSeats, setSelectedSeats, calculateTotal } = useBooking();

  const [showData, setShowData] = useState(selectedShow);
  const [loading, setLoading] = useState(!selectedShow);

  useEffect(() => {
    if (!showData || showData.id !== showId) {
      API.get(`/shows/${showId}`)
        .then(res => {
          setShowData(res.data);
          setSelectedShow(res.data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [showId]);

  if (loading || !showData) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        Preparing seat map grid...
      </div>
    );
  }

  // Seat Tiers layout grid generator
  const rows = [
    { label: 'A', tier: 'Recliner', price: showData.prices?.Recliner || 650, seatsCount: 12 },
    { label: 'B', tier: 'Recliner', price: showData.prices?.Recliner || 650, seatsCount: 12 },
    { label: 'C', tier: 'VIP', price: showData.prices?.VIP || 500, seatsCount: 14 },
    { label: 'D', tier: 'VIP', price: showData.prices?.VIP || 500, seatsCount: 14 },
    { label: 'E', tier: 'Premium', price: showData.prices?.Premium || 420, seatsCount: 16 },
    { label: 'F', tier: 'Premium', price: showData.prices?.Premium || 420, seatsCount: 16 },
    { label: 'G', tier: 'Normal', price: showData.prices?.Normal || 300, seatsCount: 16 },
  ];

  const handleToggleSeat = (seatId) => {
    if (showData.bookedSeats?.includes(seatId) || showData.blockedSeats?.includes(seatId)) return;

    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seatId));
    } else {
      if (selectedSeats.length >= 10) {
        alert("Maximum 10 seats allowed per booking transaction.");
        return;
      }
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const { base, total } = calculateTotal();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-screen">
      
      {/* NAVIGATION & TOP INFO */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Movie Details
        </button>

        <div className="text-right sm:text-left">
          <h1 className="font-serif text-2xl font-bold text-white">{showData.movie?.title || "Movie Selection"}</h1>
          <p className="text-xs text-slate-400">{showData.theatreName} • {showData.screenName} • {showData.time}</p>
        </div>
      </div>

      {/* CURVED REALISTIC SCREEN INDICATOR */}
      <div className="space-y-3 pt-4">
        <div className="relative w-full max-w-3xl mx-auto h-12 flex flex-col items-center justify-center">
          <div className="w-full h-3 bg-gradient-to-r from-transparent via-cyan-400 to-transparent rounded-full shadow-[0_15px_30px_rgba(0,242,254,0.6)]" />
          <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-cyan-300 mt-2">
            Screen This Way
          </span>
        </div>
      </div>

      {/* SEAT LEGEND */}
      <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-300 py-2 border-y border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg glass-panel border border-white/20" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-cyan-400 text-black font-bold flex items-center justify-center glow-cyan">
            ✓
          </div>
          <span className="text-cyan-300 font-semibold">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-slate-700 opacity-60 cursor-not-allowed" />
          <span className="text-slate-500">Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-red-950 border border-red-500/40 text-red-400 text-[10px] flex items-center justify-center">
            ✕
          </div>
          <span className="text-red-400">Blocked by Admin</span>
        </div>
      </div>

      {/* INTERACTIVE SEAT GRID */}
      <div className="overflow-x-auto py-6">
        <div className="min-w-[650px] max-w-4xl mx-auto space-y-4">
          {rows.map((row) => (
            <div key={row.label} className="space-y-1">
              <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-between px-2">
                <span>{row.tier} Class — ₹{row.price}</span>
                <span>Row {row.label}</span>
              </div>

              <div className="flex items-center justify-center gap-2">
                <span className="w-6 text-center text-xs font-bold text-slate-400">{row.label}</span>

                <div className="flex gap-2">
                  {Array.from({ length: row.seatsCount }, (_, i) => {
                    const seatNum = i + 1;
                    const seatId = `${row.label}${seatNum}`;
                    const isBooked = showData.bookedSeats?.includes(seatId);
                    const isBlocked = showData.blockedSeats?.includes(seatId);
                    const isSelected = selectedSeats.includes(seatId);

                    return (
                      <button
                        key={seatId}
                        disabled={isBooked || isBlocked}
                        onClick={() => handleToggleSeat(seatId)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                          isSelected
                            ? 'bg-cyan-400 text-black border-cyan-300 glow-cyan scale-110'
                            : isBooked
                            ? 'bg-slate-800 text-slate-600 border border-slate-700 cursor-not-allowed'
                            : isBlocked
                            ? 'bg-red-950/60 text-red-400 border border-red-500/40 cursor-not-allowed'
                            : 'glass-panel text-slate-300 hover:border-cyan-400 hover:text-white'
                        }`}
                      >
                        {seatNum}
                      </button>
                    );
                  })}
                </div>

                <span className="w-6 text-center text-xs font-bold text-slate-400">{row.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SELECTION DRAWER SUMMARY & CHECKOUT TRIGGER */}
      <div className="sticky bottom-4 z-40 max-w-3xl mx-auto p-4 sm:p-6 rounded-3xl glass-panel border-cyan-500/40 shadow-2xl bg-[#0c0d14]/90 backdrop-blur-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="text-xs text-slate-400">
            Selected Seats ({selectedSeats.length}):
          </p>
          <p className="font-mono text-sm font-bold text-cyan-300 truncate max-w-md">
            {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None selected'}
          </p>
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Total Price</span>
            <span className="text-xl font-bold text-white">₹{total}</span>
          </div>

          <button
            disabled={selectedSeats.length === 0}
            onClick={() => navigate('/checkout')}
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-cyan-400 to-indigo-600 text-black font-bold text-sm hover:brightness-110 transition-all glow-cyan disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex items-center gap-2"
          >
            <span>Proceed to Checkout</span>
            <Ticket className="w-4 h-4 text-black stroke-[2.5]" />
          </button>
        </div>
      </div>

    </div>
  );
}
