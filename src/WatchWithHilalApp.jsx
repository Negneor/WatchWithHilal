import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import app from "./firebase";

function WatchWithHilalApp() {
  const [film, setFilm] = useState("");
  const [poster, setPoster] = useState("");
  const [films, setFilms] = useState([]);
  const db = getFirestore(app);

  // 🎬 Film ekleme
  const addFilm = async (e) => {
    e.preventDefault();
    if (!film.trim() || !poster.trim()) return;
    await addDoc(collection(db, "films"), { name: film, poster: poster });
    setFilm("");
    setPoster("");
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

  // 🔄 Sayfa açıldığında filmleri getir
  useEffect(() => {
    fetchFilms();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex flex-col items-center p-8">
      <h1 className="text-4xl font-bold text-red-500 mb-8">Watch With Hilal 🎥</h1>

      <form onSubmit={addFilm} className="flex flex-col md:flex-row gap-3 mb-8">
        <input
          type="text"
          placeholder="Film adı..."
          value={film}
          onChange={(e) => setFilm(e.target.value)}
          className="p-2 rounded bg-gray-800 border border-gray-700 text-white w-64 focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        <input
          type="text"
          placeholder="Poster URL..."
          value={poster}
          onChange={(e) => setPoster(e.target.value)}
          className="p-2 rounded bg-gray-800 border border-gray-700 text-white w-64 focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white font-semibold"
        >
          Ekle
        </button>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {films.length === 0 ? (
          <p className="text-gray-400 text-center col-span-full">Henüz film eklenmedi 🎬</p>
        ) : (
          films.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800 p-3 rounded-lg shadow-lg relative"
            >
              <img
                src={item.poster}
                alt={item.name}
                className="rounded-lg w-full h-64 object-cover mb-2"
              />
              <h2 className="text-lg font-semibold text-center">{item.name}</h2>
              <button
                onClick={() => deleteFilm(item.id)}
                className="absolute top-2 right-2 text-red-400 hover:text-red-600 text-xl"
              >
                ✖
              </button>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

export default WatchWithHilalApp;
