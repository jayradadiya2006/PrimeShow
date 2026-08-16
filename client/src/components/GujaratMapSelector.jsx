import React, { useState, useMemo } from 'react';
import { MapPin, Search, Sparkles, Navigation, CheckCircle2, LayoutGrid, Map, Compass, ShieldCheck } from 'lucide-react';

const GUJARAT_DISTRICTS = [
  // North Gujarat
  { id: 'palanpur', name: 'Palanpur', gujarati: 'પાલનપુર', d: 'M 380,80 L 480,70 L 520,130 L 420,140 Z', textX: 450, textY: 105, region: 'North Gujarat', badge: 'Banaskantha' },
  { id: 'patan', name: 'Patan', gujarati: 'પાટણ', d: 'M 300,120 L 380,80 L 420,140 L 340,160 Z', textX: 360, textY: 130, region: 'North Gujarat', badge: 'Heritage City' },
  { id: 'mehsana', name: 'Mehsana', gujarati: 'મહેસાણા', d: 'M 340,160 L 420,140 L 450,210 L 370,220 Z', textX: 395, textY: 185, region: 'North Central', badge: 'Doodhsagar' },
  { id: 'himmatnagar', name: 'Himmatnagar', gujarati: 'હિંમતનગર', d: 'M 450,130 L 550,110 L 580,200 L 470,200 Z', textX: 515, textY: 160, region: 'North East', badge: 'Sabarkantha' },
  { id: 'gandhinagar', name: 'Gandhinagar', gujarati: 'ગાંધીનગર', d: 'M 420,210 L 480,200 L 490,250 L 430,250 Z', textX: 460, textY: 232, region: 'Capital District', badge: 'State Capital' },

  // Central & Charotar
  { id: 'ahmedabad', name: 'Ahmedabad', gujarati: 'અમદાવાદ', d: 'M 370,220 L 430,210 L 450,290 L 380,310 Z', textX: 410, textY: 265, region: 'Central Hub', badge: 'Mega Metropolis' },
  { id: 'nadiad', name: 'Nadiad', gujarati: 'નડિયાદ', d: 'M 430,250 L 480,250 L 470,280 L 430,280 Z', textX: 455, textY: 268, region: 'Central Gujarat', badge: 'Kheda Hub' },
  { id: 'anand', name: 'Anand', gujarati: 'આણંદ', d: 'M 450,270 L 510,260 L 520,310 L 460,310 Z', textX: 485, textY: 292, region: 'Central Gujarat', badge: 'Milk Capital' },
  { id: 'godhra', name: 'Godhra', gujarati: 'ગોધરા', d: 'M 510,210 L 600,200 L 610,290 L 520,280 Z', textX: 560, textY: 250, region: 'East Gujarat', badge: 'Panchmahal' },
  { id: 'vadodara', name: 'Vadodara', gujarati: 'વડોદરા', d: 'M 470,310 L 560,300 L 570,380 L 480,380 Z', textX: 520, textY: 348, region: 'Central East', badge: 'Cultural Capital' },

  // Saurashtra Region
  { id: 'jamnagar', name: 'Jamnagar', gujarati: 'જામનગર', d: 'M 120,240 L 220,220 L 240,300 L 140,310 Z', textX: 180, textY: 270, region: 'Saurashtra Coast', badge: 'Oil & Brass' },
  { id: 'rajkot', name: 'Rajkot', gujarati: 'રાજકોટ', d: 'M 220,220 L 320,210 L 330,310 L 230,310 Z', textX: 275, textY: 265, region: 'Saurashtra Center', badge: 'Smart City' },
  { id: 'junagadh', name: 'Junagadh', gujarati: 'જૂનાગઢ', d: 'M 150,310 L 250,310 L 240,410 L 160,400 Z', textX: 200, textY: 360, region: 'Gir Region', badge: 'Gir Gateway' },
  { id: 'bhavnagar', name: 'Bhavnagar', gujarati: 'ભાવનગર', d: 'M 310,310 L 390,300 L 410,410 L 310,390 Z', textX: 355, textY: 355, region: 'Gulf Region', badge: 'Port & Culture' },

  // South Gujarat
  { id: 'bharuch', name: 'Bharuch', gujarati: 'ભરૂચ', d: 'M 480,380 L 560,380 L 550,450 L 470,440 Z', textX: 515, textY: 415, region: 'South Central', badge: 'Narmada Hub' },
  { id: 'surat', name: 'Surat', gujarati: 'સુરત', d: 'M 470,440 L 560,450 L 550,530 L 460,510 Z', textX: 510, textY: 485, region: 'South Gujarat', badge: 'Diamond & Silk' },
  { id: 'navsari', name: 'Navsari', gujarati: 'નવસારી', d: 'M 470,510 L 550,530 L 540,580 L 470,570 Z', textX: 505, textY: 548, region: 'South Gujarat', badge: 'Twin City' },
  { id: 'valsad', name: 'Valsad', gujarati: 'વલસાડ', d: 'M 470,570 L 540,580 L 530,650 L 470,640 Z', textX: 505, textY: 610, region: 'South Gujarat', badge: 'Mango Coast' }
];

export const GujaratMapSelector = ({ selectedCity, onSelectCity, onClose }) => {
  const [hoveredCity, setHoveredCity] = useState(null);
  const [mapSearchTerm, setMapSearchTerm] = useState('');
  const [displayMode, setDisplayMode] = useState('vector'); // 'vector' | 'grid'

  const activeCityName = selectedCity || 'Surat';
  const activeDistrictObj = GUJARAT_DISTRICTS.find(c => c.name.toLowerCase() === activeCityName.toLowerCase()) || GUJARAT_DISTRICTS[15];
  const highlightedDistrictObj = GUJARAT_DISTRICTS.find(c => c.name === hoveredCity) || activeDistrictObj;

  const filteredDistricts = useMemo(() => {
    const term = mapSearchTerm.toLowerCase().trim();
    if (!term) return GUJARAT_DISTRICTS;
    return GUJARAT_DISTRICTS.filter(c => 
      c.name.toLowerCase().includes(term) || 
      c.gujarati.includes(term) ||
      c.region.toLowerCase().includes(term) ||
      c.badge.toLowerCase().includes(term)
    );
  }, [mapSearchTerm]);

  return (
    <div className="relative w-full flex flex-col items-center bg-[#080d1a] rounded-3xl p-4 sm:p-6 border border-cyan-500/40 shadow-2xl overflow-hidden select-none">
      
      {/* Header & Controls Bar */}
      <div className="w-full flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pb-4 border-b border-white/10 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-lg shrink-0">
            <Compass className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-white leading-tight flex items-center gap-2">
              ગુજરાત રિજનલ સિટી મેપ (Gujarat Regional City Map)
            </h3>
            <p className="text-xs text-cyan-300">Click any illuminated district boundary to set your active Gujarat city</p>
          </div>
        </div>

        {/* Search Bar & View Mode Toggle */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-52">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/50" />
            <input
              type="text"
              placeholder="Search Gujarat city..."
              value={mapSearchTerm}
              onChange={(e) => setMapSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl glass-input text-xs text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-amber-500/60"
            />
          </div>

          <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10 shrink-0">
            <button
              onClick={() => setDisplayMode('vector')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                displayMode === 'vector'
                  ? 'bg-amber-500 text-black font-extrabold shadow'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">District Map</span>
            </button>

            <button
              onClick={() => setDisplayMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                displayMode === 'grid'
                  ? 'bg-amber-500 text-black font-extrabold shadow'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Grid List</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW MODE A: Interactive High-Visibility SVG Gujarat District Map */}
      {displayMode === 'vector' ? (
        <div className="relative w-full max-w-4xl aspect-[800/700] flex items-center justify-center rounded-2xl bg-[#0f172a] border border-cyan-500/30 p-2 sm:p-4 overflow-hidden drop-shadow-2xl">
          
          <svg
            viewBox="0 0 800 700"
            className="w-full h-full drop-shadow-[0_0_35px_rgba(56,189,248,0.25)]"
          >
            <defs>
              {/* Active District Glow Filter */}
              <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>

              {/* Active District Amber Gradient */}
              <linearGradient id="activeDistrictGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#d97706" stopOpacity="1" />
              </linearGradient>

              {/* Hover District Cyan Gradient */}
              <linearGradient id="hoverDistrictGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#0369a1" stopOpacity="1" />
              </linearGradient>

              {/* Normal District Dark Slate Gradient */}
              <linearGradient id="normalDistrictGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e293b" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="1" />
              </linearGradient>
            </defs>

            {/* SVG MAP TITLE EMBEDDED */}
            <text x="400" y="38" fill="#ffffff" font-size="20" font-weight="900" text-anchor="middle" className="tracking-wide">
              ગુજરાત રિજનલ સિટી મેપ (Select Your City)
            </text>

            {/* REGIONAL GROUP DISTRICT BOUNDARIES */}
            <g id="gujarat-districts">
              {filteredDistricts.map((city) => {
                const isSelected = activeCityName.toLowerCase() === city.name.toLowerCase();
                const isHovered = hoveredCity === city.name;

                let fillStyle = 'url(#normalDistrictGrad)';
                let strokeStyle = '#38bdf8';
                let strokeWidth = '2';
                let filterStyle = 'none';

                if (isSelected) {
                  fillStyle = 'url(#activeDistrictGrad)';
                  strokeStyle = '#ffffff';
                  strokeWidth = '4';
                  filterStyle = 'url(#glowFilter)';
                } else if (isHovered) {
                  fillStyle = 'url(#hoverDistrictGrad)';
                  strokeStyle = '#38bdf8';
                  strokeWidth = '3.5';
                  filterStyle = 'url(#glowFilter)';
                }

                return (
                  <g
                    key={city.id}
                    className="cursor-pointer group transition-all duration-300"
                    onMouseEnter={() => setHoveredCity(city.name)}
                    onMouseLeave={() => setHoveredCity(null)}
                    onClick={() => {
                      onSelectCity(city.name);
                      if (onClose) onClose();
                    }}
                  >
                    {/* District Boundary Path */}
                    <path
                      id={city.id}
                      d={city.d}
                      fill={fillStyle}
                      stroke={strokeStyle}
                      strokeWidth={strokeWidth}
                      strokeLinejoin="round"
                      filter={filterStyle}
                      className="transition-all duration-300"
                    />

                    {/* District Center Point Indicator */}
                    <circle
                      cx={city.textX}
                      cy={city.textY - 24}
                      r={isSelected ? '6' : isHovered ? '5' : '3.5'}
                      fill={isSelected ? '#ffffff' : isHovered ? '#facc15' : '#38bdf8'}
                      className="transition-all duration-300"
                    />

                    {/* High-Visibility Gujarati Script Label */}
                    <text
                      x={city.textX}
                      y={city.textY - 6}
                      fill={isSelected ? '#000000' : isHovered ? '#ffffff' : '#f8fafc'}
                      fontSize={isSelected ? '16' : '14'}
                      fontWeight="900"
                      textAnchor="middle"
                      className="select-none transition-all duration-300 drop-shadow-md"
                    >
                      {city.gujarati}
                    </text>

                    {/* High-Visibility English Script Label */}
                    <text
                      x={city.textX}
                      y={city.textY + 11}
                      fill={isSelected ? '#000000' : isHovered ? '#facc15' : '#38bdf8'}
                      fontSize={isSelected ? '13' : '11'}
                      fontWeight="800"
                      textAnchor="middle"
                      className="select-none tracking-wider transition-all duration-300 uppercase"
                    >
                      {city.name}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Floating Tooltip Summary Card */}
          <div className="absolute bottom-3 left-3 right-3 sm:left-auto sm:right-3 p-3 rounded-2xl bg-black/90 border border-cyan-500/50 backdrop-blur-xl shadow-2xl flex items-center justify-between gap-4 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-black flex items-center justify-center font-extrabold shadow-md shrink-0">
                <MapPin className="w-5 h-5 text-black" />
              </div>
              <div>
                <div className="text-xs font-extrabold text-white flex items-center gap-2">
                  <span>{highlightedDistrictObj.name} ({highlightedDistrictObj.gujarati})</span>
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] uppercase font-bold border border-amber-400/30">
                    {highlightedDistrictObj.badge}
                  </span>
                </div>
                <div className="text-[10px] text-white/60">
                  {highlightedDistrictObj.region} • Tap boundary line to filter by city
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onSelectCity(highlightedDistrictObj.name);
                if (onClose) onClose();
              }}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-lg shadow-amber-500/25 cursor-pointer shrink-0 transition-all"
            >
              Select City
            </button>
          </div>
        </div>
      ) : (
        /* VIEW MODE B: Clean Grid View */
        <div className="w-full space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Gujarat Districts ({filteredDistricts.length})
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {filteredDistricts.map((dist) => {
              const isSelected = activeCityName.toLowerCase() === dist.name.toLowerCase();
              return (
                <button
                  key={dist.id}
                  onClick={() => {
                    onSelectCity(dist.name);
                    if (onClose) onClose();
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all duration-300 cursor-pointer flex flex-col justify-between h-24 ${
                    isSelected
                      ? 'bg-amber-500 border-amber-400 text-black shadow-lg shadow-amber-500/30 font-extrabold'
                      : 'bg-white/5 border-white/10 hover:bg-white/15 text-white hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold ${isSelected ? 'text-black' : 'text-cyan-300'}`}>
                      {dist.region}
                    </span>
                    {isSelected && <ShieldCheck className="w-4 h-4 text-black stroke-[2.5]" />}
                  </div>

                  <div>
                    <div className={`text-sm font-extrabold ${isSelected ? 'text-black' : 'text-white'}`}>{dist.gujarati}</div>
                    <div className={`text-xs font-bold ${isSelected ? 'text-black/80' : 'text-white/70'}`}>{dist.name}</div>
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
