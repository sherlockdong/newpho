// src/app/auth/page.tsx
"use client";
import { useState } from "react";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { app } from "../../firebase"; // Named import

const provider = new GoogleAuthProvider();

export default function AuthPage() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const mapFirebaseErrorToMessage = (code: string) => {
    switch (code) {
      case "auth/cancelled-popup-request":
        return "Sign-in cancelled. Please try again.";
      case "auth/popup-closed-by-user":
        return "Sign-in popup was closed. Please try again.";
      case "auth/account-exists-with-different-credential":
        return "An account already exists with a different provider.";
      default:
        return "An error occurred during sign-in. Please try again.";
    }
  };

  const handleGoogleSignIn = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setError("");
    try {
      const auth = getAuth(app); // Use named export
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const username = user.displayName?.toLowerCase().replace(/\s+/g, "") || user.uid;
      router.push(`/${username}`);
    } catch (err: any) {
      const errorMessage = mapFirebaseErrorToMessage(err.code || err.message);
      setError(errorMessage);
      console.error("Google sign-in error:", err.code, err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <h1 className="quiz-title">Sign In</h1>
      {error && <p className="quiz-error">{error}</p>}
      <button
        className="quiz-button"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
      >
        {isLoading ? "Signing In..." : "Sign In with Google"}
      </button>
    </div>
  );
}