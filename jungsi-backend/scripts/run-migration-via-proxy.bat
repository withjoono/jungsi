@echo off
REM 프로덕션 마이그레이션 실행 스크립트 (Cloud SQL Proxy 사용) - Windows용
REM
REM 사용법:
REM   scripts\run-migration-via-proxy.bat
REM
REM 필요 사항:
REM   1. cloud-sql-proxy.exe 파일
REM   2. gcloud 인증 완료 (gcloud auth login)
REM   3. 환경 변수 설정

echo ==========================================
echo 프로덕션 마이그레이션 실행
echo ==========================================

REM Cloud SQL 인스턴스 정보
set PROJECT_ID=ts-back-nest-479305
set REGION=asia-northeast3
set INSTANCE_NAME=geobuk-db
set CONNECTION_NAME=%PROJECT_ID%:%REGION%:%INSTANCE_NAME%

REM Cloud SQL Proxy 실행 확인
tasklist /FI "IMAGENAME eq cloud-sql-proxy.exe" 2>NUL | find /I /N "cloud-sql-proxy.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo ✅ Cloud SQL Proxy가 이미 실행 중입니다.
) else (
    echo 🔌 Cloud SQL Proxy 시작 중...
    
    if exist "cloud-sql-proxy.exe" (
        start /B cloud-sql-proxy.exe "%CONNECTION_NAME%" --port 5432 > cloud-sql-proxy.log 2>&1
        echo ✅ Cloud SQL Proxy 시작됨
        echo ⏳ Cloud SQL 연결 대기 중...
        timeout /t 5 /nobreak > nul
    ) else (
        echo ❌ cloud-sql-proxy.exe 파일을 찾을 수 없습니다.
        echo    다음 링크에서 다운로드하세요:
        echo    https://cloud.google.com/sql/docs/mysql/sql-proxy#install
        exit /b 1
    )
)

REM 환경 변수 설정
set NODE_ENV=production
set DB_HOST=localhost
set DB_PORT=5432

REM .env.production 파일이 있으면 로드
if exist ".env.production" (
    echo 📂 .env.production 파일 로드 중...
    for /f "delims=" %%x in (.env.production) do (
        set "%%x"
    )
)

REM 필수 환경 변수 확인
if "%DB_PASSWORD%"=="" (
    echo ❌ DB_PASSWORD 환경 변수가 설정되지 않았습니다.
    echo    다음 명령으로 설정하세요:
    echo    set DB_PASSWORD=your-password
    exit /b 1
)

if "%DB_NAME%"=="" (
    echo ❌ DB_NAME 환경 변수가 설정되지 않았습니다.
    exit /b 1
)

echo.
echo 🚀 마이그레이션 실행 중...
echo    DB: %DB_NAME% @ %DB_HOST%:%DB_PORT%
echo.

REM TypeORM CLI를 사용하여 마이그레이션 실행
call yarn typeorm:run

echo.
echo ✅ 마이그레이션 완료!
echo.

echo 💡 Cloud SQL Proxy를 종료하려면 다음 명령을 실행하세요:
echo    taskkill /F /IM cloud-sql-proxy.exe

pause
