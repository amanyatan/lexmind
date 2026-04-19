const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: './backend/server/.env' });

async function listModels() {
    try {
        console.log('Listing models for key...');
        // Standard fetch for listModels as SDK might hide details
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        const data = await response.json();
        if (data.models) {
            console.log('Available Models:', data.models.map(m => m.name).join(', '));
        } else {
            console.log('No models found:', data);
        }
    } catch (err) {
        console.error('FAILED:', err.message);
    }
}

listModels();
