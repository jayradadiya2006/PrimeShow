import React, { useState, useEffect } from 'react';
import { Grid, ShieldAlert, Check, X, RefreshCw } from 'lucide-react';
import API from '../../services/api';

export default function AdminSeats() {
  const [shows, setShows] = useState([]);
  const [selectedShowId, setSelectedShowId] = useState('');
  const [selectedShow, setSelectedShow] = useState(null);
  const [seatsToBlock, setSeatsToBlock] = useState('');

  useEffect(() => {
    API.get('/shows').then(res => {
      setShows(res.data);
      if (res.data.length > 0) {
        setSelectedShowId(res.data[0].id);
        setSelectedShow(res.data[0]);
      }
    }).catch(() => {});
  }, []);

  const handleSelectShow = (id) => {
    setSelectedShowId(id);
    const show = shows.find(s => s.id === id);
    setSelectedShow(show);
  };

  const handleBlockUnblock = async (action) => {
    if (!seatsToBlock.trim() || !selectedShowId) return;
    const seatList = seatsToBlock.split(',').map(s => s.trim().toUpperCase());

    try {
      const res = await API.post('/admin/block-seats', {
        showId: selectedShowId,
        seats: seatList,
        action
      });
      setSelectedShow(res.data);
      setSeatsToBlock('');
      alert(`Seats ${seatList.join(', ')} successfully ${action}ed!`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-white">Real-Time Seat & Booking Operations</h1>
        <p className="text-xs text-slate-400">View visual seat maps, manually block seats for VIP/maintenance, or override status.</p>
      </div>

      {/* SHOW SELECTOR */}
      <div className="p-6 rounded-3xl glass-panel border-white/10 space-y-4">
        <label className="text-xs font-semibold text-slate-300 block">Select Showtime to Inspect</label>
        <select
          value={selectedShowId}
          onChange={e => handleSelectShow(e.target.value)}
          className="w-full p-3 rounded-xl glass-input text-xs font-semibold"
        >
          {shows.map(s => (
            <option key={s.id} value={s.id} className="bg-[#0c0d14]">
              {s.id} — {s.theatreName} ({s.time})
            </option>
          ))}
        </select>
      </div>

      {/* BLOCK / UNBLOCK CONTROLS */}
      {selectedShow && (
        <div className="p-6 rounded-3xl glass-panel border-cyan-500/30 space-y-4">
          <h3 className="font-serif text-xl font-bold text-white">Seat Blocking Operations</h3>
          <p className="text-xs text-slate-400">Enter comma-separated seat IDs (e.g. B1, B2, C5) to block or unblock for maintenance.</p>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="e.g. B1, B2, E4"
              value={seatsToBlock}
              onChange={e => setSeatsToBlock(e.target.value)}
              className="flex-1 p-3 rounded-xl glass-input text-xs font-mono uppercase"
            />
            <button
              onClick={() => handleBlockUnblock('block')}
              className="px-6 py-3 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white font-bold text-xs transition-all border border-red-500/40 cursor-pointer"
            >
              Block Seats
            </button>
            <button
              onClick={() => handleBlockUnblock('unblock')}
              className="px-6 py-3 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-black font-bold text-xs transition-all border border-emerald-500/40 cursor-pointer"
            >
              Unblock Seats
            </button>
          </div>

          <div className="pt-4 border-t border-white/10 flex flex-wrap gap-4 text-xs text-slate-300">
            <span>Booked Seats ({selectedShow.bookedSeats?.length || 0}): <strong className="text-cyan-300">{selectedShow.bookedSeats?.join(', ') || 'None'}</strong></span>
            <span>Blocked Seats ({selectedShow.blockedSeats?.length || 0}): <strong className="text-red-400">{selectedShow.blockedSeats?.join(', ') || 'None'}</strong></span>
          </div>
        </div>
      )}
    </div>
  );
}
