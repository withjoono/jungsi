import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { PayServiceEntity } from './pay-service.entity';
import { MemberEntity } from '../member/member.entity';

@Entity('payment_order')
@Unique('UK_gnwosnxtfwcpt1acvc9c1t1vf', ['imp_uid'])
@Unique('UK_4c9pqmv7an15g602u8wa6dje', ['merchant_uid'])
export class PayOrderEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'int', default: 0 })
  cancel_amount: number; // 취소 금액(안씀)

  @Column({ type: 'varchar', length: 500, nullable: true })
  emb_pg_provider: string | null; // PG사 제공자

  @Column({ type: 'varchar', length: 500, nullable: true })
  card_name: string | null; // 카드명 (ex. 국민카드)

  @Column({ type: 'varchar', length: 500, nullable: true })
  card_number: string | null; // 카드번호 (ex. 948882*********1)

  @Column({ type: 'bigint', nullable: true })
  contract_id: number | null; // (안씀)

  @Column({ type: 'timestamp', nullable: true })
  create_dt: Date | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  imp_uid: string; // 아임포트 uid

  @Column({ type: 'bigint', nullable: true })
  member_id: number | null; // 유저 아이디

  @ManyToOne(() => MemberEntity, { nullable: true })
  @JoinColumn({ name: 'member_id' })
  member: MemberEntity | null;

  @Column({ type: 'varchar', length: 500 })
  merchant_uid: string; // 아임포트 상품 아이디

  @Column({ type: 'varchar', length: 20 })
  order_state: string; // 주문 상태 (PENDING, FAIL, COMPLETE, CANCELED)

  @Column({ type: 'int', nullable: true })
  paid_amount: number | null; // 결제 금액

  @Column({ type: 'timestamp', nullable: true })
  update_dt: Date | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  vbank_code: string | null; // 은행 코드(안씀)

  @Column({ type: 'varchar', length: 500, nullable: true })
  vbank_name: string | null; // 은행 이름(안씀)

  @Column({ type: 'bigint', nullable: true })
  pay_service_id: number | null; // 구매한 상품 id

  @ManyToOne(() => PayServiceEntity, { nullable: true })
  @JoinColumn({ name: 'pay_service_id' })
  pay_service: PayServiceEntity | null; // 구매한 상품
}
