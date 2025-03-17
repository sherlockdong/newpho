"use client";

import React, { useState } from "react";

export default function PhysicsTutor() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const askQuestion = async () => {
    setLoading(true);
    setAnswer("");
    try {
      const response = await fetch("/api/langchain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // Adjust extraction if your response structure differs.
      setAnswer(data.text || JSON.stringify(data));
    } catch (error) {
      console.error("Error asking question:", error);
      setAnswer("Error: " + error.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: "600px", margin: "2rem auto", padding: "1rem" }}>
      <h1>Physics Tutor</h1>
      <textarea
        placeholder="Enter your physics question here..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        style={{ width: "100%", height: "100px", padding: "8px" }}
      />
      <button
        onClick={askQuestion}
        disabled={loading}
        style={{ marginTop: "1rem", padding: "10px 20px" }}
      >
        {loading ? "Thinking..." : "Ask Question"}
      </button>
      {answer && (
        <div style={{ marginTop: "1rem", padding: "1rem", border: "1px solid #ccc", borderRadius: "4px" }}>
          <h2>Answer:</h2>
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
}
