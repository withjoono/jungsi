import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { TempCodeEntity } from '../../database/entities/mentoring/temp-code.entity';
import { AccountLinkEntity } from '../../database/entities/mentoring/account-link.entity';
import { AdminClassEntity } from '../../database/entities/mentoring/admin-class.entity';
import { MentoringInviteEntity } from '../../database/entities/mentoring/invite.entity';
import { MemberEntity } from '../../database/entities/member/member.entity';
import { CreateInviteDto } from './dtos/create-invite.dto';
import { InviteInfoResponseDto } from './dtos/invite-info-response.dto';
import { CreateInviteResponseDto } from './dtos/create-invite-response.dto';

const STUDENT_TYPES = ['student'];
const PARENT_TYPES = ['parent'];
const TEACHER_TYPES = ['teacher'];

@Injectable()
export class MentoringService {
  constructor(
    @InjectRepository(TempCodeEntity)
    private readonly tempCodeRepository: Repository<TempCodeEntity>,
    @InjectRepository(AccountLinkEntity)
    private readonly accountLinkRepository: Repository<AccountLinkEntity>,
    @InjectRepository(AdminClassEntity)
    private readonly adminClassRepository: Repository<AdminClassEntity>,
    @InjectRepository(MentoringInviteEntity)
    private readonly inviteRepository: Repository<MentoringInviteEntity>,
    @InjectRepository(MemberEntity)
    private readonly memberRepository: Repository<MemberEntity>,
  ) {}

  private generateRandomCode(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  }

  private getMemberRole(memberType: string): 'student' | 'parent' | 'teacher' | 'unknown' {
    if (STUDENT_TYPES.includes(memberType)) return 'student';
    if (PARENT_TYPES.includes(memberType)) return 'parent';
    if (TEACHER_TYPES.includes(memberType)) return 'teacher';
    return 'unknown';
  }

  private async cleanupExpiredCodes(): Promise<void> {
    await this.tempCodeRepository.delete({
      expire_at: LessThan(new Date()),
    });
  }

  async generateCode(memberId: number): Promise<{ code: string; expireAt: Date }> {
    const member = await this.memberRepository.findOne({
      where: { id: memberId },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    // 모든 회원 유형이 코드 생성 가능 (student, parent, teacher)
    // member_type이 설정되지 않은 경우만 제한
    const role = this.getMemberRole(member.member_type);
    if (role === 'unknown') {
      throw new BadRequestException('회원 유형이 설정되지 않았습니다');
    }

    await this.tempCodeRepository.delete({ member_id: memberId });

    const code = this.generateRandomCode();
    const expireAt = new Date(Date.now() + 5 * 60 * 1000);

    await this.tempCodeRepository.save({
      member_id: memberId,
      code,
      expire_at: expireAt,
    });

    return { code, expireAt };
  }

  async verifyCode(
    memberId: number,
    code: string,
  ): Promise<{
    success: boolean | string;
    data?: {
      mentorId: number;
      info: {
        nickname: string | null;
        memberType: string;
        email: string;
      };
    };
    message?: string;
  }> {
    await this.cleanupExpiredCodes();

    const tempCode = await this.tempCodeRepository.findOne({
      where: { code },
      relations: ['member'],
    });

    if (!tempCode) {
      return { success: 'no match', message: 'Invalid code' };
    }

    const mentor = tempCode.member;
    const mentorId = tempCode.member_id;

    if (Number(mentorId) === Number(memberId)) {
      return { success: 'self', message: 'Cannot link with yourself' };
    }

    const existingLink = await this.accountLinkRepository.findOne({
      where: [
        { member_id: memberId, linked_member_id: mentorId },
        { member_id: mentorId, linked_member_id: memberId },
      ],
    });

    if (existingLink) {
      return { success: 'over', message: 'Already linked' };
    }

    const currentMember = await this.memberRepository.findOne({
      where: { id: memberId },
    });

    if (!currentMember) {
      throw new NotFoundException('Member not found');
    }

    const currentRole = this.getMemberRole(currentMember.member_type);
    const mentorRole = this.getMemberRole(mentor.member_type);

    if (currentRole === mentorRole) {
      return { success: 'overlap', message: 'Cannot link same roles' };
    }

    if (currentRole === 'parent' && mentorRole !== 'student') {
      return { success: 'par', message: 'Parents can only link with students' };
    }

    if (currentRole === 'teacher' && mentorRole !== 'student') {
      return { success: 'teach', message: 'Teachers can only link with students' };
    }

    return {
      success: true,
      data: {
        mentorId: Number(mentorId),
        info: {
          nickname: mentor.nickname,
          memberType: mentor.member_type,
          email: mentor.email,
        },
      },
    };
  }

  async addLink(memberId: number, mentorId: number): Promise<void> {
    const existingLink = await this.accountLinkRepository.findOne({
      where: [
        { member_id: memberId, linked_member_id: mentorId },
        { member_id: mentorId, linked_member_id: memberId },
      ],
    });

    if (existingLink) {
      throw new BadRequestException('Already linked');
    }

    const today = new Date();

    await this.accountLinkRepository.save({
      member_id: memberId,
      linked_member_id: mentorId,
    });

    await this.adminClassRepository.save({
      member_id: memberId,
      target_member_id: mentorId,
      use_yn: 'Y',
      first_reg_dt: today,
      last_mod_dt: today,
      group_id: 'linked_user',
      group_name: 'Linked User',
    });

    await this.adminClassRepository.save({
      member_id: mentorId,
      target_member_id: memberId,
      use_yn: 'Y',
      first_reg_dt: today,
      last_mod_dt: today,
      group_id: 'linked_user',
      group_name: 'Linked User',
    });
  }

  async getLinks(memberId: number): Promise<{
    linkedMembers: {
      id: number;
      nickname: string | null;
      email: string;
      memberType: string;
      phone: string;
      profileImageUrl: string | null;
      createdAt: Date | null;
      introduction: string | null;
    }[];
  }> {
    // 현재 사용자 정보 조회
    const currentMember = await this.memberRepository.findOne({
      where: { id: memberId },
    });

    const links = await this.accountLinkRepository.find({
      where: [{ member_id: memberId }, { linked_member_id: memberId }],
    });

    const linkedMemberIds = links.map((link) =>
      Number(link.member_id) === Number(memberId)
        ? Number(link.linked_member_id)
        : Number(link.member_id),
    );

    // 연동된 멤버가 없으면 현재 사용자만 반환
    if (linkedMemberIds.length === 0) {
      if (!currentMember) {
        return { linkedMembers: [] };
      }
      return {
        linkedMembers: [
          {
            id: Number(currentMember.id),
            nickname: currentMember.nickname,
            email: currentMember.email,
            memberType: currentMember.member_type,
            phone: currentMember.phone,
            profileImageUrl: currentMember.profile_image_url,
            createdAt: currentMember.create_dt,
            introduction: currentMember.introduction,
          },
        ],
      };
    }

    const members = await this.memberRepository
      .createQueryBuilder('member')
      .where('member.id IN (:...ids)', { ids: linkedMemberIds })
      .getMany();

    // 현재 사용자를 맨 앞에 추가하고 연동된 멤버들을 뒤에 추가
    const result: {
      id: number;
      nickname: string | null;
      email: string;
      memberType: string;
      phone: string;
      profileImageUrl: string | null;
      createdAt: Date | null;
      introduction: string | null;
    }[] = [];

    // 현재 사용자 추가
    if (currentMember) {
      result.push({
        id: Number(currentMember.id),
        nickname: currentMember.nickname,
        email: currentMember.email,
        memberType: currentMember.member_type,
        phone: currentMember.phone,
        profileImageUrl: currentMember.profile_image_url,
        createdAt: currentMember.create_dt,
        introduction: currentMember.introduction,
      });
    }

    // 연동된 멤버들 추가
    members.forEach((member) => {
      result.push({
        id: Number(member.id),
        nickname: member.nickname,
        email: member.email,
        memberType: member.member_type,
        phone: member.phone,
        profileImageUrl: member.profile_image_url,
        createdAt: member.create_dt,
        introduction: member.introduction,
      });
    });

    return { linkedMembers: result };
  }

  async removeLink(memberId: number, linkedMemberId: number): Promise<void> {
    await this.accountLinkRepository.delete([
      { member_id: memberId, linked_member_id: linkedMemberId },
      { member_id: linkedMemberId, linked_member_id: memberId },
    ]);

    await this.adminClassRepository.delete([
      { member_id: memberId, target_member_id: linkedMemberId },
      { member_id: linkedMemberId, target_member_id: memberId },
    ]);
  }

  // ==================== 학생 관리 ====================

  /**
   * 학생 추가 (선생님/학부모가 학생을 자신의 관리 목록에 추가)
   */
  async addStudent(
    memberId: number,
    studentId: number,
    classId?: string,
  ): Promise<{ success: boolean; message: string }> {
    // 자기 자신은 추가 불가
    if (Number(memberId) === Number(studentId)) {
      throw new BadRequestException('자기 자신을 추가할 수 없습니다');
    }

    // 학생 존재 여부 확인
    const student = await this.memberRepository.findOne({
      where: { id: studentId },
    });

    if (!student) {
      throw new NotFoundException('학생을 찾을 수 없습니다');
    }

    // 학생인지 확인
    if (this.getMemberRole(student.member_type) !== 'student') {
      throw new BadRequestException('학생만 추가할 수 있습니다');
    }

    // 이미 연동되어 있는지 확인
    const existingLink = await this.adminClassRepository.findOne({
      where: { member_id: memberId, target_member_id: studentId },
    });

    if (existingLink) {
      throw new BadRequestException('이미 추가된 학생입니다');
    }

    const today = new Date();

    // AdminClass에 추가
    await this.adminClassRepository.save({
      member_id: memberId,
      target_member_id: studentId,
      use_yn: 'Y',
      first_reg_dt: today,
      last_mod_dt: today,
      group_id: classId || 'default',
      group_name: classId || 'Default Class',
    });

    // AccountLink에도 양방향 추가
    const existingAccountLink = await this.accountLinkRepository.findOne({
      where: [
        { member_id: memberId, linked_member_id: studentId },
        { member_id: studentId, linked_member_id: memberId },
      ],
    });

    if (!existingAccountLink) {
      await this.accountLinkRepository.save({
        member_id: memberId,
        linked_member_id: studentId,
      });
    }

    return { success: true, message: '학생이 추가되었습니다' };
  }

  /**
   * 학생 삭제 (관리 목록에서 제거)
   */
  async deleteStudent(
    memberId: number,
    studentId: number,
  ): Promise<{ success: boolean; message: string }> {
    // AdminClass에서 삭제
    const result = await this.adminClassRepository.delete({
      member_id: memberId,
      target_member_id: studentId,
    });

    if (result.affected === 0) {
      throw new NotFoundException('해당 학생을 찾을 수 없습니다');
    }

    // AccountLink에서도 삭제
    await this.accountLinkRepository.delete([
      { member_id: memberId, linked_member_id: studentId },
      { member_id: studentId, linked_member_id: memberId },
    ]);

    return { success: true, message: '학생이 삭제되었습니다' };
  }

  // ==================== 반 관리 ====================

  /**
   * 반 추가 (새로운 그룹 생성)
   */
  async addClass(
    memberId: number,
    className: string,
  ): Promise<{ success: boolean; classId: string; message: string }> {
    // 고유한 classId 생성 (timestamp + random)
    const classId = `class_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 같은 이름의 반이 이미 있는지 확인
    const existingClass = await this.adminClassRepository.findOne({
      where: { member_id: memberId, group_name: className },
    });

    if (existingClass) {
      throw new BadRequestException('같은 이름의 반이 이미 존재합니다');
    }

    // 빈 반 생성을 위해 placeholder 레코드 생성 (target_member_id = 0)
    // 실제 학생이 추가되면 이 레코드는 업데이트되거나 새로운 레코드가 추가됨
    const today = new Date();

    await this.adminClassRepository.save({
      member_id: memberId,
      target_member_id: 0, // placeholder
      use_yn: 'Y',
      first_reg_dt: today,
      last_mod_dt: today,
      group_id: classId,
      group_name: className,
    });

    return { success: true, classId, message: '반이 생성되었습니다' };
  }

  /**
   * 반 삭제 (해당 반의 모든 학생 연결 해제)
   */
  async deleteClass(
    memberId: number,
    classId: string,
  ): Promise<{ success: boolean; message: string }> {
    // 해당 반에 속한 모든 레코드 삭제
    const result = await this.adminClassRepository.delete({
      member_id: memberId,
      group_id: classId,
    });

    if (result.affected === 0) {
      throw new NotFoundException('해당 반을 찾을 수 없습니다');
    }

    return { success: true, message: '반이 삭제되었습니다' };
  }

  /**
   * 반 목록 조회
   */
  async getClasses(memberId: number): Promise<{
    classes: { classId: string; className: string; studentCount: number }[];
  }> {
    const adminClasses = await this.adminClassRepository.find({
      where: { member_id: memberId, use_yn: 'Y' },
    });

    // group_id별로 그룹화
    const classMap = new Map<string, { className: string; studentCount: number }>();

    adminClasses.forEach((ac) => {
      if (ac.group_id) {
        if (!classMap.has(ac.group_id)) {
          classMap.set(ac.group_id, {
            className: ac.group_name || ac.group_id,
            studentCount: 0,
          });
        }
        // target_member_id가 0이 아닌 경우만 학생 수에 포함
        if (ac.target_member_id !== 0) {
          const classInfo = classMap.get(ac.group_id)!;
          classInfo.studentCount++;
        }
      }
    });

    const classes = Array.from(classMap.entries()).map(([classId, info]) => ({
      classId,
      className: info.className,
      studentCount: info.studentCount,
    }));

    return { classes };
  }

  /**
   * 학생 목록 조회 (특정 반 또는 전체)
   */
  async getStudents(
    memberId: number,
    classId?: string,
  ): Promise<{
    students: {
      id: number;
      nickname: string | null;
      email: string;
      phone: string;
      classId: string | null;
      className: string | null;
    }[];
  }> {
    const whereCondition: any = {
      member_id: memberId,
      use_yn: 'Y',
    };

    if (classId) {
      whereCondition.group_id = classId;
    }

    const adminClasses = await this.adminClassRepository.find({
      where: whereCondition,
      relations: ['targetMember'],
    });

    const students = adminClasses
      .filter((ac) => ac.target_member_id !== 0 && ac.targetMember)
      .map((ac) => ({
        id: Number(ac.target_member_id),
        nickname: ac.targetMember.nickname,
        email: ac.targetMember.email,
        phone: ac.targetMember.phone,
        classId: ac.group_id,
        className: ac.group_name,
      }));

    return { students };
  }

  // ==================== 초대 코드 관리 ====================

  /**
   * 초대 코드 생성용 랜덤 문자열 생성 (32자)
   */
  private generateInviteCode(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < 32; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  }

  /**
   * 초대 코드 생성 (선생님 전용)
   */
  async createInvite(teacherId: number, dto: CreateInviteDto): Promise<CreateInviteResponseDto> {
    // 선생님 확인
    const teacher = await this.memberRepository.findOne({
      where: { id: teacherId },
    });

    if (!teacher) {
      throw new NotFoundException('회원을 찾을 수 없습니다');
    }

    const role = this.getMemberRole(teacher.member_type);
    if (role !== 'teacher') {
      throw new BadRequestException('선생님만 초대 코드를 생성할 수 있습니다');
    }

    // 유니크한 초대 코드 생성
    let inviteCode: string;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      inviteCode = this.generateInviteCode();
      const existing = await this.inviteRepository.findOne({
        where: { invite_code: inviteCode },
      });
      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      throw new BadRequestException('초대 코드 생성에 실패했습니다. 다시 시도해주세요.');
    }

    // 만료일 계산 (기본 7일)
    const validDays = dto.validDays || 7;
    const expireAt = new Date();
    expireAt.setDate(expireAt.getDate() + validDays);

    // 초대 레코드 생성
    const invite = await this.inviteRepository.save({
      teacher_id: teacherId,
      invite_code: inviteCode,
      class_id: dto.classId || null,
      class_name: dto.className || null,
      invite_type: dto.inviteType || 'student',
      max_use_count: dto.maxUseCount || 100,
      use_count: 0,
      is_active: true,
      expire_at: expireAt,
    });

    // 응답 생성
    const baseUrl = 'https://turtleskool.com';
    return {
      inviteCode: invite.invite_code,
      inviteUrl: `${baseUrl}/invite/${invite.invite_code}`,
      expireAt: invite.expire_at,
      maxUseCount: invite.max_use_count,
    };
  }

  /**
   * 초대 코드 정보 조회
   */
  async getInviteInfo(code: string): Promise<InviteInfoResponseDto> {
    const invite = await this.inviteRepository.findOne({
      where: { invite_code: code },
      relations: ['teacher'],
    });

    if (!invite) {
      throw new NotFoundException('유효하지 않은 초대 코드입니다');
    }

    const now = new Date();
    const isExpired = invite.expire_at < now;
    const isMaxUsed = invite.use_count >= invite.max_use_count;
    const isValid = invite.is_active && !isExpired && !isMaxUsed;

    return {
      inviteCode: invite.invite_code,
      teacherId: Number(invite.teacher_id),
      teacherName: invite.teacher?.nickname || invite.teacher?.email || '선생님',
      classId: invite.class_id,
      className: invite.class_name,
      inviteType: invite.invite_type,
      useCount: invite.use_count,
      maxUseCount: invite.max_use_count,
      isActive: invite.is_active,
      expireAt: invite.expire_at,
      createdAt: invite.created_at,
      isValid,
    };
  }

  /**
   * 초대 코드 유효성 검사 (내부용)
   */
  async validateInviteCode(code: string): Promise<{
    valid: boolean;
    invite?: MentoringInviteEntity;
    message?: string;
  }> {
    const invite = await this.inviteRepository.findOne({
      where: { invite_code: code },
    });

    if (!invite) {
      return { valid: false, message: '유효하지 않은 초대 코드입니다' };
    }

    if (!invite.is_active) {
      return { valid: false, message: '비활성화된 초대 코드입니다' };
    }

    const now = new Date();
    if (invite.expire_at < now) {
      return { valid: false, message: '만료된 초대 코드입니다' };
    }

    if (invite.use_count >= invite.max_use_count) {
      return { valid: false, message: '사용 횟수를 초과한 초대 코드입니다' };
    }

    return { valid: true, invite };
  }

  /**
   * 회원가입 후 초대 코드 처리 (학생/학부모 자동 연동)
   */
  async processInviteAfterRegister(
    memberId: number,
    inviteCode: string,
  ): Promise<{ success: boolean; message: string }> {
    // 초대 코드 유효성 검사
    const validation = await this.validateInviteCode(inviteCode);
    if (!validation.valid) {
      return { success: false, message: validation.message };
    }

    const invite = validation.invite;
    const teacherId = Number(invite.teacher_id);

    // 회원 정보 조회
    const member = await this.memberRepository.findOne({
      where: { id: memberId },
    });

    if (!member) {
      return { success: false, message: '회원 정보를 찾을 수 없습니다' };
    }

    const memberRole = this.getMemberRole(member.member_type);

    // 초대 유형과 회원 유형 매칭 검사
    if (invite.invite_type === 'student' && memberRole !== 'student') {
      return { success: false, message: '학생 전용 초대 코드입니다' };
    }
    if (invite.invite_type === 'parent' && memberRole !== 'parent') {
      return { success: false, message: '학부모 전용 초대 코드입니다' };
    }

    // 이미 연동되어 있는지 확인
    const existingLink = await this.accountLinkRepository.findOne({
      where: [
        { member_id: memberId, linked_member_id: teacherId },
        { member_id: teacherId, linked_member_id: memberId },
      ],
    });

    if (existingLink) {
      return { success: false, message: '이미 연동된 선생님입니다' };
    }

    const today = new Date();

    // AccountLink 생성 (양방향)
    await this.accountLinkRepository.save({
      member_id: memberId,
      linked_member_id: teacherId,
    });

    // AdminClass에 학생 추가
    await this.adminClassRepository.save({
      member_id: teacherId,
      target_member_id: memberId,
      use_yn: 'Y',
      first_reg_dt: today,
      last_mod_dt: today,
      group_id: invite.class_id || 'invited_user',
      group_name: invite.class_name || 'Invited User',
    });

    // 초대 코드 사용 횟수 증가
    await this.inviteRepository.update({ id: invite.id }, { use_count: invite.use_count + 1 });

    return { success: true, message: '선생님과 연동되었습니다' };
  }

  /**
   * 선생님의 초대 코드 목록 조회
   */
  async getMyInvites(teacherId: number): Promise<{
    invites: InviteInfoResponseDto[];
  }> {
    const invites = await this.inviteRepository.find({
      where: { teacher_id: teacherId },
      order: { created_at: 'DESC' },
    });

    const now = new Date();
    const result = invites.map((invite) => {
      const isExpired = invite.expire_at < now;
      const isMaxUsed = invite.use_count >= invite.max_use_count;
      const isValid = invite.is_active && !isExpired && !isMaxUsed;

      return {
        inviteCode: invite.invite_code,
        teacherId: Number(invite.teacher_id),
        teacherName: '', // 자신의 목록이므로 이름 불필요
        classId: invite.class_id,
        className: invite.class_name,
        inviteType: invite.invite_type,
        useCount: invite.use_count,
        maxUseCount: invite.max_use_count,
        isActive: invite.is_active,
        expireAt: invite.expire_at,
        createdAt: invite.created_at,
        isValid,
      };
    });

    return { invites: result };
  }

  /**
   * 초대 코드 비활성화
   */
  async deactivateInvite(
    teacherId: number,
    inviteCode: string,
  ): Promise<{ success: boolean; message: string }> {
    const invite = await this.inviteRepository.findOne({
      where: { invite_code: inviteCode, teacher_id: teacherId },
    });

    if (!invite) {
      throw new NotFoundException('초대 코드를 찾을 수 없습니다');
    }

    await this.inviteRepository.update({ id: invite.id }, { is_active: false });

    return { success: true, message: '초대 코드가 비활성화되었습니다' };
  }
}
