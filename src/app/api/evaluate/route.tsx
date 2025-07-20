// src/app/api/evaluate/route.tsx
import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../firebase"; // Import Firestore
import { doc, setDoc } from "firebase/firestore";

async function fetchWithTimeout(url: string, opts: RequestInit = {}, ms = 60000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...opts, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

async function fetchWithRetry(url: string, opts: RequestInit = {}, retries = 3, timeout = 60000) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetchWithTimeout(url, opts, timeout);
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`DeepSeek attempt ${i + 1} failed with status ${response.status}: ${errorText}`);
        if (i === retries - 1) {
          throw new Error(`DeepSeek evaluation failed: ${response.status} - ${errorText}`);
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
        continue;
      }
      return response;
    } catch (error: any) {
      console.error(`DeepSeek attempt ${i + 1} failed:`, error.message);
      if (i === retries - 1) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  throw new Error("Max retries reached for DeepSeek API");
}

export async function POST(request: NextRequest) {
  try {
    const { quiz, answers, timeTaken, tag, userId } = await request.json();

    if (!userId) {
      throw new Error("User ID is required");
    }

    const quizSize = JSON.stringify(quiz).length;
    const answersSize = JSON.stringify(answers).length;
    if (quizSize > 100000 || answersSize > 100000) {
      throw new Error("Quiz or answers payload too large");
    }

    const prompt = `Evaluate the following quiz answers based on the questions provided:\n\nQuestions:\n${JSON.stringify(
      quiz,
      null,
      2
    )}\n\nUser Answers:\n${JSON.stringify(
      answers,
      null,
      2
    )}\n\nProvide an analysis of correctness and reasoning.`;

    const completion = await fetchWithRetry(
      "https://deepseek-backend-u2i2.onrender.com/api/quiz",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      },
      3,
      60000
    );

    const data = await completion.json();
    const analysis = data.choices[0].message.content;

    // Save to Firestore
    const logId = Date.now().toString();
    await setDoc(doc(db, `users/${userId}/analysisLogs`, logId), {
      title: tag || "Quiz Evaluation",
      score: data.score || "N/A", // Adjust based on DeepSeek response
      analysis,
      timeTaken,
      timestamp: new Date(),
    });

    return NextResponse.json({ analysis });
  } catch (error: any) {
    console.error("Error evaluating answers:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}