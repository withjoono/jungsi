import { Body, Controller, Get, Post, Request } from '@nestjs/common';
import { MockExamService } from './mock-exam.service';
import { MockexamRawScoreEntity } from 'src/database/entities/mock-exam/mockexam-raw-score.entity';
import {
  CreateMockExamRawScoreDto,
  CreateMockExamStandardScoreDto,
} from './dtos/create-mockexam-score.dto';
import { GetMockExamStandardScoresResponseDto } from './dtos/get-mockexam-standard-score.dto';
import { ApiOperation } from '@nestjs/swagger';

@Controller('mock-exam')
export class MockexamController {
  constructor(private readonly mockExamService: MockExamService) {}

  @ApiOperation({
    summary: '현재 로그인한 유저의 모의고사 원점수 목록을 가져오기',
  })
  @Get('raw')
  async getMockExamRawScores(@Request() req): Promise<MockexamRawScoreEntity[]> {
    return this.mockExamService.getMockexamRawScoresByMemberId(req.memberId);
  }

  @ApiOperation({
    summary: '현재 로그인한 유저의 모의고사 표준점수 목록을 가져오기',
    description: '표점합 (국어 + 수학 + 탐구 상위 2과목)과 나의 누적백분위를 함께 반환',
  })
  @Get('standard')
  async getMockExamScores(@Request() req): Promise<GetMockExamStandardScoresResponseDto> {
    return this.mockExamService.getMockexamScoresByMemberId(req.memberId);
  }

  @ApiOperation({
    summary: '현재 로그인한 유저의 모의고사 점수 등록하기',
  })
  @Post('raw')
  async saveMockExamScore(
    @Request() req,
    @Body() body: CreateMockExamRawScoreDto[],
  ): Promise<void> {
    return this.mockExamService.saveMockexamScore(req.memberId, body);
  }

  @ApiOperation({
    summary: '현재 로그인한 유저의 모의고사 표준 점수 등록하기',
  })
  @Post('standard')
  async saveMockExamStandardScore(
    @Request() req,
    @Body() body: CreateMockExamStandardScoreDto[],
  ): Promise<void> {
    return this.mockExamService.saveMockexamStandardScore(req.memberId, body);
  }
}
