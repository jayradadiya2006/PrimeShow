import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Clock, MapPin, Check } from 'lucide-react';
import API from '../../services/api';

export default function AdminShows() {
  const [shows, setShows] = useState([]);
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);

  const [selectedMovie, setSelectedMovie] = useState('');
  const [selectedTheatre, setSelectedTheatre] = useState('');
  const [showTime, setShowTime] = useState('07:00 PM');
  const [normalPrice, setNormalPrice] = useState(350);

  useEffect(() => {
    API.get('/shows').then(res => setShows(res.data)).catch(() => {});
    API.get('/movies').then(res => setMovies(res.data)).catch(() => {});
    API.get('/theatres').then(res => setTheatres(res.data)).catch(() => {});
  }, []);

  const handleAddShow = async (e) => {
    e.preventDefault();
    if (!selectedMovie || !selectedTheatre) return;

    try {
      const res = await API.post('/shows', {
        movieId: selectedMovie,
        theatreId: selectedTheatre,
        screenName: "Screen 1 - IMAX",
        date: "2026-07-27",
        time: showTime,
        format: "IMAX 3D",
        language: "English",
        prices: { VIP: 550, Premium: 450, Recliner: 700, Normal: Number(normalPrice) }
      });
      setShows([...shows, res.data]);
      alert("Showtime added successfully!");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-white">Theatre & Show Matrix</h1>
        <p className="text-xs text-slate-400">Map showtimes to specific auditoriums and configure seat tier prices.</p>
      </div>

      {/* SCHEDULER FORM */}
      <div className="p-6 rounded-3xl glass-panel border-white/10 space-y-4">
        <h3 className="font-serif text-xl font-bold text-white">Schedule New Showtime Slot</h3>
        <form onSubmit={handleAddShow} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <select value={selectedMovie} onChange={e => setSelectedMovie(e.target.value)} required className="p-3 rounded-xl glass-input text-xs font-semibold">
            <option value="" className="bg-[#0c0d14]">Select Movie</option>
            {movies.map(m => <option key={m.id} value={m.id} className="bg-[#0c0d14]">{m.title}</option>)}
          </select>

          <select value={selectedTheatre} onChange={e => setSelectedTheatre(e.target.value)} required className="p-3 rounded-xl glass-input text-xs font-semibold">
            <option value="" className="bg-[#0c0d14]">Select Theatre</option>
            {theatres.map(t => <option key={t.id} value={t.id} className="bg-[#0c0d14]">{t.name}</option>)}
          </select>

          <input type="text" placeholder="Time (e.g. 07:00 PM)" value={showTime} onChange={e => setShowTime(e.target.value)} className="p-3 rounded-xl glass-input text-xs" />
          <input type="number" placeholder="Base Ticket Price (₹)" value={normalPrice} onChange={e => setNormalPrice(e.target.value)} className="p-3 rounded-xl glass-input text-xs" />

          <button type="submit" className="sm:col-span-4 py-3 rounded-xl bg-cyan-500 text-black font-bold text-xs glow-cyan cursor-pointer">
            Add Showtime to Matrix
          </button>
        </form>
      </div>

      {/* SHOWTIMES TABLE */}
      <div className="p-6 rounded-3xl glass-panel border-white/10 space-y-4">
        <h3 className="font-serif text-xl font-bold text-white">Active Scheduled Shows</h3>
        <div className="space-y-3">
          {shows.map(s => (
            <div key={s.id} className="p-4 rounded-2xl glass-panel border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
              <div>
                <span className="font-mono text-cyan-400 font-bold">{s.id}</span>
                <p className="font-bold text-white mt-1">{s.theatreName || "PVR Multiplex"}</p>
                <p className="text-slate-400">{s.screenName} • {s.time} • Base: ₹{s.prices?.Normal || 300}</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-[10px] font-bold">
                Booked: {s.bookedSeats?.length || 0} Seats
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
