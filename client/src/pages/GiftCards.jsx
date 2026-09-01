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
    <div className="min-h-screen bg-[#FFFFFF] text-slate-900 pt-6 sm:pt-8 pb-20 font-sans">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="text-center sm:text-left flex-grow">
            <h1 className="text-2xl sm:text-4xl font-bold font-sans text-slate-900 mb-1">PrimeShow Digital E-Gift Cards</h1>
            <p className="text-xs text-[#D90000] font-semibold">Gift ultra-luxury movie screenings & gourmet dining experiences</p>
          </div>

          {/* Mobile Three-Dot / Filter Drawer Button */}
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="md:hidden p-2.5 rounded-full bg-[#D90000] text-white flex items-center justify-center shrink-0 cursor-pointer shadow-md"
            title="Customise Gift Card"
          >
            <MoreVertical className="w-5 h-5 text-white" />
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

        {/* Desktop Theme & Amount Controls */}
        <form onSubmit={handlePurchase} className="bg-[#DBCEA5] p-6 rounded-3xl border border-[#c5ba92] space-y-6 shadow-md text-slate-900">
          
          <div className="hidden md:block space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-2">Select Theme Design</label>
              <div className="grid grid-cols-3 gap-3">
                {cardThemes.map((th) => (
                  <button
                    type="button"
                    key={th.name}
                    onClick={() => setSelectedTheme(th)}
                    className={`p-3 rounded-2xl border text-xs font-bold text-black bg-gradient-to-r ${th.color} cursor-pointer transition-all ${selectedTheme.name === th.name ? 'ring-4 ring-[#D90000] shadow-lg' : 'opacity-80 hover:opacity-100'}`}
                  >
                    {th.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 mb-2">Gift Amount (₹)</label>
              <div className="grid grid-cols-4 gap-3">
                {[500, 1000, 2500, 5000].map(amt => (
                  <button
                    type="button"
                    key={amt}
                    onClick={() => setGiftAmount(amt)}
                    className={`py-2.5 rounded-2xl text-xs font-extrabold border cursor-pointer transition-all ${giftAmount === amt ? 'bg-[#D90000] text-white border-[#D90000] shadow-md' : 'bg-white border-slate-300 text-slate-900 hover:bg-slate-100'}`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-900 mb-2">Recipient Email Address</label>
            <input
              type="email"
              required
              placeholder="friend@example.com"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              className="w-full p-3 rounded-2xl bg-white text-slate-900 placeholder-slate-500 border border-slate-300 text-xs font-semibold focus:outline-none shadow-inner"
            />
          </div>

          <button type="submit" className="w-full py-3.5 rounded-2xl bg-[#D90000] hover:bg-[#b00000] text-white font-extrabold text-xs shadow-lg cursor-pointer transition-all">
            Purchase Gift Card (₹{giftAmount})
          </button>

          {purchased && (
            <div className="p-3 rounded-2xl bg-[#66DD6A]/30 border border-[#66DD6A] text-slate-900 font-bold text-xs text-center flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#66DD6A]" />
              <span>Gift card sent successfully to {recipientEmail}!</span>
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
                    <span className="text-sm font-bold uppercase tracking-wider text-slate-900">Gift Card Options</span>
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

                <div className="space-y-6">
                  {/* Theme Selector */}
                  <div>
                    <h4 className="text-xs font-bold text-[#D90000] uppercase tracking-widest mb-2.5">Card Theme</h4>
                    <div className="space-y-2">
                      {cardThemes.map(th => (
                        <button
                          key={th.name}
                          onClick={() => setSelectedTheme(th)}
                          className={`w-full text-left p-3 rounded-2xl text-xs font-bold transition-all cursor-pointer text-black bg-gradient-to-r ${th.color} flex items-center justify-between ${
                            selectedTheme.name === th.name ? 'ring-4 ring-[#D90000]' : 'opacity-80'
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
                    <h4 className="text-xs font-bold text-[#D90000] uppercase tracking-widest mb-2.5">Gift Amount</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {[500, 1000, 2500, 5000].map(amt => (
                        <button
                          key={amt}
                          onClick={() => setGiftAmount(amt)}
                          className={`p-3 rounded-2xl text-xs font-extrabold border transition-all cursor-pointer ${
                            giftAmount === amt
                              ? 'bg-[#D90000] text-white border-[#D90000] shadow-md'
                              : 'bg-white border-slate-300 text-slate-800'
                          }`}
                        >
                          ₹{amt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-[#c5ba92] mb-6">
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-full py-3 rounded-2xl bg-[#D90000] hover:bg-[#b00000] text-white font-extrabold text-xs shadow-lg cursor-pointer"
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
