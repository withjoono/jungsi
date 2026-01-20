# 프로덕션 마이그레이션 즉시 실행
# 환경 변수가 미리 설정된 버전

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "프로덕션 마이그레이션 실행" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# 환경 변수 설정
$env:NODE_ENV = "production"
$env:DB_HOST = "localhost"
$env:DB_PORT = "5432"
$env:DB_NAME = "geobukschool_prod"
$env:DB_USER = "tsuser"
$env:DB_PASSWORD = "tsuser1234"

Write-Host "✅ 환경 변수 설정:" -ForegroundColor Green
Write-Host "   DB: $env:DB_NAME @ $env:DB_HOST:$env:DB_PORT" -ForegroundColor Gray
Write-Host "   User: $env:DB_USER" -ForegroundColor Gray
Write-Host ""

# Cloud SQL Proxy 확인
$proxyRunning = Get-Process -Name "cloud-sql-proxy" -ErrorAction SilentlyContinue

if (-not $proxyRunning) {
    Write-Host "⚠️  Cloud SQL Proxy가 실행 중이 아닙니다." -ForegroundColor Yellow
    Write-Host "🔌 Cloud SQL Proxy 시작 중..." -ForegroundColor Yellow
    
    if (Test-Path ".\cloud-sql-proxy.exe") {
        Start-Process -FilePath ".\cloud-sql-proxy.exe" `
            -ArgumentList "ts-back-nest-479305:asia-northeast3:geobuk-db", "--port", "5432" `
            -WindowStyle Normal
        
        Write-Host "✅ Cloud SQL Proxy 시작됨" -ForegroundColor Green
        Write-Host "⏳ 연결 대기 중 (10초)..." -ForegroundColor Yellow
        Start-Sleep -Seconds 10
    } else {
        Write-Host "❌ cloud-sql-proxy.exe를 찾을 수 없습니다." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ Cloud SQL Proxy 실행 중 (PID: $($proxyRunning.Id))" -ForegroundColor Green
}

Write-Host ""
Write-Host "🚀 마이그레이션 실행 중..." -ForegroundColor Yellow
Write-Host ""

# 마이그레이션 실행
yarn typeorm:run

Write-Host ""
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 마이그레이션 완료!" -ForegroundColor Green
} else {
    Write-Host "❌ 마이그레이션 실패 (Exit Code: $LASTEXITCODE)" -ForegroundColor Red
}

# 환경 변수 초기화
$env:DB_PASSWORD = $null

Write-Host ""
Write-Host "Press Enter to exit..."
$null = Read-Host
