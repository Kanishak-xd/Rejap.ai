import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearQuizData() {
    try {
        console.log('Starting to clear quiz data...');

        // Delete in order of dependencies (child tables first)

        // 1. Delete AI feedback
        const deletedFeedback = await prisma.aiFeedback.deleteMany({});
        console.log(`✓ Deleted ${deletedFeedback.count} AI feedback entries`);

        // 2. Delete user answers
        const deletedAnswers = await prisma.userAnswer.deleteMany({});
        console.log(`✓ Deleted ${deletedAnswers.count} user answers`);

        // 3. Delete quiz attempts
        const deletedAttempts = await prisma.userQuizAttempt.deleteMany({});
        console.log(`✓ Deleted ${deletedAttempts.count} quiz attempts`);

        // 4. Delete quiz questions
        const deletedQuestions = await prisma.quizQuestion.deleteMany({});
        console.log(`✓ Deleted ${deletedQuestions.count} quiz questions`);

        // 5. Delete quizzes
        const deletedQuizzes = await prisma.quiz.deleteMany({});
        console.log(`✓ Deleted ${deletedQuizzes.count} quizzes`);

        console.log('\n✅ Successfully cleared all quiz data!');
        console.log('You can now run the seed script to create fresh quizzes.');
    } catch (error) {
        console.error('❌ Error clearing quiz data:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

clearQuizData()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
