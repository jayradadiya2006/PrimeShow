import React from 'react';
import { User } from 'lucide-react';

export const CastCarousel = ({ cast = [], director }) => {
  if ((!cast || cast.length === 0) && !director) return null;

  return (
    <div className="w-full my-4">
      <h3 className="text-base sm:text-xl font-bold font-sans text-white mb-3 flex items-center gap-2">
        <User className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
        <span>Cast & Crew Spotlight</span>
      </h3>

      <div className="flex items-center gap-2.5 sm:gap-4 overflow-x-auto pb-3 scrollbar-none">
        {/* Director Card */}
        {director && (
          <div className="shrink-0 w-24 sm:w-32 glass-panel rounded-2xl p-2 sm:p-2.5 text-center border border-amber-400/30">
            <div className="w-14 h-14 sm:w-20 sm:h-20 mx-auto rounded-full overflow-hidden mb-1.5 border-2 border-amber-400/60 shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"
                alt={director}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-[11px] sm:text-xs font-bold text-amber-300 truncate">{director}</div>
            <div className="text-[9px] sm:text-[10px] text-white/50">Director</div>
          </div>
        )}

        {/* Cast Members */}
        {cast.map((actor, idx) => {
          const actorName = actor.actorName || actor.name || (typeof actor === 'string' ? actor : 'Artist');
          const roleName = actor.roleName || actor.role || actor.character || '';
          const photoUrl = actor.photoUrl || actor.photo || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80";

          return (
            <div key={actor.id || actor._id || idx} className="shrink-0 w-24 sm:w-32 glass-panel rounded-2xl p-2 sm:p-2.5 text-center border border-white/10 hover:border-amber-400/40 transition-colors">
              <div className="w-14 h-14 sm:w-20 sm:h-20 mx-auto rounded-full overflow-hidden mb-1.5 border border-white/20 shadow-md">
                <img
                  src={photoUrl}
                  alt={actorName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-[11px] sm:text-xs font-bold text-white truncate">{actorName}</div>
              {roleName && (
                <div className="text-[9px] sm:text-[10px] text-amber-400/80 truncate">as {roleName}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
