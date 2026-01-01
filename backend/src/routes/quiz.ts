import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import type { Prisma } from '@prisma/client';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { generateQuizQuestions, explainAnswer, analyzePerformance, recommendNextSteps } from '../lib/ai.js';

const router = Router();
const prisma = new PrismaClient();

// Constants for progression logic (deterministic rules)
const PASSING_SCORE = 0.8; // 80%
const MASTERY_SCORE = 0.8; // 80%
const MIN_MODULE_SCORE = 0.6; // 60%

// GET /api/quiz?moduleId=... - Fetch quiz and questions for a module
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const { moduleId } = req.query;

        if (!moduleId || typeof moduleId !== 'string') {
            return res.status(400).json({ error: 'moduleId query parameter is required' });
        }

        let quiz = await prisma.quiz.findFirst({
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

        // If quiz has no questions, generate them using AI
        if (quiz.questions.length === 0) {
            try {
                // Get module content for AI generation
                const contentItems = await prisma.contentItem.findMany({
                    where: { moduleId },
                    orderBy: { order: 'asc' },
                });

                const allowedContent = contentItems.map(item => `${item.title}: ${item.content}`);

                // Generate questions using AI
                const aiQuestions = await generateQuizQuestions(
                    quiz.module.level.title,
                    quiz.module.title,
                    allowedContent
                );

                // Try to insert questions, but handle race condition gracefully
                // If another request already inserted questions, we'll get a unique constraint error
                try {
                    // Store generated questions in database
                    for (let i = 0; i < aiQuestions.length; i++) {
                        const q = aiQuestions[i];
                        await prisma.quizQuestion.create({
                            data: {
                                quizId: quiz.id,
                                question: q.question_text,
                                type: 'multiple_choice',
                                options: q.options,
                                correctAnswer: q.correct_answer,
                                order: i + 1,
                            },
                        });
                    }
                } catch (insertError: any) {
                    // If we get a unique constraint error, it means another request already created the questions
                    // This is fine - we'll just use those questions instead
                    if (insertError.code === 'P2002') {
                        console.log('Questions already created by another request, using existing questions');
                    } else {
                        // If it's a different error, rethrow it
                        throw insertError;
                    }
                }

                // Reload quiz with new questions
                const updatedQuiz = await prisma.quiz.findUnique({
                    where: { id: quiz.id },
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

                if (!updatedQuiz) {
                    return res.status(500).json({ error: 'Failed to generate quiz questions' });
                }

                quiz = updatedQuiz;
            } catch (error) {
                console.error('Error generating quiz questions:', error);
                return res.status(500).json({ error: 'Failed to generate quiz questions' });
            }
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
router.post('/submit', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
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

        // Get module content for AI feedback
        const contentItems = await prisma.contentItem.findMany({
            where: { moduleId },
            orderBy: { order: 'asc' },
        });
        const allowedContent = contentItems.map(item => `${item.title}: ${item.content}`);

        // Store individual answers and generate AI feedback for incorrect answers
        const resultsWithFeedback = [];
        for (let i = 0; i < answerResults.length; i++) {
            const result = answerResults[i];
            if (!result.questionId) continue;

            const question = quiz.questions[i];
            if (!question) continue;

            // Store user answer in database
            const userAnswerRecord = await prisma.userAnswer.create({
                data: {
                    attemptId: attempt.id,
                    questionId: result.questionId,
                    userAnswer: result.userAnswer,
                    isCorrect: result.correct,
                },
            });

            let feedbackText = null;

            // Generate AI feedback for incorrect answers
            if (!result.correct) {
                try {
                    const explanation = await explainAnswer(
                        quiz.module.level.title,
                        question.question,
                        result.userAnswer,
                        result.correctAnswer,
                        allowedContent
                    );

                    // Store AI feedback
                    const aiFeedback = await prisma.aiFeedback.create({
                        data: {
                            answerId: userAnswerRecord.id,
                            feedback: explanation,
                            explanation: `The correct answer is: ${result.correctAnswer}`,
                        },
                    });

                    // Link feedback to user answer
                    await prisma.userAnswer.update({
                        where: { id: userAnswerRecord.id },
                        data: { aiFeedbackId: aiFeedback.id },
                    });

                    feedbackText = explanation;
                } catch (error) {
                    console.error('Error generating AI feedback:', error);
                    // Continue even if AI feedback fails
                }
            }

            // Add result with feedback to response array
            resultsWithFeedback.push({
                questionId: result.questionId,
                correct: result.correct,
                correctAnswer: result.correctAnswer,
                feedback: feedbackText,
            });
        }

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
                            unlocked: true,
                        },
                    });
                    nextModuleUnlocked = nextModule.id;
                } else if (!nextModuleProgress.unlocked) {
                    await prisma.userModuleProgress.update({
                        where: { id: nextModuleProgress.id },
                        data: { unlocked: true },
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

        // Generate AI recommendation
        let aiRecommendation = "Great job on completing the quiz! Keep practicing to master the material.";
        let weakAreas: string[] = [];

        try {
            // Get all module scores for the current level to provide context for AI
            const allModulesInLevel = quiz.module.level.modules;
            const allModuleProgress = await prisma.userModuleProgress.findMany({
                where: {
                    userId: req.user.id,
                    moduleId: { in: allModulesInLevel.map(m => m.id) },
                },
            });

            const scores = allModuleProgress.map(mp => ({
                module: allModulesInLevel.find(m => m.id === mp.moduleId)?.title || 'Unknown',
                score: mp.progress,
            }));

            const incorrectSummary = resultsWithFeedback
                .filter(r => !r.correct)
                .map(r => r.feedback)
                .join('\n');

            const analysis = await analyzePerformance(quiz.module.level.title, scores, incorrectSummary);
            weakAreas = analysis.weakAreas;
            aiRecommendation = await recommendNextSteps(quiz.module.level.title, "The student completed a quiz.", weakAreas);
        } catch (error) {
            console.error('Error generating AI recommendation:', error);
        }

        // Find next module details
        let nextModule = null;
        if (passed) {
            const currentModuleIndex = quiz.module.level.modules.findIndex(m => m.id === moduleId);
            const nextMod = quiz.module.level.modules[currentModuleIndex + 1];
            if (nextMod) {
                nextModule = {
                    id: nextMod.id,
                    title: nextMod.title,
                };
            }
        }

        res.json({
            attemptId: attempt.id,
            score: score,
            passed: passed,
            correctCount,
            totalQuestions,
            results: resultsWithFeedback,
            nextModuleUnlocked,
            levelPromoted,
            newLevelUnlocked,
            aiRecommendation,
            weakAreas,
            nextModule,
        });
    } catch (error) {
        console.error('Error submitting quiz:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/quiz/diagnostic - Get diagnostic questions from real dataset
router.get('/diagnostic', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
        // Fetch levels to identify Beginner, Intermediate, Advanced
        const levels = await prisma.level.findMany({
            orderBy: { order: 'asc' }
        });

        const beginnerLevel = levels.find(l => l.order === 1);
        const intermediateLevel = levels.find(l => l.order === 2);
        const advancedLevel = levels.find(l => l.order === 3);

        const getQuizzesForLevel = async (levelId: string | undefined, count: number) => {
            if (!levelId) return [];
            return await prisma.quiz.findMany({
                where: {
                    module: {
                        levelId: levelId
                    }
                },
                include: {
                    questions: true
                },
                take: 20 // Get a pool to randomize from
            });
        };

        const [bQuizzes, iQuizzes, aQuizzes] = await Promise.all([
            getQuizzesForLevel(beginnerLevel?.id, 3),
            getQuizzesForLevel(intermediateLevel?.id, 4),
            getQuizzesForLevel(advancedLevel?.id, 3)
        ]);

        let allQuestions: any[] = [];

        const addQuestionsFromQuizzes = (quizzes: any[], count: number) => {
            const shuffledQuizzes = quizzes.sort(() => 0.5 - Math.random());
            const selectedQuizzes = shuffledQuizzes.slice(0, count);

            for (const quiz of selectedQuizzes) {
                if (quiz.questions.length > 0) {
                    const randomQ = quiz.questions[Math.floor(Math.random() * quiz.questions.length)];
                    allQuestions.push({
                        id: randomQ.id,
                        question: randomQ.question,
                        options: [...(randomQ.options as string[]), 'Not sure']
                    });
                }
            }
        };

        addQuestionsFromQuizzes(bQuizzes, 3);
        addQuestionsFromQuizzes(iQuizzes, 4);
        addQuestionsFromQuizzes(aQuizzes, 3);

        // If we still have fewer than 10 questions (unlikely but possible), fill up
        if (allQuestions.length < 10) {
            const allAvailableQuizzes = [...bQuizzes, ...iQuizzes, ...aQuizzes];
            let quizIndex = 0;
            while (allQuestions.length < 10 && allAvailableQuizzes.length > 0) {
                const quiz = allAvailableQuizzes[quizIndex % allAvailableQuizzes.length];
                const extraQ = quiz.questions.find((q: any) => !allQuestions.some(aq => aq.id === q.id));
                if (extraQ) {
                    allQuestions.push({
                        id: extraQ.id,
                        question: extraQ.question,
                        options: [...(extraQ.options as string[]), 'Not sure']
                    });
                }
                quizIndex++;
                if (quizIndex > 100) break;
            }
        }

        res.json(allQuestions.slice(0, 10));
    } catch (error) {
        console.error('Error fetching diagnostic questions:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/quiz/diagnostic - Initial assessment to assign starting level
router.post('/diagnostic', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const { answers } = req.body;

        if (!answers || !Array.isArray(answers)) {
            return res.status(400).json({ error: 'answers array is required' });
        }

        // Fetch the questions from DB to verify answers
        const questionIds = answers.map((a: any) => a.questionId);
        const dbQuestions = await prisma.quizQuestion.findMany({
            where: { id: { in: questionIds } }
        });

        let correctCount = 0;
        answers.forEach((ans: any) => {
            const question = dbQuestions.find(q => q.id === ans.questionId);
            if (question && ans.answer === question.correctAnswer) {
                correctCount++;
            }
        });

        const score = correctCount / 10; // Based on 10 questions

        // Determine level based on score
        let assignedLevelOrder = 1; // Default Beginner
        if (score >= 0.8) {
            assignedLevelOrder = 3; // Advanced
        } else if (score >= 0.4) {
            assignedLevelOrder = 2; // Intermediate
        }

        const allLevels = await prisma.level.findMany({
            orderBy: { order: 'asc' }
        });

        const assignedLevel = allLevels.find(l => l.order === assignedLevelOrder);

        if (!assignedLevel) {
            return res.status(500).json({ error: 'Assigned level not found' });
        }

        // Update user's current level
        await prisma.user.update({
            where: { id: req.user.id },
            data: { currentLevelId: assignedLevel.id }
        });

        // UNLOCKING LOGIC: Unlock assigned level AND all previous levels
        const levelsToUnlock = allLevels.filter(l => l.order <= assignedLevelOrder);

        for (const level of levelsToUnlock) {
            // Initialize level status
            await prisma.userLevelStatus.upsert({
                where: {
                    userId_levelId: {
                        userId: req.user.id,
                        levelId: level.id
                    }
                },
                update: { unlocked: true },
                create: {
                    userId: req.user.id,
                    levelId: level.id,
                    completed: false,
                    unlocked: true
                }
            });

            // Initialize progress for all modules in these levels
            const modules = await prisma.module.findMany({
                where: { levelId: level.id },
                orderBy: { order: 'asc' }
            });

            for (const module of modules) {
                await prisma.userModuleProgress.upsert({
                    where: {
                        userId_moduleId: {
                            userId: req.user.id,
                            moduleId: module.id
                        }
                    },
                    update: { unlocked: true },
                    create: {
                        userId: req.user.id,
                        moduleId: module.id,
                        completed: false,
                        progress: 0,
                        unlocked: true // Unlock all modules in previous/current levels
                    }
                });
            }
        }

        res.json({
            score,
            correctCount,
            totalQuestions: 10,
            assignedLevel: assignedLevel.title,
            levelId: assignedLevel.id
        });
    } catch (error) {
        console.error('Error processing diagnostic quiz:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
