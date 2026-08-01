import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Shield, Award, Sparkles, Mail, Send, Smartphone, HelpCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#030305] border-t border-white/10 pt-16 pb-12 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* TOP BRAND BANNER & NEWSLETTER */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12 border-b border-white/10">
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center glow-cyan">
                <Film className="w-6 h-6 text-black stroke-[2.5]" />
              </div>
              <span className="font-serif text-3xl font-bold text-white tracking-wider">PrimeShow</span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed font-light">
              India's premier movie and live event ticketing platform. Designed for ultra-luxury experiences, IMAX 3D blockbusters, and VIP lounge hospitality.
            </p>
          </div>

          <div className="lg:col-span-6 flex flex-col justify-center space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-cyan-400">Subscribe to Prime Lounge Newsletter</h4>
            <p className="text-xs text-slate-400">Get priority access to advance bookings, red carpet premieres, and secret discount promo codes.</p>
            <div className="flex items-center gap-2 max-w-md">
              <div className="relative flex-1">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  placeholder="Enter your VIP email..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-full text-xs glass-input placeholder:text-slate-500"
                />
              </div>
              <button className="px-6 py-2.5 rounded-full bg-cyan-500 text-black font-bold text-xs hover:brightness-110 glow-cyan flex items-center gap-1 cursor-pointer">
                <span>Join</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* MIDDLE LINKS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-b border-white/10 text-xs">
          <div className="space-y-3">
            <h5 className="font-semibold text-white uppercase tracking-wider text-sm">Experience</h5>
            <ul className="space-y-2 text-slate-400">
              <li><Link to="/movies" className="hover:text-cyan-400 transition-colors">Now Showing Movies</Link></li>
              <li><Link to="/movies?format=IMAX" className="hover:text-cyan-400 transition-colors">IMAX 3D Laser screens</Link></li>
              <li><Link to="/theatres" className="hover:text-cyan-400 transition-colors">PVR Director's Cut</Link></li>
              <li><Link to="/theatres" className="hover:text-cyan-400 transition-colors">INOX Insignia Lounges</Link></li>
              <li><Link to="/events" className="hover:text-cyan-400 transition-colors">Live Concerts & Festivals</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="font-semibold text-white uppercase tracking-wider text-sm">Customer Suite</h5>
            <ul className="space-y-2 text-slate-400">
              <li><Link to="/profile/bookings" className="hover:text-cyan-400 transition-colors">My Ticket Bookings</Link></li>
              <li><Link to="/offers" className="hover:text-cyan-400 transition-colors">Bank Offers & Promo Codes</Link></li>
              <li><Link to="/gift-cards" className="hover:text-cyan-400 transition-colors">Digital Gift Vouchers</Link></li>
              <li><Link to="/corporate" className="hover:text-cyan-400 transition-colors">Bulk Corporate Bookings</Link></li>
              <li><Link to="/profile/rewards" className="hover:text-cyan-400 transition-colors">Prime Rewards Lounge</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="font-semibold text-white uppercase tracking-wider text-sm">Support & Legal</h5>
            <ul className="space-y-2 text-slate-400">
              <li className="hover:text-cyan-400 cursor-pointer">Help & Ticket Refund FAQ</li>
              <li className="hover:text-cyan-400 cursor-pointer">Terms of Service</li>
              <li className="hover:text-cyan-400 cursor-pointer">Privacy & Cookie Policy</li>
              <li className="hover:text-cyan-400 cursor-pointer">Cinema Hall Safety Standards</li>
              <li className="hover:text-cyan-400 cursor-pointer">Security Vulnerability Program</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="font-semibold text-white uppercase tracking-wider text-sm">Download Mobile App</h5>
            <p className="text-slate-400 text-xs">Scan or download our mobile booking app for Apple iOS and Android.</p>
            <div className="space-y-2">
              <div className="p-3 rounded-2xl glass-panel flex items-center gap-3 hover:border-cyan-500/40 cursor-pointer">
                <Smartphone className="w-6 h-6 text-cyan-400" />
                <div>
                  <p className="text-[10px] text-slate-400 uppercase">Download on</p>
                  <p className="text-xs font-bold text-white">Apple App Store & Google Play</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM COPYRIGHT */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 PrimeShow Entertainment Ltd. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Crafted for Ultra-Luxury Cinema</span>
            <span>•</span>
            <span>256-bit Encrypted SSL Payments</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
