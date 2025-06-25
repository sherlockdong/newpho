"use client";

import React, { useState } from "react";
import Link from 'next/link';
export default function PhysicsProblem() {
  const [problem, setProblem] = useState("");
  const [loading, setLoading] = useState(false);

  const generateProblem = async () => {
    setLoading(true);
    const prompt = "Create a beginner-level problem about Newton's second law.";

    try {
      const response = await fetch("/api/deepseek", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("DeepSeek API response:", data);
      
      // Adjust extraction based on your DeepSeek response structure.
      const content = data.choices?.[0]?.message?.content || "No response received";
      setProblem(content);
    } catch (error) {
      console.error("Error generating problem:", error);
      setProblem("Error: " + error.message);
    }
    
    setLoading(false);
  };
  return (<>
    <div id="start">This page is still being developed.</div>
      <div>
        {problem && <p>{problem}</p>}
      </div>
</>
)
}
