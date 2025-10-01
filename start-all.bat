@echo off
echo Starting all services...

echo.
echo Starting backend-login on port 3000...
cd backend-login
start "Backend Login" cmd /k "npm run start:dev"

echo.
echo Starting backend-main on port 7777...
cd ../backend-main
start "Backend Main" cmd /k "npm run start:dev"

echo.
echo Starting frontend on port 5173...
cd ../frontend
start "Frontend" cmd /k "npm run dev"

echo.
echo Starting admin-panel on port 3001...
cd ../admin-panel
start "Admin Panel" cmd /k "npm run dev"

echo.
echo Starting creator-panel on port 3002...
cd ../creator-panel
start "Creator Panel" cmd /k "npm run dev"

echo.
echo All services are starting...
echo.
echo Ports:
echo - Backend Login: http://localhost:3000
echo - Backend Main:  http://localhost:7777
echo - Frontend:      http://localhost:5173
echo - Admin Panel:   http://localhost:3001
echo - Creator Panel: http://localhost:3002
echo.
echo Waiting for all services to start...
timeout /t 10 /nobreak >nul
echo.
echo Services should be ready now!
pause
