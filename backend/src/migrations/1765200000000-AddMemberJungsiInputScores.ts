import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class AddMemberJungsiInputScores1765200000000 implements MigrationInterface {
  name = 'AddMemberJungsiInputScores1765200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'ts_member_jungsi_input_scores',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
            comment: '입력 성적 고유 ID',
          },
          {
            name: 'member_id',
            type: 'int',
            comment: '회원 ID',
          },
          {
            name: 'major_type',
            type: 'varchar',
            length: '20',
            comment: '계열 (인문/자연)',
          },
          {
            name: 'korean_elective',
            type: 'varchar',
            length: '20',
            isNullable: true,
            comment: '국어 선택과목 (화작/언매)',
          },
          {
            name: 'math_elective',
            type: 'varchar',
            length: '20',
            isNullable: true,
            comment: '수학 선택과목 (확통/미적/기하)',
          },
          {
            name: 'korean_standard_score',
            type: 'int',
            isNullable: true,
            comment: '국어 표준점수',
          },
          {
            name: 'korean_grade',
            type: 'int',
            isNullable: true,
            comment: '국어 등급',
          },
          {
            name: 'korean_percentile',
            type: 'decimal',
            precision: 6,
            scale: 2,
            isNullable: true,
            comment: '국어 백분위',
          },
          {
            name: 'math_standard_score',
            type: 'int',
            isNullable: true,
            comment: '수학 표준점수',
          },
          {
            name: 'math_grade',
            type: 'int',
            isNullable: true,
            comment: '수학 등급',
          },
          {
            name: 'math_percentile',
            type: 'decimal',
            precision: 6,
            scale: 2,
            isNullable: true,
            comment: '수학 백분위',
          },
          {
            name: 'english_grade',
            type: 'int',
            isNullable: true,
            comment: '영어 등급',
          },
          {
            name: 'research1_subject',
            type: 'varchar',
            length: '50',
            isNullable: true,
            comment: '탐구1 과목명',
          },
          {
            name: 'research1_standard_score',
            type: 'int',
            isNullable: true,
            comment: '탐구1 표준점수',
          },
          {
            name: 'research1_grade',
            type: 'int',
            isNullable: true,
            comment: '탐구1 등급',
          },
          {
            name: 'research1_percentile',
            type: 'decimal',
            precision: 6,
            scale: 2,
            isNullable: true,
            comment: '탐구1 백분위',
          },
          {
            name: 'research2_subject',
            type: 'varchar',
            length: '50',
            isNullable: true,
            comment: '탐구2 과목명',
          },
          {
            name: 'research2_standard_score',
            type: 'int',
            isNullable: true,
            comment: '탐구2 표준점수',
          },
          {
            name: 'research2_grade',
            type: 'int',
            isNullable: true,
            comment: '탐구2 등급',
          },
          {
            name: 'research2_percentile',
            type: 'decimal',
            precision: 6,
            scale: 2,
            isNullable: true,
            comment: '탐구2 백분위',
          },
          {
            name: 'korean_history_grade',
            type: 'int',
            isNullable: true,
            comment: '한국사 등급',
          },
          {
            name: 'second_foreign_subject',
            type: 'varchar',
            length: '50',
            isNullable: true,
            comment: '제2외국어 과목명',
          },
          {
            name: 'second_foreign_standard_score',
            type: 'int',
            isNullable: true,
            comment: '제2외국어 표준점수',
          },
          {
            name: 'second_foreign_grade',
            type: 'int',
            isNullable: true,
            comment: '제2외국어 등급',
          },
          {
            name: 'second_foreign_percentile',
            type: 'decimal',
            precision: 6,
            scale: 2,
            isNullable: true,
            comment: '제2외국어 백분위',
          },
          {
            name: 'year',
            type: 'int',
            default: 2026,
            comment: '적용 년도',
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
            onUpdate: 'CURRENT_TIMESTAMP',
            comment: '수정일시',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['member_id'],
            referencedTableName: 'member_tb',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );

    // 인덱스 생성: member_id (유니크)
    await queryRunner.createIndex(
      'ts_member_jungsi_input_scores',
      new TableIndex({
        name: 'IDX_member_jungsi_input_scores_member_id',
        columnNames: ['member_id'],
        isUnique: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('ts_member_jungsi_input_scores');
  }
}
