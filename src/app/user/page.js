"use client";

import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "../../firebase"; // Adjust the path as necessary

const auth = getAuth(app);

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

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
    <div style={{ maxWidth: "600px", margin: "2rem auto", padding: "1rem", border: "1px solid #ccc", borderRadius: "8px", marginTop:"100px" }}>
      <h1>User Profile</h1>
      <p><strong>Name:</strong> {user.displayName || "N/A"}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>User ID:</strong> {user.uid}</p>
      <div>
        <strong>Profile Picture:</strong>
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt="Profile Picture"
            style={{ display: "block", marginTop: "1rem", borderRadius: "50%", width: "150px", height: "150px" }}
          />
        ) : (
          <p>No profile picture available.</p>
        )}
      </div>
    </div>
  );
}
