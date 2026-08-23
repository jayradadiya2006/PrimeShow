import React, { useState } from 'react';
import { 
  X, CheckCircle2, Ticket, QrCode, CreditCard, Building2, Wallet, 
  Download, Printer, Share2, Copy, Sparkles, ShieldCheck, Clock, MapPin, Check
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import jsPDF from 'jspdf';
import API, { API_BASE } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';

export const ActivityBookingModal = ({ isOpen, onClose, activity, activityItem, onBookingSuccess, onSuccess }) => {
  const { user } = useAuth();
  const { setMyBookings } = useBooking();
  
  const activeActivity = activity || activityItem;
  const handleSuccessCallback = onBookingSuccess || onSuccess;

  // State
  const [step, setStep] = useState('config'); // 'config' | 'payment' | 'verifying' | 'pass'
  const [passCount, setPassCount] = useState(1);
  const [activePaymentTab, setActivePaymentTab] = useState('upi'); // 'upi' | 'netbanking' | 'card' | 'wallet'
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !activeActivity) return null;

  // Payee & Dynamic UPI Details
  const payeeName = 'Jay Hiralal Radadiya';
  const payeeUpiId = 'jay.radadiya@ptaxis';
  
  // Dynamic Pricing Calculation
  const basePrice = Number(activeActivity.price || 999);
  const totalBasePrice = basePrice * passCount;
  const convenienceFee = Math.round(totalBasePrice * 0.08); // 8% fee
  const gstTax = Math.round(totalBasePrice * 0.05); // 5% GST
  const grandTotal = totalBasePrice + convenienceFee + gstTax;

  // Standard UPI URI format
  const dynamicUpiUri = `upi://pay?pa=${payeeUpiId}&pn=${encodeURIComponent(payeeName)}&am=${grandTotal}&cu=INR`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(payeeUpiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const handleConfirmPayment = async () => {
    setIsProcessing(true);
    setStep('verifying');

    try {
      // Simulate real-time banking verification network delay
      await new Promise(r => setTimeout(r, 2200));

      const payload = {
        activityId: activeActivity.id,
        title: activeActivity.title,
        activityTitle: activeActivity.title,
        category: activeActivity.category || 'Water Park',
        location: activeActivity.location || 'Surat',
        city: activeActivity.city || 'Surat',
        validity: activeActivity.validity || 'Full Day Pass (10:00 AM - 07:00 PM)',
        timings: activeActivity.validity || 'Full Day Pass (10:00 AM - 07:00 PM)',
        passRate: Number(activeActivity.price || 1299),
        price: Number(activeActivity.price || 1299),
        ticketCount: passCount,
        quantity: passCount,
        totalAmount: grandTotal,
        totalPrice: grandTotal,
        userId: user?.id || user?._id || 'usr_guest',
        userEmail: user?.email || 'guest@primeshow.com',
        userName: user?.name || 'VIP Guest',
        paymentMethod: activePaymentTab === 'upi' ? 'UPI (Jay Hiralal Radadiya)' :
                       activePaymentTab === 'netbanking' ? 'Net Banking (HDFC/ICICI)' :
                       activePaymentTab === 'card' ? 'Credit/Debit Card' : 'Digital Wallet',
      };

      let response;
      try {
        response = await API.post('/bookings/activity', payload);
      } catch (errPost) {
        response = await API.post('/activities/book', payload);
      }

      setConfirmedBooking(response.data);
      if (setMyBookings) {
        setMyBookings(prev => [response.data, ...(Array.isArray(prev) ? prev : [])]);
      }
      setStep('pass');
      if (handleSuccessCallback) handleSuccessCallback(response.data);
    } catch (err) {
      alert(err.response?.data?.error || 'Payment process failed. Please try again.');
      setStep('payment');
    } finally {
      setIsProcessing(false);
    }
  };

  // Generate downloadable PDF Entry Pass
  const handleDownloadPDF = () => {
    if (!confirmedBooking) return;

    const doc = new jsPDF();

    // Background gradient header
    doc.setFillColor(15, 23, 42); // Dark slate
    doc.rect(0, 0, 210, 297, 'F');

    doc.setFillColor(245, 158, 11); // Amber badge header
    doc.rect(15, 15, 180, 24, 'F');

    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('PRIMESHOW - VIP ACTIVITY ADVENTURE PASS', 105, 31, { align: 'center' });

    // Pass details container
    doc.setFillColor(30, 41, 59);
    doc.rect(15, 45, 180, 215, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text(confirmedBooking.activityTitle, 25, 62);

    doc.setFontSize(11);
    doc.setTextColor(245, 158, 11);
    doc.text(`Category: ${confirmedBooking.category}`, 25, 72);

    doc.setFontSize(10);
    doc.setTextColor(203, 213, 225);
    doc.text(`Pass Booking ID: ${confirmedBooking.id}`, 25, 85);
    doc.text(`Transaction Ref: ${confirmedBooking.transactionId}`, 25, 93);
    doc.text(`Location / Venue: ${confirmedBooking.location}`, 25, 101);
    doc.text(`Validity Period: ${confirmedBooking.validity}`, 25, 109);
    doc.text(`Total Passes Issued: ${confirmedBooking.ticketCount} Entry Pass(es)`, 25, 117);
    doc.text(`Grand Amount Paid: INR Rs.${confirmedBooking.totalAmount.toLocaleString('en-IN')}`, 25, 125);
    doc.text(`Payee Beneficiary: ${payeeName} (${payeeUpiId})`, 25, 133);

    // Benefits list section
    doc.setDrawColor(245, 158, 11);
    doc.line(25, 143, 185, 143);

    doc.setFontSize(12);
    doc.setTextColor(245, 158, 11);
    doc.text('INCLUDED PASS BENEFITS:', 25, 153);

    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    let yPos = 163;
    (confirmedBooking.benefits || []).forEach((b) => {
      doc.text(`- ${b}`, 30, yPos);
      yPos += 8;
    });

    // Verification footer box
    doc.setFillColor(15, 23, 42);
    doc.rect(25, 215, 160, 35, 'F');

    doc.setFontSize(10);
    doc.setTextColor(34, 197, 94); // Emerald text
    doc.text('PASS STATUS: VERIFIED & CONFIRMED', 105, 227, { align: 'center' });
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(9);
    doc.text('Present this digital PDF pass or QR at venue gate for instant access.', 105, 237, { align: 'center' });

    doc.save(`PrimeShow_Activity_Pass_${confirmedBooking.id}.pdf`);
  };

  const handlePrintPass = () => {
    window.print();
  };

  const handleSharePass = () => {
    if (navigator.share && confirmedBooking) {
      navigator.share({
        title: `PrimeShow Pass - ${confirmedBooking.activityTitle}`,
        text: `I just booked ${confirmedBooking.ticketCount} Pass(es) for ${confirmedBooking.activityTitle} on PrimeShow! Pass ID: ${confirmedBooking.id}`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`PrimeShow Activity Pass: ${confirmedBooking?.id} for ${confirmedBooking?.activityTitle}`);
      alert('Pass booking details copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0b0c16] rounded-3xl border border-white/15 shadow-2xl overflow-hidden my-8">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <Ticket className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-serif">Activity Pass Booking</h3>
              <p className="text-[11px] text-amber-300">PrimeShow Adventure & Theme Park Pass System</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: Pass Configuration & Quantity Selection */}
        {step === 'config' && (
          <div className="p-6 space-y-6">
            {/* Activity Card Banner */}
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
              <img
                src={activeActivity.image}
                alt={activeActivity.title}
                className="w-24 h-24 rounded-xl object-cover border border-amber-400/40 shrink-0"
              />
              <div className="space-y-1">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold uppercase">
                  {activeActivity.category}
                </span>
                <h4 className="text-lg font-bold text-white leading-tight">{activeActivity.title}</h4>
                <p className="text-xs text-white/60 flex items-center gap-1.5 pt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{activeActivity.location}</span>
                </p>
                <p className="text-xs text-white/60 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{activeActivity.validity}</span>
                </p>
              </div>
            </div>

            {/* Pass Benefits List */}
            {activeActivity.benefits && activeActivity.benefits.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Included Pass Benefits & Perks:
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeActivity.benefits.map((b, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-white/5 text-xs text-white/90 border border-white/5">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Select Number of Passes</span>
                <span className="text-[11px] text-white/50">Maximum 10 passes per transaction</span>
              </div>

              <div className="flex items-center gap-3 bg-black/40 p-1.5 rounded-xl border border-white/10">
                <button
                  onClick={() => setPassCount(Math.max(1, passCount - 1))}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold transition-all cursor-pointer"
                >
                  -
                </button>
                <span className="text-base font-bold text-amber-400 w-6 text-center">{passCount}</span>
                <button
                  onClick={() => setPassCount(Math.min(10, passCount + 1))}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold transition-all cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-400/20 space-y-2 text-xs">
              <div className="flex justify-between text-white/70">
                <span>Pass Price ({passCount} x ₹{basePrice})</span>
                <span>₹{totalBasePrice.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-white/70">
                <span>Convenience Fee (8%)</span>
                <span>₹{convenienceFee.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-white/70">
                <span>GST Tax (5%)</span>
                <span>₹{gstTax.toLocaleString('en-IN')}</span>
              </div>
              <div className="border-t border-amber-400/30 pt-2 flex justify-between text-sm font-bold text-amber-300">
                <span>Grand Total Amount</span>
                <span className="text-base font-extrabold text-amber-400">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Proceed Button */}
            <button
              onClick={() => setStep('payment')}
              className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Proceed to Payment (₹{grandTotal.toLocaleString('en-IN')})</span>
            </button>
          </div>
        )}

        {/* STEP 2: 4 Payment Gateway Tabs & Dynamic UPI QR */}
        {step === 'payment' && (
          <div className="p-6 space-y-6">
            
            {/* Payee Info Banner */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-amber-300 uppercase font-bold tracking-wider block">Official Beneficiary Payee</span>
                <span className="text-sm font-bold text-white">{payeeName}</span>
                <span className="text-xs text-amber-400/80 block font-mono">{payeeUpiId}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-white/50 block">Amount Due</span>
                <span className="text-lg font-black text-amber-400">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* 4 Payment Gateway Options Tabs */}
            <div className="grid grid-cols-4 gap-2 border-b border-white/10 pb-3 text-xs font-bold">
              <button
                onClick={() => setActivePaymentTab('upi')}
                className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activePaymentTab === 'upi'
                    ? 'bg-amber-500 text-black font-bold shadow-lg shadow-amber-500/20'
                    : 'glass-panel text-white/70 hover:text-white'
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span className="hidden sm:inline">UPI & QR</span>
              </button>

              <button
                onClick={() => setActivePaymentTab('netbanking')}
                className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activePaymentTab === 'netbanking'
                    ? 'bg-amber-500 text-black font-bold shadow-lg shadow-amber-500/20'
                    : 'glass-panel text-white/70 hover:text-white'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span className="hidden sm:inline">Net Banking</span>
              </button>

              <button
                onClick={() => setActivePaymentTab('card')}
                className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activePaymentTab === 'card'
                    ? 'bg-amber-500 text-black font-bold shadow-lg shadow-amber-500/20'
                    : 'glass-panel text-white/70 hover:text-white'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span className="hidden sm:inline">Cards</span>
              </button>

              <button
                onClick={() => setActivePaymentTab('wallet')}
                className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activePaymentTab === 'wallet'
                    ? 'bg-amber-500 text-black font-bold shadow-lg shadow-amber-500/20'
                    : 'glass-panel text-white/70 hover:text-white'
                }`}
              >
                <Wallet className="w-4 h-4" />
                <span className="hidden sm:inline">Wallets</span>
              </button>
            </div>

            {/* Tab 1: Dynamic UPI QR Code */}
            {activePaymentTab === 'upi' && (
              <div className="text-center space-y-4 py-2">
                <p className="text-xs text-amber-300 font-semibold">
                  Scan QR with GPay, PhonePe, Paytm, or BHIM to pay <strong className="text-white">₹{grandTotal.toLocaleString('en-IN')}</strong>
                </p>

                {/* High Correction SVG QR Code */}
                <div className="inline-block p-4 rounded-3xl bg-white shadow-2xl border-4 border-amber-400">
                  <QRCodeSVG
                    value={dynamicUpiUri}
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                </div>

                <div className="flex items-center justify-center gap-2 pt-1">
                  <span className="text-xs text-white/70">UPI ID: <strong className="text-amber-400 font-mono">{payeeUpiId}</strong></span>
                  <button
                    onClick={handleCopyUpi}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                    title="Copy UPI ID"
                  >
                    {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )}

            {/* Tab 2: Net Banking */}
            {activePaymentTab === 'netbanking' && (
              <div className="space-y-3 py-4 text-xs">
                <p className="text-white/70">Select your bank for instant net banking transfer:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Mahindra', 'Punjab National Bank'].map(bank => (
                    <button key={bank} className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-amber-400 text-white font-semibold text-center cursor-pointer">
                      {bank}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 3: Credit/Debit Cards */}
            {activePaymentTab === 'card' && (
              <div className="space-y-3 py-2 text-xs">
                <div>
                  <label className="block text-white/70 mb-1">Cardholder Name</label>
                  <input type="text" placeholder="e.g. Jay Radadiya" className="w-full p-2.5 rounded-xl glass-input text-white text-xs" />
                </div>
                <div>
                  <label className="block text-white/70 mb-1">Card Number</label>
                  <input type="text" placeholder="4532 •••• •••• 8921" className="w-full p-2.5 rounded-xl glass-input text-white text-xs" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-white/70 mb-1">Expiry Date</label>
                    <input type="text" placeholder="MM/YY" className="w-full p-2.5 rounded-xl glass-input text-white text-xs" />
                  </div>
                  <div>
                    <label className="block text-white/70 mb-1">CVV</label>
                    <input type="password" maxLength={4} placeholder="•••" className="w-full p-2.5 rounded-xl glass-input text-white text-xs" />
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: Wallets */}
            {activePaymentTab === 'wallet' && (
              <div className="space-y-3 py-4 text-xs">
                <p className="text-white/70">Select digital wallet:</p>
                <div className="grid grid-cols-2 gap-2">
                  {['Paytm Wallet', 'Amazon Pay', 'PhonePe Wallet', 'Mobikwik'].map(w => (
                    <button key={w} className="p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-amber-400 text-white font-semibold cursor-pointer">
                      {w}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setStep('config')}
                className="w-1/3 py-3 rounded-xl glass-panel text-white/70 font-bold text-xs hover:text-white cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={handleConfirmPayment}
                disabled={isProcessing}
                className="w-2/3 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Verify & Complete Payment</span>
              </button>
            </div>

          </div>
        )}

        {/* STEP 3: Banking Verification Loader */}
        {step === 'verifying' && (
          <div className="p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-full border-4 border-amber-400 border-t-transparent animate-spin mx-auto"></div>
            <h4 className="text-lg font-bold text-white font-serif">Verifying UPI Payment...</h4>
            <p className="text-xs text-amber-300 font-mono">Communicating with NPCI Bank Gateway for ₹{grandTotal.toLocaleString('en-IN')}...</p>
          </div>
        )}

        {/* STEP 4: VIP Digital Entry Pass Ticket Output */}
        {step === 'pass' && confirmedBooking && (
          <div className="p-6 space-y-6">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-400 mx-auto mb-2">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white font-serif">Activity Pass Confirmed!</h3>
              <p className="text-xs text-emerald-400 font-semibold">Pass ID: {confirmedBooking.id}</p>
            </div>

            {/* Printable Pass Card */}
            <div id="printable-pass" className="p-5 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-amber-400/40 shadow-2xl space-y-4 relative overflow-hidden">
              <div className="flex justify-between items-start border-b border-white/10 pb-3">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold uppercase">
                    {confirmedBooking.category}
                  </span>
                  <h4 className="text-lg font-bold text-white mt-1">{confirmedBooking.activityTitle}</h4>
                  <p className="text-xs text-white/60">{confirmedBooking.location}</p>
                </div>
                <div className="p-2 bg-white rounded-xl">
                  <QRCodeSVG value={`PRIMESHOW-PASS-${confirmedBooking.id}`} size={64} level="H" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-white/40 block text-[10px]">Validity Period</span>
                  <span className="text-white font-semibold">{confirmedBooking.validity}</span>
                </div>
                <div>
                  <span className="text-white/40 block text-[10px]">Passes Quantity</span>
                  <span className="text-amber-400 font-bold">{confirmedBooking.ticketCount} Entry Pass(es)</span>
                </div>
                <div>
                  <span className="text-white/40 block text-[10px]">Total Paid</span>
                  <span className="text-emerald-400 font-bold">₹{confirmedBooking.totalAmount.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-white/40 block text-[10px]">Transaction Ref</span>
                  <span className="text-white/80 font-mono text-[11px]">{confirmedBooking.transactionId}</span>
                </div>
              </div>

              {/* Pass Benefits List */}
              {confirmedBooking.benefits && confirmedBooking.benefits.length > 0 && (
                <div className="border-t border-white/10 pt-3 space-y-1.5">
                  <span className="text-[10px] text-amber-400 uppercase font-bold tracking-wider block">Included Pass Perks:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {confirmedBooking.benefits.map((b, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[11px] text-white/80">
                        ✓ {b}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons: PDF Download, Print & Share */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              <button
                onClick={handleDownloadPDF}
                className="py-3 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                <Download className="w-4 h-4" /> Download PDF
              </button>

              <button
                onClick={handlePrintPass}
                className="py-3 px-3 rounded-xl glass-panel text-white hover:bg-white/10 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-purple-400" /> Print Ticket
              </button>

              <button
                onClick={handleSharePass}
                className="py-3 px-3 rounded-xl glass-panel text-white hover:bg-white/10 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-emerald-400" /> Share Pass
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
