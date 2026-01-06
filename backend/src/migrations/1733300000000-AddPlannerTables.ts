import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class AddPlannerTables1733300000000 implements MigrationInterface {
  name = 'AddPlannerTables1733300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. 장기 학습계획 테이블 생성
    await queryRunner.createTable(
      new Table({
        name: 'planner_plan_tb',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
            comment: '계획 ID',
          },
          {
            name: 'member_id',
            type: 'bigint',
            comment: '회원 ID',
          },
          {
            name: 'title',
            type: 'varchar',
            length: '200',
            comment: '제목',
          },
          {
            name: 'subject',
            type: 'varchar',
            length: '50',
            isNullable: true,
            comment: '과목',
          },
          {
            name: 'step',
            type: 'varchar',
            length: '50',
            isNullable: true,
            comment: '단계',
          },
          {
            name: 'start_date',
            type: 'date',
            isNullable: true,
            comment: '시작일',
          },
          {
            name: 'end_date',
            type: 'date',
            isNullable: true,
            comment: '종료일',
          },
          {
            name: 'start_time',
            type: 'time',
            isNullable: true,
            comment: '시작 시간',
          },
          {
            name: 'end_time',
            type: 'time',
            isNullable: true,
            comment: '종료 시간',
          },
          {
            name: 'type',
            type: 'int',
            default: 0,
            comment: '타입 (0: 강의, 1: 교재)',
          },
          {
            name: 'material',
            type: 'varchar',
            length: '200',
            isNullable: true,
            comment: '교재/강의명',
          },
          {
            name: 'total',
            type: 'int',
            isNullable: true,
            comment: '총 수량',
          },
          {
            name: 'done',
            type: 'int',
            default: 0,
            comment: '완료 수량',
          },
          {
            name: 'person',
            type: 'varchar',
            length: '100',
            isNullable: true,
            comment: '담당자',
          },
          {
            name: 'is_item',
            type: 'boolean',
            default: false,
            comment: '일정 생성 여부',
          },
          {
            name: 'is_item_done',
            type: 'boolean',
            default: false,
            comment: '일정 완료 여부',
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

    await queryRunner.createIndex(
      'planner_plan_tb',
      new TableIndex({
        name: 'IDX_planner_plan_member_id',
        columnNames: ['member_id'],
      }),
    );

    await queryRunner.createIndex(
      'planner_plan_tb',
      new TableIndex({
        name: 'IDX_planner_plan_subject',
        columnNames: ['subject'],
      }),
    );

    // 2. 플래너 일정 아이템 테이블 생성
    await queryRunner.createTable(
      new Table({
        name: 'planner_item_tb',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
            comment: '일정 ID',
          },
          {
            name: 'member_id',
            type: 'bigint',
            comment: '회원 ID',
          },
          {
            name: 'primary_type',
            type: 'varchar',
            length: '10',
            comment: '유형 (학습/수업)',
          },
          {
            name: 'subject',
            type: 'varchar',
            length: '50',
            isNullable: true,
            comment: '과목',
          },
          {
            name: 'teacher',
            type: 'varchar',
            length: '100',
            isNullable: true,
            comment: '선생님',
          },
          {
            name: 'title',
            type: 'varchar',
            length: '200',
            comment: '제목',
          },
          {
            name: 'start_date',
            type: 'timestamp',
            comment: '시작 일시',
          },
          {
            name: 'end_date',
            type: 'timestamp',
            comment: '종료 일시',
          },
          {
            name: 'r_rule',
            type: 'varchar',
            length: '500',
            isNullable: true,
            comment: 'iCalendar 반복 규칙',
          },
          {
            name: 'ex_date',
            type: 'text',
            isNullable: true,
            comment: '반복 예외 날짜',
          },
          {
            name: 'late',
            type: 'boolean',
            default: false,
            comment: '지각 여부',
          },
          {
            name: 'absent',
            type: 'boolean',
            default: false,
            comment: '결석 여부',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
            comment: '설명',
          },
          {
            name: 'progress',
            type: 'int',
            default: 0,
            comment: '성취도 (0-100)',
          },
          {
            name: 'score',
            type: 'decimal',
            precision: 5,
            scale: 2,
            isNullable: true,
            comment: '점수',
          },
          {
            name: 'rank',
            type: 'int',
            isNullable: true,
            comment: '순위',
          },
          {
            name: 'mentor_rank',
            type: 'int',
            isNullable: true,
            comment: '멘토 평가 순위',
          },
          {
            name: 'mentor_desc',
            type: 'text',
            isNullable: true,
            comment: '멘토 코멘트',
          },
          {
            name: 'mentor_test',
            type: 'varchar',
            length: '200',
            isNullable: true,
            comment: '멘토 테스트',
          },
          {
            name: 'study_type',
            type: 'varchar',
            length: '50',
            isNullable: true,
            comment: '학습 유형',
          },
          {
            name: 'study_content',
            type: 'text',
            isNullable: true,
            comment: '학습 내용',
          },
          {
            name: 'plan_date',
            type: 'date',
            isNullable: true,
            comment: '계획 날짜',
          },
          {
            name: 'achievement',
            type: 'int',
            isNullable: true,
            comment: '달성도',
          },
          {
            name: 'task_status',
            type: 'varchar',
            length: '20',
            isNullable: true,
            comment: '과제 상태',
          },
          {
            name: 'test',
            type: 'varchar',
            length: '200',
            isNullable: true,
            comment: '테스트',
          },
          {
            name: 'start_page',
            type: 'int',
            isNullable: true,
            comment: '시작 페이지',
          },
          {
            name: 'end_page',
            type: 'int',
            isNullable: true,
            comment: '종료 페이지',
          },
          {
            name: 'start_session',
            type: 'int',
            isNullable: true,
            comment: '시작 강의 번호',
          },
          {
            name: 'end_session',
            type: 'int',
            isNullable: true,
            comment: '종료 강의 번호',
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

    await queryRunner.createIndex(
      'planner_item_tb',
      new TableIndex({
        name: 'IDX_planner_item_member_id',
        columnNames: ['member_id'],
      }),
    );

    await queryRunner.createIndex(
      'planner_item_tb',
      new TableIndex({
        name: 'IDX_planner_item_start_date',
        columnNames: ['start_date'],
      }),
    );

    await queryRunner.createIndex(
      'planner_item_tb',
      new TableIndex({
        name: 'IDX_planner_item_primary_type',
        columnNames: ['primary_type'],
      }),
    );

    await queryRunner.createIndex(
      'planner_item_tb',
      new TableIndex({
        name: 'IDX_planner_item_subject',
        columnNames: ['subject'],
      }),
    );

    // 3. 루틴 테이블 생성
    await queryRunner.createTable(
      new Table({
        name: 'planner_routine_tb',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
            comment: '루틴 ID',
          },
          {
            name: 'member_id',
            type: 'bigint',
            comment: '회원 ID',
          },
          {
            name: 'title',
            type: 'varchar',
            length: '200',
            comment: '제목',
          },
          {
            name: 'start_time',
            type: 'time',
            comment: '시작 시간',
          },
          {
            name: 'end_time',
            type: 'time',
            comment: '종료 시간',
          },
          {
            name: 'repeat',
            type: 'boolean',
            default: true,
            comment: '반복 여부',
          },
          {
            name: 'date',
            type: 'date',
            isNullable: true,
            comment: '특정 날짜 (반복 아닌 경우)',
          },
          {
            name: 'length',
            type: 'int',
            isNullable: true,
            comment: '소요 시간 (분)',
          },
          {
            name: 'sun',
            type: 'boolean',
            default: false,
            comment: '일요일',
          },
          {
            name: 'mon',
            type: 'boolean',
            default: false,
            comment: '월요일',
          },
          {
            name: 'tues',
            type: 'boolean',
            default: false,
            comment: '화요일',
          },
          {
            name: 'wed',
            type: 'boolean',
            default: false,
            comment: '수요일',
          },
          {
            name: 'thurs',
            type: 'boolean',
            default: false,
            comment: '목요일',
          },
          {
            name: 'fri',
            type: 'boolean',
            default: false,
            comment: '금요일',
          },
          {
            name: 'sat',
            type: 'boolean',
            default: false,
            comment: '토요일',
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

    await queryRunner.createIndex(
      'planner_routine_tb',
      new TableIndex({
        name: 'IDX_planner_routine_member_id',
        columnNames: ['member_id'],
      }),
    );

    // 4. 플래너 클래스 테이블 생성
    await queryRunner.createTable(
      new Table({
        name: 'planner_class_tb',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
            comment: '클래스 ID',
          },
          {
            name: 'planner_id',
            type: 'bigint',
            comment: '플래너(멘토) ID',
          },
          {
            name: 'class_code',
            type: 'varchar',
            length: '10',
            comment: '클래스 코드',
          },
          {
            name: 'class_name',
            type: 'varchar',
            length: '100',
            isNullable: true,
            comment: '클래스 이름',
          },
          {
            name: 'start_date',
            type: 'varchar',
            length: '8',
            comment: '시작일 (YYYYMMDD)',
          },
          {
            name: 'end_date',
            type: 'varchar',
            length: '8',
            isNullable: true,
            comment: '종료일 (YYYYMMDD)',
          },
          {
            name: 'use_yn',
            type: 'char',
            length: '1',
            default: "'Y'",
            comment: '사용 여부',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['planner_id'],
            referencedTableName: 'member_tb',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'planner_class_tb',
      new TableIndex({
        name: 'IDX_planner_class_planner_id',
        columnNames: ['planner_id'],
      }),
    );

    await queryRunner.createIndex(
      'planner_class_tb',
      new TableIndex({
        name: 'IDX_planner_class_class_code',
        columnNames: ['class_code'],
      }),
    );

    await queryRunner.createIndex(
      'planner_class_tb',
      new TableIndex({
        name: 'IDX_planner_class_use_yn',
        columnNames: ['use_yn'],
      }),
    );

    // 5. 플래너 멤버십 테이블 생성 (복합 기본키)
    await queryRunner.createTable(
      new Table({
        name: 'planner_management_tb',
        columns: [
          {
            name: 'member_id',
            type: 'bigint',
            isPrimary: true,
            comment: '학생 ID',
          },
          {
            name: 'planner_id',
            type: 'bigint',
            isPrimary: true,
            comment: '플래너 ID',
          },
          {
            name: 'class_code',
            type: 'varchar',
            length: '10',
            isPrimary: true,
            comment: '클래스 코드',
          },
          {
            name: 'start_date',
            type: 'varchar',
            length: '8',
            isPrimary: true,
            comment: '시작일 (YYYYMMDD)',
          },
          {
            name: 'end_date',
            type: 'varchar',
            length: '8',
            isNullable: true,
            comment: '종료일 (YYYYMMDD)',
          },
          {
            name: 'use_yn',
            type: 'char',
            length: '1',
            default: "'Y'",
            comment: '사용 여부',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['member_id'],
            referencedTableName: 'member_tb',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['planner_id'],
            referencedTableName: 'member_tb',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'planner_management_tb',
      new TableIndex({
        name: 'IDX_planner_management_planner_id',
        columnNames: ['planner_id'],
      }),
    );

    await queryRunner.createIndex(
      'planner_management_tb',
      new TableIndex({
        name: 'IDX_planner_management_class_code',
        columnNames: ['class_code'],
      }),
    );

    await queryRunner.createIndex(
      'planner_management_tb',
      new TableIndex({
        name: 'IDX_planner_management_use_yn',
        columnNames: ['use_yn'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 역순으로 테이블 삭제
    await queryRunner.dropTable('planner_management_tb');
    await queryRunner.dropTable('planner_class_tb');
    await queryRunner.dropTable('planner_routine_tb');
    await queryRunner.dropTable('planner_item_tb');
    await queryRunner.dropTable('planner_plan_tb');
  }
}
