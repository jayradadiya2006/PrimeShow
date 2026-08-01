import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Ticket, CheckCircle2, QrCode, Download, Share2, Percent, 
  ShieldCheck, CreditCard, Smartphone, Building, Sparkles, ArrowLeft, AlertTriangle 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QRCodeSVG } from 'qrcode.react';
import jsPDF from 'jspdf';
import { useBooking } from '../../context/BookingContext';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user, setAuthModalOpen } = useAuth();
  const { 
    selectedShow, selectedSeats, appliedCoupon, setAppliedCoupon, 
    discountAmount, setDiscountAmount, calculateTotal, setLastBooking 
  } = useBooking();

  const [couponCode, setCouponCode] = useState('');
  const [couponMsg, setCouponMsg] = useState('');
  const [couponError, setCouponError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('razorpay'); // 'razorpay' | 'upi' | 'card' | 'netbanking' | 'wallet'
  const [processing, setProcessing] = useState(false);
  const [doubleBookingError, setDoubleBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(null);

  // Timer for UPI QR
  const [timer, setTimer] = useState(300);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  if (!selectedShow || selectedSeats.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4 text-slate-400">
        <p>No active seat selection found.</p>
        <button onClick={() => navigate('/movies')} className="px-6 py-2.5 rounded-full bg-cyan-500 text-black font-bold text-xs glow-cyan">
          Browse Movies
        </button>
      </div>
    );
  }

  const { base, fee, tax, total, final } = calculateTotal();

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    setCouponMsg('');
    setCouponError('');
    if (!couponCode.trim()) return;

    try {
      const res = await API.post('/coupons/verify', {
        code: couponCode,
        amount: total,
        userId: user?.id
      });
      setAppliedCoupon(res.data.coupon);
      setDiscountAmount(res.data.discountAmount);
      setCouponMsg(`Coupon applied! You saved ₹${res.data.discountAmount}`);
    } catch (err) {
      setCouponError(err.response?.data?.error || "Invalid promo code.");
    }
  };

  const handleCompletePayment = async () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    setProcessing(true);
    setDoubleBookingError('');

    try {
      const res = await API.post('/bookings', {
        showId: selectedShow.id,
        userId: user.id,
        seats: selectedSeats,
        paymentMethod: paymentMethod === 'razorpay' ? 'Razorpay Express' : paymentMethod === 'upi' ? 'UPI (QR Code)' : paymentMethod === 'card' ? 'Credit Card' : 'NetBanking',
        couponCode: appliedCoupon?.code,
        discountAmount,
        totalPrice: total,
        finalAmount: final
      });

      setBookingSuccess(res.data);
      setLastBooking(res.data);

      // Trigger Confetti Explosion
      confetti({
        particleCount: 140,
        spread: 80,
        origin: { y: 0.6 }
      });

    } catch (err) {
      if (err.response && err.response.status === 409) {
        setDoubleBookingError(err.response.data.error || "Seat conflict detected. These seats were just reserved by another user.");
      } else {
        alert("Payment processing failed. Please try again.");
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!bookingSuccess) return;
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("PRIMESHOW LUXURY TICKET", 20, 25);
    doc.setFontSize(14);
    doc.text(`Booking ID: ${bookingSuccess.id}`, 20, 40);
    doc.setFont("helvetica", "normal");
    doc.text(`Movie: ${bookingSuccess.movieTitle}`, 20, 55);
    doc.text(`Theatre: ${bookingSuccess.theatreName}`, 20, 65);
    doc.text(`Screen: ${bookingSuccess.screenName}`, 20, 75);
    doc.text(`Date & Time: ${bookingSuccess.date} at ${bookingSuccess.time}`, 20, 85);
    doc.text(`Seats: ${bookingSuccess.seats.join(', ')}`, 20, 95);
    doc.text(`Amount Paid: Rs. ${bookingSuccess.finalAmount}`, 20, 105);
    doc.save(`PrimeShow-Ticket-${bookingSuccess.id}.pdf`);
  };

  const handleNativeShare = () => {
    if (navigator.share && bookingSuccess) {
      navigator.share({
        title: `PrimeShow Ticket - ${bookingSuccess.movieTitle}`,
        text: `I'm watching ${bookingSuccess.movieTitle} at ${bookingSuccess.theatreName}! Seats: ${bookingSuccess.seats.join(', ')}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Ticket link copied to clipboard!");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 min-h-screen">
      
      {/* POST-PAYMENT SUCCESS SCREEN */}
      {bookingSuccess ? (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-8 sm:p-12 rounded-3xl glass-panel border-cyan-500/40 shadow-2xl space-y-8 bg-[#0c0d14]/90 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-400/40 flex items-center justify-center mx-auto glow-cyan">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">Booking Confirmed</span>
            <h1 className="font-serif text-4xl font-bold text-white">Your Cinema Experience Awaits</h1>
            <p className="text-xs text-slate-400">Scan QR Code at multiplex entrance for fast VIP gate entry.</p>
          </div>

          {/* DIGITAL QR TICKET CARD */}
          <div className="max-w-md mx-auto p-6 rounded-3xl glass-panel border-white/20 bg-gradient-to-br from-white/5 to-black text-left space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <p className="text-[10px] text-slate-400 uppercase">Booking Ref</p>
                <p className="font-mono text-sm font-bold text-cyan-300">{bookingSuccess.id}</p>
              </div>
              <QRCodeSVG value={bookingSuccess.qrData || 'PRIMESHOW'} size={60} bgColor="transparent" fgColor="#00f2fe" />
            </div>

            <div className="space-y-1">
              <h3 className="font-serif text-2xl font-bold text-white">{bookingSuccess.movieTitle}</h3>
              <p className="text-xs text-slate-300">{bookingSuccess.theatreName}</p>
              <p className="text-xs text-slate-400">{bookingSuccess.screenName} • {bookingSuccess.format}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs">
              <div>
                <span className="text-slate-500 text-[10px] block">Showtime</span>
                <span className="font-bold text-white">{bookingSuccess.date} @ {bookingSuccess.time}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Seats</span>
                <span className="font-bold text-cyan-300">{bookingSuccess.seats?.join(', ')}</span>
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={handleDownloadPDF}
              className="px-6 py-3 rounded-full bg-cyan-500 text-black font-bold text-xs glow-cyan flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4 stroke-[2.5]" /> Download PDF Ticket
            </button>
            <button
              onClick={handleNativeShare}
              className="px-6 py-3 rounded-full glass-panel hover:border-cyan-500/40 text-xs font-semibold text-slate-200 flex items-center gap-2 cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-cyan-400" /> Share Ticket
            </button>
            <button
              onClick={() => navigate('/profile/bookings')}
              className="px-6 py-3 rounded-full glass-panel hover:border-cyan-500/40 text-xs font-semibold text-slate-200 cursor-pointer"
            >
              View in My Bookings
            </button>
          </div>
        </motion.div>
      ) : (

        /* CHECKOUT & PAYMENT FLOW */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ITEMIZATION BREAKDOWN (LEFT) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl glass-panel border-white/10 space-y-6">
              <h2 className="font-serif text-3xl font-bold text-white">Booking Summary</h2>

              {/* DOUBLE BOOKING WARNING BANNER */}
              {doubleBookingError && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/40 text-xs text-red-400 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 shrink-0 text-red-400" />
                  <div>
                    <p className="font-bold">{doubleBookingError}</p>
                    <button
                      onClick={() => navigate(`/seat-booking/${selectedShow.id}`)}
                      className="mt-2 px-4 py-1.5 rounded-lg bg-red-500 text-white font-bold text-xs"
                    >
                      Re-select Seats
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-3 border-b border-white/10 pb-4">
                <h3 className="font-serif text-2xl font-bold text-cyan-300">{selectedShow.movie?.title}</h3>
                <p className="text-xs text-slate-300">{selectedShow.theatreName}</p>
                <p className="text-xs text-slate-400">{selectedShow.screenName} • {selectedShow.format} • {selectedShow.language}</p>
                <p className="text-xs text-cyan-400 font-semibold">{selectedShow.date} at {selectedShow.time}</p>
              </div>

              {/* ITEMIZATION TABLE */}
              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span>Base Ticket Price ({selectedSeats.length} Seats: {selectedSeats.join(', ')})</span>
                  <span className="font-bold text-white">₹{base}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Convenience Fee (8%)</span>
                  <span>₹{fee}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Integrated GST (18%)</span>
                  <span>₹{tax}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-bold border-t border-white/10 pt-2">
                    <span>Applied Coupon Discount ({appliedCoupon?.code})</span>
                    <span>- ₹{discountAmount}</span>
                  </div>
                )}

                <div className="flex justify-between text-base font-bold text-white border-t border-white/10 pt-3">
                  <span>Total Amount Payable</span>
                  <span className="text-xl text-cyan-300">₹{final}</span>
                </div>
              </div>

              {/* COUPON FORM */}
              <form onSubmit={handleApplyCoupon} className="pt-4 border-t border-white/10 space-y-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Percent className="w-4 h-4 text-emerald-400" /> Have a Promo Code?
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Enter PRIME200 or ICICIVIP"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1 p-2.5 rounded-xl glass-input text-xs font-mono"
                  />
                  <button type="submit" className="px-5 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500 hover:text-black text-cyan-300 font-bold text-xs transition-all border border-cyan-500/30">
                    Apply Code
                  </button>
                </div>
                {couponMsg && <p className="text-xs text-emerald-400 font-semibold">{couponMsg}</p>}
                {couponError && <p className="text-xs text-red-400 font-semibold">{couponError}</p>}
              </form>
            </div>
          </div>

          {/* PAYMENT GATEWAY SELECTION (RIGHT) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl glass-panel border-cyan-500/30 space-y-6 bg-[#0c0d14]/90">
              <h3 className="font-serif text-2xl font-bold text-white">Payment Method</h3>

              {/* METHOD SELECTOR TABS */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('razorpay')}
                  className={`p-2.5 rounded-2xl text-center text-xs font-bold border transition-all cursor-pointer ${
                    paymentMethod === 'razorpay' ? 'bg-cyan-500 text-black border-cyan-400 glow-cyan' : 'glass-panel text-slate-400'
                  }`}
                >
                  Razorpay
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-2.5 rounded-2xl text-center text-xs font-bold border transition-all cursor-pointer ${
                    paymentMethod === 'upi' ? 'bg-cyan-500 text-black border-cyan-400 glow-cyan' : 'glass-panel text-slate-400'
                  }`}
                >
                  UPI QR
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-2.5 rounded-2xl text-center text-xs font-bold border transition-all cursor-pointer ${
                    paymentMethod === 'card' ? 'bg-cyan-500 text-black border-cyan-400 glow-cyan' : 'glass-panel text-slate-400'
                  }`}
                >
                  Cards
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('netbanking')}
                  className={`p-2.5 rounded-2xl text-center text-xs font-bold border transition-all cursor-pointer ${
                    paymentMethod === 'netbanking' ? 'bg-cyan-500 text-black border-cyan-400 glow-cyan' : 'glass-panel text-slate-400'
                  }`}
                >
                  NetBank
                </button>
              </div>

              {/* RAZORPAY GATEWAY PREVIEW */}
              {paymentMethod === 'razorpay' && (
                <div className="p-4 rounded-2xl glass-panel border-cyan-500/30 text-center space-y-3 bg-cyan-500/5">
                  <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">Secured by Razorpay</span>
                  <p className="text-xs text-slate-300">Instant checkout supporting Google Pay, PhonePe, Cards & Wallets.</p>
                </div>
              )}

              {/* UPI QR GATEWAY */}
              {paymentMethod === 'upi' && (
                <div className="p-4 rounded-2xl glass-panel border-white/10 text-center space-y-3">
                  <p className="text-xs text-slate-300">Scan QR Code using Google Pay, PhonePe, or Paytm</p>
                  <div className="p-3 bg-white rounded-2xl inline-block shadow-xl">
                    <QRCodeSVG value={`upi://pay?pa=primeshow@icici&pn=PrimeShow&am=${final}&cu=INR`} size={130} />
                  </div>
                  <p className="text-[11px] font-mono text-cyan-400">
                    Session expires in: {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                  </p>
                </div>
              )}

              {/* CARD FORM */}
              {paymentMethod === 'card' && (
                <div className="space-y-3">
                  <input type="text" placeholder="Card Number (4532 ...)" className="w-full p-3 rounded-xl glass-input text-xs" />
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" placeholder="MM/YY" className="p-3 rounded-xl glass-input text-xs" />
                    <input type="password" placeholder="CVV" maxLength={3} className="p-3 rounded-xl glass-input text-xs" />
                  </div>
                </div>
              )}

              {/* NETBANKING FORM */}
              {paymentMethod === 'netbanking' && (
                <div className="space-y-2">
                  <select className="w-full p-3 rounded-xl glass-input text-xs">
                    <option value="hdfc">HDFC Bank NetBanking</option>
                    <option value="icici">ICICI Bank Internet Banking</option>
                    <option value="sbi">State Bank of India</option>
                    <option value="axis">Axis Bank</option>
                  </select>
                </div>
              )}

              <button
                onClick={handleCompletePayment}
                disabled={processing}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-cyan-400 to-indigo-600 text-black font-bold text-sm hover:brightness-110 transition-all glow-cyan flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{processing ? 'Processing Payment...' : `Pay ₹${final} & Confirm`}</span>
                <ShieldCheck className="w-5 h-5 text-black" />
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
