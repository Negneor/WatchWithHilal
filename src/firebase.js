// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";  // 🔹 Firestore veritabanı için
import { getAuth } from "firebase/auth";            // 🔹 İleride giriş sistemi için

const firebaseConfig = {
  apiKey: "AIzaSyBkkINQApdp6ONkXWeRISm6HztpKN693R4",
  authDomain: "watchwithhilal-aeb68.firebaseapp.com",
  projectId: "watchwithhilal-aeb68",
  storageBucket: "watchwithhilal-aeb68.appspot.com",
  messagingSenderId: "15517339751",
  appId: "1:15517339751:web:909067b67e4b71568d84c2",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); // Firestore bağlantısı
export const auth = getAuth(app);    // Authentication modülü
export default app;
