# 마이그레이션 단계별 실행 스크립트
# 여러 마이그레이션을 한 번에 실행하면 충돌이 발생할 수 있으므로
# 하나씩 실행하는 스크립트

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "마이그레이션 단계별 실행" -ForegroundColor Cyan
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
    Write-Host "⚠️  Cloud SQL Proxy가 실행 중이 아닙니다." -ForegroundColor Yellow
    Write-Host "🔌 Cloud SQL Proxy 시작 중..." -ForegroundColor Yellow
    
    if (Test-Path ".\cloud-sql-proxy.exe") {
        Start-Process -FilePath ".\cloud-sql-proxy.exe" `
            -ArgumentList "ts-back-nest-479305:asia-northeast3:geobuk-db", "--port", "5432" `
            -WindowStyle Normal
        
        Write-Host "✅ Cloud SQL Proxy 시작됨" -ForegroundColor Green
        Write-Host "⏳ 연결 대기 중 (10초)..." -ForegroundColor Yellow
        Start-Sleep -Seconds 10
    }
}

Write-Host "📋 실행할 마이그레이션 목록:" -ForegroundColor Yellow
Write-Host "   1. AddMemberJungsiRecruitmentScores" -ForegroundColor Gray
Write-Host "   2. AddMemberJungsiInputScores" -ForegroundColor Gray
Write-Host "   3. AddMemberJungsiFactorScores" -ForegroundColor Gray
Write-Host "   4. AddYubuliPercentileColumns" -ForegroundColor Gray
Write-Host "   5. AddCumulativePercentileToInputScores" -ForegroundColor Gray
Write-Host ""

$confirm = Read-Host "계속 진행하시겠습니까? (y/n)"
if ($confirm -ne 'y' -and $confirm -ne 'Y') {
    Write-Host "❌ 취소되었습니다." -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "마이그레이션 실행 시작" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# 마이그레이션 실행
$success = $true

try {
    Write-Host "🚀 모든 마이그레이션 실행 중..." -ForegroundColor Yellow
    Write-Host ""
    
    & yarn typeorm:run
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ 모든 마이그레이션 완료!" -ForegroundColor Green
        $success = $true
    } else {
        Write-Host ""
        Write-Host "❌ 마이그레이션 실패 (Exit Code: $LASTEXITCODE)" -ForegroundColor Red
        $success = $false
    }
} catch {
    Write-Host ""
    Write-Host "❌ 오류 발생: $($_.Exception.Message)" -ForegroundColor Red
    $success = $false
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "최종 상태 확인" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

if ($success) {
    Write-Host "상태를 확인하시겠습니까? (y/n)" -NoNewline
    $checkStatus = Read-Host
    
    if ($checkStatus -eq 'y' -or $checkStatus -eq 'Y') {
        Write-Host ""
        node check-db-status.js
    }
}

# 환경 변수 초기화
$env:DB_PASSWORD = $null

Write-Host ""
Write-Host "Press Enter to exit..."
$null = Read-Host
