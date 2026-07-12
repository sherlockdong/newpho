"use client";

import { useState } from "react";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  getAdditionalUserInfo,
  type User,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";

import { getFirestore, doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { app } from "../../firebase";
import { motion, AnimatePresence } from "framer-motion";

const provider = new GoogleAuthProvider();
const auth = getAuth(app);
export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [wantsUpdates, setWantsUpdates] = useState(true);

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const mapFirebaseErrorToMessage = (code: string) => {
    switch (code) {
      case "auth/email-already-in-use":
        return "An account with this email already exists.";
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/weak-password":
        return "Password should be at least 6 characters.";
      case "auth/invalid-credential":
      case "auth/user-not-found":
      case "auth/wrong-password":
        return "Invalid email or password. Please try again.";
      case "auth/popup-closed-by-user":
        return "Google sign-in was cancelled.";
      default:
        return "An authentication error occurred. Please try again.";
    }
  };
  const handleFirebaseError = (error: unknown) => {
    if (error instanceof FirebaseError) {
      return mapFirebaseErrorToMessage(error.code);
    }

    return "An unexpected error occurred. Please try again.";
  };

  const saveUserToFirestore = async (
    user: User,
    isNewRegistration: boolean,
  ) => {
    const db = getFirestore(app);
    const userRef = doc(db, "users", user.uid);

    await setDoc(userRef, {
      email: user.email,
      displayName: user.displayName || "Operator",
      wantsUpdateNotifications: wantsUpdates,
      lastLogin: new Date().toISOString(),
    }, { merge: true });

    // IF it's a new sign-up, instantly hit our welcome email API endpoint
    if (isNewRegistration) {
      try {
        await fetch('/api/onboard-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            displayName: user.displayName || "Operator",
            wantsUpdates: wantsUpdates // Sends true/false state to the email builder
          })
        });
      } catch (emailErr) {
        console.error("Failed to trigger automated onboarding email:", emailErr);
      }
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setError("");

    try {

      let userCredential;

      if (isSignUp) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }

      // 2. Fixed! Passed `isSignUp` as the second argument
      await saveUserToFirestore(userCredential.user, isSignUp);
      router.push(`/user`);
    } catch (err: any) {
      setError(mapFirebaseErrorToMessage(err.code));
      console.error("Email auth error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setError("");

    try {
      const result = await signInWithPopup(auth, provider);

      // 3. Fixed! Check if this Google user just created their account right now
      const additionalInfo = getAdditionalUserInfo(result);
      const isNewUser = additionalInfo?.isNewUser ?? false;

      await saveUserToFirestore(result.user, isNewUser);
      router.push(`/user`);
    } catch (error: unknown) {
      setError(handleFirebaseError(error));
      console.error("Google auth error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="page-wrapper flex flex-col items-center justify-center px-6 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[420px] mx-auto bg-[var(--bg-secondary)] border border-[#27272a] rounded-2xl shadow-2xl p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-[var(--accent-blue)] to-transparent opacity-40"></div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-heading tracking-tight mb-2 text-[var(--text-main)]">
            System <span className="text-[var(--accent-blue)]">Auth</span>
          </h1>
          <p className="text-[var(--text-muted)] text-sm leading-relaxed">
            {isSignUp
              ? "Register a new operator profile to sync diagnostic telemetry."
              : "Verify your credentials to access the PHO-Guide dashboard."}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-3 bg-red-900/20 border border-red-900/50 rounded-lg text-red-400 text-sm text-center font-sans overflow-hidden"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleEmailAuth} className="flex flex-col gap-4 mb-5">
          <div>
            <label className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-1.5 block font-sans">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@vector.net"
              required
              className="w-full bg-[#0f0f20] border border-[#27272a] rounded-lg px-4 py-2.5 text-sm text-[var(--text-main)] focus:border-[var(--accent-blue)] focus:shadow-[0_0_10px_rgba(79,142,247,0.1)] transition-all outline-none placeholder:text-[#52525b] font-sans"
            />
          </div>

          <div>
            <label className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-1.5 block font-sans">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-[#0f0f20] border border-[#27272a] rounded-lg px-4 py-2.5 text-sm text-[var(--text-main)] focus:border-[var(--accent-blue)] focus:shadow-[0_0_10px_rgba(79,142,247,0.1)] transition-all outline-none placeholder:text-[#52525b] font-sans"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 bg-[var(--accent-blue)] text-white font-sans font-semibold py-3 px-6 rounded-lg hover:bg-blue-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(79,142,247,0.2)] hover:shadow-[0_0_25px_rgba(79,142,247,0.4)] flex justify-center items-center"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              isSignUp ? "Initialize Profile" : "Authenticate"
            )}
          </button>
        </form>

        <div className="relative flex items-center py-2 mb-5">
          <div className="flex-grow border-t border-[#27272a]"></div>
          <span className="flex-shrink-0 mx-4 text-[10px] uppercase tracking-widest text-[#52525b] font-sans">
            Or bypass with
          </span>
          <div className="flex-grow border-t border-[#27272a]"></div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          type="button"
          className="w-full flex items-center justify-center gap-3 bg-[var(--text-main)] text-[var(--bg-primary)] font-sans font-semibold py-3 px-6 rounded-lg hover:bg-white transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed mb-6"
        >
          <svg className="w-5 h-5 shrink-0" width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Google
        </button>

        <label className="flex items-start gap-3 cursor-pointer mb-6 group bg-[#0f0f20]/50 p-4 rounded-xl border border-[#27272a]/80 hover:border-[var(--accent-blue)]/50 transition-colors">
          <input
            type="checkbox"
            checked={wantsUpdates}
            onChange={(e) => setWantsUpdates(e.target.checked)}
            className="w-5 h-5 shrink-0 cursor-pointer mt-0.5 accent-[var(--accent-blue)]"
          />
          <span className="text-xs text-[var(--text-muted)] group-hover:text-[var(--text-main)] transition-colors leading-relaxed">
            I agree to receive notifications about system updates and new training modules.
          </span>
        </label>

        <div className="pt-6 border-t border-[#27272a] text-center">
          <p className="text-sm text-[var(--text-muted)] font-sans">
            {isSignUp ? "Already registered?" : "No profile found?"}{" "}
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError("");
              }}
              className="text-[var(--accent-blue)] font-semibold hover:text-blue-400 transition-colors ml-1"
            >
              {isSignUp ? "Authenticate here." : "Initialize one here."}
            </button>
          </p>
        </div>
      </motion.div>
    </main>
  );
}