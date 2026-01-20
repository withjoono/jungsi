#!/bin/bash

# 프로덕션 마이그레이션 실행 스크립트 (Cloud SQL Proxy 사용)
# 
# 사용법:
#   ./scripts/run-migration-via-proxy.sh
#
# 필요 사항:
#   1. cloud-sql-proxy 설치
#   2. gcloud 인증 완료 (gcloud auth login)
#   3. 환경 변수 설정 (.env.production 또는 직접 export)

set -e

echo "=========================================="
echo "프로덕션 마이그레이션 실행"
echo "=========================================="

# Cloud SQL 인스턴스 정보
PROJECT_ID="ts-back-nest-479305"
REGION="asia-northeast3"
INSTANCE_NAME="geobuk-db"
CONNECTION_NAME="$PROJECT_ID:$REGION:$INSTANCE_NAME"

# Cloud SQL Proxy 프로세스 확인
if pgrep -f "cloud-sql-proxy.*$INSTANCE_NAME" > /dev/null; then
    echo "✅ Cloud SQL Proxy가 이미 실행 중입니다."
else
    echo "🔌 Cloud SQL Proxy 시작 중..."
    
    # Cloud SQL Proxy 실행 (백그라운드)
    if [ -f "./cloud-sql-proxy.exe" ]; then
        # Windows 실행 파일
        ./cloud-sql-proxy.exe "$CONNECTION_NAME" --port 5432 > cloud-sql-proxy.log 2>&1 &
    else
        # Linux/Mac 실행 파일
        cloud-sql-proxy "$CONNECTION_NAME" --port 5432 > cloud-sql-proxy.log 2>&1 &
    fi
    
    PROXY_PID=$!
    echo "✅ Cloud SQL Proxy 시작됨 (PID: $PROXY_PID)"
    
    # 프록시가 준비될 때까지 대기
    echo "⏳ Cloud SQL 연결 대기 중..."
    sleep 5
fi

# 환경 변수 설정 (필요한 경우)
export NODE_ENV=production
export DB_HOST=localhost
export DB_PORT=5432

# .env.production 파일이 있으면 로드
if [ -f ".env.production" ]; then
    echo "📂 .env.production 파일 로드 중..."
    export $(grep -v '^#' .env.production | xargs)
fi

# 필수 환경 변수 확인
if [ -z "$DB_PASSWORD" ]; then
    echo "❌ DB_PASSWORD 환경 변수가 설정되지 않았습니다."
    echo "   다음 명령으로 설정하세요:"
    echo "   export DB_PASSWORD='your-password'"
    exit 1
fi

if [ -z "$DB_NAME" ]; then
    echo "❌ DB_NAME 환경 변수가 설정되지 않았습니다."
    exit 1
fi

# 마이그레이션 실행
echo ""
echo "🚀 마이그레이션 실행 중..."
echo "   DB: $DB_NAME @ $DB_HOST:$DB_PORT"
echo ""

# TypeORM CLI를 사용하여 마이그레이션 실행
yarn typeorm:run

echo ""
echo "✅ 마이그레이션 완료!"
echo ""

# Cloud SQL Proxy 종료 안내
echo "💡 Cloud SQL Proxy를 종료하려면 다음 명령을 실행하세요:"
echo "   pkill -f 'cloud-sql-proxy'"
