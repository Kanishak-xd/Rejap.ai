/// <reference types="node" />
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanup() {
    console.log('Cleaning up ALL auth records...');

    // Delete all accounts first (to avoid foreign key issues)
    const deletedAccounts = await prisma.account.deleteMany({});
    console.log(`Deleted ${deletedAccounts.count} account records`);

    // Delete all sessions
    const deletedSessions = await prisma.session.deleteMany({});
    console.log(`Deleted ${deletedSessions.count} session records`);

    // Delete all verification tokens
    const deletedTokens = await prisma.verificationToken.deleteMany({});
    console.log(`Deleted ${deletedTokens.count} verification token records`);

    // Delete all users (cascade will handle related records)
    const deletedUsers = await prisma.user.deleteMany({});
    console.log(`Deleted ${deletedUsers.count} user records`);

    console.log('✅ Cleanup complete! All auth records cleared.');
    console.log('You can now try signing in again with Google.');
}

cleanup()
    .catch((e) => {
        console.error('Error during cleanup:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

