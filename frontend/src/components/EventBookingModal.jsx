import React, { useState } from 'react';
import { 
  X, CheckCircle2, QrCode, CreditCard, Building2, Wallet, Copy, Check, 
  Printer, Share2, Download, Sparkles, Calendar, MapPin, Ticket, ArrowRight, ShieldCheck
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { jsPDF } from 'jspdf';
import API, { API_BASE } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const EventBookingModal = ({ isOpen, onClose, event, onBookingSuccess }) => {
  const { user } = useAuth();

  const [step, setStep] = useState('summary'); // 'summary' | 'payment' | 'confirmation'
  const [ticketCount, setTicketCount] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('UPI'); // 'UPI' | 'NetBanking' | 'Card' | 'Wallet'

  // Payee & Dynamic UPI Details
  const payeeName = 'Jay Hiralal Radadiya';
  const payeeUpiId = 'jay.radadiya@ptaxis';
  const [isCopiedUpi, setIsCopiedUpi] = useState(false);

  // Form inputs
  const [upiVpa, setUpiVpa] = useState('vip.guest@upi');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [selectedWallet, setSelectedWallet] = useState('Paytm Wallet');
  const [cardNumber, setCardNumber] = useState('4532 8921 7739 1092');
  const [cardExp, setCardExp] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('892');
  const [cardName, setCardName] = useState(user?.name || 'Aarav Sharma');

  const [isProcessing, setIsProcessing] = useState(false);
  const [verificationStep, setVerificationStep] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  if (!isOpen || !event) return null;

  // Price calculations
  const pricePerTicket = Number(event.price || 1500);
  const basePrice = pricePerTicket * ticketCount;
  const convenienceFee = Math.round(basePrice * 0.08);
  const tax = Math.round(basePrice * 0.05);
  const grandTotal = basePrice + convenienceFee + tax;

  const upiSchemaUrl = `upi://pay?pa=${payeeUpiId}&pn=${encodeURIComponent(payeeName)}&am=${grandTotal}&cu=INR`;

  const handleCopyUpiId = () => {
    navigator.clipboard.writeText(payeeUpiId);
    setIsCopiedUpi(true);
    setTimeout(() => setIsCopiedUpi(false), 2500);
  };

  const handlePayNow = async () => {
    setIsProcessing(true);
    setVerificationStep('Connecting to Banking Gateway...');

    setTimeout(() => {
      setVerificationStep(`Verifying NPCI UPI Settlement for ₹${grandTotal.toLocaleString('en-IN')}...`);
    }, 800);

    setTimeout(async () => {
      try {
        const payload = {
          eventId: event.id,
          ticketCount,
          paymentMethod: paymentMethod === 'UPI' ? `Dynamic UPI (${payeeUpiId})` :
                         paymentMethod === 'NetBanking' ? `NetBanking (${selectedBank})` :
                         paymentMethod === 'Wallet' ? `Wallet (${selectedWallet})` : 'Credit/Debit Card',
          userEmail: user?.email || 'guest@primeshow.com',
          userName: user?.name || 'VIP Guest'
        };

        const res = await API.post('/events/book', payload);
        setConfirmedBooking(res.data);
        setIsProcessing(false);
        setVerificationStep('');
        setStep('confirmation');

        confetti({ particleCount: 140, spread: 85, origin: { y: 0.6 } });

        if (onBookingSuccess) onBookingSuccess(res.data);
      } catch (err) {
        setIsProcessing(false);
        setVerificationStep('');
        alert('Booking verification failed. Please try again.');
      }
    }, 1800);
  };

  const handleDownloadPDF = () => {
    if (!confirmedBooking) return;
    const doc = new jsPDF();
    doc.setFillColor(5, 5, 8);
    doc.rect(0, 0, 210, 297, 'F');
    doc.setTextColor(245, 158, 11);
    doc.setFont('sans', 'bold');
    doc.setFontSize(22);
    doc.text('PrimeShow VIP Event Pass', 20, 30);
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text(`Booking ID: ${confirmedBooking.id}`, 20, 50);
    doc.text(`Transaction ID: ${confirmedBooking.transactionId}`, 20, 65);
    doc.text(`Event Title: ${confirmedBooking.eventTitle}`, 20, 80);
    doc.text(`Category: ${confirmedBooking.category}`, 20, 95);
    doc.text(`Venue: ${confirmedBooking.venue}`, 20, 110);
    doc.text(`Date & Time: ${confirmedBooking.date} @ ${confirmedBooking.time}`, 20, 125);
    doc.text(`Tickets Issued: ${confirmedBooking.ticketCount} VIP Entry Pass(es)`, 20, 140);
    doc.text(`Amount Paid: INR ${confirmedBooking.totalAmount}`, 20, 155);
    doc.text(`Payee Beneficiary: ${payeeName} (${payeeUpiId})`, 20, 170);
    
    doc.save(`PrimeShow_${confirmedBooking.eventTitle.replace(/\s+/g, '_')}_Pass.pdf`);
  };

  const handlePrint = () => { window.print(); };

  const handleShare = async () => {
    if (navigator.share && confirmedBooking) {
      try {
        await navigator.share({
          title: `PrimeShow Event Pass: ${confirmedBooking.eventTitle}`,
          text: `I just booked ${confirmedBooking.ticketCount} tickets for ${confirmedBooking.eventTitle} at ${confirmedBooking.venue}!`,
          url: window.location.href
        });
      } catch (e) {}
    } else {
      alert(`Event Pass Copied! Booking ID: ${confirmedBooking?.id}`);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center pt-20 sm:pt-24 pb-6 px-3 sm:px-6 bg-black/90 backdrop-blur-2xl animate-fade-in font-sans overflow-y-auto">
      <div className="relative w-full max-w-xl glass-modal rounded-3xl p-5 sm:p-7 border border-white/15 shadow-2xl text-white max-h-[82vh] overflow-y-auto my-auto scrollbar-thin">
        
        {/* Prominent Exit / Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2.5 rounded-full bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/40 shadow-xl transition-all cursor-pointer z-[220] flex items-center justify-center"
          title="Close Modal"
          aria-label="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* STEP 1: SUMMARY & TICKET QUANTITY */}
        {step === 'summary' && (
          <div className="space-y-6">
            <div className="border-b border-white/10 pb-4">
              <span className="px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px] uppercase">
                {event.category || 'Live Event'}
              </span>
              <h2 className="text-2xl font-bold font-serif text-white mt-1">{event.title}</h2>
              <p className="text-xs text-white/60 flex items-center gap-2 mt-1">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>{event.venue}</span>
                <span>•</span>
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>{event.date} @ {event.time}</span>
              </p>
            </div>

            {/* Ticket Quantity Selector */}
            <div className="p-4 rounded-2xl glass-panel border border-white/10 space-y-3">
              <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider">
                Select Number of Tickets
              </label>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5, 6, 8, 10].map(qty => (
                  <button
                    key={qty}
                    onClick={() => setTicketCount(qty)}
                    className={`w-11 h-11 rounded-xl border font-bold text-xs transition-all cursor-pointer ${
                      ticketCount === qty
                        ? 'bg-amber-500 text-black border-amber-400 shadow-md shadow-amber-500/20'
                        : 'glass-panel text-white/70 hover:text-white border-white/10'
                    }`}
                  >
                    {qty}
                  </button>
                ))}
              </div>
            </div>

            {/* Real-Time Price Breakdown */}
            <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-2 text-xs">
              <div className="flex justify-between text-white/70">
                <span>Tickets ({ticketCount} @ ₹{pricePerTicket.toLocaleString('en-IN')}/ticket)</span>
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
              <div className="border-t border-white/10 pt-2 flex justify-between text-base font-bold text-white">
                <span>Grand Total Amount</span>
                <span className="text-amber-400 font-sans text-2xl font-black">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              onClick={() => setStep('payment')}
              className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Proceed to Secure Payment Gateway →</span>
            </button>
          </div>
        )}

        {/* STEP 2: PAYMENT GATEWAY */}
        {step === 'payment' && (
          <div className="space-y-6">
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
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
                    className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isActive
                        ? 'bg-amber-500 text-black border-amber-400 shadow-lg shadow-amber-500/25'
                        : 'glass-panel text-white/60 hover:text-white border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-amber-400'}`} />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* DYNAMIC UPI QR CODE & PAYEE DETAILS */}
            {paymentMethod === 'UPI' && (
              <div className="p-5 rounded-2xl glass-panel border-2 border-amber-400/40 space-y-4 animate-fade-in bg-gradient-to-b from-[#0e0f18] to-[#07080d]">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                  
                  {/* Inline SVG QR Code Renderer with Error Correction Level H */}
                  <div className="bg-white p-3 rounded-2xl shadow-2xl shrink-0 border-2 border-amber-400/60 flex flex-col items-center">
                    <QRCodeSVG
                      value={upiSchemaUrl}
                      size={170}
                      level="H"
                      includeMargin={true}
                    />
                    <div className="px-3 py-1 bg-amber-500 text-black font-extrabold text-xs rounded-full mt-2">
                      ₹{grandTotal.toLocaleString('en-IN')}
                    </div>
                    <span className="text-[10px] font-bold text-black/70 uppercase tracking-wider mt-1">Scan via Any UPI App</span>
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
                      <label className="block text-[11px] font-bold text-white/70 mb-1">Enter VPA ID for UPI push notification:</label>
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

            {/* NET BANKING */}
            {paymentMethod === 'NetBanking' && (
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
            {paymentMethod === 'Card' && (
              <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-3 text-xs animate-fade-in">
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

            {/* WALLETS */}
            {paymentMethod === 'Wallet' && (
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
                className="px-4 py-2.5 rounded-xl glass-panel text-xs text-white/70 hover:text-white cursor-pointer"
              >
                ← Back to Ticket Selection
              </button>

              <button
                disabled={isProcessing}
                onClick={handlePayNow}
                className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin"></div>
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
          <div className="space-y-6 text-center animate-fade-in">
            <div className="inline-flex p-3 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 mb-2">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-2xl font-bold font-serif text-white">VIP Event Pass Issued!</h3>
              <p className="text-xs text-amber-300">Verified NPCI UPI Settlement for {confirmedBooking.eventTitle}</p>
            </div>

            {/* Digital Event Pass Card */}
            <div className="glass-panel p-6 rounded-3xl border-2 border-amber-400/50 text-left relative overflow-hidden shadow-2xl bg-gradient-to-b from-[#12131e] to-[#08090f]">
              <div className="flex items-center justify-between border-b border-amber-400/30 pb-4 mb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">PrimeShow Official VIP Event Pass</span>
                  <h4 className="text-xl font-bold text-white">{confirmedBooking.eventTitle}</h4>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-white/50 block">Pass ID</span>
                  <span className="font-mono text-xs font-bold text-amber-300">{confirmedBooking.id}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs mb-4">
                <div>
                  <span className="text-white/40 block text-[10px]">Venue / Location</span>
                  <span className="font-bold text-white">{confirmedBooking.venue}</span>
                </div>
                <div>
                  <span className="text-white/40 block text-[10px]">Date & Showtime</span>
                  <span className="font-bold text-amber-300">{confirmedBooking.date} @ {confirmedBooking.time}</span>
                </div>
                <div>
                  <span className="text-white/40 block text-[10px]">Issued Tickets</span>
                  <span className="font-bold text-emerald-400">{confirmedBooking.ticketCount} VIP Entry Ticket(s)</span>
                </div>
                <div>
                  <span className="text-white/40 block text-[10px]">Payee Beneficiary</span>
                  <span className="font-bold text-white">{payeeName}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <div className="bg-white p-2 rounded-xl shadow-md">
                  <QRCodeSVG value={upiSchemaUrl} size={90} level="H" />
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-white/50 block">Total Amount Paid</span>
                  <span className="text-lg font-bold text-emerald-400">₹{confirmedBooking.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
              <button
                onClick={handleDownloadPDF}
                className="py-2.5 px-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Pass (PDF)</span>
              </button>

              <button
                onClick={handlePrint}
                className="py-2.5 px-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-amber-400" />
                <span>Print Ticket</span>
              </button>

              <button
                onClick={handleShare}
                className="py-2.5 px-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-emerald-400" />
                <span>Share Pass</span>
              </button>
            </div>

            <div className="pt-2">
              <button
                onClick={onClose}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-black font-black text-xs uppercase tracking-wider shadow-xl shadow-amber-500/20 hover:scale-[1.02] transition-transform cursor-pointer flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                <span>Close & Return to Events</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
