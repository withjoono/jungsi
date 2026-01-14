import { UseTicketReqDto } from '../dtos/use-ticket.dto';
import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { OfficerEvaluationService } from '../services/officer-evaluation.service';
import { GetOfficerEvaluationsResponseDto } from '../dtos/officer-evaluations-response.dto';
import { MemberPermissionGuard } from '../../members/guards/user-permission.guard';
import { OfficerEvaluationCommentEntity } from 'src/database/entities/officer-evaluation/officer-evaluation-comment.entity';
import { OfficerEvaluationScoreEntity } from 'src/database/entities/officer-evaluation/officer-evaluation-score.entity';
import { OfficerEvaluationSurveyEntity } from 'src/database/entities/officer-evaluation/officer-evaluation-survey.entity';
import { GetOfficerListResponseDto } from '../dtos/officer-list-response.dto';
import { CurrentMemberId } from 'src/auth/decorators/current-member_id.decorator';
import { GetTicketCountResponseDto } from '../dtos/ticket-count-response.dto';
import { SelfEvaluationBodyDto } from '../dtos/self-evaluation.dto';
import { OfficerEvaluationBodyDto } from '../dtos/officer-evaluation.dto';

@Controller('officer-evaluation')
export class OfficerEvaluationController {
  constructor(private readonly officerEvaluationService: OfficerEvaluationService) {}

  /**
   * 사정관 목록 조회
   */
  @Get('officer')
  async getOfficerList(): Promise<GetOfficerListResponseDto[]> {
    return this.officerEvaluationService.getOfficerList();
  }

  /**
   * 주어진 member_id로 평가 목록을 가져오기
   * @param memberId - 멤버 ID
   * @returns 평가 목록
   */
  @Get('member/:memberId')
  @UseGuards(MemberPermissionGuard)
  async getEvaluationsByMemberId(
    @Param('memberId') memberId: number,
  ): Promise<GetOfficerEvaluationsResponseDto[]> {
    return this.officerEvaluationService.getEvaluationsByMemberId(memberId);
  }

  /**
   * 주어진 id로 평가의 comments를 가져옴
   * @param id - 평가 ID
   */
  @Get(':id/comments')
  async getEvaluationCommentsByID(
    @Param('id') id: number,
  ): Promise<OfficerEvaluationCommentEntity[]> {
    return this.officerEvaluationService.getEvaluationCommentsByID(id);
  }

  /**
   * 주어진 id로 평가의 scores를 가져옴
   * @param id - 평가 ID
   */
  @Get(':id/scores')
  async getEvaluationScoresByID(@Param('id') id: number): Promise<OfficerEvaluationScoreEntity[]> {
    return this.officerEvaluationService.getEvaluationScoresByID(id);
  }

  /**
   * 평가의 질문목록을 가져옴
   */
  @Get('survey')
  async getEvaluationSurvey(): Promise<OfficerEvaluationSurveyEntity[]> {
    return this.officerEvaluationService.getEvaluationSurvey();
  }

  /**
   * 티켓 갯수를 조회
   */
  @Get('ticket')
  async getTicketCount(@CurrentMemberId() memberId: string): Promise<GetTicketCountResponseDto> {
    return this.officerEvaluationService.getTicketCount(memberId);
  }

  /**
   * 티켓 사용(평가 신청)
   */
  @Post('ticket')
  async useTicket(
    @CurrentMemberId() memberId: string,
    @Body() body: UseTicketReqDto,
  ): Promise<void> {
    return this.officerEvaluationService.useTicket(memberId, body);
  }

  /**
   * 자가평가
   */
  @Post('self')
  async saveEvaluationBySelf(
    @CurrentMemberId() memberId: string,
    @Body() body: SelfEvaluationBodyDto,
  ): Promise<void> {
    return this.officerEvaluationService.saveEvaluationBySelf(memberId, body);
  }

  /**
   * 평가자 평가
   */
  @Post('add')
  async saveEvaluationByOfficer(
    @CurrentMemberId() memberId: string,
    @Body() body: OfficerEvaluationBodyDto,
  ): Promise<void> {
    return this.officerEvaluationService.saveEvaluationByOfficer(memberId, body);
  }
}
