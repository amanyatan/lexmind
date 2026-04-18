require('dotenv').config();

async function checkDeepSeek() {
    const key = process.env.DEEPSEEK_API_KEY;
    console.log(`\n🔍 Checking DeepSeek API Key: ...${key.slice(-4)}`);
    try {
        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${key}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [{ role: 'user', content: 'hi' }],
            })
        });
        const data = await response.json();
        if (response.status === 402) {
            console.log(`❌ FAILED: Insufficient Balance (Status 402)`);
        } else if (response.status === 200) {
            console.log(`✅ SUCCESS: API Key has balance!`);
        } else {
             console.log(`⚠️ Status ${response.status}:`, data);
        }
    } catch (e) {
        console.log(`❌ FAILED:`, e.message);
    }
}

async function checkGemini() {
    const key = process.env.GEMINI_API_KEY;
    console.log(`\n🔍 Checking Gemini API Key: ...${key.slice(-4)}`);
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: 'hi' }] }] })
        });
        
        const data = await response.json();
        if (response.status === 429) {
             console.log(`❌ FAILED: Rate Quota Exhausted / Too Many Requests (Status 429)`);
        } else if (response.status === 404) {
             console.log(`❌ FAILED: Model Not Found for this API Key (Status 404). This key may belong to an older project tier.`);
        } else if (response.status === 200) {
             console.log(`✅ SUCCESS: Gemini working!`);
        } else {
             console.log(`⚠️ Status ${response.status}:`, data);
        }
    } catch (e) {
         console.log(`❌ FAILED:`, e.message);
    }
}

async function run() {
    await checkDeepSeek();
    await checkGemini();
}

run();
