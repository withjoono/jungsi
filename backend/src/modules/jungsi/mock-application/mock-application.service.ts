import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';
import {
  AdmissionInfoDto,
  FrequencyDistributionItemDto,
  FrequencyDistributionResponseDto,
  ApplicantItemDto,
  ApplicantListResponseDto,
  GetAdmissionsQueryDto,
  PaginatedAdmissionsResponseDto,
  MockApplicationAnalysisRequestDto,
  MockApplicationAnalysisResponseDto,
  MockApplicationBasicInfoDto,
  StatisticsDto,
  NormalDistributionCurveDto,
  NormalDistributionPointDto,
  MyScoreAnalysisDto,
  AggregateRequestDto,
  AggregateResponseDto,
} from './dto/mock-application.dto';

interface RawAdmissionInfo {
  row_id: number;
  대학코드: string;
  대학명: string;
  구분: string;
  모집단위: string;
  모집인원: number;
  경쟁률: number;
  충원합격순위: number;
  총합격자: number;
  모의지원자수: number;
}

interface RawFrequencyDistribution {
  row_id: number;
  점수하한: number;
  점수상한: number;
  지원자수: number;
  누적인원: number;
  합격상태: string;
}

interface RawApplicant {
  row_id: number;
  순위: number;
  점수: number;
  합격상태: string;
  비고?: string;
}

@Injectable()
export class MockApplicationService implements OnModuleInit {
  private readonly logger = new Logger(MockApplicationService.name);

  // 캐시된 데이터
  private admissionInfoMap: Map<number, AdmissionInfoDto> = new Map();
  private frequencyDistributionMap: Map<number, FrequencyDistributionItemDto[]> = new Map();
  private applicantListMap: Map<number, ApplicantItemDto[]> = new Map();

  private isLoaded = false;

  async onModuleInit() {
    await this.loadExcelData();
  }

  /**
   * 엑셀 데이터 로드 및 캐싱
   */
  private async loadExcelData(): Promise<void> {
    const filePath = path.join(process.cwd(), 'uploads', '모의지원현황_전체.xlsx');

    if (!fs.existsSync(filePath)) {
      this.logger.warn(`모의지원현황 파일을 찾을 수 없습니다: ${filePath}`);
      return;
    }

    try {
      this.logger.log('모의지원현황 엑셀 데이터 로드 시작...');
      const startTime = Date.now();

      const workbook = XLSX.readFile(filePath);

      // 1. 기본정보 시트 로드
      const infoSheet = workbook.Sheets['기본정보'];
      const infoData: RawAdmissionInfo[] = XLSX.utils.sheet_to_json(infoSheet);

      for (const row of infoData) {
        this.admissionInfoMap.set(row.row_id, {
          rowId: row.row_id,
          universityCode: row.대학코드,
          universityName: row.대학명,
          group: row.구분,
          recruitmentUnit: row.모집단위,
          recruitmentNumber: row.모집인원,
          competitionRatio: row.경쟁률,
          additionalPassRank: row.충원합격순위,
          totalPassers: row.총합격자,
          mockApplicants: row.모의지원자수,
        });
      }
      this.logger.log(`기본정보 로드 완료: ${this.admissionInfoMap.size}개`);

      // 2. 도수분포 시트 로드
      const freqSheet = workbook.Sheets['도수분포'];
      const freqData: RawFrequencyDistribution[] = XLSX.utils.sheet_to_json(freqSheet);

      for (const row of freqData) {
        if (!this.frequencyDistributionMap.has(row.row_id)) {
          this.frequencyDistributionMap.set(row.row_id, []);
        }
        this.frequencyDistributionMap.get(row.row_id)!.push({
          scoreLower: row.점수하한,
          scoreUpper: row.점수상한,
          applicantCount: row.지원자수,
          cumulativeCount: row.누적인원,
          passStatus: row.합격상태,
        });
      }
      this.logger.log(`도수분포 로드 완료: ${freqData.length}개 레코드`);

      // 3. 지원자목록 시트 로드
      const applicantSheet = workbook.Sheets['지원자목록'];
      const applicantData: RawApplicant[] = XLSX.utils.sheet_to_json(applicantSheet);

      for (const row of applicantData) {
        if (!this.applicantListMap.has(row.row_id)) {
          this.applicantListMap.set(row.row_id, []);
        }
        this.applicantListMap.get(row.row_id)!.push({
          rank: row.순위,
          score: row.점수,
          passStatus: row.합격상태,
          note: row.비고,
        });
      }
      this.logger.log(`지원자목록 로드 완료: ${applicantData.length}개 레코드`);

      this.isLoaded = true;
      const elapsed = Date.now() - startTime;
      this.logger.log(`모의지원현황 데이터 로드 완료 (${elapsed}ms)`);
    } catch (error) {
      this.logger.error('엑셀 데이터 로드 실패:', error);
    }
  }

  /**
   * 모집단위 목록 조회 (페이지네이션)
   */
  getAdmissions(query: GetAdmissionsQueryDto): PaginatedAdmissionsResponseDto {
    let admissions = Array.from(this.admissionInfoMap.values());

    // 필터링
    if (query.universityName) {
      const searchTerm = query.universityName.toLowerCase();
      admissions = admissions.filter(
        (a) =>
          a.universityName.toLowerCase().includes(searchTerm) ||
          a.recruitmentUnit.toLowerCase().includes(searchTerm),
      );
    }

    if (query.group) {
      admissions = admissions.filter((a) => a.group === query.group);
    }

    // 정렬 (대학명 → 모집단위)
    admissions.sort((a, b) => {
      const nameCompare = a.universityName.localeCompare(b.universityName);
      if (nameCompare !== 0) return nameCompare;
      return a.recruitmentUnit.localeCompare(b.recruitmentUnit);
    });

    // 페이지네이션
    const page = query.page || 1;
    const limit = query.limit || 50;
    const startIndex = (page - 1) * limit;
    const paginatedData = admissions.slice(startIndex, startIndex + limit);

    return {
      data: paginatedData,
      total: admissions.length,
      page,
      limit,
      totalPages: Math.ceil(admissions.length / limit),
    };
  }

  /**
   * 특정 모집단위의 기본정보 조회
   */
  getAdmissionInfo(rowId: number): AdmissionInfoDto {
    const info = this.admissionInfoMap.get(rowId);
    if (!info) {
      throw new NotFoundException(`모집단위를 찾을 수 없습니다. (rowId: ${rowId})`);
    }
    return info;
  }

  /**
   * 특정 모집단위의 도수분포 조회
   */
  getFrequencyDistribution(rowId: number): FrequencyDistributionResponseDto {
    const admissionInfo = this.getAdmissionInfo(rowId);
    const frequencyDistribution = this.frequencyDistributionMap.get(rowId) || [];

    // 점수 내림차순 정렬
    const sortedDistribution = [...frequencyDistribution].sort(
      (a, b) => b.scoreLower - a.scoreLower,
    );

    return {
      admissionInfo,
      frequencyDistribution: sortedDistribution,
    };
  }

  /**
   * 특정 모집단위의 지원자목록 조회
   */
  getApplicantList(rowId: number): ApplicantListResponseDto {
    const admissionInfo = this.getAdmissionInfo(rowId);
    const applicants = this.applicantListMap.get(rowId) || [];

    // 순위순 정렬
    const sortedApplicants = [...applicants].sort((a, b) => a.rank - b.rank);

    // 50%, 70% 컷 점수 찾기
    const cut50Item = sortedApplicants.find((a) => a.note === '50%컷');
    const cut70Item = sortedApplicants.find((a) => a.note === '70%컷');

    return {
      admissionInfo,
      applicants: sortedApplicants,
      cut50: cut50Item?.score,
      cut70: cut70Item?.score,
    };
  }

  /**
   * 지원자목록을 도수분포 형태로 변환
   * - 점수 구간별로 그룹핑하여 반환
   */
  getApplicantListAsFrequency(
    rowId: number,
    interval: number = 1,
  ): FrequencyDistributionResponseDto {
    const admissionInfo = this.getAdmissionInfo(rowId);
    const applicants = this.applicantListMap.get(rowId) || [];

    if (applicants.length === 0) {
      return {
        admissionInfo,
        frequencyDistribution: [],
      };
    }

    // 구간별 집계
    const frequencyMap = new Map<
      string,
      {
        scoreLower: number;
        scoreUpper: number;
        applicantCount: number;
        cumulativeCount: number;
        passStatuses: string[];
      }
    >();

    // 순위순 정렬 (누적 계산을 위해)
    const sortedApplicants = [...applicants].sort((a, b) => a.rank - b.rank);

    for (const applicant of sortedApplicants) {
      const lowerBound = Math.floor(applicant.score / interval) * interval;
      const upperBound = lowerBound + interval;
      const key = `${lowerBound}-${upperBound}`;

      if (!frequencyMap.has(key)) {
        frequencyMap.set(key, {
          scoreLower: lowerBound,
          scoreUpper: upperBound,
          applicantCount: 0,
          cumulativeCount: 0,
          passStatuses: [],
        });
      }

      const bucket = frequencyMap.get(key)!;
      bucket.applicantCount++;
      bucket.passStatuses.push(applicant.passStatus);
    }

    // 점수 내림차순 정렬 및 누적인원 계산
    const sortedBuckets = Array.from(frequencyMap.values()).sort(
      (a, b) => b.scoreLower - a.scoreLower,
    );

    let cumulative = 0;
    for (const bucket of sortedBuckets) {
      cumulative += bucket.applicantCount;
      bucket.cumulativeCount = cumulative;
    }

    // 합격상태 결정 (다수결)
    const frequencyDistribution: FrequencyDistributionItemDto[] = sortedBuckets.map((bucket) => {
      const statusCounts = new Map<string, number>();
      for (const status of bucket.passStatuses) {
        statusCounts.set(status, (statusCounts.get(status) || 0) + 1);
      }

      let dominantStatus = '합격가능';
      let maxCount = 0;
      for (const [status, count] of statusCounts) {
        if (count > maxCount) {
          maxCount = count;
          dominantStatus = status;
        }
      }

      return {
        scoreLower: bucket.scoreLower,
        scoreUpper: bucket.scoreUpper,
        applicantCount: bucket.applicantCount,
        cumulativeCount: bucket.cumulativeCount,
        passStatus: dominantStatus,
      };
    });

    return {
      admissionInfo,
      frequencyDistribution,
    };
  }

  /**
   * 대학 목록 조회 (중복 제거)
   */
  getUniversities(): { code: string; name: string }[] {
    const universityMap = new Map<string, string>();

    for (const admission of this.admissionInfoMap.values()) {
      if (!universityMap.has(admission.universityCode)) {
        universityMap.set(admission.universityCode, admission.universityName);
      }
    }

    return Array.from(universityMap.entries())
      .map(([code, name]) => ({ code, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * 데이터 로드 상태 확인
   */
  isDataLoaded(): boolean {
    return this.isLoaded;
  }

  // ==============================
  // 모의지원 분석 API
  // ==============================

  /**
   * 대학코드 + 대학명 + 모집단위로 모집단위 찾기
   */
  private findAdmissionByParams(
    universityCode: string,
    universityName: string,
    recruitmentUnit: string,
  ): AdmissionInfoDto | null {
    for (const admission of this.admissionInfoMap.values()) {
      // 대학코드와 모집단위로 매칭
      if (
        admission.universityCode === universityCode &&
        admission.recruitmentUnit === recruitmentUnit
      ) {
        return admission;
      }
      // 대학코드가 없는 경우 대학명 + 모집단위로 매칭
      if (
        admission.universityName === universityName &&
        admission.recruitmentUnit === recruitmentUnit
      ) {
        return admission;
      }
    }
    return null;
  }

  /**
   * 통계 계산 (평균, 표준편차, 최소, 최대)
   */
  private calculateStatistics(
    scores: number[],
  ): Omit<StatisticsDto, 'safePassThreshold' | 'passThreshold'> {
    const n = scores.length;
    if (n === 0) {
      return { mean: 0, stdDev: 0, min: 0, max: 0 };
    }

    const mean = scores.reduce((sum, s) => sum + s, 0) / n;
    const variance = scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);
    const min = Math.min(...scores);
    const max = Math.max(...scores);

    return {
      mean: Math.round(mean * 100) / 100,
      stdDev: Math.round(stdDev * 100) / 100,
      min: Math.round(min * 100) / 100,
      max: Math.round(max * 100) / 100,
    };
  }

  /**
   * 합격 기준점 계산
   */
  private calculatePassThresholds(applicants: ApplicantItemDto[]): {
    safePassThreshold: number | null;
    passThreshold: number | null;
  } {
    const safePassApplicants = applicants.filter((a) => a.passStatus === '안정합격');
    const passApplicants = applicants.filter((a) =>
      ['안정합격', '추가합격', '합격가능'].includes(a.passStatus),
    );

    return {
      safePassThreshold:
        safePassApplicants.length > 0 ? Math.min(...safePassApplicants.map((a) => a.score)) : null,
      passThreshold:
        passApplicants.length > 0 ? Math.min(...passApplicants.map((a) => a.score)) : null,
    };
  }

  /**
   * 정규분포 확률밀도함수 (PDF)
   */
  private normalPDF(x: number, mean: number, stdDev: number): number {
    if (stdDev === 0) return x === mean ? 1 : 0;
    const coefficient = 1 / (stdDev * Math.sqrt(2 * Math.PI));
    const exponent = -0.5 * Math.pow((x - mean) / stdDev, 2);
    return coefficient * Math.exp(exponent);
  }

  /**
   * 정규분포 곡선 좌표 생성
   */
  private generateNormalDistributionCurve(
    mean: number,
    stdDev: number,
    _min: number,
    _max: number,
  ): NormalDistributionCurveDto {
    const xMin = Math.round((mean - 4 * stdDev) * 100) / 100;
    const xMax = Math.round((mean + 4 * stdDev) * 100) / 100;
    const step = (xMax - xMin) / 100;
    const points: NormalDistributionPointDto[] = [];

    for (let x = xMin; x <= xMax; x += step) {
      const y = this.normalPDF(x, mean, stdDev);
      points.push({
        x: Math.round(x * 100) / 100,
        y: Math.round(y * 100000) / 100000,
      });
    }

    return { xMin, xMax, points };
  }

  /**
   * 내 점수 분석
   */
  private analyzeMyScore(
    myScore: number,
    applicants: ApplicantItemDto[],
    mean: number,
    intervalSize: number = 5,
  ): MyScoreAnalysisDto {
    // 순위순 정렬
    const sortedApplicants = [...applicants].sort((a, b) => b.score - a.score);

    // 내 점수보다 높은 점수의 지원자 수 = 예상 순위 - 1
    const higherCount = sortedApplicants.filter((a) => a.score > myScore).length;
    const rank = higherCount + 1;

    // 백분위 계산 (상위 몇 %)
    const percentile = Math.round((rank / sortedApplicants.length) * 100 * 100) / 100;

    // 내 점수가 속한 구간 찾기
    const scoreLower = Math.floor(myScore / intervalSize) * intervalSize;
    const scoreUpper = scoreLower + intervalSize;

    // 합격 예측 (간단한 로직)
    let passStatus = '불합격 위험';
    if (rank <= applicants.length * 0.3) {
      passStatus = '안정합격';
    } else if (rank <= applicants.length * 0.5) {
      passStatus = '합격가능';
    } else if (rank <= applicants.length * 0.7) {
      passStatus = '추가합격';
    }

    // 평균 대비 점수 차이
    const comparedToMean = Math.round((myScore - mean) * 100) / 100;

    return {
      score: myScore,
      rank,
      percentile,
      passStatus,
      scoreRange: { scoreLower, scoreUpper },
      comparedToMean,
    };
  }

  /**
   * 도수분포표 생성 (구간폭 지정)
   */
  private calculateFrequencyDistribution(
    applicants: ApplicantItemDto[],
    intervalSize: number = 5,
  ): FrequencyDistributionItemDto[] {
    if (applicants.length === 0) {
      return [];
    }

    const scores = applicants.map((a) => a.score);
    const min = Math.floor(Math.min(...scores) / intervalSize) * intervalSize;
    const max = Math.ceil(Math.max(...scores) / intervalSize) * intervalSize;

    // 구간별 집계
    const bins = new Map<number, { count: number; statuses: Map<string, number> }>();

    for (let start = min; start < max; start += intervalSize) {
      bins.set(start, { count: 0, statuses: new Map() });
    }

    for (const applicant of applicants) {
      const binStart = Math.floor(applicant.score / intervalSize) * intervalSize;
      const bin = bins.get(binStart);
      if (bin) {
        bin.count++;
        const statusCount = bin.statuses.get(applicant.passStatus) || 0;
        bin.statuses.set(applicant.passStatus, statusCount + 1);
      }
    }

    // 높은 점수부터 정렬 및 누적 계산
    const sortedBins = Array.from(bins.entries())
      .filter(([, bin]) => bin.count > 0)
      .sort((a, b) => b[0] - a[0]);

    let cumulative = 0;

    return sortedBins.map(([binStart, bin]) => {
      cumulative += bin.count;

      // 가장 많은 합격상태 결정
      let dominantStatus = '불합격';
      let maxCount = 0;
      for (const [status, count] of bin.statuses) {
        if (count > maxCount) {
          maxCount = count;
          dominantStatus = status;
        }
      }

      return {
        scoreLower: binStart,
        scoreUpper: binStart + intervalSize,
        applicantCount: bin.count,
        cumulativeCount: cumulative,
        passStatus: dominantStatus,
      };
    });
  }

  /**
   * 모의지원 분석 데이터 조회
   * POST /jungsi/mock-application/analysis
   */
  getAnalysis(request: MockApplicationAnalysisRequestDto): MockApplicationAnalysisResponseDto {
    // 1. 모집단위 찾기
    const admission = this.findAdmissionByParams(
      request.universityCode,
      request.universityName,
      request.recruitmentUnit,
    );

    if (!admission) {
      throw new NotFoundException(
        `해당 대학/모집단위의 모의지원 데이터가 없습니다. (대학: ${request.universityName}, 모집단위: ${request.recruitmentUnit})`,
      );
    }

    // 2. 지원자목록 조회
    const applicants = this.applicantListMap.get(admission.rowId) || [];

    if (applicants.length === 0) {
      throw new NotFoundException(
        `해당 모집단위의 지원자 데이터가 없습니다. (rowId: ${admission.rowId})`,
      );
    }

    // 3. 기본정보 구성
    const basicInfo: MockApplicationBasicInfoDto = {
      universityCode: admission.universityCode,
      universityName: admission.universityName,
      admissionType: admission.group + '군',
      recruitmentUnit: admission.recruitmentUnit,
      recruitmentCount: admission.recruitmentNumber,
      competitionRate: admission.competitionRatio,
      additionalPassRank: admission.additionalPassRank,
      totalPassCount: admission.totalPassers,
      mockApplicantCount: admission.mockApplicants,
    };

    // 4. 통계 계산
    const scores = applicants.map((a) => a.score);
    const baseStats = this.calculateStatistics(scores);
    const passThresholds = this.calculatePassThresholds(applicants);

    const statistics: StatisticsDto = {
      ...baseStats,
      ...passThresholds,
    };

    // 5. 도수분포표 생성 (기본 구간폭: 5)
    const frequencyDistribution = this.calculateFrequencyDistribution(applicants, 5);

    // 6. 정규분포 곡선 생성
    const normalDistributionCurve = this.generateNormalDistributionCurve(
      statistics.mean,
      statistics.stdDev,
      statistics.min,
      statistics.max,
    );

    // 7. 내 점수 분석 (myScore가 있을 때만)
    let myScoreAnalysis: MyScoreAnalysisDto | undefined;
    if (request.myScore !== undefined && request.myScore !== null) {
      myScoreAnalysis = this.analyzeMyScore(request.myScore, applicants, statistics.mean, 5);
    }

    return {
      basicInfo,
      statistics,
      frequencyDistribution,
      normalDistributionCurve,
      myScoreAnalysis,
    };
  }

  /**
   * 도수분포표 구간폭 재계산
   * POST /jungsi/mock-application/analysis/aggregate
   */
  getAggregatedFrequency(request: AggregateRequestDto): AggregateResponseDto {
    // 1. 모집단위 찾기
    const admission = this.findAdmissionByParams(
      request.universityCode,
      request.universityName,
      request.recruitmentUnit,
    );

    if (!admission) {
      throw new NotFoundException(
        `해당 대학/모집단위의 모의지원 데이터가 없습니다. (대학: ${request.universityName}, 모집단위: ${request.recruitmentUnit})`,
      );
    }

    // 2. 지원자목록 조회
    const applicants = this.applicantListMap.get(admission.rowId) || [];

    if (applicants.length === 0) {
      throw new NotFoundException(
        `해당 모집단위의 지원자 데이터가 없습니다. (rowId: ${admission.rowId})`,
      );
    }

    // 3. 도수분포표 재계산
    const frequencyDistribution = this.calculateFrequencyDistribution(
      applicants,
      request.intervalSize,
    );

    return {
      intervalSize: request.intervalSize,
      frequencyDistribution,
    };
  }
}
