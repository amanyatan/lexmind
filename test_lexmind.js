async function testLexmind() {
    try {
        const response = await fetch('http://127.0.0.1:5000/api/lexmind/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_message: 'hi',
                language: 'hinglish',
                history: []
            })
        });

        console.log('Status:', response.status);
        const data = await response.json();
        console.log('Response:', JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('Error:', err.message);
    }
}

testLexmind();
