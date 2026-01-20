-- 마이그레이션 결과 검증 SQL

-- 1. js_user_input_scores 테이블 구조 확인
SELECT column_name, data_type, character_maximum_length, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'js_user_input_scores'
  AND column_name IN ('standard_score_sum', 'cumulative_percentile')
ORDER BY ordinal_position;

-- 2. 컬럼 코멘트 확인
SELECT
    cols.column_name,
    pg_catalog.col_description(c.oid, cols.ordinal_position::int) as column_comment
FROM information_schema.columns cols
JOIN pg_catalog.pg_class c ON c.relname = cols.table_name
WHERE cols.table_name = 'js_user_input_scores'
  AND cols.column_name IN ('standard_score_sum', 'cumulative_percentile');

-- 3. 실행된 마이그레이션 확인
SELECT id, timestamp, name
FROM typeorm_migrations
ORDER BY id DESC
LIMIT 10;

-- 4. js_user_input_scores 테이블의 데이터 샘플 확인 (있는 경우)
SELECT
    id,
    member_id,
    standard_score_sum,
    cumulative_percentile,
    created_at
FROM js_user_input_scores
LIMIT 5;
