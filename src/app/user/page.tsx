"use client";
import React, { useState, useEffect } from "react";
import {
  getAuth,
  onAuthStateChanged,
  User,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  linkWithCredential,
} from "firebase/auth";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { app, db } from "../../firebase";

const auth = getAuth(app);

export default function UserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [analysisLogs, setAnalysisLogs] = useState<any[]>([]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [logoutMessage, setLogoutMessage] = useState("");
  const [isGoogleUser, setIsGoogleUser] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Check if the user signed in with Google
        const googleProvider = currentUser.providerData.some(
          (provider) => provider.providerId === "google.com"
        );
        setIsGoogleUser(googleProvider && !currentUser.providerData.some(p => p.providerId === "password"));
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(
      userRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setAnalysisLogs(data.analysisLogs || []);
        } else {
          setDoc(userRef, { analysisLogs: [] }, { merge: true })
            .then(() => setAnalysisLogs([]))
            .catch((error) => console.error("Error creating user doc:", error));
        }
      },
      (error) => {
        console.error("Snapshot listener error:", error);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters long.");
      return;
    }

    if (!user) {
      setPasswordError("User not authenticated.");
      return;
    }

    try {
      if (isGoogleUser) {
        // For Google users without a password, link an email/password credential
        const credential = EmailAuthProvider.credential(user.email, newPassword);
        await linkWithCredential(user, credential);
        setPasswordSuccess("Password successfully added to your account!");
      } else {
        // For email/password users, re-authenticate and update
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPassword);
        setPasswordSuccess("Password updated successfully!");
      }
      setNewPassword("");
      setConfirmPassword("");
      setCurrentPassword("");
    } catch (error) {
      console.error("Password update error:", error);
      if (error.code === "auth/wrong-password") {
        setPasswordError("Current password is incorrect.");
      } else if (error.code === "auth/requires-recent-login") {
        setPasswordError("Please re-authenticate. Log out and log in again.");
      } else if (error.code === "auth/credential-already-in-use") {
        setPasswordError("This email is already linked to another account.");
      } else {
        setPasswordError("Failed to update password: " + error.message);
      }
    }
  };

  const handleGoogleReauth = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider); // Re-authenticates the user
      setPasswordError("");
      setPasswordSuccess("Re-authenticated with Google. Now set your password.");
    } catch (error) {
      console.error("Google re-auth error:", error);
      setPasswordError("Failed to re-authenticate with Google: " + error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setLogoutMessage("Successfully logged out!");
      setTimeout(() => {
        window.location.href = "/auth";
      }, 1000);
    } catch (error) {
      console.error("Log out error:", error);
      setLogoutMessage("Failed to log out: " + error.message);
    }
  };

  if (loading) {
    return <div style={{ textAlign: "center", marginTop: "2rem" }}>Loading...</div>;
  }

  if (!user) {
    return (
      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <p>You must be logged in to view your profile.</p>
        <a href="/auth">Go to Login / Register</a>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "2rem auto",
        padding: "1rem",
        border: "1px solid #ccc",
        borderRadius: "8px",
        marginTop: "100px",
      }}
    >
      <h1>User Profile</h1>
      <p><strong>Name:</strong> {user.displayName || "N/A"}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>User ID:</strong> {user.uid}</p>
      <div>
        <strong>Profile Picture:</strong>
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt="Profile"
            style={{
              display: "block",
              marginTop: "1rem",
              borderRadius: "50%",
              width: "150px",
              height: "150px",
            }}
          />
        ) : (
          <p>No profile picture available.</p>
        )}
      </div>

      <h2 style={{ marginTop: "2rem" }}>
        {isGoogleUser ? "Add a Password" : "Change Password"}
      </h2>
      <form onSubmit={handlePasswordChange} style={{ marginTop: "1rem" }}>
        {!isGoogleUser && (
          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="current-password" style={{ display: "block" }}>
              Current Password:
            </label>
            <input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
              required
            />
          </div>
        )}
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="new-password" style={{ display: "block" }}>
            New Password:
          </label>
          <input
            id="new-password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
            required
          />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="confirm-password" style={{ display: "block" }}>
            Confirm Password:
          </label>
          <input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
            required
          />
        </div>
        {passwordError && (
          <p style={{ color: "red", marginBottom: "1rem" }}>{passwordError}</p>
        )}
        {passwordSuccess && (
          <p style={{ color: "green", marginBottom: "1rem" }}>{passwordSuccess}</p>
        )}
        <button
          type="submit"
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#0070f3",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          {isGoogleUser ? "Add Password" : "Update Password"}
        </button>
      </form>

      {isGoogleUser && (
        <div style={{ marginTop: "1rem" }}>
          <p>Google Sign-In user? Re-authenticate if needed:</p>
          <button
            onClick={handleGoogleReauth}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#4285f4",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Re-authenticate with Google
          </button>
        </div>
      )}

      <h2 style={{ marginTop: "2rem" }}>Log Out</h2>
      <button
        onClick={handleLogout}
        style={{
          padding: "0.5rem 1rem",
          backgroundColor: "#f44336",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Log Out
      </button>
      {logoutMessage && (
        <p style={{ color: logoutMessage.includes("Failed") ? "red" : "green", marginTop: "1rem" }}>
          {logoutMessage}
        </p>
      )}

      <h2 style={{ marginTop: "2rem" }}>Analysis Logs</h2>
      {analysisLogs.length > 0 ? (
        <ul>
          {analysisLogs.map((log, index) => (
            <li
              key={index}
              style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "1rem",
                margin: "1rem 0",
              }}
            >
              <p><strong>Quiz Scores:</strong> {log.quizScores}</p>
              <p><strong>Incorrect Topics:</strong> {log.incorrectTopics}</p>
              <p><strong>Study Logs:</strong> {log.studyLogs}</p>
              <p><strong>Analysis:</strong> {log.analysis}</p>
              <p><strong>Date:</strong> {log.timestamp}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No logs yet.</p>
      )}
    </div>
  );
}