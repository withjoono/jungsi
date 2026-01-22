@echo off
:: Jungsi 서버 중지 스크립트

powershell -ExecutionPolicy Bypass -File "%~dp0stop-servers.ps1"

pause
