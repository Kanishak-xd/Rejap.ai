export default function About() {
  return (
    <div className="container mx-auto px-4 py-8 sm:py-16 max-w-4xl">
      <h1 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 font-['Roboto']">About Rejap.ai</h1>
      <div className="prose dark:prose-invert max-w-none">
        <p className="text-base sm:text-lg mb-4">
          Rejap.ai is an AI-powered Japanese learning platform designed to help
          you master Japanese at your own pace.
        </p>
        <p className="mb-4">
          Our platform uses advanced AI to provide personalized learning
          experiences, adaptive quizzes, and intelligent feedback to accelerate
          your Japanese learning journey.
        </p>
        <h2 className="text-2xl font-bold mt-8 mb-4 font-['Roboto']">Features</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Personalized learning paths based on your level</li>
          <li>AI-generated quizzes with instant feedback</li>
          <li>Progress tracking across modules and levels</li>
          <li>Adaptive content that adjusts to your learning pace</li>
        </ul>
      </div>
    </div>
  )
}

