import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

// System instruction for all AI calls
const SYSTEM_CONSTRAINT = 'Use ONLY the provided vocabulary, kanji, and grammar. Do NOT introduce new Japanese words or cultural concepts.';

// Logging function for audit purposes
function logAIResponse(functionName: string, prompt: string, response: string, metadata?: any) {
    console.log(`[AI LOG] ${functionName}:`, {
        timestamp: new Date().toISOString(),
        prompt: prompt.substring(0, 200) + '...', // Truncate for readability
        response: response.substring(0, 200) + '...',
        metadata,
    });
}

/**
 * Generates 5 multiple-choice questions based on the provided content
 */
export async function generateQuizQuestions(
    level: string,
    moduleName: string,
    allowedContent: string[]
): Promise<Array<{
    question_text: string;
    options: string[];
    correct_answer: string;
}>> {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const contentList = allowedContent.join('\n');

    const prompt = `${SYSTEM_CONSTRAINT}

You are a Japanese language learning quiz generator. Generate exactly 5 multiple-choice questions based ONLY on the following content.

Level: ${level}
Module: ${moduleName}

Allowed Content:
${contentList}

Requirements:
- Generate exactly 5 questions
- Each question must have 4 options (A, B, C, D)
- Only use vocabulary, kanji, and grammar from the allowed content above
- Do NOT introduce any new Japanese words
- Return a JSON array with this exact structure:
[
  {
    "question_text": "Question here",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_answer": "Option A"
  }
]

Return ONLY valid JSON, no additional text.`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Log the AI response
        logAIResponse('generateQuizQuestions', prompt, text, { level, moduleName });

        // Parse JSON response
        const cleanedText = text.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const questions = JSON.parse(cleanedText);

        // Validate structure
        if (!Array.isArray(questions) || questions.length !== 5) {
            throw new Error('AI did not return exactly 5 questions');
        }

        // Validate each question has required fields
        for (const q of questions) {
            if (!q.question_text || !Array.isArray(q.options) || q.options.length !== 4 || !q.correct_answer) {
                throw new Error('Invalid question structure from AI');
            }
        }

        return questions;
    } catch (error) {
        console.error('Error generating quiz questions:', error);
        logAIResponse('generateQuizQuestions', prompt, `ERROR: ${error}`, { level, moduleName });
        throw error;
    }
}

/**
 * Provides a short, encouraging explanation for a wrong answer
 */
export async function explainAnswer(
    level: string,
    question: string,
    userAnswer: string,
    correctAnswer: string,
    allowedContent: string[]
): Promise<string> {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const contentList = allowedContent.join('\n');

    const prompt = `${SYSTEM_CONSTRAINT}

You are a supportive Japanese language tutor. Provide a short, encouraging explanation for why the student's answer was incorrect.

Level: ${level}
Question: ${question}
Student's Answer: ${userAnswer}
Correct Answer: ${correctAnswer}

Allowed Content (use only these):
${contentList}

Requirements:
- Keep explanation to 2-3 sentences
- Be encouraging and supportive
- Explain why the correct answer is right
- Use ONLY vocabulary and concepts from the allowed content
- Do NOT introduce new Japanese words

Provide only the explanation text, no additional formatting.`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim();

        logAIResponse('explainAnswer', prompt, text, { level, question: question.substring(0, 50) });

        return text;
    } catch (error) {
        console.error('Error explaining answer:', error);
        logAIResponse('explainAnswer', prompt, `ERROR: ${error}`, { level });
        return 'Keep practicing! You\'re making progress.';
    }
}

/**
 * Identifies key strengths and weak areas from performance data
 */
export async function analyzePerformance(
    level: string,
    scores: Array<{ module: string; score: number }>,
    incorrectSummary: string
): Promise<{ strengths: string[]; weakAreas: string[] }> {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const scoresText = scores.map(s => `${s.module}: ${(s.score * 100).toFixed(0)}%`).join('\n');

    const prompt = `${SYSTEM_CONSTRAINT}

You are a Japanese language learning analyst. Analyze the student's performance and identify strengths and weak areas.

Level: ${level}

Module Scores:
${scoresText}

Incorrect Answers Summary:
${incorrectSummary}

Requirements:
- Identify 2-3 key strengths
- Identify 2-3 weak areas that need improvement
- Be specific but encouraging
- Return a JSON object with this exact structure:
{
  "strengths": ["Strength 1", "Strength 2"],
  "weakAreas": ["Weak area 1", "Weak area 2"]
}

Return ONLY valid JSON, no additional text.`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim();

        logAIResponse('analyzePerformance', prompt, text, { level });

        const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const analysis = JSON.parse(cleanedText);

        if (!analysis.strengths || !analysis.weakAreas) {
            throw new Error('Invalid analysis structure from AI');
        }

        return analysis;
    } catch (error) {
        console.error('Error analyzing performance:', error);
        logAIResponse('analyzePerformance', prompt, `ERROR: ${error}`, { level });
        return {
            strengths: ['You\'re making steady progress!'],
            weakAreas: ['Continue practicing the areas you found challenging.'],
        };
    }
}

/**
 * Writes a 3-5 sentence motivational summary of what to do next
 */
export async function recommendNextSteps(
    level: string,
    summary: string,
    weakAreas: string[]
): Promise<string> {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const weakAreasText = weakAreas.join(', ');

    const prompt = `${SYSTEM_CONSTRAINT}

You are a motivational Japanese language learning coach. Write a 3-5 sentence summary encouraging the student and recommending next steps.

Level: ${level}

Performance Summary:
${summary}

Areas to Focus On:
${weakAreasText}

Requirements:
- Write 3-5 sentences
- Be motivational and encouraging
- Suggest specific next steps based on weak areas
- Keep it positive and supportive
- Do NOT introduce new Japanese words or concepts

Provide only the recommendation text, no additional formatting.`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim();

        logAIResponse('recommendNextSteps', prompt, text, { level });

        return text;
    } catch (error) {
        console.error('Error recommending next steps:', error);
        logAIResponse('recommendNextSteps', prompt, `ERROR: ${error}`, { level });
        return 'Keep up the great work! Continue practicing and you\'ll see improvement.';
    }
}

