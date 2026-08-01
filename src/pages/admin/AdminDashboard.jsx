import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Ticket, Users, Film, DollarSign, ArrowUpRight } from 'lucide-react';
import API from '../../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    API.get('/admin/stats').then(res => setStats(res.data)).catch(() => {});
  }, []);

  if (!stats) return <div className="text-slate-400">Loading High-Density Analytics...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold text-white">Executive Operations Dashboard</h1>
        <p className="text-xs text-slate-400">Real-time revenue stream, seat occupancy, and ticketing analytics.</p>
      </div>

      {/* METRIC CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-3xl glass-panel border-cyan-500/30 space-y-2 bg-gradient-to-br from-cyan-500/10 to-transparent">
          <div className="flex items-center justify-between text-xs text-cyan-400 font-bold uppercase tracking-wider">
            <span>Total Gross Revenue</span>
            <DollarSign className="w-4 h-4" />
          </div>
          <p className="text-3xl font-serif font-bold text-white">₹{stats.totalRevenue.toLocaleString()}</p>
          <p className="text-[11px] text-emerald-400 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +18.4% this week</p>
        </div>

        <div className="p-6 rounded-3xl glass-panel border-indigo-500/30 space-y-2 bg-gradient-to-br from-indigo-500/10 to-transparent">
          <div className="flex items-center justify-between text-xs text-indigo-400 font-bold uppercase tracking-wider">
            <span>Bookings Count</span>
            <Ticket className="w-4 h-4" />
          </div>
          <p className="text-3xl font-serif font-bold text-white">{stats.totalBookings}</p>
          <p className="text-[11px] text-emerald-400 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +12% occupancy</p>
        </div>

        <div className="p-6 rounded-3xl glass-panel border-purple-500/30 space-y-2 bg-gradient-to-br from-purple-500/10 to-transparent">
          <div className="flex items-center justify-between text-xs text-purple-400 font-bold uppercase tracking-wider">
            <span>Registered Users</span>
            <Users className="w-4 h-4" />
          </div>
          <p className="text-3xl font-serif font-bold text-white">{stats.totalUsers}</p>
          <p className="text-[11px] text-purple-300">VIP Members</p>
        </div>

        <div className="p-6 rounded-3xl glass-panel border-amber-500/30 space-y-2 bg-gradient-to-br from-amber-500/10 to-transparent">
          <div className="flex items-center justify-between text-xs text-amber-400 font-bold uppercase tracking-wider">
            <span>Active Movies</span>
            <Film className="w-4 h-4" />
          </div>
          <p className="text-3xl font-serif font-bold text-white">{stats.totalMovies}</p>
          <p className="text-[11px] text-slate-400">In 5 Cities</p>
        </div>
      </div>

      {/* RECENT BOOKINGS & TOP GROSSING */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 p-6 rounded-3xl glass-panel border-white/10 space-y-4">
          <h3 className="font-serif text-xl font-bold text-white">Live Booking Stream</h3>
          <div className="space-y-3 divide-y divide-white/5">
            {stats.recentBookings?.slice(0, 5).map(b => (
              <div key={b.id} className="pt-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-white">{b.movieTitle}</p>
                  <p className="text-slate-400">{b.theatreName} • Seats: {b.seats?.join(', ')}</p>
                </div>
                <span className="font-bold text-cyan-300">₹{b.finalAmount}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 p-6 rounded-3xl glass-panel border-white/10 space-y-4">
          <h3 className="font-serif text-xl font-bold text-white">Top Grossing Titles</h3>
          <div className="space-y-3">
            {stats.topMovies?.map(m => (
              <div key={m.id} className="flex items-center gap-3 p-2 rounded-xl glass-panel border-white/5">
                <img src={m.posterUrl} alt={m.title} className="w-10 h-12 object-cover rounded-lg" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">{m.title}</p>
                  <p className="text-[10px] text-slate-400">Rating: ★ {m.rating}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
