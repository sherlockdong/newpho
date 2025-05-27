import { NextRequest, NextResponse } from "next/server";

// 1) Put this at the top, before your POST handler:
async function fetchWithTimeout(url: string, opts: RequestInit = {}, ms = 9000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...opts, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { quiz, answers, timeTaken, tag, userId } = await request.json();

    const prompt = `Evaluate the following quiz answers based on the questions provided:\n\nQuestions:\n${JSON.stringify(
      quiz,
      null,
      2
    )}\n\nUser Answers:\n${JSON.stringify(
      answers,
      null,
      2
    )}\n\nProvide an analysis of correctness and reasoning.`;

    // 2) Replace your original fetch(...) with fetchWithTimeout(...)
    const completion = await fetchWithTimeout(
      "https://deepseek-backend-u2i2.onrender.com/api/quiz",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      },
      9000 // abort after 9 seconds
    );

    if (!completion.ok) {
      const errorText = await completion.text();
      console.error(`DeepSeek failed with status ${completion.status}: ${errorText}`);
      throw new Error(`DeepSeek evaluation failed: ${completion.status} - ${errorText}`);
    }

    const data = await completion.json();
    const analysis = data.choices[0].message.content;

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("Error evaluating answers:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
