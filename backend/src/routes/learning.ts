import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// GET /api/levels - Return all levels
router.get('/levels', async (req: Request, res: Response) => {
    try {
        const levels = await prisma.level.findMany({
            orderBy: { order: 'asc' },
        });

        res.json(levels);
    } catch (error) {
        console.error('Error fetching levels:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/modules?levelId=... - Return modules for a specific level
router.get('/modules', async (req: Request, res: Response) => {
    try {
        const { levelId } = req.query;

        if (!levelId || typeof levelId !== 'string') {
            return res.status(400).json({ error: 'levelId query parameter is required' });
        }

        const modules = await prisma.module.findMany({
            where: { levelId },
            orderBy: { order: 'asc' },
            include: {
                level: {
                    select: {
                        id: true,
                        title: true,
                        order: true,
                    },
                },
            },
        });

        res.json(modules);
    } catch (error) {
        console.error('Error fetching modules:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/content?moduleId=... - Return content items for a module
router.get('/content', async (req: Request, res: Response) => {
    try {
        const { moduleId } = req.query;

        if (!moduleId || typeof moduleId !== 'string') {
            return res.status(400).json({ error: 'moduleId query parameter is required' });
        }

        const contentItems = await prisma.contentItem.findMany({
            where: { moduleId },
            orderBy: { order: 'asc' },
            include: {
                module: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
            },
        });

        res.json(contentItems);
    } catch (error) {
        console.error('Error fetching content:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;

