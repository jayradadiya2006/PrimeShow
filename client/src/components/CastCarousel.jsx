import React from 'react';
import { User } from 'lucide-react';

export const CastCarousel = ({ cast = [], director }) => {
  return (
    <div className="w-full my-6">
      <h3 className="text-xl font-bold font-serif text-white mb-4 flex items-center gap-2">
        <span>Cast & Crew Spotlight</span>
      </h3>

      <div className="flex items-center gap-4 overflow-x-auto pb-4 scrollbar-thin">
        {/* Director Card */}
        {director && (
          <div className="shrink-0 w-32 glass-panel rounded-2xl p-2.5 text-center border border-amber-400/30">
            <div className="w-20 h-20 mx-auto rounded-full overflow-hidden mb-2 border-2 border-amber-400/60 shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"
                alt={director}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-xs font-bold text-amber-300 truncate">{director}</div>
            <div className="text-[10px] text-white/50">Director</div>
          </div>
        )}

        {/* Cast Members */}
        {cast.map((actor, idx) => (
          <div key={idx} className="shrink-0 w-32 glass-panel rounded-2xl p-2.5 text-center border border-white/10 hover:border-amber-400/40 transition-colors">
            <div className="w-20 h-20 mx-auto rounded-full overflow-hidden mb-2 border border-white/20 shadow-md">
              <img
                src={actor.photo || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80"}
                alt={actor.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-xs font-bold text-white truncate">{actor.name}</div>
            <div className="text-[10px] text-amber-400/80 truncate">as {actor.role}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
