@echo off
cd /d "%~dp0"
echo Killing process on port 5000...

for /f "tokens=5" %%a in ('netstat -aon ^| find ":5000" ^| find "LISTENING"') do taskkill /F /PID %%a >nul 2>&1

echo.
echo Starting LexMind Backend on port 5000...
echo.

cd backend\server

if not exist node_modules (
    echo Installing dependencies...
    call npm install
)

npm start
