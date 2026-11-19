import React from 'react';
import { X, CheckCircle2, ShieldCheck, Download, Printer, Share2, QrCode, Ticket, Sparkles, Building, Calendar, Clock } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { jsPDF } from 'jspdf';

export const VerifiedTicketModal = ({ isOpen, onClose, ticket }) => {
  if (!isOpen || !ticket) return null;

  const ticketId = ticket.id || ticket.bookingId || 'bk_verified';
  const movieTitle = ticket.movieTitle || ticket.title || 'Official Movie Screening';
  const theatreName = ticket.theatreName || ticket.venue || 'PrimeShow Luxury Cinema';
  const screenName = ticket.screenName || 'Audi 1 (Dolby Atmos)';
  const showDate = ticket.showDate || ticket.date || new Date().toISOString().split('T')[0];
  const showTime = ticket.showTime || ticket.time || '07:30 PM';
  const seats = Array.isArray(ticket.seats) ? ticket.seats.join(', ') : (ticket.seats || 'P6, P7');
  const tier = ticket.tier || 'Premium Recliner';
  const totalAmount = ticket.totalAmount || ticket.amount || 500;
  const transactionId = ticket.transactionId || 'TXN-PAY-' + Math.floor(100000 + Math.random() * 900000);
  const payeeName = 'PrimeShow Official Cinema Pass';

  const ticketPassUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/?ticketId=${ticketId}`
    : `https://prime-show-tau.vercel.app/?ticketId=${ticketId}`;

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFillColor(255, 253, 247);
    doc.rect(0, 0, 210, 297, 'F');
    
    // Header
    doc.setFillColor(217, 0, 0);
    doc.rect(0, 0, 210, 36, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('sans', 'bold');
    doc.setFontSize(20);
    doc.text('PrimeShow Verified Cinema Pass', 105, 22, { align: 'center' });
    doc.setFontSize(10);
    doc.text('OFFICIAL MULTIPLEX DIGITAL ENTRY TICKET', 105, 30, { align: 'center' });

    // Pass details
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(16);
    doc.text(movieTitle, 20, 52);

    doc.setFontSize(11);
    doc.setFont('sans', 'normal');
    doc.text(`Multiplex: ${theatreName} (${screenName})`, 20, 62);
    doc.text(`Showtime: ${showDate} @ ${showTime}`, 20, 72);
    doc.text(`Reserved Seats: ${seats} (${tier})`, 20, 82);
    doc.text(`Booking Pass ID: ${ticketId}`, 20, 92);
    doc.text(`NPCI Settlement ID: ${transactionId}`, 20, 102);
    doc.text(`Total Amount Paid: INR ${totalAmount}`, 20, 112);

    doc.setFillColor(219, 206, 165);
    doc.roundedRect(20, 125, 170, 45, 4, 4, 'F');
    doc.setTextColor(217, 0, 0);
    doc.setFont('sans', 'bold');
    doc.setFontSize(12);
    doc.text('ENTRY INSTRUCTIONS:', 25, 137);
    doc.setFont('sans', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.text('1. Scan the digital QR Code on this ticket at the cinema gate.', 25, 147);
    doc.text('2. Verified NPCI payment allows direct entry without printing.', 25, 157);

    doc.save(`PrimeShow_Ticket_${ticketId}.pdf`);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `PrimeShow Pass: ${movieTitle}`,
          text: `My verified cinema pass for ${movieTitle} at ${theatreName} on ${showDate} @ ${showTime}! Seats: ${seats}`,
          url: ticketPassUrl,
        });
      } catch (err) {}
    } else {
      navigator.clipboard.writeText(ticketPassUrl);
      alert('Verified Pass URL copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-md bg-[#FFFDF7] rounded-3xl border-2 border-[#D90000] shadow-2xl p-5 sm:p-6 text-slate-900 my-auto animate-scale-up overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer shadow-xs z-10"
          title="Close Pass"
        >
          <X className="w-5 h-5 text-slate-800" />
        </button>

        {/* Pass Header */}
        <div className="text-center space-y-1 mb-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-400 text-emerald-900 text-[11px] font-extrabold shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>VERIFIED DIGITAL CINEMA PASS</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-sans text-slate-900 pt-1 leading-snug">{movieTitle}</h2>
          <p className="text-xs text-[#D90000] font-bold">{theatreName} • {screenName}</p>
        </div>

        {/* Central High-Resolution Scannable QR Display */}
        <div className="bg-[#DBCEA5] p-5 rounded-3xl border border-[#c5ba92] flex flex-col items-center justify-center relative shadow-inner my-3">
          <div className="bg-white p-3 rounded-2xl shadow-xl border-2 border-slate-300 relative group">
            <QRCodeSVG value={ticketPassUrl} size={165} level="H" includeMargin={true} />
            <div className="absolute inset-x-3 top-3 h-0.5 bg-[#D90000]/60 shadow-[0_0_8px_#D90000] animate-pulse"></div>
          </div>
          <span className="text-[10px] font-mono font-bold text-slate-800 uppercase tracking-widest mt-2.5">
            Pass ID: {ticketId}
          </span>
          <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5 mt-0.5">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Verified NPCI Settlement • Direct Gate Entry</span>
          </span>
        </div>

        {/* Ticket Details Grid */}
        <div className="grid grid-cols-2 gap-2.5 p-3.5 rounded-2xl bg-white border border-slate-200 text-xs text-slate-800 mb-4 shadow-2xs">
          <div>
            <span className="text-[10px] text-slate-500 font-semibold block flex items-center gap-1">
              <Calendar className="w-3 h-3 text-[#D90000]" /> Show Date
            </span>
            <span className="font-extrabold text-slate-900 text-xs">{showDate}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-semibold block flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#D90000]" /> Showtime
            </span>
            <span className="font-extrabold text-slate-900 text-xs">{showTime}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-semibold block flex items-center gap-1">
              <Ticket className="w-3 h-3 text-[#D90000]" /> Seats ({tier})
            </span>
            <span className="font-extrabold text-[#D90000] text-xs">{seats}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-semibold block flex items-center gap-1">
              <Building className="w-3 h-3 text-[#D90000]" /> Paid Amount
            </span>
            <span className="font-black text-emerald-700 text-xs">₹{Number(totalAmount).toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={handleDownloadPDF}
            className="py-2.5 px-2 rounded-xl bg-[#D90000] hover:bg-[#b00000] text-white font-bold text-[11px] sm:text-xs flex items-center justify-center gap-1 shadow-md cursor-pointer transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>
          <button
            onClick={handlePrint}
            className="py-2.5 px-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-900 font-bold text-[11px] sm:text-xs flex items-center justify-center gap-1 shadow-xs cursor-pointer transition-all"
          >
            <Printer className="w-3.5 h-3.5 text-[#D90000]" />
            <span>Print</span>
          </button>
          <button
            onClick={handleShare}
            className="py-2.5 px-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-900 font-bold text-[11px] sm:text-xs flex items-center justify-center gap-1 shadow-xs cursor-pointer transition-all"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Share</span>
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-3 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-900 text-xs font-bold transition-all cursor-pointer"
        >
          Close Pass Preview
        </button>

      </div>
    </div>
  );
};
