# GitHub Actions 자동 배포 설정 가이드

## 📋 개요

이 저장소는 GitHub Actions를 통해 자동으로 배포됩니다:
- **Backend**: Cloud Run (`jungsi-backend`)
- **Frontend**: Firebase Hosting (`jungsi.turtleschool.com`)

## 🔐 필수 GitHub Secrets 설정

### 1. Google Cloud Platform (GCP) Secrets

#### `GCP_SA_KEY`
**설명**: GCP Service Account JSON 키  
**생성 방법**:
```bash
# GCP Console에서 Service Account 생성
gcloud iam service-accounts create github-actions-deploy \
  --display-name="GitHub Actions Deploy"

# 권한 부여
gcloud projects add-iam-policy-binding ts-back-nest-479305 \
  --member="serviceAccount:github-actions-deploy@ts-back-nest-479305.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding ts-back-nest-479305 \
  --member="serviceAccount:github-actions-deploy@ts-back-nest-479305.iam.gserviceaccount.com" \
  --role="roles/cloudsql.client"

gcloud projects add-iam-policy-binding ts-back-nest-479305 \
  --member="serviceAccount:github-actions-deploy@ts-back-nest-479305.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

# JSON 키 생성
gcloud iam service-accounts keys create key.json \
  --iam-account=github-actions-deploy@ts-back-nest-479305.iam.gserviceaccount.com

# key.json 파일의 전체 내용을 GitHub Secrets에 추가
```

### 2. Database Secrets

#### `DB_USER`
**설명**: 데이터베이스 사용자명  
**값**: `tsuser` 또는 `postgres`

#### `DB_PASSWORD`
**설명**: 데이터베이스 비밀번호  
**값**: 프로덕션 DB 비밀번호

#### `DB_NAME`
**설명**: 데이터베이스 이름  
**값**: `geobukschool_prod`

#### Secret Manager 버전 (권장)
```bash
# Secret Manager에 비밀번호 저장
echo -n "your-db-password" | gcloud secrets create db-password --data-file=-
echo -n "geobukschool_prod" | gcloud secrets create db-name --data-file=-
echo -n "tsuser" | gcloud secrets create db-user --data-file=-
echo -n "your-jwt-secret" | gcloud secrets create jwt-secret --data-file=-

# Service Account에 Secret 접근 권한 부여
gcloud secrets add-iam-policy-binding db-password \
  --member="serviceAccount:github-actions-deploy@ts-back-nest-479305.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

그 다음 GitHub Secrets에 Secret 이름 추가:
- `DB_PASSWORD_SECRET_NAME`: `db-password`
- `DB_NAME_SECRET_NAME`: `db-name`
- `DB_USER_SECRET_NAME`: `db-user`
- `JWT_SECRET_NAME`: `jwt-secret`

### 3. Firebase Secrets

#### `FIREBASE_SERVICE_ACCOUNT`
**설명**: Firebase Service Account JSON  
**생성 방법**:
1. Firebase Console > Project Settings > Service Accounts
2. "Generate new private key" 클릭
3. JSON 파일 다운로드
4. 파일 내용 전체를 GitHub Secrets에 추가

### 4. Frontend Environment Variables

#### `VITE_API_URL_NEST`
**설명**: Backend API URL  
**값**: `https://jungsi-backend-xxxx-an.a.run.app` (Cloud Run URL)

#### `VITE_API_URL_SPRING`
**설명**: Spring Backend API URL (있는 경우)  
**값**: Backend API URL

## 📝 GitHub Secrets 추가 방법

### GitHub 웹사이트에서:

1. Repository로 이동: `https://github.com/withjoono/jungsi`
2. **Settings** 탭 클릭
3. 왼쪽 메뉴에서 **Secrets and variables** > **Actions** 클릭
4. **New repository secret** 버튼 클릭
5. Name과 Value 입력 후 **Add secret** 클릭

### GitHub CLI로:

```bash
# GitHub CLI 설치 (https://cli.github.com/)
gh auth login

# Secrets 추가
gh secret set GCP_SA_KEY < key.json
gh secret set DB_USER --body "tsuser"
gh secret set DB_PASSWORD --body "your-password"
gh secret set DB_NAME --body "geobukschool_prod"
gh secret set DB_PASSWORD_SECRET_NAME --body "db-password"
gh secret set DB_NAME_SECRET_NAME --body "db-name"
gh secret set DB_USER_SECRET_NAME --body "db-user"
gh secret set JWT_SECRET_NAME --body "jwt-secret"
gh secret set FIREBASE_SERVICE_ACCOUNT < firebase-service-account.json
gh secret set VITE_API_URL_NEST --body "https://jungsi-backend-xxxx-an.a.run.app"
gh secret set VITE_API_URL_SPRING --body "https://jungsi-backend-xxxx-an.a.run.app"
```

## 🚀 배포 트리거

### 자동 배포

#### Backend (Cloud Run)
다음 파일이 변경되면 자동 배포:
- `jungsi-backend/**` 디렉토리의 모든 파일
- `.github/workflows/deploy-backend-cloudrun.yml`

#### Frontend (Firebase)
다음 파일이 변경되면 자동 배포:
- `jungsi-frontend/**` 디렉토리의 모든 파일
- `.github/workflows/deploy-frontend.yml`

### 수동 배포

GitHub Actions 탭에서 **Run workflow** 버튼을 클릭하여 수동으로 배포 가능합니다.

## 📊 배포 프로세스

### Backend 배포 단계:

1. ✅ 코드 체크아웃
2. ✅ Node.js 환경 설정
3. ✅ GCP 인증
4. ✅ Docker 이미지 빌드
5. ✅ GCR에 이미지 푸시
6. ✅ 데이터베이스 마이그레이션 실행
7. ✅ Cloud Run에 배포
8. ✅ URL 확인 및 알림

### Frontend 배포 단계:

1. ✅ 코드 체크아웃
2. ✅ Node.js 환경 설정
3. ✅ Dependencies 설치
4. ✅ 프로덕션 빌드
5. ✅ Firebase Hosting 배포
6. ✅ 배포 완료 알림

## 🔄 마이그레이션 자동 실행

Backend 배포 시 데이터베이스 마이그레이션이 **자동으로 실행**됩니다:
- Cloud SQL Proxy를 통해 안전하게 연결
- 실행되지 않은 마이그레이션만 실행
- 실패 시에도 배포는 계속 진행 (선택 가능)

## 🐛 트러블슈팅

### 배포 실패 시:

1. **GitHub Actions 탭**에서 실패한 워크플로우 확인
2. 각 단계의 로그 확인
3. Secrets 설정이 올바른지 확인
4. GCP Service Account 권한 확인

### 마이그레이션 실패 시:

1. Cloud SQL 인스턴스가 실행 중인지 확인
2. DB 비밀번호가 올바른지 확인
3. 로컬에서 마이그레이션 테스트:
```bash
cd jungsi-backend
.\run-migration-now.ps1
```

## 📞 지원

문제가 발생하면 다음을 확인하세요:
- GitHub Actions 워크플로우 로그
- Cloud Run 로그: `gcloud run logs read jungsi-backend --region=asia-northeast3`
- Cloud SQL 로그: GCP Console에서 확인

## 🔗 유용한 링크

- [GitHub Repository](https://github.com/withjoono/jungsi)
- [GCP Console](https://console.cloud.google.com/run?project=ts-back-nest-479305)
- [Firebase Console](https://console.firebase.google.com/project/ts-back-nest-479305)
- [Cloud Run Services](https://console.cloud.google.com/run?project=ts-back-nest-479305)
