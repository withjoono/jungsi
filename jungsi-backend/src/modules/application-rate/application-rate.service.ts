import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';
import * as cheerio from 'cheerio';
import iconv from 'iconv-lite';

import { ApplicationRate } from './entities/application-rate.entity';
import { ApplicationRateHistory } from './entities/application-rate-history.entity';
import {
  ApplicationRateResponseDto,
  ApplicationRateChangeDto,
  GetApplicationRateQueryDto,
} from './dto/application-rate.dto';
import {
  CrawlSource,
  CRAWL_SOURCES,
  getActiveCrawlSources,
  findCrawlSourceByCode,
} from './data/crawl-sources';

interface ParsedRateData {
  departmentName: string;
  admissionType: string;
  recruitmentCount: number;
  applicationCount: number;
  competitionRate: number;
}

@Injectable()
export class ApplicationRateService {
  private readonly logger = new Logger(ApplicationRateService.name);

  // 크롤링 대상 URL 목록 (183개 대학 - data/crawl-sources.ts에서 관리)
  private readonly crawlSources: CrawlSource[] = CRAWL_SOURCES;

  constructor(
    @InjectRepository(ApplicationRate)
    private readonly applicationRateRepository: Repository<ApplicationRate>,
    @InjectRepository(ApplicationRateHistory)
    private readonly historyRepository: Repository<ApplicationRateHistory>,
  ) {}

  /**
   * 5분마다 크롤링 실행 (현재 비활성화됨)
   * 크롤링을 재개하려면 @Cron 데코레이터 주석을 해제하세요
   */
  // @Cron(CronExpression.EVERY_5_MINUTES)
  async scheduledCrawl(): Promise<void> {
    this.logger.log('Starting scheduled crawl for application rates...');

    for (const source of this.crawlSources) {
      if (!source.isActive) continue;

      try {
        await this.crawlAndSave(source);
        this.logger.log(`Successfully crawled: ${source.universityName}`);
      } catch (error) {
        this.logger.error(`Failed to crawl ${source.universityName}: ${error.message}`);
      }
    }
  }

  /**
   * 특정 대학 크롤링 및 저장
   */
  async crawlAndSave(source: CrawlSource): Promise<void> {
    const crawledAt = new Date();
    const parsedData = await this.crawlApplicationRates(source.sourceUrl);

    // 기존 데이터 조회 (변동 감지용)
    const existingRates = await this.applicationRateRepository.find({
      where: { universityCode: source.universityCode },
    });

    const existingMap = new Map<string, ApplicationRate>();
    existingRates.forEach(rate => {
      const key = `${rate.departmentName}_${rate.admissionType}`;
      existingMap.set(key, rate);
    });

    // 데이터 저장 및 변동 기록
    for (const data of parsedData) {
      const key = `${data.departmentName}_${data.admissionType}`;
      const existing = existingMap.get(key);

      if (existing) {
        // 변동이 있는 경우 히스토리 기록
        if (existing.applicationCount !== data.applicationCount) {
          await this.recordHistory(existing, data, crawledAt);
        }

        // 기존 데이터 업데이트
        await this.applicationRateRepository.update(existing.id, {
          recruitmentCount: data.recruitmentCount,
          applicationCount: data.applicationCount,
          competitionRate: data.competitionRate,
          crawledAt,
        });
      } else {
        // 새 데이터 삽입
        await this.applicationRateRepository.save({
          universityCode: source.universityCode,
          universityName: source.universityName,
          departmentName: data.departmentName,
          admissionType: data.admissionType,
          recruitmentCount: data.recruitmentCount,
          applicationCount: data.applicationCount,
          competitionRate: data.competitionRate,
          sourceUrl: source.sourceUrl,
          crawledAt,
        });
      }
    }
  }

  /**
   * 변동 히스토리 기록
   */
  private async recordHistory(
    existing: ApplicationRate,
    newData: ParsedRateData,
    recordedAt: Date,
  ): Promise<void> {
    await this.historyRepository.save({
      universityCode: existing.universityCode,
      universityName: existing.universityName,
      departmentName: existing.departmentName,
      admissionType: existing.admissionType,
      recruitmentCount: newData.recruitmentCount,
      applicationCount: newData.applicationCount,
      previousApplicationCount: existing.applicationCount,
      competitionRate: newData.competitionRate,
      previousCompetitionRate: Number(existing.competitionRate),
      changeAmount: newData.applicationCount - existing.applicationCount,
      recordedAt,
    });
  }

  /**
   * 웹 페이지 크롤링 및 파싱
   * jinhakapply.com과 uwayapply.com 모두 지원
   */
  async crawlApplicationRates(url: string): Promise<ParsedRateData[]> {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Charset': 'utf-8',
      },
      timeout: 30000,
      responseType: 'arraybuffer', // 인코딩 처리를 위해 arraybuffer로 받기
    });

    // EUC-KR 또는 UTF-8로 디코딩
    let html: string;
    const contentType = response.headers['content-type'] || '';

    if (contentType.includes('euc-kr') || contentType.includes('euc_kr')) {
      html = iconv.decode(Buffer.from(response.data), 'euc-kr');
    } else {
      // 먼저 UTF-8 시도
      html = iconv.decode(Buffer.from(response.data), 'utf-8');
      // UTF-8 디코딩이 깨진 경우 EUC-KR로 재시도
      if (html.includes('�') || html.includes('\ufffd')) {
        html = iconv.decode(Buffer.from(response.data), 'euc-kr');
      }
    }

    const $ = cheerio.load(html);
    const results: ParsedRateData[] = [];

    // 현재 전형명 추적 (전형별 섹션 구분)
    let currentAdmissionType = '';

    // 섹션 헤더에서 전형명 추출
    $('h2, .section_title, .tit_area').each((_, header) => {
      const headerText = $(header).text().trim();
      // "다군 일반학생(정원내) 경쟁률 현황" 같은 패턴에서 전형명 추출
      const match = headerText.match(/^(.+?)\s*경쟁률\s*현황/);
      if (match) {
        currentAdmissionType = match[1].trim();
      }
    });

    // 테이블 파싱
    $('table').each((_, table) => {
      // 테이블 바로 위의 헤더에서 전형명 찾기
      const prevHeader = $(table).prevAll('h2, .section_title').first().text();
      const sectionMatch = prevHeader.match(/^(.+?)\s*경쟁률\s*현황/);
      const sectionAdmissionType = sectionMatch ? sectionMatch[1].trim() : currentAdmissionType;

      $(table).find('tr').each((_, row) => {
        const cells = $(row).find('td');

        if (cells.length >= 4) {
          // 모집단위, 모집인원, 지원인원, 경쟁률 순서
          let departmentName = $(cells[0]).text().trim();
          let admissionType = sectionAdmissionType;

          // 총계 행은 건너뛰기
          if (departmentName === '총계' || departmentName === '합계' || departmentName === '소계') {
            return;
          }

          // 셀 개수에 따라 파싱 위치 조정
          let recruitmentIdx: number, applicationIdx: number, rateIdx: number;

          if (cells.length >= 5) {
            // 전형명이 포함된 경우
            const possibleType = $(cells[1]).text().trim();
            if (possibleType && !possibleType.match(/^\d/)) {
              admissionType = possibleType;
              recruitmentIdx = 2;
              applicationIdx = 3;
              rateIdx = 4;
            } else {
              recruitmentIdx = 1;
              applicationIdx = 2;
              rateIdx = 3;
            }
          } else {
            recruitmentIdx = 1;
            applicationIdx = 2;
            rateIdx = 3;
          }

          const recruitmentText = $(cells[recruitmentIdx]).text().trim().replace(/,/g, '');
          const applicationText = $(cells[applicationIdx]).text().trim().replace(/,/g, '');
          const rateText = $(cells[rateIdx]).text().trim().replace(/[:\s1]/g, '').replace(',', '');

          const recruitmentCount = parseInt(recruitmentText, 10) || 0;
          const applicationCount = parseInt(applicationText, 10) || 0;
          const competitionRate = parseFloat(rateText) || 0;

          // 유효한 데이터만 추가 (모집인원이 있거나 지원인원이 있는 경우)
          if (departmentName && (recruitmentCount > 0 || applicationCount > 0)) {
            results.push({
              departmentName,
              admissionType: admissionType || '정시',
              recruitmentCount,
              applicationCount,
              competitionRate,
            });
          }
        }
      });
    });

    return results;
  }

  /**
   * 경쟁률 데이터 조회
   */
  async getApplicationRates(query: GetApplicationRateQueryDto): Promise<ApplicationRateResponseDto[]> {
    const queryBuilder = this.applicationRateRepository.createQueryBuilder('rate');

    if (query.universityCode) {
      queryBuilder.andWhere('rate.universityCode = :code', { code: query.universityCode });
    }

    if (query.departmentName) {
      queryBuilder.andWhere('rate.departmentName LIKE :dept', { dept: `%${query.departmentName}%` });
    }

    if (query.admissionType) {
      queryBuilder.andWhere('rate.admissionType = :type', { type: query.admissionType });
    }

    queryBuilder.orderBy('rate.universityName', 'ASC');
    queryBuilder.addOrderBy('rate.competitionRate', 'DESC');

    const rates = await queryBuilder.getMany();

    // 대학별로 그룹화
    const groupedByUniversity = rates.reduce((acc, rate) => {
      if (!acc[rate.universityCode]) {
        acc[rate.universityCode] = {
          universityCode: rate.universityCode,
          universityName: rate.universityName,
          items: [],
          totalRecruitment: 0,
          totalApplication: 0,
          lastCrawledAt: rate.crawledAt,
        };
      }
      acc[rate.universityCode].items.push(rate);
      acc[rate.universityCode].totalRecruitment += rate.recruitmentCount;
      acc[rate.universityCode].totalApplication += rate.applicationCount;

      if (rate.crawledAt > acc[rate.universityCode].lastCrawledAt) {
        acc[rate.universityCode].lastCrawledAt = rate.crawledAt;
      }
      return acc;
    }, {} as Record<string, any>);

    return Object.values(groupedByUniversity).map(group => ({
      universityCode: group.universityCode,
      universityName: group.universityName,
      summary: {
        totalRecruitment: group.totalRecruitment,
        totalApplication: group.totalApplication,
        overallRate: group.totalRecruitment > 0
          ? Math.round((group.totalApplication / group.totalRecruitment) * 100) / 100
          : 0,
        lastCrawledAt: group.lastCrawledAt,
      },
      items: group.items.map(item => ({
        universityName: item.universityName,
        departmentName: item.departmentName,
        admissionType: item.admissionType,
        recruitmentCount: item.recruitmentCount,
        applicationCount: item.applicationCount,
        competitionRate: Number(item.competitionRate),
      })),
    }));
  }

  /**
   * 최근 변동 내역 조회
   */
  async getRecentChanges(
    universityCode?: string,
    limit: number = 50,
  ): Promise<ApplicationRateChangeDto[]> {
    const queryBuilder = this.historyRepository.createQueryBuilder('history');

    if (universityCode) {
      queryBuilder.andWhere('history.universityCode = :code', { code: universityCode });
    }

    queryBuilder.orderBy('history.recordedAt', 'DESC');
    queryBuilder.limit(limit);

    const histories = await queryBuilder.getMany();

    return histories.map(h => ({
      universityName: h.universityName,
      departmentName: h.departmentName,
      previousCount: h.previousApplicationCount,
      currentCount: h.applicationCount,
      changeAmount: h.changeAmount,
      previousRate: Number(h.previousCompetitionRate),
      currentRate: Number(h.competitionRate),
      recordedAt: h.recordedAt,
    }));
  }

  /**
   * 수동 크롤링 트리거
   */
  async triggerManualCrawl(universityCode?: string): Promise<{ message: string; crawledCount: number }> {
    let crawledCount = 0;

    for (const source of this.crawlSources) {
      if (universityCode && source.universityCode !== universityCode) continue;
      if (!source.isActive) continue;

      try {
        await this.crawlAndSave(source);
        crawledCount++;
        this.logger.log(`Manual crawl completed: ${source.universityName}`);
      } catch (error) {
        this.logger.error(`Manual crawl failed for ${source.universityName}: ${error.message}`);
      }
    }

    return {
      message: `Crawled ${crawledCount} universities`,
      crawledCount,
    };
  }

  /**
   * 크롤링 소스 목록 조회
   */
  getCrawlSources(): CrawlSource[] {
    return this.crawlSources;
  }

  /**
   * 특정 대학 상세 정보 조회
   */
  async getUniversityDetail(universityCode: string): Promise<ApplicationRateResponseDto | null> {
    const rates = await this.getApplicationRates({ universityCode });
    return rates.length > 0 ? rates[0] : null;
  }
}
