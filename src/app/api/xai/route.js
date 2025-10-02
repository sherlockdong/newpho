export async function POST(request) {
  try {
    const body = await request.json();
    console.log("Received body:", body);
    const { prompt } = body;

    if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
      throw new Error("Valid prompt string is required");
    }

    if (!process.env.XAI_API_KEY) {  
      throw new Error("xAI Grok API key is not set");
    }

    const payload = {
      model: "grok-4",  
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    };

    const response = await fetch("https://api.x.ai/v1", {  
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.XAI_API_KEY}`,  // CHANGED: Uses XAI_API_KEY
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`xAI Grok API failed: ${response.status} - ${errorText}`);  // CHANGED: Updated error message for clarity
    }

    const data = await response.json();
    console.log("xAI Grok API response:", JSON.stringify(data, null, 2));  // CHANGED: Updated log for clarity

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error calling xAI Grok API:", error.message);  // CHANGED: Updated log for clarity
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}