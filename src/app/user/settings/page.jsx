// src/app/user/settings/page.jsx
"use client";
import { useState, useEffect } from "react";
import { getAuth, updateProfile, updateEmail } from "firebase/auth";

export default function SettingsModal({ user, isOpen, onClose }) {
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [photoURL, setPhotoURL] = useState(user?.photoURL || "");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "");
      setEmail(user.email || "");
      setPhotoURL(user.photoURL || "");
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const auth = getAuth();
      await updateProfile(auth.currentUser, { displayName, photoURL });
      if (email !== user.email) {
        await updateEmail(auth.currentUser, email);
      }
      setSuccess("Profile updated successfully!");
      setTimeout(onClose, 2000);
    } catch (err) {
      setError(`Failed to update profile: ${err.message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`modal-backdrop ${isOpen ? "active" : ""}`} onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-button" onClick={onClose}>
          <svg
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <h2 className="modal-header">Edit Profile</h2>
        {error && <p className="modal-error">{error}</p>}
        {success && <p className="modal-success">{success}</p>}
        <form className="modal-form" onSubmit={handleSave}>
          <div>
            <label htmlFor="displayName" className="modal-label">
              Display Name
            </label>
            <input
              id="displayName"
              type="text"
              className="modal-input"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your name"
            />
          </div>
          <div>
            <label htmlFor="email" className="modal-label">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="modal-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label htmlFor="photoURL" className="modal-label">
              Profile Picture URL
            </label>
            <input
              id="photoURL"
              type="url"
              className="modal-input"
              value={photoURL}
              onChange={(e) => setPhotoURL(e.target.value)}
              placeholder="Enter image URL"
            />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
            <button
              type="button"
              className="modal-button modal-button-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="modal-button modal-button-primary"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}