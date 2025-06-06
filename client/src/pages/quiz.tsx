import DailyQuiz from "@/components/daily-quiz";

export default function Quiz() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          Daily Intelligence Quiz
        </h1>
        <DailyQuiz />
      </div>
    </div>
  );
}