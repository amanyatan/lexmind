const key = 'AIzaSyArve_DySwU7NkgDwrFF1sfyS8NzpFmOOA';

async function testModel(modelName) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${key}`;
    try {
        console.log(`Testing model: ${modelName}...`);
        const resp = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: 'hi' }] }] })
        });
        const data = await resp.json();
        if (resp.ok) {
            console.log(`SUCCESS with ${modelName}!`);
        } else {
            console.log(`Error with ${modelName}:`, JSON.stringify(data.error));
        }
    } catch (err) {
        console.log(`Fetch error: ${err.message}`);
    }
}

async function run() {
    await testModel('gemini-2.0-flash');
    await testModel('gemini-flash-latest');
}

run();
