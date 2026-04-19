const fetch = require('node-fetch');

async function test() {
    try {
        console.log("Testing /health...");
        const hRes = await fetch('http://localhost:5000/health');
        const hText = await hRes.text();
        console.log("Health Response:", hText);

        console.log("\nTesting /api/lexmind/chat...");
        const cRes = await fetch('http://localhost:5000/api/lexmind/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_message: "Hello Lexmind",
                language: "english"
            })
        });
        const cText = await cRes.text();
        console.log("Chat Response:", cText);

    } catch (e) {
        console.error("Test failed:", e.message);
    }
}
test();
