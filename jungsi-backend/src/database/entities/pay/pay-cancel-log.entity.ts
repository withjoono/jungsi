import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('pay_cancel_log_tb')
export class PayCancelLogEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  cancel_reason: string | null;

  @Column({ type: 'varchar', length: 500 })
  code: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  fail_reason: string | null;

  @Column({ type: 'varchar', length: 500 })
  imp_uid: string;

  @Column({ type: 'varchar', length: 500 })
  merchant_uid: string;

  @Column({ type: 'varchar', length: 500 })
  pay_amount: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  pay_method: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  result_msg: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  status: string | null;

  @Column({ type: 'timestamp', nullable: true })
  create_dt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  update_dt: Date | null;
}
