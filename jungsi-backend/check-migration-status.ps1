# 마이그레이션 상태 확인 스크립트

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "마이그레이션 상태 확인" -ForegroundColor Cyan
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
    Write-Host "⚠️  Cloud SQL Proxy가 실행 중이 아닙니다. 시작 중..." -ForegroundColor Yellow
    
    if (Test-Path ".\cloud-sql-proxy.exe") {
        Start-Process -FilePath ".\cloud-sql-proxy.exe" `
            -ArgumentList "ts-back-nest-479305:asia-northeast3:geobuk-db", "--port", "5432" `
            -WindowStyle Normal
        Start-Sleep -Seconds 10
    }
}

Write-Host "📊 데이터베이스 상태 확인 중..." -ForegroundColor Yellow
Write-Host ""

# SQL 쿼리로 확인
$checkScript = @"
const { Client } = require('pg');

async function checkStatus() {
    const client = new Client({
        host: 'localhost',
        port: 5432,
        database: 'geobukschool_prod',
        user: 'tsuser',
        password: 'tsuser1234',
    });

    try {
        await client.connect();
        console.log('✅ 데이터베이스 연결 성공\n');

        // 1. 실행된 마이그레이션 확인
        console.log('📋 실행된 마이그레이션:');
        const migrations = await client.query(
            'SELECT * FROM typeorm_migrations ORDER BY timestamp DESC LIMIT 10'
        );
        
        if (migrations.rows.length === 0) {
            console.log('   (없음)');
        } else {
            migrations.rows.forEach(row => {
                console.log(\`   ✓ \${row.name} (실행 시간: \${row.timestamp})\`);
            });
        }

        console.log('\n');

        // 2. js_user_input_scores 테이블의 컬럼 확인
        console.log('🔍 js_user_input_scores 테이블 컬럼:');
        const columns = await client.query(\`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'js_user_input_scores'
            AND column_name IN ('standard_score_sum', 'cumulative_percentile')
            ORDER BY column_name
        \`);

        if (columns.rows.length === 0) {
            console.log('   ❌ standard_score_sum, cumulative_percentile 컬럼이 없습니다.');
            console.log('   → 마이그레이션을 실행해야 합니다.\n');
        } else {
            console.log('   ✅ 컬럼이 이미 존재합니다:');
            columns.rows.forEach(row => {
                console.log(\`      • \${row.column_name} (\${row.data_type}, nullable: \${row.is_nullable})\`);
            });
            console.log('\n   → 마이그레이션이 이미 실행되었습니다!\n');
        }

        // 3. 특정 마이그레이션 확인
        console.log('🎯 AddCumulativePercentileToInputScores 마이그레이션 상태:');
        const specificMigration = await client.query(
            'SELECT * FROM typeorm_migrations WHERE name LIKE \%AddCumulativePercentile\%'
        );

        if (specificMigration.rows.length > 0) {
            console.log('   ✅ 이미 실행됨');
            specificMigration.rows.forEach(row => {
                console.log(\`      이름: \${row.name}\`);
                console.log(\`      실행 시간: \${row.timestamp}\`);
            });
        } else {
            console.log('   ❌ 아직 실행되지 않음');
        }

    } catch (error) {
        console.error('❌ 오류 발생:', error.message);
    } finally {
        await client.end();
    }
}

checkStatus();
"@

# 임시 파일에 스크립트 저장
$checkScript | Out-File -FilePath "temp-check-migration.js" -Encoding UTF8

# Node.js로 실행
node temp-check-migration.js

# 임시 파일 삭제
Remove-Item -Path "temp-check-migration.js" -ErrorAction SilentlyContinue

# 환경 변수 초기화
$env:DB_PASSWORD = $null

Write-Host ""
Write-Host "Press Enter to exit..."
$null = Read-Host
"@

$checkScript | Out-File -FilePath "jungsi-backend/check-migration-status.ps1" -Encoding UTF8
