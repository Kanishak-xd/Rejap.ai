import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

async function listModels() {
    try {
        console.log('API Key (first 20 chars):', process.env.GOOGLE_AI_API_KEY?.substring(0, 20) + '...');
        console.log('Fetching available models...\n');

        const modelsToTest = [
            // 2026 models
            'gemini-2.0-flash-exp',
            'gemini-exp-1206',
            'gemini-2.0-flash',
            // 1.5 models
            'gemini-1.5-pro',
            'gemini-1.5-pro-latest',
            'gemini-1.5-flash',
            'gemini-1.5-flash-latest',
            'gemini-1.5-flash-8b',
            'gemini-1.5-flash-8b-latest',
            // Legacy
            'gemini-pro',
            'gemini-1.0-pro',
            // With models/ prefix
            'models/gemini-1.5-flash',
            'models/gemini-1.5-pro',
        ];

        console.log('Testing model names:\n');

        for (const modelName of modelsToTest) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent('Say "test" if you can read this.');
                const response = await result.response;
                const text = response.text();
                console.log(`✅ ${modelName} - WORKS! Response: ${text.substring(0, 50)}`);
                // Continue testing other models
            } catch (error: any) {
                if (error.status === 404) {
                    console.log(`❌ ${modelName} - NOT FOUND (404)`);
                } else if (error.status === 403) {
                    console.log(`🔒 ${modelName} - PERMISSION DENIED (403) - API might not be enabled`);
                } else if (error.status === 400) {
                    console.log(`⚠️  ${modelName} - BAD REQUEST (400): ${error.message?.substring(0, 80)}`);
                } else {
                    console.log(`⚠️  ${modelName} - ERROR (${error.status}): ${error.message?.substring(0, 80)}`);
                }
            }
        }

        console.log('\n---');
        console.log('If all models show 404 or 403, your API key might not have Generative AI enabled.');
        console.log('Go to: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com');
        console.log('And enable the "Generative Language API" for your project.');
    } catch (error) {
        console.error('Error:', error);
    }
}

listModels();
