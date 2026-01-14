import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class AddMemberJungsiRecruitmentScores1765100000000 implements MigrationInterface {
  name = 'AddMemberJungsiRecruitmentScores1765100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'ts_member_jungsi_recruitment_scores',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
            comment: '고유 ID',
          },
          {
            name: 'member_id',
            type: 'int',
            comment: '회원 ID',
          },
          {
            name: 'regular_admission_id',
            type: 'int',
            comment: '정시 모집단위 ID',
          },
          {
            name: 'university_id',
            type: 'int',
            comment: '대학 ID',
          },
          {
            name: 'university_name',
            type: 'varchar',
            length: '100',
            comment: '대학명',
          },
          {
            name: 'recruitment_name',
            type: 'varchar',
            length: '200',
            comment: '모집단위명',
          },
          {
            name: 'admission_type',
            type: 'varchar',
            length: '20',
            comment: '모집군 (가/나/다)',
          },
          {
            name: 'admission_name',
            type: 'varchar',
            length: '100',
            isNullable: true,
            comment: '전형명',
          },
          {
            name: 'score_calculation',
            type: 'varchar',
            length: '100',
            comment: '환산식 코드명',
          },
          {
            name: 'score_calculation_code',
            type: 'varchar',
            length: '10',
            comment: '환산식 코드 (SC001)',
          },
          {
            name: 'major',
            type: 'varchar',
            length: '50',
            comment: '계열 (인문/자연)',
          },
          {
            name: 'converted_score',
            type: 'decimal',
            precision: 10,
            scale: 5,
            default: 0,
            comment: '환산점수',
          },
          {
            name: 'standard_score_sum',
            type: 'int',
            default: 0,
            comment: '표준점수 합 (국+수+탐2)',
          },
          {
            name: 'optimal_score',
            type: 'decimal',
            precision: 10,
            scale: 5,
            default: 0,
            comment: '동점수 평균 환산점수',
          },
          {
            name: 'advantage_score',
            type: 'decimal',
            precision: 10,
            scale: 5,
            default: 0,
            comment: '유불리 점수차',
          },
          {
            name: 'cumulative_percentile',
            type: 'decimal',
            precision: 6,
            scale: 2,
            isNullable: true,
            comment: '상위누적백분위',
          },
          {
            name: 'advantage_percentile',
            type: 'decimal',
            precision: 6,
            scale: 2,
            isNullable: true,
            comment: '유불리 백분위 차이',
          },
          {
            name: 'risk_score',
            type: 'int',
            isNullable: true,
            comment: '위험도 점수',
          },
          {
            name: 'min_cut',
            type: 'decimal',
            precision: 10,
            scale: 5,
            isNullable: true,
            comment: '최소 컷라인',
          },
          {
            name: 'max_cut',
            type: 'decimal',
            precision: 10,
            scale: 5,
            isNullable: true,
            comment: '최대 컷라인',
          },
          {
            name: 'success',
            type: 'boolean',
            default: true,
            comment: '계산 성공 여부',
          },
          {
            name: 'failure_reason',
            type: 'varchar',
            length: '200',
            isNullable: true,
            comment: '실패 사유',
          },
          {
            name: 'calculated_at',
            type: 'timestamp',
            isNullable: true,
            comment: '계산 일시',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            comment: '생성일시',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            comment: '수정일시',
          },
        ],
      }),
      true,
    );

    // 인덱스: member_id + regular_admission_id (유니크)
    await queryRunner.createIndex(
      'ts_member_jungsi_recruitment_scores',
      new TableIndex({
        name: 'IDX_member_jungsi_recruitment_scores_unique',
        columnNames: ['member_id', 'regular_admission_id'],
        isUnique: true,
      }),
    );

    // 인덱스: member_id
    await queryRunner.createIndex(
      'ts_member_jungsi_recruitment_scores',
      new TableIndex({
        name: 'IDX_member_jungsi_recruitment_scores_member',
        columnNames: ['member_id'],
      }),
    );

    // 인덱스: member_id + university_id
    await queryRunner.createIndex(
      'ts_member_jungsi_recruitment_scores',
      new TableIndex({
        name: 'IDX_member_jungsi_recruitment_scores_member_univ',
        columnNames: ['member_id', 'university_id'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('ts_member_jungsi_recruitment_scores');
  }
}
