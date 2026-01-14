import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardService } from './board.service';
import { BoardController } from './board.controller';
import { BoardEntity } from 'src/database/entities/boards/board.entity';
import { PostEntity } from 'src/database/entities/boards/post.entity';
import { CommentEntity } from 'src/database/entities/boards/comment.entity';
import { MembersModule } from '../members/members.module';

@Module({
  imports: [TypeOrmModule.forFeature([BoardEntity, PostEntity, CommentEntity]), MembersModule],
  controllers: [BoardController],
  providers: [BoardService],
  exports: [BoardService],
})
export class BoardModule {}
