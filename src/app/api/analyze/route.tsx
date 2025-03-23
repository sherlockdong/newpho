// /api/analyze/route.tsx
export async function POST(request: Request) {
  try {
    const { quizScores, incorrectTopics, studyLogs } = await request.json();

    const response = await fetch("https://deepseek-backend-u2i2.onrender.com/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        quizScores,
        incorrectTopics,
        studyLogs,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Render server error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return Response.json({ analysis: data.analysis });
  } catch (error) {
    console.error("Error in analyze route:", error);
    return Response.json({ error: "Failed to analyze progress" }, { status: 500 });
  }
}