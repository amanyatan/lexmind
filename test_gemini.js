const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: 'c:\\Users\\AMAN YATAN\\.gemini\\antigravity\\scratch\\lex-mind\\backend\\server\\.env' });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function test() {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent("hi");
        console.log("Success with 1.5 flash:", result.response.text());
    } catch (e) {
        console.log("Fail with 1.5 flash:", e.message);
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const result = await model.generateContent("hi");
        console.log("Success with 2.0 flash:", result.response.text());
    } catch (e) {
        console.log("Fail with 2.0 flash:", e.message);
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const result = await model.generateContent("hi");
        console.log("Success with 2.5 flash:", result.response.text());
    } catch (e) {
        console.log("Fail with 2.5 flash:", e.message);
    }
}

test();
