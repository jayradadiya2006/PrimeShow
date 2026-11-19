import React, { useState } from 'react';
import { 
  X, CheckCircle2, QrCode, CreditCard, Building2, Wallet, Copy, Check, 
  Download, Printer, Share2, Calendar, MapPin, Ticket, ShieldCheck, Sparkles 
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { jsPDF } from 'jspdf';
import { useAuth } from '../context/AuthContext';
import { VerifiedTicketModal } from './VerifiedTicketModal';

export const EventBookingModal = ({ isOpen, onClose, event, onBookingSuccess }) => {
  const { user } = useAuth();

  const [step, setStep] = useState('summary'); // 'summary' | 'payment' | 'confirmation'
  const [ticketCount, setTicketCount] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('UPI'); // 'UPI' | 'NetBanking' | 'Card' | 'Wallet'

  // Form Fields
  const [upiVpa, setUpiVpa] = useState('user@okaxis');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [selectedWallet, setSelectedWallet] = useState('Paytm Wallet');
  const [cardNumber, setCardNumber] = useState('4532 8921 7739 1092');
  const [cardExp, setCardExp] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('892');

  const [isCopiedUpi, setIsCopiedUpi] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [verificationStep, setVerificationStep] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [isQrPassOpen, setIsQrPassOpen] = useState(false);

  if (!isOpen || !event) return null;

  // Real-Time Pricing
  const pricePerTicket = Number(event.price || 499);
  const basePrice = ticketCount * pricePerTicket;
  const convenienceFee = Math.round(basePrice * 0.08);
  const tax = Math.round(basePrice * 0.05);
  const grandTotal = basePrice + convenienceFee + tax;

  // Payee & Dynamic UPI URL Schema
  const payeeName = 'PrimeShow Official Cinema Pass';
  const payeeUpiId = 'pay@primeshow';
  const upiSchemaUrl = `upi://pay?pa=${payeeUpiId}&pn=${encodeURIComponent(payeeName)}&am=${grandTotal}&cu=INR`;

  const handleCopyUpiId = () => {
    navigator.clipboard.writeText(payeeUpiId);
    setIsCopiedUpi(true);
    setTimeout(() => setIsCopiedUpi(false), 2500);
  };

  const handlePayNow = () => {
    setIsProcessing(true);
    setVerificationStep(`Connecting NPCI Payment Gateway for ₹${grandTotal.toLocaleString('en-IN')}...`);

    setTimeout(() => {
      setVerificationStep(`Verifying Instant Settlement with ${paymentMethod}...`);
    }, 800);

    setTimeout(() => {
      const bookingData = {
        id: `ev_bk_${Math.floor(100000 + Math.random() * 900000)}`,
        eventId: event.id,
        eventTitle: event.title,
        category: event.category || 'Live Concert',
        venue: event.venue,
        date: event.date,
        time: event.time,
        ticketCount,
        pricePerTicket,
        basePrice,
        convenienceFee,
        tax,
        totalAmount: grandTotal,
        paymentMethod: paymentMethod === 'UPI' ? `Dynamic UPI (${payeeUpiId})` : 
                       paymentMethod === 'NetBanking' ? `NetBanking (${selectedBank})` : 
                       paymentMethod === 'Card' ? 'Credit / Debit Card' : `Wallet (${selectedWallet})`,
        transactionId: `TXN-EV-${Math.floor(100000 + Math.random() * 900000)}`,
        userEmail: user?.email || 'guest@primeshow.com',
        userName: user?.name || 'VIP Guest',
        bookingDate: new Date().toISOString()
      };

      setConfirmedBooking(bookingData);
      setIsProcessing(false);
      setVerificationStep('');
      setStep('confirmation');

      if (onBookingSuccess) {
        onBookingSuccess(bookingData);
      }
    }, 1800);
  };

  const handleDownloadPDF = () => {
    if (!confirmedBooking) return;
    const doc = new jsPDF();
    doc.setFillColor(255, 253, 247);
    doc.rect(0, 0, 210, 297, 'F');
    
    doc.setFillColor(217, 0, 0);
    doc.rect(0, 0, 210, 36, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('sans', 'bold');
    doc.setFontSize(20);
    doc.text('PrimeShow Verified Event Pass', 105, 22, { align: 'center' });
    doc.setFontSize(10);
    doc.text('OFFICIAL LIVE EVENT PASS & ENTRY PERMIT', 105, 30, { align: 'center' });

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(16);
    doc.text(confirmedBooking.eventTitle, 20, 52);

    doc.setFontSize(11);
    doc.setFont('sans', 'normal');
    doc.text(`Venue: ${confirmedBooking.venue}`, 20, 65);
    doc.text(`Date & Showtime: ${confirmedBooking.date} @ ${confirmedBooking.time}`, 20, 77);
    doc.text(`Tickets Issued: ${confirmedBooking.ticketCount} VIP Entry Pass(es)`, 20, 89);
    doc.text(`Pass ID: ${confirmedBooking.id}`, 20, 101);
    doc.text(`Transaction ID: ${confirmedBooking.transactionId}`, 20, 113);
    doc.text(`Total Amount Paid: INR ${confirmedBooking.totalAmount}`, 20, 125);

    doc.save(`PrimeShow_${confirmedBooking.eventTitle.replace(/\s+/g, '_')}_Pass.pdf`);
  };

  const handlePrint = () => { window.print(); };

  const handleShare = async () => {
    if (navigator.share && confirmedBooking) {
      try {
        await navigator.share({
          title: `PrimeShow Event Pass: ${confirmedBooking.eventTitle}`,
          text: `I just booked ${confirmedBooking.ticketCount} tickets for ${confirmedBooking.eventTitle} at ${confirmedBooking.venue}!`,
          url: `${window.location.origin}/?ticketId=${confirmedBooking.id}`
        });
      } catch (e) {}
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/?ticketId=${confirmedBooking?.id}`);
      alert(`Event Pass Copied! Booking ID: ${confirmedBooking?.id}`);
    }
  };

  const ticketPassUrl = confirmedBooking ? (
    typeof window !== 'undefined'
      ? `${window.location.origin}/?ticketId=${confirmedBooking.id}`
      : `https://prime-show-tau.vercel.app/?ticketId=${confirmedBooking.id}`
  ) : upiSchemaUrl;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in font-sans overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#FFFDF7] rounded-3xl p-5 sm:p-7 border-2 border-[#D90000] shadow-2xl text-slate-900 max-h-[85vh] overflow-y-auto my-auto scrollbar-thin animate-scale-up">
        
        {/* Prominent Exit / Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-black border border-slate-300 shadow-sm transition-all cursor-pointer z-[220] flex items-center justify-center"
          title="Close Modal"
          aria-label="Close Modal"
        >
          <X className="w-5 h-5 text-slate-800" />
        </button>

        {/* STEP 1: SUMMARY & TICKET QUANTITY */}
        {step === 'summary' && (
          <div className="space-y-5">
            <div className="border-b border-slate-200 pb-3 pr-10">
              <span className="px-2.5 py-0.5 rounded-full bg-[#D90000] text-white font-black text-[10px] uppercase shadow-xs">
                {event.category || 'Live Event'}
              </span>
              <h2 className="text-xl sm:text-2xl font-black font-sans text-slate-900 mt-1">{event.title}</h2>
              <p className="text-xs text-slate-600 font-medium flex items-center gap-2 mt-1">
                <MapPin className="w-3.5 h-3.5 text-[#D90000]" />
                <span>{event.venue}</span>
                <span>•</span>
                <Calendar className="w-3.5 h-3.5 text-[#D90000]" />
                <span>{event.date} @ {event.time}</span>
              </p>
            </div>

            {/* Ticket Quantity Selector */}
            <div className="p-4 rounded-2xl bg-[#DBCEA5] border border-[#c5ba92] space-y-3 shadow-xs text-slate-900">
              <label className="block text-xs font-black text-[#D90000] uppercase tracking-wider">
                Select Number of Tickets
              </label>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5, 6, 8, 10].map(qty => (
                  <button
                    key={qty}
                    onClick={() => setTicketCount(qty)}
                    className={`w-11 h-11 rounded-xl border font-black text-xs transition-all cursor-pointer shadow-2xs ${
                      ticketCount === qty
                        ? 'bg-[#D90000] text-white border-[#D90000] shadow-md scale-105'
                        : 'bg-white text-slate-800 hover:bg-slate-100 border-slate-300'
                    }`}
                  >
                    {qty}
                  </button>
                ))}
              </div>
            </div>

            {/* Real-Time Price Breakdown */}
            <div className="bg-white p-4 rounded-2xl border border-slate-300 space-y-2 text-xs text-slate-900 shadow-xs">
              <div className="flex justify-between text-slate-600">
                <span>Tickets ({ticketCount} @ ₹{pricePerTicket.toLocaleString('en-IN')}/ticket)</span>
                <span className="text-slate-900 font-bold">₹{basePrice.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Convenience Fee (8%)</span>
                <span className="text-slate-900 font-bold">₹{convenienceFee.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST & Taxes (5%)</span>
                <span className="text-slate-900 font-bold">₹{tax.toLocaleString('en-IN')}</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex items-center justify-between text-base font-bold text-slate-900">
                <span className="text-slate-800">Grand Total Amount</span>
                <span className="text-[#D90000] font-sans text-2xl font-black">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              onClick={() => setStep('payment')}
              className="w-full py-3.5 sm:py-4 rounded-2xl bg-[#D90000] hover:bg-[#b00000] text-white font-black font-sans text-xs sm:text-sm uppercase tracking-wider shadow-md hover:brightness-110 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <span>Proceed to Secure Payment Gateway →</span>
            </button>
          </div>
        )}

        {/* STEP 2: PAYMENT GATEWAY */}
        {step === 'payment' && (
          <div className="space-y-5 text-slate-900">
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Select 1 of 4 Payment Options
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'UPI', label: 'Dynamic UPI & QR', icon: QrCode },
                { id: 'NetBanking', label: 'Net Banking', icon: Building2 },
                { id: 'Card', label: 'Credit / Debit', icon: CreditCard },
                { id: 'Wallet', label: 'Wallets & Online', icon: Wallet }
              ].map((m) => {
                const Icon = m.icon;
                const isActive = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id)}
                    className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
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
            {paymentMethod === 'UPI' && (
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-300 space-y-4 animate-fade-in text-slate-900 shadow-xs">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-5 sm:gap-6">
                  
                  {/* Interactive SVG QR Code Renderer */}
                  <div 
                    onClick={handlePayNow}
                    className="bg-white p-2.5 rounded-2xl shadow-md shrink-0 border-2 border-slate-300 hover:border-[#D90000] flex flex-col items-center cursor-pointer hover:scale-105 active:scale-95 transition-all group"
                    title="Click QR to Pay & Issue VIP Pass"
                  >
                    <QRCodeSVG
                      value={upiSchemaUrl}
                      size={155}
                      level="H"
                      includeMargin={true}
                    />
                    <span className="text-[10px] font-extrabold text-[#D90000] uppercase tracking-wider mt-1.5 flex items-center gap-1 group-hover:underline">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#66DD6A]" /> Click QR to Pay & Get Pass
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
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Enter VPA ID for UPI push notification:</label>
                      <input
                        type="text"
                        value={upiVpa}
                        onChange={(e) => setUpiVpa(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-white text-slate-900 border border-slate-300 text-xs font-mono placeholder:text-slate-400 focus:border-[#D90000] focus:outline-none shadow-inner"
                        placeholder="username@upi"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* NET BANKING */}
            {paymentMethod === 'NetBanking' && (
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-300 space-y-3 text-xs animate-fade-in text-slate-900 shadow-xs">
                <label className="block text-xs font-bold text-slate-900 mb-1">Select Net Banking Partner</label>
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
            {paymentMethod === 'Card' && (
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-300 space-y-3 text-xs animate-fade-in text-slate-900 shadow-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-900 mb-1">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white text-slate-900 border border-slate-300 text-xs font-mono placeholder:text-slate-400 focus:border-[#D90000] focus:outline-none shadow-inner"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-900 mb-1">Expiry Date</label>
                    <input
                      type="text"
                      value={cardExp}
                      onChange={(e) => setCardExp(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-white text-slate-900 border border-slate-300 text-xs font-mono placeholder:text-slate-400 focus:border-[#D90000] focus:outline-none shadow-inner"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-900 mb-1">CVV Code</label>
                    <input
                      type="password"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-white text-slate-900 border border-slate-300 text-xs font-mono placeholder:text-slate-400 focus:border-[#D90000] focus:outline-none shadow-inner"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* WALLETS */}
            {paymentMethod === 'Wallet' && (
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
                ← Back to Ticket Selection
              </button>

              <button
                disabled={isProcessing}
                onClick={handlePayNow}
                className="px-6 py-3.5 rounded-2xl bg-[#D90000] hover:bg-[#b00000] text-white font-extrabold font-sans text-xs shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-60 transition-all"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                    <span>{verificationStep || `Verifying Settlement...`}</span>
                  </div>
                ) : (
                  <span>Pay ₹{grandTotal.toLocaleString('en-IN')} & Issue VIP Pass</span>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: CONFIRMATION & VIP EVENT PASS GENERATOR */}
        {step === 'confirmation' && confirmedBooking && (
          <div className="space-y-5 text-center animate-fade-in text-slate-900">
            <div className="inline-flex p-3 rounded-full bg-emerald-100 border-2 border-emerald-400 text-emerald-800 mb-2 shadow-md">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>

            <div>
              <h3 className="text-2xl font-black font-sans text-slate-900">VIP Event Pass Issued!</h3>
              <p className="text-xs text-[#D90000] font-bold">Verified NPCI UPI Settlement for {confirmedBooking.eventTitle}</p>
            </div>

            {/* Digital Event Pass Card */}
            <div className="p-6 rounded-3xl bg-[#DBCEA5] border border-[#c5ba92] text-left relative overflow-hidden shadow-md text-slate-900">
              <div className="flex items-center justify-between border-b border-[#c5ba92] pb-4 mb-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#D90000]">PrimeShow Official VIP Event Pass</span>
                  <h4 className="text-xl font-black font-sans text-slate-900">{confirmedBooking.eventTitle}</h4>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-600 block font-semibold">Pass ID</span>
                  <span className="font-mono text-xs font-bold text-[#D90000]">{confirmedBooking.id}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs mb-4">
                <div>
                  <span className="text-slate-600 block text-[10px] font-semibold">Venue / Location</span>
                  <span className="font-black font-sans text-slate-900 text-sm">{confirmedBooking.venue}</span>
                </div>
                <div>
                  <span className="text-slate-600 block text-[10px] font-semibold">Date & Showtime</span>
                  <span className="font-black font-sans text-[#D90000] text-sm">{confirmedBooking.date} @ {confirmedBooking.time}</span>
                </div>
                <div>
                  <span className="text-slate-600 block text-[10px] font-semibold">Issued Tickets</span>
                  <span className="font-black font-sans text-emerald-800 text-sm">{confirmedBooking.ticketCount} VIP Entry Ticket(s)</span>
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
                  title="Click / Select QR to View Official Pass"
                >
                  <QRCodeSVG value={ticketPassUrl} size={90} level="H" />
                  <span className="text-[9px] font-black text-[#D90000] mt-1 group-hover:underline flex items-center gap-0.5">
                    <QrCode className="w-2.5 h-2.5" /> Select QR / View Pass
                  </span>
                </div>

                <div className="text-center sm:text-right">
                  <span className="text-[10px] text-slate-600 block font-semibold">Total Amount Paid</span>
                  <span className="text-xl sm:text-2xl font-black font-sans text-[#D90000]">₹{confirmedBooking.totalAmount.toLocaleString('en-IN')}</span>
                  <span className="text-[10px] text-emerald-800 font-bold block mt-0.5">
                    ✓ Verified NPCI Settlement • Direct Gate Entry
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
              <button
                onClick={handleDownloadPDF}
                className="py-3 px-3 rounded-2xl bg-[#D90000] hover:bg-[#b00000] text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download Pass (PDF)</span>
              </button>

              <button
                onClick={handlePrint}
                className="py-3 px-3 rounded-2xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-900 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <Printer className="w-4 h-4 text-[#D90000]" />
                <span>Print Ticket</span>
              </button>

              <button
                onClick={handleShare}
                className="py-3 px-3 rounded-2xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-900 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <Share2 className="w-4 h-4 text-emerald-600" />
                <span>Share Pass</span>
              </button>
            </div>

            <div className="pt-2">
              <button
                onClick={onClose}
                className="w-full py-3.5 rounded-2xl bg-[#D90000] hover:bg-[#b00000] text-white font-black text-xs uppercase tracking-wider shadow-md hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                <span>Close & Return to Events</span>
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Interactive Official Verified QR Pass Modal */}
      {isQrPassOpen && confirmedBooking && (
        <VerifiedTicketModal
          isOpen={isQrPassOpen}
          onClose={() => setIsQrPassOpen(false)}
          ticket={{
            id: confirmedBooking.id,
            movieTitle: confirmedBooking.eventTitle,
            theatreName: confirmedBooking.venue,
            screenName: 'Live Event Arena',
            showDate: confirmedBooking.date,
            showTime: confirmedBooking.time,
            seats: `${confirmedBooking.ticketCount} VIP Entry Ticket(s)`,
            tier: confirmedBooking.category || 'VIP Entry',
            totalAmount: confirmedBooking.totalAmount,
            transactionId: confirmedBooking.transactionId
          }}
        />
      )}
    </div>
  );
};
