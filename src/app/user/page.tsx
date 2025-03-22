"use client";

import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { app, db } from "../../firebase"; 

const auth = getAuth(app);

export default function UserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [analysisLogs, setAnalysisLogs] = useState<any[]>([]);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Once we have a user, set up a listener for that user’s logs
  useEffect(() => {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        // If your logs are stored as an array in `analysisLogs`
        setAnalysisLogs(data.analysisLogs || []);
      } else {
        setAnalysisLogs([]);
      }
    });

    return () => unsubscribe();
  }, [user]);

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
      <p>
        <strong>Name:</strong> {user.displayName || "N/A"}
      </p>
      <p>
        <strong>Email:</strong> {user.email}
      </p>
      <p>
        <strong>User ID:</strong> {user.uid}
      </p>
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

      {/* Display the analysis logs */}
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
              <p>
                <strong>Quiz Scores:</strong> {log.quizScores}
              </p>
              <p>
                <strong>Incorrect Topics:</strong> {log.incorrectTopics}
              </p>
              <p>
                <strong>Study Logs:</strong> {log.studyLogs}
              </p>
              <p>
                <strong>Analysis:</strong> {log.analysis}
              </p>
              <p>
                <strong>Date:</strong> {log.timestamp}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No logs yet.</p>
      )}
    </div>
  );
}
