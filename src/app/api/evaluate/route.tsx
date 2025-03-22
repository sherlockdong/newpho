import { analyzeStudentProgress } from '../../../flow/analyzeProgress';
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../firebase";

export async function POST(request: Request) {
    const { quiz, answers, timeTaken, tag, userId } = await request.json();
  
    const prompt = `
      Evaluate the following quiz responses:
      Questions: ${JSON.stringify(quiz)}
      Answers: ${JSON.stringify(answers)}
      Time Taken: ${timeTaken} seconds
      
      For each question, assess:
      - Accuracy (is the answer correct?)
      - Reasoning quality (if provided)
      - Confidence level (0-100)
      Provide a score (0-100) per question and an overall analysis with a study schedule.
    `;
  
    try {
      const completion = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [{ role: "system", content: prompt }],
          temperature: 0.7,
        }),
      });
  
      if (!completion.ok) throw new Error("DeepSeek evaluation failed");
      const data = await completion.json();
      const analysis = data.choices[0].message.content;
  
      return Response.json({ analysis });
    } catch (error) {
      console.error("Error evaluating answers:", error);
      return Response.json({ error: "Failed to evaluate answers" }, { status: 500 });
    }
  }