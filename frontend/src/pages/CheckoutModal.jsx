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
    <div className="fixed inset-0 z-[260] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-2xl bg-[#DBCEA5] rounded-3xl p-4 sm:p-7 border border-[#c5ba92] shadow-2xl text-slate-900 max-h-[92vh] overflow-y-auto overflow-x-hidden">
        
        {/* Top Corner Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-5 sm:right-5 z-30 p-2 rounded-full bg-[#D90000] hover:bg-[#b00000] text-white transition-colors cursor-pointer shrink-0 shadow-md"
          title="Close Checkout Modal"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {!completedTicket ? (
          <div className="space-y-4">
            {/* Header */}
            <div className="border-b border-[#c5ba92] pb-3 pr-8">
              <h2 className="text-xl sm:text-2xl font-bold font-sans text-slate-900">Booking Summary & Checkout</h2>
              <p className="text-xs text-[#D90000] font-semibold mt-0.5">Secure real-time transaction powered by NPCI UPI & Banking Protocols</p>
            </div>

            {/* Movie Details Card with Poster & Read More Toggle */}
            <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-300 text-slate-900 shadow-xs overflow-hidden">
              <div className="flex items-start gap-3 sm:gap-4 w-full max-w-full">
                <img 
                  src={movie.poster} 
                  alt={movie.title} 
                  className="w-[85px] sm:w-[105px] h-[120px] sm:h-[145px] object-cover rounded-2xl border border-slate-300 shrink-0 shadow-md" 
                />
                <div className="flex-1 min-w-0 space-y-1 overflow-hidden">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-[#DBCEA5] text-slate-900 font-bold text-[10px] uppercase border border-[#c5ba92] shrink-0">
                      {show.format || 'IMAX 3D'}
                    </span>
                    {movie.synopsis && (
                      <button
                        onClick={() => setIsMovieInfoExpanded(!isMovieInfoExpanded)}
                        className="text-[#D90000] underline font-bold text-[10px] cursor-pointer inline-flex items-center gap-0.5 ml-auto shrink-0"
                      >
                        <span>{isMovieInfoExpanded ? 'Less' : 'Read More'}</span>
                        {isMovieInfoExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    )}
                  </div>
                  <h3 className="text-sm sm:text-base font-bold font-sans text-slate-900 truncate max-w-full">{movie.title}</h3>
                  <p className="text-[11px] sm:text-xs text-slate-700 truncate max-w-full">{theatre.name}</p>
                  <div className="text-[11px] sm:text-xs text-[#D90000] font-semibold truncate max-w-full">
                    Seats: <strong className="text-slate-900">{selectedSeats.join(', ')}</strong> ({selectedTier})
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-slate-600 truncate max-w-full">{show.date || '2026-07-28'} • {show.time} ({show.screenName || 'Screen 1'})</div>
                </div>
              </div>

              {isMovieInfoExpanded && movie.synopsis && (
                <p className="text-[11px] text-slate-800 mt-2.5 animate-fade-in bg-slate-50 p-2.5 rounded-xl border border-slate-200 leading-relaxed">
                  {movie.synopsis}
                </p>
              )}
            </div>

            {/* Promo Code Input */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-[#D90000]" />
                <span>Apply Promo Code / Coupon</span>
              </label>

              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 rounded-2xl bg-[#66DD6A]/20 border border-[#66DD6A] text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <CheckCircle2 className="w-4 h-4 text-[#66DD6A] shrink-0" />
                    <span className="font-bold text-slate-900 truncate">{appliedCoupon} Applied (-₹{discountAmount})</span>
                  </div>
                  <button onClick={removeCoupon} className="text-red-600 hover:underline text-xs cursor-pointer font-bold shrink-0 ml-2">Remove</button>
                </div>
              ) : (
                <form onSubmit={handleApplyCouponSubmit} className="flex flex-row items-center gap-1.5 bg-white border border-slate-300 rounded-2xl p-1.5 focus-within:border-[#D90000] transition-colors w-full max-w-full overflow-hidden shadow-inner">
                  <input
                    type="text"
                    placeholder="Try 'PRIMESHOW50' or 'LUXURY200'"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 min-w-0 bg-transparent px-2.5 py-1 text-[11px] sm:text-xs text-slate-900 uppercase font-bold outline-none placeholder:normal-case placeholder:font-normal placeholder:text-slate-400 truncate"
                  />
                  <button
                    type="submit"
                    className="px-3.5 sm:px-4 py-1.5 rounded-xl bg-[#D90000] hover:bg-[#b00000] text-white font-extrabold text-[11px] sm:text-xs cursor-pointer shrink-0 transition-colors shadow-xs"
                  >
                    Apply
                  </button>
                </form>
              )}

              {couponStatus?.error && (
                <div className="text-[11px] text-red-600 font-medium pl-1">{couponStatus.msg}</div>
              )}
              {couponStatus?.success && (
                <div className="text-[11px] text-[#66DD6A] font-bold pl-1">{couponStatus.msg}</div>
              )}
            </div>

            {/* Real-Time Price Breakdown */}
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-300 space-y-2 text-xs text-slate-900 shadow-xs">
              <div className="flex justify-between text-slate-700">
                <span>Base Price ({selectedSeats.length} seats @ ₹{seatPrice}/seat)</span>
                <span>₹{basePrice.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Convenience Fee (8%)</span>
                <span>₹{convenienceFee.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>GST & Taxes (5%)</span>
                <span>₹{tax.toLocaleString('en-IN')}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-[#D90000] font-bold">
                  <span>Coupon Discount</span>
                  <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="border-t border-slate-200 pt-3 flex items-center justify-between gap-3 text-sm sm:text-base font-bold text-slate-900">
                <span className="text-xs sm:text-sm text-slate-800">Grand Total Amount</span>
                <span className="text-[#D90000] font-sans text-xl sm:text-2xl font-black shrink-0">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Payment Method Options */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                Select Payment Option
              </label>

              <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none no-scrollbar py-1 w-full max-w-full">
                {[
                  { id: 'UPI', label: 'UPI & QR', icon: QrCode },
                  { id: 'NetBanking', label: 'Net Banking', icon: Building },
                  { id: 'Card', label: 'Cards', icon: CreditCard },
                  { id: 'Wallet', label: 'Wallets', icon: Wallet }
                ].map((m) => {
                  const Icon = m.icon;
                  const isActive = paymentMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setPaymentMethod(m.id)}
                      className={`flex-1 min-w-[78px] xs:min-w-[88px] sm:min-w-[120px] px-2 sm:px-3 py-2 rounded-xl border text-[10px] sm:text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer shrink-0 text-center ${
                        isActive
                          ? 'bg-[#D90000] text-white border-[#D90000] shadow-md'
                          : 'bg-white text-slate-800 hover:bg-slate-100 border-slate-300'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-[#D90000]'}`} />
                      <span className="truncate">{m.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* PAYMENT OPTION 1: DYNAMIC UPI QR CODE & PAYEE DETAILS */}
              {paymentMethod === 'UPI' && (
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-300 space-y-4 animate-fade-in text-slate-900 shadow-xs">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
                    {/* Inline SVG QR Code Renderer */}
                    <div className="bg-white p-2.5 rounded-2xl shadow-md shrink-0 border border-slate-300 flex flex-col items-center">
                      <QRCodeSVG
                        value={upiSchemaUrl}
                        size={150}
                        level="H"
                        includeMargin={true}
                      />
                      <span className="text-[9px] font-bold text-slate-900 uppercase tracking-wider mt-1">Scan via Any UPI App</span>
                    </div>

                    {/* Payee Info & Manual Copy Box */}
                    <div className="flex-1 space-y-3 text-left w-full max-w-full overflow-hidden">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
                        <span className="text-[9px] text-slate-500 uppercase tracking-widest block font-bold">Platform Payee Identity</span>
                        <div className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5 truncate">
                          <CheckCircle2 className="w-4 h-4 text-[#66DD6A] shrink-0" />
                          <span className="truncate">{payeeName}</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-2xl bg-[#DBCEA5] border border-[#c5ba92] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 w-full max-w-full overflow-hidden text-slate-900">
                        <div className="min-w-0 flex-1">
                          <span className="text-[9px] text-slate-700 uppercase tracking-widest block font-bold">Official Payee UPI ID</span>
                          <span className="text-xs sm:text-sm font-mono font-bold text-[#D90000] truncate block">{payeeUpiId}</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleCopyUpiId}
                          className="w-full sm:w-auto px-3.5 py-1.5 rounded-xl bg-[#D90000] text-white hover:bg-[#b00000] font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all shrink-0 shadow-xs"
                        >
                          {isCopiedUpi ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{isCopiedUpi ? 'Copied!' : 'Copy UPI ID'}</span>
                        </button>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Or enter your UPI VPA ID (GPay / PhonePe / Paytm):</label>
                        <input
                          type="text"
                          value={upiVpa}
                          onChange={(e) => setUpiVpa(e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-white text-slate-900 border border-slate-300 text-xs font-mono focus:outline-none shadow-inner"
                          placeholder="username@upi"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* PAYMENT OPTION 2: NET BANKING */}
              {paymentMethod === 'NetBanking' && (
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-300 space-y-3 animate-fade-in text-xs text-slate-900 shadow-xs">
                  <label className="block text-xs font-bold text-slate-900 mb-1">Select Net Banking Financial Institution</label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full p-3 rounded-xl bg-white text-slate-900 border border-slate-300 text-xs font-semibold focus:outline-none"
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
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-300 space-y-3 animate-fade-in text-xs text-slate-900 shadow-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-900 mb-1">Cardholder Full Name</label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-white text-slate-900 border border-slate-300 text-xs font-semibold focus:outline-none shadow-inner"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-900 mb-1">16-Digit Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-white text-slate-900 border border-slate-300 text-xs font-mono focus:outline-none shadow-inner"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-900 mb-1">Expiry (MM/YY)</label>
                      <input
                        type="text"
                        value={cardExp}
                        onChange={(e) => setCardExp(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-white text-slate-900 border border-slate-300 text-xs font-mono focus:outline-none shadow-inner"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-900 mb-1">CVV Code</label>
                      <input
                        type="password"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-white text-slate-900 border border-slate-300 text-xs font-mono focus:outline-none shadow-inner"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* PAYMENT OPTION 4: WALLETS & ONLINE PAYMENT */}
              {paymentMethod === 'Wallet' && (
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-300 space-y-3 animate-fade-in text-xs text-slate-900 shadow-xs">
                  <label className="block text-xs font-bold text-slate-900 mb-1">Select Online Wallet Partner</label>
                  <select
                    value={selectedWallet}
                    onChange={(e) => setSelectedWallet(e.target.value)}
                    className="w-full p-3 rounded-xl bg-white text-slate-900 border border-slate-300 text-xs font-semibold focus:outline-none"
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

            {/* Pay / Book Ticket Action Button */}
            <button
              disabled={isProcessing}
              onClick={handlePayNow}
              className="w-full py-3.5 sm:py-4 rounded-2xl bg-[#D90000] hover:bg-[#b00000] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 shrink-0 mt-2"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                  <span>{verificationStep || `Verifying Payment of ₹${grandTotal.toLocaleString('en-IN')}...`}</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>Pay ₹{grandTotal.toLocaleString('en-IN')} & Book Ticket</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </div>
              )}
            </button>
          </div>
        ) : (
          /* Post-Payment Success Ticket View */
          <div className="text-center py-4 space-y-6 animate-fade-in text-slate-900">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#66DD6A]/30 border-2 border-[#66DD6A] text-[#66DD6A] shadow-lg mb-2">
              <CheckCircle2 className="w-8 h-8 text-[#66DD6A]" />
            </div>

            <div>
              <h2 className="text-2xl font-bold font-sans text-slate-900">Payment Verified & Ticket Generated!</h2>
              <p className="text-xs text-[#D90000] font-semibold">Official Cinema Pass reserved at {completedTicket.theatreName}</p>
            </div>

            {/* Digital Ticket Card */}
            <div className="bg-[#DBCEA5] p-6 rounded-3xl border border-[#c5ba92] text-left relative overflow-hidden shadow-md text-slate-900">
              <div className="flex items-center justify-between border-b border-[#c5ba92] pb-4 mb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#D90000]">PrimeShow Official Pass</span>
                  <div className="text-xl font-bold font-sans text-slate-900">{completedTicket.movieTitle}</div>
                  <div className="text-xs text-slate-700">{completedTicket.theatreName}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-[#D90000]">ID: {completedTicket.id}</div>
                  <div className="text-[10px] text-slate-600">{completedTicket.showDate} @ {completedTicket.showTime}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs mb-4">
                <div>
                  <span className="text-slate-600 block text-[10px]">Reserved Seats</span>
                  <span className="font-extrabold text-slate-900 text-sm">{completedTicket.seats.join(', ')} ({completedTicket.tier})</span>
                </div>
                <div>
                  <span className="text-slate-600 block text-[10px]">Total Amount Paid</span>
                  <span className="font-extrabold text-[#D90000] text-sm">₹{completedTicket.totalAmount.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-slate-600 block text-[10px]">Payee Beneficiary</span>
                  <span className="font-bold text-slate-900">{payeeName}</span>
                </div>
                <div>
                  <span className="text-slate-600 block text-[10px]">Transaction ID</span>
                  <span className="font-mono text-slate-800">{completedTicket.transactionId || 'TXN-PAY-882194'}</span>
                </div>
              </div>

              {/* Dynamic QR Code */}
              <div className="flex items-center justify-between pt-4 border-t border-[#c5ba92]">
                <div className="bg-white p-2 rounded-xl shadow-md border border-slate-300">
                  <QRCodeSVG value={completedTicket.qrCodeData || upiSchemaUrl} size={90} />
                </div>
                <div className="text-right text-[10px] text-slate-700 leading-relaxed font-semibold">
                  Scan QR code at multiplex entrance <br />
                  Verified NPCI Settlement • Direct Entry Permitted
                </div>
              </div>
            </div>

            {/* Actionable Ticket Buttons */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <button
                onClick={handleDownloadPDF}
                className="py-3 px-3 rounded-2xl bg-[#D90000] hover:bg-[#b00000] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </button>

              <button
                onClick={handlePrint}
                className="py-3 px-3 rounded-2xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-900 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Printer className="w-4 h-4 text-[#D90000]" />
                <span>Print Ticket</span>
              </button>

              <button
                onClick={handleShare}
                className="py-3 px-3 rounded-2xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-900 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Share2 className="w-4 h-4 text-[#66DD6A]" />
                <span>Share Ticket</span>
              </button>
            </div>

            <button
              onClick={() => {
                onClose();
                if (onBookingSuccess) onBookingSuccess();
              }}
              className="w-full py-3 rounded-xl bg-[#D90000] text-white hover:bg-[#b00000] text-xs font-bold transition-all cursor-pointer shadow-md"
            >
              Done & View in Profile Bookings →
            </button>

          </div>
        )}

      </div>
    </div>
  );
};
