const key = 'AIzaSyAT8yysmFYNoCBmnhfTo2HTd0QgGp-r2yA';

async function testV1() {
    const urls = [
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-native-audio-latest:generateContent?key=${key}`,
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
            console.log(`Response: ${JSON.stringify(data, null, 2)}`);
        } catch (err) {
            console.log(`Fetch error: ${err.message}`);
        }
    }
}

testV1();
