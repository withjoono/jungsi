# 프로덕션 마이그레이션 - 간단 버전
# 
# 사용법:
# 1. 이 스크립트를 실행하기 전에 환경 변수를 설정하세요
# 2. PowerShell에서 실행: .\scripts\migrate-prod-simple.ps1

param(
    [Parameter(Mandatory=$false)]
    [string]$DbPassword,
    
    [Parameter(Mandatory=$false)]
    [string]$DbName = "geobukschool_prod",
    
    [Parameter(Mandatory=$false)]
    [string]$DbUser = "postgres"
)

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "프로덕션 마이그레이션 실행" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# 비밀번호 입력
if ([string]::IsNullOrWhiteSpace($DbPassword)) {
    $securePassword = Read-Host "프로덕션 DB 비밀번호" -AsSecureString
    $DbPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
    )
}

# DB 이름 확인
$inputDbName = Read-Host "DB 이름 (Enter = $DbName)"
if (-not [string]::IsNullOrWhiteSpace($inputDbName)) {
    $DbName = $inputDbName
}

# 사용자 확인
$inputDbUser = Read-Host "DB 사용자 (Enter = $DbUser)"
if (-not [string]::IsNullOrWhiteSpace($inputDbUser)) {
    $DbUser = $inputDbUser
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "1단계: Cloud SQL Proxy 확인" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan

# Cloud SQL Proxy 확인
$proxyRunning = Get-Process -Name "cloud-sql-proxy" -ErrorAction SilentlyContinue

if ($proxyRunning) {
    Write-Host "✅ Cloud SQL Proxy가 실행 중입니다 (PID: $($proxyRunning.Id))" -ForegroundColor Green
} else {
    Write-Host "⚠️  Cloud SQL Proxy가 실행 중이 아닙니다." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "다음 명령으로 Cloud SQL Proxy를 시작하세요:" -ForegroundColor Cyan
    Write-Host "  .\cloud-sql-proxy.exe ts-back-nest-479305:asia-northeast3:geobuk-db --port 5432" -ForegroundColor White
    Write-Host ""
    
    $startProxy = Read-Host "자동으로 시작하시겠습니까? (y/n)"
    if ($startProxy -eq 'y' -or $startProxy -eq 'Y') {
        if (Test-Path ".\cloud-sql-proxy.exe") {
            Write-Host "🔌 Cloud SQL Proxy 시작 중..." -ForegroundColor Yellow
            Start-Process -FilePath ".\cloud-sql-proxy.exe" `
                -ArgumentList "ts-back-nest-479305:asia-northeast3:geobuk-db", "--port", "5432" `
                -WindowStyle Normal `
                -RedirectStandardOutput "cloud-sql-proxy.log" `
                -RedirectStandardError "cloud-sql-proxy-error.log"
            
            Write-Host "✅ Cloud SQL Proxy 시작됨" -ForegroundColor Green
            Write-Host "⏳ 연결 대기 중..." -ForegroundColor Yellow
            Start-Sleep -Seconds 8
        } else {
            Write-Host "❌ cloud-sql-proxy.exe를 찾을 수 없습니다." -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "❌ Cloud SQL Proxy를 먼저 시작해주세요." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "2단계: 환경 변수 설정" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan

# 환경 변수 설정
$env:NODE_ENV = "production"
$env:DB_HOST = "localhost"
$env:DB_PORT = "5432"
$env:DB_NAME = $DbName
$env:DB_USER = $DbUser
$env:DB_PASSWORD = $DbPassword

Write-Host "✅ 환경 변수 설정 완료:" -ForegroundColor Green
Write-Host "   NODE_ENV: production" -ForegroundColor Gray
Write-Host "   DB_HOST: localhost" -ForegroundColor Gray
Write-Host "   DB_PORT: 5432" -ForegroundColor Gray
Write-Host "   DB_NAME: $DbName" -ForegroundColor Gray
Write-Host "   DB_USER: $DbUser" -ForegroundColor Gray
Write-Host "   DB_PASSWORD: ********" -ForegroundColor Gray

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "3단계: 마이그레이션 실행" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$confirm = Read-Host "위 설정으로 마이그레이션을 실행하시겠습니까? (y/n)"
if ($confirm -ne 'y' -and $confirm -ne 'Y') {
    Write-Host "❌ 취소되었습니다." -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "🚀 마이그레이션 실행 중..." -ForegroundColor Yellow
Write-Host ""

# 마이그레이션 실행
try {
    & yarn typeorm:run
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "==========================================" -ForegroundColor Green
        Write-Host "✅ 마이그레이션 완료!" -ForegroundColor Green
        Write-Host "==========================================" -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "==========================================" -ForegroundColor Red
        Write-Host "❌ 마이그레이션 실패" -ForegroundColor Red
        Write-Host "==========================================" -ForegroundColor Red
        Write-Host ""
        Write-Host "오류 코드: $LASTEXITCODE" -ForegroundColor Red
    }
} catch {
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Red
    Write-Host "❌ 오류 발생" -ForegroundColor Red
    Write-Host "==========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host $_.Exception.Message -ForegroundColor Red
}

# 환경 변수 초기화
$env:DB_PASSWORD = $null
$DbPassword = $null

Write-Host ""
Write-Host "💡 팁:" -ForegroundColor Yellow
Write-Host "   Cloud SQL Proxy 종료: Get-Process -Name 'cloud-sql-proxy' | Stop-Process" -ForegroundColor Gray
Write-Host "   로그 확인: Get-Content cloud-sql-proxy.log" -ForegroundColor Gray
Write-Host ""

Read-Host "Press Enter to exit"
