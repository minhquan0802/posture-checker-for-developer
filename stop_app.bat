@echo off
echo ===========================================
echo    DUNG HE THONG POSTURE CHECKER
echo ===========================================
echo.
echo [1/2] Dang dong ung dung Camera AI...
taskkill /F /IM electron.exe /T >nul 2>&1
echo [2/2] Dang tat Backend va Database...
cd /d "%~dp0server"
docker-compose down
echo.
echo ===========================================
echo Da tat toan bo he thong thanh cong!
pause >nul