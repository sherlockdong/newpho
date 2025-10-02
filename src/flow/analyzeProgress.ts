// src/flows/analyzeProgress.ts
import { AnalyzeInput } from "./type"; // Verified with .ts extension
import OpenAI from "openai";

// Initialize the OpenAI instance with xAI Grok configuration.
const openai = new OpenAI({
  baseURL: "https://api.x.ai/v1", // CHANGED: Switched to xAI endpoint
  apiKey: process.env.XAI_API_KEY!, // CHANGED: Updated to xAI API key
});

export async function analyzeStudentProgress(input: AnalyzeInput): Promise<string> {
  // Construct your prompt
  const prompt = `
    Analyze the following student progress data:
    - Quiz Scores: ${input.studentQuizScores}
    - Incorrect Topics: ${input.incorrectTopics}
    - Study Logs: ${input.studyLogs}
    
    Provide a prediction of the student's future performance and a detailed study schedule for improvement.
  `;

  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }], 
      model: "grok-4", 
      temperature: 0.7,
    });

    if (completion.choices && completion.choices.length > 0) {
      return completion.choices[0].message.content;
    }
    return "No analysis available.";
  } catch (error) {
    console.error("Error calling xAI Grok:", error);
    throw error;
  }
}