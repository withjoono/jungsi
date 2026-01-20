# 프로덕션 마이그레이션 가이드

이 문서는 프로덕션 환경에 데이터베이스 마이그레이션을 안전하게 적용하는 방법을 설명합니다.

## 📋 목차

1. [사전 준비](#사전-준비)
2. [로컬에서 Cloud SQL Proxy로 실행](#로컬에서-cloud-sql-proxy로-실행)
3. [Cloud Run 배포 시 자동 실행](#cloud-run-배포-시-자동-실행)
4. [롤백 방법](#롤백-방법)
5. [트러블슈팅](#트러블슈팅)

---

## 사전 준비

### 1. Cloud SQL Proxy 설치

#### Windows
```bash
# cloud-sql-proxy.exe 다운로드
curl -o cloud-sql-proxy.exe https://dl.google.com/cloudsql/cloud_sql_proxy_x64.exe
```

#### Linux/Mac
```bash
# cloud-sql-proxy 다운로드
curl -o cloud-sql-proxy https://dl.google.com/cloudsql/cloud_sql_proxy.linux.amd64
chmod +x cloud-sql-proxy
```

### 2. GCloud 인증

```bash
# Google Cloud 로그인
gcloud auth login

# 프로젝트 설정
gcloud config set project ts-back-nest-479305

# Application Default Credentials 설정 (중요!)
gcloud auth application-default login
```

### 3. 환경 변수 설정

`.env.production.example`을 복사하여 `.env.production` 파일을 생성하고 실제 값을 입력합니다:

```bash
cp .env.production.example .env.production
```

필수 환경 변수:
- `DB_PASSWORD`: 프로덕션 데이터베이스 비밀번호
- `DB_NAME`: 데이터베이스 이름 (예: `geobukschool_prod`)
- `DB_USER`: 데이터베이스 사용자 (예: `postgres`)

---

## 로컬에서 Cloud SQL Proxy로 실행

이 방법은 로컬 환경에서 Cloud SQL에 안전하게 연결하여 마이그레이션을 실행합니다.

### 방법 1: 스크립트 사용 (권장)

#### Windows
```bash
# jungsi-backend 디렉토리에서
scripts\run-migration-via-proxy.bat
```

#### Linux/Mac
```bash
# jungsi-backend 디렉토리에서
chmod +x scripts/run-migration-via-proxy.sh
./scripts/run-migration-via-proxy.sh
```

#### Yarn 명령어 사용
```bash
# Windows
yarn migration:prod:proxy:win

# Linux/Mac
yarn migration:prod:proxy
```

### 방법 2: 수동으로 단계별 실행

#### 1단계: Cloud SQL Proxy 시작

```bash
# Windows
cloud-sql-proxy.exe ts-back-nest-479305:asia-northeast3:geobuk-db --port 5432

# Linux/Mac
./cloud-sql-proxy ts-back-nest-479305:asia-northeast3:geobuk-db --port 5432
```

터미널을 열어둔 채로 다음 단계로 진행합니다.

#### 2단계: 환경 변수 설정

```bash
# Windows (PowerShell)
$env:NODE_ENV="production"
$env:DB_HOST="localhost"
$env:DB_PORT="5432"
$env:DB_PASSWORD="your-password"
$env:DB_NAME="geobukschool_prod"
$env:DB_USER="postgres"

# Linux/Mac (Bash)
export NODE_ENV=production
export DB_HOST=localhost
export DB_PORT=5432
export DB_PASSWORD='your-password'
export DB_NAME=geobukschool_prod
export DB_USER=postgres
```

#### 3단계: 마이그레이션 실행

```bash
# TypeORM CLI 사용
yarn typeorm:run

# 또는 커스텀 스크립트 사용
yarn migration:prod
```

#### 4단계: 실행 확인

마이그레이션이 성공적으로 실행되면 다음과 같은 메시지가 표시됩니다:

```
✅ Migration AddCumulativePercentileToInputScores1765320000000 has been executed successfully.
✅ js_user_input_scores 테이블에 standard_score_sum, cumulative_percentile 컬럼 추가 완료
```

#### 5단계: Cloud SQL Proxy 종료

```bash
# Ctrl+C로 종료하거나

# Windows
taskkill /F /IM cloud-sql-proxy.exe

# Linux/Mac
pkill -f 'cloud-sql-proxy'
```

---

## Cloud Run 배포 시 자동 실행

### 옵션 1: Entrypoint 스크립트 사용

`Dockerfile`을 수정하여 시작 시 마이그레이션을 자동으로 실행하도록 설정합니다.

#### 1. entrypoint 스크립트 생성

`scripts/docker-entrypoint.sh` 파일:

```bash
#!/bin/sh
set -e

echo "🚀 Starting application..."

# 마이그레이션 실행 (프로덕션 환경에서만)
if [ "$NODE_ENV" = "production" ]; then
  echo "🔄 Running database migrations..."
  node dist/scripts/run-migrations.js || {
    echo "❌ Migration failed!"
    exit 1
  }
  echo "✅ Migrations completed successfully"
fi

# 애플리케이션 시작
echo "🌟 Starting NestJS application..."
exec node dist/main
```

#### 2. Dockerfile 수정

```dockerfile
# ... 기존 내용 ...

# Entrypoint 스크립트 복사
COPY scripts/docker-entrypoint.sh /app/
RUN chmod +x /app/docker-entrypoint.sh

# Entrypoint 설정
ENTRYPOINT ["/app/docker-entrypoint.sh"]
```

### 옵션 2: 수동 배포 전 실행

Cloud Run에 배포하기 전에 로컬에서 마이그레이션을 먼저 실행합니다:

```bash
# 1. 마이그레이션 실행
yarn migration:prod:proxy

# 2. Cloud Run 배포
gcloud run deploy geobukschool-backend \
  --source . \
  --region asia-northeast3 \
  --platform managed \
  --allow-unauthenticated
```

---

## 롤백 방법

마이그레이션에 문제가 발생한 경우 이전 상태로 되돌립니다.

### 1. Cloud SQL Proxy 연결

```bash
# Windows
cloud-sql-proxy.exe ts-back-nest-479305:asia-northeast3:geobuk-db --port 5432

# Linux/Mac
./cloud-sql-proxy ts-back-nest-479305:asia-northeast3:geobuk-db --port 5432
```

### 2. 환경 변수 설정

```bash
export NODE_ENV=production
export DB_HOST=localhost
export DB_PORT=5432
export DB_PASSWORD='your-password'
export DB_NAME=geobukschool_prod
```

### 3. 마이그레이션 롤백 실행

```bash
yarn typeorm:revert
```

### 4. 롤백 확인

다음과 같은 메시지가 표시되면 성공입니다:

```
✅ Migration AddCumulativePercentileToInputScores1765320000000 has been reverted successfully.
```

---

## 트러블슈팅

### 문제: "Connection refused" 오류

**원인**: Cloud SQL Proxy가 실행되지 않았거나 잘못된 포트를 사용 중입니다.

**해결책**:
```bash
# Proxy 프로세스 확인
# Windows
tasklist | findstr cloud-sql-proxy

# Linux/Mac
ps aux | grep cloud-sql-proxy

# 실행 중이 아니면 다시 시작
cloud-sql-proxy ts-back-nest-479305:asia-northeast3:geobuk-db --port 5432
```

### 문제: "Missing required environment variables" 오류

**원인**: 필수 환경 변수가 설정되지 않았습니다.

**해결책**:
```bash
# .env.production 파일 확인
cat .env.production

# 또는 직접 export
export DB_PASSWORD='your-password'
export DB_NAME='geobukschool_prod'
```

### 문제: "Authentication failed" 오류

**원인**: GCloud 인증이 만료되었거나 권한이 부족합니다.

**해결책**:
```bash
# 재인증
gcloud auth login
gcloud auth application-default login

# 권한 확인
gcloud projects get-iam-policy ts-back-nest-479305
```

### 문제: 마이그레이션이 이미 실행됨

**원인**: 해당 마이그레이션이 이미 데이터베이스에 적용되었습니다.

**확인 방법**:
```sql
-- typeorm_migrations 테이블 확인
SELECT * FROM typeorm_migrations ORDER BY timestamp DESC;
```

**해결책**: 정상입니다. 추가 작업이 필요하지 않습니다.

---

## 현재 적용할 마이그레이션

### 1765320000000-AddCumulativePercentileToInputScores.ts

**목적**: `js_user_input_scores` 테이블에 누적백분위 관련 컬럼 추가

**변경 내용**:
- `standard_score_sum` (INTEGER): 표준점수 합계 (국어+수학+탐구2)
- `cumulative_percentile` (DECIMAL(10,6)): 나의 누적백분위 (상위 %)

**영향**:
- 기존 데이터에 영향 없음 (컬럼만 추가, NULL 허용)
- 새로운 점수 저장 시 자동으로 계산되어 저장됨
- 프론트엔드의 "나의 누적백분위" 기능 활성화

**실행 시간**: 약 1-2초 (테이블 크기에 따라 다름)

---

## 체크리스트

마이그레이션 실행 전 다음 사항을 확인하세요:

- [ ] GCloud 인증 완료 (`gcloud auth login`)
- [ ] Cloud SQL Proxy 설치 및 실행
- [ ] `.env.production` 파일 설정 완료
- [ ] 데이터베이스 백업 완료 (선택사항이지만 권장)
- [ ] 로컬에서 마이그레이션 테스트 완료
- [ ] 롤백 방법 숙지

---

## 참고 자료

- [TypeORM Migrations](https://typeorm.io/migrations)
- [Cloud SQL Proxy](https://cloud.google.com/sql/docs/postgres/sql-proxy)
- [Cloud Run Deployment](https://cloud.google.com/run/docs/deploying)
