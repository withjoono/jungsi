# ⚡ 빠른 배포 가이드

가장 빠르게 배포하는 방법을 안내합니다.

## 🎯 한 줄 요약

**Git에 푸시하면 자동으로 배포됩니다!**

```bash
git add .
git commit -m "your changes"
git push origin main
# ✅ GitHub Actions가 자동으로 배포합니다!
```

---

## 📝 최초 설정 (1회만)

### 1. GitHub Secrets 설정

배포를 위해 GitHub에 Google Cloud 인증 정보를 추가해야 합니다.

#### Step 1: Google Cloud 서비스 계정 키 생성

```bash
# 1. 서비스 계정 생성
gcloud iam service-accounts create github-actions \
  --display-name "GitHub Actions Deployer"

# 2. 권한 부여
gcloud projects add-iam-policy-binding ts-back-nest-479305 \
  --member="serviceAccount:github-actions@ts-back-nest-479305.iam.gserviceaccount.com" \
  --role="roles/appengine.deployer"

gcloud projects add-iam-policy-binding ts-back-nest-479305 \
  --member="serviceAccount:github-actions@ts-back-nest-479305.iam.gserviceaccount.com" \
  --role="roles/cloudbuild.builds.editor"

gcloud projects add-iam-policy-binding ts-back-nest-479305 \
  --member="serviceAccount:github-actions@ts-back-nest-479305.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

# 3. JSON 키 생성
gcloud iam service-accounts keys create gcp-key.json \
  --iam-account=github-actions@ts-back-nest-479305.iam.gserviceaccount.com

# 4. JSON 파일 내용 확인
cat gcp-key.json
```

#### Step 2: GitHub Repository에 Secret 추가

1. https://github.com/withjoono/jungsi/settings/secrets/actions 접속
2. `New repository secret` 클릭
3. **Name**: `GCP_SA_KEY`
4. **Value**: 위에서 생성한 `gcp-key.json` 파일의 전체 내용 붙여넣기
5. `Add secret` 클릭

#### Step 3: Firebase Service Account 추가 (프론트엔드용)

```bash
# Firebase 토큰 생성
firebase login:ci

# 출력된 토큰을 복사
```

1. https://github.com/withjoono/jungsi/settings/secrets/actions 접속
2. `New repository secret` 클릭
3. **Name**: `FIREBASE_SERVICE_ACCOUNT`
4. **Value**: 위에서 생성한 토큰 붙여넣기
5. `Add secret` 클릭

**완료!** 이제 설정이 끝났습니다. 🎉

---

## 🚀 배포 방법

### 방법 1: 자동 배포 (추천) ⭐

**가장 쉬운 방법입니다!**

```bash
# 1. 변경사항 커밋
git add .
git commit -m "feat: add new feature"

# 2. main 브랜치에 푸시
git push origin main

# 3. 끝!
# GitHub에서 자동으로 빌드하고 배포합니다.
```

**배포 진행 상황 확인**:
- https://github.com/withjoono/jungsi/actions

**언제 배포되나요?**
- `jungsi-backend/` 폴더 변경 → 백엔드 자동 배포
- `jungsi-frontend/` 폴더 변경 → 프론트엔드 자동 배포

### 방법 2: 수동 배포 (Windows)

**백엔드 배포**:
```bash
# 프로젝트 루트에서 실행
deploy-backend.bat
```

**프론트엔드 배포**:
```bash
cd jungsi-frontend
npm run build
firebase deploy --only hosting
```

### 방법 3: 수동 배포 (Linux/Mac)

**백엔드 배포**:
```bash
# 프로젝트 루트에서 실행
./deploy-backend.sh
```

**프론트엔드 배포**:
```bash
./deploy-frontend.sh
```

---

## ✅ 배포 확인

### 백엔드 확인

```bash
# API 테스트
curl https://ts-back-nest-479305.du.r.appspot.com/

# Swagger 문서 확인
# 브라우저에서: https://ts-back-nest-479305.du.r.appspot.com/swagger
```

### 프론트엔드 확인

Firebase Console에서 URL 확인:
- https://console.firebase.google.com/project/ts-back-nest-479305/hosting

---

## 🔧 마이그레이션 + 배포

**데이터베이스 스키마를 변경한 경우:**

```bash
# 1. 먼저 마이그레이션 실행 (프로덕션 DB)
cd jungsi-backend
node run-migration-direct.js

# 2. 그 다음 코드 배포
git add .
git commit -m "feat: add new db column"
git push origin main
```

**⚠️ 중요**: 마이그레이션을 먼저 실행하지 않으면 서버가 크래시할 수 있습니다!

---

## 🆘 문제 해결

### GitHub Actions 배포 실패

**확인 사항**:
1. GitHub Secrets가 올바르게 설정되어 있나요?
   - https://github.com/withjoono/jungsi/settings/secrets/actions
2. `GCP_SA_KEY` Secret이 유효한 JSON인가요?
3. Actions 탭에서 에러 로그를 확인하세요
   - https://github.com/withjoono/jungsi/actions

### 로컬 배포 실패

**Google Cloud 인증**:
```bash
gcloud auth login
gcloud config set project ts-back-nest-479305
```

**Firebase 인증**:
```bash
firebase logout
firebase login
```

---

## 📚 더 자세한 정보

전체 배포 가이드는 `DEPLOYMENT_GUIDE.md`를 참고하세요.

---

## 🎓 배포 흐름 이해하기

```
코드 작성
    ↓
Git 커밋
    ↓
Git 푸시 (main 브랜치)
    ↓
GitHub Actions 자동 실행
    ├─ 의존성 설치
    ├─ 빌드
    ├─ 테스트 (선택)
    └─ Google Cloud 배포
        ↓
    ✅ 배포 완료!
```

**장점**:
- ✅ 간단함: `git push`만 하면 끝
- ✅ 안전함: 자동으로 빌드/테스트
- ✅ 추적 가능: GitHub에서 배포 이력 확인
- ✅ 롤백 가능: 이전 커밋으로 되돌리기 쉬움
