/// <reference types="node" />
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkState() {
    console.log('Checking auth database state...\n');

    const users = await prisma.user.findMany({
        include: {
            accounts: true,
            sessions: true,
        },
    });

    console.log(`Users: ${users.length}`);
    users.forEach(user => {
        console.log(`  - ${user.email} (${user.id})`);
        console.log(`    Google ID: ${user.googleId || 'none'}`);
        console.log(`    Accounts: ${user.accounts.length}`);
        user.accounts.forEach(acc => {
            console.log(`      - ${acc.provider} (${acc.providerAccountId})`);
        });
    });

    const accounts = await prisma.account.findMany();
    console.log(`\nTotal Accounts: ${accounts.length}`);

    const sessions = await prisma.session.findMany();
    console.log(`Total Sessions: ${sessions.length}`);

    await prisma.$disconnect();
}

checkState().catch(console.error);

