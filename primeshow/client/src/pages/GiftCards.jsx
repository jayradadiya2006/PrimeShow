import React, { useState } from 'react';
import { Gift, CheckCircle2 } from 'lucide-react';

export const GiftCards = () => {
  const [giftAmount, setGiftAmount] = useState(1000);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [purchased, setPurchased] = useState(false);

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
    <div className="min-h-screen bg-[#050508] text-white pt-8 pb-20">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold font-serif text-white mb-2">PrimeShow Digital E-Gift Cards</h1>
          <p className="text-xs text-amber-300">Gift ultra-luxury movie screenings & gourmet dining experiences</p>
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

        {/* Purchase Form */}
        <form onSubmit={handlePurchase} className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
          <div>
            <label className="block text-xs font-bold text-white mb-2">Select Theme Design</label>
            <div className="grid grid-cols-3 gap-2">
              {cardThemes.map((th) => (
                <button
                  type="button"
                  key={th.name}
                  onClick={() => setSelectedTheme(th)}
                  className={`p-3 rounded-xl border text-xs font-bold text-black bg-gradient-to-r ${th.color} ${selectedTheme.name === th.name ? 'ring-2 ring-amber-400' : ''}`}
                >
                  {th.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-white mb-2">Gift Amount (₹)</label>
            <div className="grid grid-cols-4 gap-2">
              {[500, 1000, 2500, 5000].map(amt => (
                <button
                  type="button"
                  key={amt}
                  onClick={() => setGiftAmount(amt)}
                  className={`py-2 rounded-xl text-xs font-bold border ${giftAmount === amt ? 'bg-amber-500 text-black border-amber-400' : 'bg-white/5 border-white/10 text-white'}`}
                >
                  ₹{amt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-white mb-2">Recipient Email Address</label>
            <input
              type="email"
              required
              placeholder="friend@example.com"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              className="w-full p-3 rounded-xl glass-input text-xs text-white"
            />
          </div>

          <button type="submit" className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs">
            Purchase Gift Card (₹{giftAmount})
          </button>

          {purchased && (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs text-center flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Gift card sent successfully to {recipientEmail}!</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
