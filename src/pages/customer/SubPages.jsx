import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Sparkles, Ticket, Percent, Gift, Briefcase, Copy, Check, Star, MapPin, Send } from 'lucide-react';
import API from '../../services/api';

export function EventsPage() {
  const [events, setEvents] = useState([]);
  useEffect(() => { API.get('/events').then(res => setEvents(res.data)).catch(() => {}); }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 min-h-screen">
      <div className="border-b border-white/10 pb-6">
        <h1 className="font-serif text-4xl font-bold text-white flex items-center gap-3">
          <Calendar className="w-8 h-8 text-indigo-400" /> Live Events & Music Festivals
        </h1>
        <p className="text-xs text-slate-400">Book passes for live arena concerts, standup comedy shows, and DJ festivals.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {events.map((evt) => (
          <div key={evt.id} className="glass-panel rounded-3xl overflow-hidden border-white/10 hover:border-indigo-500/40 transition-all space-y-4">
            <img src={evt.image} alt={evt.title} className="w-full h-48 object-cover" />
            <div className="p-5 space-y-3">
              <span className="text-[10px] uppercase font-bold text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded border border-indigo-500/20">{evt.category}</span>
              <h3 className="font-serif text-xl font-bold text-white">{evt.title}</h3>
              <p className="text-xs text-slate-400 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-indigo-400" /> {evt.date} • {evt.time}</p>
              <p className="text-xs text-slate-400 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-cyan-400" /> {evt.venue}</p>
              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-sm font-bold text-cyan-400">{evt.price}</span>
                <button className="px-4 py-2 rounded-full bg-cyan-500 text-black font-bold text-xs glow-cyan">Book Passes</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PlaysPage() {
  const [plays, setPlays] = useState([]);
  useEffect(() => { API.get('/plays').then(res => setPlays(res.data)).catch(() => {}); }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 min-h-screen">
      <div className="border-b border-white/10 pb-6">
        <h1 className="font-serif text-4xl font-bold text-white flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-purple-400" /> Theatre Plays & Musicals
        </h1>
        <p className="text-xs text-slate-400">Experience world-class Broadway adaptations and classic theatrical performances.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {plays.map((ply) => (
          <div key={ply.id} className="p-6 rounded-3xl glass-panel border-white/10 flex flex-col sm:flex-row gap-6">
            <img src={ply.image} alt={ply.title} className="w-full sm:w-48 h-48 object-cover rounded-2xl" />
            <div className="space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-purple-300 bg-purple-500/10 px-2.5 py-1 rounded border border-purple-500/20">{ply.genre}</span>
                <h3 className="font-serif text-2xl font-bold text-white mt-1">{ply.title}</h3>
                <p className="text-xs text-slate-400 mt-1">{ply.language} • {ply.duration}</p>
                <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-2"><MapPin className="w-3.5 h-3.5 text-cyan-400" /> {ply.venue}</p>
              </div>
              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-sm font-bold text-cyan-400">{ply.price}</span>
                <button className="px-5 py-2 rounded-full bg-cyan-500 text-black font-bold text-xs glow-cyan">Select Seats</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ActivitiesPage() {
  const [activities, setActivities] = useState([]);
  useEffect(() => { API.get('/activities').then(res => setActivities(res.data)).catch(() => {}); }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 min-h-screen">
      <div className="border-b border-white/10 pb-6">
        <h1 className="font-serif text-4xl font-bold text-white flex items-center gap-3">
          <Ticket className="w-8 h-8 text-amber-400" /> Theme Parks & Adventure Activities
        </h1>
        <p className="text-xs text-slate-400">Unlock skip-the-line passes for amusement parks, waterparks, and VR lounges.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {activities.map((act) => (
          <div key={act.id} className="p-6 rounded-3xl glass-panel border-white/10 flex flex-col sm:flex-row gap-6">
            <img src={act.image} alt={act.title} className="w-full sm:w-48 h-48 object-cover rounded-2xl" />
            <div className="space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-serif text-2xl font-bold text-white">{act.title}</h3>
                <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1"><MapPin className="w-3.5 h-3.5 text-cyan-400" /> {act.location}</p>
                <div className="inline-flex items-center gap-1 text-xs font-bold text-amber-300 mt-2">
                  <Star className="w-3.5 h-3.5 fill-amber-400" /> {act.rating} Rating
                </div>
              </div>
              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-sm font-bold text-cyan-400">{act.price}</span>
                <button className="px-5 py-2 rounded-full bg-cyan-500 text-black font-bold text-xs glow-cyan">Book Entry</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function OffersPage() {
  const [offers, setOffers] = useState([]);
  const [copiedCode, setCopiedCode] = useState('');

  useEffect(() => { API.get('/coupons').then(res => setOffers(res.data)).catch(() => {}); }, []);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 min-h-screen">
      <div className="border-b border-white/10 pb-6">
        <h1 className="font-serif text-4xl font-bold text-white flex items-center gap-3">
          <Percent className="w-8 h-8 text-emerald-400" /> Bank Discounts & Exclusive Promo Coupons
        </h1>
        <p className="text-xs text-slate-400">Copy active promo codes and apply them during booking checkout.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {offers.map((off) => (
          <div key={off.id} className="p-6 rounded-3xl glass-panel border-white/10 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/30">
                {off.bankPartner}
              </span>
              <h3 className="font-serif text-xl font-bold text-white">{off.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{off.description}</p>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-2">
              <span className="font-mono text-sm font-bold text-amber-300 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/30">
                {off.code}
              </span>
              <button
                onClick={() => handleCopyCode(off.code)}
                className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500 hover:text-black font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {copiedCode === off.code ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode === off.code ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function GiftCardsPage() {
  const [cards, setCards] = useState([]);
  useEffect(() => { API.get('/gift-cards').then(res => setCards(res.data)).catch(() => {}); }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 min-h-screen">
      <div className="border-b border-white/10 pb-6">
        <h1 className="font-serif text-4xl font-bold text-white flex items-center gap-3">
          <Gift className="w-8 h-8 text-pink-400" /> Prime Digital Gift Cards
        </h1>
        <p className="text-xs text-slate-400">Gift luxury cinema passes to friends and corporate colleagues.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {cards.map((gc) => (
          <div key={gc.id} className="p-6 rounded-3xl glass-panel border-white/10 flex flex-col sm:flex-row gap-6">
            <img src={gc.image} alt={gc.title} className="w-full sm:w-48 h-40 object-cover rounded-2xl" />
            <div className="space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-pink-300 bg-pink-500/10 px-2.5 py-1 rounded border border-pink-500/20">{gc.theme}</span>
                <h3 className="font-serif text-2xl font-bold text-white mt-1">{gc.title}</h3>
                <p className="text-xs text-slate-400 mt-1">{gc.description}</p>
              </div>
              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-lg font-bold text-amber-300">₹{gc.value}</span>
                <button className="px-5 py-2 rounded-full bg-cyan-500 text-black font-bold text-xs glow-cyan">Purchase Voucher</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CorporatePage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 min-h-screen">
      <div className="text-center space-y-3">
        <div className="inline-flex p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
          <Briefcase className="w-8 h-8" />
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white">Private Cinema Screenings & Bulk Bookings</h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">Host your corporate townhalls, employee movie nights, and product launches at PVR Director's Cut or INOX Insignia.</p>
      </div>

      {submitted ? (
        <div className="p-8 rounded-3xl glass-panel border-cyan-500/40 text-center space-y-4">
          <Check className="w-12 h-12 text-cyan-400 mx-auto" />
          <h3 className="font-serif text-2xl font-bold text-white">Corporate Inquiry Submitted</h3>
          <p className="text-xs text-slate-300">Our VIP Corporate Executive will reach out to you within 2 business hours.</p>
        </div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="p-8 rounded-3xl glass-panel border-white/10 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Company Name</label>
              <input type="text" required placeholder="e.g. Google India" className="w-full p-3 rounded-xl glass-input text-sm" />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Contact Person</label>
              <input type="text" required placeholder="Full Name" className="w-full p-3 rounded-xl glass-input text-sm" />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Corporate Email</label>
              <input type="email" required placeholder="name@company.com" className="w-full p-3 rounded-xl glass-input text-sm" />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Estimated Guests / Attendees</label>
              <input type="number" required placeholder="50 - 300 guests" className="w-full p-3 rounded-xl glass-input text-sm" />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Event Requirements & Preferred City</label>
            <textarea rows={3} placeholder="Mention preferred movie, date, food preferences..." className="w-full p-3 rounded-xl glass-input text-sm" />
          </div>
          <button type="submit" className="w-full py-3.5 rounded-2xl bg-cyan-500 text-black font-bold text-sm glow-cyan flex items-center justify-center gap-2 cursor-pointer">
            <span>Submit Corporate Request</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      )}
    </div>
  );
}
