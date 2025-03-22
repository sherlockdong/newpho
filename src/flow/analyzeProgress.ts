// src/flows/analyzeProgress.ts
import { AnalyzeInput } from "./type";
import OpenAI from "openai";

// Initialize the OpenAI instance with DeepSeek configuration.
const openai = new OpenAI({
  baseURL: "https://api.deepseek.com/v1",
  apiKey: process.env.DEEPSEEK_API_KEY!,
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
      messages: [{ role: "system", content: prompt }],
      model: "deepseek-chat",
      temperature: 0.7,
    });

    if (completion.choices && completion.choices.length > 0) {
      return completion.choices[0].message.content;
    }
    return "No analysis available.";
  } catch (error) {
    console.error("Error calling DeepSeek:", error);
    throw error;
  }
}
