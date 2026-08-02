import React from 'react';
import { 
  Film, 
  Tv, 
  Calendar, 
  Activity, 
  Gamepad2, 
  Tag, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck,
  Shield,
  Award,
  HelpCircle
} from 'lucide-react';

export const Footer = ({ setActiveTab }) => {
  const handleNavClick = (tabId) => {
    if (setActiveTab) {
      setActiveTab(tabId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="relative z-10 w-full bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 border-t border-slate-200 dark:border-slate-800 transition-colors duration-300 font-sans">
      
      {/* 1. Live Running Marquee / Ticker Bar (Compact & Sleek Height + Scaled Text) */}
      <div className="w-full bg-gradient-to-r from-red-600 via-rose-600 to-red-600 dark:from-red-900/90 dark:via-red-800/90 dark:to-red-900/90 text-white py-1.5 sm:py-2 overflow-hidden whitespace-nowrap shadow-inner border-y border-white/10">
        <div className="inline-block animate-marquee tracking-wide font-semibold text-[10px] xs:text-xs sm:text-sm">
          <span className="mx-4 sm:mx-8 text-white font-bold">🔥 FLASH OFFER: Get 20% Instant Discount on Movie Tickets with UPI Payment!</span>
          <span className="mx-4 sm:mx-8 text-white font-bold">🎬 IMXN 4K & IMAX 3D Releases This Friday - Book Passes Now!</span>
          <span className="mx-4 sm:mx-8 text-white font-bold">🎟️ Instant QR Verification & Seamless Entry Pass Generation!</span>
          <span className="mx-4 sm:mx-8 text-white font-bold">🎭 Live Plays & Standup Comedy Shows Open in Your City!</span>
          <span className="mx-4 sm:mx-8 text-white font-bold">⭐ 4.9/5 User Rating • 100% Guaranteed Real-Time Seat Lock</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-14">
        
        {/* 2. Top Feature & Trust Badges Section (Single-Row Mobile Scrollable Line) */}
        <div className="flex flex-row overflow-x-auto scrollbar-none no-scrollbar gap-2.5 sm:gap-4 lg:grid lg:grid-cols-4 pb-6 md:pb-10 border-b border-slate-200 dark:border-slate-800 w-full max-w-full py-1">
          
          <div className="w-[155px] xs:w-[175px] sm:w-auto shrink-0 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex items-center gap-2.5 sm:gap-3.5 shadow-sm hover:border-red-500/30 transition-all">
            <div className="p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 shrink-0">
              <Film className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">IMXN 4K & 3D Native</h4>
              <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 leading-tight line-clamp-2">70mm laser & 360 sound</p>
            </div>
          </div>

          <div className="w-[155px] xs:w-[175px] sm:w-auto shrink-0 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex items-center gap-2.5 sm:gap-3.5 shadow-sm hover:border-red-500/30 transition-all">
            <div className="p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 shrink-0">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">100% Seat Guarantee</h4>
              <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 leading-tight line-clamp-2">Real-time seat locking API</p>
            </div>
          </div>

          <div className="w-[155px] xs:w-[175px] sm:w-auto shrink-0 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex items-center gap-2.5 sm:gap-3.5 shadow-sm hover:border-red-500/30 transition-all">
            <div className="p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
              <Award className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">⭐ 4.9/5 User Rating</h4>
              <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 leading-tight line-clamp-2">Over 100k+ verified reviews</p>
            </div>
          </div>

          <div className="w-[155px] xs:w-[175px] sm:w-auto shrink-0 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex items-center gap-2.5 sm:gap-3.5 shadow-sm hover:border-red-500/30 transition-all">
            <div className="p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 shrink-0">
              <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">24/7 VIP Support</h4>
              <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 leading-tight line-clamp-2">Dedicated booking hotline</p>
            </div>
          </div>
        </div>

        {/* 3. Main Navigation Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10 pt-10">
          
          {/* Column 1 & 2: Brand Info & Description */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-red-400 flex items-center justify-center text-white font-black text-xl font-serif shadow-md">
                P
              </div>
              <span className="text-2xl font-extrabold tracking-wider text-red-600 dark:text-red-500 uppercase">
                PRIME SHOW
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed pr-0 sm:pr-4">
              Your ultimate one-stop destination for instant booking of Movies, Theater Shows, Live Plays, Standup Events, Sports, and Gaming Activities. Experience seamless digital ticketing with instant QR entry passes.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-2.5 pt-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
              <div className="flex items-center space-x-2.5">
                <MapPin className="w-4 h-4 text-red-600 dark:text-red-500 shrink-0"/>
                <span className="text-slate-700 dark:text-slate-300">Prime Show Entertainment Hub, Cinema Tower, India</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <Mail className="w-4 h-4 text-red-600 dark:text-red-500 shrink-0"/>
                <span className="text-slate-700 dark:text-slate-300">support@primeshow.com</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <Phone className="w-4 h-4 text-red-600 dark:text-red-500 shrink-0"/>
                <span className="text-slate-700 dark:text-slate-300">+91 1800-123-4567 (Toll Free)</span>
              </div>
            </div>
          </div>

          {/* Column 3: Categories */}
          <div>
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">
              Categories
            </h3>
            <ul className="space-y-2.5 text-xs font-medium">
              <li>
                <button onClick={() => handleNavClick('movies')} className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer">
                  <Film className="w-3.5 h-3.5 text-red-600 dark:text-red-500"/> <span className="text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400">Latest Movies</span>
                </button>
              </li>
              <li>
                <button onClick={() => handleNavClick('theatres')} className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer">
                  <Tv className="w-3.5 h-3.5 text-red-600 dark:text-red-500"/> <span className="text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400">Theater Shows</span>
                </button>
              </li>
              <li>
                <button onClick={() => handleNavClick('plays')} className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer">
                  <Calendar className="w-3.5 h-3.5 text-red-600 dark:text-red-500"/> <span className="text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400">Live Drama & Plays</span>
                </button>
              </li>
              <li>
                <button onClick={() => handleNavClick('events')} className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer">
                  <Activity className="w-3.5 h-3.5 text-red-600 dark:text-red-500"/> <span className="text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400">Concerts & Events</span>
                </button>
              </li>
              <li>
                <button onClick={() => handleNavClick('activities')} className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer">
                  <Gamepad2 className="w-3.5 h-3.5 text-red-600 dark:text-red-500"/> <span className="text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400">Gaming & Sports</span>
                </button>
              </li>
              <li>
                <button onClick={() => handleNavClick('offers')} className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer">
                  <Tag className="w-3.5 h-3.5 text-red-600 dark:text-red-500"/> <span className="text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400">Exclusive Offers</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Quick Links & Support */}
          <div>
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">
              Customer Support
            </h3>
            <ul className="space-y-2.5 text-xs font-medium text-slate-700 dark:text-slate-300">
              <li><button onClick={() => handleNavClick('profile-bookings')} className="text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer">My Booked Passes</button></li>
              <li><button onClick={() => handleNavClick('profile-bookings')} className="text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer">Verify Ticket QR</button></li>
              <li><button onClick={() => handleNavClick('profile-support')} className="text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer">Help & FAQ</button></li>
              <li><button onClick={() => handleNavClick('corporate')} className="text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer">Terms of Service</button></li>
              <li><button onClick={() => handleNavClick('corporate')} className="text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer">Privacy Policy</button></li>
              <li><button onClick={() => handleNavClick('admin')} className="text-red-600 dark:text-red-400 font-bold hover:underline transition-colors cursor-pointer">Admin Login Panel</button></li>
            </ul>
          </div>

          {/* Column 5: Social Media & Security Badge */}
          <div>
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">
              Connect With Us
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 leading-relaxed font-medium">
              Follow our social channels for daily show updates, promo codes, and celebrity events.
            </p>
            <div className="flex items-center space-x-3 mb-6">
              <a href="#instagram" aria-label="Instagram" className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 transition-all border border-slate-200 dark:border-slate-700">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="#facebook" aria-label="Facebook" className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 transition-all border border-slate-200 dark:border-slate-700">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
              </a>
              <a href="#twitter" aria-label="Twitter" className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-sky-500 hover:text-white dark:hover:bg-sky-500 transition-all border border-slate-200 dark:border-slate-700">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </a>
              <a href="#youtube" aria-label="Youtube" className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 transition-all border border-slate-200 dark:border-slate-700">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center space-x-2.5 text-xs text-slate-800 dark:text-slate-200 font-medium shadow-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-500 shrink-0"/>
              <span className="text-slate-800 dark:text-slate-200">100% Safe & Secure UPI Payments</span>
            </div>
          </div>

        </div>

        {/* 4. Bottom Copyright Bar */}
        <div className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-medium gap-4 text-center sm:text-left">
          <p className="text-slate-600 dark:text-slate-400">© {new Date().getFullYear()} PRIME SHOW Entertainment Network. All rights reserved.</p>
          <div className="flex items-center space-x-4 text-slate-600 dark:text-slate-400">
            <span>Powered by Prime Show Digital Engine</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
