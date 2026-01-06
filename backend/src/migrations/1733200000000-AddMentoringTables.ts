import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class AddMentoringTables1733200000000 implements MigrationInterface {
  name = 'AddMentoringTables1733200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. 멘토링 임시 코드 테이블 생성
    await queryRunner.createTable(
      new Table({
        name: 'mentoring_temp_code_tb',
        columns: [
          {
            name: 'member_id',
            type: 'bigint',
            isPrimary: true,
            comment: '회원 ID (PK)',
          },
          {
            name: 'code',
            type: 'varchar',
            length: '6',
            comment: '6자리 연결 코드',
          },
          {
            name: 'expire_at',
            type: 'timestamp',
            comment: '만료 시간',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            comment: '생성일시',
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

    // 임시 코드 테이블 인덱스
    await queryRunner.createIndex(
      'mentoring_temp_code_tb',
      new TableIndex({
        name: 'IDX_mentoring_temp_code_code',
        columnNames: ['code'],
      }),
    );

    await queryRunner.createIndex(
      'mentoring_temp_code_tb',
      new TableIndex({
        name: 'IDX_mentoring_temp_code_expire_at',
        columnNames: ['expire_at'],
      }),
    );

    // 2. 멘토링 계정 연동 테이블 생성
    await queryRunner.createTable(
      new Table({
        name: 'mentoring_account_link_tb',
        columns: [
          {
            name: 'member_id',
            type: 'bigint',
            isPrimary: true,
            comment: '회원 ID',
          },
          {
            name: 'linked_member_id',
            type: 'bigint',
            isPrimary: true,
            comment: '연동된 회원 ID',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            comment: '생성일시',
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
            columnNames: ['linked_member_id'],
            referencedTableName: 'member_tb',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );

    // 계정 연동 테이블 인덱스
    await queryRunner.createIndex(
      'mentoring_account_link_tb',
      new TableIndex({
        name: 'IDX_mentoring_account_link_member_id',
        columnNames: ['member_id'],
      }),
    );

    await queryRunner.createIndex(
      'mentoring_account_link_tb',
      new TableIndex({
        name: 'IDX_mentoring_account_link_linked_member_id',
        columnNames: ['linked_member_id'],
      }),
    );

    // 3. 멘토링 관리자 클래스 테이블 생성
    await queryRunner.createTable(
      new Table({
        name: 'mentoring_admin_class_tb',
        columns: [
          {
            name: 'member_id',
            type: 'bigint',
            isPrimary: true,
            comment: '회원 ID',
          },
          {
            name: 'target_member_id',
            type: 'bigint',
            isPrimary: true,
            comment: '대상 회원 ID',
          },
          {
            name: 'use_yn',
            type: 'char',
            length: '1',
            default: "'Y'",
            comment: '사용 여부',
          },
          {
            name: 'first_reg_dt',
            type: 'date',
            isNullable: true,
            comment: '최초 등록일',
          },
          {
            name: 'last_mod_dt',
            type: 'date',
            isNullable: true,
            comment: '최종 수정일',
          },
          {
            name: 'group_id',
            type: 'varchar',
            length: '50',
            isNullable: true,
            comment: '그룹 ID',
          },
          {
            name: 'group_name',
            type: 'varchar',
            length: '100',
            isNullable: true,
            comment: '그룹명',
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
            columnNames: ['target_member_id'],
            referencedTableName: 'member_tb',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );

    // 관리자 클래스 테이블 인덱스
    await queryRunner.createIndex(
      'mentoring_admin_class_tb',
      new TableIndex({
        name: 'IDX_mentoring_admin_class_member_id',
        columnNames: ['member_id'],
      }),
    );

    await queryRunner.createIndex(
      'mentoring_admin_class_tb',
      new TableIndex({
        name: 'IDX_mentoring_admin_class_target_member_id',
        columnNames: ['target_member_id'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 역순으로 테이블 삭제
    await queryRunner.dropTable('mentoring_admin_class_tb');
    await queryRunner.dropTable('mentoring_account_link_tb');
    await queryRunner.dropTable('mentoring_temp_code_tb');
  }
}
