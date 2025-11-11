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

  const filmsRef = collection(db, "films");

  useEffect(() => {
    async function fetchMovies() {
      const snapshot = await getDocs(filmsRef);
      const list = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          title: data.title || "",
          poster: data.poster || null,
          year: data.year || "",
          overview: data.overview || "",
          note: data.note ?? "",
          watched: data.watched ?? false,
          ratingHilal: data.ratingHilal ?? 0,
          ratingOkan: data.ratingOkan ?? 0,
          category: data.category || "Diğer",
          selectedBy: data.selectedBy || "Ortak",
          favorite: data.favorite ?? false,
          createdAt: data.createdAt || 0,
        };
      });
      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setMovies(list);
    }
    fetchMovies();
  }, []);

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
    const ref = await addDoc(filmsRef, newMovie);
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
            className={`$${
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
    <div className="min-h-screen text-white px-4 py-8 bg-center bg-cover bg-fixed"
      style={{
        backgroundImage:
          'linear-gradient(rgba(0,0,0,0.88), rgba(0,0,0,0.95)), url("https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=1920&q=90")',
      }}>
      {/* HEADER */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-red-500 drop-shadow-[0_0_25px_rgba(248,113,113,0.9)]">
          Bugün ne izlesek?
        </h1>
      </motion.div>

      {/* FORM */}
      <motion.form onSubmit={handleSearch} className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-3 mb-4 justify-center">
        <input type="text" placeholder="Film adı (örn: The Dark Knight)" value={title} onChange={(e) => setTitle(e.target.value)} className="flex-1 p-3 rounded-xl bg-gray-900/80 border border-red-500/40 text-sm md:text-base" />
        <button type="submit" disabled={isAdding} className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 font-semibold text-xs md:text-base">
          {isAdding ? "Aranıyor..." : "Film Ara"}
        </button>
      </motion.form>

      {/* POPUP */}
      <AnimatePresence>
        {searchResults.length > 0 && (
          <motion.div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4">
            <motion.div className="bg-gray-900 rounded-2xl p-6 max-w-4xl w-full shadow-2xl border border-red-500/40">
              <h2 className="text-xl md:text-2xl font-bold text-red-500 mb-4 text-center">Doğru filmi seç 🎞️</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {searchResults.map((m) => (
                  <motion.div key={m.id} whileHover={{ scale: 1.05 }} className="cursor-pointer text-center" onClick={() => handleSelectMovie(m)}>
                    <img src={m.poster_path ? `${TMDB_IMAGE}${m.poster_path}` : "https://via.placeholder.com/200x300?text=No+Image"} alt={m.title} className="rounded-lg shadow-lg border border-gray-700" />
                    <p className="text-xs mt-2 text-gray-300">{m.title} ({m.release_date?.slice(0, 4)})</p>
                  </motion.div>
                ))}
              </div>
              <button onClick={() => setSearchResults([])} className="mt-6 w-full py-2 bg-red-700 hover:bg-red-800 rounded-lg text-white font-semibold">İptal</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default WatchWithHilalApp;
