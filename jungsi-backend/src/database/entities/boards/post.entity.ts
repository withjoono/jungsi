import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BoardEntity } from './board.entity';
import { CommentEntity } from './comment.entity';
import { MemberEntity } from '../member/member.entity';

@Entity('board_post')
export class PostEntity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', length: 255, comment: '게시글 제목' })
  title: string;

  @Column({ type: 'text', comment: '게시글 내용' })
  content: string;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    comment: '게시글 작성일',
  })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    comment: '게시글 수정일',
  })
  updated_at: Date;

  @Column({ type: 'boolean', default: false, comment: '게시글 강조 여부' })
  is_emphasized: boolean;

  @ManyToOne(() => BoardEntity, (board) => board.posts)
  @JoinColumn({ name: 'board_id' })
  board: BoardEntity;

  @ManyToOne(() => MemberEntity, (member) => member.posts)
  @JoinColumn({ name: 'member_id' })
  member: MemberEntity;

  @OneToMany(() => CommentEntity, (comment) => comment.post)
  comments: CommentEntity[];
}
