import { Router } from 'express';
import learningRoutes from './learning.js';
import userRoutes from './user.js';
import quizRoutes from './quiz.js';

const router = Router();

// Learning & Content routes
router.use('/', learningRoutes);

// User routes
router.use('/user', userRoutes);

// Quiz routes
router.use('/quiz', quizRoutes);

// API info
router.get('/', (req, res) => {
    res.json({
        message: 'Rejap.ai API',
        endpoints: {
            learning: '/api/levels, /api/modules, /api/content',
            user: '/api/user/me, /api/user/progress',
            quiz: '/api/quiz, /api/quiz/submit, /api/quiz/diagnostic',
        },
    });
});

export default router;

