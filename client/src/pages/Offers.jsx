import React, { useState, useEffect } from 'react';
import { Tag, Copy, Check, ShieldCheck, Sparkles, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { OfferCarousel } from '../components/OfferCarousel';

const API_BASE = 'http://localhost:5000/api';

export const Offers = ({ onSelectCategory }) => {
  const [offersList, setOffersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(null);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/offers`);
      setOffersList(res.data);
    } catch (err) {
      // Fallback local seed store if backend is offline
      setOffersList([
        {
          id: 'off_1',
          code: 'PRIMESHOW50',
          title: '50% Flat Discount on IMAX & VIP Bookings',
          description: 'Valid on all credit cards and UPI payments. Max discount ₹250.',
          bank: 'All Cards & UPI',
          expiryDate: '2026-12-31'
        },
        {
          id: 'off_2',
          code: 'LUXURY200',
          title: 'Flat ₹200 Cashback for HDFC Bank Cards',
          description: 'Min transaction value ₹800. Applicable twice per user account.',
          bank: 'HDFC Bank',
          expiryDate: '2026-11-30'
        },
        {
          id: 'off_3',
          code: 'ADMINVIP',
          title: 'Exclusive VIP Pass - Flat ₹500 Off',
          description: 'Special privilege code for PrimeShow Gold Club members.',
          bank: 'PrimeShow Exclusive',
          expiryDate: '2026-12-31'
        }
      ]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 3000);
  };

  return (
    <div className="min-h-screen bg-[#050508] text-white pt-8 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Exclusive Discounts & Vouchers</span>
            </div>
            <h1 className="text-4xl font-bold font-serif text-white">PrimeShow Offers & Promos</h1>
            <p className="text-xs text-amber-300">Live animated banner deals and instant bank cashbacks</p>
          </div>

          <button
            onClick={fetchOffers}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-bold text-amber-300 flex items-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Live Offers</span>
          </button>
        </div>

        {/* 1. Animated Offer Slide Show Carousel (Directly ABOVE Static Grid Offers) */}
        <OfferCarousel onSelectCategory={onSelectCategory} />

        {/* Section Divider */}
        <div className="flex items-center gap-3 my-8">
          <Tag className="w-4 h-4 text-amber-400" />
          <h2 className="text-xl font-bold font-serif text-white">Partner Bank & Payment Vouchers</h2>
          <div className="flex-1 h-[1px] bg-white/10"></div>
        </div>

        {/* 2. Existing Static/Grid Bank Offers Section */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 rounded-full border-4 border-amber-400 border-t-transparent animate-spin mx-auto mb-2"></div>
            <p className="text-xs text-white/50">Syncing live promo codes...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offersList.map((offer) => (
              <div 
                key={offer.id}
                className="glass-panel p-6 rounded-3xl border border-white/10 hover:border-amber-400/50 transition-all flex flex-col justify-between space-y-4 group shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 font-bold text-[10px] uppercase">
                      {offer.bank || 'Bank Discount'}
                    </span>
                    <span className="text-[10px] text-white/40 font-mono">
                      Expires: {offer.expiryDate || '2026-12-31'}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors leading-snug">
                    {offer.title}
                  </h3>

                  <p className="text-xs text-white/60 mt-2 leading-relaxed">
                    {offer.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-2">
                  <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 font-mono font-bold text-xs text-amber-400 tracking-wider">
                    {offer.code}
                  </div>

                  <button
                    onClick={() => handleCopy(offer.code)}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedCode === offer.code ? (
                      <>
                        <Check className="w-4 h-4 text-black" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
