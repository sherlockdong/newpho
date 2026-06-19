"use client";

import { useState } from "react";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useRouter } from "next/navigation";
import { app } from "../../firebase"; 
import { motion } from "framer-motion";

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
      const auth = getAuth(app);
      await signInWithPopup(auth, provider);
      
      // Redirects to the central user dashboard we built earlier!
      router.push(`/user`); 
    } catch (err: any) {
      const errorMessage = mapFirebaseErrorToMessage(err.code || err.message);
      setError(errorMessage);
      console.error("Google sign-in error:", err.code, err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="page-wrapper min-h-screen flex items-center justify-center px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-[#0A0A18] border border-zinc-800 rounded-3xl shadow-2xl p-8 md:p-10 relative overflow-hidden"
      >
        {/* Subtle top glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-[#4f8ef7] to-transparent opacity-50"></div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white font-heading tracking-tight mb-3">
            System <span className="text-[#4f8ef7]">Authentication</span>
          </h1>
          <p className="text-zinc-400 text-sm">
            Verify your credentials to access the PHO-Guide telemetry dashboard and sync your diagnostic logs.
          </p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-red-900/10 border border-red-900/50 rounded-xl text-red-400 text-sm text-center"
          >
            {error}
          </motion.div>
        )}

        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 bg-white text-black font-semibold py-3.5 px-6 rounded-xl hover:bg-zinc-200 transition-colors duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              {/* Standard Google "G" SVG Logo */}
            <svg className="auth-google-icon" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span>Sign In with Google</span>
            </  >
          )}
        </button>

        <div className="mt-8 pt-6 border-t border-zinc-800 text-center">
          <p className="text-xs text-zinc-500">
            By authenticating, you agree to the logging of your diagnostic quiz data to provide personalized training parameters.
          </p>
        </div>
      </motion.div>
    </main>
  );
}