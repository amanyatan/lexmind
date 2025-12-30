@echo off
echo Starting LexMind Backend (Consolidated)...
echo.
cd backend\server

echo Checking dependencies...
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo Failed to install dependencies
        pause
        exit /b 1
    )
)

echo.
echo Starting backend on http://localhost:5000
echo Press Ctrl+C to stop the server
echo.

npm start

pause
