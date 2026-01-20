@echo off
REM 프로덕션 환경 변수 설정 도우미
REM 
REM 사용법: 이 스크립트를 실행하고 프로덕션 DB 정보를 입력하세요

echo ==========================================
echo 프로덕션 환경 변수 설정
echo ==========================================
echo.

echo 프로덕션 데이터베이스 접속 정보를 입력하세요.
echo (이 정보는 현재 PowerShell 세션에만 적용됩니다)
echo.

REM 데이터베이스 비밀번호 입력
set /p DB_PASSWORD="DB 비밀번호: "
if "%DB_PASSWORD%"=="" (
    echo ❌ 비밀번호가 입력되지 않았습니다.
    pause
    exit /b 1
)

REM 데이터베이스 이름 입력 (기본값: geobukschool_prod)
set /p DB_NAME="DB 이름 [기본값: geobukschool_prod]: "
if "%DB_NAME%"=="" set DB_NAME=geobukschool_prod

REM 데이터베이스 사용자 입력 (기본값: postgres)
set /p DB_USER="DB 사용자 [기본값: postgres]: "
if "%DB_USER%"=="" set DB_USER=postgres

echo.
echo ==========================================
echo 설정 완료
echo ==========================================
echo DB_NAME: %DB_NAME%
echo DB_USER: %DB_USER%
echo DB_PASSWORD: ********
echo.

echo 다음 명령어를 복사하여 PowerShell에서 실행하세요:
echo.
echo $env:DB_PASSWORD = "%DB_PASSWORD%"
echo $env:DB_NAME = "%DB_NAME%"
echo $env:DB_USER = "%DB_USER%"
echo.
echo 또는 다음 명령으로 마이그레이션을 바로 실행하세요:
echo scripts\run-migration-via-proxy.bat
echo.

pause
