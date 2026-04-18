import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logoSrc = path.join(__dirname, '.vscode', 'logo.png');
const videoSrc = path.join(__dirname, '.vscode', 'Mahir AI .mp4');

const assetsDir = path.join(__dirname, 'src', 'assets');
const publicDir = path.join(__dirname, 'public');

if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

try {
    fs.copyFileSync(logoSrc, path.join(assetsDir, 'logo.png'));
    console.log('Logo copied to src/assets/logo.png');
} catch (e) { console.error('Failed to copy logo:', e.message); }

try {
    fs.copyFileSync(videoSrc, path.join(publicDir, 'mahir_avatar.mp4'));
    console.log('Video copied to public/mahir_avatar.mp4');
} catch (e) { console.error('Failed to copy video:', e.message); }
