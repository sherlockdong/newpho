import { OpenAI } from "openai";
import { NextRequest, NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Extract difficultyLevel alongside the prompt
    const { prompt, difficultyLevel } = await request.json();

    if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
      return NextResponse.json({ error: "Valid prompt string is required" }, { status: 400 });
    }

    // --- DYNAMIC MODEL ROUTING ---
    let targetModel = "gpt-5.4-mini"; // Default to fast/cheap for Physics Bowl, F=ma
    let targetTemperature = 0.4;      // Lowered from 0.7 for better LaTeX/JSON stability
    let targetMaxTokens = 1200;

    // Check if USAPhO or IPhO is explicitly mentioned in the difficulty or the prompt text
    const isUSAPhO =
      (difficultyLevel && /usapho|ipho/i.test(difficultyLevel)) ||
      /usapho|ipho/i.test(prompt);

    if (isUSAPhO) {
      targetModel = "gpt-5.4"; // Switch to the flagship reasoning engine
      targetTemperature = 0.1; // Strict logic needed for complex proofs
      targetMaxTokens = 2500;  // Give the model more runway for deep derivations
    }

    const completion = await openai.chat.completions.create({
      model: targetModel,
      messages: [{ role: "user", content: prompt }],
      temperature: targetTemperature,
      max_completion_tokens: targetMaxTokens,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: "No content returned from OpenAI" }, { status: 500 });
    }

    return NextResponse.json({ content });

  } catch (error: any) {
    console.error("Error calling OpenAI:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}