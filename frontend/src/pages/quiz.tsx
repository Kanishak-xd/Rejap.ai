import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import {
  CheckCircle2,
  XCircle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Send,
  BookOpen
} from "lucide-react"
import { cn } from "@/lib/utils"
import NextStepsCard from "@/components/next-steps-card"

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api"

interface QuizQuestion {
  id: string
  question: string
  type: string
  options: string[]
  correctAnswer: string
  order: number
}

interface Quiz {
  id: string
  module: {
    id: string
    title: string
    level: {
      id: string
      title: string
    }
  }
  questions: QuizQuestion[]
}

export default function Quiz() {
  const { level, module: moduleId } = useParams<{ level: string; module: string }>()
  const navigate = useNavigate()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({})
  const [quizResults, setQuizResults] = useState<any>(null)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (moduleId) {
      fetchQuiz()
    }
  }, [moduleId])

  const fetchQuiz = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/quiz?moduleId=${moduleId}`, {
        credentials: "include",
      })
      if (response.ok) {
        const data = await response.json()
        setQuiz(data)
      } else if (response.status === 401) {
        navigate("/")
      }
    } catch (error) {
      console.error("Failed to fetch quiz:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: answer }))
  }

  const handleNext = () => {
    if (currentQuestionIndex < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleSubmit = async () => {
    if (!quiz) return

    try {
      const response = await fetch(`${API_BASE}/quiz/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          quizId: quiz.id,
          moduleId: quiz.module.id,
          answers: Object.entries(selectedAnswers).map(([questionId, answer]) => ({
            questionId,
            answer,
          })),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setQuizResults(data)
        setSubmitted(true)
      }
    } catch (error) {
      console.error("Failed to submit quiz:", error)
    }
  }

  const handleRetry = () => {
    setSubmitted(false);
    setQuizResults(null);
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    fetchQuiz();
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">Loading quiz...</div>
      </div>
    )
  }

  if (!quiz || quiz.questions.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">No quiz available for this module.</div>
      </div>
    )
  }

  const currentQuestion = quiz.questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1
  const allAnswered = quiz.questions.every((q) => selectedAnswers[q.id])

  return (
    <div className="container mx-auto px-4 py-8 sm:py-16 max-w-4xl">
      {/* Breadcrumb */}
      <nav className="mb-6 sm:mb-8 text-xs sm:text-sm text-muted-foreground overflow-x-auto whitespace-nowrap pb-2">
        <Link to="/" className="hover:text-foreground">Home</Link>
        {" / "}
        <Link to={`/learn/${level}/${moduleId}`} className="hover:text-foreground">
          {quiz.module.title}
        </Link>
        {" / "}
        <span className="text-foreground">Quiz</span>
      </nav>

      <div className="mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 font-['Roboto']">
          {quiz.module.title} - Quiz
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Question {currentQuestionIndex + 1} of {quiz.questions.length}
        </p>
      </div>

      {!submitted ? (
        <Card className="border-2 shadow-md overflow-hidden">
          <CardHeader className="pb-4 pt-6 sm:pt-8">
            <CardTitle className="text-lg sm:text-xl font-semibold leading-tight">
              {currentQuestion.question}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <RadioGroup
              value={selectedAnswers[currentQuestion.id] || ""}
              onValueChange={(value) => handleAnswerSelect(currentQuestion.id, value)}
              className="space-y-2 sm:space-y-3"
            >
              {currentQuestion.options.map((option, index) => (
                <div key={index} className={cn(
                  "flex items-center space-x-3 p-3 sm:p-4 rounded-xl border-2 transition-all cursor-pointer hover:bg-accent",
                  selectedAnswers[currentQuestion.id] === option ? "border-primary bg-primary/5" : "border-transparent bg-muted/50"
                )}>
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <Label
                    htmlFor={`option-${index}`}
                    className="flex-1 cursor-pointer font-medium text-sm sm:text-base"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            {/* Navigation buttons */}
            <div className="flex flex-col sm:flex-row justify-between gap-3 mt-8">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className="w-full sm:w-auto gap-2 order-2 sm:order-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              {isLastQuestion ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!allAnswered}
                  className="w-full sm:w-auto gap-2 px-8 order-1 sm:order-2"
                >
                  <Send className="w-4 h-4" />
                  Submit Quiz
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!selectedAnswers[currentQuestion.id]}
                  className="w-full sm:w-auto gap-2 order-1 sm:order-2"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : quizResults && (
        <>
          <NextStepsCard
            passed={quizResults.passed}
            score={quizResults.score}
            correctCount={quizResults.correctCount}
            totalQuestions={quizResults.totalQuestions}
            aiRecommendation={quizResults.aiRecommendation}
            nextModule={quizResults.nextModule}
            levelPromoted={quizResults.levelPromoted}
            level={level || ''}
            moduleId={moduleId || ''}
            onRetry={handleRetry}
          />

          {/* Detailed Review Section */}
          <div className="mt-12 space-y-6">
            <h3 className="font-bold text-xl sm:text-2xl border-b pb-2 flex items-center gap-2">
              <BookOpen className="w-5 h-5 sm:w-6 h-6" />
              Detailed Review
            </h3>
            <div className="space-y-4">
              {quiz?.questions.map((question, index) => {
                const result = quizResults.results?.find((r: any) => r.questionId === question.id)
                const isCorrect = result?.correct

                return (
                  <div key={question.id} className={cn(
                    "border rounded-xl p-4 sm:p-6 transition-all",
                    isCorrect
                      ? "bg-green-50/50 border-green-100 dark:bg-green-900/10 dark:border-green-900/30"
                      : "bg-orange-50/50 border-orange-100 dark:bg-orange-900/10 dark:border-orange-900/30"
                  )}>
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className={cn(
                        "w-7 h-7 sm:w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1",
                        isCorrect
                          ? "bg-green-500 text-white dark:bg-green-600"
                          : "bg-orange-500 text-white dark:bg-orange-600"
                      )}>
                        {isCorrect ? <CheckCircle2 className="w-4 h-4 sm:w-5 h-5" /> : <XCircle className="w-4 h-4 sm:w-5 h-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-base sm:text-lg mb-3">
                          {index + 1}. {question.question}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="p-3 rounded-lg bg-background/50 border dark:bg-neutral-900/50 dark:border-neutral-700">
                            <span className="text-muted-foreground block mb-1">Your Answer</span>
                            <span className={cn(
                              "font-medium",
                              isCorrect
                                ? "text-green-700 dark:text-green-400"
                                : "text-orange-700 dark:text-orange-400"
                            )}>
                              {selectedAnswers[question.id] || 'No answer'}
                            </span>
                          </div>
                          {!isCorrect && (
                            <div className="p-3 rounded-lg bg-background/50 border dark:bg-neutral-900/50 dark:border-neutral-700">
                              <span className="text-muted-foreground block mb-1">Correct Answer</span>
                              <span className="text-green-700 dark:text-green-400 font-medium">
                                {result?.correctAnswer || question.correctAnswer}
                              </span>
                            </div>
                          )}
                        </div>
                        {!isCorrect && result?.feedback && (
                          <div className="mt-4 p-4 bg-white/80 border border-orange-200 rounded-lg shadow-sm dark:bg-neutral-900/80 dark:border-orange-900/30">
                            <div className="flex items-center gap-2 text-orange-800 dark:text-orange-400 font-semibold mb-1 text-sm">
                              <Sparkles className="w-4 h-4" />
                              AI Explanation
                            </div>
                            <p className="text-sm text-orange-900 dark:text-orange-200 leading-relaxed">{result.feedback}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
