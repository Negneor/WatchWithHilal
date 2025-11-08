import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import app from "./firebase";
import { getFirestore } from "firebase/firestore";

const CORRECT_PASSWORD = "kokaric";

function normalize(str) {
  if (!str) return "";
  return str.trim().toLowerCase();
}

function WatchWithHilalApp() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);

  // Firebase bağlantı testi
  useEffect(() => {
    try {
      const db = getFirestore(app);
      console.log("✅ Firebase bağlantısı başarılı:", db);
    } catch (error) {
      console.error("❌ Firebase bağlantı hatası:", error);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();

    const input = normalize(password);
    const correct = normalize(CORRECT_PASSWORD);

    console.log("DEBUG - Girilen:", input);
    console.log("DEBUG - Doğru:", correct);
    console.log("DEBUG - Eşleşme:", input === correct);

    if (input === correct) {
      setAuthenticated(true);
    } else {
      alert("Yanlış şifre! (ipucu: kokaric)");
    }
  };

  if (!authenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-red-900 relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center bg-black/50 p-10 rounded-2xl shadow-xl border border-red-500/30 backdrop-blur-md"
        >
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-4xl font-bold text-red-500 mb-4 drop-shadow-[0_0_10px_rgba(255,0,0,0.7)]"
          >
            🎬 Watch With Hilal
          </motion.h1>

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

          <p className="text-xs text-gray-400 mt-2 italic">
            İpucu: kokaric
          </p>
        </motion.div>
      </div>
    );
  }

  // Giriş başarılıysa burası
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <h1 className="text-3xl font-bold text-red-500 drop-shadow-lg">
        Hoş geldin Hilal 🎬✨
      </h1>
    </div>
  );
}

export default WatchWithHilalApp;
