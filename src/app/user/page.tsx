// src/app/user/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { app } from "../../firebase"; // Adjust path as needed
import SettingsModal from "./settings/page";

const auth = getAuth(app);

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [logoutMessage, setLogoutMessage] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchLogs = async () => {
      setLogsLoading(true);
      setErrorMessage("");
      try {
        const token = await user.getIdToken();
        console.log("Fetching logs with token:", token.slice(0, 10) + "..."); // Debug
        const response = await fetch(`/api/logs?userId=${user.uid}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        console.log("Fetch /api/logs status:", response.status); // Debug
        if (!response.ok) {
          const text = await response.text(); // Get raw response
          console.log("Fetch /api/logs response:", text.slice(0, 100) + "..."); // Debug
          throw new Error(`HTTP ${response.status}: ${text.slice(0, 100)}...`);
        }
        const data = await response.json();
        setLogs(data || []);
      } catch (err) {
        console.error("Fetch logs error:", err); // Log full error
        setErrorMessage(`Failed to load quiz logs: ${err.message}`);
      } finally {
        setLogsLoading(false);
      }
    };

    fetchLogs();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setLogoutMessage("Successfully logged out!");
      setTimeout(() => {
        window.location.href = "/auth";
      }, 1000);
    } catch (error) {
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

      <button
        onClick={() => setIsSettingsOpen(true)}
        style={{
          marginTop: "1rem",
          padding: "0.5rem 1rem",
          backgroundColor: "#0070f3",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Settings
      </button>
      <SettingsModal
        user={user}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

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

      <h2 style={{ marginTop: "2rem" }}>Quiz Logs</h2>
      {errorMessage && <p style={{ color: "red", marginBottom: "1rem" }}>{errorMessage}</p>}
      {logsLoading ? (
        <p>Loading logs...</p>
      ) : logs.length > 0 ? (
        <ul>
          {logs.map((log, index) => (
            <li
              key={index}
              style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "1rem",
                margin: "1rem 0",
              }}
            >
              <p><strong>Quiz Scores:</strong> {log.quizScores || "N/A"}</p>
              <p><strong>Incorrect Topics:</strong> {log.incorrectTopics || "N/A"}</p>
              <p><strong>Study Logs:</strong> {log.studyLogs || "N/A"}</p>
              <p><strong>Analysis:</strong> {log.analysis || "N/A"}</p>
              <p><strong>Date:</strong> {new Date(log.timestamp).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No logs yet.</p>
      )}
    </div>
  );
}