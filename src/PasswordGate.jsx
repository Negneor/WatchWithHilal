import React, { useState, useEffect } from "react";

const PASSWORD = "kokariç";

export default function PasswordGate({ children }) {
  const [unlocked, setUnlocked] = useState(false);
  const [input, setInput] = useState("");

  useEffect(() => {
    const ok = localStorage.getItem("watchwithhilal_unlocked");
    if (ok === "1") setUnlocked(true);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input === PASSWORD) {
      setUnlocked(true);
      localStorage.setItem("watchwithhilal_unlocked", "1");
    } else {
      alert("Yanlış şifre! 😅");
    }
  };

  if (!unlocked) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bgDark text-white">
        <h1 className="text-3xl text-hilalRed font-bold mb-6">
          🎬 WatchWithHilal
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Şifre"
            className="px-4 py-2 rounded bg-gray-800 border border-gray-700 text-center"
          />
          <button className="bg-hilalRed px-4 py-2 rounded font-semibold">
            Giriş
          </button>
        </form>
      </div>
    );
  }

  return children;
}
