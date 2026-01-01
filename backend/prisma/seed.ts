/// <reference types="node" />
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting seed...');

    // Create Levels
    console.log('Creating levels...');
    const beginner = await prisma.level.upsert({
        where: { order: 1 },
        update: {},
        create: {
            title: 'Beginner',
            description: 'Introduction to basic Japanese vocabulary and kanji',
            order: 1,
        },
    });

    const intermediate = await prisma.level.upsert({
        where: { order: 2 },
        update: {},
        create: {
            title: 'Intermediate',
            description: 'Expanded vocabulary and grammar patterns',
            order: 2,
        },
    });

    const advanced = await prisma.level.upsert({
        where: { order: 3 },
        update: {},
        create: {
            title: 'Advanced',
            description: 'Complex reading comprehension and interpretation',
            order: 3,
        },
    });

    // Beginner Level Modules
    console.log('Creating Beginner modules...');
    const beginnerModule1 = await prisma.module.upsert({
        where: {
            levelId_order: {
                levelId: beginner.id,
                order: 1,
            },
        },
        update: {},
        create: {
            levelId: beginner.id,
            title: 'Basic Vocabulary',
            description: 'Learn fundamental Japanese words',
            order: 1,
        },
    });

    const beginnerModule2 = await prisma.module.upsert({
        where: {
            levelId_order: {
                levelId: beginner.id,
                order: 2,
            },
        },
        update: {},
        create: {
            levelId: beginner.id,
            title: 'Corresponding Kanji',
            description: 'Learn kanji forms of basic vocabulary',
            order: 2,
        },
    });

    const beginnerModule3 = await prisma.module.upsert({
        where: {
            levelId_order: {
                levelId: beginner.id,
                order: 3,
            },
        },
        update: {},
        create: {
            levelId: beginner.id,
            title: 'Simple Sentence Formation',
            description: 'Form basic Japanese sentences',
            order: 3,
        },
    });

    // Intermediate Level Modules
    console.log('Creating Intermediate modules...');
    const intermediateModule1 = await prisma.module.upsert({
        where: {
            levelId_order: {
                levelId: intermediate.id,
                order: 1,
            },
        },
        update: {},
        create: {
            levelId: intermediate.id,
            title: 'Expanded Vocabulary',
            description: 'Learn more complex vocabulary',
            order: 1,
        },
    });

    const intermediateModule2 = await prisma.module.upsert({
        where: {
            levelId_order: {
                levelId: intermediate.id,
                order: 2,
            },
        },
        update: {},
        create: {
            levelId: intermediate.id,
            title: 'Grammar Patterns',
            description: 'Master essential grammar patterns',
            order: 2,
        },
    });

    const intermediateModule3 = await prisma.module.upsert({
        where: {
            levelId_order: {
                levelId: intermediate.id,
                order: 3,
            },
        },
        update: {},
        create: {
            levelId: intermediate.id,
            title: 'Sentence Building',
            description: 'Build more complex sentences',
            order: 3,
        },
    });

    // Advanced Level Modules
    console.log('Creating Advanced modules...');
    const advancedModule1 = await prisma.module.upsert({
        where: {
            levelId_order: {
                levelId: advanced.id,
                order: 1,
            },
        },
        update: {},
        create: {
            levelId: advanced.id,
            title: 'Contextual Reading',
            description: 'Read and understand context',
            order: 1,
        },
    });

    const advancedModule2 = await prisma.module.upsert({
        where: {
            levelId_order: {
                levelId: advanced.id,
                order: 2,
            },
        },
        update: {},
        create: {
            levelId: advanced.id,
            title: 'Complex Sentence Interpretation',
            description: 'Interpret complex sentence structures',
            order: 2,
        },
    });

    const advancedModule3 = await prisma.module.upsert({
        where: {
            levelId_order: {
                levelId: advanced.id,
                order: 3,
            },
        },
        update: {},
        create: {
            levelId: advanced.id,
            title: 'Meaning & Inference',
            description: 'Understand implied meanings and make inferences',
            order: 3,
        },
    });

    // Helper to add content and questions
    const addContentAndQuestions = async (moduleId: string, content: any[], questions: any[]) => {
        // Add content
        for (const item of content) {
            await prisma.contentItem.upsert({
                where: {
                    moduleId_order: {
                        moduleId: moduleId,
                        order: item.order,
                    },
                },
                update: {
                    title: item.title,
                    content: item.content,
                    type: item.type,
                },
                create: {
                    moduleId: moduleId,
                    title: item.title,
                    content: item.content,
                    type: item.type,
                    order: item.order,
                },
            });
        }

        // Create or get Quiz
        let quiz = await prisma.quiz.findFirst({
            where: { moduleId: moduleId },
        });

        if (!quiz) {
            quiz = await prisma.quiz.create({
                data: {
                    moduleId: moduleId,
                    title: 'Module Quiz',
                    description: 'Test your knowledge of this module',
                },
            });
        }

        // Add Questions
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            await prisma.quizQuestion.upsert({
                where: {
                    quizId_order: {
                        quizId: quiz.id,
                        order: i + 1,
                    },
                },
                update: {
                    question: q.question,
                    options: q.options,
                    correctAnswer: q.correctAnswer,
                },
                create: {
                    quizId: quiz.id,
                    question: q.question,
                    type: 'multiple_choice',
                    options: q.options,
                    correctAnswer: q.correctAnswer,
                    order: i + 1,
                },
            });
        }
    };

    // Beginner Module 1
    await addContentAndQuestions(
        beginnerModule1.id,
        [
            { title: 'いぬ', content: 'いぬ (inu) - dog', type: 'text', order: 1 },
            { title: 'ねこ', content: 'ねこ (neko) - cat', type: 'text', order: 2 },
        ],
        [
            {
                question: 'What is the Japanese word for "dog"?',
                options: ['いぬ', 'ねこ', 'みず', 'とり'],
                correctAnswer: 'いぬ',
            },
        ]
    );

    // Beginner Module 2
    await addContentAndQuestions(
        beginnerModule2.id,
        [
            { title: '犬', content: '犬 (inu) - dog (kanji form)', type: 'text', order: 1 },
            { title: '猫', content: '猫 (neko) - cat (kanji form)', type: 'text', order: 2 },
        ],
        [
            {
                question: 'What is the kanji for "cat"?',
                options: ['犬', '猫', '水', '木'],
                correctAnswer: '猫',
            },
        ]
    );

    // Beginner Module 3
    await addContentAndQuestions(
        beginnerModule3.id,
        [
            { title: 'いぬをみる', content: 'いぬをみる - I see a dog', type: 'text', order: 1 },
        ],
        [
            {
                question: 'How do you say "I see a dog" in Japanese?',
                options: ['いぬをみる', 'ねこをみる', 'みずをのむ', 'ごはんをたべる'],
                correctAnswer: 'いぬをみる',
            },
        ]
    );

    // Intermediate Module 1
    await addContentAndQuestions(
        intermediateModule1.id,
        [
            { title: '学校', content: '学校 (gakkou) - school', type: 'text', order: 1 },
        ],
        [
            {
                question: 'What does "学校" (gakkou) mean?',
                options: ['School', 'Hospital', 'Library', 'Station'],
                correctAnswer: 'School',
            },
            {
                question: 'Which word means "student" in Japanese?',
                options: ['学生', '先生', '学校', '勉強'],
                correctAnswer: '学生',
            },
        ]
    );

    // Intermediate Module 2
    await addContentAndQuestions(
        intermediateModule2.id,
        [
            { title: '～ています', content: '～ています - present continuous', type: 'text', order: 1 },
        ],
        [
            {
                question: 'Which particle is used to indicate the object of a verb?',
                options: ['を', 'が', 'に', 'で'],
                correctAnswer: 'を',
            },
            {
                question: 'What is the polite past tense form of a verb?',
                options: ['～ました', '～ます', '～ません', '～ましょう'],
                correctAnswer: '～ました',
            },
        ]
    );

    // Intermediate Module 3
    await addContentAndQuestions(
        intermediateModule3.id,
        [
            { title: '学校に行きます', content: '学校に行きます - I go to school', type: 'text', order: 1 },
        ],
        [
            {
                question: 'How do you say "I am studying" in Japanese?',
                options: ['勉強しています', '勉強しました', '勉強します', '勉強したい'],
                correctAnswer: '勉強しています',
            },
            {
                question: 'How do you say "I talked with a friend"?',
                options: ['友達と話しました', '友達に話しました', '友達が話しました', '友達を話しました'],
                correctAnswer: '友達と話しました',
            },
        ]
    );

    // Advanced Module 1
    await addContentAndQuestions(
        advancedModule1.id,
        [
            { title: '読解', content: '昨日、公園で友達とサッカーをしました。', type: 'text', order: 1 },
        ],
        [
            {
                question: '昨日、どこでサッカーをしましたか？',
                options: ['公園', '学校', '家', '海'],
                correctAnswer: '公園',
            },
            {
                question: 'サッカーをしたのはいつですか？',
                options: ['昨日', '今日', '明日', '先週'],
                correctAnswer: '昨日',
            },
        ]
    );

    // Advanced Module 2
    await addContentAndQuestions(
        advancedModule2.id,
        [
            { title: '複文', content: 'もし時間があれば、博物館に行きたいと思います。', type: 'text', order: 1 },
        ],
        [
            {
                question: '「もし時間があれば」の意味は何ですか？',
                options: ['If there is time', 'When there is time', 'Because there is time', 'Although there is time'],
                correctAnswer: 'If there is time',
            },
            {
                question: '「博物館に行きたい」の意味は何ですか？',
                options: ['I want to go to the museum', 'I went to the museum', 'I am going to the museum', 'I should go to the museum'],
                correctAnswer: 'I want to go to the museum',
            },
        ]
    );

    // Advanced Module 3
    await addContentAndQuestions(
        advancedModule3.id,
        [
            { title: '推論', content: '彼は毎日図書館に通っている。', type: 'text', order: 1 },
        ],
        [
            {
                question: '「彼は毎日図書館に通っている」から推論できることは何ですか？',
                options: ['彼は勉強熱心だ', '彼は泳ぐのが好きだ', '彼は料理が得意だ', '彼は歌が上手だ'],
                correctAnswer: '彼は勉強熱心だ',
            },
            {
                question: '「雨が降っているのに、彼は出かけた」から推論できることは何ですか？',
                options: ['重要な用事がある', '彼は雨が好きだ', '彼は傘を持っていない', '彼は暇だ'],
                correctAnswer: '重要な用事がある',
            },
        ]
    );

    console.log('Seed completed successfully!');
}

main()
    .catch((e) => {
        console.error('Error during seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
