"use client";
import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import SettingsModal from "../../components/SettingsModal";
import ReactMarkdown from 'react-markdown';
import styles from "../page.module.css"; 
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";

export default function UserPage() {
  const [user, setUser] = useState<any>(null); 
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [quizLogs, setQuizLogs] = useState<string[]>([]); 
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Theme toggle
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
  }, [isDark]);

useEffect(() => {
  if (user) {
    console.log("Fetching quiz logs for user UID:", user.uid); 
    const db = getFirestore();
    const q = query(collection(db, "quizLogs"), where("userId", "==", user.uid));
    getDocs(q)
      .then((snapshot) => {
        console.log("Number of docs found:", snapshot.docs.length); 
        const logs = snapshot.docs.map((doc) => {
          const data = doc.data();
          console.log("Document data:", data); 
          return data.analysis || "No analysis available"; 
        });
        setQuizLogs(logs);
      })
      .catch((error) => {
        console.error("Error fetching quiz logs:", error); 
      });
  }
}, [user]);
  if (!user) {
    return <div className={styles.signInMessage}>Please sign in to view this page.</div>;
  }

  return (
    <div className={styles.userContainer}>
      <h1 className="quiz-title">User Profile</h1>

      {/* Profile Picture and Name */}
      <div className={styles.profileSection}>
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt="Profile Picture"
            className={styles.profilePicture}
            width="100"
            height="100"
          />
        ) : (
          <div className={styles.profilePicturePlaceholder}>No Image</div>
        )}
        <h2 className={styles.profileName}>{user.displayName || "Anonymous"}</h2>
      </div>


      <button
        className="settings-button"
        onClick={() => setIsSettingsOpen(true)}
      >
        Edit Profile
      </button>

      <div className={styles.quizLogsSection}>
  <h3 className="quiz-subtitle">Quiz History</h3>
  {quizLogs.length > 0 ? (
    <ol className="quiz-questions">
      {quizLogs.map((log, index) => (
        <li key={index} className="quiz-question">
          <ReactMarkdown>{log}</ReactMarkdown>  {/* This handles Markdown rendering */}
        </li>
      ))}
    </ol>
  ) : (
    <p className="quiz-error">No quiz history available.</p>
  )}
</div>
      {/* Settings Modal */}
      <SettingsModal
        user={user}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}