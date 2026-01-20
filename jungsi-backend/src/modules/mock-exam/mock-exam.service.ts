import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MockexamRawScoreEntity } from 'src/database/entities/mock-exam/mockexam-raw-score.entity';
import { MockexamScheduleEntity } from 'src/database/entities/mock-exam/mockexam-schedule.entity';
import { MockexamScoreEntity } from 'src/database/entities/mock-exam/mockexam-score.entity';
import { MemberJungsiInputScoreEntity } from 'src/database/entities/member/member-jungsi-input-score.entity';
import { Repository } from 'typeorm';
import {
  CreateMockExamRawScoreDto,
  CreateMockExamStandardScoreDto,
} from './dtos/create-mockexam-score.dto';
import { MockexamRawToStandardEntity } from 'src/database/entities/mock-exam/mockexam-raw-to-standard.entity';
import {
  GetMockExamStandardScoreDto,
  GetMockExamStandardScoresResponseDto,
  GRADE_BASED_SUBJECTS,
} from './dtos/get-mockexam-standard-score.dto';
import { MockexamStandardScoreEntity } from 'src/database/entities/mock-exam/mockexam-standard-score.entity';
import { JungsiDataService } from '../jungsi/calculation/services/jungsi-data.service';

// 과목코드 → 과목 카테고리 매핑
const SUBJECT_CATEGORY_MAP: Record<string, string> = {
  S1: 'kor', // 화법과 작문
  S2: 'kor', // 언어와 매체
  S3: 'kor', // 국어 공통
  S4: 'math', // 확률과 통계
  S5: 'math', // 미적분
  S6: 'math', // 기하
  S7: 'math', // 수학 공통
  S8: 'eng', // 영어
  S9: 'history', // 한국사
};

@Injectable()
export class MockExamService {
  private readonly logger = new Logger(MockExamService.name);

  constructor(
    @InjectRepository(MockexamRawScoreEntity)
    private mockexamRawScoreRepository: Repository<MockexamRawScoreEntity>,
    @InjectRepository(MockexamScoreEntity)
    private mockexamScoreRepository: Repository<MockexamScoreEntity>,
    @InjectRepository(MockexamScheduleEntity)
    private mockexamScheduleRepository: Repository<MockexamScheduleEntity>,

    @InjectRepository(MockexamRawToStandardEntity)
    private mockexamRawToStandardRepository: Repository<MockexamRawToStandardEntity>,
    @InjectRepository(MockexamStandardScoreEntity)
    private mockexamStandardRepository: Repository<MockexamStandardScoreEntity>,
    @InjectRepository(MemberJungsiInputScoreEntity)
    private inputScoreRepository: Repository<MemberJungsiInputScoreEntity>,

    private readonly jungsiDataService: JungsiDataService,
  ) {}

  // 모의고사 원점수 목록 조회
  async getMockexamRawScoresByMemberId(memberId: number): Promise<MockexamRawScoreEntity[]> {
    return this.mockexamRawScoreRepository.find({
      where: { member: { id: memberId } },
    });
  }

  // 모의고사 표준점수 목록 조회 (나의 누적백분위 포함)
  async getMockexamScoresByMemberId(
    memberId: number,
  ): Promise<GetMockExamStandardScoresResponseDto> {
    // 추후 표준점수 저장 기능 활성화 시 (원점수만 사용 시 주석 처리 후 하단의 원점수 -> 변환 테이블 사용)
    const exist = await this.mockexamStandardRepository.find({
      where: { member: { id: memberId } },
    });

    let scores: GetMockExamStandardScoreDto[] = [];

    if (exist.length) {
      scores = exist.map((score) => {
        // 등급 기반 과목(영어 S8, 한국사 S9)은 표준점수/백분위가 없음
        // 프론트엔드 호환성을 위해 "0" 반환 (계산 시 등급 사용)
        const isGradeBasedSubject = GRADE_BASED_SUBJECTS.includes(score.subject_code);
        return {
          code: score.subject_code,
          grade: score.grade,
          standard_score: isGradeBasedSubject
            ? '0'
            : (score.standard_score ?? 0).toString(),
          percentile: isGradeBasedSubject ? 0 : (score.percentile ?? 0),
        };
      });
    } else {
      // 원점수로 표준점수 계산 후 반환
      const rawScores = await this.getMockexamRawScoresByMemberId(memberId);
      if (rawScores.length) {
        // 국어 표준점수 계산
        const korCommonScore = rawScores.find((score) => score.subject_code === 'S3');
        const korSpecificScore = rawScores.find(
          (score) => score.subject_code === 'S1' || score.subject_code === 'S2',
        );
        if (korCommonScore && korSpecificScore) {
          const data = await this._getStandardScoreAndGrade(korCommonScore, korSpecificScore);
          scores.push(data);
        }

        // 수학 표준점수 계산
        const mathCommonScore = rawScores.find((score) => score.subject_code === 'S7');
        const mathSpecificScore = rawScores.find((score) =>
          ['S4', 'S5', 'S6'].includes(score.subject_code),
        );
        if (mathCommonScore && mathSpecificScore) {
          const data = await this._getStandardScoreAndGrade(mathCommonScore, mathSpecificScore);
          scores.push(data);
        }

        // 나머지 과목 표준점수 계산
        const otherSubjects = rawScores.filter(
          (score) => !['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7'].includes(score.subject_code),
        );
        for (const rawScore of otherSubjects) {
          // 등급 기반 과목(영어 S8, 한국사 S9)은 표준점수/백분위가 없음
          // 프론트엔드 호환성을 위해 "0" 반환 (계산 시 등급 사용)
          if (GRADE_BASED_SUBJECTS.includes(rawScore.subject_code)) {
            scores.push({
              code: rawScore.subject_code,
              grade: parseInt(rawScore.raw_score, 10), // 원점수가 곧 등급
              standard_score: '0',
              percentile: 0,
            });
            continue;
          }
          const data = await this._getStandardScoreAndGrade(rawScore, null);
          scores.push(data);
        }
      }
    }

    // 표점합 계산 (국어 + 수학 + 탐구 상위 2과목)
    const standardScoreSum = this.calculateStandardScoreSum(scores);

    // 디버깅 로그
    this.logger.debug(`memberId=${memberId}, scoresCount=${scores.length}, standardScoreSum=${standardScoreSum}`);

    // 캐시된 누백 조회 시도 (js_user_input_scores 테이블)
    let myCumulativePercentile: number;
    const cachedInputScore = await this.inputScoreRepository.findOne({
      where: { member_id: memberId },
      select: ['cumulative_percentile', 'standard_score_sum'],
    });

    if (cachedInputScore?.cumulative_percentile != null) {
      // 캐시된 누백 사용
      myCumulativePercentile = Number(cachedInputScore.cumulative_percentile);
      this.logger.debug(`캐시된 누백 사용: ${myCumulativePercentile}% (표점합: ${cachedInputScore.standard_score_sum})`);
    } else {
      // 캐시가 없으면 계산 (fallback)
      myCumulativePercentile = await this.jungsiDataService.get누적백분위(standardScoreSum);
      this.logger.debug(`계산된 누백 사용: ${myCumulativePercentile}% (캐시 없음)`);
    }

    return {
      data: scores,
      standardScoreSum,
      myCumulativePercentile,
    };
  }

  /**
   * 표점합 계산 (국어 + 수학 + 탐구 상위 2과목)
   */
  private calculateStandardScoreSum(scores: GetMockExamStandardScoreDto[]): number {
    let koreanScore = 0;
    let mathScore = 0;
    const electiveScores: number[] = [];

    for (const score of scores) {
      const category = SUBJECT_CATEGORY_MAP[score.code];
      const standardScoreValue = parseInt(score.standard_score, 10) || 0;

      switch (category) {
        case 'kor':
          koreanScore = standardScoreValue;
          break;
        case 'math':
          mathScore = standardScoreValue;
          break;
        default:
          // 탐구 과목 (사탐, 과탐)
          if (standardScoreValue > 0) {
            electiveScores.push(standardScoreValue);
          }
          break;
      }
    }

    // 탐구 상위 2과목
    const topTwoElectiveScores = electiveScores.sort((a, b) => b - a).slice(0, 2);
    const electiveSum = topTwoElectiveScores.reduce((sum, score) => sum + score, 0);

    return koreanScore + mathScore + electiveSum;
  }

  // 모의고사 원점수 저장
  async saveMockexamScore(
    memberId: number,
    createMockExamScoreDtos: CreateMockExamRawScoreDto[],
  ): Promise<void> {
    if (createMockExamScoreDtos.length === 0) return;

    // 기존 유저의 모의고사 점수 삭제
    await this.mockexamRawScoreRepository.delete({
      member: { id: memberId },
    });
    await this.mockexamScoreRepository.delete({
      member: { id: memberId },
    });

    for (const dto of createMockExamScoreDtos) {
      // 최근 등록한 점수의 시험 정보를을 보기 위함 (ex. 2024년 6월 모의고사)
      const mockExamSchedule = await this.mockexamScheduleRepository.findOne({
        where: { id: dto.schedule_id },
      });

      const mockExamRawScore = new MockexamRawScoreEntity();
      mockExamRawScore.raw_score = dto.raw_score;
      mockExamRawScore.subject_code = dto.subject_code;
      mockExamRawScore.member = { id: memberId } as any;
      mockExamRawScore.schedule = mockExamSchedule;

      await this.mockexamRawScoreRepository.save(mockExamRawScore);
    }

    return;
  }

  // 공통과목과 선택과목의 데이터를 받아서 변환 테이블로 {과목코드, 등급, 표준점수, 누백} 반환
  async _getStandardScoreAndGrade(
    commonScore: MockexamRawScoreEntity,
    specificScore: MockexamRawScoreEntity | null,
  ): Promise<GetMockExamStandardScoreDto> {
    if (specificScore) {
      const record = await this.mockexamRawToStandardRepository.findOne({
        where: {
          code: specificScore.subject_code,
          raw_score_common: commonScore.raw_score,
          raw_score_select: specificScore.raw_score,
        },
      });
      if (record) {
        return {
          code: record.code,
          grade: record.grade,
          standard_score: record.standard_score,
          percentile: record.percentile,
        };
      }
    } else {
      const record = await this.mockexamRawToStandardRepository.findOne({
        where: {
          code: commonScore.subject_code,
          raw_score_common: commonScore.raw_score,
        },
      });

      if (record) {
        return {
          code: record.code,
          grade: record.grade,
          standard_score: record.standard_score,
          percentile: record.percentile,
        };
      }
    }

    throw new Error('표준 점수를 찾을 수 없습니다.');
  }

  // 모의고사 표준점수 저장
  async saveMockexamStandardScore(
    memberId: number,
    createMockExamScoreDtos: CreateMockExamStandardScoreDto[],
  ): Promise<void> {
    if (createMockExamScoreDtos.length === 0) return;

    // 기존 유저의 모의고사 점수 삭제
    await this.mockexamStandardRepository.delete({
      member: { id: memberId },
    });

    for (const dto of createMockExamScoreDtos) {
      // 최근 등록한 점수의 시험 정보를을 보기 위함 (ex. 2024년 6월 모의고사)
      const mockExamSchedule = await this.mockexamScheduleRepository.findOne({
        where: { id: dto.schedule_id },
      });

      const mockExamStandardScore = new MockexamStandardScoreEntity();
      mockExamStandardScore.standard_score = dto.standard_score;
      mockExamStandardScore.subject_code = dto.subject_code;
      mockExamStandardScore.grade = dto.grade;
      mockExamStandardScore.percentile = dto.percentile;
      mockExamStandardScore.member = { id: memberId } as any;
      mockExamStandardScore.schedule = mockExamSchedule;

      await this.mockexamStandardRepository.save(mockExamStandardScore);
    }

    return;
  }
}
