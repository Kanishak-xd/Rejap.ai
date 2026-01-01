import { useState, useEffect } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import {
    ChevronDown,
    ChevronRight,
    ChevronLeft,
    Lock,
    CheckCircle2,
    PlayCircle,
    BookOpen,
    Trophy
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from '@/components/ui/button';

interface Quiz {
    id: string;
    title: string;
}

interface Module {
    id: string;
    title: string;
    order: number;
    quizzes: Quiz[];
}

interface Level {
    id: string;
    title: string;
    order: number;
    modules: Module[];
}

interface UserProgress {
    moduleProgress: Array<{
        moduleId: string;
        completed: boolean;
        progress: number;
        unlocked: boolean;
    }>;
    levelStatus: Array<{
        levelId: string;
        unlocked: boolean;
        completed: boolean;
    }>;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function LearningSidebar() {
    const { level: levelParam, module: moduleParam } = useParams();
    const location = useLocation();
    const [levels, setLevels] = useState<Level[]>([]);
    const [progress, setProgress] = useState<UserProgress | null>(null);
    const [expandedLevels, setExpandedLevels] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [pathRes, progressRes] = await Promise.all([
                    fetch(`${API_BASE}/learning/path`),
                    fetch(`${API_BASE}/user/progress`, { credentials: 'include' })
                ]);

                if (pathRes.ok && progressRes.ok) {
                    const pathData = await pathRes.json();
                    const progressData = await progressRes.json();
                    setLevels(pathData);
                    setProgress(progressData);

                    // Expand current level by default
                    const currentLevel = pathData.find((l: Level) => l.title.toLowerCase() === levelParam?.toLowerCase());
                    if (currentLevel) {
                        setExpandedLevels(prev => ({ ...prev, [currentLevel.id]: true }));
                    }
                }
            } catch (error) {
                console.error('Error fetching sidebar data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [levelParam]);

    const toggleLevel = (levelId: string) => {
        setExpandedLevels(prev => ({ ...prev, [levelId]: !prev[levelId] }));
    };

    const isLevelUnlocked = (levelId: string) => {
        if (!progress) return false;

        const status = progress.levelStatus.find(s => s.levelId === levelId);
        if (status) return status.unlocked;

        const firstLevel = levels[0];
        return firstLevel?.id === levelId;
    };

    const isModuleUnlocked = (moduleId: string, levelId: string) => {
        if (!progress) return false;

        const moduleProgress = progress.moduleProgress.find(p => p.moduleId === moduleId);
        if (moduleProgress?.unlocked) return true;

        if (!isLevelUnlocked(levelId)) return false;

        const level = levels.find(l => l.id === levelId);
        if (!level) return false;

        const module = level.modules.find(m => m.id === moduleId);
        if (!module) return false;

        if (module.order === 1) return true;

        const prevModule = level.modules.find(m => m.order === module.order - 1);
        if (!prevModule) return true;

        const prevProgress = progress.moduleProgress.find(p => p.moduleId === prevModule.id);
        return prevProgress?.completed || false;
    };

    const getModuleProgress = (moduleId: string) => {
        const p = progress?.moduleProgress.find(mp => mp.moduleId === moduleId);
        return p ? p.progress * 100 : 0;
    };

    const isModuleCompleted = (moduleId: string) => {
        return progress?.moduleProgress.find(mp => mp.moduleId === moduleId)?.completed || false;
    };

    if (loading) {
        return <div className="p-4 text-sm text-muted-foreground">Loading path...</div>;
    }

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-card">
            <div className="p-4 border-b space-y-2">
                <Link
                    to="/learning-path"
                    className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary transition-colors mb-2"
                >
                    <ChevronLeft className="w-3 h-3" />
                    BACK TO HUB
                </Link>
                <h2 className="font-semibold flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Learning Path
                </h2>
            </div>

            <div className="py-2 flex-1 overflow-y-auto">
                {levels.map((level) => {
                    const unlocked = isLevelUnlocked(level.id);
                    const expanded = expandedLevels[level.id];

                    return (
                        <div key={level.id} className="mb-1">
                            <button
                                onClick={() => unlocked && toggleLevel(level.id)}
                                className={cn(
                                    "w-full flex items-center justify-between px-4 py-2 text-sm font-medium transition-colors hover:bg-accent",
                                    !unlocked && "opacity-50 cursor-not-allowed",
                                    expanded && "bg-accent/50"
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    {unlocked ? (
                                        expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
                                    ) : (
                                        <Lock className="w-4 h-4" />
                                    )}
                                    <span>{level.title}</span>
                                </div>
                                {progress?.levelStatus.find(s => s.levelId === level.id)?.completed && (
                                    <Trophy className="w-4 h-4 text-yellow-500" />
                                )}
                            </button>

                            {unlocked && expanded && (
                                <div className="ml-4 border-l">
                                    {level.modules.map((module) => {
                                        const moduleUnlocked = isModuleUnlocked(module.id, level.id);
                                        const completed = isModuleCompleted(module.id);
                                        const isActive = moduleParam === module.id;
                                        const moduleProgress = getModuleProgress(module.id);

                                        return (
                                            <div key={module.id} className="relative">
                                                <Link
                                                    to={moduleUnlocked ? `/learn/${level.title.toLowerCase()}/${module.id}` : '#'}
                                                    className={cn(
                                                        "flex flex-col px-4 py-2 text-sm transition-colors hover:bg-accent",
                                                        !moduleUnlocked && "opacity-50 cursor-not-allowed",
                                                        isActive && "bg-accent text-accent-foreground font-semibold border-r-2 border-primary"
                                                    )}
                                                    onClick={(e) => {
                                                        if (!moduleUnlocked) {
                                                            e.preventDefault();
                                                            window.dispatchEvent(new CustomEvent('show-locked-module', {
                                                                detail: { moduleTitle: module.title, levelTitle: level.title }
                                                            }));
                                                        }
                                                    }}
                                                >
                                                    <div className="flex items-center justify-between mb-1">
                                                        <div className="flex items-center gap-2">
                                                            {completed ? (
                                                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                            ) : moduleUnlocked ? (
                                                                <PlayCircle className="w-4 h-4 text-primary" />
                                                            ) : (
                                                                <Lock className="w-4 h-4" />
                                                            )}
                                                            <span className="truncate max-w-[140px]">{module.title}</span>
                                                        </div>
                                                    </div>
                                                    {moduleUnlocked && (
                                                        <Progress value={moduleProgress} className="h-1" />
                                                    )}
                                                </Link>

                                                {moduleUnlocked && module.quizzes.length > 0 && (
                                                    <Link
                                                        to={`/quiz/${level.title.toLowerCase()}/${module.id}`}
                                                        className={cn(
                                                            "flex items-center gap-2 ml-8 px-4 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors",
                                                            location.pathname.includes(`/quiz/${level.title.toLowerCase()}/${module.id}`) && "text-primary font-medium"
                                                        )}
                                                    >
                                                        <Trophy className="w-3 h-3" />
                                                        Quiz
                                                    </Link>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <div className="w-64 border-r bg-card h-[calc(100vh-3.5rem)] sticky top-14 overflow-hidden hidden md:block">
                <SidebarContent />
            </div>

            {/* Mobile Sidebar Trigger */}
            <div className="md:hidden fixed bottom-6 right-6 z-40">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button size="icon" className="h-14 w-14 rounded-full shadow-2xl bg-primary text-primary-foreground">
                            <BookOpen className="h-6 w-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-72">
                        <SheetHeader className="sr-only">
                            <SheetTitle>Learning Path</SheetTitle>
                        </SheetHeader>
                        <SidebarContent />
                    </SheetContent>
                </Sheet>
            </div>
        </>
    );
}
