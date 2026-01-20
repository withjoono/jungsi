# DB 상태 확인 스크립트

# 환경 변수 설정
$env:NODE_ENV = "production"
$env:DB_HOST = "localhost"
$env:DB_PORT = "5432"
$env:DB_NAME = "geobukschool_prod"
$env:DB_USER = "tsuser"
$env:DB_PASSWORD = "tsuser1234"

# Cloud SQL Proxy 확인
$proxyRunning = Get-Process -Name "cloud-sql-proxy" -ErrorAction SilentlyContinue

if (-not $proxyRunning) {
    Write-Host "⚠️  Cloud SQL Proxy가 실행 중이 아닙니다. 시작 중..." -ForegroundColor Yellow
    
    if (Test-Path ".\cloud-sql-proxy.exe") {
        Start-Process -FilePath ".\cloud-sql-proxy.exe" `
            -ArgumentList "ts-back-nest-479305:asia-northeast3:geobuk-db", "--port", "5432" `
            -WindowStyle Normal
        
        Write-Host "⏳ 연결 대기 중 (10초)..." -ForegroundColor Yellow
        Start-Sleep -Seconds 10
    }
}

# 상태 확인 실행
node check-db-status.js

# 환경 변수 초기화
$env:DB_PASSWORD = $null

Write-Host ""
Write-Host "Press Enter to exit..."
$null = Read-Host
