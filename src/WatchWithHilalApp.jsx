import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TMDB_KEY } from "./config";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

const TMDB_IMAGE = "https://image.tmdb.org/t/p/w500";
const HEARTS = 10;

const CATEGORIES = [
  "Aksiyon",
  "Dram",
  "Romantik",
  "Bilim Kurgu",
  "Korku",
  "Komedi",
  "Animasyon",
  "Diğer",
];

const SELECTED_BY_OPTIONS = ["Hilal", "Okan", "Ortak"];

function WatchWithHilalApp() {
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [category, setCategory] = useState("");
  const [selectedBy, setSelectedBy] = useState("");
  const [favorite, setFavorite] = useState(false);
  const [movies, setMovies] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterSelectedBy, setFilterSelectedBy] = useState("all");
  const [filterFavoriteOnly, setFilterFavoriteOnly] = useState(false);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const snapshot = await getDocs(collection(db, "films"));
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        data.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setMovies(data);
        console.log("🎬 Firestore'dan çekilen film sayısı:", data.length);
      } catch (error) {
        console.error("🔥 Firestore veri çekme hatası:", error);
      }
    };
    fetchMovies();
  }, [db]);

  const buildMovieFromTmdb = (movieFromTmdb) => ({
    title: movieFromTmdb?.title || title.trim(),
    poster: movieFromTmdb?.poster_path
      ? `${TMDB_IMAGE}${movieFromTmdb.poster_path}`
      : null,
    year: movieFromTmdb?.release_date
      ? movieFromTmdb.release_date.slice(0, 4)
      : "",
    overview: movieFromTmdb?.overview || "",
    note: note.trim(),
    watched: false,
    ratingHilal: 0,
    ratingOkan: 0,
    category: category || "Diğer",
    selectedBy: selectedBy || "Ortak",
    favorite: favorite,
    createdAt: Date.now(),
  });

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIsAdding(true);
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(
          title.trim()
        )}&language=tr-TR`
      );
      const data = await res.json();
      if (data.results?.length === 0) {
        await addFromTmdb(null);
      } else if (data.results.length === 1) {
        await addFromTmdb(data.results[0]);
      } else {
        setSearchResults(data.results.slice(0, 8));
      }
    } catch (err) {
      console.error("TMDB arama hatası:", err);
    } finally {
      setIsAdding(false);
    }
  };

  const addFromTmdb = async (movieFromTmdb) => {
    const newMovie = buildMovieFromTmdb(movieFromTmdb);
    const ref = await addDoc(collection(db, "films"), newMovie);
    setMovies((prev) => [{ id: ref.id, ...newMovie }, ...prev]);
    resetForm();
  };

  const handleSelectMovie = async (movie) => {
    await addFromTmdb(movie);
    setSearchResults([]);
  };

  const resetForm = () => {
    setTitle("");
    setNote("");
    setCategory("");
    setSelectedBy("");
    setFavorite(false);
  };

  const updateMovie = async (id, updates) => {
    const ref = doc(db, "films", id);
    await updateDoc(ref, updates);
    setMovies((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
  };

  const deleteMovie = async (id) => {
    await deleteDoc(doc(db, "films", id));
    setMovies((prev) => prev.filter((m) => m.id !== id));
  };

  const toggleWatched = (m) => updateMovie(m.id, { watched: !m.watched });
  const toggleFavorite = (m) => updateMovie(m.id, { favorite: !m.favorite });
  const updateNote = (m, val) => updateMovie(m.id, { note: val });
  const updateRating = (m, who, val) => updateMovie(m.id, { [who]: val });

  const calcAvg = (m) => {
    const vals = [m.ratingHilal, m.ratingOkan].filter((x) => x > 0);
    return vals.length
      ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10
      : 0;
  };

  const renderHearts = (current, onSelect) => (
    <div className="flex gap-1 justify-center">
      {Array.from({ length: HEARTS }, (_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onSelect(i + 1)}
          className="text-2xl md:text-3xl focus:outline-none transition-transform hover:scale-125"
        >
          <span
            className={`${
              i + 1 <= current
                ? "text-red-500 drop-shadow-[0_0_10px_rgba(255,0,0,0.9)]"
                : "text-gray-700 hover:text-red-400"
            } transition`}
          >
            ♥
          </span>
        </button>
      ))}
    </div>
  );

  const filteredMovies = movies
    .filter((m) =>
      filterStatus === "all"
        ? true
        : filterStatus === "watched"
        ? m.watched
        : !m.watched
    )
    .filter((m) => (filterCategory === "all" ? true : m.category === filterCategory))
    .filter((m) =>
      filterSelectedBy === "all" ? true : m.selectedBy === filterSelectedBy
    )
    .filter((m) => (filterFavoriteOnly ? m.favorite : true));

  return (
    <div
      className="min-h-screen text-white px-4 py-8 bg-center bg-cover bg-fixed"
      style={{
        backgroundImage:
          'linear-gradient(rgba(0,0,0,0.88), rgba(0,0,0,0.95)), url("https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=1920&q=90")',
      }}
    >
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-red-500 drop-shadow-[0_0_25px_rgba(248,113,113,0.9)]">
          Bugün ne izlesek?
        </h1>
      </motion.div>

      {/* Arama Formu */}
      <motion.form
        onSubmit={handleSearch}
        className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-3 mb-4 justify-center"
      >
        <input
          type="text"
          placeholder="Film adı (örn: The Dark Knight)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 p-3 rounded-xl bg-gray-900/80 border border-red-500/40 text-sm md:text-base"
        />
        <button
          type="submit"
          disabled={isAdding}
          className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 font-semibold text-xs md:text-base"
        >
          {isAdding ? "Aranıyor..." : "Film Ara"}
        </button>
      </motion.form>

      {/* 🔽 FİLTRE BLOĞU */}
      <div className="max-w-6xl mx-auto flex flex-wrap gap-3 justify-center mt-4 mb-8 text-sm">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="p-2 rounded-lg bg-gray-900/80 border border-red-500/40"
        >
          <option value="all">Tümü</option>
          <option value="watched">İzlendi</option>
          <option value="notWatched">İzlenecek</option>
        </select>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="p-2 rounded-lg bg-gray-900/80 border border-red-500/40"
        >
          <option value="all">Tüm Kategoriler</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <select
          value={filterSelectedBy}
          onChange={(e) => setFilterSelectedBy(e.target.value)}
          className="p-2 rounded-lg bg-gray-900/80 border border-red-500/40"
        >
          <option value="all">Herkes</option>
          {SELECTED_BY_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filterFavoriteOnly}
            onChange={(e) => setFilterFavoriteOnly(e.target.checked)}
            className="w-4 h-4 accent-red-600"
          />
          <span>Favoriler</span>
        </label>
      </div>

      {/* Popup ve Filmler */}
      <AnimatePresence>
        {searchResults.length > 0 && (
          <motion.div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4">
            <motion.div className="bg-gray-900 rounded-2xl p-6 max-w-4xl w-full shadow-2xl border border-red-500/40">
              <h2 className="text-xl md:text-2xl font-bold text-red-500 mb-4 text-center">
                Doğru filmi seç 🎞️
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {searchResults.map((m) => (
                  <motion.div
                    key={m.id}
                    whileHover={{ scale: 1.05 }}
                    className="cursor-pointer text-center"
                    onClick={() => handleSelectMovie(m)}
                  >
                    <img
                      src={
                        m.poster_path
                          ? `${TMDB_IMAGE}${m.poster_path}`
                          : "https://via.placeholder.com/200x300?text=No+Image"
                      }
                      alt={m.title}
                      className="rounded-lg shadow-lg border border-gray-700"
                    />
                    <p className="text-xs mt-2 text-gray-300">
                      {m.title} ({m.release_date?.slice(0, 4)})
                    </p>
                  </motion.div>
                ))}
              </div>
              <button
                onClick={() => setSearchResults([])}
                className="mt-6 w-full py-2 bg-red-700 hover:bg-red-800 rounded-lg text-white font-semibold"
              >
                İptal
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Film Kartları */}
      <div className="max-w-6xl mx-auto grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-8">
        {filteredMovies.length === 0 ? (
          <p className="text-gray-400 text-center col-span-full">
            Henüz film bulunamadı 🎞️
          </p>
        ) : (
          filteredMovies.map((m) => {
            const avg = calcAvg(m);
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-gray-900 to-black border border-red-500/25 shadow-[0_0_18px_rgba(255,0,0,0.35)]"
              >
                <div className="absolute top-2 left-2 flex flex-col text-xs">
                  <span className="px-2 py-1 rounded-full bg-black/70 text-red-300 border border-red-500/50">
                    {m.selectedBy || "Ortak"}
                  </span>
                  <span className="px-2 py-1 mt-1 rounded-full bg-black/70 text-gray-200 border border-gray-600/50">
                    {m.category || "Diğer"}
                  </span>
                  {m.favorite && (
                    <span className="px-2 py-1 mt-1 rounded-full bg-red-600 text-white border border-red-400 shadow-[0_0_10px_rgba(255,0,0,0.9)]">
                      ⭐ Favori
                    </span>
                  )}
                </div>

                {m.poster ? (
                  <img
                    src={m.poster}
                    alt={m.title}
                    className="w-full h-72 object-cover"
                  />
                ) : (
                  <div className="w-full h-72 flex items-center justify-center bg-gray-800 text-gray-500 text-xs">
                    Poster yok
                  </div>
                )}

                <div className="p-4 space-y-3">
                  <h2 className="font-semibold text-base md:text-lg text-white capitalize">
                    {m.title}{" "}
                    <span className="text-gray-500 text-sm">({m.year})</span>
                  </h2>

                  <textarea
                    value={m.note || ""}
                    onChange={(e) => updateNote(m, e.target.value)}
                    placeholder="Not ekle..."
                    className="w-full text-sm bg-black/60 border border-gray-700 rounded-lg p-2 text-gray-300 focus:outline-none focus:ring-1 focus:ring-red-500/50 resize-none"
                    rows={2}
                  />

                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-pink-400 font-semibold block text-center mb-1">
                        Hilal
                      </span>
                      {renderHearts(m.ratingHilal || 0, (v) =>
                        updateRating(m, "ratingHilal", v)
                      )}
                    </div>
                    <div>
                      <span className="text-blue-400 font-semibold block text-center mb-1">
                        Okan
                      </span>
                      {renderHearts(m.ratingOkan || 0, (v) =>
                        updateRating(m, "ratingOkan", v)
                      )}
                    </div>
                    <div className="text-center mt-1 text-yellow-400 font-bold">
                      Ortalama: {avg}/10
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs mt-2">
                    <button
                      onClick={() => toggleWatched(m)}
                      className="px-3 py-1 rounded-full border border-red-500/50 text-red-300 hover:bg-red-600/20 transition"
                    >
                      {m.watched ? "İzlendi ✓" : "İzlenecek"}
                    </button>
                    <button
                      onClick={() => deleteMovie(m.id)}
                      className="px-3 py-1 rounded-full border border-gray-500 text-gray-400 hover:bg-red-800/40 hover:text-white transition"
                    >
                      Sil
                    </button>
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
