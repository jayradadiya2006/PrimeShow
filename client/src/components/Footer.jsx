import React, { useState } from 'react';
import { 
  Film, 
  Tv, 
  Calendar, 
  Activity, 
  Gamepad2, 
  Tag, 
  Gift,
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck,
  Shield,
  Award,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Send,
  CheckCircle2,
  Info,
  FileText,
  Lock
} from 'lucide-react';

export const Footer = ({ setActiveTab }) => {
  // Mobile Accordion Open/Closed State (Collapsed by default on mobile)
  const [openAccordions, setOpenAccordions] = useState({
    about: false,
    categories: false,
    support: false,
    connect: false
  });

  const [subscribedEmail, setSubscribedEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const toggleAccordion = (section) => {
    setOpenAccordions(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleNavClick = (tabId) => {
    if (setActiveTab) {
      setActiveTab(tabId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubscribeSubmit = (e) => {
    e.preventDefault();
    if (!subscribedEmail.trim()) return;
    setIsSubscribed(true);
    setTimeout(() => {
      setSubscribedEmail('');
      setIsSubscribed(false);
    }, 4000);
  };

  return (
    <footer className="relative z-10 w-full bg-[#D7D3BF] text-slate-900 border-t border-[#C1BAA1] transition-colors duration-300 font-sans">
      
      {/* 1. Live Running Marquee / Ticker Bar (Dark Brown Accent Kept) */}
      <div className="w-full bg-[#2A2019] text-amber-100 py-1.5 sm:py-2 overflow-hidden whitespace-nowrap shadow-inner border-y border-white/10">
        <div className="inline-block animate-marquee tracking-wide font-semibold text-[10px] xs:text-xs sm:text-sm">
          <span className="mx-4 sm:mx-8 text-amber-200 font-bold">🔥 FLASH OFFER: Get 20% Instant Discount on Movie Tickets with UPI Payment!</span>
          <span className="mx-4 sm:mx-8 text-amber-200 font-bold">🎬 IMXN 4K & IMAX 3D Releases This Friday - Book Passes Now!</span>
          <span className="mx-4 sm:mx-8 text-amber-200 font-bold">🎟️ Instant QR Verification & Seamless Entry Pass Generation!</span>
          <span className="mx-4 sm:mx-8 text-amber-200 font-bold">🎭 Live Plays & Standup Comedy Shows Open in Your City!</span>
          <span className="mx-4 sm:mx-8 text-amber-200 font-bold">⭐ 4.9/5 User Rating • 100% Guaranteed Real-Time Seat Lock</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12 space-y-6 md:space-y-10">
        
        {/* 2. Top Feature & Trust Badges Section (Slightly Darker #A59D84) */}
        <div className="flex flex-row overflow-x-auto scrollbar-none no-scrollbar gap-2.5 sm:gap-4 lg:grid lg:grid-cols-4 pb-6 md:pb-8 border-b border-[#C1BAA1] w-full max-w-full py-1">
          
          <div className="w-[155px] xs:w-[175px] sm:w-auto shrink-0 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-[#A59D84] border border-[#8C846B] flex items-center gap-2.5 sm:gap-3.5 shadow-sm transition-all">
            <div className="p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-[#6E5D4F] text-amber-100 border border-[#8C846B] shrink-0">
              <Film className="w-4 h-4 sm:w-5 sm:h-5 text-amber-100" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-white truncate">IMXN 4K & 3D Native</h4>
              <p className="text-[10px] sm:text-xs text-amber-100/80 leading-tight line-clamp-2">70mm laser & 360 sound</p>
            </div>
          </div>

          <div className="w-[155px] xs:w-[175px] sm:w-auto shrink-0 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#A59D84] border border-[#8C846B] flex items-center gap-2.5 sm:gap-3.5 shadow-sm transition-all">
            <div className="p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-[#6E5D4F] text-amber-100 border border-[#8C846B] shrink-0">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-amber-100" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-white truncate">100% Seat Guarantee</h4>
              <p className="text-[10px] sm:text-xs text-amber-100/80 leading-tight line-clamp-2">Real-time seat locking API</p>
            </div>
          </div>

          <div className="w-[155px] xs:w-[175px] sm:w-auto shrink-0 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#A59D84] border border-[#8C846B] flex items-center gap-2.5 sm:gap-3.5 shadow-sm transition-all">
            <div className="p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-[#6E5D4F] text-amber-100 border border-[#8C846B] shrink-0">
              <Award className="w-4 h-4 sm:w-5 sm:h-5 text-amber-100" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-white truncate">⭐ 4.9/5 User Rating</h4>
              <p className="text-[10px] sm:text-xs text-amber-100/80 leading-tight line-clamp-2">Over 100k+ verified reviews</p>
            </div>
          </div>

          <div className="w-[155px] xs:w-[175px] sm:w-auto shrink-0 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#A59D84] border border-[#8C846B] flex items-center gap-2.5 sm:gap-3.5 shadow-sm transition-all">
            <div className="p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-[#6E5D4F] text-amber-100 border border-[#8C846B] shrink-0">
              <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-100" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-white truncate">24/7 VIP Support</h4>
              <p className="text-[10px] sm:text-xs text-amber-100/80 leading-tight line-clamp-2">Dedicated booking hotline</p>
            </div>
          </div>
        </div>

        {/* 3. Compact Newsletter & Search Box Strip */}
        <div className="p-4 sm:p-6 rounded-2xl bg-[#A59D84] border border-[#8C846B] flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left space-y-1">
            <h4 className="text-sm sm:text-base font-bold text-white flex items-center justify-center md:justify-start gap-2">
              <Mail className="w-4 h-4 text-amber-200" />
              <span>Subscribe for VIP Offers & Secret Show Alerts</span>
            </h4>
            <p className="text-xs text-amber-100/90">Get instant promo vouchers & early access to IMAX 3D recliners.</p>
          </div>

          <form onSubmit={handleSubscribeSubmit} className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-2 shrink-0">
            {isSubscribed ? (
              <div className="px-4 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-800 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 w-full sm:w-auto justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>Subscribed Successfully!</span>
              </div>
            ) : (
              <>
                <div className="relative w-full sm:w-72">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address..."
                    value={subscribedEmail}
                    onChange={(e) => setSubscribedEmail(e.target.value)}
                    className="w-full pl-3.5 pr-4 py-2.5 rounded-xl text-xs bg-[#ECEBDE] text-slate-900 border border-[#C1BAA1] focus:outline-none placeholder-slate-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#6E5D4F] hover:bg-[#5C4D42] text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-lg transition-all cursor-pointer shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Subscribe</span>
                </button>
              </>
            )}
          </form>
        </div>

        {/* 4. Main Navigation Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-8 lg:gap-10 pt-4">
          
          {/* Column 1 & 2: Brand Info & Description */}
          <div className="lg:col-span-2 space-y-3 pb-2 md:pb-0 border-b md:border-b-0 border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-red-600 to-red-400 flex items-center justify-center text-white font-black text-lg sm:text-xl font-serif shadow-md">
                P
              </div>
              <span className="text-xl sm:text-2xl font-extrabold tracking-wider text-red-600 dark:text-red-500 uppercase">
                PRIME SHOW
              </span>
            </div>

            {/* Mobile Expand Accordion for About */}
            <div className="md:hidden">
              <button
                onClick={() => toggleAccordion('about')}
                className="w-full py-2 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 border-t border-b border-slate-200 dark:border-slate-800/80 my-1"
              >
                <span>About Prime Show Platform</span>
                {openAccordions.about ? <ChevronUp className="w-4 h-4 text-red-500" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>
              {openAccordions.about && (
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed py-2 animate-fade-in">
                  Your ultimate one-stop destination for instant booking of Movies, Theater Shows, Live Plays, Standup Events, Sports, and Gaming Activities. Experience seamless digital ticketing with instant QR entry passes.
                </p>
              )}
            </div>

            {/* Desktop About Paragraph */}
            <p className="hidden md:block text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed pr-0 sm:pr-4">
              Your ultimate one-stop destination for instant booking of Movies, Theater Shows, Live Plays, Standup Events, Sports, and Gaming Activities. Experience seamless digital ticketing with instant QR entry passes.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-2 pt-1 text-xs text-slate-700 dark:text-slate-300 font-medium">
              <div className="flex items-center space-x-2.5">
                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600 dark:text-red-500 shrink-0"/>
                <span className="text-slate-700 dark:text-slate-300">Prime Show Entertainment Hub, Cinema Tower, India</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600 dark:text-red-500 shrink-0"/>
                <span className="text-slate-700 dark:text-slate-300">support@primeshow.com</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600 dark:text-red-500 shrink-0"/>
                <span className="text-slate-700 dark:text-slate-300">+91 1800-123-4567 (Toll Free)</span>
              </div>
            </div>
          </div>

          {/* Column 3: Categories (Movies, Theatres, Events, Plays, Activities, Offers, Gift Cards) */}
          <div className="border-b md:border-b-0 border-slate-200 dark:border-slate-800 pb-2 md:pb-0">
            <button
              onClick={() => toggleAccordion('categories')}
              className="w-full py-2 md:py-0 flex items-center justify-between md:block text-left text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white md:border-b border-slate-200 dark:border-slate-800 md:pb-2 cursor-pointer"
            >
              <span>Categories</span>
              <span className="md:hidden">
                {openAccordions.categories ? <ChevronUp className="w-4 h-4 text-red-500" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </span>
            </button>

            <div className={`${openAccordions.categories ? 'block py-2 animate-fade-in' : 'hidden'} md:block md:pt-4`}>
              <ul className="space-y-2 sm:space-y-2.5 text-xs font-medium">
                <li>
                  <button onClick={() => handleNavClick('movies')} className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer">
                    <Film className="w-3.5 h-3.5 text-red-600 dark:text-red-500 shrink-0"/> <span>Movies</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavClick('theatres')} className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer">
                    <Tv className="w-3.5 h-3.5 text-red-600 dark:text-red-500 shrink-0"/> <span>Theatres</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavClick('events')} className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer">
                    <Activity className="w-3.5 h-3.5 text-red-600 dark:text-red-500 shrink-0"/> <span>Events</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavClick('plays')} className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer">
                    <Calendar className="w-3.5 h-3.5 text-red-600 dark:text-red-500 shrink-0"/> <span>Plays</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavClick('activities')} className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer">
                    <Gamepad2 className="w-3.5 h-3.5 text-red-600 dark:text-red-500 shrink-0"/> <span>Activities</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavClick('offers')} className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer">
                    <Tag className="w-3.5 h-3.5 text-red-600 dark:text-red-500 shrink-0"/> <span>Offers</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavClick('gift-cards')} className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer">
                    <Gift className="w-3.5 h-3.5 text-red-600 dark:text-red-500 shrink-0"/> <span>Gift Cards</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Column 4: Customer Support (About Us, Contact Us / Support, FAQs, Privacy Policy, Terms & Conditions) */}
          <div className="border-b md:border-b-0 border-slate-200 dark:border-slate-800 pb-2 md:pb-0">
            <button
              onClick={() => toggleAccordion('support')}
              className="w-full py-2 md:py-0 flex items-center justify-between md:block text-left text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white md:border-b border-slate-200 dark:border-slate-800 md:pb-2 cursor-pointer"
            >
              <span>Customer Support</span>
              <span className="md:hidden">
                {openAccordions.support ? <ChevronUp className="w-4 h-4 text-red-500" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </span>
            </button>

            <div className={`${openAccordions.support ? 'block py-2 animate-fade-in' : 'hidden'} md:block md:pt-4`}>
              <ul className="space-y-2 sm:space-y-2.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                <li>
                  <button onClick={() => handleNavClick('corporate')} className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer">
                    <Info className="w-3.5 h-3.5 text-red-600 dark:text-red-500 shrink-0"/> <span>About Us</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavClick('profile-support')} className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer">
                    <Phone className="w-3.5 h-3.5 text-red-600 dark:text-red-500 shrink-0"/> <span>Contact Us / Support</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavClick('profile-support')} className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer">
                    <HelpCircle className="w-3.5 h-3.5 text-red-600 dark:text-red-500 shrink-0"/> <span>FAQs</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavClick('corporate')} className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer">
                    <Lock className="w-3.5 h-3.5 text-red-600 dark:text-red-500 shrink-0"/> <span>Privacy Policy</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavClick('corporate')} className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer">
                    <FileText className="w-3.5 h-3.5 text-red-600 dark:text-red-500 shrink-0"/> <span>Terms & Conditions</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Column 5: Social Media & Security Badge */}
          <div className="pb-2 md:pb-0">
            <button
              onClick={() => toggleAccordion('connect')}
              className="w-full py-2 md:py-0 flex items-center justify-between md:block text-left text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white md:border-b border-slate-200 dark:border-slate-800 md:pb-2 cursor-pointer"
            >
              <span>Connect & Social</span>
              <span className="md:hidden">
                {openAccordions.connect ? <ChevronUp className="w-4 h-4 text-red-500" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </span>
            </button>

            <div className={`${openAccordions.connect ? 'block py-2 animate-fade-in' : 'hidden'} md:block md:pt-4`}>
              <p className="text-xs text-slate-600 dark:text-slate-300 mb-3 leading-relaxed font-medium">
                Follow our social channels for daily show updates & celebrity events.
              </p>

              <div className="flex items-center space-x-2.5 mb-4">
                <a href="#instagram" aria-label="Instagram" className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 transition-all border border-slate-200 dark:border-slate-700">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
                <a href="#facebook" aria-label="Facebook" className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 transition-all border border-slate-200 dark:border-slate-700">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
                </a>
                <a href="#twitter" aria-label="Twitter" className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-sky-500 hover:text-white dark:hover:bg-sky-500 transition-all border border-slate-200 dark:border-slate-700">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                </a>
                <a href="#youtube" aria-label="Youtube" className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 transition-all border border-slate-200 dark:border-slate-700">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </a>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center space-x-2 text-xs text-slate-800 dark:text-slate-200 font-medium shadow-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-500 shrink-0"/>
                <span className="text-slate-800 dark:text-slate-200">100% Safe & Secure UPI Payments</span>
              </div>
            </div>
          </div>

        </div>

        {/* 5. Bottom Copyright Bar */}
        <div className="mt-6 md:mt-10 pt-4 md:pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 font-medium gap-3 text-center sm:text-left">
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
