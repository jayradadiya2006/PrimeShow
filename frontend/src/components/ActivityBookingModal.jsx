import React, { useState } from 'react';
import { 
  X, CheckCircle2, Ticket, QrCode, CreditCard, Building2, Wallet, 
  Copy, Check, ShieldCheck, Printer, Share2, Sparkles, AlertTriangle 
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { jsPDF } from 'jspdf';
import { useAuth } from '../context/AuthContext';
import { VerifiedTicketModal } from './VerifiedTicketModal';

export const ActivityBookingModal = ({ isOpen, onClose, activity, onBookingSuccess }) => {
  const { user } = useAuth();

  const [step, setStep] = useState('config'); // 'config' | 'payment' | 'verifying' | 'pass'
  const [ticketCount, setTicketCount] = useState(2);
  const [selectedSlot, setSelectedSlot] = useState(activity?.timeSlots?.[0] || '10:00 AM - 01:00 PM');
  const [paymentMethod, setPaymentMethod] = useState('UPI'); // 'UPI' | 'Cards' | 'NetBanking' | 'Wallets'

  // Payment Form Fields
  const [upiVpa, setUpiVpa] = useState('user@okaxis');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [selectedWallet, setSelectedWallet] = useState('Paytm Wallet');
  const [cardNumber, setCardNumber] = useState('4532 8921 7739 1092');
  const [cardExp, setCardExp] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('892');

  const [isCopiedUpi, setIsCopiedUpi] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [isQrPassOpen, setIsQrPassOpen] = useState(false);

  if (!isOpen || !activity) return null;

  // Real-Time Pricing
  const pricePerPerson = Number(activity.price || 499);
  const basePrice = ticketCount * pricePerPerson;
  const convenienceFee = Math.round(basePrice * 0.08);
  const tax = Math.round(basePrice * 0.05);
  const grandTotal = basePrice + convenienceFee + tax;

  // Payee & Dynamic UPI Schema
  const payeeName = 'PrimeShow Official Cinema Pass';
  const payeeUpiId = 'pay@primeshow';
  const upiSchemaUrl = `upi://pay?pa=${payeeUpiId}&pn=${encodeURIComponent(payeeName)}&am=${grandTotal}&cu=INR`;

  const handleCopyUpiId = () => {
    navigator.clipboard.writeText(payeeUpiId);
    setIsCopiedUpi(true);
    setTimeout(() => setIsCopiedUpi(false), 2500);
  };

  const handleProcessPayment = () => {
    setStep('verifying');

    setTimeout(() => {
      const bookingData = {
        id: `act_bk_${Math.floor(100000 + Math.random() * 900000)}`,
        activityId: activity.id,
        activityTitle: activity.title,
        category: activity.category || 'Recreation',
        venue: activity.location || 'Surat Adventure Arena',
        timeSlot: selectedSlot,
        ticketCount,
        pricePerPerson,
        basePrice,
        convenienceFee,
        tax,
        totalAmount: grandTotal,
        paymentMethod: paymentMethod === 'UPI' ? `Dynamic UPI (${payeeUpiId})` : 
                       paymentMethod === 'NetBanking' ? `NetBanking (${selectedBank})` : 
                       paymentMethod === 'Cards' ? 'Credit / Debit Card' : `Wallet (${selectedWallet})`,
        transactionId: `TXN-ACT-${Math.floor(100000 + Math.random() * 900000)}`,
        userEmail: user?.email || 'guest@primeshow.com',
        userName: user?.name || 'VIP Guest',
        bookingDate: new Date().toISOString()
      };

      setConfirmedBooking(bookingData);
      setStep('pass');

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
    doc.text('PrimeShow Activity Entry Pass', 105, 22, { align: 'center' });
    doc.setFontSize(10);
    doc.text('OFFICIAL DIGITAL ADVENTURE & ACTIVITY PASS', 105, 30, { align: 'center' });

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(16);
    doc.text(confirmedBooking.activityTitle, 20, 52);

    doc.setFontSize(11);
    doc.setFont('sans', 'normal');
    doc.text(`Location: ${confirmedBooking.venue}`, 20, 65);
    doc.text(`Time Slot: ${confirmedBooking.timeSlot}`, 20, 77);
    doc.text(`Passes Issued: ${confirmedBooking.ticketCount} Participant(s)`, 20, 89);
    doc.text(`Pass ID: ${confirmedBooking.id}`, 20, 101);
    doc.text(`Transaction ID: ${confirmedBooking.transactionId}`, 20, 113);
    doc.text(`Total Amount Paid: INR ${confirmedBooking.totalAmount}`, 20, 125);

    doc.save(`PrimeShow_${confirmedBooking.activityTitle.replace(/\s+/g, '_')}_Pass.pdf`);
  };

  const handlePrint = () => { window.print(); };

  const handleShare = () => {
    if (navigator.share && confirmedBooking) {
      navigator.share({
        title: `PrimeShow Activity Pass: ${confirmedBooking.activityTitle}`,
        text: `I just reserved ${confirmedBooking.ticketCount} passes for ${confirmedBooking.activityTitle}!`,
        url: `${window.location.origin}/?ticketId=${confirmedBooking.id}`
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/?ticketId=${confirmedBooking?.id}`);
      alert('Pass booking link copied to clipboard!');
    }
  };

  const ticketPassUrl = confirmedBooking ? (
    typeof window !== 'undefined'
      ? `${window.location.origin}/?ticketId=${confirmedBooking.id}`
      : `https://prime-show-tau.vercel.app/?ticketId=${confirmedBooking.id}`
  ) : upiSchemaUrl;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in font-sans overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#FFFDF7] rounded-3xl border-2 border-[#D90000] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] my-auto animate-scale-up text-slate-900">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#c5ba92] bg-[#DBCEA5] shrink-0 text-slate-900 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#D90000] flex items-center justify-center text-white shadow-xs">
              <Ticket className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-base font-black font-sans text-slate-900">Activity Pass Checkout</h3>
              <p className="text-[11px] text-[#D90000] font-bold">PrimeShow Adventure & Theme Park Pass</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 hover:text-black shadow-xs transition-all cursor-pointer"
            title="Close Modal"
            aria-label="Close Modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto flex-1 p-5 space-y-5 text-slate-900">
          
          {/* STEP 1: Pass Configuration & Quantity Selection */}
          {step === 'config' && (
            <div className="space-y-4">
              {/* Activity Card Banner */}
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#DBCEA5] border border-[#c5ba92] text-slate-900 shadow-xs">
                {activity.image && (
                  <img 
                    src={activity.image} 
                    alt={activity.title} 
                    className="w-16 h-16 rounded-xl object-cover border border-[#c5ba92] shrink-0 shadow-xs" 
                  />
                )}
                <div>
                  <span className="px-2 py-0.5 rounded-full bg-[#D90000] text-white text-[9px] font-black uppercase shadow-xs">
                    {activity.category || 'Activity'}
                  </span>
                  <h4 className="font-black font-sans text-base text-slate-900 mt-1">{activity.title}</h4>
                  <p className="text-xs text-slate-700 font-medium">{activity.location}</p>
                </div>
              </div>

              {/* Time Slot Picker */}
              {activity.timeSlots && activity.timeSlots.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-900 uppercase tracking-wider block">
                    Choose Schedule Time Slot
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {activity.timeSlots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setSelectedSlot(slot)}
                        className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer shadow-2xs ${
                          selectedSlot === slot
                            ? 'bg-[#D90000] text-white border-[#D90000] shadow-sm'
                            : 'bg-white text-slate-800 hover:bg-slate-100 border-slate-300'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Participant Quantity Selector */}
              <div className="p-4 rounded-2xl bg-white border border-slate-300 space-y-2.5 shadow-xs">
                <label className="text-xs font-black text-[#D90000] uppercase tracking-wider block">
                  Select Number of Participants
                </label>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5, 6, 8, 10].map((qty) => (
                    <button
                      key={qty}
                      onClick={() => setTicketCount(qty)}
                      className={`w-10 h-10 rounded-xl border font-black text-xs transition-all cursor-pointer shadow-2xs ${
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

              {/* Price Breakdown */}
              <div className="p-4 rounded-2xl bg-white border border-slate-300 space-y-2 text-xs text-slate-900 shadow-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Entry Passes ({ticketCount} @ ₹{pricePerPerson})</span>
                  <span className="font-bold text-slate-900">₹{basePrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Convenience Fee (8%)</span>
                  <span className="font-bold text-slate-900">₹{convenienceFee.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>GST & Platform Tax (5%)</span>
                  <span className="font-bold text-slate-900">₹{tax.toLocaleString('en-IN')}</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between items-center text-sm font-black text-slate-900">
                  <span>Grand Total</span>
                  <span className="text-2xl font-black font-sans text-[#D90000]">₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                onClick={() => setStep('payment')}
                className="w-full py-3.5 sm:py-4 rounded-2xl bg-[#D90000] hover:bg-[#b00000] text-white font-black font-sans text-xs sm:text-sm uppercase tracking-wider shadow-md hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer"
              >
                Proceed to Secure Payment →
              </button>
            </div>
          )}

          {/* STEP 2: Payment Gateway Selection */}
          {step === 'payment' && (
            <div className="space-y-4 text-slate-900">
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Select Payment Option
              </div>

              {/* Gateway Tabs */}
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'UPI', label: 'UPI & QR', icon: QrCode },
                  { id: 'Cards', label: 'Cards', icon: CreditCard },
                  { id: 'NetBanking', label: 'Banking', icon: Building2 },
                  { id: 'Wallets', label: 'Wallets', icon: Wallet },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = paymentMethod === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setPaymentMethod(tab.id)}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-[11px] font-bold cursor-pointer transition-all shadow-2xs ${
                        isActive
                          ? 'bg-[#D90000] text-white border-[#D90000] shadow-md'
                          : 'bg-white text-slate-800 hover:bg-slate-100 border-slate-300'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic UPI QR Code */}
              {paymentMethod === 'UPI' && (
                <div className="p-4 rounded-2xl bg-white border border-slate-300 space-y-3 shadow-xs">
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div 
                      onClick={handleProcessPayment}
                      className="bg-white p-2 rounded-2xl shadow-md border-2 border-slate-300 hover:border-[#D90000] flex flex-col items-center cursor-pointer hover:scale-105 active:scale-95 transition-all group shrink-0"
                      title="Click QR to Pay & Issue Pass"
                    >
                      <QRCodeSVG
                        value={upiSchemaUrl}
                        size={130}
                        level="H"
                        includeMargin={true}
                      />
                      <span className="text-[9px] font-black text-[#D90000] uppercase tracking-wider mt-1 group-hover:underline">
                        Click QR to Pay
                      </span>
                    </div>

                    <div className="flex-1 space-y-2 text-left w-full">
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[9px] text-slate-500 uppercase font-bold block">Payee Beneficiary</span>
                        <span className="text-xs font-bold text-slate-900">{payeeName}</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-[#DBCEA5] border border-[#c5ba92] flex items-center justify-between">
                        <div>
                          <span className="text-[9px] text-slate-700 font-bold block">UPI ID</span>
                          <span className="text-xs font-mono font-bold text-[#D90000]">{payeeUpiId}</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleCopyUpiId}
                          className="px-2.5 py-1 rounded-lg bg-[#D90000] text-white hover:bg-[#b00000] text-[10px] font-bold cursor-pointer"
                        >
                          {isCopiedUpi ? 'Copied!' : 'Copy'}
                        </button>
                      </div>

                      <input
                        type="text"
                        value={upiVpa}
                        onChange={(e) => setUpiVpa(e.target.value)}
                        placeholder="username@upi"
                        className="w-full p-2 rounded-xl bg-white text-slate-900 border border-slate-300 text-xs font-mono focus:border-[#D90000] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Cards Tab */}
              {paymentMethod === 'Cards' && (
                <div className="p-4 rounded-2xl bg-white border border-slate-300 space-y-2.5 text-xs shadow-xs">
                  <div>
                    <label className="text-[10px] font-bold text-slate-700 block mb-1">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full p-2 rounded-xl bg-white text-slate-900 border border-slate-300 text-xs font-mono focus:border-[#D90000] focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-700 block mb-1">Expiry</label>
                      <input
                        type="text"
                        value={cardExp}
                        onChange={(e) => setCardExp(e.target.value)}
                        className="w-full p-2 rounded-xl bg-white text-slate-900 border border-slate-300 text-xs font-mono focus:border-[#D90000] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-700 block mb-1">CVV</label>
                      <input
                        type="password"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full p-2 rounded-xl bg-white text-slate-900 border border-slate-300 text-xs font-mono focus:border-[#D90000] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* NetBanking Tab */}
              {paymentMethod === 'NetBanking' && (
                <div className="p-4 rounded-2xl bg-white border border-slate-300 space-y-2 text-xs shadow-xs">
                  <label className="text-[10px] font-bold text-slate-700 block">Select Financial Partner</label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white text-slate-900 border border-slate-300 text-xs font-bold focus:outline-none"
                  >
                    <option value="HDFC Bank">HDFC Bank</option>
                    <option value="ICICI Bank">ICICI Bank</option>
                    <option value="State Bank of India">State Bank of India (SBI)</option>
                    <option value="Axis Bank">Axis Bank</option>
                    <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                  </select>
                </div>
              )}

              {/* Wallets Tab */}
              {paymentMethod === 'Wallets' && (
                <div className="p-4 rounded-2xl bg-white border border-slate-300 space-y-2 text-xs shadow-xs">
                  <label className="text-[10px] font-bold text-slate-700 block">Select Digital Wallet</label>
                  <select
                    value={selectedWallet}
                    onChange={(e) => setSelectedWallet(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white text-slate-900 border border-slate-300 text-xs font-bold focus:outline-none"
                  >
                    <option value="Paytm Wallet">Paytm Wallet</option>
                    <option value="Amazon Pay">Amazon Pay Balance</option>
                    <option value="PhonePe Wallet">PhonePe Wallet</option>
                    <option value="LazyPay">LazyPay Pay Later</option>
                  </select>
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => setStep('config')}
                  className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-800 hover:bg-slate-100 cursor-pointer shadow-xs"
                >
                  ← Back
                </button>
                <button
                  onClick={handleProcessPayment}
                  className="px-6 py-3 rounded-2xl bg-[#D90000] hover:bg-[#b00000] text-white font-extrabold font-sans text-xs shadow-md cursor-pointer transition-all"
                >
                  Pay ₹{grandTotal.toLocaleString('en-IN')} & Issue Pass
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Banking Verification Loader */}
          {step === 'verifying' && (
            <div className="p-8 text-center space-y-3 text-slate-900">
              <div className="w-10 h-10 rounded-full border-4 border-[#D90000] border-t-transparent animate-spin mx-auto"></div>
              <h4 className="text-base font-black font-sans text-slate-900">Verifying Payment...</h4>
              <p className="text-xs text-[#D90000] font-mono font-bold">Processing NPCI settlement for ₹{grandTotal.toLocaleString('en-IN')}...</p>
            </div>
          )}

          {/* STEP 4: Digital Entry Pass Ticket Output */}
          {step === 'pass' && confirmedBooking && (
            <div className="space-y-4 text-slate-900">
              <div className="text-center space-y-0.5">
                <div className="w-10 h-10 rounded-full bg-emerald-100 border-2 border-emerald-400 flex items-center justify-center text-emerald-700 mx-auto mb-1 shadow-md">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-black font-sans text-slate-900">Activity Pass Confirmed!</h3>
                <p className="text-xs text-[#D90000] font-bold">Pass ID: {confirmedBooking.id}</p>
              </div>

              {/* Printable Pass Card */}
              <div className="p-5 rounded-3xl bg-[#DBCEA5] border border-[#c5ba92] shadow-md space-y-3 relative overflow-hidden text-slate-900">
                <div className="flex justify-between items-start border-b border-[#c5ba92] pb-3">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#D90000]">PrimeShow Adventure Pass</span>
                    <h4 className="text-base font-black font-sans text-slate-900">{confirmedBooking.activityTitle}</h4>
                    <p className="text-xs text-slate-700 font-medium">{confirmedBooking.venue}</p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#D90000] text-white text-[10px] font-black shadow-xs">
                    CONFIRMED
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-600 block font-semibold">Scheduled Slot</span>
                    <span className="font-black font-sans text-slate-900 text-xs">{confirmedBooking.timeSlot}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-600 block font-semibold">Issued Passes</span>
                    <span className="font-black font-sans text-[#D90000] text-xs">{confirmedBooking.ticketCount} Participant(s)</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-600 block font-semibold">Payment</span>
                    <span className="font-bold text-slate-900 text-xs">{confirmedBooking.paymentMethod}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-600 block font-semibold">Total Paid</span>
                    <span className="font-black font-sans text-emerald-800 text-xs">₹{confirmedBooking.totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Scannable Pass QR Code */}
                <div className="pt-3 border-t border-[#c5ba92] flex items-center justify-between">
                  <div 
                    onClick={() => setIsQrPassOpen(true)}
                    className="bg-white p-2 rounded-xl border-2 border-slate-300 hover:border-[#D90000] shadow-xs cursor-pointer hover:scale-105 active:scale-95 transition-all group flex flex-col items-center"
                    title="Click to Select QR / View Pass"
                  >
                    <QRCodeSVG value={ticketPassUrl} size={65} level="H" />
                    <span className="text-[8px] font-black text-[#D90000] mt-0.5 group-hover:underline">Select QR</span>
                  </div>
                  <div className="text-right text-[10px] text-slate-700 font-semibold leading-relaxed">
                    <span className="text-emerald-800 font-bold block">✓ Verified NPCI Settlement</span>
                    Present this digital QR at entrance.
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={handleDownloadPDF}
                  className="py-2.5 px-2 rounded-xl bg-[#D90000] hover:bg-[#b00000] text-white font-bold text-xs flex items-center justify-center gap-1 shadow-md cursor-pointer transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PDF Pass</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="py-2.5 px-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-900 font-bold text-xs flex items-center justify-center gap-1 shadow-xs cursor-pointer transition-colors"
                >
                  <Printer className="w-3.5 h-3.5 text-[#D90000]" />
                  <span>Print</span>
                </button>
                <button
                  onClick={handleShare}
                  className="py-2.5 px-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-900 font-bold text-xs flex items-center justify-center gap-1 shadow-xs cursor-pointer transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Share</span>
                </button>
              </div>

              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-all cursor-pointer"
              >
                Close Pass
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Interactive Official Verified QR Pass Modal */}
      {isQrPassOpen && confirmedBooking && (
        <VerifiedTicketModal
          isOpen={isQrPassOpen}
          onClose={() => setIsQrPassOpen(false)}
          ticket={{
            id: confirmedBooking.id,
            movieTitle: confirmedBooking.activityTitle,
            theatreName: confirmedBooking.venue,
            screenName: 'Adventure Arena',
            showDate: new Date().toISOString().split('T')[0],
            showTime: confirmedBooking.timeSlot,
            seats: `${confirmedBooking.ticketCount} Pass(es)`,
            tier: confirmedBooking.category || 'Activity Pass',
            totalAmount: confirmedBooking.totalAmount,
            transactionId: confirmedBooking.transactionId
          }}
        />
      )}
    </div>
  );
};
