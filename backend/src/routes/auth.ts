import { Router } from 'express';
import { auth } from '../lib/auth.js';

const router = Router();

// Mount Auth.js routes - this handles all /auth/* endpoints (signin, callback, signout, etc.)
// Auth.js expects routes like /api/auth/signin, /api/auth/callback/google, etc.
// Mount at /auth so it becomes /api/auth when router is mounted at /api
// NOTE: Do NOT add custom routes here - Auth.js will intercept all /api/auth/* paths
// Use /api/user/me instead for getting current user
router.use('/auth', auth);

export default router;

