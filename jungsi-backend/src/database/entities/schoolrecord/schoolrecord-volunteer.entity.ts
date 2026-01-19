import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { MemberEntity } from '../member/member.entity';

@Entity('sgb_volunteer')
export class SchoolRecordVolunteerEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  accumulate_time: string | null;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  activity_content: string | null;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  activity_time: string | null;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  date: string | null;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  grade: string | null;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  place: string | null;

  @ManyToOne(() => MemberEntity, (member) => member.volunteers)
  @JoinColumn({ name: 'member_id' })
  member: MemberEntity;
}
