# 🚀 배포 체크리스트

## ✅ 배포 전 준비사항

### 1. Git 저장소 확인
- [x] Repository: `https://github.com/withjoono/jungsi.git`
- [x] Branch: `main`
- [x] 로컬 변경사항 커밋 완료

### 2. GitHub Secrets 설정

#### 필수 Secrets (Backend)
- [ ] `GCP_SA_KEY` - GCP Service Account JSON 키
- [ ] `DB_USER` - 데이터베이스 사용자명
- [ ] `DB_PASSWORD` - 데이터베이스 비밀번호
- [ ] `DB_NAME` - 데이터베이스 이름
- [ ] `DB_PASSWORD_SECRET_NAME` - Secret Manager의 비밀번호 이름
- [ ] `DB_NAME_SECRET_NAME` - Secret Manager의 DB 이름
- [ ] `DB_USER_SECRET_NAME` - Secret Manager의 사용자명
- [ ] `JWT_SECRET_NAME` - Secret Manager의 JWT Secret 이름

#### 필수 Secrets (Frontend)
- [ ] `FIREBASE_SERVICE_ACCOUNT` - Firebase Service Account JSON
- [ ] `VITE_API_URL_NEST` - Backend API URL
- [ ] `VITE_API_URL_SPRING` - Spring Backend API URL (선택사항)

### 3. GCP 설정 확인

#### Cloud Run
- [ ] Project ID: `ts-back-nest-479305`
- [ ] Region: `asia-northeast3`
- [ ] Service Name: `jungsi-backend`

#### Cloud SQL
- [ ] Instance Name: `geobuk-db`
- [ ] Region: `asia-northeast3`
- [ ] 데이터베이스 생성됨: `geobukschool_prod`

#### Service Account 권한
- [ ] Cloud Run Admin
- [ ] Cloud SQL Client
- [ ] Storage Admin
- [ ] Secret Manager Secret Accessor

### 4. 마이그레이션 준비

#### 로컬 테스트
- [ ] 로컬에서 마이그레이션 테스트 완료
```bash
cd jungsi-backend
.\run-migration-now.ps1
```

#### 마이그레이션 파일 확인
- [ ] `1765003406925-AddPreviousResultColumns.ts` - 수정 완료
- [ ] `1765320000000-AddCumulativePercentileToInputScores.ts` - 준비 완료

## 🔧 빠른 설정 (자동)

### 옵션 1: 자동 스크립트 사용 (Linux/Mac)
```bash
chmod +x scripts/setup-github-secrets.sh
./scripts/setup-github-secrets.sh
```

### 옵션 2: 수동 설정 (Windows)
`GITHUB_ACTIONS_SETUP.md` 파일의 지침을 따르세요.

## 📝 배포 실행

### 1. 변경사항 커밋 및 푸시
```bash
git add .
git commit -m "feat: Setup GitHub Actions auto-deployment with Cloud Run"
git push origin main
```

### 2. GitHub Actions 확인
1. https://github.com/withjoono/jungsi/actions 접속
2. "Deploy Backend to Cloud Run" 워크플로우 확인
3. "Deploy Frontend to Firebase" 워크플로우 확인

### 3. 배포 상태 모니터링
- ✅ Backend: 각 단계 로그 확인
  - Docker 이미지 빌드
  - 마이그레이션 실행
  - Cloud Run 배포
- ✅ Frontend: Firebase 배포 로그 확인

## 🎯 배포 후 확인사항

### Backend 확인
```bash
# Cloud Run 서비스 URL 확인
gcloud run services describe jungsi-backend \
  --region asia-northeast3 \
  --format 'value(status.url)'

# Health Check
curl https://jungsi-backend-xxxx.run.app/health
```

### Frontend 확인
```bash
# Firebase Hosting URL
https://jungsi.turtleschool.com
```

### Database 마이그레이션 확인
```bash
# Cloud SQL에 연결하여 확인
gcloud sql connect geobuk-db --user=tsuser --database=geobukschool_prod

# 마이그레이션 테이블 확인
SELECT * FROM typeorm_migrations ORDER BY timestamp DESC LIMIT 5;

# 새로 추가된 컬럼 확인
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'js_user_input_scores' 
AND column_name IN ('standard_score_sum', 'cumulative_percentile');
```

## 🐛 문제 해결

### 배포 실패 시
1. GitHub Actions 로그 확인
2. Secrets 설정 재확인
3. GCP Service Account 권한 확인
4. 로컬에서 Docker 빌드 테스트:
```bash
cd jungsi-backend
docker build -t test-image .
```

### 마이그레이션 실패 시
1. Cloud SQL 인스턴스 상태 확인
2. DB 연결 정보 확인
3. 로컬에서 마이그레이션 재테스트

### 롤백이 필요한 경우
```bash
# 이전 버전으로 롤백
gcloud run services update-traffic jungsi-backend \
  --to-revisions=PREVIOUS_REVISION=100 \
  --region=asia-northeast3

# 마이그레이션 롤백 (로컬에서)
cd jungsi-backend
yarn typeorm:revert
```

## 📊 배포 현황

### 현재 상태
- [ ] GitHub Actions 워크플로우 생성 완료
- [ ] GitHub Secrets 설정 완료
- [ ] 첫 배포 성공
- [ ] 마이그레이션 자동 실행 확인
- [ ] Frontend 배포 확인
- [ ] Backend 배포 확인

### 다음 배포부터
매번 `main` 브랜치에 push하면 자동으로:
1. ✅ Backend 변경 감지 → Cloud Run 자동 배포
2. ✅ Frontend 변경 감지 → Firebase 자동 배포
3. ✅ 마이그레이션 자동 실행
4. ✅ 배포 결과 알림

## 📞 지원

문제가 있으면:
1. `GITHUB_ACTIONS_SETUP.md` 참조
2. GitHub Actions 로그 확인
3. GCP Console 로그 확인
4. 팀에 문의

---

**마지막 업데이트**: 2026-01-20  
**문서 버전**: 1.0.0
