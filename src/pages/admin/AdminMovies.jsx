import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, Film, Check } from 'lucide-react';
import API from '../../services/api';

export default function AdminMovies() {
  const [movies, setMovies] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [duration, setDuration] = useState('2h 30m');
  const [certification, setCertification] = useState('UA');
  const [posterUrl, setPosterUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');

  useEffect(() => {
    API.get('/movies').then(res => setMovies(res.data)).catch(() => {});
  }, []);

  const handleAddMovie = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/movies', {
        title,
        synopsis,
        duration,
        certification,
        posterUrl: posterUrl || "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop",
        bannerUrl: bannerUrl || "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1920&auto=format&fit=crop",
        languages: ["English", "Hindi"],
        formats: ["IMAX 3D", "2D"],
        genres: ["Action", "Sci-Fi"]
      });
      setMovies([res.data, ...movies]);
      setShowAddModal(false);
      setTitle(''); setSynopsis('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteMovie = async (id) => {
    if (!confirm("Are you sure you want to delete this movie title?")) return;
    await API.delete(`/movies/${id}`);
    setMovies(movies.filter(m => m.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-white">Movie Management Catalog</h1>
          <p className="text-xs text-slate-400">Add, edit, or soft-delete movie listings & cast assets.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 rounded-full bg-cyan-500 text-black font-bold text-xs glow-cyan flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Add New Movie
        </button>
      </div>

      {/* MOVIES TABLE */}
      <div className="p-6 rounded-3xl glass-panel border-white/10 space-y-4">
        <div className="divide-y divide-white/5">
          {movies.map((m) => (
            <div key={m.id} className="py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img src={m.posterUrl} alt={m.title} className="w-12 h-16 object-cover rounded-xl" />
                <div>
                  <h3 className="font-serif text-lg font-bold text-white">{m.title}</h3>
                  <p className="text-xs text-slate-400">{m.genres?.join(', ')} • {m.duration} • Rating: ★ {m.rating}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDeleteMovie(m.id)}
                  className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-semibold cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ADD MOVIE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-[#0c0d14] border border-cyan-500/30 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="font-serif text-2xl font-bold text-white">Add New Movie</h3>
            <form onSubmit={handleAddMovie} className="space-y-3">
              <input type="text" required placeholder="Movie Title" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-3 rounded-xl glass-input text-xs" />
              <textarea rows={2} required placeholder="Synopsis" value={synopsis} onChange={e => setSynopsis(e.target.value)} className="w-full p-3 rounded-xl glass-input text-xs" />
              <div className="grid grid-cols-2 gap-2">
                <input type="text" placeholder="Duration (e.g. 2h 45m)" value={duration} onChange={e => setDuration(e.target.value)} className="p-3 rounded-xl glass-input text-xs" />
                <input type="text" placeholder="Certification (e.g. UA)" value={certification} onChange={e => setCertification(e.target.value)} className="p-3 rounded-xl glass-input text-xs" />
              </div>
              <input type="url" placeholder="Poster Image URL" value={posterUrl} onChange={e => setPosterUrl(e.target.value)} className="w-full p-3 rounded-xl glass-input text-xs" />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-full glass-panel text-xs">Cancel</button>
                <button type="submit" className="px-6 py-2 rounded-full bg-cyan-500 text-black font-bold text-xs glow-cyan">Save Movie</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
