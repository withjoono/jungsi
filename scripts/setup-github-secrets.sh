#!/bin/bash

# GitHub Actions Secrets 자동 설정 스크립트
# 
# 사용법: ./scripts/setup-github-secrets.sh

set -e

echo "=========================================="
echo "GitHub Actions Secrets 설정"
echo "=========================================="
echo ""

# 필요한 도구 확인
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh)가 설치되지 않았습니다."
    echo "   설치: https://cli.github.com/"
    exit 1
fi

if ! command -v gcloud &> /dev/null; then
    echo "❌ Google Cloud SDK가 설치되지 않았습니다."
    echo "   설치: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

echo "✅ 필요한 도구가 모두 설치되어 있습니다."
echo ""

# GitHub 인증 확인
echo "🔐 GitHub 인증 확인..."
if ! gh auth status &> /dev/null; then
    echo "GitHub에 로그인이 필요합니다."
    gh auth login
fi
echo "✅ GitHub 인증 완료"
echo ""

# GCP 인증 확인
echo "🔐 GCP 인증 확인..."
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" &> /dev/null; then
    echo "GCP에 로그인이 필요합니다."
    gcloud auth login
fi
echo "✅ GCP 인증 완료"
echo ""

# 프로젝트 설정
PROJECT_ID="ts-back-nest-479305"
REPO="withjoono/jungsi"

echo "📊 프로젝트 정보:"
echo "   GCP Project: $PROJECT_ID"
echo "   GitHub Repo: $REPO"
echo ""

# 입력 받기
read -p "데이터베이스 사용자 (기본값: tsuser): " DB_USER
DB_USER=${DB_USER:-tsuser}

read -sp "데이터베이스 비밀번호: " DB_PASSWORD
echo ""

read -p "데이터베이스 이름 (기본값: geobukschool_prod): " DB_NAME
DB_NAME=${DB_NAME:-geobukschool_prod}

read -p "Cloud Run Service URL (예: https://jungsi-backend-xxxx.run.app): " API_URL

echo ""
echo "=========================================="
echo "1단계: GCP Service Account 생성"
echo "=========================================="

SA_NAME="github-actions-deploy"
SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

# Service Account 생성 (이미 있으면 무시)
if gcloud iam service-accounts describe "$SA_EMAIL" --project="$PROJECT_ID" &> /dev/null; then
    echo "ℹ️  Service Account가 이미 존재합니다: $SA_EMAIL"
else
    gcloud iam service-accounts create "$SA_NAME" \
        --display-name="GitHub Actions Deploy" \
        --project="$PROJECT_ID"
    echo "✅ Service Account 생성 완료"
fi

# 권한 부여
echo "🔐 권한 부여 중..."
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/run.admin" \
    --quiet

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/cloudsql.client" \
    --quiet

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/storage.admin" \
    --quiet

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/iam.serviceAccountUser" \
    --quiet

echo "✅ 권한 부여 완료"

# JSON 키 생성
echo "🔑 Service Account 키 생성 중..."
KEY_FILE="gcp-sa-key.json"
gcloud iam service-accounts keys create "$KEY_FILE" \
    --iam-account="$SA_EMAIL" \
    --project="$PROJECT_ID"
echo "✅ 키 파일 생성: $KEY_FILE"

echo ""
echo "=========================================="
echo "2단계: Secret Manager에 비밀 저장"
echo "=========================================="

# Secret Manager에 저장
echo "💾 Secret Manager에 비밀 저장 중..."

# DB Password
echo -n "$DB_PASSWORD" | gcloud secrets create db-password --data-file=- --project="$PROJECT_ID" 2>/dev/null \
    && echo "✅ db-password 생성 완료" \
    || echo "ℹ️  db-password가 이미 존재합니다"

# DB Name
echo -n "$DB_NAME" | gcloud secrets create db-name --data-file=- --project="$PROJECT_ID" 2>/dev/null \
    && echo "✅ db-name 생성 완료" \
    || echo "ℹ️  db-name이 이미 존재합니다"

# DB User
echo -n "$DB_USER" | gcloud secrets create db-user --data-file=- --project="$PROJECT_ID" 2>/dev/null \
    && echo "✅ db-user 생성 완료" \
    || echo "ℹ️  db-user가 이미 존재합니다"

# JWT Secret (랜덤 생성)
JWT_SECRET=$(openssl rand -base64 32)
echo -n "$JWT_SECRET" | gcloud secrets create jwt-secret --data-file=- --project="$PROJECT_ID" 2>/dev/null \
    && echo "✅ jwt-secret 생성 완료" \
    || echo "ℹ️  jwt-secret이 이미 존재합니다"

# Service Account에 권한 부여
for secret in db-password db-name db-user jwt-secret; do
    gcloud secrets add-iam-policy-binding "$secret" \
        --member="serviceAccount:$SA_EMAIL" \
        --role="roles/secretmanager.secretAccessor" \
        --project="$PROJECT_ID" \
        --quiet
done

echo "✅ Secret Manager 설정 완료"

echo ""
echo "=========================================="
echo "3단계: GitHub Secrets 설정"
echo "=========================================="

echo "📤 GitHub Secrets 업로드 중..."

# GCP Service Account Key
gh secret set GCP_SA_KEY --repo="$REPO" < "$KEY_FILE"
echo "✅ GCP_SA_KEY 설정 완료"

# Database Secrets (직접 값)
echo -n "$DB_USER" | gh secret set DB_USER --repo="$REPO"
echo "✅ DB_USER 설정 완료"

echo -n "$DB_PASSWORD" | gh secret set DB_PASSWORD --repo="$REPO"
echo "✅ DB_PASSWORD 설정 완료"

echo -n "$DB_NAME" | gh secret set DB_NAME --repo="$REPO"
echo "✅ DB_NAME 설정 완료"

# Secret Manager 이름들
echo -n "db-password" | gh secret set DB_PASSWORD_SECRET_NAME --repo="$REPO"
echo "✅ DB_PASSWORD_SECRET_NAME 설정 완료"

echo -n "db-name" | gh secret set DB_NAME_SECRET_NAME --repo="$REPO"
echo "✅ DB_NAME_SECRET_NAME 설정 완료"

echo -n "db-user" | gh secret set DB_USER_SECRET_NAME --repo="$REPO"
echo "✅ DB_USER_SECRET_NAME 설정 완료"

echo -n "jwt-secret" | gh secret set JWT_SECRET_NAME --repo="$REPO"
echo "✅ JWT_SECRET_NAME 설정 완료"

# API URLs
echo -n "$API_URL" | gh secret set VITE_API_URL_NEST --repo="$REPO"
echo "✅ VITE_API_URL_NEST 설정 완료"

echo -n "$API_URL" | gh secret set VITE_API_URL_SPRING --repo="$REPO"
echo "✅ VITE_API_URL_SPRING 설정 완료"

# 정리
echo ""
echo "🧹 임시 파일 정리..."
rm -f "$KEY_FILE"
echo "✅ 정리 완료"

echo ""
echo "=========================================="
echo "✅ 설정 완료!"
echo "=========================================="
echo ""
echo "다음 단계:"
echo "1. Firebase Service Account를 수동으로 추가하세요:"
echo "   gh secret set FIREBASE_SERVICE_ACCOUNT --repo=$REPO < firebase-service-account.json"
echo ""
echo "2. 코드를 push하면 자동 배포가 시작됩니다:"
echo "   git add ."
echo "   git commit -m 'Setup GitHub Actions deployment'"
echo "   git push origin main"
echo ""
echo "3. GitHub Actions 탭에서 배포 상태를 확인하세요:"
echo "   https://github.com/$REPO/actions"
echo ""
