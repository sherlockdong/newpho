"use client";

import { useState } from "react";

export default function StudentProgressAnalyzer() {
  const [quizScores, setQuizScores] = useState("");
  const [incorrectTopics, setIncorrectTopics] = useState("");
  const [studyLogs, setStudyLogs] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page refresh on form submission
    setLoading(true);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quizScores, incorrectTopics, studyLogs }),
      });
      const data = await response.json();
      setAnalysis(data.analysis);
    } catch (error) {
      console.error("Error analyzing progress:", error);
      setAnalysis("An error occurred while analyzing progress.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="max-w-xl w-full bg-white shadow-md rounded-lg p-6"
      >
        <h1 className="text-2xl font-bold mb-4">Student Progress Analyzer</h1>

        <div className="mb-4">
          <label htmlFor="quizScores" className="block mb-1 font-medium">
            Quiz Scores (comma separated, e.g., 80,70,65)
          </label>
          <input
            id="quizScores"
            type="text"
            className="w-full border border-gray-300 rounded p-2"
            value={quizScores}
            onChange={(e) => setQuizScores(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="incorrectTopics" className="block mb-1 font-medium">
            Incorrect Topics (comma separated)
          </label>
          <input
            id="incorrectTopics"
            type="text"
            className="w-full border border-gray-300 rounded p-2"
            value={incorrectTopics}
            onChange={(e) => setIncorrectTopics(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="studyLogs" className="block mb-1 font-medium">
            Study Logs (optional)
          </label>
          <textarea
            id="studyLogs"
            className="w-full border border-gray-300 rounded p-2"
            value={studyLogs}
            onChange={(e) => setStudyLogs(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-500 transition"
        >
          {loading ? "Analyzing..." : "Analyze Progress"}
        </button>

        {analysis && (
          <div className="mt-6 p-4 bg-gray-100 rounded">
            <h2 className="text-xl font-bold mb-2">Analysis Result</h2>
            <p className="whitespace-pre-line">{analysis}</p>
          </div>
        )}
      </form>
    </div>
  );
}
