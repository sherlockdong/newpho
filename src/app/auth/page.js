"use client";

import React, { useState } from "react";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { app } from "../../firebase"; // Adjust the path based on your project structure

// Initialize the Firebase Auth service from the app.
const auth = getAuth(app);

export default function AuthComponent() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  // Handle user registration
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
    } catch (err) {
      console.error("Registration Error:", err);
      setError(err.message);
    }
  };

  // Handle user login with email and password
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
    } catch (err) {
      console.error("Login Error:", err);
      setError(err.message);
    }
  };

  // Handle user logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (err) {
      console.error("Logout Error:", err);
      setError(err.message);
    }
  };

  // Handle sign in with Google
  const handleGoogleSignIn = async () => {
    setError("");
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (err) {
      console.error("Google Sign-In Error:", err);
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "2rem auto", padding: "1rem", border: "1px solid #ccc", borderRadius: "8px" , marginTop:"100px"}}>
      <h1>{isRegistering ? "Register" : "Login"}</h1>

      {user ? (
        <div>
          <p>Welcome, {user.email}</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <>
          <form onSubmit={isRegistering ? handleRegister : handleLogin}>
            <div style={{ marginBottom: "1rem" }}>
              <label htmlFor="email">Email:</label><br />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ width: "100%", padding: "8px" }}
              />
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label htmlFor="password">Password:</label><br />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: "100%", padding: "8px" }}
              />
            </div>
            <button type="submit" style={{ width: "100%", padding: "10px" }}>
              {isRegistering ? "Register" : "Login"}
            </button>
          </form>

          {/* Add a divider or text separator */}
          <p style={{ textAlign: "center", margin: "1rem 0" }}>OR</p>

          {/* Google Sign-In Button */}
          <button 
            onClick={handleGoogleSignIn} 
            style={{ width: "100%", padding: "10px", backgroundColor: "#4285F4", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
          >
            Sign In with Google
          </button>
        </>
      )}

      {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}

      <p style={{ marginTop: "1rem", textAlign: "center" }}>
        {isRegistering ? "Already have an account?" : "Don't have an account?"}{" "}
        <button 
          onClick={() => setIsRegistering(!isRegistering)} 
          style={{ textDecoration: "underline", border: "none", background: "none", cursor: "pointer" }}
        >
          {isRegistering ? "Login" : "Register"}
        </button>
      </p>
    </div>
  );
}
