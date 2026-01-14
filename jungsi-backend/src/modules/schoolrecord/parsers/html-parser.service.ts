/**
 * School Record HTML Parser Service
 *
 * NEIS HTML 형식 학생부 파싱 서비스
 * cheerio를 사용하여 HTML을 파싱
 */

import { Injectable, Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';
import {
  SubjectCodeMapping,
  ParsedSubjectLearning,
  ParsedSelectSubject,
  ParsedVolunteer,
  ParsedSchoolRecord,
  DEFAULT_MAIN_SUBJECT_CODE,
  DEFAULT_SUBJECT_CODE_LEARNING,
  DEFAULT_SUBJECT_CODE_SELECT,
} from './schoolrecord-parser.types';

@Injectable()
export class SchoolRecordHtmlParserService {
  private readonly logger = new Logger(SchoolRecordHtmlParserService.name);

  /**
   * HTML에서 모든 학생부 데이터 파싱
   */
  parseAll(
    htmlContent: string,
    subjectCodeMappings: SubjectCodeMapping[] = [],
  ): ParsedSchoolRecord {
    try {
      const $ = cheerio.load(htmlContent);
      const { mainMappingTable, mappingTable } = this.buildMappingTables(subjectCodeMappings);

      const subjectLearnings = this.parseSubjectLearning($, mainMappingTable, mappingTable);
      const selectSubjects = this.parseSelectSubject($, mainMappingTable, mappingTable);
      const volunteers = this.parseVolunteer($);

      return { subjectLearnings, selectSubjects, volunteers };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('HTML 파싱 오류:', error);
      throw new Error(`나이스 홈페이지에서 다운받은 HTML 양식으로 업로드해주세요. ${message}`);
    }
  }

  /**
   * 과목 코드 매핑 테이블 생성
   */
  private buildMappingTables(subjectCodeMappings: SubjectCodeMapping[]): {
    mainMappingTable: Map<string, string>;
    mappingTable: Map<string, string>;
  } {
    const mainMappingTable = new Map<string, string>();
    const mappingTable = new Map<string, string>();

    for (const item of subjectCodeMappings) {
      const mainKey = item.mainSubjectName.replace(/\s/g, '');
      mainMappingTable.set(mainKey, item.mainSubjectCode.trim());

      const subKey = item.subjectName.replace(/\s/g, '');
      mappingTable.set(subKey, item.subjectCode.trim());
    }

    return { mainMappingTable, mappingTable };
  }

  /**
   * 교과학습발달상황 (일반교과목) 파싱
   */
  private parseSubjectLearning(
    $: cheerio.CheerioAPI,
    mainMappingTable: Map<string, string>,
    mappingTable: Map<string, string>,
  ): ParsedSubjectLearning[] {
    const result: ParsedSubjectLearning[] = [];

    // 가능한 요소 ID 목록 시도
    const possibleIds = [
      ['pr_id_17', 'pr_id_21', 'pr_id_25'],
      ['pr_id_43', 'pr_id_47', 'pr_id_51'],
      ['pr_id_69', 'pr_id_73', 'pr_id_77'],
    ];

    let idList: string[] = [];
    for (const ids of possibleIds) {
      if ($(`#${ids[0]}`).length > 0) {
        idList = ids;
        break;
      }
    }

    if (idList.length === 0) {
      this.logger.warn('교과학습발달상황 테이블을 찾을 수 없습니다');
      return result;
    }

    let grade = 1;
    for (const id of idList) {
      const div = $(`#${id}`);
      const tbody = div.find('tbody');

      tbody.find('tr').each((_, tr) => {
        const tds = $(tr).children('td');

        tds.each((__, td) => {
          const children = $(td).children();
          const semester = $(children.get(0)).text().trim();

          if (!semester) return;

          const mainSubjectNameRaw = $(children.get(1)).text().trim();
          const mainSubjectName = mainSubjectNameRaw.replace(/\s/g, '');
          const mainSubjectCode =
            mainMappingTable.get(mainSubjectName) || DEFAULT_MAIN_SUBJECT_CODE;

          const subjectNameRaw = $(children.get(2)).text().trim();
          const subjectName = subjectNameRaw.replace(/\s/g, '');
          const subjectCode = mappingTable.get(subjectName) || DEFAULT_SUBJECT_CODE_LEARNING;

          const unit = $(children.get(3)).text().trim();

          // 원점수/과목평균(표준편차) 형식 파싱: 65/66.6(18.1)
          const scoreText = $(children.get(4)).text().trim();
          let rawScore = '';
          let subSubjectAverage = '';
          let standardDeviation = '';

          if (scoreText) {
            const parts = scoreText.split('/');
            if (parts.length >= 2) {
              rawScore = parts[0];
              const avgParts = parts[1].split('(');
              subSubjectAverage = avgParts[0];
              if (avgParts.length >= 2) {
                standardDeviation = avgParts[1].replace(')', '');
              }
            }
          }

          // 성취도(수강자수) 형식 파싱: B(324) 또는 P
          const achievementText = $(children.get(5)).text().trim();
          let achievement = 'P';
          let studentsNum = '';

          if (achievementText !== 'P') {
            const achParts = achievementText.split('(');
            achievement = achParts[0];
            if (achParts.length >= 2) {
              studentsNum = achParts[1].replace(')', '');
            }
          }

          const ranking = $(children.get(6)).text().trim();
          const etc = $(children.get(7)).text().trim();

          result.push({
            grade: String(grade),
            semester,
            mainSubjectCode,
            mainSubjectName,
            subjectCode,
            subjectName,
            unit,
            rawScore,
            subSubjectAverage,
            standardDeviation,
            achievement,
            studentsNum,
            ranking,
            etc,
          });
        });
      });

      grade++;
    }

    return result;
  }

  /**
   * 진로선택과목 파싱
   */
  private parseSelectSubject(
    $: cheerio.CheerioAPI,
    mainMappingTable: Map<string, string>,
    mappingTable: Map<string, string>,
  ): ParsedSelectSubject[] {
    const result: ParsedSelectSubject[] = [];

    // 가능한 요소 ID 목록 시도
    const possibleIds = [
      ['pr_id_31', 'pr_id_33', 'pr_id_35'],
      ['pr_id_57', 'pr_id_59', 'pr_id_61'],
      ['pr_id_83', 'pr_id_85', 'pr_id_87'],
    ];

    let idList: string[] = [];
    for (const ids of possibleIds) {
      if ($(`#${ids[0]}`).length > 0) {
        idList = ids;
        break;
      }
    }

    if (idList.length === 0) {
      this.logger.warn('진로선택과목 테이블을 찾을 수 없습니다');
      return result;
    }

    let grade = 1;
    for (const id of idList) {
      const div = $(`#${id}`);
      const tbody = div.find('tbody');

      tbody.find('tr').each((_, tr) => {
        const tds = $(tr).children('td');

        tds.each((__, td) => {
          const children = $(td).children();
          const semester = $(children.get(0)).text().trim();

          if (!semester) return;

          const mainSubjectNameRaw = $(children.get(1)).text().trim();
          const mainSubjectName = mainSubjectNameRaw.replace(/\s/g, '');
          const mainSubjectCode =
            mainMappingTable.get(mainSubjectName) || DEFAULT_MAIN_SUBJECT_CODE;

          const subjectNameRaw = $(children.get(2)).text().trim();
          const subjectName = subjectNameRaw.replace(/\s/g, '');
          const subjectCode = mappingTable.get(subjectName) || DEFAULT_SUBJECT_CODE_SELECT;

          const unit = $(children.get(3)).text().trim();

          // 원점수/과목평균 형식 파싱: 65/66.6
          const scoreText = $(children.get(4)).text().trim();
          let rawScore = '';
          let subSubjectAverage = '';

          if (scoreText) {
            const parts = scoreText.split('/');
            if (parts.length >= 2) {
              rawScore = parts[0];
              subSubjectAverage = parts[1];
            }
          }

          // 성취도(수강자수) 형식 파싱: B(324)
          const achievementText = $(children.get(5)).text().trim();
          const achParts = achievementText.split('(');
          const achievement = achParts[0];
          const studentsNum = achParts.length >= 2 ? achParts[1].replace(')', '') : '';

          // 성취도별 분포비율 형식 파싱: A(24.1) B(44.9) C(31.0)
          const distributionText = $(children.get(6)).text().trim();
          const distributionParts = distributionText.split(' ');

          let achievementA = '';
          let achievementB = '';
          let achievementC = '';

          if (distributionParts.length >= 3) {
            achievementA = this.extractPercentage(distributionParts[0]);
            achievementB = this.extractPercentage(distributionParts[1]);
            achievementC = this.extractPercentage(distributionParts[2]);
          }

          const etc = $(children.get(7)).text().trim();

          result.push({
            grade: String(grade),
            semester,
            mainSubjectCode,
            mainSubjectName,
            subjectCode,
            subjectName,
            unit,
            rawScore,
            subSubjectAverage,
            achievement,
            studentsNum,
            achievementA,
            achievementB,
            achievementC,
            etc,
          });
        });
      });

      grade++;
    }

    return result;
  }

  /**
   * 봉사활동실적 파싱
   */
  private parseVolunteer($: cheerio.CheerioAPI): ParsedVolunteer[] {
    const result: ParsedVolunteer[] = [];

    // 가능한 요소 ID 목록 시도
    const possibleIds = ['pr_id_16', 'pr_id_42', 'pr_id_68'];
    let div: ReturnType<cheerio.CheerioAPI> | null = null;

    for (const id of possibleIds) {
      const element = $(`#${id}`);
      if (element.length > 0) {
        div = element;
        break;
      }
    }

    if (!div) {
      this.logger.warn('봉사활동실적 테이블을 찾을 수 없습니다');
      return result;
    }

    const tbody = div.find('tbody');
    let currentGrade = '';

    tbody.find('tr').each((_, tr) => {
      const tds = $(tr).children('td');

      tds.each((__, td) => {
        const children = $(td).children();
        const childCount = children.length;

        if (childCount === 6) {
          currentGrade = $(children.get(0)).text().trim();
          const date = $(children.get(1)).text().trim();
          const place = $(children.get(2)).text().trim();
          const activityContent = $(children.get(3)).text().trim();
          const activityTime = $(children.get(4)).text().trim();
          const accumulateTime = $(children.get(5)).text().trim();

          result.push({
            grade: currentGrade,
            date,
            place,
            activityContent,
            activityTime,
            accumulateTime,
          });
        } else if (childCount === 5) {
          const date = $(children.get(0)).text().trim();
          const place = $(children.get(1)).text().trim();
          const activityContent = $(children.get(2)).text().trim();
          const activityTime = $(children.get(3)).text().trim();
          const accumulateTime = $(children.get(4)).text().trim();

          result.push({
            grade: currentGrade,
            date,
            place,
            activityContent,
            activityTime,
            accumulateTime,
          });
        }
      });
    });

    return result;
  }

  /**
   * "A(24.1)" 형식에서 백분율 추출
   */
  private extractPercentage(text: string): string {
    const match = text.match(/\(([^)]+)\)/);
    return match ? match[1] : '';
  }
}
