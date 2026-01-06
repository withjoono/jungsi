import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between } from 'typeorm';
import { SchoolRecordSubjectLearningEntity } from '../../database/entities/schoolrecord/schoolrecord-subject-learning.entity';
import { MockexamRawScoreEntity } from '../../database/entities/mock-exam/mockexam-raw-score.entity';
import { MockexamScheduleEntity } from '../../database/entities/mock-exam/mockexam-schedule.entity';
import {
  HealthRecordEntity,
  ConsultationEntity,
  AttendanceEntity,
  TestEntity,
} from '../../database/entities/myclass';
import {
  GradeResponseDto,
  TestResponseDto,
  TestFilterType,
  MockTestResponseDto,
  HealthResponseDto,
  CreateHealthDto,
  WeekType,
  ConsultationResponseDto,
  AttendanceResponseDto,
} from './dtos';

@Injectable()
export class MyclassService {
  constructor(
    @InjectRepository(SchoolRecordSubjectLearningEntity)
    private readonly gradeRepository: Repository<SchoolRecordSubjectLearningEntity>,
    @InjectRepository(MockexamRawScoreEntity)
    private readonly mockExamScoreRepository: Repository<MockexamRawScoreEntity>,
    @InjectRepository(MockexamScheduleEntity)
    private readonly mockExamScheduleRepository: Repository<MockexamScheduleEntity>,
    @InjectRepository(HealthRecordEntity)
    private readonly healthRepository: Repository<HealthRecordEntity>,
    @InjectRepository(ConsultationEntity)
    private readonly consultationRepository: Repository<ConsultationEntity>,
    @InjectRepository(AttendanceEntity)
    private readonly attendanceRepository: Repository<AttendanceEntity>,
    @InjectRepository(TestEntity)
    private readonly testRepository: Repository<TestEntity>,
    private readonly dataSource: DataSource,
  ) {}

  // ============================================
  // 내신 성적 API
  // ============================================

  async getGrades(memberId: number, semester?: string): Promise<GradeResponseDto[]> {
    const queryBuilder = this.gradeRepository
      .createQueryBuilder('grade')
      .innerJoin('grade.member', 'member')
      .where('member.id = :memberId', { memberId });

    if (semester) {
      queryBuilder.andWhere('grade.semester = :semester', { semester });
    }

    const grades = await queryBuilder.orderBy('grade.semester', 'ASC').getMany();

    return grades.map((grade) => ({
      id: grade.id,
      subject: grade.main_subject_name || grade.subject_name || '',
      unit: grade.unit ? parseInt(grade.unit, 10) : 0,
      rank: grade.ranking ? parseInt(grade.ranking, 10) : 0,
      grade: grade.grade ? parseInt(grade.grade, 10) : 0,
      score: grade.raw_score ? parseFloat(grade.raw_score) : 0,
      average: grade.sub_subject_average ? parseFloat(grade.sub_subject_average) : 0,
      stddev: grade.standard_deviation ? parseFloat(grade.standard_deviation) : 0,
      semester: grade.semester || '',
    }));
  }

  // ============================================
  // 테스트 API
  // ============================================

  async getTests(memberId: number, filter?: TestFilterType): Promise<TestResponseDto[]> {
    const queryBuilder = this.testRepository
      .createQueryBuilder('test')
      .where('test.member_id = :memberId', { memberId });

    if (filter && filter !== TestFilterType.ALL) {
      queryBuilder.andWhere('test.status = :status', { status: filter });
    }

    const tests = await queryBuilder.orderBy('test.date', 'DESC').getMany();

    return tests.map((test) => ({
      id: Number(test.id),
      title: test.title,
      subject: test.subject || '',
      date: test.date ? this.formatDate(test.date) : '',
      score: test.score ? Number(test.score) : null,
      totalScore: test.total_score ? Number(test.total_score) : 100,
      rank: test.rank,
      totalStudents: test.total_students,
      status: test.status,
    }));
  }

  // ============================================
  // 모의고사 API
  // ============================================

  async getMockTests(memberId: number, year?: number): Promise<MockTestResponseDto[]> {
    const currentYear = year || new Date().getFullYear();

    // 모의고사 일정과 점수를 조인하여 조회
    const query = `
      SELECT
        s.id,
        s.exam_name as test_name,
        s.exam_date as test_date,
        r.korean,
        r.math,
        r.english,
        r.history,
        r.science1,
        r.science2,
        r.total_score,
        r.percentile,
        r.grade
      FROM mockexam_schedule_tb s
      LEFT JOIN mockexam_raw_score_tb r ON s.id = r.schedule_id AND r.member_id = $1
      WHERE EXTRACT(YEAR FROM s.exam_date) = $2
      ORDER BY s.exam_date DESC
    `;

    const results = await this.dataSource.query(query, [memberId, currentYear]);

    return results.map((row: any) => ({
      id: Number(row.id),
      testName: row.test_name || '',
      testDate: row.test_date ? this.formatDate(new Date(row.test_date)) : '',
      korean: row.korean ? Number(row.korean) : null,
      math: row.math ? Number(row.math) : null,
      english: row.english ? Number(row.english) : null,
      history: row.history ? Number(row.history) : null,
      science1: row.science1 ? Number(row.science1) : null,
      science2: row.science2 ? Number(row.science2) : null,
      totalScore: row.total_score ? Number(row.total_score) : null,
      percentile: row.percentile ? Number(row.percentile) : null,
      grade: row.grade ? Number(row.grade) : null,
    }));
  }

  // ============================================
  // 건강 관리 API
  // ============================================

  async getHealth(memberId: number, week?: WeekType): Promise<HealthResponseDto[]> {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    if (week === WeekType.PREVIOUS) {
      // 지난주
      const lastWeekStart = new Date(now);
      lastWeekStart.setDate(now.getDate() - now.getDay() - 7);
      lastWeekStart.setHours(0, 0, 0, 0);

      const lastWeekEnd = new Date(lastWeekStart);
      lastWeekEnd.setDate(lastWeekStart.getDate() + 6);
      lastWeekEnd.setHours(23, 59, 59, 999);

      startDate = lastWeekStart;
      endDate = lastWeekEnd;
    } else {
      // 이번주 (기본값)
      const thisWeekStart = new Date(now);
      thisWeekStart.setDate(now.getDate() - now.getDay());
      thisWeekStart.setHours(0, 0, 0, 0);

      const thisWeekEnd = new Date(thisWeekStart);
      thisWeekEnd.setDate(thisWeekStart.getDate() + 6);
      thisWeekEnd.setHours(23, 59, 59, 999);

      startDate = thisWeekStart;
      endDate = thisWeekEnd;
    }

    const records = await this.healthRepository.find({
      where: {
        member_id: memberId,
        date: Between(startDate, endDate),
      },
      order: { date: 'ASC' },
    });

    return records.map((record) => ({
      id: Number(record.id),
      date: this.formatDate(record.date),
      sleepHours: record.sleep_hours ? Number(record.sleep_hours) : null,
      mealCount: record.meal_count,
      exerciseMinutes: record.exercise_minutes,
      mood: record.mood,
      note: record.note,
    }));
  }

  async createHealth(memberId: number, dto: CreateHealthDto): Promise<number> {
    // 같은 날짜에 이미 기록이 있는지 확인
    const existingRecord = await this.healthRepository.findOne({
      where: {
        member_id: memberId,
        date: new Date(dto.date),
      },
    });

    if (existingRecord) {
      // 기존 기록 업데이트
      await this.healthRepository.update(
        { id: existingRecord.id },
        {
          sleep_hours: dto.sleepHours ?? null,
          meal_count: dto.mealCount ?? null,
          exercise_minutes: dto.exerciseMinutes ?? null,
          mood: (dto.mood as any) ?? null,
          note: dto.note ?? null,
        },
      );
      return Number(existingRecord.id);
    }

    // 새 기록 생성
    const record = this.healthRepository.create({
      member_id: memberId,
      date: new Date(dto.date),
      sleep_hours: dto.sleepHours ?? null,
      meal_count: dto.mealCount ?? null,
      exercise_minutes: dto.exerciseMinutes ?? null,
      mood: (dto.mood as any) ?? null,
      note: dto.note ?? null,
    });

    const saved = await this.healthRepository.save(record);
    return Number(saved.id);
  }

  // ============================================
  // 상담 기록 API
  // ============================================

  async getConsultations(memberId: number): Promise<ConsultationResponseDto[]> {
    const consultations = await this.consultationRepository.find({
      where: { member_id: memberId },
      relations: ['mentorMember'],
      order: { date: 'DESC' },
    });

    return consultations.map((consultation) => ({
      id: Number(consultation.id),
      date: this.formatDate(consultation.date),
      type: consultation.type,
      mentor: consultation.mentor || consultation.mentorMember?.nickname || '',
      summary: consultation.summary,
      nextDate: consultation.next_date ? this.formatDate(consultation.next_date) : null,
    }));
  }

  // ============================================
  // 출결 기록 API
  // ============================================

  async getAttendance(memberId: number): Promise<AttendanceResponseDto[]> {
    const attendances = await this.attendanceRepository.find({
      where: { member_id: memberId },
      order: { date: 'DESC' },
      take: 30, // 최근 30일
    });

    return attendances.map((attendance) => ({
      id: Number(attendance.id),
      date: this.formatDate(attendance.date),
      checkIn: attendance.check_in,
      checkOut: attendance.check_out,
      status: attendance.status,
    }));
  }

  // ============================================
  // 유틸리티 메서드
  // ============================================

  private formatDate(date: Date): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }
}
