import React from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  BarChart3, Film, Calendar, Grid, MessageSquare, Percent, 
  ShieldCheck, LogOut, ArrowLeft, Headphones 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import AdminMovies from './AdminMovies';
import AdminShows from './AdminShows';
import AdminSeats from './AdminSeats';
import AdminReviews from './AdminReviews';
import AdminCoupons from './AdminCoupons';
import AdminChat from './AdminChat';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#050508] flex flex-col items-center justify-center p-4 text-center space-y-4">
        <ShieldCheck className="w-12 h-12 text-red-400" />
        <h1 className="font-serif text-3xl font-bold text-white">Admin Authentication Required</h1>
        <p className="text-xs text-slate-400">You must sign in with an executive admin role to view this panel.</p>
        <button
          onClick={() => navigate('/admin/login')}
          className="px-6 py-2.5 rounded-full bg-cyan-500 text-black font-bold text-xs glow-cyan"
        >
          Proceed to Admin Sign In
        </button>
      </div>
    );
  }

  const menu = [
    { label: "Analytics Dashboard", path: "/admin", icon: BarChart3 },
    { label: "Movie Management", path: "/admin/movies", icon: Film },
    { label: "Theatre & Show Matrix", path: "/admin/shows", icon: Calendar },
    { label: "Real-time Seat Controls", path: "/admin/seats", icon: Grid },
    { label: "Review Moderation", path: "/admin/reviews", icon: MessageSquare },
    { label: "Targeted Coupon Engine", path: "/admin/coupons", icon: Percent },
    { label: "Live Support Desk", path: "/admin/chat", icon: Headphones },
  ];

  return (
    <div className="min-h-screen bg-[#050508] text-slate-100 flex flex-col md:flex-row">
      <aside className="w-full md:w-72 bg-[#0c0d14] border-r border-white/10 p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center glow-cyan">
              <ShieldCheck className="w-6 h-6 text-black stroke-[2.5]" />
            </div>
            <div>
              <span className="font-serif text-xl font-bold text-white">PrimeAdmin</span>
              <span className="text-[9px] text-cyan-400 uppercase tracking-widest block font-semibold">Isolated Operations</span>
            </div>
          </div>

          <nav className="space-y-2">
            {menu.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-all border ${
                    isActive
                      ? 'bg-cyan-500 text-black border-cyan-400 font-bold glow-cyan'
                      : 'glass-panel text-slate-300 hover:border-cyan-500/30'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-cyan-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-white/10 space-y-3">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl glass-panel text-xs text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" /> Customer Website
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 text-red-400 text-xs font-bold hover:bg-red-500/20"
          >
            <LogOut className="w-4 h-4" /> Admin Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/movies" element={<AdminMovies />} />
          <Route path="/shows" element={<AdminShows />} />
          <Route path="/seats" element={<AdminSeats />} />
          <Route path="/reviews" element={<AdminReviews />} />
          <Route path="/coupons" element={<AdminCoupons />} />
          <Route path="/chat" element={<AdminChat />} />
        </Routes>
      </main>
    </div>
  );
}
