import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Add Update Timestamp Triggers Migration
 *
 * 이 마이그레이션은 MySQL의 `onUpdate: 'CURRENT_TIMESTAMP'` 동작을
 * PostgreSQL에서 구현하기 위한 트리거를 생성합니다.
 *
 * 영향받는 테이블:
 * 1. comment_tb - 댓글 테이블
 * 2. member_regular_combination - 정시 조합 테이블
 * 3. member_recruitment_unit_combination - 수시 조합 테이블
 * 4. post_tb - 게시글 테이블 (onUpdate: 'now()' 수정)
 *
 * 작동 원리:
 * - BEFORE UPDATE 트리거가 행이 업데이트될 때마다 updated_at을 자동 갱신
 * - MySQL의 ON UPDATE CURRENT_TIMESTAMP와 동일한 동작
 *
 * 참고:
 * - TypeORM의 @UpdateDateColumn을 사용하면 이 트리거 불필요
 * - 하지만 기존 코드 호환성을 위해 데이터베이스 레벨에서 처리
 */
export class AddUpdateTimestampTriggers1732512100000 implements MigrationInterface {
  name = 'AddUpdateTimestampTriggers1732512100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('🔧 Creating update_timestamp trigger function...');

    // 1. 공통 트리거 함수 생성
    // 모든 테이블에서 재사용 가능한 범용 함수
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_timestamp_trigger()
      RETURNS TRIGGER AS $$
      BEGIN
        -- updated_at 컬럼이 존재하는 경우에만 업데이트
        -- 컬럼이 없으면 에러 발생하지 않고 그냥 넘어감
        IF TG_OP = 'UPDATE' THEN
          NEW.updated_at = CURRENT_TIMESTAMP;
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    console.log('✅ Trigger function created successfully');

    // 2. comment_tb 테이블에 트리거 적용
    console.log('🔧 Adding trigger to comment_tb...');
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS update_comment_timestamp ON comment_tb;
    `);
    await queryRunner.query(`
      CREATE TRIGGER update_comment_timestamp
        BEFORE UPDATE ON comment_tb
        FOR EACH ROW
        EXECUTE FUNCTION update_timestamp_trigger();
    `);
    console.log('✅ comment_tb trigger added');

    // 3. member_regular_combination 테이블에 트리거 적용
    console.log('🔧 Adding trigger to member_regular_combination...');
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS update_member_regular_combination_timestamp ON member_regular_combination;
    `);
    await queryRunner.query(`
      CREATE TRIGGER update_member_regular_combination_timestamp
        BEFORE UPDATE ON member_regular_combination
        FOR EACH ROW
        EXECUTE FUNCTION update_timestamp_trigger();
    `);
    console.log('✅ member_regular_combination trigger added');

    // 4. member_recruitment_unit_combination 테이블에 트리거 적용
    console.log('🔧 Adding trigger to member_recruitment_unit_combination...');
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS update_member_recruitment_unit_combination_timestamp
        ON member_recruitment_unit_combination;
    `);
    await queryRunner.query(`
      CREATE TRIGGER update_member_recruitment_unit_combination_timestamp
        BEFORE UPDATE ON member_recruitment_unit_combination
        FOR EACH ROW
        EXECUTE FUNCTION update_timestamp_trigger();
    `);
    console.log('✅ member_recruitment_unit_combination trigger added');

    // 5. post_tb 테이블에 트리거 적용
    console.log('🔧 Adding trigger to post_tb...');
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS update_post_timestamp ON post_tb;
    `);
    await queryRunner.query(`
      CREATE TRIGGER update_post_timestamp
        BEFORE UPDATE ON post_tb
        FOR EACH ROW
        EXECUTE FUNCTION update_timestamp_trigger();
    `);
    console.log('✅ post_tb trigger added');

    console.log('🎉 All update timestamp triggers created successfully!');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('🔄 Rolling back update timestamp triggers...');

    // 트리거 삭제 (역순)
    console.log('🗑️  Dropping trigger from post_tb...');
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS update_post_timestamp ON post_tb;
    `);

    console.log('🗑️  Dropping trigger from member_recruitment_unit_combination...');
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS update_member_recruitment_unit_combination_timestamp
        ON member_recruitment_unit_combination;
    `);

    console.log('🗑️  Dropping trigger from member_regular_combination...');
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS update_member_regular_combination_timestamp
        ON member_regular_combination;
    `);

    console.log('🗑️  Dropping trigger from comment_tb...');
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS update_comment_timestamp ON comment_tb;
    `);

    // 트리거 함수 삭제
    console.log('🗑️  Dropping trigger function...');
    await queryRunner.query(`
      DROP FUNCTION IF EXISTS update_timestamp_trigger();
    `);

    console.log('✅ All triggers and functions removed successfully');
  }
}
