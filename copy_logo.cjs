const fs = require('fs');
const path = require('path');

const srcPath = 'C:\\Users\\AMAN YATAN\\.gemini\\antigravity\\brain\\118fd0c5-c657-4309-b437-04f76d7d21ed\\media__1774739657314.png';
const destDir = path.join(__dirname, 'src', 'assets');
const destPath = path.join(destDir, 'logo.png');

try {
    if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(srcPath, destPath);
    console.log('File copied successfully to: ' + destPath);
} catch (err) {
    console.error('Error copying file: ' + err.message);
}
