import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import app from "./firebase";

function WatchWithHilalApp() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [film, setFilm] = useState("");
  const [films, setFilms] = useState([]);

  const db = getFirestore(app);

  // 🔐 Giriş kontrolü
  const handleLogin = (e) => {
    e.preventDefault();
    if (password === "kokaric") {
      setAuthenticated(true);
    } else {
      alert("Yanlış şifre!");
    }
  };

  // 🎬 Film ekleme
  const addFilm = async (e) => {
    e.preventDefault();
    if (!film.trim()) return;
    await addDoc(collection(db, "films"), { name: film });
    setFilm("");
    fetchFilms();
  };

  // 📋 Film listeleme
  const fetchFilms = async () => {
    const querySnapshot = await getDocs(collection(db, "films"));
    const filmList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setFilms(filmList);
  };

  // 🗑️ Film silme
  const deleteFilm = async (id) => {
    await deleteDoc(doc(db, "films", id));
    fetchFilms();
  };

  useEffect(() => {
    if (authenticated) {
      fetchFilms();
    }
  }, [authenticated]);

  if (!authenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-red-900 relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center bg-black/50 p-10 rounded-2xl shadow-xl border border-red-500/30 backdrop-blur-md"
        >
          <h1 className="text-4xl font-bold text-red-500 mb-4">🎬 Watch With Hilal</h1>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="Şifre..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="p-2 rounded bg-gray-900 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <button
              type="submit"
              className="ml-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded shadow-md transition"
            >
              Giriş
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex flex-col items-center p-8">
      <h1 className="text-3xl font-bold text-red-500 mb-6">Hoş geldin Hilal 🎬✨</h1>

      <form onSubmit={addFilm} className="flex mb-6">
        <input
          type="text"
          placeholder="Film adı..."
          value={film}
          onChange={(e) => setFilm(e.target.value)}
          className="p-2 rounded-l bg-gray-800 border border-gray-700 text-white w-64 focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-r text-white"
        >
          Ekle
        </button>
      </form>

      <div className="space-y-3 w-80">
        {films.length === 0 ? (
          <p className="text-gray-400 text-center">Henüz film eklenmedi 🎥</p>
        ) : (
          films.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-between items-center bg-gray-800 px-4 py-2 rounded shadow"
            >
              <span>{item.name}</span>
              <button
                onClick={() => deleteFilm(item.id)}
                className="text-red-500 hover:text-red-700"
              >
                ❌
              </button>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

export default WatchWithHilalApp;
