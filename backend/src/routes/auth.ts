import { Router, Request, Response } from 'express';
import { getSession } from '@auth/express';
import { auth, authConfig } from '../lib/auth.js';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Mount Auth.js routes - this handles all /auth/* endpoints (signin, callback, signout, etc.)
router.use('/auth', auth);

// Get current user endpoint
router.get('/me', async (req: Request, res: Response) => {
    try {
        // Get session from Auth.js
        const session = await getSession(req, authConfig);

        if (!session?.user?.email) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        // Get user with their level status (null if no entries exist)
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: {
                levelStatus: true,
            },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Return user data with level status (null if empty array = new user state)
        res.json({
            id: user.id,
            email: user.email,
            name: user.name,
            profileImage: user.profileImage,
            levelStatus: user.levelStatus.length === 0 ? null : user.levelStatus,
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;

