export async function POST(request) {
  try {
    const body = await request.json();
    console.log("Received body:", body);
    const { prompt } = body;

    if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
      throw new Error("Valid prompt string is required");
    }

    if (!process.env.DEEPSEEK_API_KEY) {
      throw new Error("DeepSeek API key is not set");
    }

    const payload = {
      model: "deepseek-chat",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    };

    const response = await fetch("https://api.deepseek.com/v1", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DeepSeek API failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("DeepSeek API response:", JSON.stringify(data, null, 2));

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error calling DeepSeek API:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}