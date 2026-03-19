@echo off
echo ===================================================
echo   Starting Smart Career Advisor (Backend + Frontend)
echo ===================================================

echo [1/2] Starting Backend Server (Port 10000)...
start "SCA Backend" cmd /k "cd backend-node && npm run dev"

echo Waiting 5 seconds for backend to initialize...
timeout /t 5

echo [2/2] Starting Frontend (Port 5173/5174)...
start "SCA Frontend" cmd /k "cd frontend-react && npm run dev"

echo ===================================================
echo   Servers started! 
echo   Please check the frontend terminal for the exact URL.
echo   (Usually http://localhost:5173 or http://localhost:5174)
echo ===================================================
pause
