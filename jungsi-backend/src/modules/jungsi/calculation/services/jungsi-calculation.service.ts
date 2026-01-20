import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { JungsiDataService } from './jungsi-data.service';
import { PercentileLookupService } from './percentile-lookup.service';
import { RegularAdmissionEntity } from '../../../../database/entities/core/regular-admission.entity';
import { MemberCalculatedScoreEntity } from '../../../../database/entities/member/member-calculated-score.entity';
import { MemberJungsiInputScoreEntity } from '../../../../database/entities/member/member-jungsi-input-score.entity';
import { MemberJungsiRecruitmentScoreEntity } from '../../../../database/entities/member/member-jungsi-recruitment-score.entity';
import { MemberJungsiFactorScoreEntity } from '../../../../database/entities/member/member-jungsi-factor-score.entity';
import { RegularAdmissionPreviousResultEntity } from '../../../../database/entities/core/regular-admission-previous-result.entity';
import { MockexamStandardScoreEntity } from '../../../../database/entities/mock-exam/mockexam-standard-score.entity';
import {
  PreviousResultsResponseDto,
  YearlyPreviousResultDto,
  AdmissionPreviousResultsResponseDto,
  AdmissionPreviousResultItemDto,
} from '../dto/calculate-scores.dto';
import {
  MockExamScoreInput,
  UniversityCalculatedScore,
  CalculateScoresResponse,
  정시점수계산Params,
  과목점수Type,
  환산점수계산Params,
} from '../calculations/types';
import {
  고려세과탐변환점수,
  고려세사탐변환점수,
  고려세영어변환점수,
} from '../calculations/koryose-conversion';
import { 경기자전영어변환점수, 경기자전한국사변환점수 } from '../calculations/gyeonggi-conversion';
import {
  이화간호영어변환점수,
  이화간호한국사인문변환점수,
  이화간호한국사자연변환점수,
} from '../calculations/ewha-nursing-conversion';
import { calc정시환산점수2026 } from '../calculations/calc-2026';
import * as scoreCalculationCodes from '../data/score-calculation-codes.json';

/**
 * 정시 환산점수 계산 서비스
 * - 사용자의 모의고사 점수를 받아 각 대학별 환산점수를 계산
 * - 계산된 점수를 DB에 저장하여 재사용
 */
@Injectable()
export class JungsiCalculationService {
  private readonly logger = new Logger(JungsiCalculationService.name);

  // 코드 매핑 (이름 → 코드)
  private readonly nameToCode: Record<string, string> = scoreCalculationCodes.nameToCode;
  // 코드 매핑 (코드 → 이름)
  private readonly codeToName: Record<string, string> = scoreCalculationCodes.codeToName;

  constructor(
    private readonly dataService: JungsiDataService,
    private readonly percentileLookupService: PercentileLookupService,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
    @InjectRepository(RegularAdmissionEntity)
    private readonly regularAdmissionRepository: Repository<RegularAdmissionEntity>,
    @InjectRepository(MemberCalculatedScoreEntity)
    private readonly calculatedScoreRepository: Repository<MemberCalculatedScoreEntity>,
    @InjectRepository(MemberJungsiInputScoreEntity)
    private readonly inputScoreRepository: Repository<MemberJungsiInputScoreEntity>,
    @InjectRepository(MemberJungsiRecruitmentScoreEntity)
    private readonly recruitmentScoreRepository: Repository<MemberJungsiRecruitmentScoreEntity>,
    @InjectRepository(MemberJungsiFactorScoreEntity)
    private readonly factorScoreRepository: Repository<MemberJungsiFactorScoreEntity>,
    @InjectRepository(RegularAdmissionPreviousResultEntity)
    private readonly previousResultRepository: Repository<RegularAdmissionPreviousResultEntity>,
    @InjectRepository(MockexamStandardScoreEntity)
    private readonly mockexamStandardScoreRepository: Repository<MockexamStandardScoreEntity>,
  ) {}

  /**
   * 사용자의 모의고사 점수로 모든 대학의 환산점수 계산 및 저장
   *
   * Feature Flag 지원:
   * - JUNGSI_USE_OPTIMIZED=true: 최적화된 버전 사용 (35초 → 3~5초)
   * - JUNGSI_USE_OPTIMIZED=false: 레거시 버전 사용 (기본값)
   *
   * @param memberId 회원 ID
   * @param mockExamScores 모의고사 점수 목록 (선택사항, 미제공시 DB에서 조회)
   * @param universityIds 특정 대학 ID 목록 (선택사항)
   */
  async calculateAndSaveScores(
    memberId: number,
    mockExamScores?: MockExamScoreInput[],
    universityIds?: number[],
  ): Promise<CalculateScoresResponse> {
    // Feature Flag: 최적화된 버전 사용 여부
    const useOptimized = this.configService.get<string>('JUNGSI_USE_OPTIMIZED', 'false') === 'true';

    if (useOptimized) {
      this.logger.log(`[Feature Flag] 최적화된 버전 사용 - memberId: ${memberId}`);
      return this.calculateAndSaveScoresOptimized(memberId, mockExamScores, universityIds);
    }

    // 레거시 버전 계속 실행
    const startTime = Date.now();
    this.logger.log(`사용자 ${memberId}의 환산점수 계산 시작 (레거시)`);

    // 0. mockExamScores가 없으면 DB에서 조회
    let mockExamScoresToUse = mockExamScores;
    if (!mockExamScoresToUse || mockExamScoresToUse.length === 0) {
      this.logger.log(`점수가 제공되지 않아 DB에서 조회합니다.`);
      mockExamScoresToUse = await this.getMemberInputScoresFromDB(memberId);

      if (!mockExamScoresToUse || mockExamScoresToUse.length === 0) {
        this.logger.warn(`사용자 ${memberId}의 저장된 점수가 없습니다.`);
        return {
          memberId,
          calculatedAt: new Date(),
          totalUniversities: 0,
          successCount: 0,
          failedCount: 0,
          scores: [],
        };
      }
    }

    // 1. 대학 목록 조회
    const admissions = await this.getAdmissions(universityIds);
    this.logger.log(`계산 대상 대학: ${admissions.length}개`);

    // 2. 데이터 로드 확인
    await this.dataService.ensureDataLoaded();
    const 점수표 = await this.dataService.get점수표();
    const 학교조건 = await this.dataService.get학교조건();
    const 유불리 = await this.dataService.get유불리();

    // 3. 각 대학별 환산점수 계산
    const scores: UniversityCalculatedScore[] = [];
    let successCount = 0;
    let failedCount = 0;

    for (const admission of admissions) {
      if (!admission.score_calculation) {
        continue; // 환산식 코드가 없는 경우 스킵
      }

      const result = await this.calculateSingleUniversity(
        mockExamScoresToUse,
        admission,
        점수표,
        학교조건,
        유불리,
      );

      scores.push(result);
      if (result.success) {
        successCount++;
      } else {
        failedCount++;
      }
    }

    // 4. 기존 저장된 점수 삭제 후 새로 저장
    await this.saveCalculatedScores(memberId, scores);

    const elapsed = Date.now() - startTime;
    this.logger.log(
      `환산점수 계산 완료: 성공 ${successCount}, 실패 ${failedCount}, 소요시간 ${elapsed}ms`,
    );

    return {
      memberId,
      calculatedAt: new Date(),
      totalUniversities: scores.length,
      successCount,
      failedCount,
      scores,
    };
  }

  /**
   * DB에 저장된 사용자의 입력 점수를 조회하여 MockExamScoreInput[] 형식으로 변환
   * @param memberId 회원 ID
   * @returns MockExamScoreInput[] 또는 null (데이터가 없는 경우)
   */
  async getMemberInputScoresFromDB(memberId: number): Promise<MockExamScoreInput[] | null> {
    const inputScore = await this.inputScoreRepository.findOne({
      where: { member_id: memberId },
    });

    if (!inputScore) {
      this.logger.log(`사용자 ${memberId}의 정시 입력 점수가 없어 mockexam에서 조회합니다.`);
      return this.getMockexamScoresFromDB(memberId);
    }

    const mockExamScores: MockExamScoreInput[] = [];

    // 국어
    if (inputScore.korean_standard_score) {
      mockExamScores.push({
        subjectCategory: 'kor',
        subjectName: inputScore.korean_elective || '국어',
        standardScore: String(inputScore.korean_standard_score),
        grade: inputScore.korean_grade || 0,
        percentile: Number(inputScore.korean_percentile) || 0,
      });
    }

    // 수학
    if (inputScore.math_standard_score) {
      mockExamScores.push({
        subjectCategory: 'math',
        subjectName: inputScore.math_elective || '수학',
        standardScore: String(inputScore.math_standard_score),
        grade: inputScore.math_grade || 0,
        percentile: Number(inputScore.math_percentile) || 0,
      });
    }

    // 영어 (등급만 있음)
    if (inputScore.english_grade) {
      mockExamScores.push({
        subjectCategory: 'eng',
        subjectName: '영어',
        standardScore: String(inputScore.english_grade), // 영어는 등급을 standardScore로 사용
        grade: inputScore.english_grade,
        percentile: 0, // 영어는 백분위 없음
      });
    }

    // 한국사 (등급만 있음)
    if (inputScore.korean_history_grade) {
      mockExamScores.push({
        subjectCategory: 'history',
        subjectName: '한국사',
        standardScore: String(inputScore.korean_history_grade), // 한국사도 등급을 standardScore로 사용
        grade: inputScore.korean_history_grade,
        percentile: 0, // 한국사는 백분위 없음
      });
    }

    // 탐구1 - 과목명에서 사탐/과탐 구분
    if (inputScore.research1_subject && inputScore.research1_standard_score) {
      const subjectCategory = this.getResearchSubjectCategory(inputScore.research1_subject);
      mockExamScores.push({
        subjectCategory,
        subjectName: inputScore.research1_subject,
        standardScore: String(inputScore.research1_standard_score),
        grade: inputScore.research1_grade || 0,
        percentile: Number(inputScore.research1_percentile) || 0,
      });
    }

    // 탐구2 - 과목명에서 사탐/과탐 구분
    if (inputScore.research2_subject && inputScore.research2_standard_score) {
      const subjectCategory = this.getResearchSubjectCategory(inputScore.research2_subject);
      mockExamScores.push({
        subjectCategory,
        subjectName: inputScore.research2_subject,
        standardScore: String(inputScore.research2_standard_score),
        grade: inputScore.research2_grade || 0,
        percentile: Number(inputScore.research2_percentile) || 0,
      });
    }

    // 제2외국어
    if (inputScore.second_foreign_subject && inputScore.second_foreign_standard_score) {
      mockExamScores.push({
        subjectCategory: 'lang',
        subjectName: inputScore.second_foreign_subject,
        standardScore: String(inputScore.second_foreign_standard_score),
        grade: inputScore.second_foreign_grade || 0,
        percentile: Number(inputScore.second_foreign_percentile) || 0,
      });
    }

    if (mockExamScores.length > 0) {
      this.logger.log(`사용자 ${memberId}의 저장된 점수 ${mockExamScores.length}개 조회 완료`);
      return mockExamScores;
    }

    // ts_member_jungsi_input_scores가 비어있으면 mockexam_standard_score_tb에서 조회
    this.logger.log(`사용자 ${memberId}의 정시 입력 점수가 없어 mockexam에서 조회합니다.`);
    return this.getMockexamScoresFromDB(memberId);
  }

  /**
   * 탐구 과목명으로 사탐/과탐 카테고리 판별
   */
  private getResearchSubjectCategory(subjectName: string): 'society' | 'science' {
    // 과탐 과목 리스트
    const scienceSubjects = [
      '물리학', '화학', '생명과학', '지구과학',
      '물리', '생물', '지구',
    ];

    const isScienceSubject = scienceSubjects.some(subject =>
      subjectName.includes(subject)
    );

    return isScienceSubject ? 'science' : 'society';
  }

  /**
   * mockexam_standard_score_tb에서 점수를 조회하여 MockExamScoreInput[] 형식으로 변환
   * subject_code 매핑:
   * - S1: 화법과 작문, S2: 언어와 매체 (국어 선택)
   * - S3: 국어 공통
   * - S4: 확통, S5: 미적, S6: 기하 (수학 선택)
   * - S7: 수학 공통
   * - S8: 영어 (등급)
   * - S9: 한국사 (등급)
   * - S10~S17: 탐구 과목
   */
  private async getMockexamScoresFromDB(memberId: number): Promise<MockExamScoreInput[] | null> {
    const scores = await this.mockexamStandardScoreRepository.find({
      where: { member: { id: memberId } },
    });

    if (!scores || scores.length === 0) {
      this.logger.log(`사용자 ${memberId}의 mockexam 점수가 없습니다.`);
      return null;
    }

    const mockExamScores: MockExamScoreInput[] = [];

    // Subject code to category and name mapping
    const subjectCodeMap: Record<string, { category: string; name: string }> = {
      'S1': { category: 'kor', name: '화법과 작문' },
      'S2': { category: 'kor', name: '언어와 매체' },
      'S3': { category: 'kor', name: '국어' },
      'S4': { category: 'math', name: '미적' },
      'S5': { category: 'math', name: '기하' },
      'S6': { category: 'math', name: '확통' },
      'S7': { category: 'math', name: '수학' },
      'S8': { category: 'eng', name: '영어' },
      'S9': { category: 'history', name: '한국사' },
      // 탐구 과목
      'S10': { category: 'society', name: '생활과 윤리' },
      'S11': { category: 'society', name: '윤리와 사상' },
      'S12': { category: 'science', name: '물리학 Ⅰ' },
      'S13': { category: 'science', name: '화학 Ⅰ' },
      'S14': { category: 'science', name: '생명과학 Ⅰ' },
      'S15': { category: 'science', name: '지구과학 Ⅰ' },
      'S16': { category: 'science', name: '물리학 Ⅱ' },
      'S17': { category: 'science', name: '화학 Ⅱ' },
      'S18': { category: 'science', name: '생명과학 Ⅱ' },
      'S19': { category: 'science', name: '지구과학 Ⅱ' },
      'S20': { category: 'society', name: '한국지리' },
      'S21': { category: 'society', name: '세계지리' },
      'S22': { category: 'society', name: '동아시아사' },
      'S23': { category: 'society', name: '세계사' },
      'S24': { category: 'society', name: '경제' },
      'S25': { category: 'society', name: '정치와 법' },
      'S26': { category: 'society', name: '사회·문화' },
      'S27': { category: 'lang', name: '제2외국어' },
    };

    // 국어: S3(공통) + S1 or S2(선택)을 합쳐서 하나로 처리
    const korCommon = scores.find(s => s.subject_code === 'S3');
    const korElective = scores.find(s => s.subject_code === 'S1' || s.subject_code === 'S2');
    if (korElective) {
      const electiveName = subjectCodeMap[korElective.subject_code]?.name || '국어';
      mockExamScores.push({
        subjectCategory: 'kor',
        subjectName: electiveName,
        standardScore: String(korElective.standard_score),
        grade: korElective.grade,
        percentile: korElective.percentile || 0,
      });
    } else if (korCommon) {
      mockExamScores.push({
        subjectCategory: 'kor',
        subjectName: '국어',
        standardScore: String(korCommon.standard_score),
        grade: korCommon.grade,
        percentile: korCommon.percentile || 0,
      });
    }

    // 수학: S7(공통) + S4/S5/S6(선택)을 합쳐서 하나로 처리
    const mathElective = scores.find(s => ['S4', 'S5', 'S6'].includes(s.subject_code));
    const mathCommon = scores.find(s => s.subject_code === 'S7');
    if (mathElective) {
      const electiveName = subjectCodeMap[mathElective.subject_code]?.name || '수학';
      mockExamScores.push({
        subjectCategory: 'math',
        subjectName: electiveName,
        standardScore: String(mathElective.standard_score),
        grade: mathElective.grade,
        percentile: mathElective.percentile || 0,
      });
    } else if (mathCommon) {
      mockExamScores.push({
        subjectCategory: 'math',
        subjectName: '수학',
        standardScore: String(mathCommon.standard_score),
        grade: mathCommon.grade,
        percentile: mathCommon.percentile || 0,
      });
    }

    // 영어 (S8)
    const english = scores.find(s => s.subject_code === 'S8');
    if (english) {
      mockExamScores.push({
        subjectCategory: 'eng',
        subjectName: '영어',
        standardScore: String(english.grade), // 영어는 등급이 곧 점수
        grade: english.grade,
        percentile: 0,
      });
    }

    // 한국사 (S9)
    const history = scores.find(s => s.subject_code === 'S9');
    if (history) {
      mockExamScores.push({
        subjectCategory: 'history',
        subjectName: '한국사',
        standardScore: String(history.grade), // 한국사도 등급이 곧 점수
        grade: history.grade,
        percentile: 0,
      });
    }

    // 탐구 과목 (S10~S26)
    const researchCodes = [
      'S10', 'S11', 'S12', 'S13', 'S14', 'S15', 'S16', 'S17', 'S18', 'S19',
      'S20', 'S21', 'S22', 'S23', 'S24', 'S25', 'S26',
    ];
    const researchScores = scores.filter(s => researchCodes.includes(s.subject_code));
    for (const research of researchScores) {
      const mapping = subjectCodeMap[research.subject_code];
      if (mapping) {
        mockExamScores.push({
          subjectCategory: mapping.category as 'society' | 'science',
          subjectName: mapping.name,
          standardScore: String(research.standard_score),
          grade: research.grade,
          percentile: research.percentile || 0,
        });
      }
    }

    // 제2외국어 (S27)
    const lang = scores.find(s => s.subject_code === 'S27');
    if (lang) {
      mockExamScores.push({
        subjectCategory: 'lang',
        subjectName: '제2외국어',
        standardScore: String(lang.standard_score),
        grade: lang.grade,
        percentile: lang.percentile || 0,
      });
    }

    this.logger.log(`사용자 ${memberId}의 mockexam 점수 ${mockExamScores.length}개 변환 완료`);
    return mockExamScores.length > 0 ? mockExamScores : null;
  }

  /**
   * 저장된 환산점수 조회
   */
  async getSavedScores(memberId: number): Promise<MemberCalculatedScoreEntity[]> {
    return this.calculatedScoreRepository.find({
      where: { member_id: memberId },
      order: { university_name: 'ASC' },
    });
  }

  /**
   * 특정 대학의 저장된 점수 조회
   */
  async getSavedScoreByUniversity(
    memberId: number,
    universityId: number,
  ): Promise<MemberCalculatedScoreEntity | null> {
    return this.calculatedScoreRepository.findOne({
      where: { member_id: memberId, university_id: universityId },
    });
  }

  /**
   * 정시 모집단위의 과거 입결 데이터 조회 (2025, 2024, 2023)
   * @param regularAdmissionId 정시 모집단위 ID
   * @returns 연도별 입결 데이터
   */
  async getPreviousResults(regularAdmissionId: number): Promise<PreviousResultsResponseDto> {
    // 정시 모집단위 조회 (대학 정보 포함)
    const admission = await this.regularAdmissionRepository.findOne({
      where: { id: regularAdmissionId },
      relations: ['university', 'previous_results'],
    });

    if (!admission) {
      throw new NotFoundException(`정시 모집단위를 찾을 수 없습니다. (ID: ${regularAdmissionId})`);
    }

    // 연도별 입결 데이터 변환
    const results: YearlyPreviousResultDto[] = [];
    const targetYears = [2025, 2024, 2023];

    for (const year of targetYears) {
      const yearResult = admission.previous_results?.find((r) => r.year === year);

      results.push({
        year,
        recruitmentNumber: yearResult?.recruitment_number ?? null,
        competitionRatio: yearResult?.competition_ratio
          ? Number(yearResult.competition_ratio)
          : null,
        additionalPassRank: yearResult?.additional_pass_rank ?? null,
        minCut: yearResult?.min_cut ? Number(yearResult.min_cut) : null,
        maxCut: yearResult?.max_cut ? Number(yearResult.max_cut) : null,
        convertedScoreTotal: yearResult?.converted_score_total
          ? Number(yearResult.converted_score_total)
          : null,
        percentile50: yearResult?.percentile_50 ? Number(yearResult.percentile_50) : null,
        percentile70: yearResult?.percentile_70 ? Number(yearResult.percentile_70) : null,
      });
    }

    return {
      regularAdmissionId: admission.id,
      universityName: admission.university?.name || '알 수 없음',
      recruitmentName: admission.recruitment_name,
      admissionType: admission.admission_type,
      results,
    };
  }

  /**
   * 저장된 점수 삭제 (재계산 전)
   */
  async deleteScores(memberId: number, universityIds?: number[]): Promise<void> {
    if (universityIds && universityIds.length > 0) {
      await this.calculatedScoreRepository.delete({
        member_id: memberId,
        university_id: In(universityIds),
      });
      await this.recruitmentScoreRepository.delete({
        member_id: memberId,
        university_id: In(universityIds),
      });
    } else {
      await this.calculatedScoreRepository.delete({ member_id: memberId });
      await this.recruitmentScoreRepository.delete({ member_id: memberId });
    }
  }

  /**
   * 저장된 모집단위별 환산점수 + 유불리 조회
   */
  async getSavedRecruitmentScores(
    memberId: number,
    universityId?: number,
  ): Promise<MemberJungsiRecruitmentScoreEntity[]> {
    const where: any = { member_id: memberId };
    if (universityId) {
      where.university_id = universityId;
    }
    return this.recruitmentScoreRepository.find({
      where,
      order: { university_name: 'ASC', recruitment_name: 'ASC' },
    });
  }

  /**
   * 특정 모집단위의 저장된 점수 조회
   */
  async getSavedRecruitmentScoreByAdmission(
    memberId: number,
    regularAdmissionId: number,
  ): Promise<MemberJungsiRecruitmentScoreEntity | null> {
    return this.recruitmentScoreRepository.findOne({
      where: { member_id: memberId, regular_admission_id: regularAdmissionId },
    });
  }

  // ============================================
  // 입결분석 API (프론트엔드 스펙 대응)
  // ============================================

  /**
   * 정시 전형 연도별 입결 데이터 조회
   * GET /jungsi/admissions/:admissionId/previous-results
   *
   * 입결확인 페이지의 "최근 입결 분석" 섹션에서 사용
   * - 테이블: 연도별 모집인원, 경쟁률, 충원합격순위, 환산점수 컷, 백분위 컷
   * - 환산점수 입결 그래프: 50%/70% 컷 막대
   * - 상위누백 입결 그래프: 50%/70% 컷 막대
   */
  async getAdmissionPreviousResults(
    admissionId: number,
  ): Promise<AdmissionPreviousResultsResponseDto> {
    // 정시 모집단위 조회 (대학 정보 포함)
    const admission = await this.regularAdmissionRepository.findOne({
      where: { id: admissionId },
      relations: ['university', 'previous_results'],
    });

    if (!admission) {
      throw new NotFoundException(`해당 전형을 찾을 수 없습니다. (ID: ${admissionId})`);
    }

    // 연도별 입결 데이터 변환 (내림차순: 2024, 2023, 2022)
    const previousResults: AdmissionPreviousResultItemDto[] = (admission.previous_results || [])
      .sort((a, b) => b.year - a.year)
      .map((result) => ({
        id: result.id,
        year: result.year,
        recruitmentNumber: result.recruitment_number ?? null,
        competitionRatio:
          result.competition_ratio != null ? Number(result.competition_ratio).toFixed(2) : null,
        additionalAcceptanceRank: result.additional_pass_rank ?? null,
        convertedScoreTotal:
          result.converted_score_total != null
            ? Number(result.converted_score_total).toFixed(2)
            : null,
        convertedScore50Cut: result.min_cut ? Number(result.min_cut).toFixed(2) : null,
        convertedScore70Cut: result.max_cut ? Number(result.max_cut).toFixed(2) : null,
        percentile50Cut: result.percentile_50 ? Number(result.percentile_50).toFixed(2) : null,
        percentile70Cut: result.percentile_70 ? Number(result.percentile_70).toFixed(2) : null,
      }));

    return {
      admissionId: admission.id,
      universityName: admission.university?.name || '알 수 없음',
      recruitmentName: admission.recruitment_name || '',
      previousResults,
    };
  }

  /**
   * 대학 입학 정보 조회
   */
  private async getAdmissions(universityIds?: number[]): Promise<RegularAdmissionEntity[]> {
    const queryBuilder = this.regularAdmissionRepository
      .createQueryBuilder('ra')
      .leftJoinAndSelect('ra.university', 'u')
      .where('ra.score_calculation IS NOT NULL');

    if (universityIds && universityIds.length > 0) {
      queryBuilder.andWhere('u.id IN (:...universityIds)', { universityIds });
    }

    return queryBuilder.getMany();
  }

  /**
   * 단일 대학 환산점수 계산
   * - calc-2026.ts의 calc정시환산점수2026 함수를 사용하여 정확한 환산점수 계산
   */
  private async calculateSingleUniversity(
    mockExamScores: MockExamScoreInput[],
    admission: RegularAdmissionEntity,
    점수표: any,
    학교조건: any,
    유불리: any,
  ): Promise<UniversityCalculatedScore> {
    const universityName = admission.university?.name || '알 수 없음';
    const scoreCalculation = admission.score_calculation;
    const scoreCalculationCode = this.nameToCode[scoreCalculation] || '';
    const major = admission.general_field_name || '인문';
    const recruitmentName = admission.recruitment_name || '';
    const admissionType = admission.admission_type || '';
    const admissionName = admission.admission_name || '';

    const baseResult = {
      regularAdmissionId: admission.id,
      universityId: admission.university?.id || 0,
      universityName,
      recruitmentName,
      admissionType,
      admissionName,
      scoreCalculation,
      scoreCalculationCode,
      major,
    };

    try {
      // 1. 파라미터 준비
      const params = this.prepare정시환산점수(mockExamScores, {
        score_calculation: scoreCalculation,
        major,
      });

      // 2. calc-2026.ts의 calc정시환산점수2026 함수 호출
      // 이 함수는 가천대, 아주대, 이화간호 등 특수 대학과 추가가감을 정확히 처리함
      const calcResult = await calc정시환산점수2026(params);

      if (!calcResult.success) {
        // Debug: 실패한 대학의 scoreCalculation 값 로그
        console.log(`[DEBUG] 환산점수 계산 실패: scoreCalculation="${scoreCalculation}", 대학="${universityName}", 사유="${calcResult.result}"`);
        return {
          ...baseResult,
          success: false,
          result: calcResult.result || '계산 실패',
          calculatedAt: new Date(),
        };
      }

      const myScore = calcResult.내점수 || 0;
      const 표점합 = calcResult.표점합 || this.calc표점합(mockExamScores);

      if (Number.isNaN(myScore)) {
        return {
          ...baseResult,
          success: false,
          result: '계산식 오류',
          calculatedAt: new Date(),
        };
      }

      // 3. 유불리 계산 (최적 점수 및 점수 차이)
      const { optimalScore, scoreDifference } = this.calc유불리(
        표점합,
        myScore,
        scoreCalculation,
        유불리,
      );

      // 4. 상위누적백분위 조회
      const majorType = major === '자연' || major === '이공' ? '이과' : '문과';
      const lookupKey = this.percentileLookupService.buildLookupKey(
        universityName,
        recruitmentName,
        majorType,
      );
      const cumulativePercentile = this.percentileLookupService.findPercentile(lookupKey, myScore);

      // 5. 유불리 백분위 계산 (optimalScore 기준 백분위 - myScore 기준 백분위)
      let advantageDisadvantagePercentile: number | undefined;
      if (optimalScore && cumulativePercentile !== null) {
        const optimalPercentile = this.percentileLookupService.findPercentile(
          lookupKey,
          optimalScore,
        );
        if (optimalPercentile !== null) {
          advantageDisadvantagePercentile = cumulativePercentile - optimalPercentile;
        }
      }

      // 6. 컷라인 및 위험도 점수
      const minCut = admission.min_cut ? Number(admission.min_cut) : undefined;
      const maxCut = admission.max_cut ? Number(admission.max_cut) : undefined;
      const riskScore = this.calcRiskScore(myScore, admission);

      return {
        ...baseResult,
        success: true,
        convertedScore: myScore,
        standardScoreSum: 표점합,
        cumulativePercentile: cumulativePercentile ?? undefined,
        optimalScore,
        scoreDifference,
        advantageDisadvantagePercentile,
        minCut,
        maxCut,
        riskScore,
        calculatedAt: new Date(),
      };
    } catch (error) {
      this.logger.warn(
        `대학 ${universityName} 계산 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
      );
      return {
        ...baseResult,
        success: false,
        result: error instanceof Error ? error.message : '시스템 오류',
        calculatedAt: new Date(),
      };
    }
  }

  /**
   * 계산된 점수 저장
   * - 환산인자별 (대학별 최고 점수)로 저장: ts_member_jungsi_calculated_scores
   * - 모집단위별 (유불리 포함)로 저장: ts_member_jungsi_recruitment_scores
   */
  private async saveCalculatedScores(
    memberId: number,
    scores: UniversityCalculatedScore[],
  ): Promise<void> {
    // 성공한 점수만 필터링
    const successScores = scores.filter((s) => s.success);

    // ========== 1. 환산인자별 점수 저장 (기존 테이블) ==========
    await this.calculatedScoreRepository.delete({ member_id: memberId });

    // 중복 제거: (university_id, score_calculation_code) 조합으로 가장 높은 점수만 유지
    // 유니크 인덱스가 (member_id, university_id, score_calculation_code)이므로 이 키로 중복 제거
    const uniqueScoresMap = new Map<string, UniversityCalculatedScore>();
    for (const score of successScores) {
      const key = `${score.universityId}_${score.scoreCalculationCode}`;
      const existing = uniqueScoresMap.get(key);
      if (!existing || (score.convertedScore || 0) > (existing.convertedScore || 0)) {
        uniqueScoresMap.set(key, score);
      }
    }

    const uniqueScores = Array.from(uniqueScoresMap.values());
    this.logger.log(`대학별 중복 제거: ${successScores.length}개 → ${uniqueScores.length}개`);

    const legacyEntities = uniqueScores.map((score) => {
      const entity = new MemberCalculatedScoreEntity();
      entity.member_id = memberId;
      entity.university_id = score.universityId;
      entity.university_name = score.universityName;
      entity.score_calculation = score.scoreCalculation;
      entity.score_calculation_code = score.scoreCalculationCode;
      entity.major = score.major;
      entity.converted_score = score.convertedScore || 0;
      entity.standard_score_sum = score.standardScoreSum || 0;
      entity.optimal_score = score.optimalScore || 0;
      entity.score_difference = score.scoreDifference || 0;
      entity.calculated_at = score.calculatedAt;
      return entity;
    });

    if (legacyEntities.length > 0) {
      await this.calculatedScoreRepository.save(legacyEntities);
      this.logger.log(`${legacyEntities.length}개 환산인자별 점수 저장 완료`);
    }

    // ========== 2. 모집단위별 점수 저장 (새 테이블 - 유불리 포함) ==========
    await this.recruitmentScoreRepository.delete({ member_id: memberId });

    const recruitmentEntities = scores.map((score) => {
      const entity = new MemberJungsiRecruitmentScoreEntity();
      entity.member_id = memberId;
      entity.regular_admission_id = score.regularAdmissionId;
      entity.university_id = score.universityId;
      entity.university_name = score.universityName;
      entity.recruitment_name = score.recruitmentName;
      entity.admission_type = score.admissionType;
      entity.admission_name = score.admissionName || '';
      entity.score_calculation = score.scoreCalculation;
      entity.score_calculation_code = score.scoreCalculationCode;
      entity.major = score.major;
      entity.converted_score = score.convertedScore || 0;
      entity.standard_score_sum = score.standardScoreSum || 0;
      entity.optimal_score = score.optimalScore || 0;
      entity.advantage_score = score.scoreDifference || 0;
      entity.cumulative_percentile = score.cumulativePercentile ?? null;
      entity.advantage_percentile = score.advantageDisadvantagePercentile ?? null;
      entity.risk_score = score.riskScore ?? null;
      entity.min_cut = score.minCut ?? null;
      entity.max_cut = score.maxCut ?? null;
      entity.success = score.success;
      entity.failure_reason = score.success ? null : (score.result || '계산 실패');
      entity.calculated_at = score.calculatedAt;
      return entity;
    });

    if (recruitmentEntities.length > 0) {
      // 배치로 저장 (1000개씩)
      const batchSize = 1000;
      for (let i = 0; i < recruitmentEntities.length; i += batchSize) {
        const batch = recruitmentEntities.slice(i, i + batchSize);
        await this.recruitmentScoreRepository.save(batch);
      }
      this.logger.log(`${recruitmentEntities.length}개 모집단위별 점수 저장 완료`);
    }
  }

  /**
   * 유불리 계산 (동점수 평균 환산점수 조회 및 점수 차이 계산)
   *
   * 유불리 점수표 JSON에는 각 표점합에 해당하는 대학별 "동점수 평균 환산점수"가 미리 계산되어 있음
   * - 점수환산: 사용자의 국+수+탐2 표준점수 합 (표점합)
   * - 각 학교코드: 해당 표점합에서의 동점수 평균 환산점수
   *
   * @param 표점합 사용자의 표준점수 합 (국+수+탐2)
   * @param myScore 사용자의 환산점수
   * @param scoreCalculation 학교 환산식 코드명
   * @param 유불리 유불리 데이터 (2025정시유불리.json)
   * @returns optimalScore: 동점수 평균 환산점수, scoreDifference: optimalScore - myScore (양수면 유리, 음수면 불리)
   */
  private calc유불리(
    표점합: number,
    myScore: number,
    scoreCalculation: string,
    유불리: any,
  ): { optimalScore: number; scoreDifference: number } {
    try {
      // 유불리 데이터에서 해당 표점합에 맞는 데이터 찾기
      // 유불리 데이터 구조: { "Sheet1": [{ 점수환산: 186, 가천의학: 8.8, ... }] }
      // 점수환산 = 표점합, 각 학교코드 값 = 동점수 평균 환산점수
      const sheet = 유불리['Sheet1'];
      if (!sheet || !Array.isArray(sheet)) {
        return { optimalScore: 0, scoreDifference: 0 };
      }

      // 가장 가까운 점수환산 값을 가진 데이터 찾기
      let closestData = null;
      let minDiff = Infinity;

      for (const row of sheet) {
        const 점수환산 = row['점수환산'];
        if (점수환산 === undefined) continue;

        const diff = Math.abs(점수환산 - 표점합);
        if (diff < minDiff) {
          minDiff = diff;
          closestData = row;
        }
      }

      if (!closestData) {
        return { optimalScore: 0, scoreDifference: 0 };
      }

      // 해당 학교의 동점수 평균 환산점수 조회
      const 동점수평균환산점수 = closestData[scoreCalculation];
      if (동점수평균환산점수 === undefined || 동점수평균환산점수 === null) {
        // 학교 코드가 유불리 데이터에 없는 경우
        return { optimalScore: 0, scoreDifference: 0 };
      }

      // optimalScore = 유불리 점수표에서 조회한 동점수 평균 환산점수
      // scoreDifference = optimalScore - myScore (양수면 유리, 음수면 불리)
      const optimalScore = Number(동점수평균환산점수);
      const scoreDifference = optimalScore - myScore;

      return { optimalScore, scoreDifference };
    } catch (error) {
      this.logger.warn(`유불리 계산 실패 (${scoreCalculation}): ${error}`);
      return { optimalScore: 0, scoreDifference: 0 };
    }
  }

  /**
   * 위험도 점수 계산
   * - admission의 risk_plus_5 ~ risk_minus_5 값을 기준으로 사용자의 환산점수 비교
   * - 위험도 점수: +5 ~ -5 (양수일수록 안정, 음수일수록 위험)
   *
   * @param myScore 사용자의 환산점수
   * @param admission 정시 모집단위 정보 (위험도 기준 점수 포함)
   * @returns 위험도 점수 (-5 ~ +5, 계산 불가 시 undefined)
   */
  private calcRiskScore(
    myScore: number,
    admission: RegularAdmissionEntity,
  ): number | undefined {
    if (!myScore || myScore === 0) {
      return undefined;
    }

    // 위험도 기준점 (점수 기준, 내림차순 정렬)
    const riskThresholds = [
      { level: 5, threshold: admission.risk_plus_5 },
      { level: 4, threshold: admission.risk_plus_4 },
      { level: 3, threshold: admission.risk_plus_3 },
      { level: 2, threshold: admission.risk_plus_2 },
      { level: 1, threshold: admission.risk_plus_1 },
      { level: -1, threshold: admission.risk_minus_1 },
      { level: -2, threshold: admission.risk_minus_2 },
      { level: -3, threshold: admission.risk_minus_3 },
      { level: -4, threshold: admission.risk_minus_4 },
      { level: -5, threshold: admission.risk_minus_5 },
    ];

    // 유효한 threshold가 하나도 없으면 undefined 반환
    const hasValidThreshold = riskThresholds.some(
      (r) => r.threshold !== null && r.threshold !== undefined,
    );
    if (!hasValidThreshold) {
      return undefined;
    }

    // 점수 기준으로 위험도 결정
    for (const { level, threshold } of riskThresholds) {
      if (threshold !== null && threshold !== undefined) {
        const thresholdValue = Number(threshold);
        if (!isNaN(thresholdValue) && myScore >= thresholdValue) {
          return level;
        }
      }
    }

    // 모든 threshold보다 낮으면 가장 낮은 위험도
    return -5;
  }

  /**
   * 표점합 계산 (국어, 수학, 탐구 2개)
   */
  private calc표점합(mockExamScores: MockExamScoreInput[]): number {
    let koreanScore = 0;
    let mathScore = 0;
    const electiveScores: number[] = [];

    mockExamScores.forEach((score) => {
      const standardScoreValue = parseInt(score.standardScore);

      switch (score.subjectCategory) {
        case 'kor':
          koreanScore = standardScoreValue;
          break;
        case 'math':
          mathScore = standardScoreValue;
          break;
        case 'society':
        case 'science':
          electiveScores.push(standardScoreValue);
          break;
      }
    });

    const topTwoElectiveScores = electiveScores.sort((a, b) => b - a).slice(0, 2);

    return koreanScore + mathScore + topTwoElectiveScores.reduce((sum, score) => sum + score, 0);
  }

  /**
   * 수학 과목명 정규화
   * 점수표는 '미적', '기하', '확통' 형식을 사용하므로
   * 긴 형식(미적분, 확률과 통계 등)을 짧은 형식으로 변환
   */
  private normalizeMathSubjectName(subjectName: string): string {
    const normalizations: Record<string, string> = {
      '미적분': '미적',
      '미적분Ⅱ': '미적',
      'Calculus': '미적',
      '확률과 통계': '확통',
      '확률과통계': '확통',
      'Probability': '확통',
    };
    return normalizations[subjectName] || subjectName;
  }

  /**
   * 정시 환산점수 파라미터 준비
   */
  private prepare정시환산점수(
    mockExamScores: MockExamScoreInput[],
    item: { score_calculation: string; major: string },
  ): 정시점수계산Params {
    const params: 정시점수계산Params = {
      학교: item.score_calculation,
      이문과: item.major,
      국어: { 과목: '', 표준점수: 0, 등급: 0, 백분위: 0 },
      수학: { 과목: '', 표준점수: 0, 등급: 0, 백분위: 0 },
      영어: { 과목: '', 표준점수: 0, 등급: 0, 백분위: 0 },
      한국사: { 과목: '', 표준점수: 0, 등급: 0, 백분위: 0 },
      과탐1: undefined,
      과탐2: undefined,
      사탐1: undefined,
      사탐2: undefined,
      제2외국어: undefined,
    };

    mockExamScores.forEach((score) => {
      const subjectScore: 과목점수Type = {
        과목: score.subjectName,
        표준점수: parseInt(score.standardScore),
        등급: score.grade,
        백분위: score.percentile,
      };

      switch (score.subjectCategory) {
        case 'kor':
          subjectScore.과목 = '국어';
          params.국어 = subjectScore;
          break;
        case 'math':
          // 수학 과목명 정규화 (미적분→미적, 확률과 통계→확통 등)
          const normalizedMathName = this.normalizeMathSubjectName(score.subjectName);
          subjectScore.과목 = `수학(${normalizedMathName})`;
          params.수학 = subjectScore;
          break;
        case 'eng':
          params.영어 = subjectScore;
          break;
        case 'history':
          params.한국사 = subjectScore;
          break;
        case 'society':
          if (!params.사탐1) params.사탐1 = subjectScore;
          else if (!params.사탐2) params.사탐2 = subjectScore;
          break;
        case 'science':
          if (!params.과탐1) params.과탐1 = subjectScore;
          else if (!params.과탐2) params.과탐2 = subjectScore;
          break;
        case 'lang':
          params.제2외국어 = subjectScore;
          break;
      }
    });

    return params;
  }

  /**
   * 필수 조건 검증
   */
  private validateRequirements(
    params: 정시점수계산Params,
    학교필수과목: {
      미적기하: boolean;
      확통: boolean;
      과탐: boolean;
      사탐: boolean;
    },
  ): string | null {
    if (학교필수과목.미적기하 && params.수학.과목 === '수학(확통)') {
      return '미적기하필수';
    }
    if (학교필수과목.확통 && params.수학.과목 !== '수학(확통)') {
      return '확통필수';
    }
    if (학교필수과목.사탐 && (!params.사탐1 || !params.사탐2)) {
      return '사탐두개필수';
    }
    if (학교필수과목.과탐 && (!params.과탐1 || !params.과탐2)) {
      return '과탐두개필수';
    }
    return null;
  }

  /**
   * 환산점수 파라미터 준비
   */
  private prepare환산점수Params(
    params: 정시점수계산Params,
    학교: string,
    점수표: any,
  ): 환산점수계산Params {
    return {
      ...params,
      국어환산점수: this.환산점수계산기(params.국어, 학교, 점수표),
      수학환산점수: this.환산점수계산기(params.수학, 학교, 점수표),
      영어환산점수: this.환산점수계산기(params.영어, 학교, 점수표),
      한국사환산점수: this.환산점수계산기(params.한국사, 학교, 점수표),
      과탐1환산점수: params.과탐1 ? this.환산점수계산기(params.과탐1, 학교, 점수표) : null,
      과탐2환산점수: params.과탐2 ? this.환산점수계산기(params.과탐2, 학교, 점수표) : null,
      사탐1환산점수: params.사탐1 ? this.환산점수계산기(params.사탐1, 학교, 점수표) : null,
      사탐2환산점수: params.사탐2 ? this.환산점수계산기(params.사탐2, 학교, 점수표) : null,
      제2외국어환산점수: params.제2외국어
        ? this.환산점수계산기(params.제2외국어, 학교, 점수표)
        : null,
    };
  }

  /**
   * 환산점수 계산기
   * - 영어/한국사는 등급(1-9)으로 조회
   * - 그 외 과목(국어, 수학, 탐구)은 표준점수로 조회
   */
  private 환산점수계산기(과목: 과목점수Type, 학교: string, 점수표: any): number {
    if (!과목.과목 || !과목.등급) {
      throw new Error(`${과목.과목 || '과목'} 성적 없음`);
    }

    const 과목데이터 = 점수표[과목.과목];
    if (!과목데이터) throw new Error('과목 데이터 없음');

    // 영어와 한국사는 등급으로 조회, 그 외 과목은 표준점수로 조회
    const isGradeBasedSubject = 과목.과목 === '영어' || 과목.과목 === '한국사';
    const lookupKey = isGradeBasedSubject ? String(과목.등급) : String(과목.표준점수);

    const 표준점수데이터 = 과목데이터[lookupKey];
    if (!표준점수데이터) {
      throw new Error(`표준점수 데이터 없음 (과목: ${과목.과목}, 키: ${lookupKey})`);
    }

    const 환산점수 = 표준점수데이터[학교];
    if (환산점수 === undefined) throw new Error('환산점수 데이터 없음');

    return typeof 환산점수 === 'string' ? 0 : 환산점수;
  }

  // ==================== 계산 함수들 (calc.ts에서 마이그레이션) ====================

  /**
   * 수능환산 필수 계산기
   */
  private 수능환산필수계산기(params: 환산점수계산Params, 학교조건: any): number {
    const { 탐구과목수 = 0, 기본점수 = 0 } = 학교조건[params.학교] || {};
    const 환산식 = 학교조건[params.학교]?.환산식코드;

    if (!환산식) throw new Error('계산식 오류');

    const 탐구점수 = [
      params.사탐1환산점수,
      params.사탐2환산점수,
      params.과탐1환산점수,
      params.과탐2환산점수,
    ]
      .filter((score): score is number => score !== null)
      .sort((a, b) => b - a)
      .slice(0, 탐구과목수);

    const 탐구과목별계산값 = 탐구점수.reduce((sum, score) => sum + score, 0);

    let result = 0;

    switch (환산식) {
      case 1:
      case 49:
      case 50:
      case 51:
      case 52:
      case 53:
      case 54:
      case 55:
      case 56:
      case 57:
      case 58:
      case 59:
      case 60:
      case 61:
      case 62:
      case 63:
      case 64:
      case 65:
      case 66:
      case 67:
      case 68:
      case 69:
        result =
          params.국어환산점수 +
          params.수학환산점수 +
          params.영어환산점수 +
          params.한국사환산점수 +
          (params.제2외국어환산점수 ?? 0) +
          탐구과목별계산값;
        break;
      case 2:
        result =
          params.국어환산점수 +
          params.영어환산점수 +
          params.한국사환산점수 +
          (params.제2외국어환산점수 ?? 0);
        break;
      case 3:
      case 4:
        result = params.국어환산점수 + params.한국사환산점수 + (params.제2외국어환산점수 ?? 0);
        break;
      case 5:
        result =
          params.수학환산점수 +
          params.영어환산점수 +
          params.한국사환산점수 +
          (params.제2외국어환산점수 ?? 0);
        break;
      case 6:
        result =
          params.수학환산점수 +
          탐구과목별계산값 +
          params.한국사환산점수 +
          (params.제2외국어환산점수 ?? 0);
        break;
      case 7:
      case 8:
        result = params.수학환산점수 + params.한국사환산점수 + (params.제2외국어환산점수 ?? 0);
        break;
      case 9:
      case 10:
      case 11:
        result =
          params.영어환산점수 +
          탐구과목별계산값 +
          params.한국사환산점수 +
          (params.제2외국어환산점수 ?? 0);
        break;
      case 12:
        result = params.영어환산점수 + params.한국사환산점수 + (params.제2외국어환산점수 ?? 0);
        break;
      case 13:
        result = 탐구과목별계산값 + (params.제2외국어환산점수 ?? 0);
        break;
      case 14:
      case 15:
        result = 탐구과목별계산값 + params.한국사환산점수 + (params.제2외국어환산점수 ?? 0);
        break;
      case 16:
      case 17:
      case 18:
      case 19:
      case 20:
      case 21:
      case 22:
      case 23:
      case 24:
      case 25:
      case 26:
      case 27:
      case 28:
      case 29:
      case 30:
      case 31:
      case 32:
      case 33:
      case 34:
      case 35:
        result = params.한국사환산점수 + (params.제2외국어환산점수 ?? 0);
        break;
      case 44:
        result = this.고려세계산기(params, 0.2, 0.35, 0.2, 0.25);
        break;
      case 45:
        result = this.고려세계산기(params, 0.2, 0.35, 0.2, 0.25);
        break;
      case 46:
        result = this.고려세계산기(params, 0.3, 0.3, 0.2, 0.2);
        break;
      case 47:
        result = this.고려세계산기(params, 0.35, 0.2, 0.2, 0.25);
        break;
      case 48:
        result = Math.max(
          this.경기자전계산기(params, 0.3, 0.35, 0.2, 0.15),
          this.경기자전계산기(params, 0.35, 0.3, 0.2, 0.15),
        );
        break;
      case 481:
        result = Math.max(
          this.이화간호계산기(params, 0.3, 0.3, 0.2, 0.2, false),
          this.이화간호계산기(params, 0.25, 0.3, 0.2, 0.25, true),
        );
        break;
      default:
        break;
    }

    return result + 기본점수;
  }

  /**
   * 수능환산 선택 계산기
   */
  private 수능환산선택계산기(params: 환산점수계산Params, 학교조건: any): number {
    const { 탐구과목수 = 0 } = 학교조건[params.학교] || {};
    const 환산식 = 학교조건[params.학교]?.환산식코드;

    if (!환산식) throw new Error('계산식 오류');

    const 탐구점수 = [
      params.사탐1환산점수,
      params.사탐2환산점수,
      params.과탐1환산점수,
      params.과탐2환산점수,
    ]
      .filter((score): score is number => score !== null)
      .sort((a, b) => b - a)
      .slice(0, 탐구과목수);

    const 탐구과목별계산값 = 탐구점수.reduce((sum, score) => sum + score, 0);

    const 국수영환산점수내림차순배열 = [
      params.국어환산점수,
      params.수학환산점수,
      params.영어환산점수,
    ].sort((a, b) => b - a);

    const 국수영탐환산점수내림차순배열 = [
      params.국어환산점수,
      params.수학환산점수,
      params.영어환산점수,
      탐구과목별계산값,
    ].sort((a, b) => b - a);

    const 국영탐환산점수내림차순배열 = [
      params.국어환산점수,
      params.영어환산점수,
      탐구과목별계산값,
    ].sort((a, b) => b - a);

    const 국수탐환산점수내림차순배열 = [
      params.국어환산점수,
      params.수학환산점수,
      탐구과목별계산값,
    ].sort((a, b) => b - a);

    const 수영탐환산점수내림차순배열 = [
      params.수학환산점수,
      params.영어환산점수,
      탐구과목별계산값,
    ].sort((a, b) => a - b);

    const 국수최대값 = Math.max(params.국어환산점수, params.수학환산점수);
    const 국수최소값 = Math.min(params.국어환산점수, params.수학환산점수);

    let result = 0;

    switch (환산식) {
      case 2:
        result = Math.max(params.수학환산점수, 탐구과목별계산값);
        break;
      case 3:
        result =
          수영탐환산점수내림차순배열[0] * 3 +
          수영탐환산점수내림차순배열[1] * 2.5 +
          수영탐환산점수내림차순배열[2] * 1.5;
        break;
      case 4:
        result = 수영탐환산점수내림차순배열[0] + 수영탐환산점수내림차순배열[1];
        break;
      case 5:
        result = Math.max(params.국어환산점수, 탐구과목별계산값);
        break;
      case 6:
        result = Math.max(params.국어환산점수, params.영어환산점수);
        break;
      case 7:
        result =
          국영탐환산점수내림차순배열[0] * 3 +
          국영탐환산점수내림차순배열[1] * 2.5 +
          국영탐환산점수내림차순배열[2] * 1.5;
        break;
      case 8:
        result = 국영탐환산점수내림차순배열[0] + 국영탐환산점수내림차순배열[1];
        break;
      case 9:
      case 10:
        result = 국수최대값 * 3.5 + 국수최소값 * 2.5;
        break;
      case 11:
        result = 국수최대값;
        break;
      case 12:
        result = 국수탐환산점수내림차순배열[0] + 국수탐환산점수내림차순배열[1];
        break;
      case 13:
      case 14:
        result = 국수영환산점수내림차순배열[0] + 국수영환산점수내림차순배열[1];
        break;
      case 15:
        result = 국수영환산점수내림차순배열[0];
        break;
      case 16:
        result = 국수영탐환산점수내림차순배열[0] + 국수영탐환산점수내림차순배열[1];
        break;
      case 17:
      case 18:
        result =
          국수영탐환산점수내림차순배열[0] +
          국수영탐환산점수내림차순배열[1] +
          국수영탐환산점수내림차순배열[2];
        break;
      case 19:
        result = 국수탐환산점수내림차순배열[0] + 국수탐환산점수내림차순배열[1];
        break;
      case 20:
        result =
          국수탐환산점수내림차순배열[0] +
          국수탐환산점수내림차순배열[1] +
          Math.max(params.영어환산점수, params.한국사환산점수);
        break;
      case 36:
        result =
          국수영환산점수내림차순배열[0] * 6 +
          Math.max(
            국수영환산점수내림차순배열[1],
            Math.max(탐구과목별계산값, params.한국사환산점수),
          ) *
            4;
        break;
      case 37:
        result =
          국수탐환산점수내림차순배열[0] +
          국수탐환산점수내림차순배열[1] +
          Math.max(params.영어환산점수, params.한국사환산점수);
        break;
      case 38:
        result =
          국수최대값 + Math.max(params.영어환산점수, 탐구과목별계산값, params.한국사환산점수);
        break;
      default:
        break;
    }

    return result;
  }

  /**
   * 수능환산 가중택 계산기
   */
  private 수능환산가중택계산기(params: 환산점수계산Params, 학교조건: any): number {
    const { 탐구과목수 = 0 } = 학교조건[params.학교] || {};
    const 환산식 = 학교조건[params.학교]?.환산식코드;

    if (!환산식) throw new Error('계산식 오류');

    const 탐구점수 = [
      params.사탐1환산점수,
      params.사탐2환산점수,
      params.과탐1환산점수,
      params.과탐2환산점수,
    ]
      .filter((score): score is number => score !== null)
      .sort((a, b) => b - a)
      .slice(0, 탐구과목수);

    const 탐구과목별계산값 = 탐구점수.reduce((sum, score) => sum + score, 0);

    const 국수영탐환산점수내림차순배열 = [
      params.국어환산점수,
      params.수학환산점수,
      params.영어환산점수,
      탐구과목별계산값,
    ].sort((a, b) => b - a);

    const 국수영탐한환산점수내림차순배열 = [
      params.국어환산점수,
      params.수학환산점수,
      params.영어환산점수,
      탐구과목별계산값,
      params.한국사환산점수,
    ].sort((a, b) => b - a);

    const 전과목환산점수내림차순배열 = [
      params.국어환산점수,
      params.수학환산점수,
      params.영어환산점수,
      params.제2외국어환산점수 ?? 0,
      params.한국사환산점수,
      ...탐구점수,
    ].sort((a, b) => b - a);

    let result = 0;

    switch (환산식) {
      case 21:
        result =
          4 * 국수영탐환산점수내림차순배열[0] +
          3.5 * 국수영탐환산점수내림차순배열[1] +
          2.5 * 국수영탐환산점수내림차순배열[2];
        break;
      case 22:
        result =
          4.5 * 국수영탐환산점수내림차순배열[0] +
          3.5 * 국수영탐환산점수내림차순배열[1] +
          2 * 국수영탐환산점수내림차순배열[2];
        break;
      case 23:
        result = 6 * 국수영탐환산점수내림차순배열[0] + 4 * 국수영탐환산점수내림차순배열[1];
        break;
      case 24:
        result = 8 * 국수영탐환산점수내림차순배열[0] + 2 * 국수영탐환산점수내림차순배열[1];
        break;
      case 25:
        result =
          3.5 * 국수영탐환산점수내림차순배열[0] +
          3.5 * 국수영탐환산점수내림차순배열[1] +
          2 * 국수영탐환산점수내림차순배열[2] +
          1 * 국수영탐환산점수내림차순배열[3];
        break;
      case 26:
      case 27:
        result =
          4.5 * 국수영탐환산점수내림차순배열[0] +
          3.5 * 국수영탐환산점수내림차순배열[1] +
          2 * 국수영탐환산점수내림차순배열[2];
        break;
      case 28:
        result =
          4 * 국수영탐환산점수내림차순배열[0] +
          3 * 국수영탐환산점수내림차순배열[1] +
          2 * 국수영탐환산점수내림차순배열[2] +
          국수영탐환산점수내림차순배열[3];
        break;
      case 29:
        result =
          5 * 국수영탐환산점수내림차순배열[0] +
          3 * 국수영탐환산점수내림차순배열[1] +
          2 * 국수영탐환산점수내림차순배열[2];
        break;
      case 30:
        result = 8 * 국수영탐환산점수내림차순배열[0] + 2 * 국수영탐환산점수내림차순배열[1];
        break;
      case 31:
        result = Math.max(
          params.국어환산점수 * 2.5 +
            params.수학환산점수 * 4 +
            params.영어환산점수 +
            탐구과목별계산값 * 2.5,
          params.국어환산점수 * 2.5 +
            params.수학환산점수 * 3.5 +
            params.영어환산점수 +
            탐구과목별계산값 * 3,
        );
        break;
      case 32:
        result = Math.max(
          params.국어환산점수 * 2 +
            params.수학환산점수 * 4 +
            params.영어환산점수 +
            탐구과목별계산값 * 3,
          params.국어환산점수 * 3 +
            params.수학환산점수 * 4 +
            params.영어환산점수 +
            탐구과목별계산값 * 2,
        );
        break;
      case 33:
        result = Math.max(
          params.국어환산점수 * 3.5 +
            params.수학환산점수 * 2.5 +
            params.영어환산점수 +
            탐구과목별계산값 * 3,
          params.국어환산점수 * 3 +
            params.수학환산점수 * 4 +
            params.영어환산점수 +
            탐구과목별계산값 * 2,
        );
        break;
      case 34:
        result = Math.max(
          params.국어환산점수 * 3.5 +
            params.수학환산점수 * 3 +
            params.영어환산점수 +
            탐구과목별계산값 * 2.5,
          params.국어환산점수 * 3 +
            params.수학환산점수 * 3 +
            params.영어환산점수 +
            탐구과목별계산값 * 3,
        );
        break;
      case 35:
        result = Math.max(
          params.국어환산점수 * 4 +
            params.수학환산점수 * 3 +
            params.영어환산점수 +
            탐구과목별계산값,
          params.국어환산점수 * 3 +
            params.수학환산점수 * 4 +
            params.영어환산점수 +
            탐구과목별계산값,
        );
        break;
      case 39:
        result =
          4 * 국수영탐한환산점수내림차순배열[0] +
          3 * 국수영탐한환산점수내림차순배열[1] +
          2 * 국수영탐한환산점수내림차순배열[2] +
          국수영탐한환산점수내림차순배열[3];
        break;
      case 40:
        result =
          4 * Math.max(params.국어환산점수, params.영어환산점수) +
          3 * Math.max(Math.min(params.국어환산점수, params.영어환산점수), 탐구과목별계산값);
        break;
      case 41:
        result =
          4 * 국수영탐한환산점수내림차순배열[0] +
          3 * 국수영탐한환산점수내림차순배열[1] +
          2 * 국수영탐한환산점수내림차순배열[2] +
          국수영탐한환산점수내림차순배열[3];
        break;
      case 42:
        result =
          5 * 국수영탐한환산점수내림차순배열[0] +
          3 * 국수영탐한환산점수내림차순배열[1] +
          2 * 국수영탐한환산점수내림차순배열[2];
        break;
      case 43:
        result = 6 * 전과목환산점수내림차순배열[0] + 4 * 전과목환산점수내림차순배열[1];
        break;
      default:
        break;
    }

    return result;
  }

  /**
   * 추가가감 계산기
   */
  private 추가가감계산기(params: 환산점수계산Params, 학교조건: any): number {
    const { 탐구과목수 = 0 } = 학교조건[params.학교] || {};
    const 환산식 = 학교조건[params.학교]?.환산식코드;

    if (!환산식) throw new Error('계산식 오류');

    const 탐구점수 = [
      params.사탐1환산점수,
      params.사탐2환산점수,
      params.과탐1환산점수,
      params.과탐2환산점수,
    ]
      .filter((score): score is number => score !== null)
      .sort((a, b) => b - a)
      .slice(0, 탐구과목수);

    const 탐구백분위 = [
      params.과탐1?.백분위,
      params.과탐2?.백분위,
      params.사탐1?.백분위,
      params.사탐2?.백분위,
    ]
      .filter((n): n is number => n !== undefined)
      .sort((a, b) => b - a)
      .slice(0, 탐구과목수);

    const 탐구과목별계산값 = 탐구점수.reduce((sum, score) => sum + score, 0);

    const 국수영탐환산점수내림차순배열 = [
      params.국어환산점수,
      params.수학환산점수,
      params.영어환산점수,
      탐구과목별계산값,
    ].sort((a, b) => b - a);

    const 과탐선택목록 = [params.과탐1, params.과탐2].filter(
      (과목): 과목 is NonNullable<typeof 과목> => !!과목,
    );

    const 과탐환산점수 = [params.과탐1환산점수, params.과탐2환산점수]
      .filter((score): score is number => score !== null)
      .sort((a, b) => b - a);

    const 과탐선택개수 = 과탐선택목록.length;

    const 미적분기하선택여부 =
      params.수학?.과목?.includes('미적') || params.수학?.과목?.includes('기하');

    let result = 0;

    switch (환산식) {
      case 9:
        if (미적분기하선택여부 && params.수학환산점수 > params.국어환산점수) {
          result = params.수학환산점수 * 3.5 * 0.05;
        }
        break;
      case 17:
        if (과탐선택개수 === 2 && 탐구과목별계산값 > 국수영탐환산점수내림차순배열[2]) {
          result = params.수학환산점수;
        }
        break;
      case 26:
        if (미적분기하선택여부 && params.수학환산점수 > 국수영탐환산점수내림차순배열[2]) {
          result = (params.수학.백분위 ?? 0) * 0.1;
        }
        break;
      case 49:
        if (탐구점수.length === 2) {
          result = 탐구과목별계산값 * 0.03;
        }
        break;
      case 50:
        if (과탐선택개수 === 2) {
          result = 탐구과목별계산값 * 0.03;
        }
        break;
      case 51:
        if (과탐선택개수 === 2) {
          result = 탐구과목별계산값 * 0.05;
        }
        break;
      case 52:
        if (과탐선택개수 === 2) {
          result = 탐구과목별계산값 * 0.1;
        }
        break;
      case 53:
        if (과탐선택개수 === 2) {
          result = 2 * 0.05 * 탐구백분위.reduce((acc, cur) => acc + cur, 0);
        }
        break;
      case 54:
      case 55:
        if (과탐선택개수 === 2) {
          result = 탐구과목별계산값 * 0.05;
        }
        break;
      case 56:
        if (과탐선택개수 === 2) {
          result = 탐구과목별계산값 * 0.07;
        }
        break;
      case 57:
        if (과탐선택개수 === 2) {
          const 과탐전체과목수 = 과탐선택목록.filter(
            (과목) =>
              과목.과목.includes('물리학') ||
              과목.과목.includes('생명과학') ||
              과목.과목.includes('지구과학') ||
              과목.과목.includes('화학'),
          ).length;
          result = 과탐전체과목수 === 2 ? 5 : 과탐전체과목수 === 1 ? 3 : 0;
        }
        break;
      case 58:
        if (탐구점수.length === 2) {
          const 화학생명포함 = [params.과탐1, params.과탐2]
            .filter((과목): 과목 is NonNullable<typeof 과목> => !!과목)
            .some((과목) => 과목.과목.includes('화학 Ⅱ') || 과목.과목.includes('생명과학 Ⅱ'));
          result = 탐구과목별계산값 * (화학생명포함 ? 0.07 : 0.05);
        }
        break;
      case 59:
        if (과탐선택개수 === 2) {
          result = 탐구백분위.reduce((acc, cur) => acc + cur, 0) * 0.1;
        } else if (과탐선택개수 === 1) {
          result = 탐구백분위.reduce((acc, cur) => acc + cur, 0) * 0.05;
        }
        break;
      case 60:
        if (과탐선택개수 === 2 && params.수학?.과목?.includes('미적')) {
          result = params.수학환산점수;
        }
        break;
      case 61:
        const 과탐2존재 = [params.과탐1, params.과탐2]
          .filter((과목): 과목 is NonNullable<typeof 과목> => !!과목)
          .some(
            (과목) =>
              과목.과목.includes('물리학 Ⅱ') ||
              과목.과목.includes('생명과학 Ⅱ') ||
              과목.과목.includes('지구과학 Ⅱ') ||
              과목.과목.includes('화학 Ⅱ'),
          );
        if (과탐2존재) {
          const 가산점적용점수 = (탐구과목별계산값 + 0.5) * 0.6;
          result = 가산점적용점수 - 탐구과목별계산값;
        }
        break;
      case 62:
        const 미적기하선택 =
          params.수학?.과목?.includes('미적') || params.수학?.과목?.includes('기하');
        if (미적기하선택) {
          result = (params.수학.백분위 ?? 0) * 0.1;
        }
        break;
      case 63:
        if (과탐환산점수.length > 0) {
          result = 과탐환산점수[0] * 0.1;
        }
        break;
      case 64:
        const 물리학12선택 =
          과탐선택목록.filter((과목) => 과목.과목.includes('물리학')).length === 2;
        if (물리학12선택) {
          result = 탐구백분위.reduce((acc, cur) => acc + cur, 0) * 0.05;
        }
        break;
      case 65:
        const 생명과학12선택 =
          과탐선택목록.filter((과목) => 과목.과목.includes('생명과학')).length === 2;
        if (생명과학12선택) {
          result = 탐구백분위.reduce((acc, cur) => acc + cur, 0) * 0.05;
        }
        break;
      case 66:
        const 지구과학12선택 =
          과탐선택목록.filter((과목) => 과목.과목.includes('지구과학')).length === 2;
        if (지구과학12선택) {
          result = 탐구백분위.reduce((acc, cur) => acc + cur, 0) * 0.05;
        }
        break;
      case 67:
        const 화학12선택 = 과탐선택목록.filter((과목) => 과목.과목.includes('화학')).length === 2;
        if (화학12선택) {
          result = 탐구백분위.reduce((acc, cur) => acc + cur, 0) * 0.05;
        }
        break;
      case 69:
        if (탐구점수.length === 2) {
          const 과탐II존재 = [params.과탐1, params.과탐2]
            .filter((과목): 과목 is NonNullable<typeof 과목> => !!과목)
            .some((과목) => 과목.과목.includes('Ⅱ'));
          if (과탐II존재) {
            result = 탐구과목별계산값 * 0.05;
          }
        }
        break;
      default:
        break;
    }

    return result;
  }

  /**
   * 고려세 계산기
   */
  private 고려세계산기(
    params: 환산점수계산Params,
    국어비율: number,
    수학비율: number,
    영어비율: number,
    탐구비율: number,
  ): number {
    const 사탐1변환점수 = params.사탐1?.백분위 ? 고려세사탐변환점수[params.사탐1.백분위] : null;
    const 사탐2변환점수 = params.사탐2?.백분위 ? 고려세사탐변환점수[params.사탐2.백분위] : null;
    const 과탐1변환점수 = params.과탐1?.백분위 ? 고려세과탐변환점수[params.과탐1.백분위] : null;
    const 과탐2변환점수 = params.과탐2?.백분위 ? 고려세과탐변환점수[params.과탐2.백분위] : null;
    const 탐구변환점수합 = [사탐1변환점수, 사탐2변환점수, 과탐1변환점수, 과탐2변환점수]
      .filter((score): score is number => score !== null)
      .reduce((sum, score) => sum + score, 0);

    const 영어변환점수 = params.영어?.등급 ? 고려세영어변환점수[params.영어.등급 - 1] : null;

    const 탐구변환점수최대값 = Math.max(고려세사탐변환점수[100], 고려세과탐변환점수[100]);
    const 국어최대표점 = 139;
    const 수학최대표점 = 139;
    const 영어최대표점 = 영어변환점수 ?? 0;
    const top =
      (params.국어.표준점수 ?? 0) * 국어비율 +
      (params.수학.표준점수 ?? 0) * 수학비율 +
      (영어변환점수 ?? 0) * 영어비율 +
      탐구변환점수합 * 탐구비율;
    const bottom =
      국어최대표점 * 국어비율 +
      수학최대표점 * 수학비율 +
      영어최대표점 * 영어비율 +
      탐구변환점수최대값 * 탐구비율 * 2;

    return (top / bottom) * 1000;
  }

  /**
   * 경기자전 계산기
   */
  private 경기자전계산기(
    params: 환산점수계산Params,
    국어비율: number,
    수학비율: number,
    영어비율: number,
    탐구비율: number,
  ): number {
    const 사탐1백분위 = params.사탐1?.백분위;
    const 사탐2백분위 = params.사탐2?.백분위;
    const 과탐1백분위 = params.과탐1?.백분위;
    const 과탐2백분위 = params.과탐2?.백분위;
    const 탐구백분위최고 = [사탐1백분위, 사탐2백분위, 과탐1백분위, 과탐2백분위]
      .filter((score): score is number => score !== null && score !== undefined)
      .sort((a, b) => b - a)
      .slice(0, 1)[0];

    const 영어변환점수 = params.영어?.등급 ? 경기자전영어변환점수[params.영어.등급 - 1] : null;

    const 한국사변환점수 = params.한국사?.등급
      ? 경기자전한국사변환점수[params.한국사.등급 - 1]
      : null;

    return (
      (params.국어.백분위 ?? 0) * 국어비율 +
      (params.수학.백분위 ?? 0) * 수학비율 +
      (영어변환점수 ?? 0) * 영어비율 +
      (탐구백분위최고 ?? 0) * 탐구비율 -
      (한국사변환점수 ?? 0)
    );
  }

  /**
   * 이화간호 계산기
   */
  private 이화간호계산기(
    params: 환산점수계산Params,
    국어비율: number,
    수학비율: number,
    영어비율: number,
    탐구비율: number,
    자연여부: boolean,
  ): number {
    const 사탐1변환표준점수 = params.사탐1?.표준점수
      ? 고려세사탐변환점수[params.사탐1.표준점수]
      : null;
    const 사탐2변환표준점수 = params.사탐2?.표준점수
      ? 고려세사탐변환점수[params.사탐2.표준점수]
      : null;
    const 과탐1변환표준점수 = params.과탐1?.표준점수
      ? 자연여부
        ? 고려세과탐변환점수[params.과탐1.표준점수] * 1.06
        : 고려세과탐변환점수[params.과탐1.표준점수]
      : null;
    const 과탐2변환표준점수 = params.과탐2?.표준점수
      ? 자연여부
        ? 고려세과탐변환점수[params.과탐2.표준점수] * 1.06
        : 고려세과탐변환점수[params.과탐2.표준점수]
      : null;
    const 탐구변환표준점수합 = [
      사탐1변환표준점수,
      사탐2변환표준점수,
      과탐1변환표준점수,
      과탐2변환표준점수,
    ]
      .filter((score): score is number => score !== null)
      .reduce((sum, score) => sum + score, 0);

    const 영어변환점수 = params.영어?.등급 ? 이화간호영어변환점수[params.영어.등급 - 1] : null;

    const 한국사변환점수 = params.한국사?.등급
      ? 자연여부
        ? 이화간호한국사자연변환점수[params.한국사.등급 - 1]
        : 이화간호한국사인문변환점수[params.한국사.등급 - 1]
      : null;

    const 국어최고표준점 = 139;
    const 수학최고표준점 = 139;
    const 탐구최고표준점 = Math.max(고려세사탐변환점수[100], 고려세과탐변환점수[100]);

    const top =
      (params.국어.표준점수 ?? 0) * 국어비율 +
      (params.수학.표준점수 ?? 0) * 수학비율 +
      (탐구변환표준점수합 ?? 0) * 탐구비율;

    const bottom =
      국어최고표준점 * 국어비율 + 수학최고표준점 * 수학비율 + 탐구최고표준점 * 탐구비율 * 2;

    return (top / bottom + ((영어변환점수 ?? 0) / 100) * 영어비율) * 1000 + (한국사변환점수 ?? 0);
  }

  // ============================================
  // 표준점수 -> 등급/백분위 변환 API
  // ============================================

  private conversionTable: Record<
    string,
    Record<number, { percentile: number; grade: number }>
  > | null = null;

  /**
   * 변환표 데이터 로드
   */
  private async loadConversionTable(): Promise<void> {
    if (this.conversionTable) return;

    try {
      const fs = await import('fs');
      const path = await import('path');

      const filePath = path.join(__dirname, '../data/2026-score-grade-percentile.json');

      const data = fs.readFileSync(filePath, 'utf8');
      this.conversionTable = JSON.parse(data);
      this.logger.log('표준점수 변환표 로드 완료');
    } catch (error) {
      this.logger.error('변환표 로드 실패:', error);
      throw new Error('변환표 데이터를 로드할 수 없습니다.');
    }
  }

  /**
   * 표준점수를 등급/백분위로 변환
   * @param scores 과목별 표준점수 목록
   * @returns 변환 결과 목록
   */
  async convertStandardScores(scores: { subjectName: string; standardScore: number }[]): Promise<
    {
      subjectName: string;
      standardScore: number;
      percentile: number;
      grade: number;
      success: boolean;
      errorMessage?: string;
    }[]
  > {
    await this.loadConversionTable();

    const results = scores.map((score) => {
      const { subjectName, standardScore } = score;

      try {
        // 과목명 매칭 (유사 과목명 처리)
        const normalizedName = this.normalizeSubjectName(subjectName);

        if (!this.conversionTable[normalizedName]) {
          return {
            subjectName,
            standardScore,
            percentile: 0,
            grade: 0,
            success: false,
            errorMessage: `과목을 찾을 수 없습니다: ${subjectName}`,
          };
        }

        const subjectData = this.conversionTable[normalizedName];
        const scoreData = subjectData[standardScore];

        if (!scoreData) {
          // 가장 가까운 점수 찾기
          const availableScores = Object.keys(subjectData).map(Number);
          const minScore = Math.min(...availableScores);
          const maxScore = Math.max(...availableScores);

          return {
            subjectName,
            standardScore,
            percentile: 0,
            grade: 0,
            success: false,
            errorMessage: `해당 표준점수를 찾을 수 없습니다. 유효 범위: ${minScore}~${maxScore}`,
          };
        }

        return {
          subjectName,
          standardScore,
          percentile: scoreData.percentile,
          grade: scoreData.grade,
          success: true,
        };
      } catch (error) {
        return {
          subjectName,
          standardScore,
          percentile: 0,
          grade: 0,
          success: false,
          errorMessage: `변환 중 오류: ${error.message}`,
        };
      }
    });

    return results;
  }

  /**
   * 과목명 정규화 (유사 과목명 처리)
   */
  private normalizeSubjectName(name: string): string {
    // 공백 제거 및 정규화
    const normalized = name.trim();

    // 과목명 매핑 (입력 가능한 다양한 형태 처리)
    const mappings: Record<string, string> = {
      // 국어
      국어: '국어',
      // 수학
      미적분: '미적',
      미적: '미적',
      기하: '기하',
      확률과통계: '확통',
      확통: '확통',
      수학: '수학',
      // 영어/한국사
      영어: '영어',
      한국사: '한국사',
      // 과학탐구
      물리학1: '물리학 Ⅰ',
      물리학Ⅰ: '물리학 Ⅰ',
      '물리학 Ⅰ': '물리학 Ⅰ',
      '물리학 1': '물리학 Ⅰ',
      물리1: '물리학 Ⅰ',
      화학1: '화학 Ⅰ',
      화학Ⅰ: '화학 Ⅰ',
      '화학 Ⅰ': '화학 Ⅰ',
      '화학 1': '화학 Ⅰ',
      생명과학1: '생명과학 Ⅰ',
      생명과학Ⅰ: '생명과학 Ⅰ',
      '생명과학 Ⅰ': '생명과학 Ⅰ',
      '생명과학 1': '생명과학 Ⅰ',
      생물1: '생명과학 Ⅰ',
      지구과학1: '지구과학 Ⅰ',
      지구과학Ⅰ: '지구과학 Ⅰ',
      '지구과학 Ⅰ': '지구과학 Ⅰ',
      '지구과학 1': '지구과학 Ⅰ',
      지구1: '지구과학 Ⅰ',
      물리학2: '물리학 Ⅱ',
      물리학Ⅱ: '물리학 Ⅱ',
      '물리학 Ⅱ': '물리학 Ⅱ',
      '물리학 2': '물리학 Ⅱ',
      물리2: '물리학 Ⅱ',
      화학2: '화학 Ⅱ',
      화학Ⅱ: '화학 Ⅱ',
      '화학 Ⅱ': '화학 Ⅱ',
      '화학 2': '화학 Ⅱ',
      생명과학2: '생명과학 Ⅱ',
      생명과학Ⅱ: '생명과학 Ⅱ',
      '생명과학 Ⅱ': '생명과학 Ⅱ',
      '생명과학 2': '생명과학 Ⅱ',
      생물2: '생명과학 Ⅱ',
      지구과학2: '지구과학 Ⅱ',
      지구과학Ⅱ: '지구과학 Ⅱ',
      '지구과학 Ⅱ': '지구과학 Ⅱ',
      '지구과학 2': '지구과학 Ⅱ',
      지구2: '지구과학 Ⅱ',
      // 사회탐구
      생활과윤리: '생활과 윤리',
      '생활과 윤리': '생활과 윤리',
      생윤: '생활과 윤리',
      윤리와사상: '윤리와 사상',
      '윤리와 사상': '윤리와 사상',
      윤사: '윤리와 사상',
      한국지리: '한국지리',
      한지: '한국지리',
      세계지리: '세계지리',
      세지: '세계지리',
      동아시아사: '동아시아사',
      동아시아: '동아시아사',
      세계사: '세계사',
      경제: '경제',
      정치와법: '정치와 법',
      '정치와 법': '정치와 법',
      정법: '정치와 법',
      사회문화: '사회·문화',
      '사회·문화': '사회·문화',
      '사회 문화': '사회·문화',
      사문: '사회·문화',
    };

    return mappings[normalized] || normalized;
  }

  /**
   * 사용 가능한 과목 목록 반환
   */
  async getAvailableSubjects(): Promise<string[]> {
    await this.loadConversionTable();
    return Object.keys(this.conversionTable);
  }

  // ============================================================
  // 최적화된 환산점수 계산 메서드 (하이브리드 방식)
  // ============================================================

  /**
   * 최적화된 환산점수 계산 및 저장
   *
   * 성능 최적화:
   * - 700+ 모집단위마다 개별 계산 → 534개 고유 환산인자만 계산
   * - 환산인자별 병렬 처리 (Promise.all)
   * - 환산점수는 factor_scores 테이블에만 저장, recruitment_scores에서 JOIN 조회
   *
   * 예상 성능:
   * - 35초 → 3~5초 (88.9% 개선)
   * - 저장 공간: 350KB/user → 228KB/user (35% 감소)
   *
   * @param memberId 회원 ID
   * @param mockExamScores 모의고사 점수 목록 (선택사항)
   * @param universityIds 특정 대학 ID 목록 (선택사항)
   */
  async calculateAndSaveScoresOptimized(
    memberId: number,
    mockExamScores?: MockExamScoreInput[],
    universityIds?: number[],
  ): Promise<CalculateScoresResponse> {
    const startTime = Date.now();
    this.logger.log(`[최적화] 환산점수 계산 시작 - memberId: ${memberId}`);

    // Step 0: 점수 준비
    const scores = mockExamScores || (await this.getMemberInputScoresFromDB(memberId));
    if (!scores || scores.length === 0) {
      this.logger.warn(`점수 데이터 없음 - memberId: ${memberId}`);
      return {
        memberId,
        calculatedAt: new Date(),
        totalUniversities: 0,
        successCount: 0,
        failedCount: 0,
        scores: [],
      };
    }

    // Step 1: 모집단위 조회
    const admissions = await this.getAdmissions(universityIds);
    this.logger.log(`모집단위 ${admissions.length}개 조회`);

    // Step 2: 고유 환산인자 추출 ⚡
    const uniqueFactors = this.extractUniqueFactors(admissions);
    this.logger.log(`환산인자 ${uniqueFactors.length}개 (모집단위 ${admissions.length}개에서 추출)`);

    // Step 3: 데이터 로드
    await this.dataService.ensureDataLoaded();
    const 점수표 = await this.dataService.get점수표();
    const 학교조건 = await this.dataService.get학교조건();
    const 유불리 = await this.dataService.get유불리();

    // Step 4: 환산인자별 병렬 계산 ⚡⚡⚡ (유불리 포함)
    const factorScores = await this.calculateFactorScoresInParallel(
      scores,
      uniqueFactors,
      점수표,
      학교조건,
      유불리,
      admissions,
    );
    this.logger.log(`환산인자별 계산 완료: ${factorScores.size}개`);

    // Step 5: 모집단위별 매칭 (환산점수만, 유불리/백분위는 추후 추가)
    const recruitmentScores = this.matchRecruitmentScores(admissions, factorScores);
    this.logger.log(`모집단위별 매칭 완료: ${recruitmentScores.length}개`);

    // Step 6: 표점합과 누적백분위 계산 및 저장
    const 표점합 = this.calc표점합(scores);
    const myCumulativePercentile = await this.dataService.get누적백분위(표점합);
    await this.saveUserCumulativePercentile(memberId, 표점합, myCumulativePercentile);
    this.logger.log(`사용자 누백 저장 완료: 표점합=${표점합}, 누백=${myCumulativePercentile}%`);

    // Step 7: 트랜잭션 저장 (UPSERT)
    await this.saveScoresTransactional(memberId, factorScores, recruitmentScores);

    const elapsed = Date.now() - startTime;
    const successCount = recruitmentScores.filter((s) => s.success).length;
    const failedCount = recruitmentScores.filter((s) => !s.success).length;

    this.logger.log(
      `[최적화] 계산 완료: ${elapsed}ms | 성공: ${successCount}, 실패: ${failedCount}`,
    );

    return {
      memberId,
      calculatedAt: new Date(),
      totalUniversities: recruitmentScores.length,
      successCount,
      failedCount,
      scores: recruitmentScores,
    };
  }

  /**
   * 모집단위 목록에서 고유 환산인자 추출
   *
   * 핵심 최적화:
   * - 동일 환산인자(code + major)를 사용하는 모집단위는 1번만 계산
   * - Map으로 중복 제거하여 고유 환산인자만 추출
   *
   * @param admissions 모집단위 목록
   * @returns 고유 환산인자 목록
   */
  private extractUniqueFactors(
    admissions: RegularAdmissionEntity[],
  ): Array<{ code: string; major: string; scoreCalculation: string }> {
    const factorMap = new Map<string, any>();

    for (const admission of admissions) {
      if (!admission.score_calculation) {
        this.logger.warn(
          `환산식 누락 - regular_admission_id: ${admission.id}, university: ${admission.university?.name || 'N/A'}`,
        );
        continue;
      }

      const code = this.nameToCode[admission.score_calculation] || 'SC999';
      const major = admission.general_field_name || '인문'; // 계열명
      const key = `${code}_${major}`;

      if (!factorMap.has(key)) {
        factorMap.set(key, {
          code,
          major,
          scoreCalculation: admission.score_calculation,
        });
      }
    }

    return Array.from(factorMap.values());
  }

  /**
   * 환산인자별 병렬 계산 (유불리 및 백분위 포함)
   *
   * 핵심 성능 개선:
   * - Promise.all을 사용한 병렬 처리
   * - 534개 환산인자를 동시에 계산
   * - CPU 멀티코어 활용으로 계산 시간 단축
   *
   * @param mockExamScores 모의고사 점수
   * @param factors 고유 환산인자 목록
   * @param 점수표 점수표 데이터
   * @param 학교조건 학교조건 데이터
   * @param 유불리 유불리 데이터
   * @param admissions 모집단위 목록 (백분위 계산용)
   * @returns 환산인자별 계산 결과 Map
   */
  private async calculateFactorScoresInParallel(
    mockExamScores: MockExamScoreInput[],
    factors: Array<{ code: string; major: string; scoreCalculation: string }>,
    점수표: any,
    학교조건: any,
    유불리: any,
    admissions: RegularAdmissionEntity[],
  ): Promise<Map<string, any>> {
    const promises = factors.map(async (factor) => {
      try {
        const params = this.prepare정시환산점수(mockExamScores, {
          score_calculation: factor.scoreCalculation,
          major: factor.major,
        });

        const calcResult = await calc정시환산점수2026(params);
        const convertedScore = calcResult.내점수 || 0;
        const 표점합 = calcResult.표점합 || this.calc표점합(mockExamScores);

        // 유불리 계산
        const { optimalScore, scoreDifference } = this.calc유불리(
          표점합,
          convertedScore,
          factor.scoreCalculation,
          유불리,
        );

        // 백분위 계산 (해당 환산인자를 사용하는 대표 대학으로 계산)
        let cumulativePercentile: number | null = null;
        let advantagePercentile: number | null = null;

        // 이 환산인자를 사용하는 첫 번째 대학으로 백분위 계산
        const sampleAdmission = admissions.find(
          (a) => a.score_calculation === factor.scoreCalculation &&
                 (a.general_field_name || '인문') === factor.major
        );

        if (sampleAdmission && sampleAdmission.university?.name) {
          const majorType = factor.major === '자연' || factor.major === '이공' ? '이과' : '문과';
          const lookupKey = this.percentileLookupService.buildLookupKey(
            sampleAdmission.university.name,
            sampleAdmission.admission_type,
            majorType,
          );

          cumulativePercentile = this.percentileLookupService.findPercentile(lookupKey, convertedScore);

          // 유불리 백분위 계산
          if (optimalScore && cumulativePercentile !== null) {
            const optimalPercentile = this.percentileLookupService.findPercentile(lookupKey, optimalScore);
            if (optimalPercentile !== null) {
              advantagePercentile = optimalPercentile - cumulativePercentile;
            }
          }
        }

        return {
          key: `${factor.code}_${factor.major}`,
          code: factor.code,
          major: factor.major,
          success: calcResult.success,
          convertedScore,
          standardScoreSum: 표점합,
          optimalScore,
          advantageScore: scoreDifference,
          cumulativePercentile,
          advantagePercentile,
          failureReason: calcResult.success ? null : calcResult.result,
        };
      } catch (error) {
        this.logger.error(
          `환산인자 계산 실패 - code: ${factor.code}, major: ${factor.major}, error: ${error.message}`,
        );
        return {
          key: `${factor.code}_${factor.major}`,
          code: factor.code,
          major: factor.major,
          success: false,
          convertedScore: 0,
          standardScoreSum: this.calc표점합(mockExamScores),
          optimalScore: 0,
          advantageScore: 0,
          cumulativePercentile: null,
          advantagePercentile: null,
          failureReason: error.message,
        };
      }
    });

    const results = await Promise.all(promises); // ⚡ 병렬 처리!

    const factorScoresMap = new Map();
    for (const result of results) {
      factorScoresMap.set(result.key, result);
    }

    return factorScoresMap;
  }

  /**
   * 모집단위별 환산점수 매칭 (단순화)
   *
   * 데이터 정규화:
   * - 환산점수는 factor_scores 테이블에만 저장
   * - recruitment_scores는 메타데이터만 저장
   * - 조회 시 LEFT JOIN으로 환산점수 결합
   *
   * @param admissions 모집단위 목록
   * @param factorScores 환산인자별 계산 결과
   * @returns 모집단위별 계산 결과
   */
  private matchRecruitmentScores(
    admissions: RegularAdmissionEntity[],
    factorScores: Map<string, any>,
  ): UniversityCalculatedScore[] {
    const recruitmentScores: UniversityCalculatedScore[] = [];

    for (const admission of admissions) {
      const code = this.nameToCode[admission.score_calculation] || 'SC999';
      const major = admission.general_field_name || '인문';
      const key = `${code}_${major}`;
      const factorScore = factorScores.get(key);

      if (!factorScore || !factorScore.success) {
        recruitmentScores.push({
          regularAdmissionId: admission.id,
          universityId: admission.university?.id || 0,
          universityName: admission.university?.name || '',
          recruitmentName: admission.recruitment_name,
          admissionType: admission.admission_type,
          scoreCalculationCode: code,
          success: false,
          failureReason: factorScore?.failureReason || '환산인자 계산 실패',
          convertedScore: 0,
          standardScoreSum: factorScore?.standardScoreSum || 0,
          optimalScore: 0,
          advantageScore: 0,
          cumulativePercentile: null,
          advantagePercentile: null,
        } as any);
        continue;
      }

      // 환산인자별 계산된 모든 값 매칭 (환산점수 + 유불리 + 백분위)
      recruitmentScores.push({
        regularAdmissionId: admission.id,
        universityId: admission.university?.id || 0,
        universityName: admission.university?.name || '',
        recruitmentName: admission.recruitment_name,
        admissionType: admission.admission_type,
        scoreCalculationCode: code,
        success: true,
        // 환산인자 테이블에서 계산된 모든 값 복사
        convertedScore: factorScore.convertedScore,
        standardScoreSum: factorScore.standardScoreSum,
        optimalScore: factorScore.optimalScore,
        advantageScore: factorScore.advantageScore,
        cumulativePercentile: factorScore.cumulativePercentile,
        advantagePercentile: factorScore.advantagePercentile,
      } as any);
    }

    return recruitmentScores;
  }

  /**
   * 트랜잭션을 사용한 점수 저장
   *
   * 안정성 개선:
   * - 트랜잭션으로 원자성 보장
   * - UPSERT로 중복 처리 (ON CONFLICT DO UPDATE)
   * - 에러 발생 시 전체 롤백
   *
   * @param memberId 회원 ID
   * @param factorScores 환산인자별 점수
   * @param recruitmentScores 모집단위별 점수
   */
  private async saveScoresTransactional(
    memberId: number,
    factorScores: Map<string, any>,
    recruitmentScores: UniversityCalculatedScore[],
  ): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. 환산인자별 점수 UPSERT (유불리 및 백분위 포함)
      const factorEntities = Array.from(factorScores.values())
        .filter((f) => f.success)
        .map((f) => ({
          member_id: memberId,
          score_calculation_code: f.code,
          major: f.major,
          converted_score: f.convertedScore,
          standard_score_sum: f.standardScoreSum,
          optimal_score: f.optimalScore || null,
          advantage_score: f.advantageScore || null,
          cumulative_percentile: f.cumulativePercentile || null,
          advantage_percentile: f.advantagePercentile || null,
          calculated_at: new Date(),
        }));

      if (factorEntities.length > 0) {
        await queryRunner.manager
          .createQueryBuilder()
          .insert()
          .into(MemberJungsiFactorScoreEntity)
          .values(factorEntities)
          .orUpdate(
            [
              'converted_score',
              'standard_score_sum',
              'optimal_score',
              'advantage_score',
              'cumulative_percentile',
              'advantage_percentile',
              'calculated_at',
              'updated_at',
            ],
            ['member_id', 'score_calculation_code', 'major'],
          )
          .execute();
      }

      // 2. 모집단위별 점수 저장 (환산점수 + 유불리 + 백분위 모두 포함)
      const recruitmentEntities = recruitmentScores.map((score) => ({
        member_id: memberId,
        regular_admission_id: score.regularAdmissionId,
        university_id: score.universityId,
        university_name: score.universityName,
        recruitment_name: score.recruitmentName,
        admission_type: score.admissionType,
        admission_name: (score as any).admissionName || null,
        score_calculation: this.codeToName[score.scoreCalculationCode] || '',
        score_calculation_code: score.scoreCalculationCode,
        major: (score as any).major || '',
        converted_score: score.convertedScore || 0,
        standard_score_sum: score.standardScoreSum || 0,
        optimal_score: (score as any).optimalScore || null,
        advantage_score: (score as any).advantageScore || null,
        cumulative_percentile: (score as any).cumulativePercentile || null,
        advantage_percentile: (score as any).advantagePercentile || null,
        risk_score: null,
        min_cut: null,
        max_cut: null,
        success: score.success,
        failure_reason: (score as any).failureReason || null,
        calculated_at: new Date(),
      }));

      if (recruitmentEntities.length > 0) {
        const batchSize = 1000;
        for (let i = 0; i < recruitmentEntities.length; i += batchSize) {
          const batch = recruitmentEntities.slice(i, i + batchSize);
          await queryRunner.manager
            .createQueryBuilder()
            .insert()
            .into(MemberJungsiRecruitmentScoreEntity)
            .values(batch)
            .orUpdate(
              [
                'converted_score',
                'standard_score_sum',
                'optimal_score',
                'advantage_score',
                'cumulative_percentile',
                'advantage_percentile',
                'success',
                'failure_reason',
                'calculated_at',
                'updated_at',
              ],
              ['member_id', 'regular_admission_id'],
            )
            .execute();
        }
      }

      await queryRunner.commitTransaction();
      this.logger.log(
        `저장 완료 - 환산인자: ${factorEntities.length}개, 모집단위: ${recruitmentEntities.length}개`,
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('점수 저장 실패:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 사용자의 표점합과 누적백분위를 input_scores 테이블에 저장
   *
   * 목적:
   * - 사용자의 기본 누백을 캐싱하여 step1 차트에서 빠르게 조회
   * - 매번 계산하지 않고 저장된 값 사용
   *
   * @param memberId 회원 ID
   * @param standardScoreSum 표준점수 합계 (국어+수학+탐구2)
   * @param cumulativePercentile 나의 누적백분위 (상위 %)
   */
  private async saveUserCumulativePercentile(
    memberId: number,
    standardScoreSum: number,
    cumulativePercentile: number,
  ): Promise<void> {
    try {
      await this.inputScoreRepository.update(
        { member_id: memberId },
        {
          standard_score_sum: standardScoreSum,
          cumulative_percentile: cumulativePercentile,
        },
      );
    } catch (error) {
      this.logger.error(`사용자 누백 저장 실패 - memberId: ${memberId}`, error);
      // 저장 실패해도 전체 계산 프로세스는 계속 진행
    }
  }
}
