import { Request, Response, NextFunction } from 'express';
import { getSession } from '@auth/express';
import { authConfig } from '../lib/auth.js';

export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        name?: string | null;
    };
}

export async function requireAuth(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) {
    try {
        const session = await getSession(req, authConfig);

        if (!session?.user?.email) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        // Attach user info to request
        req.user = {
            id: session.user.id || '',
            email: session.user.email,
            name: session.user.name || null,
        };

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(401).json({ error: 'Not authenticated' });
    }
}

