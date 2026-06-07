import OpenAI from 'openai';
import { NextRequest, NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { quiz, answers, timeTaken, tag, userId } = await request.json();

    if (!userId) {
      throw new Error("User ID is required");
    }

    const quizSize = JSON.stringify(quiz).length;
    const answersSize = JSON.stringify(answers).length;
    console.log(`Quiz size: ${quizSize} bytes, Answers size: ${answersSize} bytes`);
    if (quizSize > 150000 || answersSize > 150000) {
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
    )}\n\nProvide a detailed analysis of correctness for each answer, including reasoning and feedback. Return the output as a JSON object with a "results" array, where each element contains "questionIndex", "correct", "userAnswer", "correctAnswer", and "feedback" fields.`;

    console.log("Sending prompt:", prompt);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: "json_object" }, // guarantees valid JSON back
    });

    const analysisText = completion.choices[0]?.message?.content;
    if (!analysisText) {
      throw new Error("Invalid OpenAI response: No content found");
    }

    const analysis = JSON.parse(analysisText);
    return NextResponse.json({ analysis });

  } catch (error: any) {
    console.error("Error evaluating answers:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}