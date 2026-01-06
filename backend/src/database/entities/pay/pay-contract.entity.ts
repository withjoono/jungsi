import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

// 상품 계약 정보
@Entity('pay_contract_tb')
export class PayContractEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'timestamp', comment: '계약기간 종료일' })
  contract_period_end_dt: Date;

  @Column({ type: 'timestamp', comment: '계약기간 시작일' })
  contract_start_dt: Date; // 구매일

  @Column({ type: 'int', nullable: true })
  contract_use: number | null; // 1: 사용중, 0: 사용불가(환불됨)

  @Column({ type: 'timestamp', nullable: true })
  create_dt: Date | null; // 구매일

  @Column({ type: 'varchar', length: 200, comment: '상품 코드' })
  product_code: string; // FIXEDTERM, TICKET, PACKAGE

  @Column({ type: 'boolean', comment: '정기 계약 여부' })
  regular_contract_fl: boolean; // 안씀

  @Column({ type: 'timestamp', nullable: true })
  update_dt: Date | null;

  @Column({ type: 'bigint', nullable: true })
  member_id: number | null;

  @Column({ type: 'int', nullable: true })
  order_id: number | null; // 주문 id
}
