import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api"

interface Level {
  id: string
  title: string
  description: string | null
  order: number
}

export default function Onboarding() {
  const navigate = useNavigate()
  const [levels, setLevels] = useState<Level[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLevels()
  }, [])

  const fetchLevels = async () => {
    try {
      const response = await fetch(`${API_BASE}/levels`, {
        credentials: "include",
      })
      if (response.ok) {
        const data = await response.json()
        setLevels(data.sort((a: Level, b: Level) => a.order - b.order))
      }
    } catch (error) {
      console.error("Failed to fetch levels:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleContinue = async (levelId: string) => {
    // Start diagnostic quiz for the selected level
    try {
      const response = await fetch(`${API_BASE}/quiz/diagnostic`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ levelId }),
      })

      if (response.ok) {
        const data = await response.json()
        // Navigate to the diagnostic quiz
        navigate(`/quiz/diagnostic/${data.quizId}`)
      } else {
        console.error("Failed to start diagnostic quiz")
      }
    } catch (error) {
      console.error("Error starting diagnostic quiz:", error)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">Loading levels...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-4 font-['Roboto']">
          Choose Your Starting Level
        </h1>
        <p className="text-center text-muted-foreground mb-12">
          Select the level that best matches your current Japanese proficiency.
          We'll start with a diagnostic quiz to confirm your placement.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {levels.map((level) => (
            <Card key={level.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="font-['Roboto']">{level.title}</CardTitle>
                <CardDescription>
                  {level.description || `Start your journey at the ${level.title.toLowerCase()} level`}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex items-end">
                <Button
                  onClick={() => handleContinue(level.id)}
                  className="w-full"
                >
                  Continue
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

