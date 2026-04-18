const fs = require('fs');
const buf = fs.readFileSync('models.json');
const dataStr = buf.toString('utf16le');
// Find the first '{' to skip any log lines
const jsonStart = dataStr.indexOf('{');
if (jsonStart === -1) {
    console.error("No JSON found in models.json");
    process.exit(1);
}
const data = JSON.parse(dataStr.substring(jsonStart));

const textModels = data.models.filter(m => m.supportedGenerationMethods.includes('generateContent'));
console.log('Models supporting generateContent:');
textModels.forEach(m => console.log(`- ${m.name} (${m.displayName})`));
