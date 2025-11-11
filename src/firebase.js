import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDJG_Gt-BejqSv0EIxyfZTxpFfK7KebLME",
  authDomain: "watchwithhilal-84b91.firebaseapp.com",
  projectId: "watchwithhilal-84b91",
  storageBucket: "watchwithhilal-84b91.appspot.com",
  messagingSenderId: "768138933787",
  appId: "1:768138933787:web:4c7e9fe19b8688c7e3eabe",
  measurementId: "G-N3GJ6YE9Y1",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

