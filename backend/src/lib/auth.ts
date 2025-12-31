import { ExpressAuth } from "@auth/express";
import Google from "@auth/express/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { syncUserFromAuth } from "./user-sync.js";

const prisma = new PrismaClient();

const authConfig: any = {
    adapter: PrismaAdapter(prisma),
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async signIn({ user, account }: any) {
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
    },
    pages: {
        signIn: '/auth/signin',
    },
    secret: process.env.AUTH_SECRET,
    trustHost: true,
};

export const auth = ExpressAuth(authConfig);
export { authConfig };

