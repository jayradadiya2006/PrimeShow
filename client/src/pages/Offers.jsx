import React, { useState, useEffect, useRef } from 'react';
import { Tag, Copy, Check, ShieldCheck, Sparkles, RefreshCw, Search, X, MoreVertical, SlidersHorizontal, ArrowRight } from 'lucide-react';
import API, { API_BASE } from '../services/api';
import { OfferCarousel } from '../components/OfferCarousel';

export const Offers = ({ onSelectCategory }) => {
  const [offersList, setOffersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeBankFilter, setActiveBankFilter] = useState('All');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef(null);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const res = await API.get('/offers');
      setOffersList(res.data);
    } catch (err) {
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

  // Handle clicking outside of search dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 3000);
  };

  const bankTypes = ['All', ...new Set(offersList.map(o => o.bank || 'Bank Discount'))];

  const filteredOffers = offersList.filter(o => {
    const matchesBank = activeBankFilter === 'All' || (o.bank || 'Bank Discount') === activeBankFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
                          o.title?.toLowerCase().includes(q) || 
                          o.code?.toLowerCase().includes(q) || 
                          o.description?.toLowerCase().includes(q) ||
                          o.bank?.toLowerCase().includes(q);
    return matchesBank && matchesSearch;
  });

  const searchSuggestions = searchQuery.trim()
    ? offersList.filter(o => {
        const q = searchQuery.toLowerCase().trim();
        return o.title?.toLowerCase().includes(q) ||
               o.code?.toLowerCase().includes(q) ||
               o.bank?.toLowerCase().includes(q) ||
               o.description?.toLowerCase().includes(q);
      })
    : [];

  const handleSelectSuggestion = (offer) => {
    setIsSearchFocused(false);
    handleCopy(offer.code);
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-slate-900 pt-6 sm:pt-8 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-[#D90000] text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4 text-[#D90000]" />
              <span>Exclusive Discounts & Vouchers</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold font-sans text-slate-900 mb-1">PrimeShow Offers & Promos</h1>
            <p className="text-xs text-[#D90000] font-semibold">Live animated banner deals and instant bank cashbacks</p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Search Bar + Dynamic Dropdown */}
            <div className="relative flex-grow sm:w-72" ref={searchContainerRef}>
              <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search promo codes..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchFocused(true);
                }}
                onFocus={() => setIsSearchFocused(true)}
                className="w-full pl-9 pr-8 py-2 rounded-full bg-white text-slate-900 placeholder-slate-500 border border-slate-300 text-xs font-semibold focus:outline-none shadow-inner"
              />
              {searchQuery && (
                <button onClick={() => { setSearchQuery(''); setIsSearchFocused(false); }} className="absolute right-3 top-2.5 text-slate-400">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Auto-Complete Search Dropdown */}
              {isSearchFocused && searchQuery.trim() !== '' && (
                <div className="absolute top-full left-0 right-0 z-[200] mt-2 rounded-2xl bg-white border border-[#c5ba92] p-2 shadow-2xl space-y-1 max-h-72 overflow-y-auto animate-fade-in text-slate-900">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#D90000] border-b border-slate-200 flex items-center justify-between">
                    <span>Matching Promos</span>
                    <span>{searchSuggestions.length} found</span>
                  </div>

                  {searchSuggestions.length > 0 ? (
                    searchSuggestions.map(offer => (
                      <button
                        key={offer.id}
                        onClick={() => handleSelectSuggestion(offer)}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-[#DBCEA5]/40 border border-transparent flex items-center justify-between gap-3 group transition-all cursor-pointer"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-[#D90000]">{offer.code}</span>
                            <span className="text-[10px] text-slate-600">{offer.bank}</span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#D90000] transition-colors line-clamp-1 mt-0.5">{offer.title}</h4>
                        </div>
                        <div className="text-[10px] font-bold text-[#D90000] shrink-0">Click to Copy</div>
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-500">
                      No promos found matching "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Three-Dot / Filter Drawer Button */}
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="md:hidden p-2 rounded-full bg-[#D90000] text-white flex items-center justify-center shrink-0 cursor-pointer shadow-md"
              title="Filter Offers"
            >
              <MoreVertical className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* 1. Animated Offer Slide Show Carousel */}
        <OfferCarousel onSelectCategory={onSelectCategory} />

        {/* Desktop Bank Filter Pills */}
        <div className="hidden md:flex overflow-x-auto gap-2 my-6 text-xs font-semibold scrollbar-none">
          {bankTypes.map(bank => (
            <button
              key={bank}
              onClick={() => setActiveBankFilter(bank)}
              className={`px-4 py-2 rounded-full transition-all cursor-pointer shrink-0 ${
                activeBankFilter === bank
                  ? 'bg-[#D90000] text-white font-extrabold shadow-md'
                  : 'bg-[#DBCEA5] hover:bg-[#caba8e] text-slate-900 border border-[#c5ba92]'
              }`}
            >
              {bank}
            </button>
          ))}
        </div>

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
                    <span className="text-sm font-bold uppercase tracking-wider text-slate-900">Offer Category</span>
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
                  <h4 className="text-xs font-bold text-[#D90000] uppercase tracking-widest mb-2.5">Select Bank / Voucher Type</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {bankTypes.map(bank => (
                      <button
                        key={bank}
                        onClick={() => {
                          setActiveBankFilter(bank);
                          setIsMobileFilterOpen(false);
                        }}
                        className={`w-full text-left p-3 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                          activeBankFilter === bank
                            ? 'bg-[#D90000] text-white shadow-md'
                            : 'bg-white border border-slate-300 text-slate-800'
                        }`}
                      >
                        <span>{bank}</span>
                        {activeBankFilter === bank && <Check className="w-4 h-4" />}
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
                  Apply Filter ({filteredOffers.length} Promos)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Section Divider */}
        <div className="flex items-center gap-3 my-8">
          <Tag className="w-4 h-4 text-[#D90000]" />
          <h2 className="text-xl font-bold font-sans text-slate-900">Partner Bank & Payment Vouchers</h2>
          <div className="flex-1 h-[1px] bg-[#c5ba92]"></div>
        </div>

        {/* 2. Static/Grid Bank Offers Section */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 rounded-full border-4 border-[#D90000] border-t-transparent animate-spin mx-auto mb-2"></div>
            <p className="text-xs text-slate-600">Syncing live promo codes...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOffers.map((offer) => (
              <div 
                key={offer.id}
                className="bg-[#DBCEA5] p-6 rounded-3xl border border-[#c5ba92] hover:border-[#D90000] transition-all flex flex-col justify-between space-y-4 group shadow-md text-slate-900"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-3 py-1 rounded-full bg-white text-slate-900 font-bold text-[10px] uppercase border border-slate-300">
                      {offer.bank || 'Bank Discount'}
                    </span>
                    <span className="text-[10px] text-slate-700 font-mono">
                      Expires: {offer.expiryDate || '2026-12-31'}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#D90000] transition-colors leading-snug">
                    {offer.title}
                  </h3>

                  <p className="text-xs text-slate-800 mt-2 leading-relaxed">
                    {offer.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#c5ba92] flex items-center justify-between gap-2">
                  <div className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 font-mono font-bold text-xs text-[#D90000] tracking-wider">
                    {offer.code}
                  </div>

                  <button
                    onClick={() => handleCopy(offer.code)}
                    className="px-4 py-2 rounded-xl bg-[#D90000] hover:bg-[#b00000] text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedCode === offer.code ? (
                      <>
                        <Check className="w-4 h-4 text-white" />
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
