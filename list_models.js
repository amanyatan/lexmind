const key = 'AIzaSyArve_DySwU7NkgDwrFF1sfyS8NzpFmOOA';

async function listModels() {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    try {
        console.log(`Listing models for KEY: ${key.substring(0, 10)}...`);
        const resp = await fetch(url);
        const data = await resp.json();
        if (resp.ok) {
            console.log(`Models found:`, data.models.map(m => m.name));
        } else {
            console.log(`Error listing models:`, JSON.stringify(data.error));
        }
    } catch (err) {
        console.log(`Fetch error: ${err.message}`);
    }
}

listModels();
