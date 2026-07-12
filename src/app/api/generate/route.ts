import { OpenAI } from "openai";
import { NextRequest, NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type GenerateRequestBody = {
  prompt?: unknown;
  difficultyLevel?: unknown;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as GenerateRequestBody;
    const { prompt, difficultyLevel } = body;

    if (
      typeof prompt !== "string" ||
      prompt.trim() === ""
    ) {
      return NextResponse.json(
        { error: "Valid prompt string is required" },
        { status: 400 },
      );
    }

    let targetModel = "gpt-5.4-mini";
    let targetTemperature = 0.4;
    let targetMaxTokens = 1200;

    const isUSAPhO =
      (typeof difficultyLevel === "string" &&
        /usapho|ipho/i.test(difficultyLevel)) ||
      /usapho|ipho/i.test(prompt);

    if (isUSAPhO) {
      targetModel = "gpt-5.4";
      targetTemperature = 0.1;
      targetMaxTokens = 2500;
    }

    const completion = await openai.chat.completions.create({
      model: targetModel,
      messages: [{ role: "user", content: prompt }],
      temperature: targetTemperature,
      max_completion_tokens: targetMaxTokens,
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "No content returned from OpenAI" },
        { status: 500 },
      );
    }

    return NextResponse.json({ content });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown OpenAI error";

    console.error("Error calling OpenAI:", error);

    return NextResponse.json(
      { error: message },
      { status: 500 },
    );
  }
}
