import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import { 점수표Type, 학교조건Type, 유불리Type, 누백대입표Type, 환산인자누백Type } from '../calculations/types';

/**
 * 정시 환산점수 계산에 필요한 JSON 데이터를 로드하고 캐싱하는 서비스
 * 싱글톤으로 관리되어 애플리케이션 시작 시 한 번만 로드됨
 */
@Injectable()
export class JungsiDataService implements OnModuleInit {
  private readonly logger = new Logger(JungsiDataService.name);

  private 점수표Data: 점수표Type | null = null;
  private 학교조건Data: 학교조건Type | null = null;
  private 유불리Data: 유불리Type | null = null;
  private 누백대입표Data: 누백대입표Type | null = null;
  private 환산인자누백Data: 환산인자누백Type | null = null;

  private dataLoaded = false;
  private loadingPromise: Promise<void> | null = null;

  async onModuleInit(): Promise<void> {
    // 모듈 초기화 시 데이터 프리로드
    await this.ensureDataLoaded();
    this.logger.log('정시 환산점수 데이터 로드 완료');
  }

  /**
   * 데이터가 로드되었는지 확인하고, 로드되지 않았으면 로드
   */
  async ensureDataLoaded(): Promise<void> {
    if (this.dataLoaded) return;

    // 이미 로딩 중이면 기존 Promise 반환
    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    this.loadingPromise = this.loadAllData();
    await this.loadingPromise;
    this.loadingPromise = null;
  }

  private getDataDir(): string {
    // NestJS assets는 dist/modules/...로 복사됨 (nest-cli.json 설정)
    const nestAssetsDir = path.resolve(process.cwd(), 'dist/modules/jungsi/calculation/data');

    // dist 폴더 내의 data 경로 (TypeScript 컴파일 결과 기준)
    const distDataDir = path.join(__dirname, '..', 'data');

    // src 폴더 내의 data 경로 (개발 환경 - watch mode)
    const srcDataDir = path.resolve(process.cwd(), 'src/modules/jungsi/calculation/data');

    // NestJS assets 디렉토리 우선 확인 (nest-cli.json에서 복사됨)
    if (fs.existsSync(nestAssetsDir)) {
      this.logger.log(`Using NestJS assets directory: ${nestAssetsDir}`);
      return nestAssetsDir;
    }

    // dist 폴더에 data가 있으면 사용
    if (fs.existsSync(distDataDir)) {
      this.logger.log(`Using dist data directory: ${distDataDir}`);
      return distDataDir;
    }

    // src 폴더 사용 (개발 환경)
    if (fs.existsSync(srcDataDir)) {
      this.logger.log(`Using src data directory: ${srcDataDir}`);
      return srcDataDir;
    }

    // 둘 다 없으면 NestJS assets 경로 반환 (에러 메시지에 표시되도록)
    return nestAssetsDir;
  }

  private async loadAllData(): Promise<void> {
    try {
      const dataDir = this.getDataDir();

      // 병렬로 모든 JSON 파일 로드
      const [점수표, 학교조건, 유불리, 누백대입표, 환산인자누백] = await Promise.all([
        this.loadJsonFile<점수표Type>(path.join(dataDir, 'score-table-26-jungsi.json')),
        this.loadJsonFile<학교조건Type>(path.join(dataDir, '2509-condition.json')),
        this.loadJsonFile<유불리Type>(path.join(dataDir, '2026-jungsi-advantage.json')),
        this.loadJsonFile<누백대입표Type>(path.join(dataDir, '2026-cumulative-percentile.json')),
        this.loadJsonFile<환산인자누백Type>(path.join(dataDir, '2026-factor-percentile.json')),
      ]);

      this.점수표Data = 점수표;
      this.학교조건Data = 학교조건;
      this.유불리Data = 유불리;
      this.누백대입표Data = 누백대입표;
      this.환산인자누백Data = 환산인자누백;
      this.dataLoaded = true;

      this.logger.log(`점수표 로드: ${Object.keys(this.점수표Data).length}개 과목`);
      this.logger.log(`학교조건 로드: ${Object.keys(this.학교조건Data).length}개 학교`);
      this.logger.log(`유불리 로드: ${Object.keys(this.유불리Data).length}개 시트`);
      this.logger.log(`누백대입표 로드: ${Object.keys(this.누백대입표Data).length}개 항목`);
      this.logger.log(`환산인자누백 로드: ${this.환산인자누백Data.factors.length}개 환산인자`);
    } catch (error) {
      this.logger.error('데이터 로드 실패:', error);
      throw error;
    }
  }

  private async loadJsonFile<T>(filePath: string): Promise<T> {
    try {
      const content = await fs.promises.readFile(filePath, 'utf-8');
      return JSON.parse(content) as T;
    } catch (error) {
      this.logger.error(`파일 로드 실패: ${filePath}`, error);
      throw new Error(`JSON 파일 로드 실패: ${filePath}`);
    }
  }

  /**
   * 점수표 데이터 반환
   */
  async get점수표(): Promise<점수표Type> {
    await this.ensureDataLoaded();
    if (!this.점수표Data) {
      throw new Error('점수표 데이터가 로드되지 않았습니다');
    }
    return this.점수표Data;
  }

  /**
   * 학교조건 데이터 반환
   */
  async get학교조건(): Promise<학교조건Type> {
    await this.ensureDataLoaded();
    if (!this.학교조건Data) {
      throw new Error('학교조건 데이터가 로드되지 않았습니다');
    }
    return this.학교조건Data;
  }

  /**
   * 유불리 데이터 반환
   */
  async get유불리(): Promise<유불리Type> {
    await this.ensureDataLoaded();
    if (!this.유불리Data) {
      throw new Error('유불리 데이터가 로드되지 않았습니다');
    }
    return this.유불리Data;
  }

  /**
   * 특정 학교의 환산식 코드 조회
   */
  async get환산식코드(학교: string): Promise<number | null> {
    const 조건 = await this.get학교조건();
    return 조건[학교]?.환산식코드 ?? null;
  }

  /**
   * 모든 학교 목록 조회
   */
  async get학교목록(): Promise<string[]> {
    const 조건 = await this.get학교조건();
    return Object.keys(조건);
  }

  /**
   * 누백대입표 데이터 반환
   */
  async get누백대입표(): Promise<누백대입표Type> {
    await this.ensureDataLoaded();
    if (!this.누백대입표Data) {
      throw new Error('누백대입표 데이터가 로드되지 않았습니다');
    }
    return this.누백대입표Data;
  }

  /**
   * 표점합으로 누적백분위 조회
   * @param 표점합 국어+수학+탐구상위2개 표준점수 합
   * @returns 나의 누적백분위 (상위 %)
   */
  async get누적백분위(표점합: number): Promise<number> {
    const 누백대입표 = await this.get누백대입표();

    // 표점합을 소수점 둘째 자리까지 반올림
    const roundedScore = Math.round(표점합 * 100) / 100;

    // 누백대입표의 키를 숫자로 변환하여 내림차순으로 정렬
    const sortedScores = Object.keys(누백대입표)
      .map((score) => parseFloat(score))
      .sort((a, b) => b - a);

    // 사용자의 표점합보다 작거나 같은 첫 번째 점수를 찾음
    const matchingScore = sortedScores.find((score) => roundedScore >= score);

    if (matchingScore === undefined) {
      // 사용자의 표점합이 모든 점수보다 낮은 경우 - 선형 보간 적용
      // 테이블 최솟값 (286.55 → 80%)에서 외삽
      const minScore = sortedScores[sortedScores.length - 1]; // 286.55
      const minPercentile = parseFloat(누백대입표[minScore.toFixed(2)]); // 80

      // 최솟값 미만의 점수에 대해 선형 외삽 (200점까지 99%로 수렴)
      // 286.55 → 80%, 200 → 99%
      const extrapolatedPercentile =
        minPercentile +
        ((minScore - roundedScore) / (minScore - 200)) * (99 - minPercentile);

      // 80% ~ 99% 사이로 제한
      return Math.min(99, Math.max(minPercentile, extrapolatedPercentile));
    }

    // 찾은 점수에 해당하는 백분위를 반환
    const scoreKey = matchingScore.toFixed(2);
    const percentile = parseFloat(누백대입표[scoreKey]);
    return percentile;
  }

  /**
   * 환산인자누백 데이터 반환
   */
  async get환산인자누백(): Promise<환산인자누백Type> {
    await this.ensureDataLoaded();
    if (!this.환산인자누백Data) {
      throw new Error('환산인자누백 데이터가 로드되지 않았습니다');
    }
    return this.환산인자누백Data;
  }

  /**
   * 표점합으로 환산인자별 누적백분위 조회
   * @param 표점합 국어+수학+탐구상위2개 표준점수 합
   * @param 환산인자 환산인자명 (예: "가천의학")
   * @returns 해당 환산인자의 누적백분위, null이면 조회 실패
   */
  async get환산인자별누백(표점합: number, 환산인자: string): Promise<number | null> {
    const 환산인자누백 = await this.get환산인자누백();

    // 표점합을 소수점 둘째 자리까지 반올림
    const roundedScore = Math.round(표점합 * 100) / 100;

    // 데이터의 키를 숫자로 변환하여 내림차순으로 정렬
    const sortedScores = Object.keys(환산인자누백.data)
      .map((score) => parseFloat(score))
      .sort((a, b) => b - a);

    // 사용자의 표점합보다 작거나 같은 첫 번째 점수를 찾음
    const matchingScore = sortedScores.find((score) => roundedScore >= score);

    if (matchingScore === undefined) {
      return null; // 표점합이 범위 밖
    }

    const scoreKey = matchingScore.toFixed(2);
    const factorData = 환산인자누백.data[scoreKey];

    if (!factorData) {
      return null;
    }

    // 환산인자명에서 공백 제거하여 매칭
    const cleanFactor = 환산인자.replace(/\s+/g, '');
    const factorValue = factorData[환산인자] ?? factorData[cleanFactor];

    if (factorValue === undefined) {
      return null;
    }

    return typeof factorValue === 'number' ? factorValue : null;
  }

  /**
   * 표점합으로 모든 환산인자의 누적백분위 조회
   * @param 표점합 국어+수학+탐구상위2개 표준점수 합
   * @returns { 환산인자명: 누백값 } 맵
   */
  async get모든환산인자누백(표점합: number): Promise<Record<string, number>> {
    const 환산인자누백 = await this.get환산인자누백();

    // 표점합을 소수점 둘째 자리까지 반올림
    const roundedScore = Math.round(표점합 * 100) / 100;

    // 데이터의 키를 숫자로 변환하여 내림차순으로 정렬
    const sortedScores = Object.keys(환산인자누백.data)
      .map((score) => parseFloat(score))
      .sort((a, b) => b - a);

    // 사용자의 표점합보다 작거나 같은 첫 번째 점수를 찾음
    const matchingScore = sortedScores.find((score) => roundedScore >= score);

    if (matchingScore === undefined) {
      return {}; // 표점합이 범위 밖
    }

    const scoreKey = matchingScore.toFixed(2);
    const factorData = 환산인자누백.data[scoreKey];

    if (!factorData) {
      return {};
    }

    // 환산인자별 누백 맵 생성 (누백 키 제외)
    const result: Record<string, number> = {};
    for (const [key, value] of Object.entries(factorData)) {
      if (key !== '누백' && typeof value === 'number') {
        result[key] = value;
      }
    }

    return result;
  }

  /**
   * 데이터 리로드 (관리자용)
   */
  async reloadData(): Promise<void> {
    this.dataLoaded = false;
    this.점수표Data = null;
    this.학교조건Data = null;
    this.유불리Data = null;
    this.누백대입표Data = null;
    this.환산인자누백Data = null;
    await this.ensureDataLoaded();
    this.logger.log('데이터 리로드 완료');
  }
}
