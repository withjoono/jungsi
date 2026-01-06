import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { MemberEntity } from '../member/member.entity';
import { Expose } from 'class-transformer';

// 사정관
@Entity('officer_list_tb')
export class OfficerListEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'int' })
  @Expose({ groups: ['admin'] })
  approval_status: number;

  @Column({ type: 'timestamp', nullable: true })
  @Expose({ groups: ['admin'] })
  create_dt: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Expose({ groups: ['admin'] })
  del_yn: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  education: string;

  @Expose({ groups: ['admin'] })
  @Column({ type: 'varchar', length: 500, nullable: true })
  officer_apply_file: string; // 안씀

  @Column({ type: 'varchar', length: 500, nullable: true })
  officer_name: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  officer_profile_image: string;

  @Expose({ groups: ['admin'] })
  @Column({ type: 'varchar', length: 500, nullable: true })
  reject_reason: string; // 안씀

  @Column({ type: 'varchar', length: 500, nullable: true })
  university: string;

  @Column({ type: 'timestamp', nullable: true })
  @Expose({ groups: ['admin'] })
  update_dt: Date;

  @Column({ type: 'bigint', nullable: true })
  member_id: number;

  @ManyToOne(() => MemberEntity)
  @JoinColumn({ name: 'member_id' })
  member: MemberEntity;
}
