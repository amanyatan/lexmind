const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testModels() {
    require('dotenv').config({ path: 'C:\\Users\\AMAN YATAN\\.gemini\\antigravity\\scratch\\lex-mind\\backend\\server\\.env' });
    const apiKey = process.env.GEMINI_API_KEY || "YOUR_API_KEY_HERE";
    const genAI = new GoogleGenerativeAI(apiKey);

    // List of models to try
    const modelsToTry = [
        'gemini-3-flash',
        'gemini-3-flash-preview',
        'gemini-2.5-flash-lite',
        'gemini-2.0-flash',
        'gemini-1.5-flash'
    ];

    for (const modelName of modelsToTry) {
        try {
            console.log(`Checking model: ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent('ping');
            const response = await result.response;
            console.log(`✅ ${modelName} works!`);
        } catch (error) {
            console.log(`❌ ${modelName} failed: ${error.message}`);
        }
    }
}

testModels();
