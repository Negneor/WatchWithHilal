import React, { useState, useEffect } from "react";
import { TMDB_KEY } from "./config";
import { db } from "./firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";

export default function WatchWithHilalApp() {
  const [authorized, setAuthorized] = useState(false);
  const [password, setPassword] = useState("");
  const [movies, setMovies] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  // Firestore koleksiyon referansı
  const moviesRef = collection(db, "movies");

  // 🔥 Firestore'dan gerçek zamanlı veri çek
  useEffect(() => {
    const unsubscribe = onSnapshot(moviesRef, (snapshot) => {
      const movieList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMovies(movieList);
    });
    return () => unsubscribe();
  }, []);

  // 🎬 Film ekleme
  const fetchMovie = async (title) => {
    if (!title) return;
    const res = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(
        title
      )}`
    );
    const data = await res.json();
    if (data.results.length > 0) {
      const movie = data.results[0];
      await addDoc(moviesRef, {
        title: movie.title,
        poster: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
        hilal: 0,
        okan: 0,
        watched: false,
        desc: "",
      });
    }
  };

  // 💖 Puanlama
  const handleRate = async (id, who, val) => {
    const movieDoc = doc(db, "movies", id);
    await updateDoc(movieDoc, { [who]: val });
  };

  // 📝 Açıklama
  const handleDescChange = async (id, value) => {
    const movieDoc = doc(db, "movies", id);
    await updateDoc(movieDoc, { desc: value });
  };

  // 🎞️ İzlenme durumu
  const handleToggleWatched = async (id, current) => {
    const movieDoc = doc(db, "movies", id);
    await updateDoc(movieDoc, { watched: !current });
  };

  const avg = (a, b) => ((a + b) / 2).toFixed(1);

  const filteredMovies = movies.filter((m) =>
    filter === "watched" ? m.watched : filter === "unwatched" ? !m.watched : true
  );

  const sortedMovies = [...filteredMovies].sort((a, b) => {
    if (filter === "rating") return (b.hilal + b.okan) / 2 - (a.hilal + a.okan) / 2;
    if (filter === "alpha") return a.title.localeCompare(b.title);
    return 0;
  });

  // 🔐 Giriş kontrolü
  const handleLogin = () => {
    if (password.toLowerCase() === "kokariç") {
      setAuthorized(true);
    } else {
      alert("Yanlış şifre! 🍽️");
    }
  };

  return (
    <AnimatePresence>
      {!authorized ? (
        // 🔒 Giriş ekranı
        <motion.div
          key="login"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="relative min-h-screen flex flex-col justify-center items-center text-center overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-red-900 animate-gradientMove"></div>
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center opacity-15"></div>

          <div className="relative z-10 text-white px-4">
            <h1 className="text-5xl font-extrabold mb-6 text-red-500 drop-shadow-[0_0_10px_#e50914]">
              🎬 Watch With Hilal
            </h1>
            <p className="mb-4 text-gray-300 text-lg">Giriş için şifreyi gir:</p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="Şifre..."
              className="p-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500 text-center mb-4 w-64 shadow-lg"
            />
            <button
              onClick={handleLogin}
              className="bg-red-600 hover:bg-red-700 transition px-6 py-2 rounded-lg font-semibold"
            >
              Giriş
            </button>
            <p className="text-sm text-gray-500 mt-4 italic">
              İpucu: kebap severlerin şifresi 😋
            </p>
          </div>
        </motion.div>
      ) : (
        // 🎥 Ana uygulama
        <motion.div
          key="main"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="min-h-screen bg-black text-white p-6 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-black to-red-950 opacity-40 animate-gradientMove"></div>
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center opacity-5"></div>

          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl text-hilalRed font-extrabold text-center mb-8 drop-shadow-[0_0_8px_#e50914]">
              🎬 Watch With Hilal
            </h1>

            {/* Arama */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6 justify-center items-center">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="p-3 bg-gray-900 rounded-xl border border-gray-700 w-full sm:w-1/2 focus:outline-none focus:ring-2 focus:ring-hilalRed transition"
                placeholder="🎥 Film adı yaz..."
              />
              <button
                onClick={() => {
                  fetchMovie(search);
                  setSearch("");
                }}
                className="bg-hilalRed px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-transform"
              >
                ➕ Ekle
              </button>
            </div>

            {/* Filtre */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {[
                ["all", "🎬 Tümü"],
                ["watched", "✅ İzlenenler"],
                ["unwatched", "🕓 İzlenmeyenler"],
                ["rating", "🎯 Puan Sırası"],
                ["alpha", "🔤 Alfabetik"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`px-3 py-2 rounded-lg border transition ${
                    filter === key ? "bg-hilalRed" : "bg-gray-800"
                  } hover:bg-hilalRed`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Film kartları */}
            {movies.length === 0 ? (
              <p className="text-center text-gray-400 italic">
                Henüz film eklenmedi... 🎞️
              </p>
            ) : (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {sortedMovies.map((m) => (
                  <motion.div
                    key={m.id}
                    whileHover={{ scale: 1.05 }}
                    className="relative bg-gray-950 rounded-2xl overflow-hidden shadow-lg border border-gray-800 hover:shadow-[0_0_20px_#e50914aa] transition-transform duration-300"
                  >
                    <img
                      src={m.poster}
                      alt={m.title}
                      className="w-full h-80 object-cover"
                    />
                    <div className="p-4">
                      <h2 className="font-bold text-lg mb-2 text-hilalRed">{m.title}</h2>
                      <div className="flex justify-between text-sm mb-3">
                        <span>Hilal ❤️ {m.hilal}</span>
                        <span>Okan ❤️ {m.okan}</span>
                        <span>🎯 {avg(m.hilal, m.okan)}</span>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-2">
                        {[...Array(10)].map((_, i) => (
                          <button
                            key={i}
                            onClick={() => handleRate(m.id, "hilal", i + 1)}
                            className="text-pink-500 hover:scale-110 transition-transform"
                          >
                            💖
                          </button>
                        ))}
                      </div>

                      <div className="flex flex-wrap gap-1 mb-3">
                        {[...Array(10)].map((_, i) => (
                          <button
                            key={i}
                            onClick={() => handleRate(m.id, "okan", i + 1)}
                            className="text-red-400 hover:scale-110 transition-transform"
                          >
                            💖
                          </button>
                        ))}
                      </div>

                      <textarea
                        value={m.desc}
                        onChange={(e) => handleDescChange(m.id, e.target.value)}
                        placeholder="Açıklama yaz..."
                        className="w-full bg-gray-900 p-2 rounded text-sm text-gray-300 mb-3 border border-gray-700 focus:ring-2 focus:ring-hilalRed"
                      />

                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={m.watched}
                          onChange={() => handleToggleWatched(m.id, m.watched)}
                          className="accent-hilalRed"
                        />
                        İzlendi ✅
                      </label>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
