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
    <div className="min-h-screen bg-[#FFFFFF] text-slate-900 pt-6 sm:pt-8 pb-20 font-sans">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="text-center sm:text-left flex-grow">
            <h1 className="text-2xl sm:text-4xl font-bold font-sans text-slate-900 mb-1">Corporate Booking & Hall Rentals</h1>
            <p className="text-xs text-[#D90000] font-semibold">Private screenings, product launches, corporate townhalls, and VIP bulk bookings</p>
          </div>

          {/* Mobile Three-Dot / Filter Drawer Button */}
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="md:hidden p-2.5 rounded-full bg-[#D90000] text-white flex items-center justify-center shrink-0 cursor-pointer shadow-md"
            title="Select Corporate Package"
          >
            <MoreVertical className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Desktop Package Selector */}
        <div className="hidden md:flex gap-3 mb-6">
          {eventPackages.map(pkg => (
            <button
              key={pkg.title}
              type="button"
              onClick={() => setEventType(pkg.title)}
              className={`flex-1 p-3.5 rounded-2xl border text-xs font-bold transition-all cursor-pointer text-left ${
                eventType === pkg.title
                  ? 'bg-[#D90000] text-white border-[#D90000] shadow-md scale-105 font-black'
                  : 'bg-[#2B2B2B] hover:bg-[#4A4A4A] border border-slate-700 text-white'
              }`}
            >
              <div className="font-extrabold text-sm">{pkg.title}</div>
              <div className="text-[11px] opacity-90 mt-1">₹{pkg.costPerSeat} / head</div>
            </button>
          ))}
        </div>

        {/* Estimate Calculator Card */}
        <div className="bg-[#DBCEA5] p-6 rounded-3xl border border-[#c5ba92] mb-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md text-[#1A1A1A]">
          <div>
            <div className="text-xs font-black text-[#D90000] uppercase tracking-wider mb-1">Instant Cost Estimator</div>
            <h3 className="text-2xl font-bold font-serif text-[#1A1A1A]">{currentPackage.title}</h3>
            <p className="text-xs text-slate-800 font-medium mt-1">{currentPackage.desc}</p>
          </div>

          <div className="text-center md:text-right shrink-0">
            <div className="text-xs text-slate-700 font-medium">Estimated Package Price</div>
            <div className="text-3xl font-extrabold font-serif text-[#D90000]">₹{estimatedTotal.toLocaleString()}</div>
            <div className="text-[10px] text-[#1A1A1A] font-bold">({attendees} Seats @ ₹{currentPackage.costPerSeat}/head)</div>
          </div>
        </div>

        {/* Inquiry Form */}
        <form onSubmit={handleSubmit} className="bg-[#DBCEA5] p-6 rounded-3xl border border-[#c5ba92] space-y-5 shadow-md text-[#1A1A1A]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-[#1A1A1A] uppercase tracking-widest mb-2">COMPANY NAME</label>
              <input type="text" required placeholder="Acme Tech Solutions" className="w-full p-3 rounded-2xl bg-[#FFFFFF] text-[#1A1A1A] placeholder-[#666666] border border-slate-400 text-xs font-semibold focus:outline-none focus:border-[#D90000] shadow-inner" />
            </div>

            <div>
              <label className="block text-xs font-black text-[#1A1A1A] uppercase tracking-widest mb-2">CONTACT PERSON EMAIL</label>
              <input type="email" required placeholder="events@acme.com" className="w-full p-3 rounded-2xl bg-[#FFFFFF] text-[#1A1A1A] placeholder-[#666666] border border-slate-400 text-xs font-semibold focus:outline-none focus:border-[#D90000] shadow-inner" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-[#1A1A1A] uppercase tracking-widest mb-2">NUMBER OF GUEST ATTENDEES ({attendees} GUESTS)</label>
            <input
              type="range"
              min={20}
              max={300}
              step={10}
              value={attendees}
              onChange={(e) => setAttendees(Number(e.target.value))}
              className="w-full accent-[#D90000] cursor-pointer"
            />
          </div>

          <button type="submit" className="w-full py-3.5 rounded-2xl bg-[#D90000] hover:bg-[#b00000] text-white font-extrabold text-xs shadow-lg cursor-pointer transition-all">
            Submit {currentPackage.title} Inquiry
          </button>

          {submitted && (
            <div className="p-3 rounded-2xl bg-[#66DD6A]/30 border border-[#66DD6A] text-slate-900 font-bold text-xs text-center flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#66DD6A]" />
              <span>Inquiry received! Our VIP Concierge will reach out within 2 hours.</span>
            </div>
          )}
        </form>

        {/* Mobile Slide-Out Filter Drawer Modal */}
        {isMobileFilterOpen && (
          <div className="fixed top-[90px] bottom-0 left-0 right-0 z-[150] md:hidden flex justify-end bg-black/70 backdrop-blur-md animate-fade-in">
            {/* Backdrop click dismiss */}
            <div className="absolute inset-0" onClick={() => setIsMobileFilterOpen(false)}></div>

            <div className="relative w-5/6 max-w-xs h-full bg-[#DBCEA5] border-l border-[#c5ba92] p-5 shadow-2xl flex flex-col justify-between overflow-y-auto z-[160] animate-slide-left text-slate-900">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-[#c5ba92] mb-6">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-5 h-5 text-[#D90000]" />
                    <span className="text-sm font-bold uppercase tracking-wider text-slate-900">Corporate Package</span>
                  </div>
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="p-2.5 rounded-full bg-[#D90000] text-white hover:bg-[#b00000] transition-all cursor-pointer shadow-lg flex items-center justify-center shrink-0"
                    title="Close Filters"
                    aria-label="Close Filters"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-[#D90000] uppercase tracking-widest mb-2.5">Select Event Package</h4>
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
                            ? 'bg-[#D90000] text-white shadow-md'
                            : 'bg-white border border-slate-300 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-sm">{pkg.title}</span>
                          {eventType === pkg.title && <Check className="w-4 h-4" />}
                        </div>
                        <span className="text-[11px] opacity-80 mt-1">₹{pkg.costPerSeat} / head</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-[#c5ba92] mb-6">
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-full py-3 rounded-2xl bg-[#D90000] hover:bg-[#b00000] text-white font-extrabold text-xs shadow-lg cursor-pointer"
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
