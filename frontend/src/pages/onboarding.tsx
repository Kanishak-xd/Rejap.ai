import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Sparkles, CheckCircle2, ChevronRight, ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api"

interface Question {
  id: string
  question: string
  options: string[]
}

interface DiagnosticResult {
  score: number
  correctCount: number
  totalQuestions: number
  assignedLevel: string
  levelId: string
}

export default function Onboarding() {
  const navigate = useNavigate()
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<DiagnosticResult | null>(null)

  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchQuestions()
  }, [])

  const fetchQuestions = async () => {
    try {
      const response = await fetch(`${API_BASE}/quiz/diagnostic`, {
        credentials: "include",
      })
      if (response.ok) {
        const data = await response.json()
        setQuestions(data)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to load questions")
      }
    } catch (error) {
      console.error("Failed to fetch diagnostic questions:", error)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }))
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const response = await fetch(`${API_BASE}/quiz/diagnostic`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          answers: Object.entries(answers).map(([questionId, answer]) => ({
            questionId,
            answer,
          })),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setResult(data)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to submit quiz")
      }
    } catch (error) {
      console.error("Failed to submit diagnostic quiz:", error)
      setError("Failed to submit your answers. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground">Preparing your diagnostic quiz...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-md">
        <div className="bg-destructive/10 text-destructive p-6 rounded-2xl mb-6">
          <h2 className="text-xl font-bold mb-2">Oops! Something went wrong</h2>
          <p>{error}</p>
        </div>
        <Button onClick={() => { setError(null); setLoading(true); fetchQuestions(); }}>
          Try Again
        </Button>
      </div>
    )
  }

  if (result) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <Card className="border-2 shadow-xl overflow-hidden">
          <div className="bg-primary/10 p-6 sm:p-8 text-center border-b">
            <div className="w-16 h-16 sm:w-20 h-20 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Sparkles className="w-8 h-8 sm:w-10 h-10" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">Assessment Complete!</h2>
            <p className="text-sm sm:text-base text-muted-foreground">We've analyzed your Japanese proficiency.</p>
          </div>
          <CardContent className="p-6 sm:p-8 text-center">
            <div className="mb-6 sm:mb-8">
              <p className="text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground font-bold mb-2">Your Assigned Level</p>
              <h3 className="text-4xl sm:text-5xl font-black text-primary font-['Roboto'] mb-4">{result.assignedLevel}</h3>
              <div className="flex flex-wrap justify-center gap-2 sm:gap-4 text-xs sm:text-sm font-medium">
                <span className="px-3 py-1 bg-muted rounded-full">Score: {Math.round(result.score * 100)}%</span>
                <span className="px-3 py-1 bg-muted rounded-full">{result.correctCount}/{result.totalQuestions} Correct</span>
              </div>
            </div>

            <p className="text-sm sm:text-base text-muted-foreground mb-8 leading-relaxed">
              Based on your performance, we've tailored a learning path specifically for you.
              You can now start with the first module of the <strong>{result.assignedLevel}</strong> level.
            </p>

            <Button
              size="lg"
              className="w-full py-6 sm:py-8 text-lg sm:text-xl font-bold rounded-2xl shadow-lg hover:scale-[1.02] transition-transform"
              onClick={() => navigate("/learning-path")}
            >
              Go to My Learning Path
              <ChevronRight className="ml-2 w-5 h-5 sm:w-6 h-6" />
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">No questions found. Please try again later.</p>
        <Button onClick={fetchQuestions} className="mt-4">Retry</Button>
      </div>
    )
  }

  const currentQuestion = questions[currentIndex]
  const progress = ((currentIndex + 1) / questions.length) * 100
  const isLast = currentIndex === questions.length - 1
  const canSubmit = Object.keys(answers).length === questions.length

  return (
    <div className="container mx-auto px-4 py-8 sm:py-16 max-w-3xl">
      <div className="mb-8 sm:mb-12 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4 font-['Roboto']">Diagnostic Quiz</h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto px-2">
          Answer these 10 questions to help us determine your starting level.
          Don't worry if you're not sure—just select "Not sure".
        </p>
      </div>

      <div className="mb-8">
        <div className="flex justify-between text-sm font-medium mb-2">
          <span>Question {currentIndex + 1} of {questions.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card className="border-2 shadow-lg overflow-hidden">
        <CardHeader className="pb-4 pt-6 sm:pt-8">
          <CardTitle className="text-xl sm:text-2xl font-bold leading-tight">
            {currentQuestion.question}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={answers[currentQuestion.id] || ""}
            onValueChange={(val) => handleAnswer(currentQuestion.id, val)}
            className="space-y-2 sm:space-y-3"
          >
            {currentQuestion.options.map((option, idx) => (
              <div key={idx} className={cn(
                "flex items-center space-x-3 p-3 sm:p-4 rounded-xl border-2 transition-all cursor-pointer hover:bg-accent",
                answers[currentQuestion.id] === option ? "border-primary bg-primary/5" : "border-transparent bg-muted/50"
              )}>
                <RadioGroupItem value={option} id={`option-${idx}`} />
                <Label htmlFor={`option-${idx}`} className="flex-1 cursor-pointer font-medium text-base sm:text-lg">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>

          <div className="flex flex-col sm:flex-row justify-between gap-3 mt-8 sm:mt-12">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentIndex === 0}
              className="w-full sm:w-auto px-6 py-6 rounded-xl border-2 order-2 sm:order-1"
            >
              <ChevronLeft className="mr-2 w-5 h-5" />
              Back
            </Button>

            {isLast ? (
              <Button
                onClick={handleSubmit}
                disabled={!canSubmit || submitting}
                className="w-full sm:w-auto px-10 py-6 rounded-xl font-bold text-lg shadow-md order-1 sm:order-2"
              >
                {submitting ? "Analyzing..." : "Finish Assessment"}
                {!submitting && <CheckCircle2 className="ml-2 w-5 h-5" />}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!answers[currentQuestion.id]}
                className="w-full sm:w-auto px-10 py-6 rounded-xl font-bold text-lg shadow-md order-1 sm:order-2"
              >
                Next
                <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
