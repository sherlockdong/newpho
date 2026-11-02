import Link from "next/link";

export default function QuizStudyPlanLink() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-4">
      <Link href="/study-plan" className="text-[#4f8ef7] underline">
        Use these results in my study plan →
      </Link>
      <p className="text-sm text-zinc-400 mt-2">
        Short quizzes help guide practice. Mastery requires at least 4 correct
        answers on a five-question quiz (80% on longer quizzes).
      </p>
    </div>
  );
}
