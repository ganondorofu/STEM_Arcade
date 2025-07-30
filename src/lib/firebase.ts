// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBcON6uc4ameo5nfB3Vpf8M3GIfRYHEM3Y",
  authDomain: "stem-arcade.firebaseapp.com",
  projectId: "stem-arcade",
  storageBucket: "stem-arcade.appspot.com",
  messagingSenderId: "910756831698",
  appId: "1:910756831698:web:d2d2cee441e0f18f07a80b",
  measurementId: "G-6EENJ1T6WB"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };
