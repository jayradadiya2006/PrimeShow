import React, { useState } from 'react';
import { 
  X, CheckCircle2, Tag, ShieldCheck, CreditCard, QrCode, Download, 
  Share2, Sparkles, ArrowRight, Wallet, Building, Copy, Check, Printer, Smartphone, AlertCircle, ChevronDown, ChevronUp
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { jsPDF } from 'jspdf';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';

export const CheckoutModal = ({ isOpen, onClose, onBookingSuccess }) => {
  const { user } = useAuth();
  const { activeBooking, applyCoupon, removeCoupon, confirmBooking } = useBooking();

  const [couponCode, setCouponCode] = useState('');
  const [couponStatus, setCouponStatus] = useState(null);
  const [isMovieInfoExpanded, setIsMovieInfoExpanded] = useState(false);
  
  // 4 Payment Gateway Tabs: 'UPI', 'NetBanking', 'Card', 'Wallet'
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  
  // Payment Form Fields
  const [upiVpa, setUpiVpa] = useState('user@okaxis');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [selectedWallet, setSelectedWallet] = useState('Paytm Wallet');
  const [cardNumber, setCardNumber] = useState('4532 8921 7739 1092');
  const [cardExp, setCardExp] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('892');
  const [cardName, setCardName] = useState(user?.name || 'Aarav Sharma');

  const [isCopiedUpi, setIsCopiedUpi] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [verificationStep, setVerificationStep] = useState('');
  const [completedTicket, setCompletedTicket] = useState(null);

  if (!isOpen || !activeBooking.movie) return null;

  const { movie, theatre, show, selectedSeats, selectedTier, appliedCoupon, discountAmount } = activeBooking;

  // Payee & Platform Identity Details
  const payeeName = 'PrimeShow Official Cinema Pass';
  const payeeUpiId = 'pay@primeshow';

  // Real-Time Price Calculations based on selected movie & seat tier
  const seatPrice = show.price || 480;
  const basePrice = selectedSeats.length * seatPrice;
  const convenienceFee = Math.round(basePrice * 0.08);
  const tax = Math.round(basePrice * 0.05);
  const grandTotal = Math.max(basePrice + convenienceFee + tax - (discountAmount || 0), 0);

  // Dynamic Standard UPI URL Schema
  const upiSchemaUrl = `upi://pay?pa=${payeeUpiId}&pn=${encodeURIComponent(payeeName)}&am=${grandTotal}&cu=INR`;

  const handleCopyUpiId = () => {
    navigator.clipboard.writeText(payeeUpiId);
    setIsCopiedUpi(true);
    setTimeout(() => setIsCopiedUpi(false), 2500);
  };

  const handleApplyCouponSubmit = async (e) => {
    e.preventDefault();
    if (!couponCode) return;
    setCouponStatus({ loading: true });
    const res = await applyCoupon(couponCode, basePrice, user?.id);
    if (res.success) {
      setCouponStatus({ success: true, msg: res.description });
    } else {
      setCouponStatus({ error: true, msg: res.error });
    }
  };

  const handlePayNow = async () => {
    setIsProcessing(true);
    setVerificationStep('Connecting to Secure Payment Gateway...');

    // Payment Verification Simulation
    setTimeout(() => {
      setVerificationStep(`Verifying NPCI UPI Settlement for ₹${grandTotal.toLocaleString('en-IN')}...`);
    }, 800);

    setTimeout(async () => {
      const ticket = await confirmBooking({
        movieId: movie.id,
        movieTitle: movie.title,
        poster: movie.poster,
        theatreName: theatre.name,
        screenName: show.screenName || 'Screen 1',
        showDate: show.date || '2026-07-28',
        showTime: show.time,
        seats: selectedSeats,
        tier: selectedTier,
        ticketCount: selectedSeats.length,
        basePrice,
        convenienceFee,
        tax,
        discount: discountAmount || 0,
        couponCode: appliedCoupon || '',
        totalAmount: grandTotal,
        paymentMethod: paymentMethod === 'UPI' ? `Dynamic UPI (${payeeUpiId})` :
                       paymentMethod === 'NetBanking' ? `NetBanking (${selectedBank})` :
                       paymentMethod === 'Wallet' ? `Wallet (${selectedWallet})` : 'Credit/Debit Card',
        userEmail: user?.email || 'user@primeshow.com',
        userName: user?.name || 'Aarav Sharma'
      });

      setIsProcessing(false);
      setVerificationStep('');
      setCompletedTicket(ticket);

      // Trigger Celebration
      confetti({
        particleCount: 140,
        spread: 85,
        origin: { y: 0.6 }
      });
    }, 1800);
  };

  const handleDownloadPDF = () => {
    if (!completedTicket) return;
    const doc = new jsPDF();
    doc.setFillColor(5, 5, 8);
    doc.rect(0, 0, 210, 297, 'F');
    doc.setTextColor(245, 158, 11);
    doc.setFont('sans', 'bold');
    doc.setFontSize(22);
    doc.text('PrimeShow Ultra Luxury Cinema Pass', 20, 30);
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text(`Booking ID: ${completedTicket.id}`, 20, 50);
    doc.text(`Transaction ID: ${completedTicket.transactionId || 'TXN-PAY-882910'}`, 20, 65);
    doc.text(`Movie Title: ${completedTicket.movieTitle}`, 20, 80);
    doc.text(`Multiplex: ${completedTicket.theatreName}`, 20, 95);
    doc.text(`Showtime: ${completedTicket.showDate} @ ${completedTicket.showTime}`, 20, 110);
    doc.text(`Reserved Seats: ${completedTicket.seats.join(', ')} (${completedTicket.tier})`, 20, 125);
    doc.text(`Amount Paid: INR ${completedTicket.totalAmount}`, 20, 140);
    doc.text(`Payee Beneficiary: ${payeeName} (${payeeUpiId})`, 20, 155);
    doc.text(`Payment Method: ${completedTicket.paymentMethod}`, 20, 170);
    
    doc.save(`PrimeShow_${completedTicket.movieTitle.replace(/\s+/g, '_')}_Ticket.pdf`);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share && completedTicket) {
      try {
        await navigator.share({
          title: `PrimeShow Ticket: ${completedTicket.movieTitle}`,
          text: `I just booked ${completedTicket.seats.length} seats for ${completedTicket.movieTitle} at ${completedTicket.theatreName}!`,
          url: window.location.href
        });
      } catch (e) {}
    } else {
      alert(`Ticket Link Copied! Booking ID: ${completedTicket?.id}`);
    }
  };

  return (
    <div className="fixed inset-0 z-[260] flex items-center justify-center p-3 sm:p-4 bg-black/95 backdrop-blur-2xl animate-fade-in font-sans">
      <div className="relative w-full max-w-2xl glass-modal rounded-3xl p-4 sm:p-7 border border-white/15 shadow-2xl text-white max-h-[92vh] overflow-y-auto overflow-x-hidden">
        
        {/* Top Corner Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-5 sm:right-5 z-30 p-2 rounded-full bg-white/10 hover:bg-rose-500/30 text-white transition-colors cursor-pointer shrink-0"
          title="Close Checkout Modal"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {!completedTicket ? (
          <div className="space-y-4">
            {/* Header */}
            <div className="border-b border-white/10 pb-3 pr-8">
              <h2 className="text-xl sm:text-2xl font-bold font-sans text-white">Booking Summary & Checkout</h2>
              <p className="text-xs text-amber-300 mt-0.5">Secure real-time transaction powered by NPCI UPI & Banking Protocols</p>
            </div>

            {/* Movie Details Card with Poster & Read More Toggle */}
            <div className="glass-panel p-3.5 sm:p-4 rounded-2xl border border-white/10">
              <div className="flex items-start gap-3 sm:gap-4">
                <img 
                  src={movie.poster} 
                  alt={movie.title} 
                  className="w-18 h-26 sm:w-22 sm:h-30 object-cover rounded-2xl border border-amber-400/40 shrink-0 shadow-lg" 
                />
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px] uppercase border border-amber-400/30">
                      {show.format || 'IMAX 3D'}
                    </span>
                    {movie.synopsis && (
                      <button
                        onClick={() => setIsMovieInfoExpanded(!isMovieInfoExpanded)}
                        className="text-amber-300 underline font-bold text-[10px] cursor-pointer inline-flex items-center gap-0.5 ml-auto"
                      >
                        <span>{isMovieInfoExpanded ? 'Less' : 'Read More'}</span>
                        {isMovieInfoExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    )}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold font-sans text-white truncate">{movie.title}</h3>
                  <p className="text-[11px] sm:text-xs text-white/70 truncate">{theatre.name}</p>
                  <div className="text-xs text-amber-300 font-semibold pt-0.5">
                    Seats: <strong className="text-white">{selectedSeats.join(', ')}</strong> ({selectedTier})
                  </div>
                  <div className="text-[11px] text-white/50">{show.date || '2026-07-28'} • {show.time} ({show.screenName || 'Screen 1'})</div>
                </div>
              </div>

              {isMovieInfoExpanded && movie.synopsis && (
                <p className="text-[11px] text-white/70 mt-2.5 animate-fade-in bg-white/5 p-2.5 rounded-xl border border-white/10 leading-relaxed">
                  {movie.synopsis}
                </p>
              )}
            </div>

            {/* Promo Code Input (Button Completely Inside Border Box) */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-white/80 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-amber-400" />
                <span>Apply Promo Code / Coupon</span>
              </label>

              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-500/20 border border-amber-400/50 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="font-bold text-amber-300">{appliedCoupon} Applied (-₹{discountAmount})</span>
                  </div>
                  <button onClick={removeCoupon} className="text-rose-400 hover:underline text-xs cursor-pointer font-bold">Remove</button>
                </div>
              ) : (
                <form onSubmit={handleApplyCouponSubmit} className="relative flex items-center bg-white/5 border border-white/10 rounded-2xl p-1.5 focus-within:border-amber-400/80 transition-colors w-full overflow-hidden">
                  <input
                    type="text"
                    placeholder="Try 'PRIMESHOW50' or 'LUXURY200'"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="w-full bg-transparent px-3 py-1.5 text-xs text-white uppercase font-bold outline-none placeholder:normal-case placeholder:font-normal placeholder:text-white/40"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs cursor-pointer shrink-0 transition-colors"
                  >
                    Apply
                  </button>
                </form>
              )}

              {couponStatus?.error && (
                <div className="text-[11px] text-rose-400 font-medium pl-1">{couponStatus.msg}</div>
              )}
              {couponStatus?.success && (
                <div className="text-[11px] text-amber-300 font-medium pl-1">{couponStatus.msg}</div>
              )}
            </div>

            {/* Real-Time Price Breakdown with Proper Spacing */}
            <div className="glass-panel p-3.5 sm:p-4 rounded-2xl border border-white/10 space-y-2 text-xs">
              <div className="flex justify-between text-white/70">
                <span>Base Price ({selectedSeats.length} seats @ ₹{seatPrice}/seat)</span>
                <span>₹{basePrice.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-white/70">
                <span>Convenience Fee (8%)</span>
                <span>₹{convenienceFee.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-white/70">
                <span>GST & Taxes (5%)</span>
                <span>₹{tax.toLocaleString('en-IN')}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-amber-400 font-bold">
                  <span>Coupon Discount</span>
                  <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="border-t border-white/10 pt-3 flex items-center justify-between gap-3 text-sm sm:text-base font-bold text-white">
                <span className="text-xs sm:text-sm text-white/90">Grand Total Amount</span>
                <span className="text-amber-400 font-sans text-xl sm:text-2xl font-black shrink-0">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Payment Method Options (Single Horizontal Scrollable Row) */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider">
                Select Payment Option
              </label>

              {/* Single Horizontal Scrollable Row with Hidden Scrollbars */}
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none no-scrollbar py-1 w-full max-w-full">
                {[
                  { id: 'UPI', label: 'Dynamic UPI & QR', icon: QrCode },
                  { id: 'NetBanking', label: 'Net Banking', icon: Building },
                  { id: 'Card', label: 'Credit / Debit', icon: CreditCard },
                  { id: 'Wallet', label: 'Wallets', icon: Wallet }
                ].map((m) => {
                  const Icon = m.icon;
                  const isActive = paymentMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setPaymentMethod(m.id)}
                      className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                        isActive
                          ? 'bg-amber-500 text-black border-amber-400 shadow-md shadow-amber-500/25'
                          : 'glass-panel text-white/70 hover:text-white border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-amber-400'}`} />
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* PAYMENT OPTION 1: DYNAMIC UPI QR CODE & PAYEE DETAILS */}
              {paymentMethod === 'UPI' && (
                <div className="p-4 sm:p-5 rounded-2xl glass-panel border-2 border-amber-400/40 space-y-4 animate-fade-in bg-gradient-to-b from-[#0e0f18] to-[#07080d]">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
                    {/* Inline SVG QR Code Renderer */}
                    <div className="bg-white p-2.5 rounded-2xl shadow-2xl shrink-0 border-2 border-amber-400/60 flex flex-col items-center">
                      <QRCodeSVG
                        value={upiSchemaUrl}
                        size={150}
                        level="H"
                        includeMargin={true}
                      />
                      <span className="text-[9px] font-bold text-black uppercase tracking-wider mt-1">Scan via Any UPI App</span>
                    </div>

                    {/* Payee Info & Manual Copy Box (Fits Perfectly Within Screen Bounds) */}
                    <div className="flex-1 space-y-3 text-left w-full max-w-full overflow-hidden">
                      <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-0.5">
                        <span className="text-[9px] text-white/40 uppercase tracking-widest block font-bold">Platform Payee Identity</span>
                        <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 truncate">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span className="truncate">{payeeName}</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 w-full max-w-full overflow-hidden">
                        <div className="min-w-0 flex-1">
                          <span className="text-[9px] text-amber-300/80 uppercase tracking-widest block font-bold">Official Payee UPI ID</span>
                          <span className="text-xs sm:text-sm font-mono font-bold text-amber-300 truncate block">{payeeUpiId}</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleCopyUpiId}
                          className="w-full sm:w-auto px-3.5 py-1.5 rounded-xl bg-amber-500 text-black hover:bg-amber-400 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all shrink-0"
                        >
                          {isCopiedUpi ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{isCopiedUpi ? 'Copied!' : 'Copy UPI ID'}</span>
                        </button>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-white/70 mb-1">Or enter your UPI VPA ID (GPay / PhonePe / Paytm):</label>
                        <input
                          type="text"
                          value={upiVpa}
                          onChange={(e) => setUpiVpa(e.target.value)}
                          className="w-full p-2.5 rounded-xl glass-input text-xs text-white font-mono"
                          placeholder="username@upi"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* PAYMENT OPTION 2: NET BANKING */}
              {paymentMethod === 'NetBanking' && (
                <div className="p-4 sm:p-5 rounded-2xl glass-panel border border-white/10 space-y-3 animate-fade-in text-xs">
                  <label className="block text-xs font-bold text-white mb-1">Select Net Banking Financial Institution</label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full p-3 rounded-xl glass-input text-xs text-white bg-[#0c0d14]"
                  >
                    <option value="HDFC Bank">HDFC Bank (Instant Transfer)</option>
                    <option value="ICICI Bank">ICICI Bank iMobile</option>
                    <option value="State Bank of India">State Bank of India (SBI Online)</option>
                    <option value="Axis Bank">Axis Bank Internet Banking</option>
                    <option value="Kotak Mahindra Bank">Kotak Mahindra Bank 811</option>
                  </select>
                </div>
              )}

              {/* PAYMENT OPTION 3: CREDIT / DEBIT CARDS */}
              {paymentMethod === 'Card' && (
                <div className="p-4 sm:p-5 rounded-2xl glass-panel border border-white/10 space-y-3 animate-fade-in text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-white mb-1">Cardholder Full Name</label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full p-2.5 rounded-xl glass-input text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-white mb-1">16-Digit Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full p-2.5 rounded-xl glass-input text-xs text-white font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-white mb-1">Expiry (MM/YY)</label>
                      <input
                        type="text"
                        value={cardExp}
                        onChange={(e) => setCardExp(e.target.value)}
                        className="w-full p-2.5 rounded-xl glass-input text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-white mb-1">CVV Code</label>
                      <input
                        type="password"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full p-2.5 rounded-xl glass-input text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* PAYMENT OPTION 4: WALLETS & ONLINE PAYMENT */}
              {paymentMethod === 'Wallet' && (
                <div className="p-4 sm:p-5 rounded-2xl glass-panel border border-white/10 space-y-3 animate-fade-in text-xs">
                  <label className="block text-xs font-bold text-white mb-1">Select Online Wallet Partner</label>
                  <select
                    value={selectedWallet}
                    onChange={(e) => setSelectedWallet(e.target.value)}
                    className="w-full p-3 rounded-xl glass-input text-xs text-white bg-[#0c0d14]"
                  >
                    <option value="Paytm Wallet">Paytm Wallet</option>
                    <option value="Amazon Pay">Amazon Pay Balance</option>
                    <option value="PhonePe Wallet">PhonePe Wallet</option>
                    <option value="Mobikwik Wallet">Mobikwik Zip</option>
                    <option value="LazyPay">LazyPay Pay Later</option>
                  </select>
                </div>
              )}
            </div>

            {/* Pay / Book Ticket Action Button (Single Row Alignment) */}
            <button
              disabled={isProcessing}
              onClick={handlePayNow}
              className="w-full py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-xl shadow-amber-500/30 hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 shrink-0 mt-2"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin"></div>
                  <span>{verificationStep || `Verifying Payment of ₹${grandTotal.toLocaleString('en-IN')}...`}</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>Pay ₹{grandTotal.toLocaleString('en-IN')} & Book Ticket</span>
                  <ArrowRight className="w-4 h-4 text-black" />
                </div>
              )}
            </button>
          </div>
        ) : (
          /* Post-Payment Success Ticket View */
          <div className="text-center py-4 space-y-6 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 shadow-xl shadow-emerald-500/30 mb-2">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-2xl font-bold font-sans text-white">Payment Verified & Ticket Generated!</h2>
              <p className="text-xs text-amber-300">Official Cinema Pass reserved at {completedTicket.theatreName}</p>
            </div>

            {/* Digital Ticket Card */}
            <div className="glass-panel p-6 rounded-3xl border-2 border-amber-400/50 text-left relative overflow-hidden shadow-2xl bg-gradient-to-b from-[#12131e] to-[#08090f]">
              <div className="flex items-center justify-between border-b border-amber-400/30 pb-4 mb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">PrimeShow Official Pass</span>
                  <div className="text-xl font-bold font-sans text-white">{completedTicket.movieTitle}</div>
                  <div className="text-xs text-white/70">{completedTicket.theatreName}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-amber-300">ID: {completedTicket.id}</div>
                  <div className="text-[10px] text-white/60">{completedTicket.showDate} @ {completedTicket.showTime}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs mb-4">
                <div>
                  <span className="text-white/50 block text-[10px]">Reserved Seats</span>
                  <span className="font-extrabold text-white text-sm">{completedTicket.seats.join(', ')} ({completedTicket.tier})</span>
                </div>
                <div>
                  <span className="text-white/50 block text-[10px]">Total Amount Paid</span>
                  <span className="font-extrabold text-amber-400 text-sm">₹{completedTicket.totalAmount.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-white/50 block text-[10px]">Payee Beneficiary</span>
                  <span className="font-bold text-white">{payeeName}</span>
                </div>
                <div>
                  <span className="text-white/50 block text-[10px]">Transaction ID</span>
                  <span className="font-mono text-white/80">{completedTicket.transactionId || 'TXN-PAY-882194'}</span>
                </div>
              </div>

              {/* Dynamic QR Code */}
              <div className="flex items-center justify-between pt-4 border-t border-amber-400/30">
                <div className="bg-white p-2 rounded-xl shadow-md">
                  <QRCodeSVG value={completedTicket.qrCodeData || upiSchemaUrl} size={90} />
                </div>
                <div className="text-right text-[10px] text-amber-200/80 leading-relaxed">
                  Scan QR code at multiplex entrance <br />
                  Verified NPCI Settlement • Direct Entry Permitted
                </div>
              </div>
            </div>

            {/* Actionable Ticket Buttons */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <button
                onClick={handleDownloadPDF}
                className="py-3 px-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </button>

              <button
                onClick={handlePrint}
                className="py-3 px-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-amber-400" />
                <span>Print Ticket</span>
              </button>

              <button
                onClick={handleShare}
                className="py-3 px-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-emerald-400" />
                <span>Share Ticket</span>
              </button>
            </div>

            <button
              onClick={() => {
                onClose();
                if (onBookingSuccess) onBookingSuccess();
              }}
              className="w-full py-3 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 hover:bg-amber-500 hover:text-black text-xs font-bold transition-all cursor-pointer"
            >
              Done & View in Profile Bookings →
            </button>

          </div>
        )}

      </div>
    </div>
  );
};
