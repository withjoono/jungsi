import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

// 쿠폰
@Entity('pay_coupon_tb')
export class PayCouponEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', length: 500 })
  coupon_number: string; // 쿠폰번호 (ex. ELSKEH1258DH378D)

  @Column({ type: 'varchar', length: 500 })
  discount_info: string; // 쿠폰 정보 (ex. 오픈 기념)

  @Column({ type: 'int' })
  discount_value: number; // 할인율

  @Column({ type: 'int', default: 0 })
  number_of_available: number; // 남은 쿠폰 갯수

  @Column({ type: 'bigint', nullable: true })
  pay_service_id: number | null; // 사용할 수 있는 상품
}
