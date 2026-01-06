import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import {
  PlanEntity,
  PlannerItemEntity,
  RoutineEntity,
  PlannerClassEntity,
  PlannerManagementEntity,
  PlannerNoticeEntity,
} from '../../database/entities/planner';
import { MemberEntity } from '../../database/entities/member/member.entity';
import {
  CreatePlanDto,
  UpdatePlanDto,
  UpdatePlanProgressDto,
  CreatePlannerItemDto,
  UpdatePlannerItemDto,
  CreateRoutineDto,
  UpdateRoutineDto,
  SetPlannerClassDto,
  PrimaryType,
  WeeklyProgressResponse,
  NoticeResponseDto,
  RankResponseDto,
  RankPeriodType,
  PlannerMentorResponseDto,
} from './dtos';

@Injectable()
export class PlannerService {
  constructor(
    @InjectRepository(PlanEntity)
    private readonly planRepository: Repository<PlanEntity>,
    @InjectRepository(PlannerItemEntity)
    private readonly plannerItemRepository: Repository<PlannerItemEntity>,
    @InjectRepository(RoutineEntity)
    private readonly routineRepository: Repository<RoutineEntity>,
    @InjectRepository(PlannerClassEntity)
    private readonly plannerClassRepository: Repository<PlannerClassEntity>,
    @InjectRepository(PlannerManagementEntity)
    private readonly plannerManagementRepository: Repository<PlannerManagementEntity>,
    @InjectRepository(PlannerNoticeEntity)
    private readonly plannerNoticeRepository: Repository<PlannerNoticeEntity>,
    @InjectRepository(MemberEntity)
    private readonly memberRepository: Repository<MemberEntity>,
    private readonly dataSource: DataSource,
  ) {}

  // ============================================
  // 장기 학습계획 (Plan) 관련 메서드
  // ============================================

  async getPlans(memberId: number): Promise<any[]> {
    const plans = await this.planRepository.find({
      where: { member_id: memberId, start_time: null },
      order: { created_at: 'DESC' },
    });

    return plans.map((plan) => {
      const result: any = {
        id: Number(plan.id),
        startDate: plan.start_date,
        endDate: plan.end_date,
        memberId: Number(plan.member_id),
        title: plan.title,
        subject: plan.subject,
        step: plan.step,
        startTime: plan.start_time,
        endTime: plan.end_time,
        type: plan.type,
        done: plan.done,
        total: plan.total,
        person: plan.person,
        material: plan.material,
        isItem: plan.is_item,
        isItemDone: plan.is_item_done,
      };

      if (plan.material) {
        result.study = {
          title: plan.material,
          amount: plan.total,
          finished: plan.done,
          person: plan.person,
          type: plan.type === 1 ? 'textbook' : 'lecture',
        };
      }

      return result;
    });
  }

  async createPlan(memberId: number, dto: CreatePlanDto): Promise<number> {
    const plan = this.planRepository.create({
      member_id: memberId,
      title: dto.title,
      subject: dto.subject || null,
      step: dto.step || null,
      start_date: dto.startDay ? new Date(dto.startDay) : null,
      end_date: dto.endDay ? new Date(dto.endDay) : null,
      type: dto.type === 'textbook' ? 1 : 0,
      material: dto.material || null,
      total: dto.amount || null,
      person: dto.person || null,
      done: dto.finished || 0,
    });

    const saved = await this.planRepository.save(plan);
    return Number(saved.id);
  }

  async updatePlan(memberId: number, dto: UpdatePlanDto): Promise<void> {
    const plan = await this.planRepository.findOne({
      where: { id: dto.id, member_id: memberId },
    });

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    await this.planRepository.update(
      { id: dto.id, member_id: memberId },
      {
        title: dto.title,
        subject: dto.subject || null,
        step: dto.step || null,
        start_date: dto.startDay ? new Date(dto.startDay) : null,
        end_date: dto.endDay ? new Date(dto.endDay) : null,
        type: dto.type === 'textbook' ? 1 : 0,
        material: dto.material || null,
        total: dto.amount || null,
        person: dto.person || null,
        done: dto.finished || 0,
      },
    );
  }

  async updatePlanProgress(memberId: number, dto: UpdatePlanProgressDto): Promise<void> {
    const item = await this.planRepository.findOne({
      where: { id: dto.itemId, member_id: memberId },
    });

    if (!item) {
      throw new NotFoundException('Plan item not found');
    }

    if (dto.id) {
      // 상위 계획의 done 값 업데이트
      if (!item.is_item_done) {
        await this.planRepository.increment({ id: dto.id, member_id: memberId }, 'done', dto.done);
      } else {
        await this.planRepository.decrement({ id: dto.id, member_id: memberId }, 'done', dto.done);
      }
    }

    // 아이템의 완료 상태 토글
    await this.planRepository.update(
      { id: dto.itemId, member_id: memberId },
      { is_item_done: !item.is_item_done },
    );
  }

  async deletePlan(memberId: number, planId: number): Promise<void> {
    const result = await this.planRepository.delete({
      id: planId,
      member_id: memberId,
    });

    if (result.affected === 0) {
      throw new NotFoundException('Plan not found');
    }
  }

  // ============================================
  // 일정 아이템 (PlannerItem) 관련 메서드
  // ============================================

  async getPlannerItems(memberId: number): Promise<any[]> {
    const items = await this.plannerItemRepository.find({
      where: { member_id: memberId },
      order: { start_date: 'ASC' },
    });

    return items.map((item) => ({
      id: Number(item.id),
      memberId: Number(item.member_id),
      primaryType: item.primary_type,
      subject: item.subject,
      teacher: item.teacher,
      title: item.title,
      startDate: item.start_date,
      endDate: item.end_date,
      rRule: item.r_rule,
      exDate: item.ex_date,
      late: item.late,
      absent: item.absent,
      description: item.description,
      progress: item.progress,
      score: item.score,
      rank: item.rank,
      mentorRank: item.mentor_rank,
      mentorDesc: item.mentor_desc,
      mentorTest: item.mentor_test,
      studyType: item.study_type,
      studyContent: item.study_content,
      planDate: item.plan_date,
      achievement: item.achievement,
      taskStatus: item.task_status,
      test: item.test,
      startPage: item.start_page,
      endPage: item.end_page,
      startSession: item.start_session,
      endSession: item.end_session,
    }));
  }

  async createPlannerItem(memberId: number, dto: CreatePlannerItemDto): Promise<number> {
    const item = this.plannerItemRepository.create({
      member_id: memberId,
      primary_type: dto.primaryType,
      subject: dto.subject || null,
      teacher: dto.teacher || null,
      title: dto.title,
      start_date: new Date(dto.startDate),
      end_date: new Date(dto.endDate),
      r_rule: dto.rRule || null,
      ex_date: dto.exDate || null,
      late: dto.late || false,
      absent: dto.absent || false,
      description: dto.description || null,
      progress: dto.progress || 0,
      score: dto.score || null,
      rank: dto.rank || null,
      mentor_rank: dto.mentorRank || null,
      mentor_desc: dto.mentorDesc || null,
      mentor_test: dto.mentorTest || null,
      study_type: dto.studyType || null,
      study_content: dto.studyContent || null,
      start_page: dto.startPage || null,
      end_page: dto.endPage || null,
      start_session: dto.startSession || null,
      end_session: dto.endSession || null,
    });

    const saved = await this.plannerItemRepository.save(item);
    return Number(saved.id);
  }

  async updatePlannerItem(memberId: number, dto: UpdatePlannerItemDto): Promise<void> {
    const item = await this.plannerItemRepository.findOne({
      where: { id: dto.id, member_id: memberId },
    });

    if (!item) {
      throw new NotFoundException('Planner item not found');
    }

    await this.plannerItemRepository.update(
      { id: dto.id, member_id: memberId },
      {
        primary_type: dto.primaryType,
        subject: dto.subject || null,
        teacher: dto.teacher || null,
        title: dto.title,
        start_date: new Date(dto.startDate),
        end_date: new Date(dto.endDate),
        r_rule: dto.rRule || null,
        ex_date: dto.exDate || null,
        late: dto.late || false,
        absent: dto.absent || false,
        description: dto.description || null,
        progress: dto.progress || 0,
        score: dto.score || null,
        rank: dto.rank || null,
        mentor_rank: dto.mentorRank || null,
        mentor_desc: dto.mentorDesc || null,
        mentor_test: dto.mentorTest || null,
        study_type: dto.studyType || null,
        study_content: dto.studyContent || null,
        start_page: dto.startPage || null,
        end_page: dto.endPage || null,
        start_session: dto.startSession || null,
        end_session: dto.endSession || null,
      },
    );
  }

  async deletePlannerItem(memberId: number, itemId: number): Promise<void> {
    const result = await this.plannerItemRepository.delete({
      id: itemId,
      member_id: memberId,
    });

    if (result.affected === 0) {
      throw new NotFoundException('Planner item not found');
    }
  }

  // ============================================
  // 루틴 (Routine) 관련 메서드
  // ============================================

  async getRoutines(memberId: number): Promise<any[]> {
    const routines = await this.routineRepository.find({
      where: { member_id: memberId },
      order: { start_time: 'ASC' },
    });

    return routines.map((routine) => ({
      id: Number(routine.id),
      memberId: Number(routine.member_id),
      title: routine.title,
      startTime: routine.start_time,
      endTime: routine.end_time,
      repeat: routine.repeat,
      date: routine.date,
      length: routine.length,
      sun: routine.sun,
      mon: routine.mon,
      tues: routine.tues,
      wed: routine.wed,
      thurs: routine.thurs,
      fri: routine.fri,
      sat: routine.sat,
    }));
  }

  async createRoutine(memberId: number, dto: CreateRoutineDto): Promise<number> {
    const routine = this.routineRepository.create({
      member_id: memberId,
      title: dto.title,
      start_time: dto.startTime,
      end_time: dto.endTime,
      repeat: dto.repeat,
      date: dto.date ? new Date(dto.date) : null,
      sun: dto.days[0],
      mon: dto.days[1],
      tues: dto.days[2],
      wed: dto.days[3],
      thurs: dto.days[4],
      fri: dto.days[5],
      sat: dto.days[6],
    });

    const saved = await this.routineRepository.save(routine);
    return Number(saved.id);
  }

  async updateRoutine(memberId: number, dto: UpdateRoutineDto): Promise<void> {
    const routine = await this.routineRepository.findOne({
      where: { id: dto.id, member_id: memberId },
    });

    if (!routine) {
      throw new NotFoundException('Routine not found');
    }

    await this.routineRepository.update(
      { id: dto.id, member_id: memberId },
      {
        title: dto.title,
        start_time: dto.startTime,
        end_time: dto.endTime,
        repeat: dto.repeat,
        date: dto.date ? new Date(dto.date) : null,
        sun: dto.days[0],
        mon: dto.days[1],
        tues: dto.days[2],
        wed: dto.days[3],
        thurs: dto.days[4],
        fri: dto.days[5],
        sat: dto.days[6],
      },
    );
  }

  async deleteRoutine(memberId: number, routineId: number): Promise<void> {
    const result = await this.routineRepository.delete({
      id: routineId,
      member_id: memberId,
    });

    if (result.affected === 0) {
      throw new NotFoundException('Routine not found');
    }
  }

  // ============================================
  // 주간 성취도 그래프 관련 메서드
  // ============================================

  async getWeeklyProgress(
    memberId: number,
    primaryType: PrimaryType,
  ): Promise<WeeklyProgressResponse[]> {
    const query = `
      WITH res AS (
        SELECT
          TO_CHAR(a."start_date", 'yyyy-mm-dd') AS start_date,
          TO_CHAR(a."end_date", 'yyyy-mm-dd') AS end_date,
          a."primary_type" AS primary_type,
          a.subject,
          EXTRACT(MINUTE FROM a."end_date" - a."start_date") * 1 AS date_diff_hour,
          a."member_id" AS member_id,
          CAST(a.progress AS NUMERIC) AS progress,
          TO_CHAR(a."start_date", 'Day') AS start_date_day,
          EXTRACT(ISODOW FROM a."start_date") AS start_date_day_cd
        FROM planner_item_tb a
        WHERE a."member_id" = $1
          AND a."primary_type" = $2
          AND TO_CHAR(a."start_date", 'yyyy-MM-dd') BETWEEN
              TO_CHAR(DATE_TRUNC('week', CURRENT_DATE), 'yyyy-MM-dd')
              AND TO_CHAR(DATE_TRUNC('week', CURRENT_DATE) + '6 days'::INTERVAL, 'yyyy-MM-dd')
      )
      SELECT
        primary_type,
        member_id,
        start_date_day,
        A.comn_cd,
        A.comn_nm,
        COALESCE(AVG(progress), 0) AS avg_progress
      FROM (
        SELECT 'Monday' AS comn_nm, 1 AS comn_cd UNION ALL
        SELECT 'Tuesday' AS comn_nm, 2 AS comn_cd UNION ALL
        SELECT 'Wednesday' AS comn_nm, 3 AS comn_cd UNION ALL
        SELECT 'Thursday' AS comn_nm, 4 AS comn_cd UNION ALL
        SELECT 'Friday' AS comn_nm, 5 AS comn_cd UNION ALL
        SELECT 'Saturday' AS comn_nm, 6 AS comn_cd UNION ALL
        SELECT 'Sunday' AS comn_nm, 7 AS comn_cd
      ) A
      LEFT OUTER JOIN res B ON A.comn_cd = B.start_date_day_cd
      GROUP BY primary_type, member_id, start_date_day, A.comn_cd, A.comn_nm
      ORDER BY A.comn_cd
    `;

    const result = await this.dataSource.query(query, [memberId, primaryType]);

    return result.map((row: any) => ({
      primaryType: row.primary_type,
      memberId: row.member_id ? Number(row.member_id) : null,
      startDateDay: row.start_date_day,
      comnCd: Number(row.comn_cd),
      comnNm: row.comn_nm,
      avgProgress: Number(row.avg_progress) || 0,
    }));
  }

  // ============================================
  // 플래너 클래스 관련 메서드 (관리자용)
  // ============================================

  async getPlanners(memberId: number, dvsn?: string): Promise<any[]> {
    // 현재 사용자의 플래너 정보 조회
    const memberInfo = await this.plannerManagementRepository.findOne({
      where: { member_id: memberId, use_yn: 'Y' },
    });

    let classCode = memberInfo?.class_code || null;
    let plannerId = memberInfo?.planner_id || null;

    // 전체 조회 모드
    if (dvsn === 'A') {
      classCode = null;
      plannerId = null;
    }

    const query = `
      SELECT
        m.id,
        m.highschool,
        m.univ,
        m.department,
        m.account,
        m.user_name,
        EXTRACT(YEAR FROM AGE(TO_DATE(SUBSTRING(m.birthday, 1, 6), 'YYMMDD'))) AS aage,
        m.cellphone,
        m.email,
        m.region,
        m.profile_image_url AS imgpath,
        p.class_code AS cls,
        p.class_name AS clsnm,
        m.school,
        (SELECT COUNT(*) FROM planner_class_tb p1
         WHERE p1.planner_id = p.planner_id
         AND p1.use_yn = 'Y'
         AND TO_CHAR(CURRENT_DATE, 'yyyyMMdd') BETWEEN p1.start_date AND COALESCE(p1.end_date, '99991231')) AS clscount,
        (SELECT COUNT(*) FROM planner_management_tb p2
         WHERE p2.planner_id = p.planner_id
         AND p2.use_yn = 'Y'
         AND p2.class_code = p.class_code
         AND TO_CHAR(CURRENT_DATE, 'yyyyMMdd') BETWEEN p2.start_date AND COALESCE(p2.end_date, '99991231')) AS memcount
      FROM planner_class_tb p
      JOIN member_tb m ON p.planner_id = m.id
      WHERE p.use_yn = 'Y'
        AND TO_CHAR(CURRENT_DATE, 'yyyyMMdd') BETWEEN p.start_date AND COALESCE(p.end_date, '99991231')
        AND ($1::VARCHAR IS NULL OR p.class_code = $1)
        AND ($2::BIGINT IS NULL OR p.planner_id = $2)
        AND m.profile_image_url IS NOT NULL
    `;

    const result = await this.dataSource.query(query, [classCode, plannerId]);

    return result.map((row: any) => ({
      id: Number(row.id),
      highschool: row.highschool,
      univ: row.univ,
      department: row.department,
      account: row.account,
      userName: row.user_name,
      age: row.aage ? Number(row.aage) : null,
      cellphone: row.cellphone,
      email: row.email,
      region: row.region,
      imgPath: row.imgpath,
      cls: row.cls,
      clsNm: row.clsnm,
      school: row.school,
      clsCount: Number(row.clscount),
      memCount: Number(row.memcount),
    }));
  }

  async setPlannerClass(dto: SetPlannerClassDto): Promise<void> {
    const existing = await this.plannerClassRepository.findOne({
      where: {
        planner_id: dto.plannerId,
        class_code: dto.classCode,
        start_date: dto.startDate,
      },
    });

    if (existing) {
      await this.plannerClassRepository.update(
        {
          planner_id: dto.plannerId,
          class_code: dto.classCode,
          start_date: dto.startDate,
        },
        {
          class_name: dto.className,
          end_date: dto.endDate || null,
        },
      );
    } else {
      await this.plannerClassRepository.save({
        planner_id: dto.plannerId,
        class_code: dto.classCode,
        class_name: dto.className,
        start_date: dto.startDate,
        end_date: dto.endDate || null,
        use_yn: 'Y',
      });
    }
  }

  async getClassMembers(plannerId: number): Promise<any[]> {
    const query = `
      SELECT
        m.id,
        m.user_name,
        pm.class_code AS cls,
        m.school
      FROM planner_management_tb pm
      JOIN member_tb m ON pm.member_id = m.id
      WHERE pm.planner_id = $1
        AND pm.use_yn = 'Y'
        AND TO_CHAR(CURRENT_DATE, 'yyyyMMdd') BETWEEN pm.start_date AND COALESCE(pm.end_date, '99991231')
    `;

    const result = await this.dataSource.query(query, [plannerId]);

    return result.map((row: any) => ({
      id: Number(row.id),
      userName: row.user_name,
      cls: row.cls,
      school: row.school,
    }));
  }

  // ============================================
  // MyClass 페이지용 API 메서드
  // ============================================

  /**
   * 담당 선생님(플래너/멘토) 목록 조회
   */
  async getPlannersMentor(memberId: number): Promise<PlannerMentorResponseDto[]> {
    const query = `
      SELECT DISTINCT
        m.id,
        m.user_name AS name,
        pc.class_name AS subject,
        m.profile_image_url AS profile_image,
        m.cellphone AS phone
      FROM planner_management_tb pm
      JOIN member_tb m ON pm.planner_id = m.id
      LEFT JOIN planner_class_tb pc ON pc.planner_id = pm.planner_id
        AND pc.class_code = pm.class_code
        AND pc.use_yn = 'Y'
      WHERE pm.member_id = $1
        AND pm.use_yn = 'Y'
        AND TO_CHAR(CURRENT_DATE, 'yyyyMMdd') BETWEEN pm.start_date AND COALESCE(pm.end_date, '99991231')
    `;

    const result = await this.dataSource.query(query, [memberId]);

    return result.map((row: any) => ({
      id: Number(row.id),
      name: row.name,
      subject: row.subject || null,
      profileImage: row.profile_image || null,
      phone: row.phone || null,
    }));
  }

  /**
   * 공지사항 목록 조회
   */
  async getNotices(memberId: number): Promise<NoticeResponseDto[]> {
    // 사용자의 플래너 정보 조회
    const memberInfo = await this.plannerManagementRepository.findOne({
      where: { member_id: memberId, use_yn: 'Y' },
    });

    if (!memberInfo) {
      return [];
    }

    const notices = await this.plannerNoticeRepository.find({
      where: { planner_id: memberInfo.planner_id, use_yn: 'Y' },
      order: { is_important: 'DESC', created_at: 'DESC' },
      take: 20,
    });

    return notices.map((notice) => ({
      id: Number(notice.id),
      title: notice.title,
      content: notice.content || null,
      date: notice.created_at
        ? notice.created_at.toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      isImportant: notice.is_important,
    }));
  }

  /**
   * 성취도 랭킹 조회
   */
  async getRank(
    memberId: number,
    periodType: RankPeriodType = RankPeriodType.WEEKLY,
  ): Promise<RankResponseDto> {
    // 기간에 따른 날짜 범위 계산
    let dateCondition: string;
    switch (periodType) {
      case RankPeriodType.DAILY:
        dateCondition = `TO_CHAR(pi."start_date", 'yyyy-MM-dd') = TO_CHAR(CURRENT_DATE, 'yyyy-MM-dd')`;
        break;
      case RankPeriodType.MONTHLY:
        dateCondition = `TO_CHAR(pi."start_date", 'yyyy-MM') = TO_CHAR(CURRENT_DATE, 'yyyy-MM')`;
        break;
      case RankPeriodType.WEEKLY:
      default:
        dateCondition = `TO_CHAR(pi."start_date", 'yyyy-MM-dd') BETWEEN
          TO_CHAR(DATE_TRUNC('week', CURRENT_DATE), 'yyyy-MM-dd')
          AND TO_CHAR(DATE_TRUNC('week', CURRENT_DATE) + '6 days'::INTERVAL, 'yyyy-MM-dd')`;
        break;
    }

    // 사용자의 플래너 정보 조회
    const memberInfo = await this.plannerManagementRepository.findOne({
      where: { member_id: memberId, use_yn: 'Y' },
    });

    const plannerId = memberInfo?.planner_id || null;
    const classCode = memberInfo?.class_code || null;

    // 성취도 랭킹 쿼리
    const rankQuery = `
      WITH achievement_scores AS (
        SELECT
          pm.member_id,
          COALESCE(AVG(pi.progress), 0) AS avg_achievement
        FROM planner_management_tb pm
        LEFT JOIN planner_item_tb pi ON pi.member_id = pm.member_id
          AND ${dateCondition}
        WHERE pm.use_yn = 'Y'
          AND ($1::BIGINT IS NULL OR pm.planner_id = $1)
          AND ($2::VARCHAR IS NULL OR pm.class_code = $2)
          AND TO_CHAR(CURRENT_DATE, 'yyyyMMdd') BETWEEN pm.start_date AND COALESCE(pm.end_date, '99991231')
        GROUP BY pm.member_id
      ),
      ranked AS (
        SELECT
          member_id,
          avg_achievement,
          RANK() OVER (ORDER BY avg_achievement DESC) AS rank,
          COUNT(*) OVER () AS total_students
        FROM achievement_scores
      )
      SELECT
        rank AS my_rank,
        total_students,
        avg_achievement AS my_achievement
      FROM ranked
      WHERE member_id = $3
    `;

    const rankResult = await this.dataSource.query(rankQuery, [plannerId, classCode, memberId]);

    // 각 기간별 성취도 계산
    const dailyQuery = `
      SELECT COALESCE(AVG(progress), 0) AS achievement
      FROM planner_item_tb
      WHERE member_id = $1
        AND TO_CHAR("start_date", 'yyyy-MM-dd') = TO_CHAR(CURRENT_DATE, 'yyyy-MM-dd')
    `;

    const weeklyQuery = `
      SELECT COALESCE(AVG(progress), 0) AS achievement
      FROM planner_item_tb
      WHERE member_id = $1
        AND TO_CHAR("start_date", 'yyyy-MM-dd') BETWEEN
          TO_CHAR(DATE_TRUNC('week', CURRENT_DATE), 'yyyy-MM-dd')
          AND TO_CHAR(DATE_TRUNC('week', CURRENT_DATE) + '6 days'::INTERVAL, 'yyyy-MM-dd')
    `;

    const monthlyQuery = `
      SELECT COALESCE(AVG(progress), 0) AS achievement
      FROM planner_item_tb
      WHERE member_id = $1
        AND TO_CHAR("start_date", 'yyyy-MM') = TO_CHAR(CURRENT_DATE, 'yyyy-MM')
    `;

    const [dailyResult, weeklyResult, monthlyResult] = await Promise.all([
      this.dataSource.query(dailyQuery, [memberId]),
      this.dataSource.query(weeklyQuery, [memberId]),
      this.dataSource.query(monthlyQuery, [memberId]),
    ]);

    const row = rankResult[0] || {};

    return {
      myRank: row.my_rank ? Number(row.my_rank) : 0,
      totalStudents: row.total_students ? Number(row.total_students) : 0,
      myAchievement: row.my_achievement ? Math.round(Number(row.my_achievement)) : 0,
      dailyAchievement: dailyResult[0] ? Math.round(Number(dailyResult[0].achievement)) : 0,
      weeklyAchievement: weeklyResult[0] ? Math.round(Number(weeklyResult[0].achievement)) : 0,
      monthlyAchievement: monthlyResult[0] ? Math.round(Number(monthlyResult[0].achievement)) : 0,
    };
  }
}
