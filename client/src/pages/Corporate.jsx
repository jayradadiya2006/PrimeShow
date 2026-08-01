import React, { useState } from 'react';
import { Building2, CheckCircle2, Calculator } from 'lucide-react';

export const Corporate = () => {
  const [attendees, setAttendees] = useState(50);
  const [submitted, setSubmitted] = useState(false);

  const costPerSeat = 650;
  const estimatedTotal = attendees * costPerSeat;

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="min-h-screen bg-[#050508] text-white pt-8 pb-20">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold font-serif text-white mb-2">Corporate Booking & Hall Rentals</h1>
          <p className="text-xs text-amber-300">Private screenings, product launches, corporate townhalls, and VIP bulk bookings</p>
        </div>

        {/* Estimate Calculator Card */}
        <div className="glass-panel-gold p-6 rounded-3xl border border-amber-400/40 mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">Instant Instant Cost Estimator</div>
            <h3 className="text-2xl font-bold font-serif text-white">Private Screening Hall</h3>
            <p className="text-xs text-white/70">Includes VIP Recliner seating, welcome mocktails, and customized gourmet snacks.</p>
          </div>

          <div className="text-right">
            <div className="text-xs text-white/50">Estimated Package Price</div>
            <div className="text-3xl font-extrabold font-serif text-amber-400">₹{estimatedTotal.toLocaleString()}</div>
            <div className="text-[10px] text-amber-200">({attendees} Seats @ ₹650/head)</div>
          </div>
        </div>

        {/* Inquiry Form */}
        <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-white mb-2">Company Name</label>
              <input type="text" required placeholder="Acme Tech Solutions" className="w-full p-3 rounded-xl glass-input text-xs text-white" />
            </div>

            <div>
              <label className="block text-xs font-bold text-white mb-2">Contact Person Email</label>
              <input type="email" required placeholder="events@acme.com" className="w-full p-3 rounded-xl glass-input text-xs text-white" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-white mb-2">Number of Guest Attendees ({attendees})</label>
            <input
              type="range"
              min={20}
              max={300}
              step={10}
              value={attendees}
              onChange={(e) => setAttendees(Number(e.target.value))}
              className="w-full accent-amber-400"
            />
          </div>

          <button type="submit" className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs">
            Submit Private Screening Inquiry
          </button>

          {submitted && (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs text-center flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Inquiry received! Our VIP Concierge will reach out within 2 hours.</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
