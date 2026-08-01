import React, { useState } from 'react';
import { 
  X, Shield, CheckCircle2, QrCode, CreditCard, Building2, 
  Smartphone, Lock, Printer, Share2, Sparkles, Film, Clock, MapPin, Ticket, AlertCircle, AlertTriangle, Wallet, Copy, Check
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_BASE = 'http://localhost:5000/api';

export const PrivateTheatreModal = ({ isOpen, onClose, theatre, show, selectedDate, onBookingSuccess }) => {
  const { user } = useAuth();
  
  const [step, setStep] = useState('summary'); // 'summary' | 'payment' | 'confirmation'
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' | 'qr' | 'netbanking' | 'card' | 'wallet'
  
  // Payee & Dynamic UPI Details
  const payeeName = 'Jay Hiralal Radadiya';
  const payeeUpiId = 'jay.radadiya@ptaxis';
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

      const res = await axios.post(`${API_BASE}/private-theatre/book`, payload);
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
          url: window.location.href
        });
      } catch (e) {}
    } else {
      alert(`VIP Pass Copied! Booking ID: ${confirmedBooking?.id}`);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-2xl glass-modal rounded-3xl border border-white/15 shadow-2xl overflow-hidden text-white flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-amber-500/20 via-amber-400/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-serif text-white">Private Theatre VIP Reservation</h2>
              <p className="text-xs text-amber-300">Exclusive Full Screen & Luxury Lounge Booking</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-white/70 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {paymentError && (
            <div className="p-4 rounded-2xl bg-rose-500/20 border border-rose-500/50 text-rose-200 text-xs font-semibold flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{paymentError}</span>
            </div>
          )}

          {/* STEP 1: SUMMARY */}
          {step === 'summary' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl glass-panel border border-amber-400/30 space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Selected Multiplex</span>
                    <h3 className="text-lg font-bold text-white">{theatre.name}</h3>
                    <p className="text-xs text-white/60">{theatre.address}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold">
                    Private Hall
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                  <div>
                    <span className="text-white/40 block text-[10px]">Movie</span>
                    <span className="font-bold text-white">{show.movieTitle}</span>
                  </div>
                  <div>
                    <span className="text-white/40 block text-[10px]">Format & Screen</span>
                    <span className="font-bold text-emerald-400">{show.format} • {show.screenName}</span>
                  </div>
                  <div>
                    <span className="text-white/40 block text-[10px]">Date & Time Slot</span>
                    <span className="font-bold text-amber-300">{dateLabel} • {show.time}</span>
                  </div>
                  <div>
                    <span className="text-white/40 block text-[10px]">Total Screen Seats</span>
                    <span className="font-bold text-white">{theatre.totalSeats || 120} VIP Recliners</span>
                  </div>
                </div>
              </div>

              {/* Private Hall Benefits */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
                  <Shield className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <div className="font-bold text-white">100% Private Screen Lock</div>
                    <div className="text-[10px] text-white/50">Zero outside public entrance permitted</div>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <div className="font-bold text-white">Dedicated In-Seat Butler</div>
                    <div className="text-[10px] text-white/50">Complimentary welcome drinks & popcorn</div>
                  </div>
                </div>
              </div>

              {/* Total Pricing Calculation */}
              <div className="p-4 rounded-2xl glass-panel border border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-xs text-white/60">Total Private Screen Package Rate</div>
                  <div className="text-2xl font-bold font-serif text-amber-300">₹{privatePrice.toLocaleString('en-IN')}</div>
                </div>
                <button
                  onClick={() => setStep('payment')}
                  className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  Proceed to Payment Gateway →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: PAYMENT GATEWAY */}
          {step === 'payment' && (
            <div className="space-y-6">
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Select 1 of 4 Secure Payment Options
              </div>

              {/* Payment Methods Selector Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all text-xs font-bold cursor-pointer ${
                    paymentMethod === 'upi' || paymentMethod === 'qr'
                      ? 'bg-amber-500 text-black border-amber-400 shadow-md'
                      : 'glass-panel text-white/60 hover:text-white border-white/10'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span>Dynamic UPI & QR</span>
                </button>

                <button
                  onClick={() => setPaymentMethod('netbanking')}
                  className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all text-xs font-bold cursor-pointer ${
                    paymentMethod === 'netbanking'
                      ? 'bg-amber-500 text-black border-amber-400 shadow-md'
                      : 'glass-panel text-white/60 hover:text-white border-white/10'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>Net Banking</span>
                </button>

                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all text-xs font-bold cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'bg-amber-500 text-black border-amber-400 shadow-md'
                      : 'glass-panel text-white/60 hover:text-white border-white/10'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Credit / Debit</span>
                </button>

                <button
                  onClick={() => setPaymentMethod('wallet')}
                  className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all text-xs font-bold cursor-pointer ${
                    paymentMethod === 'wallet'
                      ? 'bg-amber-500 text-black border-amber-400 shadow-md'
                      : 'glass-panel text-white/60 hover:text-white border-white/10'
                  }`}
                >
                  <Wallet className="w-4 h-4" />
                  <span>Wallets</span>
                </button>
              </div>

              {/* DYNAMIC UPI QR CODE & PAYEE DETAILS */}
              {(paymentMethod === 'upi' || paymentMethod === 'qr') && (
                <div className="p-5 rounded-2xl glass-panel border-2 border-amber-400/40 space-y-4 animate-fade-in bg-gradient-to-b from-[#0e0f18] to-[#07080d]">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    {/* Inline SVG QR Code Renderer */}
                    <div className="bg-white p-3 rounded-2xl shadow-2xl shrink-0 border-2 border-amber-400/60 flex flex-col items-center">
                      <QRCodeSVG
                        value={upiSchemaUrl}
                        size={170}
                        level="H"
                        includeMargin={true}
                      />
                      <span className="text-[10px] font-bold text-black uppercase tracking-wider mt-1">Scan via Any UPI App</span>
                    </div>

                    {/* Payee Info & Manual Copy Box */}
                    <div className="flex-1 space-y-3 text-left w-full">
                      <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                        <span className="text-[10px] text-white/40 uppercase tracking-widest block font-bold">Payee Beneficiary Name</span>
                        <div className="text-sm font-bold text-white flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>{payeeName}</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-between gap-2">
                        <div>
                          <span className="text-[10px] text-amber-300/80 uppercase tracking-widest block font-bold">Official Payee UPI ID</span>
                          <span className="text-xs font-mono font-bold text-amber-300">{payeeUpiId}</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleCopyUpiId}
                          className="px-3 py-1.5 rounded-lg bg-amber-500 text-black hover:bg-amber-400 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-all shrink-0"
                        >
                          {isCopiedUpi ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{isCopiedUpi ? 'Copied!' : 'Copy UPI ID'}</span>
                        </button>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-white/70 mb-1">Enter your VPA ID for UPI push notification:</label>
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          className="w-full p-2.5 rounded-xl glass-input text-xs text-white font-mono"
                          placeholder="username@upi"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* NET BANKING */}
              {paymentMethod === 'netbanking' && (
                <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-3 text-xs animate-fade-in">
                  <label className="block text-xs font-bold text-white mb-1">Select Bank</label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full p-3 rounded-xl glass-input text-xs text-white bg-[#0c0d14]"
                  >
                    <option value="HDFC Bank">HDFC Bank</option>
                    <option value="ICICI Bank">ICICI Bank</option>
                    <option value="State Bank of India">State Bank of India (SBI)</option>
                    <option value="Axis Bank">Axis Bank</option>
                    <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                  </select>
                </div>
              )}

              {/* CREDIT / DEBIT CARD */}
              {paymentMethod === 'card' && (
                <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-3 text-xs animate-fade-in">
                  <div>
                    <label className="block text-[11px] font-bold text-white mb-1">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full p-2.5 rounded-xl glass-input text-xs text-white font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-white mb-1">Expiry Date</label>
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

              {/* WALLETS */}
              {paymentMethod === 'wallet' && (
                <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-3 text-xs animate-fade-in">
                  <label className="block text-xs font-bold text-white mb-1">Select Wallet</label>
                  <select
                    value={selectedWallet}
                    onChange={(e) => setSelectedWallet(e.target.value)}
                    className="w-full p-3 rounded-xl glass-input text-xs text-white bg-[#0c0d14]"
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
                  className="px-4 py-2.5 rounded-xl glass-panel text-xs text-white/70 hover:text-white"
                >
                  ← Back to Summary
                </button>

                <button
                  onClick={handleProcessPayment}
                  disabled={isProcessing}
                  className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin"></div>
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
            <div className="space-y-6 text-center animate-fade-in">
              <div className="inline-flex p-3 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 mb-2">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-2xl font-bold font-serif text-white">Private Screen Reservation Confirmed!</h3>
                <p className="text-xs text-amber-300">Verified NPCI UPI Settlement for {confirmedBooking.theatreName}</p>
              </div>

              {/* Digital VIP Pass Card */}
              <div className="p-6 rounded-3xl glass-panel border-2 border-amber-400/50 text-left relative overflow-hidden shadow-2xl bg-gradient-to-b from-[#12131e] to-[#08090f]">
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">PrimeShow VIP Private Ticket</span>
                    <h4 className="text-xl font-bold text-white">{confirmedBooking.theatreName}</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-white/50 block">Booking ID</span>
                    <span className="font-mono text-xs font-bold text-amber-300">{confirmedBooking.id}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs mb-4">
                  <div>
                    <span className="text-white/40 block text-[10px]">Movie Screened</span>
                    <span className="font-bold text-white">{confirmedBooking.movieTitle}</span>
                  </div>
                  <div>
                    <span className="text-white/40 block text-[10px]">Format & Hall</span>
                    <span className="font-bold text-emerald-400">{confirmedBooking.format} • {confirmedBooking.screenName}</span>
                  </div>
                  <div>
                    <span className="text-white/40 block text-[10px]">Date & Showtime Interval</span>
                    <span className="font-bold text-amber-300">{confirmedBooking.date} • {confirmedBooking.time} - 01:42 PM</span>
                  </div>
                  <div>
                    <span className="text-white/40 block text-[10px]">Payee Beneficiary</span>
                    <span className="font-bold text-white">{payeeName} ({payeeUpiId})</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <div className="bg-white p-2 rounded-xl shadow-md">
                    <QRCodeSVG value={upiSchemaUrl} size={90} />
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-white/50 block">Paid Amount</span>
                    <span className="text-lg font-bold text-emerald-400">₹{confirmedBooking.totalPrice.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <button
                  onClick={handlePrint}
                  className="py-3 px-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Ticket</span>
                </button>

                <button
                  onClick={handleShare}
                  className="py-3 px-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Share2 className="w-4 h-4 text-emerald-400" />
                  <span>Share Pass</span>
                </button>

                <button
                  onClick={onClose}
                  className="py-3 px-3 rounded-2xl glass-panel border border-white/10 text-white font-bold text-xs hover:bg-white/10 cursor-pointer"
                >
                  Close & Done
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
