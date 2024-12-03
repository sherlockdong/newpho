"use client";

import React, { useState } from "react";

const Simp = () => {
  const [prompt, setPrompt] = useState("");
  const [generatedText, setGeneratedText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt) {
      alert("Please enter a prompt!");
      return;
    }

    setLoading(true);
    setGeneratedText("");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();
      setGeneratedText(data.generatedText);
    } catch (error) {
      console.error("Error generating text:", error.message);
      setGeneratedText("Failed to generate text. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter a prompt..."
        rows={4}
        cols={50}
      />
      <br />
      <button onClick={handleGenerate} disabled={loading}>
        {loading ? "Generating..." : "Generate Text"}
      </button>
      <div className="generated-text">
        {generatedText}
      </div>
    </div>
  );
};

export default Simp;
