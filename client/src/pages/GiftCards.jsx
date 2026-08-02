import React, { useState } from 'react';
import { Gift, CheckCircle2, MoreVertical, SlidersHorizontal, X, Check } from 'lucide-react';

export const GiftCards = () => {
  const [giftAmount, setGiftAmount] = useState(1000);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [purchased, setPurchased] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const cardThemes = [
    { name: 'Cinema Lover Gold', color: 'from-amber-600 via-amber-400 to-amber-200' },
    { name: 'Birthday Premiere', color: 'from-purple-600 via-pink-500 to-amber-300' },
    { name: 'Anniversary VIP', color: 'from-rose-600 via-rose-400 to-amber-200' }
  ];

  const [selectedTheme, setSelectedTheme] = useState(cardThemes[0]);

  const handlePurchase = (e) => {
    e.preventDefault();
    if (!recipientEmail) return;
    setPurchased(true);
    setTimeout(() => setPurchased(false), 5000);
  };

  return (
    <div className="min-h-screen bg-[#050508]/90 text-slate-900 dark:text-white pt-6 sm:pt-8 pb-20 font-sans">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="text-center sm:text-left flex-grow">
            <h1 className="text-2xl sm:text-4xl font-bold font-sans text-slate-900 dark:text-white mb-1">PrimeShow Digital E-Gift Cards</h1>
            <p className="text-xs text-amber-600 dark:text-amber-300 font-semibold">Gift ultra-luxury movie screenings & gourmet dining experiences</p>
          </div>

          {/* Mobile Three-Dot / Filter Drawer Button */}
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="md:hidden p-2.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 cursor-pointer"
            title="Customise Gift Card"
          >
            <MoreVertical className="w-5 h-5 text-amber-400" />
          </button>
        </div>

        {/* E-Gift Card Preview */}
        <div className={`w-full max-w-md mx-auto aspect-[1.58/1] rounded-3xl p-6 bg-gradient-to-tr ${selectedTheme.color} text-black font-sans shadow-2xl relative overflow-hidden mb-8`}>
          <div className="flex justify-between items-start">
            <span className="font-serif font-black text-2xl">PrimeShow</span>
            <span className="font-bold text-xs uppercase tracking-wider">E-GIFT CARD</span>
          </div>
          <div className="mt-12">
            <span className="text-3xl font-extrabold font-serif">₹{giftAmount}</span>
            <p className="text-[10px] font-bold uppercase mt-1 tracking-widest">{selectedTheme.name}</p>
          </div>
          <div className="absolute bottom-4 right-4 text-[9px] font-bold uppercase tracking-wider">VALID AT ALL MULTIPLEXES</div>
        </div>

        {/* Desktop Theme & Amount Controls (Hidden on Mobile < 768px in favor of drawer) */}
        <form onSubmit={handlePurchase} className="glass-panel p-6 rounded-3xl border border-slate-300 dark:border-white/10 space-y-6 shadow-xl">
          
          <div className="hidden md:block space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-900 dark:text-white mb-2">Select Theme Design</label>
              <div className="grid grid-cols-3 gap-3">
                {cardThemes.map((th) => (
                  <button
                    type="button"
                    key={th.name}
                    onClick={() => setSelectedTheme(th)}
                    className={`p-3 rounded-2xl border text-xs font-bold text-black bg-gradient-to-r ${th.color} cursor-pointer transition-all ${selectedTheme.name === th.name ? 'ring-4 ring-amber-400 shadow-lg' : 'opacity-80 hover:opacity-100'}`}
                  >
                    {th.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 dark:text-white mb-2">Gift Amount (₹)</label>
              <div className="grid grid-cols-4 gap-3">
                {[500, 1000, 2500, 5000].map(amt => (
                  <button
                    type="button"
                    key={amt}
                    onClick={() => setGiftAmount(amt)}
                    className={`py-2.5 rounded-2xl text-xs font-extrabold border cursor-pointer transition-all ${giftAmount === amt ? 'bg-amber-500 text-black border-amber-400 shadow-md' : 'bg-slate-100 dark:bg-white/5 border-slate-300 dark:border-white/10 text-slate-700 dark:text-white'}`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-900 dark:text-white mb-2">Recipient Email Address</label>
            <input
              type="email"
              required
              placeholder="friend@example.com"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              className="w-full p-3 rounded-2xl glass-input text-xs text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-white/40"
            />
          </div>

          <button type="submit" className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:brightness-110 text-black font-extrabold text-xs shadow-lg shadow-amber-500/20 cursor-pointer">
            Purchase Gift Card (₹{giftAmount})
          </button>

          {purchased && (
            <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-600 dark:text-emerald-300 text-xs text-center flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Gift card sent successfully to {recipientEmail}!</span>
            </div>
          )}
        </form>

        {/* Mobile Slide-Out Filter Drawer Modal (Strictly Positioned BELOW Fixed Navbars: top-[90px]) */}
        {isMobileFilterOpen && (
          <div className="fixed top-[90px] bottom-0 left-0 right-0 z-[150] md:hidden flex justify-end bg-black/80 backdrop-blur-md animate-fade-in">
            {/* Backdrop click dismiss */}
            <div className="absolute inset-0" onClick={() => setIsMobileFilterOpen(false)}></div>

            <div className="relative w-5/6 max-w-xs h-full bg-[#0D0F14] border-l border-white/15 p-5 shadow-2xl flex flex-col justify-between overflow-y-auto z-[160] animate-slide-left">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-5 h-5 text-amber-400" />
                    <span className="text-sm font-bold uppercase tracking-wider text-amber-400">Gift Card Options</span>
                  </div>
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="p-2.5 rounded-full bg-white/15 text-white hover:bg-rose-500/30 hover:text-rose-400 transition-all cursor-pointer shadow-lg flex items-center justify-center shrink-0"
                    title="Close Filters"
                    aria-label="Close Filters"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Theme Selector */}
                  <div>
                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2.5">Card Theme</h4>
                    <div className="space-y-2">
                      {cardThemes.map(th => (
                        <button
                          key={th.name}
                          onClick={() => setSelectedTheme(th)}
                          className={`w-full text-left p-3 rounded-2xl text-xs font-bold transition-all cursor-pointer text-black bg-gradient-to-r ${th.color} flex items-center justify-between ${
                            selectedTheme.name === th.name ? 'ring-4 ring-amber-400' : 'opacity-80'
                          }`}
                        >
                          <span>{th.name}</span>
                          {selectedTheme.name === th.name && <Check className="w-4 h-4 text-black" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Amount Selector */}
                  <div>
                    <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-2.5">Gift Amount</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {[500, 1000, 2500, 5000].map(amt => (
                        <button
                          key={amt}
                          onClick={() => setGiftAmount(amt)}
                          className={`p-3 rounded-2xl text-xs font-extrabold border transition-all cursor-pointer ${
                            giftAmount === amt
                              ? 'bg-amber-500 text-black border-amber-400 shadow-md'
                              : 'bg-white/5 border-white/10 text-white/80'
                          }`}
                        >
                          ₹{amt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 mb-6">
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 text-black font-extrabold text-xs shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  Apply Settings (₹{giftAmount})
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
