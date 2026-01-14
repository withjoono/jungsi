import { Controller, Get, Post, Query, Body, Delete, Request, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MentoringService } from './mentoring.service';
import {
  VerifyCodeDto,
  AddLinkDto,
  RemoveLinkDto,
  AddStudentDto,
  AddClassDto,
  DeleteClassDto,
  CreateInviteDto,
  InviteInfoResponseDto,
  CreateInviteResponseDto,
} from './dtos';
import { Public } from '../../auth/decorators/public.decorator';

@ApiTags('Mentoring')
@ApiBearerAuth()
@Controller('mentoring')
export class MentoringController {
  constructor(private readonly mentoringService: MentoringService) {}

  @Post('generate-code')
  @ApiOperation({
    summary: '연계 코드 생성',
    description:
      '멘토-멘티 연동을 위한 6자리 코드를 생성합니다. 모든 회원 유형(학생, 학부모, 선생님)이 코드를 생성할 수 있습니다. 코드 유효시간: 5분',
  })
  @ApiResponse({ status: 200, description: '코드 생성 성공' })
  @ApiResponse({ status: 400, description: '회원 유형이 설정되지 않음' })
  async generateCode(@Request() req: any) {
    const memberId = req.user.memberId;
    const result = await this.mentoringService.generateCode(memberId);
    return {
      success: true,
      data: {
        code: result.code,
        expireAt: result.expireAt,
      },
    };
  }

  @Get('verify-code')
  @ApiOperation({
    summary: '연계 코드 확인',
    description:
      '입력된 6자리 코드가 유효한지 확인하고 코드 생성자 정보를 반환합니다. 이미 연동됨/자기자신/같은 직종/역할 제한 등 검증 포함',
  })
  @ApiResponse({ status: 200, description: '코드 확인 결과' })
  async verifyCode(@Request() req: any, @Query() dto: VerifyCodeDto) {
    const memberId = req.user.memberId;
    return await this.mentoringService.verifyCode(memberId, dto.code);
  }

  @Post('add-link')
  @ApiOperation({
    summary: '계정 연동 추가',
    description:
      '코드 확인 후 두 계정을 연동합니다. accountlinks와 adminclass 테이블에 양방향 관계가 추가됩니다.',
  })
  @ApiResponse({ status: 200, description: '연동 성공' })
  @ApiResponse({ status: 400, description: '이미 연동된 계정' })
  async addLink(@Request() req: any, @Body() dto: AddLinkDto) {
    const memberId = req.user.memberId;
    await this.mentoringService.addLink(memberId, dto.mentorId);
    return { success: true };
  }

  @Get('get-links')
  @ApiOperation({
    summary: '연동된 계정 목록 조회',
    description:
      '현재 사용자와 연동된 모든 계정을 조회합니다. 결과의 첫 번째 항목은 현재 사용자 정보입니다.',
  })
  @ApiResponse({ status: 200, description: '연동된 계정 목록' })
  async getLinks(@Request() req: any) {
    const memberId = req.user.memberId;
    const result = await this.mentoringService.getLinks(memberId);
    return {
      success: true,
      data: result.linkedMembers,
    };
  }

  @Delete('remove-link')
  @ApiOperation({
    summary: '계정 연동 해제',
    description:
      '연동된 계정을 해제합니다. accountlinks와 adminclass 테이블에서 양방향 관계가 삭제됩니다.',
  })
  @ApiResponse({ status: 200, description: '연동 해제 성공' })
  async removeLink(@Request() req: any, @Body() dto: RemoveLinkDto) {
    const memberId = req.user.memberId;
    await this.mentoringService.removeLink(memberId, dto.linkedMemberId);
    return { success: true };
  }

  // ==================== 학생 관리 ====================

  @Post('students')
  @ApiOperation({
    summary: '학생 추가',
    description: '선생님/학부모가 학생을 자신의 관리 목록에 추가합니다.',
  })
  @ApiResponse({ status: 200, description: '학생 추가 성공' })
  @ApiResponse({ status: 400, description: '잘못된 요청 (자기 자신, 이미 추가됨 등)' })
  @ApiResponse({ status: 404, description: '학생을 찾을 수 없음' })
  async addStudent(@Request() req: any, @Body() dto: AddStudentDto) {
    const memberId = req.user.memberId;
    const result = await this.mentoringService.addStudent(memberId, dto.studentId, dto.classId);
    return { success: true, data: result };
  }

  @Delete('students/:studentId')
  @ApiOperation({
    summary: '학생 삭제',
    description: '관리 목록에서 학생을 제거합니다.',
  })
  @ApiResponse({ status: 200, description: '학생 삭제 성공' })
  @ApiResponse({ status: 404, description: '학생을 찾을 수 없음' })
  async deleteStudent(@Request() req: any, @Param('studentId') studentId: number) {
    const memberId = req.user.memberId;
    const result = await this.mentoringService.deleteStudent(memberId, Number(studentId));
    return { success: true, data: result };
  }

  @Get('students')
  @ApiOperation({
    summary: '학생 목록 조회',
    description:
      '관리 중인 학생 목록을 조회합니다. classId를 지정하면 해당 반의 학생만 조회합니다.',
  })
  @ApiResponse({ status: 200, description: '학생 목록' })
  async getStudents(@Request() req: any, @Query('classId') classId?: string) {
    const memberId = req.user.memberId;
    const result = await this.mentoringService.getStudents(memberId, classId);
    return { success: true, data: result.students };
  }

  // ==================== 반 관리 ====================

  @Post('classes')
  @ApiOperation({
    summary: '반 추가',
    description: '새로운 반(그룹)을 생성합니다.',
  })
  @ApiResponse({ status: 200, description: '반 생성 성공' })
  @ApiResponse({ status: 400, description: '같은 이름의 반이 이미 존재함' })
  async addClass(@Request() req: any, @Body() dto: AddClassDto) {
    const memberId = req.user.memberId;
    const result = await this.mentoringService.addClass(memberId, dto.className);
    return { success: true, data: result };
  }

  @Delete('classes')
  @ApiOperation({
    summary: '반 삭제',
    description: '반을 삭제합니다. 해당 반에 속한 학생들의 연결도 해제됩니다.',
  })
  @ApiResponse({ status: 200, description: '반 삭제 성공' })
  @ApiResponse({ status: 404, description: '반을 찾을 수 없음' })
  async deleteClass(@Request() req: any, @Body() dto: DeleteClassDto) {
    const memberId = req.user.memberId;
    const result = await this.mentoringService.deleteClass(memberId, dto.classId);
    return { success: true, data: result };
  }

  @Get('classes')
  @ApiOperation({
    summary: '반 목록 조회',
    description: '생성한 반 목록을 조회합니다.',
  })
  @ApiResponse({ status: 200, description: '반 목록' })
  async getClasses(@Request() req: any) {
    const memberId = req.user.memberId;
    const result = await this.mentoringService.getClasses(memberId);
    return { success: true, data: result.classes };
  }

  // ==================== 초대 코드 관리 ====================

  @Post('invite')
  @ApiOperation({
    summary: '초대 코드 생성',
    description:
      '선생님이 학생/학부모 초대용 코드를 생성합니다. 생성된 코드는 7일간 유효하며, 최대 100회까지 사용 가능합니다.',
  })
  @ApiResponse({
    status: 201,
    description: '초대 코드 생성 성공',
    type: CreateInviteResponseDto,
  })
  @ApiResponse({ status: 400, description: '선생님만 초대 코드를 생성할 수 있습니다' })
  async createInvite(@Request() req: any, @Body() dto: CreateInviteDto) {
    const teacherId = req.user.memberId;
    const result = await this.mentoringService.createInvite(teacherId, dto);
    return { success: true, data: result };
  }

  @Public()
  @Get('invite/:code')
  @ApiOperation({
    summary: '초대 코드 정보 조회',
    description:
      '초대 코드의 정보를 조회합니다. 인증 없이 접근 가능합니다. 선생님 정보, 반 정보, 유효 여부 등을 반환합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '초대 코드 정보',
    type: InviteInfoResponseDto,
  })
  @ApiResponse({ status: 404, description: '유효하지 않은 초대 코드' })
  async getInviteInfo(@Param('code') code: string) {
    const result = await this.mentoringService.getInviteInfo(code);
    return { success: true, data: result };
  }

  @Get('invites')
  @ApiOperation({
    summary: '내 초대 코드 목록 조회',
    description: '선생님이 생성한 모든 초대 코드 목록을 조회합니다.',
  })
  @ApiResponse({ status: 200, description: '초대 코드 목록' })
  async getMyInvites(@Request() req: any) {
    const teacherId = req.user.memberId;
    const result = await this.mentoringService.getMyInvites(teacherId);
    return { success: true, data: result.invites };
  }

  @Delete('invite/:code')
  @ApiOperation({
    summary: '초대 코드 비활성화',
    description: '선생님이 자신이 생성한 초대 코드를 비활성화합니다.',
  })
  @ApiResponse({ status: 200, description: '비활성화 성공' })
  @ApiResponse({ status: 404, description: '초대 코드를 찾을 수 없음' })
  async deactivateInvite(@Request() req: any, @Param('code') code: string) {
    const teacherId = req.user.memberId;
    const result = await this.mentoringService.deactivateInvite(teacherId, code);
    return { success: true, data: result };
  }
}
