import React, { useEffect } from 'react';
import { X, MapPin, ExternalLink, Navigation } from 'lucide-react';

export const TheatreMapModal = ({ isOpen, onClose, theatre }) => {
  // Listen for Escape key press to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !theatre) return null;

  const theatreName = theatre.name || theatre.theatreName || 'Theatre Location';
  const city = theatre.city || '';
  const address = theatre.address || '';
  const mapUrl = theatre.mapLocationUrl || theatre.mapUrl || '';

  // Helper to extract clean iframe embed URL or construct Google Maps search embed URL
  const getEmbedUrl = () => {
    if (mapUrl && mapUrl.includes('google.com/maps/embed')) {
      const match = mapUrl.match(/src=["']([^"']+)["']/);
      if (match && match[1]) return match[1];
      return mapUrl;
    }
    
    // Construct dynamic embed URL based on Theatre Name, Address & City
    const query = `${theatreName} ${address} ${city}`.trim();
    return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
  };

  // Helper to construct full external Google Maps redirection URL
  const getExternalMapUrl = () => {
    if (mapUrl && (mapUrl.startsWith('http://') || mapUrl.startsWith('https://')) && !mapUrl.includes('output=embed')) {
      return mapUrl;
    }
    const query = `${theatreName} ${address} ${city}`.trim();
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  };

  const embedSrc = getEmbedUrl();
  const externalUrl = getExternalMapUrl();

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-fade-in overflow-y-auto"
      style={{ zIndex: 99999 }}
    >
      {/* Modal Card Container */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-[94vw] sm:w-full max-w-2xl glass-modal rounded-3xl p-4 sm:p-6 border border-white/20 shadow-[0_0_50px_rgba(0,0,0,0.9)] text-white max-h-[85vh] flex flex-col my-auto border-amber-500/20 overflow-hidden"
      >
        
        {/* Top Header Bar */}
        <div className="flex items-start justify-between gap-3 pb-3 sm:pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-start gap-3 min-w-0">
            <div className="p-2.5 sm:p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-400/30 shrink-0 mt-0.5 shadow-md shadow-amber-500/10">
              <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg sm:text-xl font-bold font-sans text-white truncate max-w-[220px] sm:max-w-md">{theatreName}</h3>
                {city && (
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-extrabold border border-cyan-400/30 uppercase tracking-wider shrink-0">
                    {city}
                  </span>
                )}
              </div>
              {address && (
                <p className="text-[11px] sm:text-xs text-white/70 mt-1 flex items-center gap-1.5 line-clamp-1">
                  <Navigation className="w-3 h-3 text-amber-400 shrink-0" />
                  <span className="truncate">{address}</span>
                </p>
              )}
            </div>
          </div>

          {/* Prominent Close (X) Icon Button */}
          <button
            onClick={onClose}
            className="p-2 sm:p-2.5 rounded-full bg-white/10 hover:bg-rose-500 text-white/80 hover:text-white transition-all cursor-pointer shrink-0 border border-white/10 hover:border-rose-400 shadow-md active:scale-95 ml-2"
            title="Close Map (Esc)"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Map Container - Responsive Embedded Iframe */}
        <div className="my-3 sm:my-4 rounded-2xl overflow-hidden border border-white/15 bg-slate-950 relative shadow-inner shrink-0 flex-1 min-h-[220px] sm:min-h-[280px] h-[260px] sm:h-[340px]">
          <iframe
            title={`Google Map for ${theatreName}`}
            src={embedSrc}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-full"
          ></iframe>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/10 shrink-0">
          <p className="text-[10px] sm:text-[11px] text-white/60 hidden sm:block">
            📍 Interactive map • Click backdrop or Esc to close
          </p>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <a
              href={externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-black font-extrabold text-xs shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Open in Google Maps App / Full View</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors cursor-pointer border border-white/10 shrink-0"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
