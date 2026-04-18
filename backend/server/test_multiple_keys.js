async function test() {
    const keys = ['sk-db5873450c2c4a29b592a249ac223127', 'sk-606e9187db4a485a9aa38ab0be9f1f63'];
    for (const key of keys) {
        console.log(`\nTesting Key: ${key.slice(0, 8)}...`);
        try {
            const resp = await fetch('https://api.deepseek.com/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${key}`
                },
                body: JSON.stringify({
                    model: 'deepseek-chat',
                    messages: [{ role: 'user', content: 'hi' }]
                })
            });
            const data = await resp.json();
            console.log(`Status: ${resp.status}`);
            if (resp.status === 200) {
                console.log('✅ KEY HAS BALANCE!');
            } else {
                console.log('Error:', data.error.message || data.error);
            }
        } catch (e) {
            console.log('Error:', e.message);
        }
    }
}
test();
