#!/bin/bash

# Jungsi Backend 배포 스크립트
# Google App Engine에 배포합니다.

set -e  # 에러 발생 시 스크립트 중단

echo ""
echo "=========================================="
echo "🚀 Jungsi Backend 배포 시작"
echo "=========================================="
echo ""

# 현재 디렉토리 확인
if [ ! -d "jungsi-backend" ]; then
    echo "❌ Error: jungsi-backend 디렉토리를 찾을 수 없습니다."
    echo "   프로젝트 루트에서 실행해주세요."
    exit 1
fi

cd jungsi-backend

# Node.js 버전 확인
echo "📦 Node.js 버전 확인..."
node --version

# 의존성 설치
echo ""
echo "📥 의존성 설치 중..."
yarn install

# 빌드
echo ""
echo "🔨 애플리케이션 빌드 중..."
yarn build

# JSON 데이터 파일 복사
echo ""
echo "📄 JSON 데이터 파일 복사 중..."
yarn copy:jungsi-data

# Google Cloud 인증 확인
echo ""
echo "🔐 Google Cloud 인증 확인 중..."
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "⚠️  Google Cloud 인증이 필요합니다."
    echo "   다음 명령어를 실행해주세요: gcloud auth login"
    exit 1
fi

# 프로젝트 설정
echo ""
echo "⚙️  Google Cloud 프로젝트 설정..."
gcloud config set project ts-back-nest-479305

# 배포 확인
echo ""
echo "📋 배포 정보:"
echo "   - 프로젝트: ts-back-nest-479305"
echo "   - 환경: production"
echo "   - URL: https://ts-back-nest-479305.du.r.appspot.com"
echo ""
read -p "배포를 계속하시겠습니까? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ 배포가 취소되었습니다."
    exit 1
fi

# App Engine 배포
echo ""
echo "🚀 App Engine에 배포 중..."
gcloud app deploy --quiet

# 배포 완료
echo ""
echo "=========================================="
echo "✅ 배포 완료!"
echo "=========================================="
echo ""
echo "🌐 백엔드 URL: https://ts-back-nest-479305.du.r.appspot.com"
echo "📊 로그 확인: gcloud app logs tail -s default"
echo ""
