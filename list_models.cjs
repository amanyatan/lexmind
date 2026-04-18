const { GoogleGenerativeAI } = require('@google/generative-ai');
const key = 'AIzaSyAT8yysmFYNoCBmnhfTo2HTd0QgGp-r2yA';

async function list() {
    try {
        const genAI = new GoogleGenerativeAI(key);
        // The SDK doesn't have a direct listModels in the main export often, but we can check the API
        console.log("Checking model availability...");
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("hi");
        console.log("Success with gemini-pro!");
        console.log(result.response.text());
    } catch (err) {
        console.error("Gemini-pro failed:", err.message);
        
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await model.generateContent("hi");
            console.log("Success with gemini-1.5-flash!");
        } catch (err2) {
             console.error("Gemini-1.5-flash failed:", err2.message);
        }
    }
}

list();
