const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: 'c:\\Users\\AMAN YATAN\\.gemini\\antigravity\\scratch\\lex-mind\\backend\\server\\.env' });

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    let output = '';
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        const data = await response.json();
        output += 'Available models:\n';
        if (data.models) {
            data.models.forEach(model => {
                output += `- ${model.name}\n`;
            });
        } else {
            output += JSON.stringify(data);
        }
    } catch (error) {
        output += 'Error: ' + error.message;
    }
    fs.writeFileSync('c:\\Users\\AMAN YATAN\\.gemini\\antigravity\\scratch\\lex-mind\\available_models.txt', output);
}

listModels();
