"use client";
import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import SettingsModal from "../../components/SettingsModal";
import styles from "../page.module.css"; 

export default function UserPage() {
  const [user, setUser] = useState<any>(null); 
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);

  // Listen for auth state changes
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

  if (!user) {
    return <div className={styles.signInMessage}>Please sign in to view this page.</div>;
  }

  return (
    <div className="quiz-container"> 
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

        {/* Settings Modal */}
        <SettingsModal
          user={user}
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
      </div>
    </div>
  );
}