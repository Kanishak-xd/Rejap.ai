import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"

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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (moduleId) {
      fetchContent()
      fetchModule()
    }
  }, [moduleId])

  const fetchModule = async () => {
    try {
      // Fetch all modules for the level to find the current one
      const response = await fetch(`${API_BASE}/modules?levelId=${level}`, {
        credentials: "include",
      })
      if (response.ok) {
        const modules = await response.json()
        const currentModule = modules.find((m: Module) => m.id === moduleId)
        setModule(currentModule || null)
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">Loading content...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      {/* Breadcrumb */}
      <nav className="mb-8 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Home</Link>
        {" / "}
        {module && (
          <>
            <Link to={`/learn/${level}`} className="hover:text-foreground">
              {module.level.title}
            </Link>
            {" / "}
            <span className="text-foreground">{module.title}</span>
          </>
        )}
      </nav>

      {module && (
        <>
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 font-['Roboto']">
              {module.title}
            </h1>
            <p className="text-muted-foreground">
              Level: {module.level.title}
            </p>
          </div>

          {/* Progress indicator */}
          <div className="mb-8">
            <div className="flex justify-between text-sm mb-2">
              <span>Progress</span>
              <span>{content.length > 0 ? "100%" : "0%"}</span>
            </div>
            <Progress value={content.length > 0 ? 100 : 0} className="h-2" />
          </div>

          {/* Content items */}
          <div className="space-y-6">
            {content.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <CardTitle className="font-['Roboto']">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose dark:prose-invert max-w-none">
                    {item.type === "text" && (
                      <p className="whitespace-pre-wrap">{item.content}</p>
                    )}
                    {item.type === "code" && (
                      <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                        <code>{item.content}</code>
                      </pre>
                    )}
                    {item.type === "image" && (
                      <img src={item.content} alt={item.title} className="max-w-full rounded-lg" />
                    )}
                    {item.type === "video" && (
                      <div className="aspect-video">
                        <iframe
                          src={item.content}
                          className="w-full h-full rounded-lg"
                          allowFullScreen
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quiz button */}
          <div className="mt-12 text-center">
            <Button
              asChild
              size="lg"
              className="font-['Roboto']"
            >
              <Link to={`/quiz/${level}/${moduleId}`}>Take Quiz</Link>
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

