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

    // Beginner Module 1: Basic Vocabulary Content
    console.log('Adding content to Beginner Module 1...');
    const beginnerVocab = [
        { title: 'いぬ', content: 'いぬ (inu) - dog', type: 'text', order: 1 },
        { title: 'ねこ', content: 'ねこ (neko) - cat', type: 'text', order: 2 },
        { title: 'みず', content: 'みず (mizu) - water', type: 'text', order: 3 },
        { title: 'たべる', content: 'たべる (taberu) - to eat', type: 'text', order: 4 },
        { title: 'のむ', content: 'のむ (nomu) - to drink', type: 'text', order: 5 },
    ];

    for (const item of beginnerVocab) {
        await prisma.contentItem.upsert({
            where: {
                moduleId_order: {
                    moduleId: beginnerModule1.id,
                    order: item.order,
                },
            },
            update: {
                title: item.title,
                content: item.content,
                type: item.type,
            },
            create: {
                moduleId: beginnerModule1.id,
                title: item.title,
                content: item.content,
                type: item.type,
                order: item.order,
            },
        });
    }

    // Beginner Module 2: Corresponding Kanji Content
    console.log('Adding content to Beginner Module 2...');
    const beginnerKanji = [
        { title: '犬', content: '犬 (inu) - dog (kanji form)', type: 'text', order: 1 },
        { title: '猫', content: '猫 (neko) - cat (kanji form)', type: 'text', order: 2 },
        { title: '水', content: '水 (mizu) - water (kanji form)', type: 'text', order: 3 },
        { title: '食べる', content: '食べる (taberu) - to eat (kanji form)', type: 'text', order: 4 },
        { title: '飲む', content: '飲む (nomu) - to drink (kanji form)', type: 'text', order: 5 },
    ];

    for (const item of beginnerKanji) {
        await prisma.contentItem.upsert({
            where: {
                moduleId_order: {
                    moduleId: beginnerModule2.id,
                    order: item.order,
                },
            },
            update: {
                title: item.title,
                content: item.content,
                type: item.type,
            },
            create: {
                moduleId: beginnerModule2.id,
                title: item.title,
                content: item.content,
                type: item.type,
                order: item.order,
            },
        });
    }

    // Beginner Module 3: Simple Sentence Formation
    console.log('Adding content to Beginner Module 3...');
    const beginnerSentences = [
        { title: 'いぬをみる', content: 'いぬをみる (inu wo miru) - I see a dog', type: 'text', order: 1 },
        { title: 'ねこがたべる', content: 'ねこがたべる (neko ga taberu) - The cat eats', type: 'text', order: 2 },
        { title: 'みずをのむ', content: 'みずをのむ (mizu wo nomu) - I drink water', type: 'text', order: 3 },
        { title: 'たべものをたべる', content: 'たべものをたべる (tabemono wo taberu) - I eat food', type: 'text', order: 4 },
        { title: 'いぬとねこ', content: 'いぬとねこ (inu to neko) - dog and cat', type: 'text', order: 5 },
    ];

    for (const item of beginnerSentences) {
        await prisma.contentItem.upsert({
            where: {
                moduleId_order: {
                    moduleId: beginnerModule3.id,
                    order: item.order,
                },
            },
            update: {
                title: item.title,
                content: item.content,
                type: item.type,
            },
            create: {
                moduleId: beginnerModule3.id,
                title: item.title,
                content: item.content,
                type: item.type,
                order: item.order,
            },
        });
    }

    // Intermediate Module 1: Expanded Vocabulary
    console.log('Adding content to Intermediate Module 1...');
    const intermediateVocab = [
        { title: '学校', content: '学校 (gakkou) - school', type: 'text', order: 1 },
        { title: '学生', content: '学生 (gakusei) - student', type: 'text', order: 2 },
        { title: '勉強', content: '勉強 (benkyou) - study', type: 'text', order: 3 },
        { title: '友達', content: '友達 (tomodachi) - friend', type: 'text', order: 4 },
        { title: '家族', content: '家族 (kazoku) - family', type: 'text', order: 5 },
    ];

    for (const item of intermediateVocab) {
        await prisma.contentItem.upsert({
            where: {
                moduleId_order: {
                    moduleId: intermediateModule1.id,
                    order: item.order,
                },
            },
            update: {
                title: item.title,
                content: item.content,
                type: item.type,
            },
            create: {
                moduleId: intermediateModule1.id,
                title: item.title,
                content: item.content,
                type: item.type,
                order: item.order,
            },
        });
    }

    // Intermediate Module 2: Grammar Patterns
    console.log('Adding content to Intermediate Module 2...');
    const grammarPatterns = [
        { title: '～ています', content: '～ています (te imasu) - present continuous form', type: 'text', order: 1 },
        { title: '～ました', content: '～ました (mashita) - past tense polite form', type: 'text', order: 2 },
        { title: '～が', content: '～が (ga) - subject particle', type: 'text', order: 3 },
        { title: '～を', content: '～を (wo) - object particle', type: 'text', order: 4 },
        { title: '～に', content: '～に (ni) - direction/time particle', type: 'text', order: 5 },
    ];

    for (const item of grammarPatterns) {
        await prisma.contentItem.upsert({
            where: {
                moduleId_order: {
                    moduleId: intermediateModule2.id,
                    order: item.order,
                },
            },
            update: {
                title: item.title,
                content: item.content,
                type: item.type,
            },
            create: {
                moduleId: intermediateModule2.id,
                title: item.title,
                content: item.content,
                type: item.type,
                order: item.order,
            },
        });
    }

    // Intermediate Module 3: Sentence Building
    console.log('Adding content to Intermediate Module 3...');
    const intermediateSentences = [
        { title: '学校に行きます', content: '学校に行きます (gakkou ni ikimasu) - I go to school', type: 'text', order: 1 },
        { title: '勉強しています', content: '勉強しています (benkyou shite imasu) - I am studying', type: 'text', order: 2 },
        { title: '友達と話しました', content: '友達と話しました (tomodachi to hanashimashita) - I talked with a friend', type: 'text', order: 3 },
        { title: '家族と食べました', content: '家族と食べました (kazoku to tabemashita) - I ate with my family', type: 'text', order: 4 },
        { title: '学生が読んでいます', content: '学生が読んでいます (gakusei ga yonde imasu) - The student is reading', type: 'text', order: 5 },
    ];

    for (const item of intermediateSentences) {
        await prisma.contentItem.upsert({
            where: {
                moduleId_order: {
                    moduleId: intermediateModule3.id,
                    order: item.order,
                },
            },
            update: {
                title: item.title,
                content: item.content,
                type: item.type,
            },
            create: {
                moduleId: intermediateModule3.id,
                title: item.title,
                content: item.content,
                type: item.type,
                order: item.order,
            },
        });
    }

    // Advanced Module 1: Contextual Reading
    console.log('Adding content to Advanced Module 1...');
    const contextualReading = [
        { title: '短文読解 1', content: '昨日、公園で友達とサッカーをしました。とても楽しかったです。', type: 'text', order: 1 },
        { title: '短文読解 2', content: '今日は雨が降っています。傘を持って出かけました。', type: 'text', order: 2 },
        { title: '短文読解 3', content: '図書館で本を借りました。来週までに返さなければなりません。', type: 'text', order: 3 },
        { title: '短文読解 4', content: '新しいレストランに行きました。料理がとても美味しかったです。', type: 'text', order: 4 },
        { title: '短文読解 5', content: '週末に映画を見に行く予定です。友達と一緒に行きます。', type: 'text', order: 5 },
    ];

    for (const item of contextualReading) {
        await prisma.contentItem.upsert({
            where: {
                moduleId_order: {
                    moduleId: advancedModule1.id,
                    order: item.order,
                },
            },
            update: {
                title: item.title,
                content: item.content,
                type: item.type,
            },
            create: {
                moduleId: advancedModule1.id,
                title: item.title,
                content: item.content,
                type: item.type,
                order: item.order,
            },
        });
    }

    // Advanced Module 2: Complex Sentence Interpretation
    console.log('Adding content to Advanced Module 2...');
    const complexSentences = [
        { title: '複文 1', content: 'もし時間があれば、博物館に行きたいと思います。', type: 'text', order: 1 },
        { title: '複文 2', content: '彼が来るまで、ここで待っていてください。', type: 'text', order: 2 },
        { title: '複文 3', content: '勉強すればするほど、日本語が上手になります。', type: 'text', order: 3 },
        { title: '複文 4', content: '天気が良ければ、ピクニックに行くつもりです。', type: 'text', order: 4 },
        { title: '複文 5', content: 'この本を読んだ後で、感想を聞かせてください。', type: 'text', order: 5 },
    ];

    for (const item of complexSentences) {
        await prisma.contentItem.upsert({
            where: {
                moduleId_order: {
                    moduleId: advancedModule2.id,
                    order: item.order,
                },
            },
            update: {
                title: item.title,
                content: item.content,
                type: item.type,
            },
            create: {
                moduleId: advancedModule2.id,
                title: item.title,
                content: item.content,
                type: item.type,
                order: item.order,
            },
        });
    }

    // Advanced Module 3: Meaning & Inference
    console.log('Adding content to Advanced Module 3...');
    const inferenceContent = [
        { title: '推論問題 1', content: '彼は毎日図書館に通っている。推論：彼は勉強熱心だ。', type: 'text', order: 1 },
        { title: '推論問題 2', content: 'このレストランはいつも満席だ。推論：料理が人気だ。', type: 'text', order: 2 },
        { title: '推論問題 3', content: '彼女は日本語を話せるが、まだ勉強している。推論：上達したいと思っている。', type: 'text', order: 3 },
        { title: '推論問題 4', content: 'この本は難しいが、面白い。推論：読む価値がある。', type: 'text', order: 4 },
        { title: '推論問題 5', content: '雨が降っているのに、彼は出かけた。推論：重要な用事がある。', type: 'text', order: 5 },
    ];

    for (const item of inferenceContent) {
        await prisma.contentItem.upsert({
            where: {
                moduleId_order: {
                    moduleId: advancedModule3.id,
                    order: item.order,
                },
            },
            update: {
                title: item.title,
                content: item.content,
                type: item.type,
            },
            create: {
                moduleId: advancedModule3.id,
                title: item.title,
                content: item.content,
                type: item.type,
                order: item.order,
            },
        });
    }

    // Create empty Quiz placeholders for all modules
    console.log('Creating quiz placeholders...');
    const modules = [
        { id: beginnerModule1.id, title: 'Basic Vocabulary Quiz' },
        { id: beginnerModule2.id, title: 'Corresponding Kanji Quiz' },
        { id: beginnerModule3.id, title: 'Simple Sentence Formation Quiz' },
        { id: intermediateModule1.id, title: 'Expanded Vocabulary Quiz' },
        { id: intermediateModule2.id, title: 'Grammar Patterns Quiz' },
        { id: intermediateModule3.id, title: 'Sentence Building Quiz' },
        { id: advancedModule1.id, title: 'Contextual Reading Quiz' },
        { id: advancedModule2.id, title: 'Complex Sentence Interpretation Quiz' },
        { id: advancedModule3.id, title: 'Meaning & Inference Quiz' },
    ];

    for (const module of modules) {
        // Check if quiz already exists for this module
        const existingQuiz = await prisma.quiz.findFirst({
            where: { moduleId: module.id },
        });

        if (existingQuiz) {
            // Update existing quiz
            await prisma.quiz.update({
                where: { id: existingQuiz.id },
                data: {
                    title: module.title,
                    description: 'Quiz questions will be generated by AI',
                },
            });
        } else {
            // Create new quiz
            await prisma.quiz.create({
                data: {
                    moduleId: module.id,
                    title: module.title,
                    description: 'Quiz questions will be generated by AI',
                },
            });
        }
    }

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

