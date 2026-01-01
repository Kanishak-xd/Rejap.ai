import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

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

interface Feedback {
  questionId: string
  feedback: string
}

export default function Quiz() {
  const { level, module: moduleId } = useParams<{ level: string; module: string }>()
  const navigate = useNavigate()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({})
  const [feedback, setFeedback] = useState<Record<string, Feedback>>({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (moduleId) {
      fetchQuiz()
    }
  }, [moduleId])

  const fetchQuiz = async () => {
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
          answers: Object.entries(selectedAnswers).map(([questionId, answer]) => ({
            questionId,
            answer,
          })),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        // Store feedback for incorrect answers
        const feedbackMap: Record<string, Feedback> = {}
        data.results?.forEach((result: any) => {
          if (!result.correct && result.feedback) {
            feedbackMap[result.questionId] = {
              questionId: result.questionId,
              feedback: result.feedback,
            }
          }
        })
        setFeedback(feedbackMap)
        setSubmitted(true)
      }
    } catch (error) {
      console.error("Failed to submit quiz:", error)
    }
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
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      {/* Breadcrumb */}
      <nav className="mb-8 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Home</Link>
        {" / "}
        <Link to={`/learn/${level}/${moduleId}`} className="hover:text-foreground">
          {quiz.module.title}
        </Link>
        {" / "}
        <span className="text-foreground">Quiz</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 font-['Roboto']">
          {quiz.module.title} - Quiz
        </h1>
        <p className="text-muted-foreground">
          Question {currentQuestionIndex + 1} of {quiz.questions.length}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-['Roboto']">
            {currentQuestion.question}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={selectedAnswers[currentQuestion.id] || ""}
            onValueChange={(value) => handleAnswerSelect(currentQuestion.id, value)}
            disabled={submitted}
          >
            {currentQuestion.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2 py-2">
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label
                  htmlFor={`option-${index}`}
                  className="flex-1 cursor-pointer"
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>

          {/* Show feedback for incorrect answers */}
          {submitted && feedback[currentQuestion.id] && (
            <Alert className="mt-4 border-destructive">
              <AlertDescription>
                <strong>Incorrect.</strong> {feedback[currentQuestion.id].feedback}
              </AlertDescription>
            </Alert>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </Button>
            {isLastQuestion ? (
              <Button
                onClick={handleSubmit}
                disabled={!allAnswered || submitted}
              >
                {submitted ? "Submitted" : "Submit Quiz"}
              </Button>
            ) : (
              <Button onClick={handleNext} disabled={!selectedAnswers[currentQuestion.id]}>
                Next
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results summary */}
      {submitted && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="font-['Roboto']">Quiz Complete!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              You've completed the quiz. Review your answers above or return to the module.
            </p>
            <Button asChild>
              <Link to={`/learn/${level}/${moduleId}`}>Back to Module</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

