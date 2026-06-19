import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Received body:", body);
    const { prompt } = body;

    if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
      throw new Error("Valid prompt string is required");
    }

    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key is not set");
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    console.log("OpenAI response:", JSON.stringify(completion, null, 2));

    return new Response(JSON.stringify(completion), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Error calling OpenAI API:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}