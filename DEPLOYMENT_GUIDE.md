# 🚀 Jungsi 배포 가이드

이 문서는 Jungsi 프로젝트(백엔드 + 프론트엔드)를 배포하는 방법을 설명합니다.

## 📋 목차

1. [사전 준비](#사전-준비)
2. [GitHub Secrets 설정](#github-secrets-설정)
3. [자동 배포 (GitHub Actions)](#자동-배포-github-actions)
4. [수동 배포](#수동-배포)
5. [배포 확인](#배포-확인)
6. [트러블슈팅](#트러블슈팅)

---

## 사전 준비

### 필수 도구 설치

#### 백엔드 배포를 위한 도구
```bash
# Google Cloud SDK 설치 (https://cloud.google.com/sdk/docs/install)
gcloud --version

# Google Cloud 로그인
gcloud auth login

# 프로젝트 설정
gcloud config set project ts-back-nest-479305
```

#### 프론트엔드 배포를 위한 도구
```bash
# Firebase CLI 설치
npm install -g firebase-tools

# Firebase 로그인
firebase login
```

### Google Cloud 권한 확인

배포를 위해 다음 권한이 필요합니다:
- **App Engine Admin** (백엔드)
- **Cloud Build Editor** (빌드)
- **Service Account User** (서비스 계정)

---

## GitHub Secrets 설정

GitHub Actions를 통한 자동 배포를 위해 다음 Secrets를 설정해야 합니다.

### 1. Repository Settings로 이동
```
GitHub Repository → Settings → Secrets and variables → Actions
```

### 2. 필수 Secrets 추가

#### `GCP_SA_KEY` (Google Cloud Service Account)

**생성 방법**:
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

# 4. JSON 파일 내용을 복사하여 GitHub Secret으로 추가
cat gcp-key.json
```

#### `FIREBASE_SERVICE_ACCOUNT` (Firebase)

**생성 방법**:
```bash
# Firebase Console에서 생성
# https://console.firebase.google.com/project/ts-back-nest-479305/settings/serviceaccounts/adminsdk

# 또는 Firebase CLI 사용
firebase login:ci
# 생성된 토큰을 GitHub Secret으로 추가
```

---

## 자동 배포 (GitHub Actions)

### 백엔드 자동 배포

`jungsi-backend/` 폴더의 변경사항을 `main` 브랜치에 푸시하면 자동으로 배포됩니다.

```bash
# 1. 변경사항 커밋
git add jungsi-backend/
git commit -m "feat: update backend feature"

# 2. main 브랜치에 푸시
git push origin main

# 3. GitHub Actions에서 자동 배포 시작
# https://github.com/withjoono/jungsi/actions
```

**워크플로우**: `.github/workflows/deploy-backend.yml`

**배포 조건**:
- `main` 브랜치에 푸시
- `jungsi-backend/**` 경로의 파일 변경
- 수동 실행 (`workflow_dispatch`)

### 프론트엔드 자동 배포

`jungsi-frontend/` 폴더의 변경사항을 `main` 브랜치에 푸시하면 자동으로 배포됩니다.

```bash
# 1. 변경사항 커밋
git add jungsi-frontend/
git commit -m "feat: update frontend feature"

# 2. main 브랜치에 푸시
git push origin main

# 3. GitHub Actions에서 자동 배포 시작
```

**워크플로우**: `.github/workflows/deploy-frontend.yml`

**배포 조건**:
- `main` 브랜치에 푸시
- `jungsi-frontend/**` 경로의 파일 변경
- 수동 실행 (`workflow_dispatch`)

### 수동으로 GitHub Actions 실행

1. GitHub Repository → Actions 탭
2. 원하는 워크플로우 선택
3. `Run workflow` 버튼 클릭
4. `main` 브랜치 선택 후 실행

---

## 수동 배포

### 백엔드 수동 배포

#### Linux/Mac:
```bash
# 프로젝트 루트에서 실행
chmod +x deploy-backend.sh
./deploy-backend.sh
```

#### Windows:
```bash
# 프로젝트 루트에서 실행
deploy-backend.bat
```

#### 단계별 수동 배포:
```bash
cd jungsi-backend

# 1. 의존성 설치
yarn install

# 2. 빌드
yarn build

# 3. JSON 데이터 파일 복사
yarn copy:jungsi-data

# 4. Google Cloud 설정
gcloud config set project ts-back-nest-479305

# 5. 배포
gcloud app deploy
```

### 프론트엔드 수동 배포

#### Linux/Mac:
```bash
# 프로젝트 루트에서 실행
chmod +x deploy-frontend.sh
./deploy-frontend.sh
```

#### 단계별 수동 배포:
```bash
cd jungsi-frontend

# 1. 의존성 설치
npm ci

# 2. 빌드
npm run build

# 3. Firebase 배포
firebase deploy --only hosting
```

---

## 배포 확인

### 백엔드 배포 확인

**URL**: https://ts-back-nest-479305.du.r.appspot.com

```bash
# API 헬스 체크
curl https://ts-back-nest-479305.du.r.appspot.com/

# 로그 확인
gcloud app logs tail -s default

# 인스턴스 확인
gcloud app instances list
```

### 프론트엔드 배포 확인

```bash
# Firebase 호스팅 URL 확인
firebase hosting:channel:list

# 배포 이력 확인
firebase hosting:releases:list
```

---

## 트러블슈팅

### 문제: Google Cloud 인증 실패

**증상**: `ERROR: (gcloud.app.deploy) User [...] does not have permission to access app`

**해결**:
```bash
# 1. 재인증
gcloud auth login

# 2. 프로젝트 확인
gcloud config get-value project

# 3. 권한 확인
gcloud projects get-iam-policy ts-back-nest-479305
```

### 문제: 빌드 실패

**증상**: `Build failed with error`

**해결**:
```bash
# 1. 로컬에서 빌드 테스트
cd jungsi-backend
yarn build

# 2. node_modules 삭제 후 재설치
rm -rf node_modules
yarn install

# 3. 캐시 클리어
yarn cache clean
```

### 문제: GitHub Actions Secret 오류

**증상**: `Error: google-github-actions/auth failed with: failed to generate Google Cloud credential`

**해결**:
1. GitHub Secrets에 `GCP_SA_KEY`가 올바르게 설정되어 있는지 확인
2. JSON 키 파일 전체 내용이 복사되었는지 확인
3. JSON 형식이 올바른지 확인 (시작: `{`, 끝: `}`)

### 문제: Firebase 배포 실패

**증상**: `Error: HTTP Error: 403, The caller does not have permission`

**해결**:
```bash
# 1. Firebase 재로그인
firebase logout
firebase login

# 2. 프로젝트 확인
firebase use ts-back-nest-479305

# 3. 권한 확인
firebase projects:list
```

---

## 배포 체크리스트

### 백엔드 배포 전 체크리스트
- [ ] 마이그레이션 파일이 있다면 프로덕션 DB에 먼저 실행
- [ ] 환경 변수가 `app.yaml`에 올바르게 설정되어 있는지 확인
- [ ] `yarn build`가 로컬에서 정상 작동하는지 확인
- [ ] API 엔드포인트 변경이 있다면 프론트엔드도 함께 배포

### 프론트엔드 배포 전 체크리스트
- [ ] API URL이 프로덕션 백엔드를 가리키는지 확인
- [ ] `npm run build`가 로컬에서 정상 작동하는지 확인
- [ ] 환경 변수 파일이 올바른지 확인

---

## 빠른 참조

### 자주 사용하는 명령어

```bash
# 백엔드 배포 (Windows)
deploy-backend.bat

# 프론트엔드 배포
cd jungsi-frontend && npm run build && firebase deploy --only hosting

# 로그 확인
gcloud app logs tail -s default

# Git 푸시 후 자동 배포
git add .
git commit -m "your message"
git push origin main
```

### 배포 URL

- **백엔드 API**: https://ts-back-nest-479305.du.r.appspot.com
- **Swagger 문서**: https://ts-back-nest-479305.du.r.appspot.com/swagger
- **프론트엔드**: Firebase Hosting URL 확인

---

## 추가 리소스

- [Google App Engine 문서](https://cloud.google.com/appengine/docs)
- [Firebase Hosting 문서](https://firebase.google.com/docs/hosting)
- [GitHub Actions 문서](https://docs.github.com/en/actions)
