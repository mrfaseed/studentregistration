import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAxhl9PG_EJRr3tJsu4Wn9lII67YL0pmJA",
  authDomain: "studentregister-aa6ed.firebaseapp.com",
  projectId: "studentregister-aa6ed",
  storageBucket: "studentregister-aa6ed.firebasestorage.app",
  messagingSenderId: "1043538484345",
  appId: "1:1043538484345:web:612b34d0ddbd91f4b1c8a8",
  measurementId: "G-9HGW583SGS",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

export { db };
