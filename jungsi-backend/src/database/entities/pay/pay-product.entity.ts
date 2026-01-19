import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

// 상품 (상품 코드 관리)
@Entity('payment_product')
export class PayProductEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', length: 500, name: 'product_name' })
  productName: string; // 상품명

  @Column({ type: 'varchar', length: 500, name: 'product_code', unique: true })
  productCode: string; // 상품 코드 (유니크)

  @Column({ type: 'varchar', length: 500, name: 'product_type' })
  productType: string; // 상품 타입 (FIXEDTERM, TICKET, PACKAGE)
}
