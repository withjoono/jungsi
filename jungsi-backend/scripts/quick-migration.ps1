# 프로덕션 마이그레이션 빠른 실행 스크립트 (PowerShell)
# 
# 사용법: PowerShell에서 다음과 같이 실행:
#   .\scripts\quick-migration.ps1

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "프로덕션 마이그레이션 빠른 실행" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# 프로덕션 DB 정보 입력
Write-Host "프로덕션 데이터베이스 접속 정보를 입력하세요:" -ForegroundColor Yellow
Write-Host ""

$dbPassword = Read-Host "DB 비밀번호" -AsSecureString
$dbPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPassword))

$dbName = Read-Host "DB 이름 [기본값: geobukschool_prod]"
if ([string]::IsNullOrWhiteSpace($dbName)) {
    $dbName = "geobukschool_prod"
}

$dbUser = Read-Host "DB 사용자 [기본값: postgres]"
if ([string]::IsNullOrWhiteSpace($dbUser)) {
    $dbUser = "postgres"
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "설정 확인" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "DB 이름: $dbName" -ForegroundColor Green
Write-Host "DB 사용자: $dbUser" -ForegroundColor Green
Write-Host "DB 비밀번호: ********" -ForegroundColor Green
Write-Host ""

$confirm = Read-Host "위 정보로 마이그레이션을 실행하시겠습니까? (y/n)"
if ($confirm -ne 'y' -and $confirm -ne 'Y') {
    Write-Host "❌ 취소되었습니다." -ForegroundColor Red
    exit 1
}

# 환경 변수 설정
$env:DB_PASSWORD = $dbPasswordPlain
$env:DB_NAME = $dbName
$env:DB_USER = $dbUser
$env:DB_HOST = "localhost"
$env:DB_PORT = "5432"
$env:NODE_ENV = "production"

Write-Host ""
Write-Host "🔌 Cloud SQL Proxy 시작 중..." -ForegroundColor Yellow

# Cloud SQL 인스턴스 정보
$PROJECT_ID = "ts-back-nest-479305"
$REGION = "asia-northeast3"
$INSTANCE_NAME = "geobuk-db"
$CONNECTION_NAME = "${PROJECT_ID}:${REGION}:${INSTANCE_NAME}"

# Cloud SQL Proxy가 이미 실행 중인지 확인
$proxyProcess = Get-Process -Name "cloud-sql-proxy" -ErrorAction SilentlyContinue

if ($proxyProcess) {
    Write-Host "✅ Cloud SQL Proxy가 이미 실행 중입니다." -ForegroundColor Green
} else {
    # Cloud SQL Proxy 실행
    if (Test-Path "cloud-sql-proxy.exe") {
        Start-Process -FilePath ".\cloud-sql-proxy.exe" -ArgumentList $CONNECTION_NAME, "--port", "5432" -WindowStyle Hidden -RedirectStandardOutput "cloud-sql-proxy.log" -RedirectStandardError "cloud-sql-proxy-error.log"
        Write-Host "✅ Cloud SQL Proxy 시작됨" -ForegroundColor Green
        Write-Host "⏳ Cloud SQL 연결 대기 중..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
    } else {
        Write-Host "❌ cloud-sql-proxy.exe 파일을 찾을 수 없습니다." -ForegroundColor Red
        Write-Host "   다음 링크에서 다운로드하세요:" -ForegroundColor Yellow
        Write-Host "   https://cloud.google.com/sql/docs/mysql/sql-proxy#install" -ForegroundColor Cyan
        exit 1
    }
}

Write-Host ""
Write-Host "🚀 마이그레이션 실행 중..." -ForegroundColor Yellow
Write-Host "   DB: $dbName @ localhost:5432" -ForegroundColor Cyan
Write-Host ""

# 마이그레이션 실행
try {
    # 환경 변수를 명시적으로 전달
    $env:NODE_ENV = "production"
    $env:DB_HOST = "localhost"
    $env:DB_PORT = "5432"
    
    Write-Host "🔍 환경 변수 확인:" -ForegroundColor Cyan
    Write-Host "   NODE_ENV: $env:NODE_ENV" -ForegroundColor Gray
    Write-Host "   DB_HOST: $env:DB_HOST" -ForegroundColor Gray
    Write-Host "   DB_PORT: $env:DB_PORT" -ForegroundColor Gray
    Write-Host "   DB_NAME: $env:DB_NAME" -ForegroundColor Gray
    Write-Host "   DB_USER: $env:DB_USER" -ForegroundColor Gray
    Write-Host ""
    
    & yarn typeorm:run
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ 마이그레이션 완료!" -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "❌ 마이그레이션 실행 중 오류가 발생했습니다." -ForegroundColor Red
        Write-Host ""
    }
} catch {
    Write-Host ""
    Write-Host "❌ 오류: $_" -ForegroundColor Red
    Write-Host ""
}

Write-Host "💡 Cloud SQL Proxy를 종료하려면 다음 명령을 실행하세요:" -ForegroundColor Yellow
Write-Host "   Get-Process -Name 'cloud-sql-proxy' | Stop-Process" -ForegroundColor Cyan
Write-Host ""

# 환경 변수 초기화 (보안)
$env:DB_PASSWORD = $null
$dbPasswordPlain = $null

Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
