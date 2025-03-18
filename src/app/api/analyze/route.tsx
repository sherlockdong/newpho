import { analyzeStudentProgress } from '../../../flow/analyzeProgress';

export async function POST(request: Request) {
  const { quizScores, incorrectTopics, studyLogs } = await request.json();

  const analysis = await analyzeStudentProgress({
    studentQuizScores: quizScores,
    incorrectTopics,
    studyLogs,
  });

  return Response.json({ analysis });
}
