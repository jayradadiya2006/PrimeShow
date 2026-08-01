import React, { useState, useEffect } from 'react';
import { MessageSquare, Check, EyeOff, Trash2, Star } from 'lucide-react';
import API from '../../services/api';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    API.get('/reviews/mov-1').then(res => setReviews(res.data)).catch(() => {});
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await API.put(`/reviews/${id}/status`, { status });
      setReviews(reviews.map(r => r.id === id ? res.data : r));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-white">Review Queue Moderation</h1>
        <p className="text-xs text-slate-400">Moderate customer-submitted movie reviews (Approve, Hide, Delete).</p>
      </div>

      <div className="p-6 rounded-3xl glass-panel border-white/10 space-y-4">
        <div className="divide-y divide-white/5">
          {reviews.map((r) => (
            <div key={r.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <img src={r.userAvatar} alt={r.userName} className="w-7 h-7 rounded-full object-cover" />
                  <span className="text-xs font-bold text-white">{r.userName}</span>
                  <span className="text-xs font-bold text-amber-300 ml-2">★ {r.rating}/5</span>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                    r.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-300'
                  }`}>
                    {r.status}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{r.comment}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleUpdateStatus(r.id, 'approved')}
                  className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-black text-xs font-semibold cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleUpdateStatus(r.id, 'hidden')}
                  className="p-2 rounded-xl bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-black text-xs font-semibold cursor-pointer"
                >
                  <EyeOff className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
