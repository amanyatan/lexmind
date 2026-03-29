import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcPath = 'C:\\Users\\AMAN YATAN\\.gemini\\antigravity\\brain\\118fd0c5-c657-4309-b437-04f76d7d21ed\\media__1774739657314.png';
const destDir = path.join(__dirname, 'src', 'assets');
const destPath = path.join(destDir, 'logo.png');

if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

fs.copyFileSync(srcPath, destPath);
console.log('File copied successfully!');
