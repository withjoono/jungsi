import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedJungsiProduct1765400000000 implements MigrationInterface {
  name = 'SeedJungsiProduct1765400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const now = new Date().toISOString();

    // 정시 상품이 이미 존재하는지 확인
    const existing = await queryRunner.query(`
      SELECT id FROM payment_service
      WHERE product_cate_code = 'J' AND product_nm = '2027 정시 예측 분석 서비스'
    `);

    if (existing.length > 0) {
      console.log('정시 상품이 이미 존재합니다.');
      return;
    }

    // 정시 상품 삽입
    await queryRunner.query(
      `
      INSERT INTO payment_service (
        product_nm,
        product_price,
        product_cate_code,
        product_type_code,
        service_range_code,
        term,
        explain_comment,
        refund_policy,
        delete_flag,
        create_dt,
        update_dt
      ) VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        $10,
        $10
      )
    `,
      [
        '2027 정시 예측 분석 서비스',
        '59000',
        'J',
        'FIXEDTERM',
        'J',
        '2027-01-31 23:59:59',
        '1년간 모의고사 예측 서비스(교육청, 평가원), 6,9월 평가원 모의 정시 예측 시뮬레이션, 모의지원 상황과 지원율 변동에 따른 동적 예측 시스템, 원서 접수 기간 실시간 경쟁률 분석 서비스',
        '결제일로부터 서비스 미사용시 14일 이내 환불 가능합니다.',
        0,
        now,
      ],
    );

    console.log('✅ 정시 상품 추가 완료');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM payment_service
      WHERE product_cate_code = 'J' AND product_nm = '2027 정시 예측 분석 서비스'
    `);
    console.log('✅ 정시 상품 삭제 완료');
  }
}
