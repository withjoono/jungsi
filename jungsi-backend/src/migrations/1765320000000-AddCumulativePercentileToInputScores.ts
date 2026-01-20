import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * 마이그레이션: js_user_input_scores 테이블에 표점합 및 누적백분위 컬럼 추가
 *
 * 목적:
 * - 사용자의 표점합(국어+수학+탐구2)을 캐싱하여 매번 계산하지 않도록 함
 * - 사용자의 누적백분위를 저장하여 step1 차트에서 빠르게 조회
 *
 * 컬럼:
 * - standard_score_sum: 표준점수 합계 (국어+수학+탐구2)
 * - cumulative_percentile: 나의 누적백분위 (상위 %)
 */
export class AddCumulativePercentileToInputScores1765320000000 implements MigrationInterface {
  name = 'AddCumulativePercentileToInputScores1765320000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // PostgreSQL 체크
    const isPostgres = queryRunner.connection.options.type === 'postgres';

    if (isPostgres) {
      // 컬럼 존재 여부 확인
      const checkColumn = async (columnName: string): Promise<boolean> => {
        const result = await queryRunner.query(`
          SELECT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_name = 'js_user_input_scores'
            AND column_name = '${columnName}'
          ) as exists
        `);
        return result[0].exists;
      };

      // standard_score_sum 컬럼 추가
      const hasStandardScoreSum = await checkColumn('standard_score_sum');
      if (!hasStandardScoreSum) {
        await queryRunner.query(`
          ALTER TABLE "js_user_input_scores"
          ADD COLUMN "standard_score_sum" INTEGER
        `);
        console.log('✅ standard_score_sum 컬럼 추가됨');
      } else {
        console.log('ℹ️  standard_score_sum 컬럼이 이미 존재합니다');
      }

      // standard_score_sum 컬럼에 COMMENT 추가
      await queryRunner.query(`
        COMMENT ON COLUMN "js_user_input_scores"."standard_score_sum" IS '표준점수 합계 (국어+수학+탐구2)'
      `);

      // cumulative_percentile 컬럼 추가
      const hasCumulativePercentile = await checkColumn('cumulative_percentile');
      if (!hasCumulativePercentile) {
        await queryRunner.query(`
          ALTER TABLE "js_user_input_scores"
          ADD COLUMN "cumulative_percentile" DECIMAL(10, 6)
        `);
        console.log('✅ cumulative_percentile 컬럼 추가됨');
      } else {
        console.log('ℹ️  cumulative_percentile 컬럼이 이미 존재합니다');
      }

      // cumulative_percentile 컬럼에 COMMENT 추가
      await queryRunner.query(`
        COMMENT ON COLUMN "js_user_input_scores"."cumulative_percentile" IS '나의 누적백분위 (상위 %)'
      `);
    } else {
      // SQLite (개발 환경)
      const tableInfo = await queryRunner.query(`PRAGMA table_info(js_user_input_scores)`);
      const columns = tableInfo.map((col: any) => col.name);

      if (!columns.includes('standard_score_sum')) {
        await queryRunner.query(`
          ALTER TABLE "js_user_input_scores"
          ADD COLUMN "standard_score_sum" INTEGER
        `);
        console.log('✅ standard_score_sum 컬럼 추가됨');
      } else {
        console.log('ℹ️  standard_score_sum 컬럼이 이미 존재합니다');
      }

      if (!columns.includes('cumulative_percentile')) {
        await queryRunner.query(`
          ALTER TABLE "js_user_input_scores"
          ADD COLUMN "cumulative_percentile" DECIMAL(10, 6)
        `);
        console.log('✅ cumulative_percentile 컬럼 추가됨');
      } else {
        console.log('ℹ️  cumulative_percentile 컬럼이 이미 존재합니다');
      }
    }

    console.log('✅ js_user_input_scores 테이블에 standard_score_sum, cumulative_percentile 컬럼 추가 완료');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const isPostgres = queryRunner.connection.options.type === 'postgres';

    if (isPostgres) {
      await queryRunner.query(`
        ALTER TABLE "js_user_input_scores"
        DROP COLUMN IF EXISTS "cumulative_percentile"
      `);

      await queryRunner.query(`
        ALTER TABLE "js_user_input_scores"
        DROP COLUMN IF EXISTS "standard_score_sum"
      `);
    }
    // SQLite에서는 컬럼 삭제가 복잡하므로 생략

    console.log('✅ js_user_input_scores 테이블에서 standard_score_sum, cumulative_percentile 컬럼 제거 완료');
  }
}
