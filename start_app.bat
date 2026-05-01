@echo off
echo ===========================================
echo    KHOI DONG HE THONG POSTURE CHECKER
echo ===========================================
echo.
echo [1/3] Khoi dong Backend va Database...
cd /d "%~dp0server"
docker-compose up -d --build
echo.
echo [2/3] Dang cho Server san sang (15 giay)...
timeout /t 15 /nobreak
echo.
echo [3/3] Khoi dong Camera AI...
cd /d "%~dp0client"
call npm start
pause