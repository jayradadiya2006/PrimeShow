import React, { useState } from 'react';
import { MapPin, Sparkles, Navigation, CheckCircle2 } from 'lucide-react';

const CITIES_GEO = [
  { name: 'Palanpur', x: 420, y: 100, zone: 'North Gujarat', badge: 'Banaskantha', r: 16 },
  { name: 'Patan', x: 360, y: 135, zone: 'North Gujarat', badge: 'Heritage City', r: 16 },
  { name: 'Himmatnagar', x: 510, y: 145, zone: 'North East', badge: 'Sabarkantha', r: 16 },
  { name: 'Mehsana', x: 400, y: 185, zone: 'North Central', badge: 'Doodhsagar', r: 16 },
  { name: 'Gandhinagar', x: 445, y: 225, zone: 'Capital District', badge: 'State Capital', r: 18 },
  { name: 'Ahmedabad', x: 430, y: 268, zone: 'Central Gujarat', badge: 'Mega Hub', r: 22 },
  { name: 'Godhra', x: 560, y: 275, zone: 'East Gujarat', badge: 'Panchmahal', r: 16 },
  { name: 'Nadiad', x: 470, y: 295, zone: 'Central Gujarat', badge: 'Kheda Hub', r: 16 },
  { name: 'Anand', x: 490, y: 320, zone: 'Central Gujarat', badge: 'Milk City', r: 16 },
  { name: 'Jamnagar', x: 190, y: 310, zone: 'Saurashtra', badge: 'Oil City', r: 18 },
  { name: 'Rajkot', x: 270, y: 350, zone: 'Saurashtra Central', badge: 'Engineering Hub', r: 20 },
  { name: 'Junagadh', x: 240, y: 435, zone: 'Gir Region', badge: 'Gir Gateway', r: 18 },
  { name: 'Bhavnagar', x: 375, y: 415, zone: 'Gulf Region', badge: 'Cultural Hub', r: 18 },
  { name: 'Vadodara', x: 535, y: 350, zone: 'Central East', badge: 'Cultural Capital', r: 20 },
  { name: 'Bharuch', x: 510, y: 420, zone: 'South Central', badge: 'Industrial Zone', r: 17 },
  { name: 'Surat', x: 520, y: 480, zone: 'South Gujarat', badge: 'Diamond & Silk', r: 22 },
  { name: 'Navsari', x: 525, y: 525, zone: 'South Gujarat', badge: 'Twin City', r: 16 },
  { name: 'Valsad', x: 530, y: 565, zone: 'South Gujarat', badge: 'Mango Coast', r: 16 }
];

export const GujaratMapSelector = ({ selectedCity, onSelectCity, onClose }) => {
  const [hoveredCity, setHoveredCity] = useState(null);

  const activeCityData = CITIES_GEO.find(c => c.name.toLowerCase() === (selectedCity || 'surat').toLowerCase()) || CITIES_GEO[0];

  return (
    <div className="relative w-full flex flex-col items-center bg-[#07090e] rounded-3xl p-4 sm:p-6 border border-cyan-500/30 shadow-2xl overflow-hidden select-none">
      
      {/* Top Header Badge */}
      <div className="w-full flex items-center justify-between pb-4 border-b border-white/10 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-white leading-tight">Interactive Gujarat Map</h3>
            <p className="text-[11px] text-cyan-300">Select any of the 18 official cities to filter movies, theaters & events</p>
          </div>
        </div>

        {selectedCity && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Active: {selectedCity}</span>
          </div>
        )}
      </div>

      {/* SVG Container */}
      <div className="relative w-full max-w-2xl aspect-[4/3] flex items-center justify-center">
        <svg
          viewBox="0 0 700 600"
          className="w-full h-full drop-shadow-[0_0_25px_rgba(6,182,212,0.15)]"
        >
          <defs>
            {/* Ambient Gujarat Land Gradient */}
            <linearGradient id="gujaratLandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0f172a" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#0a0f1d" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#030712" stopOpacity="1" />
            </linearGradient>

            {/* Glowing Accent for Nodes */}
            <radialGradient id="activeNodeGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="1" />
              <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="hoverNodeGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="1" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Stylized Gujarat Geographic Outline Path */}
          <path
            d="M 330 60 L 460 70 L 580 120 L 620 220 L 590 320 L 560 380 L 540 450 L 550 580 L 490 560 L 480 470 L 460 410 L 420 370 L 360 460 L 290 470 L 210 460 L 160 380 L 140 310 L 220 280 L 310 320 L 350 250 L 340 180 Z"
            fill="url(#gujaratLandGrad)"
            stroke="rgba(6, 182, 212, 0.3)"
            strokeWidth="3"
            strokeDasharray="6 3"
            className="transition-all duration-500"
          />

          {/* Regional Connecting Web Lines */}
          <g stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1">
            <line x1="430" y1="268" x2="445" y2="225" />
            <line x1="430" y1="268" x2="470" y2="295" />
            <line x1="470" y1="295" x2="490" y2="320" />
            <line x1="490" y1="320" x2="535" y2="350" />
            <line x1="535" y1="350" x2="510" y2="420" />
            <line x1="510" y1="420" x2="520" y2="480" />
            <line x1="520" y1="480" x2="525" y2="525" />
            <line x1="525" y1="525" x2="530" y2="565" />
            <line x1="430" y1="268" x2="270" y2="350" />
            <line x1="270" y1="350" x2="190" y2="310" />
            <line x1="270" y1="350" x2="240" y2="435" />
            <line x1="270" y1="350" x2="375" y2="415" />
          </g>

          {/* Interactive City Nodes */}
          {CITIES_GEO.map((c) => {
            const isSelected = (selectedCity || 'surat').toLowerCase() === c.name.toLowerCase();
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
                {/* Pulse Aura Circle on Selected */}
                {isSelected && (
                  <circle
                    cx={c.x}
                    cy={c.y}
                    r={c.r * 2.2}
                    fill="url(#activeNodeGlow)"
                    className="animate-ping opacity-75"
                  />
                )}

                {/* Outer Glow Halo */}
                <circle
                  cx={c.x}
                  cy={c.y}
                  r={isSelected ? c.r * 1.6 : isHovered ? c.r * 1.4 : c.r * 1.1}
                  fill={isSelected ? 'rgba(245, 158, 11, 0.25)' : isHovered ? 'rgba(6, 182, 212, 0.25)' : 'rgba(255, 255, 255, 0.05)'}
                  stroke={isSelected ? '#f59e0b' : isHovered ? '#06b6d4' : 'rgba(255, 255, 255, 0.2)'}
                  strokeWidth={isSelected ? '2.5' : '1.5'}
                  className="transition-all duration-300"
                />

                {/* Center Core Circle */}
                <circle
                  cx={c.x}
                  cy={c.y}
                  r={isSelected ? 7 : isHovered ? 6 : 4}
                  fill={isSelected ? '#f59e0b' : isHovered ? '#06b6d4' : '#94a3b8'}
                  className="transition-all duration-300"
                />

                {/* Label Tag */}
                <text
                  x={c.x}
                  y={c.y + c.r + 14}
                  textAnchor="middle"
                  className={`text-[10px] font-extrabold tracking-wide transition-all duration-300 ${
                    isSelected
                      ? 'fill-amber-400 font-extrabold text-[12px]'
                      : isHovered
                      ? 'fill-cyan-300 font-bold'
                      : 'fill-white/70'
                  }`}
                >
                  {c.name}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip Card */}
        {(hoveredCity || selectedCity) && (
          <div className="absolute bottom-3 left-3 right-3 sm:left-auto sm:right-3 p-3 rounded-2xl bg-black/90 border border-cyan-500/40 backdrop-blur-xl shadow-2xl flex items-center justify-between gap-4 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 shrink-0 font-bold">
                <MapPin className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <div className="text-xs font-extrabold text-white flex items-center gap-1.5">
                  <span>{hoveredCity || selectedCity}</span>
                  <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[9px] uppercase font-bold">
                    {(CITIES_GEO.find(c => c.name === (hoveredCity || selectedCity)) || {}).badge || 'Gujarat City'}
                  </span>
                </div>
                <div className="text-[10px] text-white/60">
                  {(CITIES_GEO.find(c => c.name === (hoveredCity || selectedCity)) || {}).zone || 'Gujarat State'} • Tap map node to switch city
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onSelectCity(hoveredCity || selectedCity);
                if (onClose) onClose();
              }}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-lg shadow-amber-500/20 cursor-pointer shrink-0 transition-all"
            >
              Select City
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
