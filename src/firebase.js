// 🔥 Firebase modüllerini içe aktar
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// 🌐 Senin Firebase yapılandırman
const firebaseConfig = {
  apiKey: "AIzaSyBkkINQApdp6ONkXWeRISm6HztpKN693R4",
  authDomain: "watchwithhilal-aeb68.firebaseapp.com",
  projectId: "watchwithhilal-aeb68",
  storageBucket: "watchwithhilal-aeb68.firebasestorage.app",
  messagingSenderId: "15517339751",
  appId: "1:15517339751:web:909067b67e4b71568d84c2"
};

// 🚀 Firebase uygulamasını başlat
const app = initializeApp(firebaseConfig);

// 💾 Firestore veritabanını dışa aktar
export const db = getFirestore(app);
