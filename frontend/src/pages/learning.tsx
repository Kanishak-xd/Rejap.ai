import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api"

interface ContentItem {
  id: string
  title: string
  content: string
  type: string
  order: number
  module: {
    id: string
    title: string
  }
}

interface Module {
  id: string
  title: string
  level: {
    id: string
    title: string
  }
}

export default function Learning() {
  const { level, module: moduleId } = useParams<{ level: string; module: string }>()
  const [content, setContent] = useState<ContentItem[]>([])
  const [module, setModule] = useState<Module | null>(null)
  const [userProgress, setUserProgress] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (moduleId) {
      fetchContent()
      fetchModule()
      fetchUserProgress()
    }
  }, [moduleId])

  const fetchUserProgress = async () => {
    try {
      const response = await fetch(`${API_BASE}/user/progress`, {
        credentials: "include",
      })
      if (response.ok) {
        const data = await response.json()
        setUserProgress(data)
      }
    } catch (error) {
      console.error("Failed to fetch user progress:", error)
    }
  }

  const fetchModule = async () => {
    try {
      const response = await fetch(`${API_BASE}/learning/path`, {
        credentials: "include",
      })
      if (response.ok) {
        const levels = await response.json()
        for (const l of levels) {
          const m = l.modules.find((mod: any) => mod.id === moduleId)
          if (m) {
            setModule({ ...m, level: { id: l.id, title: l.title } })
            break
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch module:", error)
    }
  }

  const fetchContent = async () => {
    try {
      const response = await fetch(`${API_BASE}/content?moduleId=${moduleId}`, {
        credentials: "include",
      })
      if (response.ok) {
        const data = await response.json()
        setContent(data.sort((a: ContentItem, b: ContentItem) => a.order - b.order))
      }
    } catch (error) {
      console.error("Failed to fetch content:", error)
    } finally {
      setLoading(false)
    }
  }

  const isCompleted = userProgress?.moduleProgress?.find((p: any) => p.moduleId === moduleId)?.completed

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">Loading content...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:py-16 max-w-4xl">
      {/* Breadcrumb */}
      <nav className="mb-6 sm:mb-8 text-xs sm:text-sm text-muted-foreground overflow-x-auto whitespace-nowrap pb-2">
        <Link to="/" className="hover:text-foreground">Home</Link>
        {" / "}
        {module && (
          <>
            <Link to={`/learn/${level}/${moduleId}`} className="hover:text-foreground">
              {module.level.title}
            </Link>
            {" / "}
            <span className="text-foreground">{module.title}</span>
          </>
        )}
      </nav>

      {module && (
        <>
          <div className="mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2 font-['Roboto']">
              {module.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm sm:text-base text-muted-foreground">
              <p>Level: {module.level.title}</p>
              {isCompleted && (
                <span className="flex items-center gap-1 text-green-600 font-medium text-xs sm:text-sm">
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 h-4" />
                  Completed
                </span>
              )}
            </div>
          </div>

          {/* Progress indicator */}
          <div className="mb-8 bg-card p-4 rounded-xl border shadow-sm">
            <div className="flex justify-between text-sm mb-2 font-medium">
              <span>Lesson Progress</span>
              <span>100%</span>
            </div>
            <Progress value={100} className="h-2" />
          </div>

          {/* Content items */}
          <div className="space-y-8">
            {content.map((item) => (
              <Card key={item.id} className="border-2 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                <CardHeader className="pb-2 pt-6 px-4 sm:px-6">
                  <CardTitle className="text-lg sm:text-xl font-bold">{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="prose dark:prose-invert max-w-none text-base sm:text-lg leading-relaxed">
                    {item.type === "text" && (
                      <p className="whitespace-pre-wrap px-4 sm:px-6 pb-6">{item.content}</p>
                    )}
                    {item.type === "code" && (
                      <div className="relative group px-4 sm:px-6 pb-6">
                        <pre className="bg-slate-900 text-slate-100 p-4 sm:p-6 rounded-xl overflow-x-auto font-mono text-xs sm:text-sm">
                          <code>{item.content}</code>
                        </pre>
                      </div>
                    )}
                    {item.type === "image" && (
                      <div className="px-4 sm:px-6 pb-6">
                        <div className="rounded-xl overflow-hidden border-2">
                          <img src={item.content} alt={item.title} className="w-full h-auto" />
                        </div>
                      </div>
                    )}
                    {item.type === "video" && (
                      <div className="px-4 sm:px-6 pb-6">
                        <div className="aspect-video rounded-xl overflow-hidden border-2">
                          <iframe
                            src={item.content}
                            className="w-full h-full"
                            allowFullScreen
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Action buttons */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto font-bold px-8 py-6 text-lg rounded-xl shadow-lg hover:scale-105 transition-transform"
            >
              <Link to={`/quiz/${level}/${moduleId}`}>
                {isCompleted ? "Retake Quiz" : "Take Module Quiz"}
              </Link>
            </Button>

            {isCompleted && (
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full sm:w-auto font-bold px-8 py-6 text-lg rounded-xl border-2"
              >
                <Link to="/learning-path">
                  Back to Learning Path
                </Link>
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
