# Jungsi 로컬 서버 중지 스크립트
# 사용법: ./stop-servers.ps1

Write-Host "`n⏹️  Jungsi 서버 중지 중..." -ForegroundColor Yellow

$portsToStop = @(3002, 4002)
$totalKilled = 0

foreach ($port in $portsToStop) {
    try {
        $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        if ($connections) {
            $pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique
            foreach ($pid in $pids) {
                $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
                if ($process) {
                    $processName = $process.ProcessName
                    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                    Write-Host "   ✓ 포트 $port 종료 ($processName, PID: $pid)" -ForegroundColor Gray
                    $totalKilled++
                }
            }
        }
    } catch {
        # 포트를 사용 중인 프로세스가 없으면 무시
    }
}

if ($totalKilled -eq 0) {
    Write-Host "   ℹ️  실행 중인 서버가 없습니다." -ForegroundColor Cyan
} else {
    Write-Host "`n✅ $totalKilled 개의 서버가 중지되었습니다." -ForegroundColor Green
}
Write-Host ""
