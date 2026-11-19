import React, { useState } from 'react';
import { 
  X, Shield, CheckCircle2, QrCode, CreditCard, Building2, 
  Smartphone, Lock, Printer, Share2, Sparkles, Film, Clock, MapPin, Ticket, AlertCircle, AlertTriangle, Wallet, Copy, Check
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import API, { API_BASE } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { VerifiedTicketModal } from './VerifiedTicketModal';

export const PrivateTheatreModal = ({ isOpen, onClose, theatre, show, selectedDate, onBookingSuccess }) => {
  const { user } = useAuth();
  
  const [step, setStep] = useState('summary'); // 'summary' | 'payment' | 'confirmation'
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' | 'qr' | 'netbanking' | 'card' | 'wallet'
  
  // Payee & Dynamic UPI Details
  const payeeName = 'PrimeShow Official Cinema Pass';
  const payeeUpiId = 'pay@primeshow';
  const [isCopiedUpi, setIsCopiedUpi] = useState(false);

  // Payment Form Fields
  const [upiId, setUpiId] = useState('vip.guest@upi');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [selectedWallet, setSelectedWallet] = useState('Paytm Wallet');
  const [cardNumber, setCardNumber] = useState('4532 8921 7739 1092');
  const [cardExp, setCardExp] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('892');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [isQrPassOpen, setIsQrPassOpen] = useState(false);

  if (!isOpen || !show || !theatre) return null;

  const dateLabel = selectedDate || '28 Jul';
  const privatePrice = Number(show.price ? show.price * 30 : 15000); // Private screen pricing calculation
  const upiSchemaUrl = `upi://pay?pa=${payeeUpiId}&pn=${encodeURIComponent(payeeName)}&am=${privatePrice}&cu=INR`;

  const handleCopyUpiId = () => {
    navigator.clipboard.writeText(payeeUpiId);
    setIsCopiedUpi(true);
    setTimeout(() => setIsCopiedUpi(false), 2500);
  };

  const handleProcessPayment = async () => {
    setIsProcessing(true);
    setPaymentError('');

    try {
      // Simulate payment verification delay
      await new Promise(res => setTimeout(res, 1500));

      const payload = {
        theatreId: theatre.id,
        theatreName: theatre.name,
        showId: show.id,
        movieId: show.movieId || 'mov_1',
        movieTitle: show.movieTitle || 'Avatar: Fire and Ash',
        format: show.format || 'IMAX 3D',
        date: dateLabel,
        time: show.time || '10:30 AM',
        duration: '3h 12m',
        screenName: show.screenName || 'Screen 1 - VIP IMAX',
        price: privatePrice,
        paymentMethod: paymentMethod === 'upi' ? `Dynamic UPI (${payeeUpiId})` : 
                       paymentMethod === 'qr' ? `UPI QR (${payeeUpiId})` : 
                       paymentMethod === 'netbanking' ? `NetBanking (${selectedBank})` : 
                       paymentMethod === 'wallet' ? `Wallet (${selectedWallet})` : 'Credit/Debit Card',
        userEmail: user?.email || 'guest@primeshow.com',
        userName: user?.name || 'VIP Guest'
      };

      const res = await API.post('/private-theatre/book', payload);
      setConfirmedBooking(res.data);
      setStep('confirmation');
      if (onBookingSuccess) onBookingSuccess(res.data);
    } catch (err) {
      if (err.response && err.response.status === 409) {
        setPaymentError('DOUBLE BOOKING ALERT: This theatre show slot was just reserved by another user!');
      } else {
        setPaymentError('Payment authorization failed. Please verify payment credentials.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share && confirmedBooking) {
      try {
        await navigator.share({
          title: `PrimeShow VIP Private Pass: ${confirmedBooking.movieTitle}`,
          text: `I just reserved the entire screen at ${confirmedBooking.theatreName} for ${confirmedBooking.movieTitle}!`,
          url: `${window.location.origin}/?ticketId=${confirmedBooking.id}`
        });
      } catch (e) {}
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/?ticketId=${confirmedBooking?.id}`);
      alert(`VIP Pass link copied to clipboard! Booking ID: ${confirmedBooking?.id}`);
    }
  };

  const ticketPassUrl = confirmedBooking ? (
    typeof window !== 'undefined'
      ? `${window.location.origin}/?ticketId=${confirmedBooking.id}`
      : `https://prime-show-tau.vercel.app/?ticketId=${confirmedBooking.id}`
  ) : upiSchemaUrl;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-2xl bg-[#FFFDF7] rounded-3xl border-2 border-[#D90000] shadow-2xl overflow-hidden text-slate-900 flex flex-col max-h-[92vh] animate-scale-up">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#c5ba92] flex items-center justify-between bg-[#DBCEA5] text-slate-900 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D90000] flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black font-sans text-slate-900 tracking-tight">Private Theatre VIP Reservation</h2>
              <p className="text-xs text-[#D90000] font-bold">Exclusive Full Screen & Luxury Lounge Booking</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 hover:text-black cursor-pointer shadow-xs transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-slate-900">
          
          {paymentError && (
            <div className="p-4 rounded-2xl bg-rose-100 border border-rose-300 text-rose-900 text-xs font-bold flex items-center gap-3 shadow-xs">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{paymentError}</span>
            </div>
          )}

          {/* STEP 1: SUMMARY */}
          {step === 'summary' && (
            <div className="space-y-5">
              <div className="p-5 rounded-2xl bg-[#DBCEA5] border border-[#c5ba92] space-y-3 shadow-xs text-slate-900">
                <div className="flex items-center justify-between border-b border-[#c5ba92] pb-3">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#D90000]">Selected Multiplex</span>
                    <h3 className="text-xl font-black font-sans text-slate-900">{theatre.name}</h3>
                    <p className="text-xs text-slate-700 font-medium">{theatre.address}</p>
                  </div>
                  <span className="px-3.5 py-1 rounded-full bg-[#D90000] text-white text-xs font-black shadow-xs">
                    Private Hall
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                  <div>
                    <span className="text-slate-600 block text-[10px] font-semibold">Movie</span>
                    <span className="font-black font-sans text-slate-900 line-clamp-1">{show.movieTitle}</span>
                  </div>
                  <div>
                    <span className="text-slate-600 block text-[10px] font-semibold">Format & Screen</span>
                    <span className="font-black font-sans text-emerald-800">{show.format} • {show.screenName}</span>
                  </div>
                  <div>
                    <span className="text-slate-600 block text-[10px] font-semibold">Date & Time Slot</span>
                    <span className="font-black font-sans text-[#D90000]">{dateLabel} • {show.time}</span>
                  </div>
                  <div>
                    <span className="text-slate-600 block text-[10px] font-semibold">Total Screen Seats</span>
                    <span className="font-black font-sans text-slate-900">{theatre.totalSeats || 120} VIP Recliners</span>
                  </div>
                </div>
              </div>

              {/* Private Hall Benefits */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-white border border-slate-300 flex items-center gap-3 shadow-xs">
                  <div className="p-2 rounded-xl bg-red-50 text-[#D90000]">
                    <Shield className="w-5 h-5 text-[#D90000] shrink-0" />
                  </div>
                  <div>
                    <div className="font-black font-sans text-slate-900">100% Private Screen Lock</div>
                    <div className="text-[11px] text-slate-600 font-medium">Zero outside public entrance permitted</div>
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-white border border-slate-300 flex items-center gap-3 shadow-xs">
                  <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                    <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
                  </div>
                  <div>
                    <div className="font-black font-sans text-slate-900">Dedicated In-Seat Butler</div>
                    <div className="text-[11px] text-slate-600 font-medium">Complimentary welcome drinks & popcorn</div>
                  </div>
                </div>
              </div>

              {/* Total Pricing Calculation */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                <div>
                  <div className="text-xs text-slate-600 font-semibold">Total Private Screen Package Rate</div>
                  <div className="text-2xl sm:text-3xl font-black font-sans text-[#D90000]">₹{privatePrice.toLocaleString('en-IN')}</div>
                </div>
                <button
                  onClick={() => setStep('payment')}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#D90000] hover:bg-[#b00000] text-white font-black font-sans text-xs sm:text-sm uppercase tracking-wider shadow-md hover:brightness-110 active:scale-[0.99] cursor-pointer transition-all"
                >
                  Proceed to Payment Gateway →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: PAYMENT GATEWAY */}
          {step === 'payment' && (
            <div className="space-y-5">
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Select 1 of 4 Secure Payment Options
              </div>

              {/* Payment Methods Selector Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'upi', label: 'Dynamic UPI & QR', icon: QrCode },
                  { id: 'netbanking', label: 'Net Banking', icon: Building2 },
                  { id: 'card', label: 'Credit / Debit', icon: CreditCard },
                  { id: 'wallet', label: 'Wallets', icon: Wallet }
                ].map((m) => {
                  const Icon = m.icon;
                  const isActive = paymentMethod === m.id || (m.id === 'upi' && paymentMethod === 'qr');
                  return (
                    <button
                      key={m.id}
                      onClick={() => setPaymentMethod(m.id)}
                      className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all text-xs font-bold cursor-pointer shadow-2xs ${
                        isActive
                          ? 'bg-[#D90000] text-white border-[#D90000] shadow-md'
                          : 'bg-white text-slate-800 hover:bg-slate-100 border-slate-300'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#D90000]'}`} />
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* DYNAMIC UPI QR CODE & PAYEE DETAILS */}
              {(paymentMethod === 'upi' || paymentMethod === 'qr') && (
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-300 space-y-4 animate-fade-in text-slate-900 shadow-xs">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-5 sm:gap-6">
                    {/* Interactive SVG QR Code Renderer */}
                    <div 
                      onClick={handleProcessPayment}
                      className="bg-white p-2.5 rounded-2xl shadow-md shrink-0 border-2 border-slate-300 hover:border-[#D90000] flex flex-col items-center cursor-pointer hover:scale-105 active:scale-95 transition-all group"
                      title="Click QR to Pay & Reserve Screen"
                    >
                      <QRCodeSVG
                        value={upiSchemaUrl}
                        size={155}
                        level="H"
                        includeMargin={true}
                      />
                      <span className="text-[10px] font-extrabold text-[#D90000] uppercase tracking-wider mt-1.5 flex items-center gap-1 group-hover:underline">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#66DD6A]" /> Click QR to Pay & Confirm
                      </span>
                    </div>

                    {/* Payee Info & Manual Copy Box */}
                    <div className="flex-1 space-y-3 text-left w-full max-w-full overflow-hidden">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
                        <span className="text-[9px] text-slate-500 uppercase tracking-widest block font-bold">Platform Payee Beneficiary</span>
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
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Enter your UPI VPA ID (GPay / PhonePe / Paytm):</label>
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-white text-slate-900 border border-slate-300 text-xs font-mono focus:border-[#D90000] focus:outline-none shadow-inner"
                          placeholder="username@upi"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* NET BANKING */}
              {paymentMethod === 'netbanking' && (
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-300 space-y-3 text-xs animate-fade-in text-slate-900 shadow-xs">
                  <label className="block text-xs font-bold text-slate-900 mb-1">Select Bank</label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full p-3 rounded-xl bg-white text-slate-900 border border-slate-300 text-xs font-semibold focus:outline-none"
                  >
                    <option value="HDFC Bank">HDFC Bank (Instant Transfer)</option>
                    <option value="ICICI Bank">ICICI Bank</option>
                    <option value="State Bank of India">State Bank of India (SBI)</option>
                    <option value="Axis Bank">Axis Bank</option>
                    <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                  </select>
                </div>
              )}

              {/* CREDIT / DEBIT CARD */}
              {paymentMethod === 'card' && (
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-300 space-y-3 text-xs animate-fade-in text-slate-900 shadow-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-900 mb-1">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-white text-slate-900 border border-slate-300 text-xs font-mono focus:border-[#D90000] focus:outline-none shadow-inner"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-900 mb-1">Expiry Date</label>
                      <input
                        type="text"
                        value={cardExp}
                        onChange={(e) => setCardExp(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-white text-slate-900 border border-slate-300 text-xs font-mono focus:border-[#D90000] focus:outline-none shadow-inner"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-900 mb-1">CVV Code</label>
                      <input
                        type="password"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-white text-slate-900 border border-slate-300 text-xs font-mono focus:border-[#D90000] focus:outline-none shadow-inner"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* WALLETS */}
              {paymentMethod === 'wallet' && (
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-300 space-y-3 text-xs animate-fade-in text-slate-900 shadow-xs">
                  <label className="block text-xs font-bold text-slate-900 mb-1">Select Wallet</label>
                  <select
                    value={selectedWallet}
                    onChange={(e) => setSelectedWallet(e.target.value)}
                    className="w-full p-3 rounded-xl bg-white text-slate-900 border border-slate-300 text-xs font-semibold focus:outline-none"
                  >
                    <option value="Paytm Wallet">Paytm Wallet</option>
                    <option value="Amazon Pay">Amazon Pay Balance</option>
                    <option value="PhonePe Wallet">PhonePe Wallet</option>
                    <option value="LazyPay">LazyPay Pay Later</option>
                  </select>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setStep('summary')}
                  className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-800 hover:bg-slate-100 cursor-pointer shadow-xs transition-colors"
                >
                  ← Back to Summary
                </button>

                <button
                  onClick={handleProcessPayment}
                  disabled={isProcessing}
                  className="px-6 py-3.5 rounded-2xl bg-[#D90000] hover:bg-[#b00000] text-white font-extrabold font-sans text-xs shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                      <span>Verifying Settlement...</span>
                    </>
                  ) : (
                    <span>Pay ₹{privatePrice.toLocaleString('en-IN')} & Reserve Entire Screen</span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: CONFIRMATION & DIGITAL VIP TICKET */}
          {step === 'confirmation' && confirmedBooking && (
            <div className="space-y-5 text-center animate-fade-in text-slate-900">
              <div className="inline-flex p-3 rounded-full bg-emerald-100 border-2 border-emerald-400 text-emerald-800 mb-2 shadow-md">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>

              <div>
                <h3 className="text-2xl font-black font-sans text-slate-900">Private Screen Reservation Confirmed!</h3>
                <p className="text-xs text-[#D90000] font-bold">Verified NPCI UPI Settlement for {confirmedBooking.theatreName}</p>
              </div>

              {/* Digital VIP Pass Card */}
              <div className="p-6 rounded-3xl bg-[#DBCEA5] border border-[#c5ba92] text-left relative overflow-hidden shadow-md text-slate-900">
                <div className="flex items-center justify-between border-b border-[#c5ba92] pb-4 mb-4">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#D90000]">PrimeShow VIP Private Ticket</span>
                    <h4 className="text-xl font-black font-sans text-slate-900">{confirmedBooking.theatreName}</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-600 block font-semibold">Booking ID</span>
                    <span className="font-mono text-xs font-bold text-[#D90000]">{confirmedBooking.id}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs mb-4">
                  <div>
                    <span className="text-slate-600 block text-[10px] font-semibold">Movie Screened</span>
                    <span className="font-black font-sans text-slate-900 text-sm">{confirmedBooking.movieTitle}</span>
                  </div>
                  <div>
                    <span className="text-slate-600 block text-[10px] font-semibold">Format & Hall</span>
                    <span className="font-black font-sans text-emerald-800 text-sm">{confirmedBooking.format} • {confirmedBooking.screenName}</span>
                  </div>
                  <div>
                    <span className="text-slate-600 block text-[10px] font-semibold">Date & Showtime Interval</span>
                    <span className="font-black font-sans text-[#D90000] text-sm">{confirmedBooking.date} • {confirmedBooking.time}</span>
                  </div>
                  <div>
                    <span className="text-slate-600 block text-[10px] font-semibold">Payee Beneficiary</span>
                    <span className="font-bold text-slate-900 text-sm">{payeeName}</span>
                  </div>
                </div>

                {/* Scannable / Interactive Pass QR Code */}
                <div className="pt-4 border-t border-[#c5ba92] flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div 
                    onClick={() => setIsQrPassOpen(true)}
                    className="bg-white p-2.5 rounded-2xl shadow-md border-2 border-slate-300 hover:border-[#D90000] cursor-pointer hover:scale-105 active:scale-95 transition-all flex flex-col items-center group relative shrink-0"
                    title="Click / Select QR to View Official Ticket Pass"
                  >
                    <QRCodeSVG value={ticketPassUrl} size={90} level="H" />
                    <span className="text-[9px] font-black text-[#D90000] mt-1 group-hover:underline flex items-center gap-0.5">
                      <QrCode className="w-2.5 h-2.5" /> Select QR / View Pass
                    </span>
                  </div>

                  <div className="text-center sm:text-right">
                    <span className="text-[10px] text-slate-600 block font-semibold">Total Paid Amount</span>
                    <span className="text-xl sm:text-2xl font-black font-sans text-[#D90000]">
                      ₹{(confirmedBooking.totalPrice || privatePrice).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-emerald-800 font-bold block mt-0.5">
                      ✓ 100% Private Auditorium Access Validated
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <button
                  onClick={handlePrint}
                  className="py-3 px-3 rounded-2xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-900 font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Printer className="w-4 h-4 text-[#D90000]" />
                  <span>Print Ticket</span>
                </button>

                <button
                  onClick={handleShare}
                  className="py-3 px-3 rounded-2xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-900 font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Share2 className="w-4 h-4 text-emerald-600" />
                  <span>Share Pass</span>
                </button>

                <button
                  onClick={onClose}
                  className="py-3 px-3 rounded-2xl bg-[#D90000] hover:bg-[#b00000] text-white font-bold text-xs shadow-md cursor-pointer transition-colors"
                >
                  Close & Done
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Verified Ticket Pass Modal on QR Click */}
      {isQrPassOpen && confirmedBooking && (
        <VerifiedTicketModal
          isOpen={isQrPassOpen}
          onClose={() => setIsQrPassOpen(false)}
          ticket={{
            id: confirmedBooking.id,
            movieTitle: confirmedBooking.movieTitle,
            theatreName: confirmedBooking.theatreName,
            screenName: confirmedBooking.screenName || 'Private VIP Auditorium',
            showDate: confirmedBooking.date,
            showTime: confirmedBooking.time,
            seats: 'Entire Private Hall (Exclusive)',
            tier: 'VIP Private Lounge',
            totalAmount: confirmedBooking.totalPrice || privatePrice,
            transactionId: 'TXN-VIP-' + (confirmedBooking.id?.replace(/\D/g, '') || '99201')
          }}
        />
      )}
    </div>
  );
};
