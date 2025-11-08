import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TMDB_KEY } from "./config";

const TMDB_IMAGE = "https://image.tmdb.org/t/p/w500";
const HEARTS = 10;

function WatchWithHilalApp() {
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [movies, setMovies] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState("");

  // 🎬 Sayfa açılınca localStorage'dan filmleri yükle
  useEffect(() => {
    const saved = localStorage.getItem("watchwithhilal-movies");
    if (saved) {
      try {
        setMovies(JSON.parse(saved));
      } catch {
        setMovies([]);
      }
    }
  }, []);

  // 💾 Her değişiklikte kaydet
  useEffect(() => {
    localStorage.setItem("watchwithhilal-movies", JSON.stringify(movies));
  }, [movies]);

  // 🔍 TMDB'den poster bulup film ekle
  const addMovie = async (e) => {
    e.preventDefault();
    setError("");
    if (!title.trim()) return;

    setIsAdding(true);
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(
          title.trim()
        )}&language=tr-TR`
      );

      if (!res.ok) throw new Error("TMDB isteği başarısız");

      const data = await res.json();
      const movie = data.results && data.results[0];

      const newMovie = {
        id: Date.now(),
        title: title.trim(),
        tmdbId: movie ? movie.id : null,
        poster: movie && movie.poster_path ? `${TMDB_IMAGE}${movie.poster_path}` : null,
        overview: movie ? movie.overview : "",
        year: movie && movie.release_date ? movie.release_date.slice(0, 4) : "",
        note: note.trim(),
        watched: false,
        ratingHilal: 0,
        ratingOkan: 0,
      };

      setMovies((prev) => [newMovie, ...prev]);
      setTitle("");
      setNote("");
    } catch (err) {
      console.error(err);
      setError("Film bulunamadı veya TMDB hatası. İsmi kontrol et.");
    } finally {
      setIsAdding(false);
    }
  };

  // ❤️ Puan güncelle
  const updateRating = (id, who, value) => {
    setMovies((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              [who]: value,
            }
          : m
      )
    );
  };

  // 🎬 İzledim toggle
  const toggleWatched = (id) => {
    setMovies((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              watched: !m.watched,
            }
          : m
      )
    );
  };

  // 📝 Not güncelle
  const updateNote = (id, value) => {
    setMovies((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              note: value,
            }
          : m
      )
    );
  };

  // 🗑 Sil
  const deleteMovie = (id) => {
    setMovies((prev) => prev.filter((m) => m.id !== id));
  };

  // ❤️ kalp render helper
  const renderHearts = (current, onSelect) => (
    <div className="flex gap-1">
      {Array.from({ length: HEARTS }, (_, i) => {
        const v = i + 1;
        return (
          <button
            key={v}
            type="button"
            onClick={() => onSelect(v)}
            className="focus:outline-none"
          >
            <span className={v <= current ? "text-red-500" : "text-gray-600"}>
              ♥
            </span>
          </button>
        );
      })}
    </div>
  );

  const calcAvg = (m) => {
    const vals = [m.ratingHilal, m.ratingOkan].filter((x) => x > 0);
    if (!vals.length) return 0;
    const sum = vals.reduce((a, b) => a + b, 0);
    return Math.round((sum / vals.length) * 10) / 10;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-red-600/10 border border-red-500/40 mb-3">
          <span className="text-red-500 text-xl">🎬</span>
          <span className="text-sm text-red-300 tracking-wide">
            watchwithhilal.watch
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-red-500 drop-shadow-[0_0_18px_rgba(248,113,113,0.55)]">
          Watch With Hilal
        </h1>
        <p className="mt-3 text-gray-400 text-sm md:text-base">
          Ortak film defteriniz: Film ekleyin, poster otomatik gelsin, Hilal &amp; Okan kalp ile
          puanlasın, not bırakın, &ldquo;izlendi&rdquo; diye işaretleyin.
        </p>
      </motion.div>

      {/* Film ekleme formu */}
      <motion.form
        onSubmit={addMovie}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto flex flex-col md:flex-row gap-3 mb-6"
      >
        <input
          type="text"
          placeholder="Film adı yaz (ör: Inception)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 p-3 rounded-xl bg-gray-900/80 border border-red-500/40 text-sm md:text-base
                     focus:outline-none focus:ring-2 focus:ring-red-500/70 shadow-lg"
        />
        <input
          type="text"
          placeholder="Not (opsiyonel)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="flex-[0.8] p-3 rounded-xl bg-gray-900/60 border border-gray-700 text-xs md:text-sm
                     focus:outline-none focus:ring-2 focus:ring-red-500/40"
        />
        <button
          type="submit"
          disabled={isAdding}
          className="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-60
                     font-semibold text-sm md:text-base shadow-[0_0_20px_rgba(239,68,68,0.5)] transition"
        >
          {isAdding ? "Ekleniyor..." : "Filmi Ekle"}
        </button>
      </motion.form>

      {error && (
        <div className="max-w-5xl mx-auto mb-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Film kartları */}
      <div className="max-w-5xl mx-auto grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {movies.length === 0 ? (
          <p className="text-gray-500 col-span-full text-center mt-8">
            Henüz film eklemediniz. İlk filminizi ekleyin 🎞️
          </p>
        ) : (
          movies.map((m) => {
            const avg = calcAvg(m);
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`relative rounded-2xl overflow-hidden bg-gradient-to-b from-gray-900 to-black
                           border border-red-500/20 shadow-xl flex flex-col`}
              >
                {/* Poster */}
                <div className="relative">
                  {m.poster ? (
                    <img
                      src={m.poster}
                      alt={m.title}
                      className="w-full h-64 object-cover"
                    />
                  ) : (
                    <div className="w-full h-64 flex items-center justify-center bg-gray-900 text-gray-600 text-sm">
                      Poster bulunamadı
                    </div>
                  )}
                  <button
                    onClick={() => deleteMovie(m.id)}
                    className="absolute top-2 right-2 bg-black/70 hover:bg-red-700 text-red-400 hover:text-white
                               w-8 h-8 flex items-center justify-center rounded-full text-lg transition"
                  >
                    ×
                  </button>
                  {m.watched && (
                    <div className="absolute bottom-2 left-2 bg-red-600/90 text-xs px-3 py-1 rounded-full">
                      ✔ İzlendi
                    </div>
                  )}
                </div>

                {/* Bilgiler */}
                <div className="p-3 flex-1 flex flex-col gap-2">
                  <div className="flex items-baseline justify-between gap-2">
                    <h2 className="font-semibold text-sm md:text-base text-white">
                      {m.title}
                      {m.year && (
                        <span className="text-gray-500 text-xs ml-1">({m.year})</span>
                      )}
                    </h2>
                    <button
                      onClick={() => toggleWatched(m.id)}
                      className="text-[10px] px-2 py-1 rounded-full border border-red-500/50 text-red-300 hover:bg-red-600/20 transition"
                    >
                      {m.watched ? "İzlendi ✓" : "İzlenecek"}
                    </button>
                  </div>

                  {/* Not */}
                  <textarea
                    value={m.note}
                    onChange={(e) => updateNote(m.id, e.target.value)}
                    placeholder="Bu film hakkında notunuz..."
                    className="w-full text-[10px] bg-black/60 border border-gray-700 rounded-lg p-2
                               text-gray-300 focus:outline-none focus:ring-1 focus:ring-red-500/50 resize-none"
                    rows={2}
                  />

                  {/* Puanlar */}
                  <div className="mt-1 space-y-1.5 text-[10px]">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-pink-400 font-medium">Hilal</span>
                      {renderHearts(m.ratingHilal, (v) =>
                        updateRating(m.id, "ratingHilal", v)
                      )}
                      <span className="w-6 text-right text-gray-400">
                        {m.ratingHilal || 0}/10
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-blue-400 font-medium">Okan</span>
                      {renderHearts(m.ratingOkan, (v) =>
                        updateRating(m.id, "ratingOkan", v)
                      )}
                      <span className="w-6 text-right text-gray-400">
                        {m.ratingOkan || 0}/10
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-yellow-400 font-medium">Ortalama</span>
                      <div className="flex gap-1">
                        {Array.from({ length: HEARTS }, (_, i) => (
                          <span
                            key={i}
                            className={
                              i < Math.round(avg)
                                ? "text-yellow-400"
                                : "text-gray-700"
                            }
                          >
                            ♥
                          </span>
                        ))}
                      </div>
                      <span className="w-8 text-right text-yellow-400">
                        {avg}/10
                      </span>
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
