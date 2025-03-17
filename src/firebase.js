// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// Import other services as needed

const firebaseConfig = {
  apiKey: "AIzaSyCo8ShVpTbmTXWEtCmMfDH3pS69Db5NL0U",
  authDomain: "phoguide.firebaseapp.com",
  projectId: "phoguide",
  storageBucket: "phoguide.firebasestorage.app",
  messagingSenderId: "550817502522",
  appId: "1:550817502522:web:30a1bfcf8b96eb1cee6c03",
  measurementId: "G-TF3TR8PXK2"
};

const app = initializeApp(firebaseConfig);

// Conditionally initialize Analytics
let analytics;
if (typeof window !== "undefined") {
  // Check if analytics is supported in the current environment
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

const auth = getAuth(app);

export { app, analytics, auth };
