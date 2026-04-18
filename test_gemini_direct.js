const key = 'AIzaSyAT8yysmFYNoCBmnhfTo2HTd0QgGp-r2yA';

async function testV1() {
    const urls = [
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${key}`,
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
        `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${key}`
    ];

    for (const url of urls) {
        try {
            console.log(`Testing URL: ${url}`);
            const resp = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: 'hi' }] }] })
            });
            console.log(`Status: ${resp.status}`);
            const data = await resp.json();
            if (resp.ok) {
                console.log(`SUCCESS!`);
                return;
            } else {
                console.log(`Error: ${JSON.stringify(data.error)}`);
            }
        } catch (err) {
            console.log(`Fetch error: ${err.message}`);
        }
    }
}

testV1();
