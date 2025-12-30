require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testAPIKey() {
    try {
        console.log('Testing Gemini API Key...\n');

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const result = await model.generateContent('Say "Hello World"');
        const response = await result.response;
        const text = response.text();

        console.log('✅ SUCCESS! API Key is working!');
        console.log('Response:', text);
        console.log('\nYour backend should work fine.');

    } catch (error) {
        console.error('❌ ERROR! API Key is invalid or has issues:');
        console.error(error.message);
        console.log('\n⚠️  Please get a new API key from: https://aistudio.google.com/apikey');
    }
}

testAPIKey();
