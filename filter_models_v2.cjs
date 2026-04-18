const fs = require('fs');
// models.json is UTF-16LE, let's read it properly
const buf = fs.readFileSync('models.json');
const dataStr = buf.toString('utf16le');
const data = JSON.parse(dataStr);

const textModels = data.models.filter(m => m.supportedGenerationMethods.includes('generateContent'));
console.log('Models supporting generateContent:');
textModels.forEach(m => console.log(`- ${m.name} (${m.displayName})`));
