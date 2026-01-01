import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Trophy,
    ArrowRight,
    Star,
    Award,
    PartyPopper
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function LevelComplete() {
    const [loading, setLoading] = useState(true);
    const [levelStatus, setLevelStatus] = useState<any>(null);
    const [nextLevel, setNextLevel] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [progressRes, pathRes] = await Promise.all([
                    fetch(`${API_BASE}/user/progress`, { credentials: 'include' }),
                    fetch(`${API_BASE}/learning/path`)
                ]);

                if (progressRes.ok && pathRes.ok) {
                    const progressData = await progressRes.json();
                    const pathData = await pathRes.json();

                    // Find the most recently completed level
                    const completedLevel = progressData.levelStatus.find((s: any) => s.completed);
                    if (completedLevel) {
                        const levelInfo = pathData.find((l: any) => l.id === completedLevel.levelId);
                        setLevelStatus({ ...completedLevel, ...levelInfo });

                        // Find next level
                        const next = pathData.find((l: any) => l.order === levelInfo.order + 1);
                        setNextLevel(next);
                    }
                }
            } catch (error) {
                console.error('Error fetching completion data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">Loading celebration...</div>;
    }

    if (!levelStatus) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h2 className="text-2xl font-bold mb-4">No level completion found.</h2>
                <Button asChild>
                    <Link to="/">Back to Home</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 sm:py-16 max-w-2xl text-center">
            <div className="mb-6 sm:mb-8 animate-bounce">
                <div className="inline-block bg-yellow-100 p-4 sm:p-6 rounded-full">
                    <Trophy className="w-16 h-16 sm:w-20 h-20 text-yellow-600" />
                </div>
            </div>

            <h1 className="text-4xl sm:text-5xl font-black mb-4 bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                Level Mastered!
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground mb-8 sm:mb-12 px-4">
                Congratulations! You've successfully completed the <strong>{levelStatus.title}</strong> level.
            </p>

            <Card className="mb-12 border-2 shadow-xl overflow-hidden">
                <CardHeader className="bg-primary/5 border-b">
                    <CardTitle className="flex items-center justify-center gap-2">
                        <Award className="w-5 h-5 text-primary" />
                        Level Mastery Stats
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 sm:pt-8 space-y-6 sm:space-y-8 px-4 sm:px-6">
                    <div className="grid grid-cols-2 gap-4 sm:gap-8">
                        <div className="space-y-1 sm:space-y-2">
                            <div className="text-3xl sm:text-4xl font-black text-primary">100%</div>
                            <div className="text-[10px] sm:text-sm font-medium text-muted-foreground uppercase tracking-wider">Completion</div>
                        </div>
                        <div className="space-y-1 sm:space-y-2">
                            <div className="text-3xl sm:text-4xl font-black text-green-600">80%+</div>
                            <div className="text-[10px] sm:text-sm font-medium text-muted-foreground uppercase tracking-wider">Average Score</div>
                        </div>
                    </div>

                    <div className="space-y-3 sm:space-y-4">
                        <div className="flex justify-between text-xs sm:text-sm font-bold">
                            <span>Overall Progress</span>
                            <span>Level {levelStatus.order} Complete</span>
                        </div>
                        <Progress value={100} className="h-3 sm:h-4 rounded-full" />
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 py-2 sm:py-4">
                        <div className="flex -space-x-2">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="w-8 h-8 sm:w-10 h-10 rounded-full bg-yellow-400 border-2 border-white flex items-center justify-center shadow-sm">
                                    <Star className="w-4 h-4 sm:w-5 h-5 text-white fill-current" />
                                </div>
                            ))}
                        </div>
                        <span className="font-bold text-sm sm:text-base text-yellow-700">Perfect Mastery!</span>
                    </div>
                </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                {nextLevel ? (
                    <Button asChild size="lg" className="w-full sm:w-auto px-8 sm:px-12 py-6 sm:py-8 text-lg sm:text-xl font-bold rounded-2xl shadow-xl hover:scale-105 transition-transform gap-3">
                        <Link to={`/learn/${nextLevel.title.toLowerCase()}/${nextLevel.modules[0].id}`}>
                            Start {nextLevel.title}
                            <ArrowRight className="w-5 h-5 sm:w-6 h-6" />
                        </Link>
                    </Button>
                ) : (
                    <Button asChild size="lg" className="w-full sm:w-auto px-8 sm:px-12 py-6 sm:py-8 text-lg sm:text-xl font-bold rounded-2xl shadow-xl hover:scale-105 transition-transform gap-3">
                        <Link to="/profile">
                            View My Achievements
                            <PartyPopper className="w-5 h-5 sm:w-6 h-6" />
                        </Link>
                    </Button>
                )}

                <Button asChild variant="outline" size="lg" className="w-full sm:w-auto px-8 sm:px-12 py-6 sm:py-8 text-lg sm:text-xl font-bold rounded-2xl border-2">
                    <Link to="/">Back to Home</Link>
                </Button>
            </div>
        </div>
    );
}
