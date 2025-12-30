const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: 'c:\\Users\\AMAN YATAN\\.gemini\\antigravity\\scratch\\lex-mind\\backend\\server\\.env' });

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    try {
        const result = await genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }).listModels();
        console.log('Available models:');
        result.models.forEach(model => {
            console.log(`- ${model.name} (${model.displayName})`);
        });
    } catch (error) {
        console.error('Error listing models:', error);
        // Fallback: listModels might be on the genAI instance directly depending on version
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
            const data = await response.json();
            console.log('Available models (via fetch):');
            data.models.forEach(model => {
                console.log(`- ${model.name} (${model.displayName})`);
            });
        } catch (fetchError) {
            console.error('Fetch error:', fetchError);
        }
    }
}

listModels();
