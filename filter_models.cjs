const fs = require('fs');
const data = JSON.parse(fs.readFileSync('models.json', 'utf8'));

const textModels = data.models.filter(m => m.supportedGenerationMethods.includes('generateContent'));
console.log('Models supporting generateContent:');
textModels.forEach(m => console.log(`- ${m.name} (${m.displayName})`));
