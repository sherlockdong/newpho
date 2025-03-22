// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Import Firestore

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
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

const auth = getAuth(app);
const db = getFirestore(app); // Initialize Firestore
const migrateLogs = async (uid) => {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  if (snap.exists() && snap.data().analysisLogs) {
    const logs = snap.data().analysisLogs;
    for (const log of logs) {
      await setDoc(doc(db, "users", uid, "analysisLogs", Date.now().toString()), log);
    }
    await updateDoc(userRef, { analysisLogs: deleteField() });
  }
};

export { app, analytics, auth, db };
