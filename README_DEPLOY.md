# 🚀 Jungsi 프로젝트 배포 정보

## 배포 URL

### 프로덕션
- **백엔드 API**: https://ts-back-nest-479305.du.r.appspot.com
- **Swagger 문서**: https://ts-back-nest-479305.du.r.appspot.com/swagger
- **프론트엔드**: Firebase Hosting (URL은 Firebase Console 확인)

### 개발
- **백엔드**: http://localhost:4001
- **프론트엔드**: http://localhost:3000

---

## 빠른 배포

### ⚡ 가장 빠른 방법

```bash
git add .
git commit -m "your message"
git push origin main
```

**→ GitHub Actions가 자동으로 배포합니다!**

### 📖 배포 가이드

- **빠른 시작**: `QUICKSTART_DEPLOY.md` - 5분 안에 배포
- **상세 가이드**: `DEPLOYMENT_GUIDE.md` - 모든 배포 방법과 트러블슈팅

---

## 배포 방법 비교

| 방법 | 난이도 | 속도 | 추천 |
|------|--------|------|------|
| Git Push (자동) | ⭐ 쉬움 | 5-10분 | ✅ 추천 |
| 스크립트 실행 | ⭐⭐ 보통 | 3-5분 | 로컬 테스트용 |
| 수동 명령어 | ⭐⭐⭐ 어려움 | 5-10분 | 디버깅용 |

---

## 최초 설정 (1회만)

### 1. GitHub Secrets 설정

**필요한 Secrets**:
- `GCP_SA_KEY`: Google Cloud 서비스 계정 키
- `FIREBASE_SERVICE_ACCOUNT`: Firebase 배포 토큰

**설정 위치**: https://github.com/withjoono/jungsi/settings/secrets/actions

**자세한 설정 방법**: `QUICKSTART_DEPLOY.md` 참고

### 2. Google Cloud 인증 (로컬 배포용)

```bash
gcloud auth login
gcloud config set project ts-back-nest-479305
```

### 3. Firebase 인증 (로컬 배포용)

```bash
firebase login
```

---

## 배포 스크립트

### Windows

```bash
# 백엔드 배포
deploy-backend.bat

# 프론트엔드 배포
cd jungsi-frontend
npm run build && firebase deploy --only hosting
```

### Linux/Mac

```bash
# 백엔드 배포
./deploy-backend.sh

# 프론트엔드 배포
./deploy-frontend.sh
```

---

## 배포 체크리스트

### 백엔드 배포 전
- [ ] 마이그레이션이 프로덕션 DB에 실행되었나요?
- [ ] `app.yaml`의 환경 변수가 올바른가요?
- [ ] 로컬에서 `yarn build`가 성공하나요?

### 프론트엔드 배포 전
- [ ] API URL이 프로덕션 백엔드를 가리키나요?
- [ ] 로컬에서 `npm run build`가 성공하나요?

---

## 마이그레이션 + 배포

데이터베이스 스키마 변경 시:

```bash
# 1. 먼저 마이그레이션 실행
cd jungsi-backend
node run-migration-direct.js

# 2. 코드 배포
git add .
git commit -m "feat: database schema update"
git push origin main
```

---

## 배포 확인

### 백엔드

```bash
# API 헬스 체크
curl https://ts-back-nest-479305.du.r.appspot.com/

# 로그 확인
gcloud app logs tail -s default
```

### 프론트엔드

Firebase Console에서 확인:
https://console.firebase.google.com/project/ts-back-nest-479305/hosting

---

## 트러블슈팅

### GitHub Actions 실패

1. [Actions 탭](https://github.com/withjoono/jungsi/actions)에서 에러 로그 확인
2. [Secrets](https://github.com/withjoono/jungsi/settings/secrets/actions) 설정 확인
3. `DEPLOYMENT_GUIDE.md`의 트러블슈팅 섹션 참고

### 로컬 배포 실패

```bash
# Google Cloud 재인증
gcloud auth login

# Firebase 재인증
firebase login
```

---

## 배포 관련 파일

```
.
├── .github/workflows/
│   ├── deploy-backend.yml      # 백엔드 자동 배포
│   └── deploy-frontend.yml     # 프론트엔드 자동 배포
├── deploy-backend.sh           # 백엔드 배포 스크립트 (Unix)
├── deploy-backend.bat          # 백엔드 배포 스크립트 (Windows)
├── deploy-frontend.sh          # 프론트엔드 배포 스크립트 (Unix)
├── DEPLOYMENT_GUIDE.md         # 상세 배포 가이드
├── QUICKSTART_DEPLOY.md        # 빠른 배포 가이드
└── README_DEPLOY.md            # 이 파일
```

---

## Google Cloud 프로젝트 정보

- **프로젝트 ID**: ts-back-nest-479305
- **리전**: asia-northeast3 (서울)
- **서비스**: App Engine (백엔드)
- **데이터베이스**: Cloud SQL (PostgreSQL)

---

## 유용한 링크

- [Google Cloud Console](https://console.cloud.google.com/appengine?project=ts-back-nest-479305)
- [Firebase Console](https://console.firebase.google.com/project/ts-back-nest-479305)
- [GitHub Actions](https://github.com/withjoono/jungsi/actions)
- [GitHub Secrets](https://github.com/withjoono/jungsi/settings/secrets/actions)
