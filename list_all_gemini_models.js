const key = 'AIzaSyAT8yysmFYNoCBmnhfTo2HTd0QgGp-r2yA';

async function listModels() {
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
        console.log(`Listing models from: ${url}`);
        const resp = await fetch(url);
        const data = await resp.json();
        console.log(`Status: ${resp.status}`);
        console.log('Models available:', JSON.stringify(data, null, 2));
    } catch (err) {
        console.log(`Error: ${err.message}`);
    }
}

listModels();
