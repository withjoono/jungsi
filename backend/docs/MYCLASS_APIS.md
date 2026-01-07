# MyClass Backend APIs

마이클래스 기능에 필요한 백엔드 API 명세서입니다.

## API 엔드포인트 목록

### 1. 플래너 API

#### GET `/api/planner/planners`
멘토 목록 조회

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "홍길동",
      "subject": "수학",
      "profileImage": "https://...",
      "phone": "010-1234-5678"
    }
  ]
}
```

#### GET `/api/planner/notice`
공지사항 목록 조회

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "title": "공지사항 제목",
      "content": "공지사항 내용",
      "date": "2025-01-01",
      "isImportant": true
    }
  ]
}
```

#### GET `/api/planner/rank`
성취도 랭킹 조회

**Query Parameters:**
- `str_dwm`: 기간 타입 (D: 일간, W: 주간, M: 월간)

**Response:**
```json
{
  "data": {
    "myRank": 5,
    "totalStudents": 100,
    "myAchievement": 85,
    "dailyAchievement": 90,
    "weeklyAchievement": 85,
    "monthlyAchievement": 80
  }
}
```

---

### 2. 내신 관리 API

#### GET `/api/myclass/grades`
학기별 내신 성적 조회

**Query Parameters:**
- `semester`: 학기 (예: "1학년 1학기", "1학년 2학기", ...)

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "subject": "국어",
      "unit": 3,
      "rank": 15,
      "grade": 2,
      "score": 92,
      "average": 75.5,
      "stddev": 12.3,
      "semester": "1학년 1학기"
    }
  ]
}
```

---

### 3. 테스트 API

#### GET `/api/myclass/tests`
테스트 목록 조회

**Query Parameters:**
- `filter`: 필터 타입 (all: 전체, pending: 대기중, completed: 완료)

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "title": "수학 단원평가",
      "subject": "수학",
      "date": "2025-01-15",
      "score": 85,
      "totalScore": 100,
      "rank": 5,
      "totalStudents": 30,
      "status": "completed"
    }
  ]
}
```

**status enum:**
- `pending`: 대기 중
- `completed`: 완료
- `missed`: 미응시

---

### 4. 모의고사 API

#### GET `/api/myclass/mock-tests`
모의고사 성적 조회

**Query Parameters:**
- `year`: 연도 (예: 2025, 2024, ...)

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "testName": "2025년 3월 모의고사",
      "testDate": "2025-03-07",
      "korean": 92,
      "math": 88,
      "english": 95,
      "history": 45,
      "science1": 48,
      "science2": 46,
      "totalScore": 414,
      "percentile": 95.5,
      "grade": 1
    }
  ]
}
```

---

### 5. 건강 관리 API

#### GET `/api/myclass/health`
건강 기록 조회

**Query Parameters:**
- `week`: 주간 선택 (current: 이번주, previous: 지난주)

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "date": "2025-01-15",
      "sleepHours": 7.5,
      "mealCount": 3,
      "exerciseMinutes": 30,
      "mood": "good",
      "note": "오늘 컨디션 좋음"
    }
  ]
}
```

**mood enum:**
- `good`: 좋음
- `normal`: 보통
- `bad`: 나쁨

#### POST `/api/myclass/health`
건강 기록 등록

**Request Body:**
```json
{
  "date": "2025-01-15",
  "sleepHours": 7.5,
  "mealCount": 3,
  "exerciseMinutes": 30,
  "mood": "good",
  "note": "오늘 컨디션 좋음"
}
```

---

### 6. 프론트데스크 API

#### GET `/api/myclass/consultations`
상담 기록 조회

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "date": "2025-01-10",
      "type": "student",
      "mentor": "홍길동 멘토",
      "summary": "진로 상담 진행. 수학 성적 향상 방안 논의.",
      "nextDate": "2025-01-24"
    }
  ]
}
```

**type enum:**
- `student`: 학생 상담
- `parent`: 학부모 상담

#### GET `/api/myclass/attendance`
출결 기록 조회

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "date": "2025-01-15",
      "checkIn": "08:30",
      "checkOut": "22:00",
      "status": "present"
    }
  ]
}
```

**status enum:**
- `present`: 출석
- `late`: 지각
- `absent`: 결석
- `excused`: 공결

---

## 인증

모든 API는 인증이 필요합니다.

**Headers:**
```
Authorization: Bearer {accessToken}
```

## 에러 코드

| 코드 | 설명 |
|------|------|
| C401 | 토큰 만료 (자동 갱신) |
| C403 | 권한 없음 |
| C404 | 리소스 없음 |
| C500 | 서버 에러 |
| C999 | 유효하지 않은 토큰 |
| C5050 | 세션 만료 |

## 구현 우선순위

1. **필수 (MVP)**
   - GET `/api/myclass/grades` - 내신 관리
   - GET `/api/myclass/tests` - 테스트 목록
   - GET `/api/myclass/mock-tests` - 모의고사 성적

2. **중요**
   - GET `/api/planner/planners` - 멘토 정보
   - GET `/api/planner/notice` - 공지사항
   - GET `/api/planner/rank` - 성취도 랭킹

3. **부가 기능**
   - GET/POST `/api/myclass/health` - 건강 관리
   - GET `/api/myclass/consultations` - 상담 기록
   - GET `/api/myclass/attendance` - 출결 현황

## 참고

- 프론트엔드 클라이언트: `authClient` from `@/lib/api`
- 케이스 변환: 자동 camelCase ↔ snake_case (humps)
- 응답 형식: `{ data: [...] }` 또는 `{ data: {...} }`
