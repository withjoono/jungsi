import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';

// 판매 상품
@Entity('payment_service')
@Unique('UK_pk3sdbagrh1cdo8jk2oog4g0v', ['product_nm'])
export class PayServiceEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'timestamp', nullable: true })
  create_dt: Date;

  @Column({ type: 'varchar', length: 3000, nullable: true })
  explain_comment: string; // 상품 설명

  @Column({ type: 'varchar', length: 3000, nullable: true })
  product_image: string; // 상품 이미지

  @Column({ type: 'varchar', length: 500 })
  product_nm: string; // 상품 이름 (수시예측 서비스)

  @Column({ type: 'varchar', length: 500, nullable: true })
  product_payment_type: string; // 안씀

  @Column({ type: 'varchar', length: 500 })
  product_price: string; // 상품가격

  @Column({ type: 'float', default: 0 })
  promotion_discount: number; // 안씀

  @Column({ type: 'timestamp', nullable: true })
  term: Date; // 계약기간 (구매 시 사용할 수 있는 기간)

  @Column({ type: 'timestamp', nullable: true })
  update_dt: Date;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  refund_policy: string; // 환불 정책

  @Column({ type: 'int', default: 0 })
  delete_flag: number; // 1: 삭제됨, 0: 판매중

  @Column({ type: 'varchar', length: 45, nullable: true })
  product_cate_code: string; // 판매 카테고리 코드 (J, S, C, T) (정시, 수시, 컨설팅, 티켓)

  @Column({ type: 'varchar', length: 45, nullable: true })
  product_type_code: string; // 상품 타입 FIXEDTERM(기간권), TICKET(티켓), PACKAGE(패키지)

  @Column({ type: 'varchar', length: 45, nullable: true })
  service_range_code: string; // 상품 이용범위 코드 (S, J, T) (수시, 정시, 티켓)

  @Column({ type: 'int', nullable: true })
  available_count: number; // 상품 갯수

  @Column({ type: 'varchar', length: 45, nullable: true })
  available_term: string; // 안씀
}
