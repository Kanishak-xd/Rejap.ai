import { ExpressAuth } from "@auth/express";
import Google from "@auth/express/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { syncUserFromAuth } from "./user-sync.js";

const prisma = new PrismaClient();

// Validate required environment variables
if (!process.env.AUTH_SECRET) {
    throw new Error('AUTH_SECRET environment variable is required');
}
if (!process.env.GOOGLE_CLIENT_ID) {
    throw new Error('GOOGLE_CLIENT_ID environment variable is required');
}
if (!process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error('GOOGLE_CLIENT_SECRET environment variable is required');
}

// Log configuration (without sensitive data)
console.log('Auth.js Configuration:');
console.log(`  Base Path: (auto-detect from mount)`);
console.log(`  Base URL: ${process.env.AUTH_URL || 'auto-detect'}`);
console.log(`  Google Client ID: ${process.env.GOOGLE_CLIENT_ID.substring(0, 20)}...`);
console.log(`  Trust Host: true`);

const authConfig: any = {
    adapter: PrismaAdapter(prisma),
    providers: [
        Google({
            id: 'google',
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }: any) {
            if (account?.provider === 'google' && account.providerAccountId && user.email) {
                // After Auth.js creates/updates the user via PrismaAdapter,
                // sync additional fields to our custom User model structure
                // On first login, user_level_status remains null (no entries) as per strategy
                try {
                    await syncUserFromAuth(
                        user.email,
                        user.name || null,
                        user.image || null,
                        account.providerAccountId
                    );
                } catch (error) {
                    console.error('Error in user sync callback:', error);
                    // Don't block sign-in if sync fails
                }
            }
            return true;
        },
        async session({ session, user }: any) {
            if (session.user && user) {
                session.user.id = user.id;
            }
            return session;
        },
        async redirect({ url, baseUrl }) {
            // Redirect to frontend after successful authentication
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
            
            // If there's a callback URL parameter, use it (allows custom redirects)
            if (url && url !== baseUrl) {
                // Check if URL is relative - make it absolute to frontend
                if (url.startsWith("/")) {
                    return `${frontendUrl}${url}`
                }
                // If it's an absolute URL to our backend, redirect to frontend root
                try {
                    const urlObj = new URL(url)
                    if (urlObj.origin === baseUrl) {
                        return frontendUrl
                    }
                } catch {
                    // Invalid URL, redirect to frontend
                    return frontendUrl
                }
            }
            
            // Default: redirect to frontend
            return frontendUrl
        },
    },
    secret: process.env.AUTH_SECRET,
    trustHost: true,
    basePath: '/api/auth',
};

export const auth = ExpressAuth(authConfig);
export { authConfig };

