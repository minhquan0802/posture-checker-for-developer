@echo off
echo ===========================================
echo    KHOI DONG HE THONG POSTURE CHECKER
echo ===========================================
echo.

echo [0/3] Kiem tra Docker Desktop...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo Docker chua chay. Dang khoi dong Docker Desktop...
    start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    
    echo Dang cho Docker san sang, vui long doi...
    :wait_docker
    timeout /t 5 /nobreak >nul
    docker info >nul 2>&1
    if %errorlevel% neq 0 (
        echo Docker van dang khoi dong, tiep tuc cho...
        goto wait_docker
    )
)
echo Docker da san sang!
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