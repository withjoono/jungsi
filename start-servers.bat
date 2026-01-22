@echo off
:: Jungsi 서버 간편 시작 스크립트
:: 더블클릭으로 실행 가능

echo.
echo ========================================
echo   Jungsi 서버 시작 스크립트
echo ========================================
echo.

:: PowerShell 실행 정책 확인 및 스크립트 실행
powershell -ExecutionPolicy Bypass -File "%~dp0start-servers.ps1"

pause
