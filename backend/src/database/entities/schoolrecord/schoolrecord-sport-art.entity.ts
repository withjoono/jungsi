// src/entities/schoolrecord-subject-sports-art.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { MemberEntity } from '../member/member.entity';

@Entity('schoolrecord_subject_sports_art_tb')
export class SchoolrecordSportsArtEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id', comment: '아이디' })
  id: number;

  @Column({ type: 'text', nullable: true, comment: '성취도' })
  achievement: string;

  @Column({ type: 'text', nullable: true, comment: '비고' })
  etc: string;

  @Column({ type: 'text', nullable: true, comment: '학년' })
  grade: string;

  @Column({ type: 'text', nullable: true, comment: '학기' })
  semester: string;

  @Column({ type: 'text', nullable: true, comment: '교과' })
  sub_subject: string;

  @Column({ type: 'text', nullable: true, comment: '과목' })
  subject: string;

  @Column({ type: 'text', nullable: true, comment: '단위 수' })
  unit: string;

  @ManyToOne(() => MemberEntity, { nullable: true })
  @JoinColumn({ name: 'member_id' })
  member: MemberEntity;
}
