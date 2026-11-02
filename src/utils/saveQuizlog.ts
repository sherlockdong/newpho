import { getAuth } from "firebase/auth";

import { app } from "../firebase";

interface SaveQuizLogInput {
  topic: string;
  score: number;
  totalQuestions: number;
  analysis: string;
}

interface SaveQuizLogResult {
  logId: string;
}

export async function saveQuizLog(
  quizResult: SaveQuizLogInput,
): Promise<SaveQuizLogResult> {
  const auth = getAuth(app);
  const user = auth.currentUser;

  if (!user) {
    throw new Error("You must be signed in to save quiz results.");
  }

  const token = await user.getIdToken();

  const response = await fetch("/api/logs", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(quizResult),
  });

  const result: unknown = await response.json();

  if (!response.ok) {
    const message =
      typeof result === "object" &&
      result !== null &&
      "error" in result &&
      typeof result.error === "string"
        ? result.error
        : "Failed to save quiz result.";

    throw new Error(message);
  }

  return result as SaveQuizLogResult;
}