import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
    Lock,
    CheckCircle2,
    PlayCircle,
    Trophy,
    BookOpen,
    Sparkles,
    ArrowRight
} from "lucide-react"
import { cn } from "@/lib/utils"

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api"

interface Module {
    id: string
    title: string
    description: string | null
    order: number
    unlocked: boolean
    completed: boolean
    score: number
}

interface Level {
    id: string
    title: string
    description: string | null
    order: number
    modules: Module[]
    unlocked: boolean
    completed: boolean
    progress: number
}

export default function LearningPath() {
    const [levels, setLevels] = useState<Level[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [pathRes, progressRes] = await Promise.all([
                fetch(`${API_BASE}/learning/path`, { credentials: "include" }),
                fetch(`${API_BASE}/user/progress`, { credentials: "include" })
            ])

            if (pathRes.ok && progressRes.ok) {
                const pathData = await pathRes.json()
                const progressData = await progressRes.json()

                // Merge path data with user progress
                const mergedLevels = pathData.map((level: any) => {
                    const levelStatus = progressData.levelStatus.find((ls: any) => ls.levelId === level.id)
                    const levelUnlocked = levelStatus?.unlocked || level.order === 1
                    const levelCompleted = levelStatus?.completed || false

                    const mergedModules = level.modules.map((module: any) => {
                        const moduleProgress = progressData.moduleProgress.find((mp: any) => mp.moduleId === module.id)
                        return {
                            ...module,
                            unlocked: moduleProgress?.unlocked || (levelUnlocked && module.order === 1),
                            completed: moduleProgress?.completed || false,
                            score: moduleProgress?.progress || 0
                        }
                    })

                    const completedModules = mergedModules.filter((m: any) => m.completed).length
                    const progress = mergedModules.length > 0 ? (completedModules / mergedModules.length) * 100 : 0

                    return {
                        ...level,
                        modules: mergedModules,
                        unlocked: levelUnlocked,
                        completed: levelCompleted,
                        progress
                    }
                })

                setLevels(mergedLevels)
            }
        } catch (error) {
            console.error("Failed to fetch learning path data:", error)
        } finally {
            setLoading(false)
        }
    }

    // Find the next module to suggest
    const getContinueModule = () => {
        for (const level of levels) {
            if (level.unlocked) {
                for (const module of level.modules) {
                    if (module.unlocked && !module.completed) {
                        return { level, module }
                    }
                }
            }
        }
        return null
    }

    const continueData = getContinueModule()

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading your learning path...</p>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8 sm:py-12 max-w-5xl">
            <div className="mb-8 lg:mb-12">
                <h1 className="text-3xl sm:text-4xl font-bold mb-2 font-['Roboto']">My Learning Path</h1>
                <p className="text-sm sm:text-base text-muted-foreground">Track your progress and continue your Japanese journey.</p>
            </div>

            {/* Continue Learning Section */}
            {continueData ? (
                <Card className="mb-12 border-2 border-primary/20 bg-primary/5 shadow-lg overflow-hidden">
                    <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row">
                            <div className="p-6 sm:p-8 flex-1">
                                <div className="flex items-center gap-2 text-primary font-bold mb-3 sm:mb-4">
                                    <Sparkles className="w-4 h-4 sm:w-5 h-5" />
                                    <span className="text-xs sm:text-sm tracking-wider uppercase">CONTINUE WHERE YOU LEFT OFF</span>
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-bold mb-2">{continueData.module.title}</h2>
                                <p className="text-sm sm:text-base text-muted-foreground mb-6">
                                    Next step in your {continueData.level.title} journey. You're doing great!
                                </p>
                                <Button asChild size="lg" className="w-full sm:w-auto rounded-xl px-8 py-6 text-lg font-bold shadow-md">
                                    <Link to={`/learn/${continueData.level.id}/${continueData.module.id}`}>
                                        Start Lesson
                                        <PlayCircle className="ml-2 w-5 h-5" />
                                    </Link>
                                </Button>
                            </div>
                            <div className="bg-primary/10 p-6 sm:p-8 md:w-72 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-primary/10">
                                <div className="text-center">
                                    <p className="text-xs font-bold text-muted-foreground mb-3 sm:mb-4 uppercase tracking-wider">LEVEL PROGRESS</p>
                                    <div className="relative w-20 h-20 sm:w-24 h-24 flex items-center justify-center mb-2 mx-auto">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle
                                                cx="40"
                                                cy="40"
                                                r="34"
                                                stroke="currentColor"
                                                strokeWidth="6"
                                                fill="transparent"
                                                className="text-muted/20 sm:hidden"
                                            />
                                            <circle
                                                cx="48"
                                                cy="48"
                                                r="40"
                                                stroke="currentColor"
                                                strokeWidth="8"
                                                fill="transparent"
                                                className="text-muted/20 hidden sm:block"
                                            />
                                            <circle
                                                cx="40"
                                                cy="40"
                                                r="34"
                                                stroke="currentColor"
                                                strokeWidth="6"
                                                fill="transparent"
                                                strokeDasharray={213.6}
                                                strokeDashoffset={213.6 - (213.6 * continueData.level.progress) / 100}
                                                className="text-primary transition-all duration-1000 sm:hidden"
                                            />
                                            <circle
                                                cx="48"
                                                cy="48"
                                                r="40"
                                                stroke="currentColor"
                                                strokeWidth="8"
                                                fill="transparent"
                                                strokeDasharray={251.2}
                                                strokeDashoffset={251.2 - (251.2 * continueData.level.progress) / 100}
                                                className="text-primary transition-all duration-1000 hidden sm:block"
                                            />
                                        </svg>
                                        <span className="absolute text-lg sm:text-xl font-bold">{Math.round(continueData.level.progress)}%</span>
                                    </div>
                                    <p className="text-xs font-medium text-muted-foreground">{continueData.level.title}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <Card className="mb-12 border-2 border-green-500/20 bg-green-500/5 p-6 sm:p-8 text-center">
                    <Trophy className="w-12 h-12 sm:w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h2 className="text-xl sm:text-2xl font-bold mb-2">All Caught Up!</h2>
                    <p className="text-sm sm:text-base text-muted-foreground">You've completed all available modules. Great job!</p>
                </Card>
            )}

            {/* Levels and Modules Grid */}
            <div className="space-y-12">
                {levels.map((level) => (
                    <div key={level.id} className={cn("space-y-6", !level.unlocked && "opacity-60")}>
                        <div className="flex items-center justify-between border-b pb-4">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className={cn(
                                    "w-10 h-10 sm:w-12 h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-sm shrink-0",
                                    level.unlocked ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                )}>
                                    {level.unlocked ? <BookOpen className="w-5 h-5 sm:w-6 h-6" /> : <Lock className="w-5 h-5 sm:w-6 h-6" />}
                                </div>
                                <div>
                                    <h3 className="text-xl sm:text-2xl font-bold font-['Roboto'] flex items-center gap-2">
                                        {level.title}
                                        {level.completed && <CheckCircle2 className="w-4 h-4 sm:w-5 h-5 text-green-500" />}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-muted-foreground">{level.description}</p>
                                </div>
                            </div>
                            {level.unlocked && (
                                <div className="text-right hidden sm:block">
                                    <p className="text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-wider">MASTERY</p>
                                    <p className="text-lg font-bold">{Math.round(level.progress)}%</p>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            {level.modules.map((module) => (
                                <Card
                                    key={module.id}
                                    className={cn(
                                        "group transition-all border-2",
                                        module.unlocked ? "hover:border-primary/50 hover:shadow-md" : "bg-muted/30 border-transparent"
                                    )}
                                >
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">MODULE {module.order}</span>
                                            {module.completed ? (
                                                <CheckCircle2 className="w-4 h-4 sm:w-5 h-5 text-green-500" />
                                            ) : !module.unlocked ? (
                                                <Lock className="w-3.5 h-3.5 sm:w-4 h-4 text-muted-foreground" />
                                            ) : null}
                                        </div>
                                        <CardTitle className="text-base sm:text-lg group-hover:text-primary transition-colors">
                                            {module.title}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-4 min-h-[2.5rem]">
                                            {module.description || "Master the fundamentals of this topic."}
                                        </p>

                                        {module.unlocked ? (
                                            <div className="space-y-4">
                                                {module.completed && (
                                                    <div className="space-y-1">
                                                        <div className="flex justify-between text-[10px] font-bold text-muted-foreground">
                                                            <span>SCORE</span>
                                                            <span>{Math.round(module.score * 100)}%</span>
                                                        </div>
                                                        <Progress value={module.score * 100} className="h-1" />
                                                    </div>
                                                )}
                                                <Button asChild variant={module.completed ? "outline" : "default"} className="w-full rounded-xl font-bold">
                                                    <Link to={`/learn/${level.id}/${module.id}`}>
                                                        {module.completed ? "Review Lesson" : "Start Lesson"}
                                                        <ArrowRight className="ml-2 w-4 h-4" />
                                                    </Link>
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button disabled className="w-full rounded-xl font-bold bg-muted text-muted-foreground border-none">
                                                Locked
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
