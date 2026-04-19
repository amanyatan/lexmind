const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: './backend/server/.env' });

async function testKey() {
    try {
        console.log('Testing key:', process.env.GEMINI_API_KEY.substring(0, 10) + '...');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent("Hi");
        console.log('Success! Response:', result.response.text());
    } catch (err) {
        console.error('FAILED:', err.message);
    }
}

testKey();
