"use client";

import React, { useState, FormEvent } from "react";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { app } from "../../firebase";

const auth = getAuth(app);

const AuthComponent: React.FC = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string>("");

  const mapFirebaseErrorToMessage = (code: string): string => {
    switch (code) {
      case "auth/network-request-failed":
        return "Network error. Please check your internet connection and try again.";
      case "auth/user-not-found":
        return "No user found with this email address.";
      case "auth/wrong-password":
        return "Incorrect password. Please try again.";
      case "auth/invalid-email":
        return "The email address is not valid. Please check and try again.";
      case "auth/email-already-in-use":
        return "This email is already registered.";
      case "auth/weak-password":
        return "Password is too weak. Use at least 6 characters.";
      case "auth/invalid-credential":
        return "Invalid email or password. Please check your credentials and try again.";
      default:
        return "An unknown error occurred: " + code;
    }
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    console.log("Attempting register with:", { email, password });
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log("Registration successful:", userCredential.user.email);
      setUser(userCredential.user);
    } catch (err: any) {
      const errorMessage = mapFirebaseErrorToMessage(err.code || err.message);
      setError(errorMessage);
      console.error("Register error:", err.code, err.message);
    }
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    console.log("Attempting login with:", { email, password });
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("Login successful:", userCredential.user.email);
      setUser(userCredential.user);
    } catch (err: any) {
      const errorMessage = mapFirebaseErrorToMessage(err.code || err.message);
      setError(errorMessage);
      console.error("Login error:", err.code, err.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setEmail("");
      setPassword("");
    } catch (err: any) {
      const errorMessage = mapFirebaseErrorToMessage(err.code || err.message);
      setError(errorMessage);
      console.error("Logout error:", err.code, err.message);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      console.log("Google sign-in successful:", result.user.email);
      setUser(result.user);
    } catch (err: any) {
      const errorMessage = mapFirebaseErrorToMessage(err.code || err.message);
      setError(errorMessage);
      console.error("Google sign-in error:", err.code, err.message);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "2rem auto", padding: "1rem", border: "1px solid #ccc", borderRadius: "8px", marginTop: "100px" }}>
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
          <p style={{ textAlign: "center", margin: "1rem 0" }}>OR</p>
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
};

export default AuthComponent;