import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { PostEntity } from './post.entity';

@Entity('board_tb')
export class BoardEntity {
  @PrimaryGeneratedColumn('increment', { type: 'int' })
  id: number;

  @Column({ type: 'varchar', length: 255, comment: '게시판 이름' })
  name: string;

  @Column({
    type: 'varchar',
    length: 50,
    comment: '게시판 권한 (ROLE_ADMIN 또는 ROLE_USER)',
  })
  permission: string;

  @OneToMany(() => PostEntity, (post) => post.board)
  posts: PostEntity[];
}
