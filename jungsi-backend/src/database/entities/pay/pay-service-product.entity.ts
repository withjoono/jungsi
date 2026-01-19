import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

// 서비스-상품 관계 테이블 (M:N)
@Entity('payment_service_product')
export class PayServiceProductEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'bigint', name: 'pay_service_id' })
  payServiceId: number; // FK → pay_service_tb.id

  @Column({ type: 'bigint', name: 'pay_product_id' })
  payProductId: number; // FK → pay_product_tb.id
}
