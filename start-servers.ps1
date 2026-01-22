# Jungsi 로컬 서버 자동 시작 스크립트
# 사용법: ./start-servers.ps1

Write-Host "`n🚀 Jungsi 서버 시작 스크립트" -ForegroundColor Green
Write-Host "=" * 50 -ForegroundColor Gray

# 1. 기존 프로세스 정리
Write-Host "`n⏹️  기존 프로세스 정리 중..." -ForegroundColor Yellow

$portsToKill = @(3002, 4002)
foreach ($port in $portsToKill) {
    try {
        $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        if ($connections) {
            $pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique
            foreach ($pid in $pids) {
                Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                Write-Host "   ✓ 포트 $port 정리 완료 (PID: $pid)" -ForegroundColor Gray
            }
        }
    } catch {
        # 포트를 사용 중인 프로세스가 없으면 무시
    }
}

Start-Sleep -Seconds 2

# 2. PostgreSQL 확인
Write-Host "`n🐘 PostgreSQL 컨테이너 확인 중..." -ForegroundColor Cyan
try {
    $pgStatus = docker ps --filter "name=geobuk-postgres" --format "{{.Status}}" 2>$null
    if ($pgStatus) {
        Write-Host "   ✓ PostgreSQL 실행 중" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  PostgreSQL 컨테이너가 실행되지 않았습니다." -ForegroundColor Yellow
        Write-Host "   시작 중..." -ForegroundColor Yellow
        docker start geobuk-postgres 2>$null
        Start-Sleep -Seconds 3
    }
} catch {
    Write-Host "   ⚠️  Docker가 설치되지 않았거나 실행 중이 아닙니다." -ForegroundColor Yellow
}

# 3. 백엔드 서버 시작
Write-Host "`n🔧 백엔드 서버 시작 (포트 4002)..." -ForegroundColor Cyan
$backendPath = Join-Path $PSScriptRoot "jungsi-backend"
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; Write-Host '🔧 백엔드 서버' -ForegroundColor Cyan; `$env:PORT=4002; yarn start:dev" -WindowStyle Normal

Write-Host "   ✓ 백엔드 서버 시작됨 (컴파일 대기 중...)" -ForegroundColor Gray
Start-Sleep -Seconds 5

# 4. 프론트엔드 서버 시작
Write-Host "`n🎨 프론트엔드 서버 시작 (포트 3002)..." -ForegroundColor Cyan
$frontendPath = Join-Path $PSScriptRoot "jungsi-frontend"
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; Write-Host '🎨 프론트엔드 서버' -ForegroundColor Magenta; npm run dev" -WindowStyle Normal

Write-Host "   ✓ 프론트엔드 서버 시작됨" -ForegroundColor Gray

# 5. 완료 메시지
Write-Host "`n" + "=" * 50 -ForegroundColor Gray
Write-Host "✅ 서버 시작 완료!" -ForegroundColor Green
Write-Host "`n📚 접속 URL:" -ForegroundColor White
Write-Host "   📱 Frontend:  " -NoNewline -ForegroundColor Gray
Write-Host "http://localhost:3002" -ForegroundColor Cyan
Write-Host "   🔌 Backend:   " -NoNewline -ForegroundColor Gray
Write-Host "http://localhost:4002" -ForegroundColor Cyan
Write-Host "   📖 Swagger:   " -NoNewline -ForegroundColor Gray
Write-Host "http://localhost:4002/swagger" -ForegroundColor Cyan

Write-Host "`n💡 서버 중지:" -ForegroundColor White
Write-Host "   각 터미널 창에서 Ctrl+C를 누르거나" -ForegroundColor Gray
Write-Host "   ./stop-servers.ps1 실행" -ForegroundColor Gray
Write-Host ""
