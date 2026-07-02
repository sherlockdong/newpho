import OpenAI from 'openai';
import { NextRequest, NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Notice we now receive the pre-graded results and score
    const { userId, score, total, gradedResults } = await request.json();

    if (!userId) {
      throw new Error("User ID is required");
    }

    const payloadSize = JSON.stringify(gradedResults).length;
    if (payloadSize > 150000) {
      throw new Error("Payload too large");
    }

    // New, highly optimized prompt
    const prompt = `You are an expert tutor analyzing a student's recent quiz performance. 
    The student scored ${score} out of ${total}.

    Here is the breakdown of the questions and whether the student got them correct or incorrect:
    ${JSON.stringify(gradedResults, null, 2)}

    Based on the specific questions they got wrong, provide 2 to 3 sentences of targeted, encouraging feedback. Identify their weak areas and suggest what overarching concepts they should review next. Do not list out individual question feedback in this summary.

    Additionally, for EVERY question in the breakdown (regardless of correct/incorrect), provide a brief 1-sentence explanation of why the correct answer is correct.

    Return the output strictly as a JSON object with this exact shape:
    {
      "feedbackSummary": "string",
      "questionExplanations": [
        { "index": 0, "explanation": "string" }
      ]
    }
    The "index" field must match the zero-based position of the question in the input array.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1200, // Raised to accommodate per-question explanations
      response_format: { type: "json_object" },
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