import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// Constants for progression logic (deterministic rules)
const PASSING_SCORE = 0.8; // 80%
const MASTERY_SCORE = 0.8; // 80%
const MIN_MODULE_SCORE = 0.6; // 60%

// GET /api/quiz?moduleId=... - Fetch quiz and questions for a module
router.get('/quiz', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const { moduleId } = req.query;

        if (!moduleId || typeof moduleId !== 'string') {
            return res.status(400).json({ error: 'moduleId query parameter is required' });
        }

        const quiz = await prisma.quiz.findFirst({
            where: { moduleId },
            include: {
                questions: {
                    orderBy: { order: 'asc' },
                },
                module: {
                    include: {
                        level: {
                            select: {
                                id: true,
                                title: true,
                                order: true,
                            },
                        },
                    },
                },
            },
        });

        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found for this module' });
        }

        // Return quiz without correct answers for security
        const quizResponse = {
            id: quiz.id,
            title: quiz.title,
            description: quiz.description,
            moduleId: quiz.moduleId,
            module: quiz.module,
            questions: quiz.questions.map(q => ({
                id: q.id,
                question: q.question,
                type: q.type,
                options: q.options,
                order: q.order,
                // Don't send correctAnswer to client
            })),
        };

        res.json(quizResponse);
    } catch (error) {
        console.error('Error fetching quiz:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/quiz/submit - Submit quiz answers and update progression
router.post('/quiz/submit', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const { quizId, moduleId, answers } = req.body;

        if (!quizId || !moduleId || !answers || !Array.isArray(answers)) {
            return res.status(400).json({ error: 'quizId, moduleId, and answers array are required' });
        }

        // Fetch quiz with questions
        const quiz = await prisma.quiz.findUnique({
            where: { id: quizId },
            include: {
                questions: {
                    orderBy: { order: 'asc' },
                },
                module: {
                    include: {
                        level: {
                            include: {
                                modules: {
                                    orderBy: { order: 'asc' },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }

        // Calculate score (deterministic logic)
        let correctCount = 0;
        const totalQuestions = quiz.questions.length;

        const answerResults = answers.map((userAnswer: any, index: number) => {
            const question = quiz.questions[index];
            if (!question) return { correct: false, questionId: null };

            const isCorrect = userAnswer.answer === question.correctAnswer;
            if (isCorrect) correctCount++;

            return {
                questionId: question.id,
                userAnswer: userAnswer.answer,
                correctAnswer: question.correctAnswer,
                correct: isCorrect,
            };
        });

        const score = totalQuestions > 0 ? correctCount / totalQuestions : 0;
        const passed = score >= PASSING_SCORE;

        // Record quiz attempt
        const attempt = await prisma.userQuizAttempt.create({
            data: {
                userId: req.user.id,
                quizId: quizId,
                score: score,
                answers: answerResults as any,
                completed: true,
                completedAt: new Date(),
            },
        });

        // Update module progress
        let moduleProgress = await prisma.userModuleProgress.findFirst({
            where: {
                userId: req.user.id,
                moduleId: moduleId,
            },
        });

        if (!moduleProgress) {
            moduleProgress = await prisma.userModuleProgress.create({
                data: {
                    userId: req.user.id,
                    moduleId: moduleId,
                    completed: passed,
                    progress: score,
                    completedAt: passed ? new Date() : null,
                },
            });
        } else {
            // Update existing progress
            const newProgress = Math.max(moduleProgress.progress, score);
            moduleProgress = await prisma.userModuleProgress.update({
                where: { id: moduleProgress.id },
                data: {
                    completed: passed || moduleProgress.completed,
                    progress: newProgress,
                    completedAt: (passed || moduleProgress.completed) && !moduleProgress.completedAt
                        ? new Date()
                        : moduleProgress.completedAt,
                },
            });
        }

        // Progression Logic: If passed (≥80%), unlock next module
        let nextModuleUnlocked = null;
        if (passed) {
            const currentModuleIndex = quiz.module.level.modules.findIndex(m => m.id === moduleId);
            const nextModule = quiz.module.level.modules[currentModuleIndex + 1];

            if (nextModule) {
                // Unlock next module in the same level
                const nextModuleProgress = await prisma.userModuleProgress.findUnique({
                    where: {
                        userId_moduleId: {
                            userId: req.user.id,
                            moduleId: nextModule.id,
                        },
                    },
                });

                if (!nextModuleProgress) {
                    await prisma.userModuleProgress.create({
                        data: {
                            userId: req.user.id,
                            moduleId: nextModule.id,
                            completed: false,
                            progress: 0,
                        },
                    });
                    nextModuleUnlocked = nextModule.id;
                }
            }
        }

        // Level Mastery Logic: Check if this is the final module of the level
        // 80/80/60 Rule: 
        // 1. Final module score ≥80% (checked by 'passed' variable)
        // 2. Average mastery score ≥80% (average of all module scores in level)
        // 3. No individual module score <60% (all modules must be ≥60%)
        const isFinalModule = quiz.module.order === quiz.module.level.modules.length;
        let levelPromoted = false;
        let newLevelUnlocked = null;

        if (isFinalModule && passed) {
            // Rule 1: Final module score ≥80% ✓ (ensured by 'passed' being true)

            // Get all modules in this level
            const allModulesInLevel = quiz.module.level.modules;

            // Get all user's module progress for this level (includes the current module we just updated)
            const allModuleProgress = await prisma.userModuleProgress.findMany({
                where: {
                    userId: req.user.id,
                    moduleId: {
                        in: allModulesInLevel.map(m => m.id),
                    },
                },
            });

            // Rule 2: Calculate mastery score (average of all module scores)
            const totalScore = allModuleProgress.reduce((sum, mp) => sum + mp.progress, 0);
            const masteryScore = allModuleProgress.length > 0
                ? totalScore / allModuleProgress.length
                : 0;

            // Rule 3: Check if all modules have at least 60% score
            const allModulesPassing = allModuleProgress.every(mp => mp.progress >= MIN_MODULE_SCORE);

            // All three rules must be satisfied for level mastery
            if (masteryScore >= MASTERY_SCORE && allModulesPassing) {
                // Update level status to completed
                let levelStatus = await prisma.userLevelStatus.findFirst({
                    where: {
                        userId: req.user.id,
                        levelId: quiz.module.level.id,
                    },
                });

                if (!levelStatus) {
                    levelStatus = await prisma.userLevelStatus.create({
                        data: {
                            userId: req.user.id,
                            levelId: quiz.module.level.id,
                            unlocked: true,
                            completed: true,
                            completedAt: new Date(),
                        },
                    });
                } else {
                    levelStatus = await prisma.userLevelStatus.update({
                        where: { id: levelStatus.id },
                        data: {
                            completed: true,
                            completedAt: new Date(),
                        },
                    });
                }

                // Unlock next level
                const nextLevel = await prisma.level.findFirst({
                    where: {
                        order: quiz.module.level.order + 1,
                    },
                });

                if (nextLevel) {
                    const nextLevelStatus = await prisma.userLevelStatus.findFirst({
                        where: {
                            userId: req.user.id,
                            levelId: nextLevel.id,
                        },
                    });

                    if (!nextLevelStatus) {
                        await prisma.userLevelStatus.create({
                            data: {
                                userId: req.user.id,
                                levelId: nextLevel.id,
                                unlocked: true,
                                completed: false,
                            },
                        });
                        newLevelUnlocked = nextLevel.id;
                        levelPromoted = true;
                    } else if (!nextLevelStatus.unlocked) {
                        await prisma.userLevelStatus.update({
                            where: { id: nextLevelStatus.id },
                            data: { unlocked: true },
                        });
                        newLevelUnlocked = nextLevel.id;
                        levelPromoted = true;
                    }
                }
            }
        }

        res.json({
            attemptId: attempt.id,
            score: score,
            passed: passed,
            correctCount,
            totalQuestions,
            nextModuleUnlocked,
            levelPromoted,
            newLevelUnlocked,
        });
    } catch (error) {
        console.error('Error submitting quiz:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/quiz/diagnostic - Initial assessment to assign starting level
router.post('/quiz/diagnostic', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const { answers } = req.body;

        if (!answers || !Array.isArray(answers)) {
            return res.status(400).json({ error: 'answers array is required' });
        }

        // Diagnostic logic: Simple scoring to determine starting level
        // This is a placeholder - you should implement actual diagnostic quiz questions
        // For now, we'll use a simple scoring system

        // Calculate score (0-1)
        const totalQuestions = answers.length;
        const correctAnswers = answers.filter((a: any) => a.correct === true).length;
        const diagnosticScore = totalQuestions > 0 ? correctAnswers / totalQuestions : 0;

        // Deterministic level assignment based on score
        let assignedLevel;
        if (diagnosticScore >= 0.8) {
            // Advanced level
            assignedLevel = await prisma.level.findFirst({
                where: { order: 3 }, // Advanced
            });
        } else if (diagnosticScore >= 0.5) {
            // Intermediate level
            assignedLevel = await prisma.level.findFirst({
                where: { order: 2 }, // Intermediate
            });
        } else {
            // Beginner level
            assignedLevel = await prisma.level.findFirst({
                where: { order: 1 }, // Beginner
            });
        }

        if (!assignedLevel) {
            return res.status(404).json({ error: 'Level not found' });
        }

        // Create or update user level status
        let levelStatus = await prisma.userLevelStatus.findFirst({
            where: {
                userId: req.user.id,
                levelId: assignedLevel.id,
            },
        });

        if (!levelStatus) {
            levelStatus = await prisma.userLevelStatus.create({
                data: {
                    userId: req.user.id,
                    levelId: assignedLevel.id,
                    unlocked: true,
                    completed: false,
                },
            });
        } else {
            levelStatus = await prisma.userLevelStatus.update({
                where: { id: levelStatus.id },
                data: { unlocked: true },
            });
        }

        // Unlock first module of assigned level
        const firstModule = await prisma.module.findFirst({
            where: {
                levelId: assignedLevel.id,
                order: 1,
            },
        });

        if (firstModule) {
            await prisma.userModuleProgress.upsert({
                where: {
                    userId_moduleId: {
                        userId: req.user.id,
                        moduleId: firstModule.id,
                    },
                },
                update: {},
                create: {
                    userId: req.user.id,
                    moduleId: firstModule.id,
                    completed: false,
                    progress: 0,
                },
            });
        }

        res.json({
            assignedLevel: {
                id: assignedLevel.id,
                title: assignedLevel.title,
                order: assignedLevel.order,
            },
            diagnosticScore,
            firstModuleUnlocked: firstModule?.id || null,
        });
    } catch (error) {
        console.error('Error processing diagnostic:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;

