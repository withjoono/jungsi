#!/bin/bash

# Jungsi Frontend 배포 스크립트
# Firebase Hosting에 배포합니다.

set -e  # 에러 발생 시 스크립트 중단

echo ""
echo "=========================================="
echo "🚀 Jungsi Frontend 배포 시작"
echo "=========================================="
echo ""

# 현재 디렉토리 확인
if [ ! -d "jungsi-frontend" ]; then
    echo "❌ Error: jungsi-frontend 디렉토리를 찾을 수 없습니다."
    echo "   프로젝트 루트에서 실행해주세요."
    exit 1
fi

cd jungsi-frontend

# Node.js 버전 확인
echo "📦 Node.js 버전 확인..."
node --version

# 의존성 설치
echo ""
echo "📥 의존성 설치 중..."
npm ci

# 빌드
echo ""
echo "🔨 애플리케이션 빌드 중..."
npm run build

# Firebase CLI 확인
echo ""
echo "🔥 Firebase CLI 확인..."
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI가 설치되어 있지 않습니다."
    echo "   다음 명령어로 설치해주세요: npm install -g firebase-tools"
    exit 1
fi

# Firebase 로그인 확인
echo ""
echo "🔐 Firebase 인증 확인 중..."
if ! firebase projects:list &> /dev/null; then
    echo "⚠️  Firebase 로그인이 필요합니다."
    echo "   다음 명령어를 실행해주세요: firebase login"
    exit 1
fi

# 배포 확인
echo ""
echo "📋 배포 정보:"
echo "   - 프로젝트: ts-back-nest-479305"
echo "   - 환경: production"
echo ""
read -p "배포를 계속하시겠습니까? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ 배포가 취소되었습니다."
    exit 1
fi

# Firebase Hosting 배포
echo ""
echo "🚀 Firebase Hosting에 배포 중..."
firebase deploy --only hosting

# 배포 완료
echo ""
echo "=========================================="
echo "✅ 배포 완료!"
echo "=========================================="
echo ""
echo "🌐 프론트엔드 URL을 확인하세요."
echo ""
