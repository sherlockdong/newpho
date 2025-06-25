// src/app/user/page.tsx
"use client";
import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import SettingsModal from "../../components/SettingsModal";
import styles from "../page.module.css"; // If you have user-specific styles

export default function UserPage() {
  const [user, setUser] = useState<any>(null); // Replace 'any' with Firebase User type
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [quizLogs, setQuizLogs] = useState<string[]>([]); // Placeholder for quiz logs

  // Firebase auth state
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
    setQuizLogs(["Quiz 1: Mechanics (Score: 85%)", "Quiz 2: Electromagnetism (Score: 90%)"]);
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

      {/* Quiz Logs */}
      <div className={styles.quizLogsSection}>
        <h3 className="quiz-subtitle">Quiz History</h3>
        {quizLogs.length > 0 ? (
          <ol className="quiz-questions">
            {quizLogs.map((log, index) => (
              <li key={index} className="quiz-question">{log}</li>
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