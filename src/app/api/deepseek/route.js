// src/app/api/deepseek/route.js

export async function POST(request) {
  try {
    const body = await request.json();
    console.log("Received body:", body);
    const { prompt } = body; // expecting { "prompt": "your prompt text" }

    if (!prompt) {
      throw new Error("prompt is not defined");
    }

    if (!process.env.DEEPSEEK_API_KEY) {
      throw new Error("DeepSeek API key is not set");
    }

    const payload = {
      model: "deepseek-chat",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    };

    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error calling DeepSeek API:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
