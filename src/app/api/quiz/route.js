// api/quiz/route.js
export async function POST(request) {
  try {
    const { tag, numQuestions } = await request.json();
    console.log("Received:", { tag, numQuestions });
    if (!tag || !numQuestions) {
      return Response.json({ error: "Tag and numQuestions required" }, { status: 400 });
    }
    const prompt = `Generate ${numQuestions} quiz questions for ${tag}. Provide answers for each question and format the output as a JSON array of objects, where each object has "question", "options" (array of 4 choices), and "correctAnswer" fields.`;
    console.log("Sending prompt:", prompt);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); 
    const response = await fetch("https://api.x.ai/v1/chat/completions", { 
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.XAI_API_KEY}`,  // CHANGED: Added xAI API key
      },
      body: JSON.stringify({
        model: "grok-4",  // CHANGED: Set Grok model
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7, 
        max_tokens: 500,  
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`xAI Grok API failed: ${response.status} - ${errorText}`);  // CHANGED: Updated error message
    }

    const data = await response.json();
    console.log("xAI Grok API response:", JSON.stringify(data, null, 2));  // CHANGED: Updated log

    // Extract the generated quiz from the response (assuming Grok returns it in choices[0].message.content)
    const quizText = data.choices[0]?.message?.content;
    if (!quizText) {
      throw new Error("No quiz data in response");
    }

    // Parse the JSON string returned by Grok (assuming it follows the prompt format)
    const quiz = JSON.parse(quizText);
    return Response.json({ quiz }, { status: 200 });
  } catch (error) {
    console.error("Quiz route error:", error);
    return Response.json({ error: `Failed to generate quiz: ${error.message}` }, { status: 500 });
  }
}