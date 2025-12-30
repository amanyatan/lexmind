const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testModels() {
    const apiKey = "AIzaSyDxCCuESsWciTUoJiST6XqVWYqCzrYWM78";
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
