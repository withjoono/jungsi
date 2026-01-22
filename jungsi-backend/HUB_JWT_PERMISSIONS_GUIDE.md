# Hub JWT 권한 시스템 통합 가이드 (정시 앱)

## 개요

Hub(중앙 인증 서버)에서 발급한 JWT 토큰에 포함된 앱별 권한 정보를 확인하여, 정시 앱의 특정 기능에 대한 접근을 제어합니다.

## Hub JWT 토큰 구조

```json
{
  "sub": "ATK",
  "jti": 123,
  "iat": 1716558652,
  "exp": 1716576652,
  "permissions": {
    "jungsi": {
      "plan": "premium",
      "expires": "2025-12-31T23:59:59Z",
      "features": ["calculation", "prediction", "analysis"]
    }
  }
}
```

## 구현된 파일

### 1. 타입 정의
- `src/auth/types/jwt-payload.type.ts`
  - `AppPermission`: 앱별 권한 정보
  - `PermissionsPayload`: 전체 권한 맵
  - `JwtPayloadType`: JWT 페이로드 (permissions 필드 추가)

### 2. JWT 서비스 확장
- `src/common/jwt/jwt.service.ts`
  - `getAppPermission(token, secret, appId)`: 특정 앱의 권한 추출
  - `getAllPermissions(token, secret)`: 모든 권한 추출

### 3. 데코레이터
- `src/auth/decorators/require-feature.decorator.ts`
  - `@RequireFeature(feature)`: 특정 기능 권한이 필요한 엔드포인트에 사용

### 4. 가드
- `src/auth/guards/hub-permission.guard.ts`
  - JWT 토큰의 permissions 필드 확인
  - 만료일 체크
  - 기능 권한 체크

## 사용 방법

### 1. 기본 사용 (컨트롤러 메서드에 적용)

```typescript
import { Controller, Post, Get, UseGuards } from '@nestjs/common';
import { RequireFeature } from 'src/auth/decorators/require-feature.decorator';
import { HubPermissionGuard } from 'src/auth/guards/hub-permission.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('jungsi')
@UseGuards(JwtAuthGuard) // 먼저 JWT 인증 확인
export class JungsiController {

  // 무료 사용자도 접근 가능 (환산점수 계산)
  @Post('calculate')
  calculate() {
    return { message: '환산점수 계산 - 무료' };
  }

  // 'prediction' 기능 권한이 필요한 API
  @Post('prediction/predict')
  @UseGuards(HubPermissionGuard)
  @RequireFeature('prediction')
  predictAdmission() {
    return { message: 'AI 합격 예측 - premium 플랜 필요' };
  }

  // 'analysis' 기능 권한이 필요한 API
  @Post('prediction/rag')
  @UseGuards(HubPermissionGuard)
  @RequireFeature('analysis')
  ragQuery() {
    return { message: 'RAG 기반 입시 질의응답 - premium 플랜 필요' };
  }
}
```

### 2. 전역 적용 (app.module.ts에 APP_GUARD로 등록)

모든 엔드포인트에 자동으로 권한 체크를 적용하려면:

```typescript
// app.module.ts
import { HubPermissionGuard } from './auth/guards/hub-permission.guard';

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, // 먼저 JWT 인증
    },
    {
      provide: APP_GUARD,
      useClass: HubPermissionGuard, // 그 다음 권한 체크
    },
  ],
})
export class AppModule {}
```

전역 적용 시, `@RequireFeature()` 데코레이터가 있는 엔드포인트만 권한 체크가 수행됩니다.

## 플랜별 권한 예시

### Free 플랜
```json
{
  "plan": "free",
  "features": ["calculation"]
}
```
- 환산점수 계산 기능만 사용 가능
- 합격 예측, 상세 분석 불가

### Basic 플랜
```json
{
  "plan": "basic",
  "expires": "2025-12-31T23:59:59Z",
  "features": ["calculation", "basic-prediction"]
}
```
- 환산점수 계산 + 기본 예측 가능
- 만료일 존재

### Premium 플랜
```json
{
  "plan": "premium",
  "expires": "2025-12-31T23:59:59Z",
  "features": ["calculation", "prediction", "analysis", "detailed-report"]
}
```
- 모든 기능 사용 가능 (환산, 예측, 분석, 상세 리포트)
- 만료일 존재

## 에러 응답

### 401 Unauthorized
- JWT 토큰이 없거나 유효하지 않음

### 403 Forbidden
- 정시 앱 권한이 없음
- 구독이 만료됨
- 요청한 기능에 대한 권한이 없음

예시:
```json
{
  "success": false,
  "statusCode": 403,
  "message": "'prediction' 기능을 사용할 권한이 없습니다."
}
```

## Hub와 JWT 시크릿 키 공유

정시 앱과 Hub는 **동일한 JWT 시크릿 키**를 사용해야 합니다.

### .env 파일 설정

```env
# Hub와 동일한 시크릿 키 사용
AUTH_JWT_SECRET=04ca023b39512e46d0c2cf4b48d5aac61d34302994c87ed4eff225dcf3b0a218739f3897051a057f9b846a69ea2927a587044164b7bae5e1306219d50b588cb1
```

⚠️ **중요**: Hub에서 설정한 시크릿 키와 정확히 일치해야 합니다.

## 테스트

### 1. JWT 토큰 생성 (Hub에서)

Hub의 `/auth/login` API로 로그인하여 JWT 토큰 발급:

```bash
curl -X POST http://localhost:4000/auth/login/email \
  -H "Content-Type: application/json" \
  -d '{"email": "test@test.com", "password": "password123"}'
```

### 2. 권한이 필요한 API 호출

```bash
# AI 합격 예측 API (prediction 기능 권한 필요)
curl -X POST http://localhost:4002/jungsi/prediction/predict \
  -H "Authorization: Bearer eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{"universityId": 123, "scores": {...}}'

# RAG 입시 질의응답 API (analysis 기능 권한 필요)
curl -X POST http://localhost:4002/jungsi/prediction/rag \
  -H "Authorization: Bearer eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{"query": "서울대 의대 합격 가능성은?"}'
```

## 실제 적용된 엔드포인트 목록

### ✅ 권한 체크가 적용된 API

| 엔드포인트 | HTTP 메서드 | 필요 권한 | 설명 |
|-----------|------------|---------|------|
| `/jungsi/prediction/predict` | POST | `prediction` | AI 합격 예측 (Premium 플랜) |
| `/jungsi/prediction/rag` | POST | `analysis` | RAG 기반 입시 질의응답 (Premium 플랜) |

### 🆓 무료로 사용 가능한 API

| 엔드포인트 | HTTP 메서드 | 설명 |
|-----------|------------|------|
| `/jungsi/calculate` | POST | 환산점수 계산 (무료) |
| `/jungsi/scores` | GET | 저장된 환산점수 조회 (무료) |
| `/jungsi/convert` | POST | 표준점수 변환 (무료, 인증 불필요) |
| `/jungsi/prediction/competition` | GET | 실시간 경쟁률 조회 (무료, 인증 불필요) |
| `/jungsi/prediction/health` | GET | 예측 서비스 헬스체크 (무료, 인증 불필요) |

## 테스트 시나리오

### 1. Free 플랜 사용자 (prediction 기능 없음)

**JWT 토큰 예시:**
```json
{
  "sub": "ATK",
  "jti": 123,
  "permissions": {
    "jungsi": {
      "plan": "free",
      "features": ["calculation"]
    }
  }
}
```

**테스트:**
```bash
# ✅ 성공: 환산점수 계산은 무료
curl -X POST http://localhost:4002/jungsi/calculate \
  -H "Authorization: Bearer <FREE_TOKEN>"

# ❌ 실패: prediction 기능 없음
curl -X POST http://localhost:4002/jungsi/prediction/predict \
  -H "Authorization: Bearer <FREE_TOKEN>"
# 응답: 403 Forbidden - 'prediction' 기능을 사용할 권한이 없습니다.
```

### 2. Premium 플랜 사용자 (모든 기능 사용 가능)

**JWT 토큰 예시:**
```json
{
  "sub": "ATK",
  "jti": 456,
  "permissions": {
    "jungsi": {
      "plan": "premium",
      "expires": "2025-12-31T23:59:59Z",
      "features": ["calculation", "prediction", "analysis"]
    }
  }
}
```

**테스트:**
```bash
# ✅ 성공: 모든 기능 사용 가능
curl -X POST http://localhost:4002/jungsi/prediction/predict \
  -H "Authorization: Bearer <PREMIUM_TOKEN>"
# 응답: 200 OK

curl -X POST http://localhost:4002/jungsi/prediction/rag \
  -H "Authorization: Bearer <PREMIUM_TOKEN>"
# 응답: 200 OK
```

### 3. 만료된 구독

**JWT 토큰 예시:**
```json
{
  "sub": "ATK",
  "jti": 789,
  "permissions": {
    "jungsi": {
      "plan": "premium",
      "expires": "2024-01-01T00:00:00Z",
      "features": ["calculation", "prediction", "analysis"]
    }
  }
}
```

**테스트:**
```bash
# ❌ 실패: 구독 만료
curl -X POST http://localhost:4002/jungsi/prediction/predict \
  -H "Authorization: Bearer <EXPIRED_TOKEN>"
# 응답: 403 Forbidden - 구독이 만료되었습니다.
```

## 문의

Hub JWT 권한 시스템 관련 문의사항은 Hub 백엔드 팀에 연락하세요.
