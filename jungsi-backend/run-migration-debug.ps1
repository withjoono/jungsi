# 마이그레이션 디버그 실행
# 상세한 로그와 함께 실행

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "마이그레이션 디버그 모드" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

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
    Write-Host "⚠️  Cloud SQL Proxy 시작 중..." -ForegroundColor Yellow
    
    if (Test-Path ".\cloud-sql-proxy.exe") {
        Start-Process -FilePath ".\cloud-sql-proxy.exe" `
            -ArgumentList "ts-back-nest-479305:asia-northeast3:geobuk-db", "--port", "5432" `
            -WindowStyle Normal
        Start-Sleep -Seconds 10
    }
}

Write-Host "🔍 디버그 모드로 마이그레이션 실행..." -ForegroundColor Yellow
Write-Host "   모든 SQL 쿼리가 출력됩니다." -ForegroundColor Gray
Write-Host ""

# TypeORM CLI를 직접 호출하여 더 자세한 로그 확인
& yarn ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js migration:run -d ormconfig.ts 2>&1 | Tee-Object -FilePath "migration-debug.log"

Write-Host ""
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 성공!" -ForegroundColor Green
} else {
    Write-Host "❌ 실패 (Exit Code: $LASTEXITCODE)" -ForegroundColor Red
    Write-Host ""
    Write-Host "로그 파일: migration-debug.log" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "마지막 50줄 출력:" -ForegroundColor Yellow
    Write-Host "------------------------------------------" -ForegroundColor Gray
    Get-Content migration-debug.log -Tail 50
}

# 환경 변수 초기화
$env:DB_PASSWORD = $null

Write-Host ""
Write-Host "Press Enter to exit..."
$null = Read-Host
