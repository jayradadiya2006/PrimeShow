import React, { useState, useMemo } from 'react';
import { MapPin, Search, Sparkles, Navigation, CheckCircle2, LayoutGrid, Map, Compass, ShieldCheck } from 'lucide-react';
import { GUJARAT_CITIES } from '../constants/cities';

// Accurate Geographic Coordinates & Regional Metadata for all 18 Cities
const CITY_GEO_NODES = [
  { name: 'Palanpur', x: 520, y: 110, region: 'North Gujarat', badge: 'Banaskantha', code: 'PLN' },
  { name: 'Patan', x: 440, y: 150, region: 'North Gujarat', badge: 'Rani ki Vav', code: 'PTN' },
  { name: 'Himmatnagar', x: 620, y: 165, region: 'North East', badge: 'Sabarkantha', code: 'HMT' },
  { name: 'Mehsana', x: 490, y: 205, region: 'North Central', badge: 'Doodhsagar', code: 'MSN' },
  { name: 'Gandhinagar', x: 540, y: 250, region: 'Capital District', badge: 'State Capital', code: 'GND' },
  { name: 'Ahmedabad', x: 525, y: 300, region: 'Central Hub', badge: 'Mega Metropolis', code: 'AMD' },
  { name: 'Godhra', x: 690, y: 310, region: 'East Gujarat', badge: 'Panchmahal', code: 'GDH' },
  { name: 'Nadiad', x: 575, y: 330, region: 'Central Gujarat', badge: 'Kheda Hub', code: 'NDD' },
  { name: 'Anand', x: 595, y: 360, region: 'Central Gujarat', badge: 'Amul Milk Capital', code: 'AND' },
  { name: 'Jamnagar', x: 230, y: 350, region: 'Saurashtra Coast', badge: 'Oil & Brass', code: 'JMN' },
  { name: 'Rajkot', x: 330, y: 395, region: 'Saurashtra Center', badge: 'Engineering Hub', code: 'RJT' },
  { name: 'Junagadh', x: 290, y: 490, region: 'Gir Region', badge: 'Gir Lion Gateway', code: 'JND' },
  { name: 'Bhavnagar', x: 450, y: 465, region: 'Gulf Region', badge: 'Cultural Port', code: 'BHV' },
  { name: 'Vadodara', x: 650, y: 390, region: 'Central East', badge: 'Cultural Capital', code: 'BRD' },
  { name: 'Bharuch', x: 620, y: 470, region: 'South Central', badge: 'Narmada Industrial', code: 'BH' },
  { name: 'Surat', x: 630, y: 540, region: 'South Gujarat', badge: 'Diamond & Silk', code: 'ST' },
  { name: 'Navsari', x: 635, y: 590, region: 'South Gujarat', badge: 'Twin City', code: 'NVS' },
  { name: 'Valsad', x: 640, y: 635, region: 'South Gujarat', badge: 'Mango Coast', code: 'VLD' }
];

export const GujaratMapSelector = ({ selectedCity, onSelectCity, onClose }) => {
  const [hoveredCity, setHoveredCity] = useState(null);
  const [mapSearchTerm, setMapSearchTerm] = useState('');
  const [displayMode, setDisplayMode] = useState('vector'); // 'vector' | 'grid'

  // Filter cities by search term
  const filteredNodes = useMemo(() => {
    const term = mapSearchTerm.toLowerCase().trim();
    if (!term) return CITY_GEO_NODES;
    return CITY_GEO_NODES.filter(c => 
      c.name.toLowerCase().includes(term) || 
      c.region.toLowerCase().includes(term) ||
      c.badge.toLowerCase().includes(term)
    );
  }, [mapSearchTerm]);

  const activeCityName = selectedCity || 'Surat';
  const activeNode = CITY_GEO_NODES.find(c => c.name.toLowerCase() === activeCityName.toLowerCase()) || CITY_GEO_NODES[0];
  const highlightedCityObj = CITY_GEO_NODES.find(c => c.name === hoveredCity) || activeNode;

  return (
    <div className="relative w-full flex flex-col items-center bg-[#07090e] rounded-3xl p-4 sm:p-6 border border-cyan-500/30 shadow-2xl overflow-hidden select-none">
      
      {/* Top Header & Search Bar Controls */}
      <div className="w-full flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pb-4 border-b border-white/10 mb-4">
        {/* Title Badge */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10 shrink-0">
            <Compass className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-white leading-tight flex items-center gap-2">
              Interactive Gujarat Vector Map
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-400/40">
                18 Cities
              </span>
            </h3>
            <p className="text-xs text-cyan-300/80">Click any vector location pin or district node to update app-wide city</p>
          </div>
        </div>

        {/* Header Right: Search Input + View Toggle */}
        <div className="flex items-center gap-2">
          {/* Search Filter */}
          <div className="relative flex-1 md:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/50" />
            <input
              type="text"
              placeholder="Search Gujarat city..."
              value={mapSearchTerm}
              onChange={(e) => setMapSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl glass-input text-xs text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-amber-500/60"
            />
          </div>

          {/* Toggle View Switch */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10 shrink-0">
            <button
              onClick={() => setDisplayMode('vector')}
              title="Vector Map View"
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                displayMode === 'vector'
                  ? 'bg-amber-500 text-black shadow-md font-extrabold'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Vector Map</span>
            </button>

            <button
              onClick={() => setDisplayMode('grid')}
              title="Grid Badge View"
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                displayMode === 'grid'
                  ? 'bg-amber-500 text-black shadow-md font-extrabold'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Grid View</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW MODE A: Interactive High-Quality Vector SVG Map */}
      {displayMode === 'vector' ? (
        <div className="relative w-full max-w-3xl aspect-[16/11] flex items-center justify-center rounded-2xl bg-gradient-to-b from-[#0b0e17] via-[#080b12] to-[#04060a] border border-white/10 p-2 sm:p-4 overflow-hidden">
          
          {/* Background Tech Grid Lines */}
          <div className="absolute inset-0 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none"></div>

          <svg
            viewBox="0 0 900 680"
            className="w-full h-full drop-shadow-[0_0_35px_rgba(6,182,212,0.2)]"
          >
            <defs>
              {/* Region Gradients */}
              <linearGradient id="kutchGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0f172a" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#1e293b" stopOpacity="0.95" />
              </linearGradient>

              <linearGradient id="saurashtraGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#111827" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0.95" />
              </linearGradient>

              <linearGradient id="mainlandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0a0f1d" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0.6" />
              </linearGradient>

              {/* Pin Glowing Radial Gradients */}
              <radialGradient id="activePinPulse" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="1" />
                <stop offset="40%" stopColor="#f59e0b" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
              </radialGradient>

              <radialGradient id="hoverPinPulse" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="1" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* ------------------------------------------------------------- */}
            {/* GEOGRAPHIC REGION VECTOR OUTLINE PATHS (GUJARAT STATE BOUNDARY) */}
            {/* ------------------------------------------------------------- */}

            {/* 1. Kutch Peninsula Region Vector Path */}
            <path
              d="M 120 180 C 160 140, 310 130, 390 190 C 440 230, 420 280, 340 280 C 260 280, 200 300, 160 260 Z"
              fill="url(#kutchGrad)"
              stroke="#06b6d4"
              strokeWidth="2"
              strokeDasharray="4 2"
              className="opacity-70 transition-all duration-300 hover:opacity-100 hover:stroke-cyan-400"
            />
            <text x="250" y="210" fill="rgba(255,255,255,0.25)" className="text-[14px] font-extrabold uppercase tracking-widest pointer-events-none">
              Kutch Region
            </text>

            {/* 2. Saurashtra / Kathiawar Peninsula Vector Path */}
            <path
              d="M 190 320 L 400 330 L 480 430 L 420 530 L 260 520 L 190 420 Z"
              fill="url(#saurashtraGrad)"
              stroke="#06b6d4"
              strokeWidth="2.5"
              className="opacity-80 transition-all duration-300 hover:opacity-100 hover:stroke-cyan-400"
            />
            <text x="310" y="440" fill="rgba(255,255,255,0.25)" className="text-[15px] font-extrabold uppercase tracking-widest pointer-events-none">
              Saurashtra
            </text>

            {/* 3. North & Central Mainland Gujarat Vector Path */}
            <path
              d="M 400 180 L 590 80 L 720 160 L 750 350 L 670 410 L 590 380 L 460 330 Z"
              fill="url(#mainlandGrad)"
              stroke="#06b6d4"
              strokeWidth="2.5"
              className="opacity-85 transition-all duration-300 hover:opacity-100 hover:stroke-cyan-400"
            />
            <text x="590" y="200" fill="rgba(255,255,255,0.2)" className="text-[13px] font-extrabold uppercase tracking-widest pointer-events-none">
              North & Central
            </text>

            {/* 4. South Gujarat Coastal Corridor Vector Path */}
            <path
              d="M 590 420 L 680 410 L 690 660 L 600 660 Z"
              fill="url(#mainlandGrad)"
              stroke="#06b6d4"
              strokeWidth="2.5"
              className="opacity-90 transition-all duration-300 hover:opacity-100 hover:stroke-cyan-400"
            />
            <text x="645" y="500" fill="rgba(255,255,255,0.2)" opacity="0.8" className="text-[11px] font-extrabold uppercase tracking-widest [writing-mode:vertical-rl] pointer-events-none">
              South Gujarat
            </text>

            {/* Connecting Regional Tech Arteries */}
            <g stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1.2" strokeDasharray="3 3">
              <line x1="525" y1="300" x2="540" y2="250" />
              <line x1="525" y1="300" x2="575" y2="330" />
              <line x1="575" y1="330" x2="595" y2="360" />
              <line x1="595" y1="360" x2="650" y2="390" />
              <line x1="650" y1="390" x2="620" y2="470" />
              <line x1="620" y1="470" x2="630" y2="540" />
              <line x1="630" y1="540" x2="635" y2="590" />
              <line x1="635" y1="590" x2="640" y2="635" />
              <line x1="525" y1="300" x2="330" y2="395" />
              <line x1="330" y1="395" x2="230" y2="350" />
              <line x1="330" y1="395" x2="290" y2="490" />
              <line x1="330" y1="395" x2="450" y2="465" />
            </g>

            {/* ------------------------------------------------------------- */}
            {/* INTERACTIVE VECTOR CITY PINS & MARKERS (18 GUJARAT CITIES) */}
            {/* ------------------------------------------------------------- */}
            {filteredNodes.map((c) => {
              const isSelected = activeCityName.toLowerCase() === c.name.toLowerCase();
              const isHovered = hoveredCity === c.name;

              return (
                <g
                  key={c.name}
                  className="cursor-pointer group"
                  onMouseEnter={() => setHoveredCity(c.name)}
                  onMouseLeave={() => setHoveredCity(null)}
                  onClick={() => {
                    onSelectCity(c.name);
                    if (onClose) onClose();
                  }}
                >
                  {/* Radar Pulse Ping Animation on Selected */}
                  {isSelected && (
                    <circle
                      cx={c.x}
                      cy={c.y}
                      r="28"
                      fill="url(#activePinPulse)"
                      className="animate-ping opacity-80"
                    />
                  )}

                  {/* Outer Glowing Halo Circle */}
                  <circle
                    cx={c.x}
                    cy={c.y}
                    r={isSelected ? 18 : isHovered ? 16 : 12}
                    fill={isSelected ? 'rgba(245, 158, 11, 0.3)' : isHovered ? 'rgba(6, 182, 212, 0.35)' : 'rgba(15, 23, 42, 0.8)'}
                    stroke={isSelected ? '#f59e0b' : isHovered ? '#06b6d4' : 'rgba(255, 255, 255, 0.3)'}
                    strokeWidth={isSelected ? '3' : isHovered ? '2.5' : '1.5'}
                    className="transition-all duration-300 drop-shadow-md"
                  />

                  {/* Core Pin Dot */}
                  <circle
                    cx={c.x}
                    cy={c.y}
                    r={isSelected ? 7 : isHovered ? 6 : 4}
                    fill={isSelected ? '#f59e0b' : isHovered ? '#06b6d4' : '#94a3b8'}
                    className="transition-all duration-300"
                  />

                  {/* Vector Pin Icon Top Marker for Selected / Hovered */}
                  {(isSelected || isHovered) && (
                    <g transform={`translate(${c.x - 12}, ${c.y - 32})`}>
                      <path
                        d="M12 0C7.03 0 3 4.03 3 9c0 5.25 9 15 9 15s9-9.75 9-15c0-4.97-4.03-9-9-9z"
                        fill={isSelected ? '#f59e0b' : '#06b6d4'}
                        className="drop-shadow-lg"
                      />
                      <circle cx="12" cy="9" r="3.5" fill="#000000" />
                    </g>
                  )}

                  {/* City Name Label Pill */}
                  <g transform={`translate(${c.x}, ${c.y + (isSelected || isHovered ? 18 : 15)})`}>
                    <rect
                      x="-38"
                      y="-10"
                      width="76"
                      height="18"
                      rx="9"
                      fill={isSelected ? '#f59e0b' : isHovered ? '#06b6d4' : 'rgba(7, 9, 14, 0.85)'}
                      stroke={isSelected ? '#f59e0b' : isHovered ? '#06b6d4' : 'rgba(255, 255, 255, 0.15)'}
                      strokeWidth="1"
                      className="transition-all duration-300"
                    />
                    <text
                      x="0"
                      y="2"
                      textAnchor="middle"
                      fill={isSelected || isHovered ? '#000000' : '#ffffff'}
                      className="text-[10px] font-extrabold tracking-tight select-none"
                    >
                      {c.name}
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>

          {/* Floating Glassmorphic Tooltip Card */}
          <div className="absolute bottom-3 left-3 right-3 sm:left-auto sm:right-3 p-3.5 rounded-2xl bg-[#090d16]/95 border border-cyan-500/40 backdrop-blur-xl shadow-2xl flex items-center justify-between gap-4 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-black flex items-center justify-center font-extrabold shadow-md shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-extrabold text-white flex items-center gap-2">
                  <span>{highlightedCityObj.name}</span>
                  <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[9px] uppercase font-bold border border-cyan-400/30">
                    {highlightedCityObj.badge}
                  </span>
                </div>
                <div className="text-[10px] text-white/60">
                  {highlightedCityObj.region} • Tap map pin to set as active city
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onSelectCity(highlightedCityObj.name);
                if (onClose) onClose();
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-black font-extrabold text-xs shadow-lg shadow-amber-500/25 hover:brightness-110 cursor-pointer shrink-0 transition-all"
            >
              Set City
            </button>
          </div>
        </div>
      ) : (
        /* VIEW MODE B: Clean Grid Badge List for 18 Cities */
        <div className="w-full space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> All 18 Official Gujarat Cities
            </span>
            <span className="text-xs text-white/50">{filteredNodes.length} Cities Listed</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {filteredNodes.map((node) => {
              const isSelected = activeCityName.toLowerCase() === node.name.toLowerCase();
              return (
                <button
                  key={node.name}
                  onClick={() => {
                    onSelectCity(node.name);
                    if (onClose) onClose();
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all duration-300 cursor-pointer flex flex-col justify-between h-24 ${
                    isSelected
                      ? 'bg-gradient-to-br from-amber-500 to-amber-600 border-amber-400 text-black shadow-lg shadow-amber-500/30 font-extrabold'
                      : 'bg-white/5 border-white/10 hover:bg-white/15 text-white hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${isSelected ? 'bg-black/20 text-black' : 'bg-white/10 text-cyan-300'}`}>
                      {node.code}
                    </span>
                    {isSelected && <ShieldCheck className="w-4 h-4 text-black stroke-[2.5]" />}
                  </div>

                  <div>
                    <div className={`text-xs font-extrabold ${isSelected ? 'text-black' : 'text-white'}`}>{node.name}</div>
                    <div className={`text-[9px] truncate ${isSelected ? 'text-black/80' : 'text-white/50'}`}>{node.badge}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
