import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import app from "./firebase";

function WatchWithHilalApp() {
  const [film, setFilm] = useState("");
  const [films, setFilms] = useState([]);
  const db = getFirestore(app);

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

  // 🔄 Sayfa açılınca filmleri getir
  useEffect(() => {
    fetchFilms();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex flex-col items-center p-8">
      <h1 className="text-3xl font-bold text-red-500 mb-6">Watch With Hilal 🎬</h1>

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
