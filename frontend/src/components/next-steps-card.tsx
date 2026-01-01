import { Link } from 'react-router-dom';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    CheckCircle2,
    XCircle,
    ArrowRight,
    RotateCcw,
    BookOpen,
    Trophy,
    Sparkles
} from "lucide-react";

interface NextStepsCardProps {
    passed: boolean;
    score: number;
    correctCount: number;
    totalQuestions: number;
    aiRecommendation: string;
    nextModule: { id: string; title: string } | null;
    levelPromoted: boolean;
    level: string;
    moduleId: string;
    onRetry: () => void;
}

export default function NextStepsCard({
    passed,
    score,
    correctCount,
    totalQuestions,
    aiRecommendation,
    nextModule,
    levelPromoted,
    level,
    moduleId,
    onRetry
}: NextStepsCardProps) {
    const percentage = Math.round(score * 100);

    return (
        <Card className="mt-8 border-2 shadow-lg overflow-hidden">
            <div className={cn(
                "h-2 w-full",
                passed ? "bg-green-500" : "bg-orange-500"
            )} />

            <CardHeader className="pb-4 pt-6 sm:pt-8 px-4 sm:px-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                        {passed ? (
                            <>
                                <CheckCircle2 className="w-6 h-6 sm:w-8 h-8 text-green-500" />
                                Quiz Passed!
                            </>
                        ) : (
                            <>
                                <XCircle className="w-6 h-6 sm:w-8 h-8 text-orange-500" />
                                Keep Practicing!
                            </>
                        )}
                    </CardTitle>
                    <div className="flex items-baseline gap-2 sm:block sm:text-right">
                        <div className="text-2xl sm:text-3xl font-bold">{percentage}%</div>
                        <div className="text-xs sm:text-sm text-muted-foreground">{correctCount} / {totalQuestions} Correct</div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* AI Recommendation Section */}
                <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 sm:p-5 relative">
                    <Sparkles className="w-4 h-4 sm:w-5 h-5 text-primary absolute -top-2 -left-2 bg-background rounded-full p-0.5" />
                    <h4 className="text-xs sm:text-sm font-semibold text-primary mb-2 flex items-center gap-2">
                        AI Learning Coach Recommendation
                    </h4>
                    <p className="text-xs sm:text-sm leading-relaxed italic">
                        "{aiRecommendation}"
                    </p>
                </div>

                {/* Dynamic Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {levelPromoted ? (
                        <Button asChild size="lg" className="w-full gap-2 bg-yellow-600 hover:bg-yellow-700 py-6 text-base sm:text-lg">
                            <Link to="/level-complete">
                                <Trophy className="w-4 h-4" />
                                View Level Mastery
                            </Link>
                        </Button>
                    ) : passed && nextModule ? (
                        <Button asChild size="lg" className="w-full gap-2 py-6 text-base sm:text-lg">
                            <Link to={`/learn/${level}/${nextModule.id}`}>
                                Next: {nextModule.title}
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </Button>
                    ) : (
                        <Button onClick={onRetry} size="lg" className="w-full gap-2 py-6 text-base sm:text-lg">
                            <RotateCcw className="w-4 h-4" />
                            Retry Quiz
                        </Button>
                    )}

                    <Button asChild variant="outline" size="lg" className="w-full gap-2 py-6 text-base sm:text-lg">
                        <Link to={`/learn/${level}/${moduleId}`}>
                            <BookOpen className="w-4 h-4" />
                            Review Lesson
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

// Helper function for conditional classes
function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}
