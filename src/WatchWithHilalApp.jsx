import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TMDB_KEY } from "./config";

const TMDB_IMAGE = "https://image.tmdb.org/t/p/w500";
const HEARTS = 10;

function WatchWithHilalApp() {
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [movies, setMovies] = useState([]);
  const [filter, setFilter] = useState("all");
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState("");

  // 🎬 LocalStorage yükleme
  useEffect(() => {
    const saved = localStorage.getItem("watchwithhilal-movies");
    if (saved) setMovies(JSON.parse(saved));
  }, []);

  // 💾 Değişiklikte kaydet
  useEffect(() => {
    localStorage.setItem("watchwithhilal-movies", JSON.stringify(movies));
  }, [movies]);

  // 🔍 TMDB'den film bul ve ekle
  const addMovie = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setError("");
    setIsAdding(true);
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(
          title.trim()
        )}&language=tr-TR`
      );
      const data = await res.json();
      const movie = data.results?.[0];
      const newMovie = {
        id: Date.now(),
        title: title.trim(),
        tmdbId: movie?.id || null,
        poster: movie?.poster_path ? `${TMDB_IMAGE}${movie.poster_path}` : null,
        year: movie?.release_date ? movie.release_date.slice(0, 4) : "",
        overview: movie?.overview || "",
        note: note.trim(),
        watched: false,
        ratingHilal: 0,
        ratingOkan: 0,
      };
      setMovies((prev) => [newMovie, ...prev]);
      setTitle("");
      setNote("");
    } catch {
      setError("Film bulunamadı veya TMDB hatası oluştu.");
    } finally {
      setIsAdding(false);
    }
  };

  // 🗑 Sil
  const deleteMovie = (id) => setMovies(movies.filter((m) => m.id !== id));

  // ❤️ Puan
  const updateRating = (id, who, value) => {
    setMovies((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, [who]: value } : m
      )
    );
  };

  // 🎬 İzleme durumu
  const toggleWatched = (id) => {
    setMovies((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, watched: !m.watched } : m
      )
    );
  };

  const updateNote = (id, value) => {
    setMovies((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, note: value } : m
      )
    );
  };

  const filteredMovies =
    filter === "watched"
      ? movies.filter((m) => m.watched)
      : filter === "unwatched"
      ? movies.filter((m) => !m.watched)
      : movies;

  const renderHearts = (current, onSelect) => (
    <div className="flex gap-1 justify-center">
      {Array.from({ length: HEARTS }, (_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onSelect(i + 1)}
          className="text-2xl focus:outline-none hover:scale-110 transition-transform"
        >
          <span className={i + 1 <= current ? "text-red-500 drop-shadow" : "text-gray-600"}>
            ♥
          </span>
        </button>
      ))}
    </div>
  );

  const calcAvg = (m) => {
    const vals = [m.ratingHilal, m.ratingOkan].filter((x) => x > 0);
    if (!vals.length) return 0;
    return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center text-white px-4 py-8 relative"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.9)), url('https://images.unsplash.com/photo-1505685296765-3a2736de412f?auto=format&fit=crop&w=1600&q=80')",
      }}
    >
      {/* Üst Başlık */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-red-600/10 border border-red-500/40 mb-3">
          <span className="text-red-500 text-xl">🎬</span>
          <span className="text-sm text-red-300 tracking-wide">
            watchwithhilal.watch
          </span>
        </div>
        <h1 className="text-5xl font-extrabold text-red-500 drop-shadow-[0_0_25px_rgba(248,113,113,0.75)]">
          Bugün ne izlesek?
        </h1>
      </motion.div>

      {/* Film ekleme formu */}
      <motion.form
        onSubmit={addMovie}
        className="max-w-5xl mx-auto flex flex-col md:flex-row gap-3 mb-6 justify-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <input
          type="text"
          placeholder="Film adı yaz (ör: Inception)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 p-3 rounded-xl bg-gray-900/80 border border-red-500/40 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-red-500/70 shadow-lg"
        />
        <input
          type="text"
          placeholder="Not (opsiyonel)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="flex-[0.8] p-3 rounded-xl bg-gray-900/60 border border-gray-700 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-red-500/40"
        />
        <button
          type="submit"
          disabled={isAdding}
          className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-60 font-semibold text-sm md:text-base shadow-[0_0_25px_rgba(239,68,68,0.6)] transition"
        >
          {isAdding ? "Ekleniyor..." : "Filmi Ekle"}
        </button>
      </motion.form>

      {/* Filtreleme */}
      <div className="flex justify-center gap-3 mb-8">
        {["all", "unwatched", "watched"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full border text-sm ${
              filter === f
                ? "bg-red-600 text-white border-red-500"
                : "bg-gray-900/60 text-gray-400 border-gray-700 hover:border-red-500/40"
            } transition`}
          >
            {f === "all" ? "Tümü" : f === "unwatched" ? "İzlenecek" : "İzlendi"}
          </button>
        ))}
      </div>

      {/* Film kartları */}
      <div className="max-w-6xl mx-auto grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredMovies.length === 0 ? (
          <p className="text-gray-400 text-center mt-8">Henüz film yok 🎞️</p>
        ) : (
          filteredMovies.map((m) => {
            const avg = calcAvg(m);
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-gray-900 to-black border border-red-500/20 shadow-xl"
              >
                {m.poster ? (
                  <img
                    src={m.poster}
                    alt={m.title}
                    className="w-full h-80 object-cover"
                  />
                ) : (
                  <div className="w-full h-80 flex items-center justify-center bg-gray-800 text-gray-500">
                    Poster yok
                  </div>
                )}

                <button
                  onClick={() => deleteMovie(m.id)}
                  className="absolute top-2 right-2 bg-black/70 hover:bg-red-700 text-red-400 hover:text-white w-8 h-8 flex items-center justify-center rounded-full text-lg transition"
                >
                  ×
                </button>

                {m.watched && (
                  <div className="absolute bottom-2 left-2 bg-red-600/90 text-xs px-3 py-1 rounded-full">
                    ✔ İzlendi
                  </div>
                )}

                <div className="p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-lg text-white capitalize">
                      {m.title}{" "}
                      <span className="text-gray-500 text-sm">({m.year})</span>
                    </h2>
                    <button
                      onClick={() => toggleWatched(m.id)}
                      className="text-xs px-3 py-1 rounded-full border border-red-500/50 text-red-300 hover:bg-red-600/20 transition"
                    >
                      {m.watched ? "İzlendi ✓" : "İzlenecek"}
                    </button>
                  </div>

                  <textarea
                    value={m.note}
                    onChange={(e) => updateNote(m.id, e.target.value)}
                    placeholder="Bu film hakkında notunuz..."
                    className="w-full text-xs bg-black/60 border border-gray-700 rounded-lg p-2 text-gray-300 focus:outline-none focus:ring-1 focus:ring-red-500/50 resize-none"
                    rows={2}
                  />

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-pink-400 font-semibold block text-center mb-1">Hilal</span>
                      {renderHearts(m.ratingHilal, (v) => updateRating(m.id, "ratingHilal", v))}
                    </div>
                    <div>
                      <span className="text-blue-400 font-semibold block text-center mb-1">Okan</span>
                      {renderHearts(m.ratingOkan, (v) => updateRating(m.id, "ratingOkan", v))}
                    </div>
                    <div className="text-center mt-2 text-yellow-400 font-semibold">
                      Ortalama: {avg}/10
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default WatchWithHilalApp;
