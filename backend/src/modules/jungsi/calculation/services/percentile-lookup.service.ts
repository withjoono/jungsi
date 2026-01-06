import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 상위누적백분위 조회 서비스
 * - 대학별 환산점수 → 상위누적백분위 변환
 * - JSON 데이터 파일 기반 조회
 */
@Injectable()
export class PercentileLookupService implements OnModuleInit {
  private readonly logger = new Logger(PercentileLookupService.name);

  // 데이터 구조: { "대학명 이과/문과": [[백분위, 환산점수], ...] }
  private lookupTable: Record<string, [number, number][]> | null = null;

  async onModuleInit() {
    await this.loadLookupTable();
  }

  /**
   * 백분위 조회 테이블 로드
   */
  private async loadLookupTable(): Promise<void> {
    if (this.lookupTable) return;

    try {
      // nest-cli.json assets에 의해 dist/modules/... 에 복사됨
      const filePath = path.join(
        process.cwd(),
        'dist/modules/jungsi/calculation/data/percentile-lookup.json',
      );
      const data = fs.readFileSync(filePath, 'utf8');
      this.lookupTable = JSON.parse(data);
      this.logger.log(
        `백분위 조회 테이블 로드 완료: ${Object.keys(this.lookupTable).length}개 대학`,
      );
    } catch (error) {
      this.logger.error('백분위 조회 테이블 로드 실패:', error);
      this.lookupTable = {};
    }
  }

  /**
   * 환산점수로 상위누적백분위 조회
   * @param univKey 대학 키 (예: "가천의학 이과")
   * @param convertedScore 환산점수
   * @returns 상위누적백분위 (0-100), null이면 조회 실패
   */
  findPercentile(univKey: string, convertedScore: number): number | null {
    if (!this.lookupTable) {
      this.logger.warn('백분위 조회 테이블이 로드되지 않음');
      return null;
    }

    const table = this.lookupTable[univKey];
    if (!table || table.length === 0) {
      // 대학 키가 없으면 다양한 패턴으로 재시도
      const altKeys = this.getAlternativeKeys(univKey);
      for (const altKey of altKeys) {
        const altTable = this.lookupTable[altKey];
        if (altTable && altTable.length > 0) {
          return this.searchPercentile(altTable, convertedScore);
        }
      }
      return null;
    }

    return this.searchPercentile(table, convertedScore);
  }

  /**
   * 백분위 테이블에서 환산점수에 해당하는 백분위 검색
   * - 백분위 오름차순 정렬된 테이블에서 환산점수 >= 테이블 점수인 첫 행의 백분위 반환
   * - 상위누적백분위: 낮은 값 = 상위권
   */
  private searchPercentile(table: [number, number][], convertedScore: number): number {
    // table: [[백분위, 환산점수], ...] - 백분위 오름차순
    // 환산점수가 해당 행의 점수보다 높거나 같으면 해당 백분위
    for (let i = 0; i < table.length; i++) {
      const [percentile, scoreThreshold] = table[i];
      if (convertedScore >= scoreThreshold) {
        return percentile;
      }
    }

    // 모든 점수보다 낮으면 100% (하위권)
    return 100;
  }

  /**
   * 대학 키에 대한 대체 키 생성
   * 예: "가천의학" → ["가천의학 이과", "가천의학 문과"]
   */
  private getAlternativeKeys(univKey: string): string[] {
    const keys: string[] = [];

    // 이미 이과/문과가 포함되어 있으면 반대도 추가
    if (univKey.includes('이과')) {
      keys.push(univKey.replace('이과', '문과'));
    } else if (univKey.includes('문과')) {
      keys.push(univKey.replace('문과', '이과'));
    } else {
      // 이과/문과 없으면 둘 다 추가
      keys.push(`${univKey} 이과`);
      keys.push(`${univKey} 문과`);
    }

    return keys;
  }

  /**
   * 대학명과 계열로 조회 키 생성
   * @param universityName 대학명 (예: "가천대학교")
   * @param recruitmentName 모집단위명 (예: "의학과")
   * @param majorType 계열 (예: "이과" 또는 "자연")
   */
  buildLookupKey(universityName: string, recruitmentName: string, majorType: string): string {
    // 대학명 정리 (대학교 → 공백으로)
    const cleanUnivName = universityName.replace(/대학교$/, '').replace(/대학$/, '');

    // 계열 정리
    const cleanMajor = majorType === '자연' || majorType === '이공' ? '이과' : '문과';

    // 모집단위명에서 학과 제거
    const cleanRecruitment = recruitmentName
      .replace(/학과$/, '')
      .replace(/부$/, '')
      .replace(/전공$/, '');

    // 조합: "가천의학 이과"
    return `${cleanUnivName}${cleanRecruitment} ${cleanMajor}`;
  }

  /**
   * 사용 가능한 대학 키 목록 조회
   */
  getAvailableUniversities(): string[] {
    if (!this.lookupTable) return [];
    return Object.keys(this.lookupTable);
  }

  /**
   * 특정 대학 키가 존재하는지 확인
   */
  hasUniversity(univKey: string): boolean {
    if (!this.lookupTable) return false;
    return !!this.lookupTable[univKey];
  }
}
