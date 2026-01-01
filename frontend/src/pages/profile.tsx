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
    <div className="container mx-auto px-4 py-8 sm:py-16 max-w-6xl">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4 font-['Roboto']">Profile</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
        {/* User Info Card */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg sm:text-xl font-['Roboto']">Your Profile</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center pt-4">
            <Avatar className="h-20 w-20 sm:h-24 sm:w-24 mb-4">
              <AvatarImage src={user.profileImage || undefined} />
              <AvatarFallback className="text-xl sm:text-2xl">
                {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-lg sm:text-xl font-semibold mb-1 font-['Roboto']">
              {user.name || "User"}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mb-4 break-all text-center px-2">{user.email}</p>
            {user.currentLevel && (
              <div className="text-center">
                <p className="text-[10px] sm:text-sm text-muted-foreground uppercase tracking-wider">Current Level</p>
                <p className="text-base sm:text-lg font-semibold font-['Roboto']">
                  {user.currentLevel.title}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Progress Summary */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg sm:text-xl font-['Roboto']">Progress Summary</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-xs sm:text-sm mb-2 font-medium">
                  <span>Modules Completed</span>
                  <span>
                    {completedModules} / {totalModules}
                  </span>
                </div>
                <Progress
                  value={
                    totalModules > 0 ? (completedModules / totalModules) * 100 : 0
                  }
                  className="h-2.5"
                />
              </div>
              {user.currentLevel && (
                <div>
                  <p className="text-[10px] sm:text-sm text-muted-foreground uppercase tracking-wider mb-1">
                    Current Level
                  </p>
                  <p className="text-base sm:text-lg font-semibold font-['Roboto']">
                    {user.currentLevel.title}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg sm:text-xl font-['Roboto']">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            <Button
              variant="outline"
              className="w-full py-6 text-base"
              onClick={() => navigate("/onboarding/level")}
            >
              Change Level
            </Button>
            <Button
              className="w-full py-6 text-base"
              onClick={() => navigate("/learning-path")}
            >
              Continue Learning
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Module Progress Table */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg sm:text-xl font-['Roboto']">Module Progress</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {moduleProgress.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">
              No progress yet. Start learning to see your progress here!
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm sm:text-base">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left py-4 px-4 sm:px-6 font-semibold font-['Roboto']">Module</th>
                    <th className="text-left py-4 px-4 sm:px-6 font-semibold font-['Roboto'] hidden sm:table-cell">Level</th>
                    <th className="text-left py-4 px-4 sm:px-6 font-semibold font-['Roboto']">Progress</th>
                    <th className="text-left py-4 px-4 sm:px-6 font-semibold font-['Roboto'] hidden md:table-cell">Status</th>
                    <th className="text-right py-4 px-4 sm:px-6 font-semibold font-['Roboto']">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {moduleProgress.map((mp) => (
                    <tr key={mp.id} className="hover:bg-muted/10 transition-colors">
                      <td className="py-4 px-4 sm:px-6">
                        <div className="font-medium">{mp.module.title}</div>
                        <div className="text-xs text-muted-foreground sm:hidden mt-1">{mp.module.level.title}</div>
                      </td>
                      <td className="py-4 px-4 sm:px-6 hidden sm:table-cell">{mp.module.level.title}</td>
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <Progress value={mp.progress * 100} className="h-2 w-16 sm:w-24" />
                          <span className="text-xs font-medium hidden sm:inline">{Math.round(mp.progress * 100)}%</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 sm:px-6 hidden md:table-cell">
                        {mp.completed ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                            In Progress
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-primary hover:text-primary hover:bg-primary/10"
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

