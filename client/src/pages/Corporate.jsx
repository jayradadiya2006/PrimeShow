import React, { useState } from 'react';
import { Building2, CheckCircle2, Calculator, MoreVertical, SlidersHorizontal, X, Check } from 'lucide-react';

export const Corporate = () => {
  const [attendees, setAttendees] = useState(50);
  const [submitted, setSubmitted] = useState(false);
  const [eventType, setEventType] = useState('Private Screening');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const eventPackages = [
    { title: 'Private Screening', costPerSeat: 650, desc: 'VIP Recliner seating, welcome mocktails, and gourmet snacks.' },
    { title: 'Corporate Townhall', costPerSeat: 850, desc: 'IMAX projection, podium audio system, and buffet lunch.' },
    { title: 'Product Launch Premiere', costPerSeat: 1200, desc: 'Red carpet entry, live streaming equipment, and luxury hampers.' }
  ];

  const currentPackage = eventPackages.find(p => p.title === eventType) || eventPackages[0];
  const estimatedTotal = attendees * currentPackage.costPerSeat;

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="min-h-screen bg-[#050508]/90 text-slate-900 dark:text-white pt-6 sm:pt-8 pb-20 font-sans">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="text-center sm:text-left flex-grow">
            <h1 className="text-2xl sm:text-4xl font-bold font-sans text-slate-900 dark:text-white mb-1">Corporate Booking & Hall Rentals</h1>
            <p className="text-xs text-amber-600 dark:text-amber-300 font-semibold">Private screenings, product launches, corporate townhalls, and VIP bulk bookings</p>
          </div>

          {/* Mobile Three-Dot / Filter Drawer Button */}
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="md:hidden p-2.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 cursor-pointer"
            title="Select Corporate Package"
          >
            <MoreVertical className="w-5 h-5 text-amber-400" />
          </button>
        </div>

        {/* Desktop Package Selector (Hidden on mobile < 768px in favor of drawer) */}
        <div className="hidden md:flex gap-3 mb-6">
          {eventPackages.map(pkg => (
            <button
              key={pkg.title}
              type="button"
              onClick={() => setEventType(pkg.title)}
              className={`flex-1 p-3.5 rounded-2xl border text-xs font-bold transition-all cursor-pointer text-left ${
                eventType === pkg.title
                  ? 'bg-amber-500 text-black border-amber-400 shadow-lg shadow-amber-500/20'
                  : 'bg-slate-200/60 dark:bg-white/5 border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-white/10'
              }`}
            >
              <div className="font-extrabold text-sm">{pkg.title}</div>
              <div className="text-[11px] opacity-80 mt-1">₹{pkg.costPerSeat} / head</div>
            </button>
          ))}
        </div>

        {/* Estimate Calculator Card */}
        <div className="glass-panel-gold p-6 rounded-3xl border border-amber-400/40 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div>
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">Instant Cost Estimator</div>
            <h3 className="text-2xl font-bold font-serif text-white">{currentPackage.title}</h3>
            <p className="text-xs text-white/70 mt-1">{currentPackage.desc}</p>
          </div>

          <div className="text-center md:text-right shrink-0">
            <div className="text-xs text-white/50">Estimated Package Price</div>
            <div className="text-3xl font-extrabold font-serif text-amber-400">₹{estimatedTotal.toLocaleString()}</div>
            <div className="text-[10px] text-amber-200">({attendees} Seats @ ₹{currentPackage.costPerSeat}/head)</div>
          </div>
        </div>

        {/* Inquiry Form */}
        <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-3xl border border-slate-300 dark:border-white/10 space-y-5 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-900 dark:text-white mb-2">Company Name</label>
              <input type="text" required placeholder="Acme Tech Solutions" className="w-full p-3 rounded-2xl glass-input text-xs text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-white/40" />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 dark:text-white mb-2">Contact Person Email</label>
              <input type="email" required placeholder="events@acme.com" className="w-full p-3 rounded-2xl glass-input text-xs text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-white/40" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-900 dark:text-white mb-2">Number of Guest Attendees ({attendees} Guests)</label>
            <input
              type="range"
              min={20}
              max={300}
              step={10}
              value={attendees}
              onChange={(e) => setAttendees(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          <button type="submit" className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:brightness-110 text-black font-extrabold text-xs shadow-lg shadow-amber-500/20 cursor-pointer">
            Submit {currentPackage.title} Inquiry
          </button>

          {submitted && (
            <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-600 dark:text-emerald-300 text-xs text-center flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Inquiry received! Our VIP Concierge will reach out within 2 hours.</span>
            </div>
          )}
        </form>

        {/* Mobile Slide-Out Filter Drawer Modal (Priority z-[99999] Top Overlay) */}
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-[99999] md:hidden flex justify-end bg-black/80 backdrop-blur-md animate-fade-in">
            {/* Backdrop click dismiss */}
            <div className="absolute inset-0" onClick={() => setIsMobileFilterOpen(false)}></div>

            <div className="relative w-5/6 max-w-xs h-full bg-[#0D0F14] border-l border-white/15 p-5 shadow-2xl flex flex-col justify-between overflow-y-auto z-[100000] animate-slide-left">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6 pt-2">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-5 h-5 text-amber-400" />
                    <span className="text-sm font-bold uppercase tracking-wider text-amber-400">Corporate Package</span>
                  </div>
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="p-2.5 rounded-full bg-white/15 text-white hover:bg-rose-500/30 hover:text-rose-400 transition-all cursor-pointer shadow-lg flex items-center justify-center shrink-0"
                    title="Close Filters"
                    aria-label="Close Filters"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2.5">Select Event Package</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {eventPackages.map(pkg => (
                      <button
                        key={pkg.title}
                        onClick={() => {
                          setEventType(pkg.title);
                          setIsMobileFilterOpen(false);
                        }}
                        className={`w-full text-left p-3.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex flex-col justify-between ${
                          eventType === pkg.title
                            ? 'bg-amber-500 text-black shadow-md'
                            : 'bg-white/5 border border-white/10 text-white/80 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-sm">{pkg.title}</span>
                          {eventType === pkg.title && <Check className="w-4 h-4" />}
                        </div>
                        <span className="text-[11px] opacity-70 mt-1">₹{pkg.costPerSeat} / head</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 mb-4">
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 text-black font-extrabold text-xs shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  Apply {currentPackage.title}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
