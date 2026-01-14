-- =====================================================
-- 플래너 전용 개발 DB 초기화 스크립트
-- =====================================================
-- 사용법: 
--   1. PostgreSQL에 접속
--   2. 이 스크립트 실행
-- =====================================================

-- 1. 데이터베이스 생성
CREATE DATABASE planner_dev
    WITH 
    OWNER = tsuser
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8'
    TEMPLATE = template0;

-- 데이터베이스 연결 변경
\c planner_dev

-- 2. 회원 테이블 (최소 구조)
CREATE TABLE IF NOT EXISTS member_tb (
    id BIGSERIAL PRIMARY KEY,
    account VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(200),
    user_name VARCHAR(50),
    email VARCHAR(100),
    cellphone VARCHAR(20),
    birthday VARCHAR(20),
    highschool VARCHAR(100),
    school VARCHAR(100),
    univ VARCHAR(100),
    department VARCHAR(100),
    region VARCHAR(50),
    profile_image_url TEXT,
    role VARCHAR(20) DEFAULT 'ROLE_USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. 장기 학습계획 테이블
CREATE TABLE IF NOT EXISTS planner_plan_tb (
    id BIGSERIAL PRIMARY KEY,
    member_id BIGINT NOT NULL REFERENCES member_tb(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    subject VARCHAR(50),
    step VARCHAR(50),
    start_date DATE,
    end_date DATE,
    start_time TIME,
    end_time TIME,
    type INT DEFAULT 0,
    material VARCHAR(200),
    total INT,
    done INT DEFAULT 0,
    person VARCHAR(100),
    is_item BOOLEAN DEFAULT FALSE,
    is_item_done BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_plan_member_id ON planner_plan_tb(member_id);
CREATE INDEX idx_plan_subject ON planner_plan_tb(subject);

-- 4. 일정 아이템 테이블
CREATE TABLE IF NOT EXISTS planner_item_tb (
    id BIGSERIAL PRIMARY KEY,
    member_id BIGINT NOT NULL REFERENCES member_tb(id) ON DELETE CASCADE,
    primary_type VARCHAR(10) NOT NULL,
    subject VARCHAR(50),
    teacher VARCHAR(100),
    title VARCHAR(200) NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    r_rule VARCHAR(500),
    ex_date TEXT,
    late BOOLEAN DEFAULT FALSE,
    absent BOOLEAN DEFAULT FALSE,
    description TEXT,
    progress INT DEFAULT 0,
    score DECIMAL(5,2),
    rank INT,
    mentor_rank INT,
    mentor_desc TEXT,
    mentor_test VARCHAR(200),
    study_type VARCHAR(50),
    study_content TEXT,
    plan_date DATE,
    achievement INT,
    task_status VARCHAR(20),
    test VARCHAR(200),
    start_page INT,
    end_page INT,
    start_session INT,
    end_session INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_item_member_id ON planner_item_tb(member_id);
CREATE INDEX idx_item_start_date ON planner_item_tb(start_date);
CREATE INDEX idx_item_primary_type ON planner_item_tb(primary_type);
CREATE INDEX idx_item_subject ON planner_item_tb(subject);

-- 5. 루틴 테이블
CREATE TABLE IF NOT EXISTS planner_routine_tb (
    id BIGSERIAL PRIMARY KEY,
    member_id BIGINT NOT NULL REFERENCES member_tb(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    repeat BOOLEAN DEFAULT TRUE,
    date DATE,
    length INT,
    sun BOOLEAN DEFAULT FALSE,
    mon BOOLEAN DEFAULT FALSE,
    tues BOOLEAN DEFAULT FALSE,
    wed BOOLEAN DEFAULT FALSE,
    thurs BOOLEAN DEFAULT FALSE,
    fri BOOLEAN DEFAULT FALSE,
    sat BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_routine_member_id ON planner_routine_tb(member_id);

-- 6. 플래너 클래스 테이블
CREATE TABLE IF NOT EXISTS planner_class_tb (
    id BIGSERIAL PRIMARY KEY,
    planner_id BIGINT NOT NULL REFERENCES member_tb(id) ON DELETE CASCADE,
    class_code VARCHAR(10) NOT NULL,
    class_name VARCHAR(100),
    start_date VARCHAR(8) NOT NULL,
    end_date VARCHAR(8),
    use_yn CHAR(1) DEFAULT 'Y'
);

CREATE INDEX idx_class_planner_id ON planner_class_tb(planner_id);
CREATE INDEX idx_class_code ON planner_class_tb(class_code);
CREATE INDEX idx_class_use_yn ON planner_class_tb(use_yn);

-- 7. 플래너 멤버십 테이블
CREATE TABLE IF NOT EXISTS planner_management_tb (
    member_id BIGINT NOT NULL REFERENCES member_tb(id) ON DELETE CASCADE,
    planner_id BIGINT NOT NULL REFERENCES member_tb(id) ON DELETE CASCADE,
    class_code VARCHAR(10) NOT NULL,
    start_date VARCHAR(8) NOT NULL,
    end_date VARCHAR(8),
    use_yn CHAR(1) DEFAULT 'Y',
    PRIMARY KEY (member_id, planner_id, class_code, start_date)
);

CREATE INDEX idx_mgmt_planner_id ON planner_management_tb(planner_id);
CREATE INDEX idx_mgmt_class_code ON planner_management_tb(class_code);
CREATE INDEX idx_mgmt_use_yn ON planner_management_tb(use_yn);

-- 8. 플래너 공지사항 테이블
CREATE TABLE IF NOT EXISTS planner_notice_tb (
    id BIGSERIAL PRIMARY KEY,
    planner_id BIGINT NOT NULL REFERENCES member_tb(id) ON DELETE CASCADE,
    class_code VARCHAR(10),
    title VARCHAR(200) NOT NULL,
    content TEXT,
    date DATE NOT NULL,
    is_important BOOLEAN DEFAULT FALSE,
    use_yn VARCHAR(1) DEFAULT 'Y',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. 테스트 데이터 삽입
INSERT INTO member_tb (id, account, user_name, email, role) VALUES 
(1, 'test_user', '테스트 학생', 'student@test.com', 'ROLE_USER'),
(2, 'test_planner', '테스트 플래너', 'planner@test.com', 'ROLE_PLANNER')
ON CONFLICT (id) DO NOTHING;

-- 플래너 클래스 생성
INSERT INTO planner_class_tb (planner_id, class_code, class_name, start_date, use_yn)
VALUES (2, 'CLASS001', '수학 집중반', '20250101', 'Y')
ON CONFLICT DO NOTHING;

-- 학생을 플래너 클래스에 배정
INSERT INTO planner_management_tb (member_id, planner_id, class_code, start_date, use_yn)
VALUES (1, 2, 'CLASS001', '20250101', 'Y')
ON CONFLICT DO NOTHING;

-- 10. 권한 부여
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO tsuser;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO tsuser;

SELECT '플래너 DB 초기화 완료!' AS result;




