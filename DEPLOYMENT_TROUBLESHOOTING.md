# Cloud Run 배포 트러블슈팅 가이드

본 문서는 Jungsi 백엔드를 Google Cloud Run에 배포하는 과정에서 발생한 문제들과 해결 방법을 정리한 것입니다.

## 배포 실패 원인 분석 (2026-01-22)

### 1. GCP Secret Manager vs GitHub Secrets 권한 문제

**문제**:
```
ERROR: [github-actions-deploy@ts-back-nest-479305.iam.gserviceaccount.com] does not have permission to access projects instance [ts-back-nest-479305:getIamPolicy]
```

**원인**:
- 초기 설계에서 GCP Secret Manager를 사용하려고 시도
- Cloud Run 서비스 계정에 Secret Manager Secret Accessor 역할을 부여하려 했으나, GitHub Actions 서비스 계정 자체가 IAM 정책을 수정할 권한이 없었음

**해결책**:
```yaml
# ❌ 실패한 접근 방법
--set-secrets DB_PASSWORD=geobuk-db-password:latest

# ✅ 성공한 접근 방법
--set-env-vars DB_PASSWORD=${{ secrets.DB_PASSWORD }}
```

**교훈**: GitHub Secrets를 환경 변수로 직접 주입하는 것이 더 간단하고 권한 문제가 없음

---

### 2. 환경 변수 타입 충돌

**문제**:
```
ERROR: Cannot update environment variable [DB_PASSWORD] to string literal because it has already been set with a different type.
```

**원인**:
- 이전 배포에서 `--set-secrets`로 설정된 변수를 `--set-env-vars`로 변경하려 하니 타입 충돌 발생
- Cloud Run은 동일 변수명의 타입 변경을 허용하지 않음

**시도한 해결책 (실패)**:
```yaml
# ❌ --clear-env-vars와 --set-env-vars를 동시에 사용할 수 없음
--clear-env-vars \
--clear-secrets \
--set-env-vars NODE_ENV=production
```

**최종 해결책**:
```yaml
# ✅ 기존 서비스 삭제 후 재생성
- name: Delete existing Cloud Run service (if exists)
  run: |
    if gcloud run services describe ${{ env.SERVICE_NAME }} --region ${{ env.REGION }} --quiet 2>/dev/null; then
      gcloud run services delete ${{ env.SERVICE_NAME }} --region ${{ env.REGION }} --quiet
      sleep 10
    fi
```

**교훈**: 환경 변수 타입 변경이 필요한 경우 서비스 재생성이 가장 확실한 방법

---

### 3. 누락된 필수 환경 변수

**문제**:
```
ERROR: An instance of EnvironmentVariablesValidator has failed the validation:
- property IMP_KEY has failed the following constraints: isString
- property IMP_SECRET has failed the following constraints: isString
- property IMP_STORE_CODE has failed the following constraints: isString
```

**원인**:
NestJS 백엔드의 `EnvironmentVariablesValidator`가 다음 환경 변수들을 필수로 검증:

1. **데이터베이스 (5개)**:
   - `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`

2. **JWT 인증 (4개)**:
   - `AUTH_JWT_SECRET` ← `JWT_SECRET`가 아님!
   - `AUTH_REFRESH_SECRET`
   - `AUTH_JWT_TOKEN_EXPIRES_IN`
   - `AUTH_REFRESH_TOKEN_EXPIRES_IN`

3. **Iamport 결제 (3개)**:
   - `IMP_KEY`
   - `IMP_SECRET`
   - `IMP_STORE_CODE`

**해결책**:
```bash
# GitHub Secrets 추가
gh secret set AUTH_JWT_SECRET
gh secret set AUTH_REFRESH_SECRET
gh secret set IMP_KEY
gh secret set IMP_SECRET
gh secret set IMP_STORE_CODE

# 워크플로우에 환경 변수 추가
--set-env-vars \
  AUTH_JWT_SECRET=${{ secrets.AUTH_JWT_SECRET }},\
  AUTH_REFRESH_SECRET=${{ secrets.AUTH_REFRESH_SECRET }},\
  AUTH_JWT_TOKEN_EXPIRES_IN=7200000,\
  AUTH_REFRESH_TOKEN_EXPIRES_IN=5184000000,\
  IMP_KEY=${{ secrets.IMP_KEY }},\
  IMP_SECRET=${{ secrets.IMP_SECRET }},\
  IMP_STORE_CODE=${{ secrets.IMP_STORE_CODE }}
```

**교훈**:
- 로컬 `.env.development`의 모든 필수 변수를 확인
- 환경 변수 이름을 정확히 매칭 (JWT_SECRET ≠ AUTH_JWT_SECRET)

---

### 4. Firebase 초기화 크래시

**문제**:
```javascript
// ❌ 파일이 없으면 require()가 throw하여 앱 크래시
serviceAccount = require('../firebase-service-account-key.json');
```

**원인**:
- Firebase 자격 증명 파일이 Docker 이미지에 포함되지 않음
- `require()`는 파일이 없으면 예외를 발생시켜 전체 애플리케이션이 시작되지 않음

**해결책**:
```javascript
// ✅ 파일 존재 여부 확인 후 선택적 로드
try {
  const fs = require('fs');
  const path = require('path');
  const keyPath = path.join(__dirname, '..', 'firebase-service-account-key.json');

  if (fs.existsSync(keyPath)) {
    serviceAccount = require('../firebase-service-account-key.json');
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    console.log('✅ Firebase Admin SDK initialized from file');
  } else {
    console.warn('⚠️  Firebase service account file not found. Firebase features will be disabled.');
  }
} catch (fileError) {
  console.warn('⚠️  Failed to load Firebase from file. Firebase features will be disabled.');
}
```

**교훈**:
- 선택적 기능은 안전한 폴백 처리 필수
- `fs.existsSync()` 또는 환경 변수 체크 후 초기화

---

### 5. Docker 빌드 중 npm 레지스트리 오류

**문제**:
```
error https://registry.npmjs.org/retry-request/-/retry-request-5.0.2.tgz: Request failed "500 Internal Server Error"
```

**원인**:
- npm 레지스트리의 일시적인 네트워크 오류
- 기본 타임아웃(60초)이 불충분

**해결책**:
```dockerfile
# Dockerfile 개선
RUN yarn install --frozen-lockfile --network-timeout 300000 || \
    yarn install --frozen-lockfile --network-timeout 300000 || \
    yarn install --frozen-lockfile --network-timeout 300000
```

**교훈**:
- 외부 레지스트리 의존성은 재시도 로직 추가
- 네트워크 타임아웃 증가 (60초 → 300초)

---

## 배포 체크리스트

### 1. GitHub Secrets 확인
```bash
# 필수 Secrets 목록
gh secret list

# 필요한 Secrets:
# - AUTH_JWT_SECRET
# - AUTH_REFRESH_SECRET
# - DB_NAME
# - DB_PASSWORD
# - DB_USER
# - IMP_KEY
# - IMP_SECRET
# - IMP_STORE_CODE
# - GCP_SA_KEY
```

### 2. 환경 변수 검증
- `jungsi-backend/src/config/` 디렉토리의 validation 클래스 확인
- `.env.development`와 배포 환경 변수 비교

### 3. Firebase 설정 (선택사항)
- Firebase 사용 시: 환경 변수로 자격 증명 제공
- Firebase 미사용 시: 앱이 정상 시작되는지 확인

### 4. Cloud SQL 연결
- Cloud SQL Proxy 설정 확인
- `DB_HOST=/cloudsql/PROJECT_ID:REGION:INSTANCE_NAME` 형식

### 5. 배포 전 로컬 테스트
```bash
# 로컬에서 프로덕션 환경 변수로 테스트
NODE_ENV=production yarn start:prod
```

---

## 성공적인 배포 워크플로우

```yaml
# .github/workflows/deploy-backend-cloudrun.yml
steps:
  1. Docker 이미지 빌드 (재시도 로직 포함)
  2. GCR에 이미지 푸시
  3. Cloud SQL Proxy로 마이그레이션 실행
  4. 기존 서비스 삭제 (타입 충돌 방지)
  5. 새 서비스 배포 (모든 환경 변수 포함)
  6. 배포 결과 확인
```

---

## 주요 배운 점

1. **간단함이 최선**: GCP Secret Manager보다 GitHub Secrets가 더 간단하고 안정적
2. **완전한 환경 변수**: 로컬 개발 환경의 모든 필수 변수를 프로덕션에도 설정
3. **타입 일관성**: 환경 변수 타입 변경 시 서비스 재생성 고려
4. **안전한 초기화**: 선택적 기능은 파일/환경 변수 존재 여부 확인 후 초기화
5. **재시도 로직**: 외부 의존성(npm, API 등)은 항상 재시도 로직 포함

---

## 참고 자료

- [Cloud Run Environment Variables](https://cloud.google.com/run/docs/configuring/environment-variables)
- [Cloud Run Troubleshooting](https://cloud.google.com/run/docs/troubleshooting)
- [NestJS Configuration](https://docs.nestjs.com/techniques/configuration)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

---

## 문제 발생 시 디버깅

### 1. Cloud Run 로그 확인
```bash
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=jungsi-backend" \
  --limit 50 \
  --format="table(timestamp,severity,textPayload)" \
  --project=ts-back-nest-479305 \
  --freshness=30m
```

### 2. GitHub Actions 로그
```bash
gh run list --limit 5
gh run view [RUN_ID] --log-failed
```

### 3. 환경 변수 검증
```bash
# 배포된 서비스의 환경 변수 확인
gcloud run services describe jungsi-backend \
  --region asia-northeast3 \
  --format="value(spec.template.spec.containers[0].env)"
```

---

**작성일**: 2026-01-22
**배포 성공 버전**: f442bc4
**총 배포 시도 횟수**: 13회
**최종 성공 소요 시간**: 약 1.5시간
