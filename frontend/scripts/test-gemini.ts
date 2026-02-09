
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('GEMINI_API_KEY is not set');
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // Try to list models if possible, or just try a specific model
    // The SDK might not expose listModels directly on genAI instance in all versions, 
    // but let's try to generate content with a few variations to see which one works.

    const modelsToTest = [
        'gemini-1.5-flash',
        'gemini-1.5-flash-001',
        'gemini-1.5-pro',
        'gemini-1.5-pro-latest',
        'gemini-1.0-pro',
        'gemini-pro'
    ];

    console.log('Testing models...');

    for (const modelName of modelsToTest) {
        console.log(`\nTesting ${modelName}...`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent('Say hello');
            const response = await result.response;
            console.log(`✅ Success with ${modelName}:`, response.text());
        } catch (error: any) {
            console.log(`❌ Failed with ${modelName}:`, error.message.split('\n')[0]);
        }
    }
}

main().catch(console.error);
