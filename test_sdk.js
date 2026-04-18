import { GoogleGenerativeAI } from "@google/generative-ai";

const key = "AIzaSyAT8yysmFYNoCBmnhfTo2HTd0QgGp-r2yA";
const genAI = new GoogleGenerativeAI(key);

async function test(modelName) {
    try {
        console.log(`Testing ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("hi");
        console.log(`Success ${modelName}:`, result.response.text());
    } catch (e) {
         console.log(`Error ${modelName}:`, e.message);
    }
}

async function run() {
    await test("gemini-2.5-flash");
    await test("gemini-2.0-flash");
    await test("gemini-1.5-flash");
    await test("gemini-1.5-flash-latest");
}

run();
