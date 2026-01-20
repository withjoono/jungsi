@echo off
echo.
echo ========================================
echo 프로덕션 마이그레이션 실행
echo ========================================
echo.

REM 환경 변수 설정
set NODE_ENV=production
set DB_HOST=localhost
set DB_PORT=5432
set DB_NAME=geobukschool_prod
set DB_USER=tsuser
set DB_PASSWORD=tsuser1234

echo 📊 Database: %DB_NAME% @ %DB_HOST%:%DB_PORT%
echo 👤 User: %DB_USER%
echo 🌍 Environment: %NODE_ENV%
echo.

echo 🚀 마이그레이션 실행 중...
echo.

yarn typeorm:run

echo.
if %ERRORLEVEL% EQU 0 (
    echo ✅ 마이그레이션 완료!
) else (
    echo ❌ 마이그레이션 실패 (Exit Code: %ERRORLEVEL%)
)

REM 환경 변수 초기화
set DB_PASSWORD=
set NODE_ENV=
set DB_HOST=
set DB_PORT=
set DB_NAME=
set DB_USER=

echo.
pause
