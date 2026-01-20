# 🚀 프로덕션 마이그레이션 실행 가이드

## 빠른 시작 (Windows)

### 방법 1: PowerShell 스크립트 사용 (가장 간단!)

```powershell
# jungsi-backend 디렉토리에서
.\scripts\quick-migration.ps1
```

스크립트가 다음을 자동으로 처리합니다:
1. ✅ 프로덕션 DB 접속 정보 입력 (대화형)
2. ✅ Cloud SQL Proxy 자동 시작
3. ✅ 마이그레이션 자동 실행
4. ✅ 완료 후 안내

---

### 방법 2: 수동 설정 후 실행

#### 1단계: 환경 변수 설정

```powershell
# PowerShell에서
$env:DB_PASSWORD = "프로덕션_DB_비밀번호"
$env:DB_NAME = "geobukschool_prod"
$env:DB_USER = "postgres"
```

#### 2단계: 마이그레이션 실행

```powershell
# 배치 파일 실행
.\scripts\run-migration-via-proxy.bat

# 또는 yarn 명령어
yarn migration:prod:proxy:win
```

---

## 실행 중인 마이그레이션

### 1765320000000-AddCumulativePercentileToInputScores

**변경 사항:**
- `js_user_input_scores` 테이블에 2개 컬럼 추가:
  - `standard_score_sum` (INTEGER): 표준점수 합계
  - `cumulative_percentile` (DECIMAL): 나의 누적백분위

**영향:**
- ✅ 기존 데이터 안전 (NULL 허용)
- ✅ 새로운 점수 계산 시 자동 저장
- ✅ "나의 누적백분위" 기능 활성화

**예상 소요 시간:** 약 1-2초

---

## 실행 전 체크리스트

- [ ] GCloud 인증 완료
  ```bash
  gcloud auth login
  gcloud auth application-default login
  ```
- [ ] `cloud-sql-proxy.exe` 파일 존재 확인
- [ ] 프로덕션 DB 비밀번호 준비
- [ ] `jungsi-backend` 디렉토리에서 실행

---

## 실행 후 확인

### 1. 마이그레이션 성공 메시지 확인

```
✅ Migration AddCumulativePercentileToInputScores1765320000000 has been executed successfully.
✅ js_user_input_scores 테이블에 standard_score_sum, cumulative_percentile 컬럼 추가 완료
```

### 2. 데이터베이스에서 확인 (선택사항)

```sql
-- typeorm_migrations 테이블 확인
SELECT * FROM typeorm_migrations 
WHERE name LIKE '%AddCumulativePercentile%';

-- 컬럼 추가 확인
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'js_user_input_scores' 
  AND column_name IN ('standard_score_sum', 'cumulative_percentile');
```

---

## 트러블슈팅

### ❌ "cloud-sql-proxy.exe를 찾을 수 없습니다"

**해결책:**
```powershell
# 다운로드
curl -o cloud-sql-proxy.exe https://dl.google.com/cloudsql/cloud_sql_proxy_x64.exe
```

### ❌ "Authentication failed"

**해결책:**
```bash
# 재인증
gcloud auth login
gcloud auth application-default login
```

### ❌ "Connection refused"

**해결책:**
- Cloud SQL Proxy가 실행 중인지 확인
- 5-10초 대기 후 재시도

### ❌ "Migration has already been run"

**해결책:**
- 이미 실행된 마이그레이션입니다 (정상)
- 추가 작업 필요 없음

---

## 롤백 (문제 발생 시)

```powershell
# 환경 변수가 설정된 상태에서
yarn typeorm:revert
```

---

## 추가 문서

- 📖 [상세 마이그레이션 가이드](./MIGRATION_PRODUCTION.md)
- 📖 [마이그레이션 일반 가이드](./MIGRATION-GUIDE.md)
- 📖 [개발 환경 설정](./DEVELOPMENT-SETUP.md)
