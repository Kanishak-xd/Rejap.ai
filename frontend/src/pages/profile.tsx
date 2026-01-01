import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api"

interface User {
  id: string
  email: string
  name: string | null
  profileImage: string | null
  currentLevel: {
    id: string
    title: string
    order: number
  } | null
}

interface ModuleProgress {
  id: string
  module: {
    id: string
    title: string
    level: {
      id: string
      title: string
    }
  }
  completed: boolean
  progress: number
}


export default function Profile() {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [moduleProgress, setModuleProgress] = useState<ModuleProgress[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserData()
    fetchProgress()
  }, [])

  const fetchUserData = async () => {
    try {
      const response = await fetch(`${API_BASE}/user/me`, {
        credentials: "include",
      })
      if (response.ok) {
        const data = await response.json()
        setUser(data)
      } else if (response.status === 401) {
        navigate("/")
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error)
      navigate("/")
    } finally {
      setLoading(false)
    }
  }

  const fetchProgress = async () => {
    try {
      const response = await fetch(`${API_BASE}/user/progress`, {
        credentials: "include",
      })
      if (response.ok) {
        const data = await response.json()
        setModuleProgress(data.moduleProgress || [])
      }
    } catch (error) {
      console.error("Failed to fetch progress:", error)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">Loading profile...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const completedModules = moduleProgress.filter((mp) => mp.completed).length
  const totalModules = moduleProgress.length

  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 font-['Roboto']">Profile</h1>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {/* User Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="font-['Roboto']">Your Profile</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src={user.profileImage || undefined} />
              <AvatarFallback className="text-2xl">
                {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-semibold mb-1 font-['Roboto']">
              {user.name || "User"}
            </h2>
            <p className="text-sm text-muted-foreground mb-4">{user.email}</p>
            {user.currentLevel && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Current Level</p>
                <p className="text-lg font-semibold font-['Roboto']">
                  {user.currentLevel.title}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Progress Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="font-['Roboto']">Progress Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Modules Completed</span>
                  <span>
                    {completedModules} / {totalModules}
                  </span>
                </div>
                <Progress
                  value={
                    totalModules > 0 ? (completedModules / totalModules) * 100 : 0
                  }
                  className="h-2"
                />
              </div>
              {user.currentLevel && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Current Level
                  </p>
                  <p className="text-lg font-semibold font-['Roboto']">
                    {user.currentLevel.title}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="font-['Roboto']">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/onboarding/level")}
            >
              Change Level
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/")}
            >
              Continue Learning
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Module Progress Table */}
      <Card>
        <CardHeader>
          <CardTitle className="font-['Roboto']">Module Progress</CardTitle>
        </CardHeader>
        <CardContent>
          {moduleProgress.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No progress yet. Start learning to see your progress here!
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-['Roboto']">Module</th>
                    <th className="text-left py-3 px-4 font-['Roboto']">Level</th>
                    <th className="text-left py-3 px-4 font-['Roboto']">Progress</th>
                    <th className="text-left py-3 px-4 font-['Roboto']">Status</th>
                    <th className="text-left py-3 px-4 font-['Roboto']">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {moduleProgress.map((mp) => (
                    <tr key={mp.id} className="border-b">
                      <td className="py-3 px-4">{mp.module.title}</td>
                      <td className="py-3 px-4">{mp.module.level.title}</td>
                      <td className="py-3 px-4">
                        <Progress value={mp.progress * 100} className="h-2 w-24" />
                      </td>
                      <td className="py-3 px-4">
                        {mp.completed ? (
                          <span className="text-green-600 dark:text-green-400">
                            Completed
                          </span>
                        ) : (
                          <span className="text-muted-foreground">In Progress</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            navigate(`/learn/${mp.module.level.id}/${mp.module.id}`)
                          }
                        >
                          {mp.completed ? "Review" : "Continue"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

