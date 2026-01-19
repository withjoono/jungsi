import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

/**
 * 환산인자별 유불리 및 백분위 컬럼 추가
 *
 * 목적:
 * - js_user_hwansan_score 테이블에 유불리와 누적백분위 컬럼 추가
 * - 유불리와 백분위도 표준점수합(표점합)에만 의존하므로 환산인자별로 저장
 * - ts_member_jungsi_recruitment_scores에 매칭된 값을 복사하여 빠른 조회 지원
 *
 * 추가 컬럼:
 * - optimal_score: 유불리 점수 (동점수 평균 환산점수)
 * - advantage_score: 유불리 차이 (optimal_score - converted_score)
 * - cumulative_percentile: 상위누적백분위
 * - advantage_percentile: 유불리 백분위 차이
 */
export class AddYubuliPercentileColumns1765310000000 implements MigrationInterface {
  name = 'AddYubuliPercentileColumns1765310000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. optimal_score (유불리 점수) 추가
    await queryRunner.addColumn(
      'js_user_hwansan_score',
      new TableColumn({
        name: 'optimal_score',
        type: 'decimal',
        precision: 10,
        scale: 5,
        isNullable: true,
        comment: '유불리 점수 (동점수 평균 환산점수)',
      }),
    );

    // 2. advantage_score (유불리 차이) 추가
    await queryRunner.addColumn(
      'js_user_hwansan_score',
      new TableColumn({
        name: 'advantage_score',
        type: 'decimal',
        precision: 10,
        scale: 5,
        isNullable: true,
        comment: '유불리 차이 (optimal_score - converted_score)',
      }),
    );

    // 3. cumulative_percentile (상위누적백분위) 추가
    await queryRunner.addColumn(
      'js_user_hwansan_score',
      new TableColumn({
        name: 'cumulative_percentile',
        type: 'decimal',
        precision: 6,
        scale: 2,
        isNullable: true,
        comment: '상위누적백분위',
      }),
    );

    // 4. advantage_percentile (유불리 백분위 차이) 추가
    await queryRunner.addColumn(
      'js_user_hwansan_score',
      new TableColumn({
        name: 'advantage_percentile',
        type: 'decimal',
        precision: 6,
        scale: 2,
        isNullable: true,
        comment: '유불리 백분위 차이',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 역순으로 컬럼 제거
    await queryRunner.dropColumn('js_user_hwansan_score', 'advantage_percentile');
    await queryRunner.dropColumn('js_user_hwansan_score', 'cumulative_percentile');
    await queryRunner.dropColumn('js_user_hwansan_score', 'advantage_score');
    await queryRunner.dropColumn('js_user_hwansan_score', 'optimal_score');
  }
}
