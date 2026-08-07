import React from 'react';
import { X, MapPin, ExternalLink, Navigation } from 'lucide-react';

export const TheatreMapModal = ({ isOpen, onClose, theatre }) => {
  if (!isOpen || !theatre) return null;

  const theatreName = theatre.name || theatre.theatreName || 'Theatre Location';
  const city = theatre.city || '';
  const address = theatre.address || '';
  const mapUrl = theatre.mapLocationUrl || theatre.mapUrl || '';

  // Helper to extract clean iframe embed URL or construct Google Maps search embed URL
  const getEmbedUrl = () => {
    if (mapUrl && mapUrl.includes('google.com/maps/embed')) {
      // If full iframe HTML string was pasted by admin
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
      // If admin provided direct share link (e.g. https://maps.app.goo.gl/...)
      return mapUrl;
    }
    const query = `${theatreName} ${address} ${city}`.trim();
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  };

  const embedSrc = getEmbedUrl();
  const externalUrl = getExternalMapUrl();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl glass-modal rounded-3xl p-6 border border-white/15 shadow-2xl text-white max-h-[92vh] flex flex-col">
        
        {/* Header Section */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-400/30 shrink-0 mt-0.5">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl font-bold font-sans text-white">{theatreName}</h3>
                {city && (
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-400/30 uppercase tracking-wider">
                    {city}
                  </span>
                )}
              </div>
              {address && (
                <p className="text-xs text-white/70 mt-1 flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{address}</span>
                </p>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Map Container */}
        <div className="my-4 rounded-2xl overflow-hidden border border-white/10 bg-slate-900 aspect-video sm:aspect-[16/9] relative shadow-inner shrink-0 flex-1">
          <iframe
            title={`Map location for ${theatreName}`}
            src={embedSrc}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-full min-h-[280px]"
          ></iframe>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/10 shrink-0">
          <p className="text-[11px] text-white/50 hidden sm:block">
            📍 Interactive Google Map view for cinema navigation
          </p>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <a
              href={externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-black font-extrabold text-xs shadow-lg shadow-amber-500/20 hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Open in Google Maps App / Full View</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
