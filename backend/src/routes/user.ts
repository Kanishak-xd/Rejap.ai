import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// GET /api/user/me - Return authenticated user's profile and current assigned level
router.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            include: {
                levelStatus: {
                    include: {
                        level: true,
                    },
                    orderBy: {
                        level: {
                            order: 'asc',
                        },
                    },
                },
            },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Find current assigned level (the highest unlocked level)
        // If levelStatus is empty array, currentLevel will be null (new user state)
        const currentLevel = user.levelStatus.length === 0 
            ? null 
            : user.levelStatus
                .filter(status => status.unlocked)
                .sort((a, b) => b.level.order - a.level.order)[0]?.level || null;

        res.json({
            id: user.id,
            email: user.email,
            name: user.name,
            profileImage: user.profileImage,
            currentLevel: currentLevel ? {
                id: currentLevel.id,
                title: currentLevel.title,
                order: currentLevel.order,
            } : null,
            levelStatus: user.levelStatus,
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/user/progress - Fetch user's module progress and level status
router.get('/progress', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const moduleProgress = await prisma.userModuleProgress.findMany({
            where: { userId: req.user.id },
            include: {
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
            orderBy: {
                module: {
                    level: {
                        order: 'asc',
                    },
                },
            },
        });

        const levelStatus = await prisma.userLevelStatus.findMany({
            where: { userId: req.user.id },
            include: {
                level: true,
            },
            orderBy: {
                level: {
                    order: 'asc',
                },
            },
        });

        res.json({
            moduleProgress,
            levelStatus,
        });
    } catch (error) {
        console.error('Error fetching user progress:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;

