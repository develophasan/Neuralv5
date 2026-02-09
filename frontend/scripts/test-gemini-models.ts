
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('GEMINI_API_KEY is not set');
        return;
    }

    console.log('Testing specific Gemini 2.0 configuration...');

    const configs = [
        { model: 'gemini-2.0-flash', apiVersion: undefined }, // Default (v1beta)
        { model: 'gemini-2.0-flash', apiVersion: 'v1' },
        { model: 'gemini-2.0-flash', apiVersion: 'v1beta' },
        { model: 'gemini-2.0-flash-001', apiVersion: 'v1' },
        { model: 'gemini-1.5-flash', apiVersion: 'v1' },
        { model: 'models/gemini-2.5-flash', apiVersion: 'v1beta' } // From previous curl output?
    ];

    const genAI = new GoogleGenerativeAI(apiKey);

    for (const config of configs) {
        const label = `${config.model} (API: ${config.apiVersion || 'default'})`;
        process.stdout.write(`Testing ${label}... `);
        try {
            const modelOptions: any = { model: config.model };
            if (config.apiVersion) modelOptions.apiVersion = config.apiVersion;

            const model = genAI.getGenerativeModel(modelOptions);
            const result = await model.generateContent('Hello');
            const response = await result.response;
            console.log(`✅ Success! Response: ${response.text().trim()}`);
            return; // Stop after first success
        } catch (error: any) {
            console.log(`❌ Failed. Error: ${error.message.split('\n')[0]}`);
        }
    }
}

main().catch(console.error);
