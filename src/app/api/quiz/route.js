// api/quiz/route.js
export async function POST(request) {
  try {
    const { tag, numQuestions } = await request.json();
    console.log("Received:", { tag, numQuestions });
    if (!tag || !numQuestions) {
      return Response.json({ error: "Tag and numQuestions required" }, { status: 400 });
    }
    const prompt = `Generate ${numQuestions} quiz questions for ${tag}`;
    console.log("Sending prompt:", prompt);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s to stay under 10s
    const response = await fetch("https://deepseek-backend-u2i2.onrender.com/api/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const responseText = await response.text();
    console.log("Render response:", response.status, responseText);
    if (!response.ok) {
      throw new Error(`Render API call failed: ${response.status} - ${responseText}`);
    }
    const data = JSON.parse(responseText);
    return Response.json({ quiz: data });
  } catch (error) {
    console.error("Quiz route error:", error);
    return Response.json({ error: `Failed to generate quiz: ${error.message}` }, { status: 500 });
  }
}