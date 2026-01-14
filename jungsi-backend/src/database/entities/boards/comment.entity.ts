import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MemberEntity } from '../member/member.entity';
import { PostEntity } from './post.entity';

@Entity('comment_tb')
export class CommentEntity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'text', comment: '댓글 내용' })
  content: string;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    comment: '댓글 작성일',
  })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    comment: '댓글 수정일',
  })
  updated_at: Date;

  @ManyToOne(() => PostEntity, (post) => post.comments)
  @JoinColumn({ name: 'post_id' })
  post: PostEntity;

  @ManyToOne(() => MemberEntity, (member) => member.comments)
  @JoinColumn({ name: 'member_id' })
  member: MemberEntity;
}
