@echo off
echo Starting LexMind Backend Services...
echo.

cd pdf-extractor
echo Installing PDF Extractor dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Failed to install PDF Extractor dependencies
    pause
    exit /b 1
)

echo Starting PDF Extractor on port 5001...
start "PDF Extractor" cmd /k "npm start"

cd ..\chatbot
echo Installing Chatbot dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Failed to install Chatbot dependencies
    pause
    exit /b 1
)

echo Starting Chatbot on port 5002...
start "Chatbot" cmd /k "npm start"

echo.
echo Both services are starting in separate windows...
echo PDF Extractor: http://localhost:5001
echo Chatbot: http://localhost:5002
echo.
pause
