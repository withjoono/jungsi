@echo off
REM Jungsi Backend 배포 스크립트 (Windows)
REM Google App Engine에 배포합니다.

echo.
echo ==========================================
echo 🚀 Jungsi Backend 배포 시작
echo ==========================================
echo.

REM 현재 디렉토리 확인
if not exist "jungsi-backend" (
    echo ❌ Error: jungsi-backend 디렉토리를 찾을 수 없습니다.
    echo    프로젝트 루트에서 실행해주세요.
    exit /b 1
)

cd jungsi-backend

REM Node.js 버전 확인
echo 📦 Node.js 버전 확인...
node --version

REM 의존성 설치
echo.
echo 📥 의존성 설치 중...
call yarn install
if errorlevel 1 (
    echo ❌ 의존성 설치 실패
    exit /b 1
)

REM 빌드
echo.
echo 🔨 애플리케이션 빌드 중...
call yarn build
if errorlevel 1 (
    echo ❌ 빌드 실패
    exit /b 1
)

REM JSON 데이터 파일 복사
echo.
echo 📄 JSON 데이터 파일 복사 중...
call yarn copy:jungsi-data

REM Google Cloud 프로젝트 설정
echo.
echo ⚙️  Google Cloud 프로젝트 설정...
gcloud config set project ts-back-nest-479305

REM 배포 확인
echo.
echo 📋 배포 정보:
echo    - 프로젝트: ts-back-nest-479305
echo    - 환경: production
echo    - URL: https://ts-back-nest-479305.du.r.appspot.com
echo.
set /p CONFIRM="배포를 계속하시겠습니까? (y/N): "
if /i not "%CONFIRM%"=="y" (
    echo ❌ 배포가 취소되었습니다.
    exit /b 1
)

REM App Engine 배포
echo.
echo 🚀 App Engine에 배포 중...
gcloud app deploy --quiet
if errorlevel 1 (
    echo ❌ 배포 실패
    exit /b 1
)

REM 배포 완료
echo.
echo ==========================================
echo ✅ 배포 완료!
echo ==========================================
echo.
echo 🌐 백엔드 URL: https://ts-back-nest-479305.du.r.appspot.com
echo 📊 로그 확인: gcloud app logs tail -s default
echo.

cd ..
pause
