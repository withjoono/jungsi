/**
 * School Record PDF Parser Service
 *
 * PDF 형식 학생부 파싱 서비스 (졸업생용)
 * pdf-parse를 사용하여 PDF를 파싱
 */

import { Injectable, Logger } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
const pdfParse = require('pdf-parse');
import {
  SubjectCodeMapping,
  ParsedSubjectLearning,
  ParsedSelectSubject,
  ParsedSchoolRecordPdf,
  SUBJECT_LIST,
  DEFAULT_MAIN_SUBJECT_CODE,
  DEFAULT_SUBJECT_CODE_LEARNING,
  DEFAULT_SUBJECT_CODE_SELECT,
} from './schoolrecord-parser.types';

@Injectable()
export class SchoolRecordPdfParserService {
  private readonly logger = new Logger(SchoolRecordPdfParserService.name);

  /**
   * PDF 버퍼에서 학생부 데이터 파싱
   */
  async parse(
    pdfBuffer: Buffer,
    subjectCodeMappings: SubjectCodeMapping[] = [],
  ): Promise<ParsedSchoolRecordPdf> {
    try {
      const { mainMappingTable, mappingTable } = this.buildMappingTables(subjectCodeMappings);

      const data = await pdfParse(pdfBuffer);
      const extractText = data.text.replace(/\n/g, ' ');

      const normalIndex = ['[1학년]', '[2학년]', '[3학년]'];

      // 파싱된 데이터 저장 리스트
      const normalResultList: string[][] = [];
      const selectResultList: string[][] = [];

      let normalSubjectInfoList: string[] = [];
      let selectSubjectInfoList: string[] = [];

      let grade = 1;

      // 각 학년 데이터 파싱
      for (const gradeMarker of normalIndex) {
        const first = extractText.indexOf(gradeMarker);
        if (first === -1) continue;

        const textFromGrade = extractText.substring(first);
        const lastIndex = textFromGrade.indexOf('이수단위 합계');
        if (lastIndex === -1) continue;

        const gradeData = textFromGrade.substring(0, lastIndex).replace(/\r/g, '').split(' ');

        let isSubject = false;
        let semester = '';
        let tempSemester = '';
        let selectSemester = '';
        let selectTempSemester = '';

        // 이전 학년 데이터가 있으면 저장
        if (normalSubjectInfoList.length !== 0) {
          normalSubjectInfoList.push(String(grade));
          normalSubjectInfoList.push('2');
          normalResultList.push([...normalSubjectInfoList]);
          normalSubjectInfoList = [];
          semester = '';
          tempSemester = '';

          if (selectSubjectInfoList.length !== 0) {
            selectSubjectInfoList.push(String(grade));
            selectSubjectInfoList.push('2');
            selectResultList.push([...selectSubjectInfoList]);
            selectSubjectInfoList = [];
            selectSemester = '';
            selectTempSemester = '';
          }

          grade++;
        }

        // 일반 교과목 파싱
        for (let j = 0; j < gradeData.length; j++) {
          if (SUBJECT_LIST.includes(gradeData[j]) && gradeData[j] !== '2') {
            // 복합 과목명 확인
            let checkCompound = '';
            let realSubjectName = '';

            for (let g = j; g < Math.min(j + 3, gradeData.length); g++) {
              checkCompound += gradeData[g];
              if (SUBJECT_LIST.includes(checkCompound.replace(/\n/g, '').replace(/ /g, ''))) {
                realSubjectName += gradeData[g];
                j++;
              } else {
                if (normalSubjectInfoList.length !== 0) {
                  normalSubjectInfoList.push(String(grade));
                  normalSubjectInfoList.push(tempSemester === '' ? '1' : semester);
                  normalResultList.push([...normalSubjectInfoList]);
                }
                tempSemester = semester;
                normalSubjectInfoList = [realSubjectName];
                isSubject = true;
                break;
              }
            }
          }

          if (isSubject) {
            // 과목 상세 정보 파싱
            let subSubject = '';
            while (j < gradeData.length) {
              if (['1', '2', '3', '4', '5'].includes(gradeData[j])) {
                j--;
                break;
              } else {
                subSubject += gradeData[j];
              }
              j++;
            }

            normalSubjectInfoList.push(subSubject);

            // 학기 정보 확인
            if (
              j + 4 < gradeData.length &&
              (gradeData[j + 3] === 'P' || gradeData[j] === '과학탐구실험') &&
              ['1', '2'].includes(gradeData[j + 4])
            ) {
              semester = gradeData[j + 4];
            }
            if (j + 5 < gradeData.length && ['1', '2'].includes(gradeData[j + 5])) {
              semester = gradeData[j + 5];
            }

            let k = 5;
            let tempIndex = 1;

            while (tempIndex < k) {
              j++;
              if (j >= gradeData.length) break;
              if (gradeData[j] === '반') {
                isSubject = false;
                break;
              }
              if (gradeData[j] === 'P' || subSubject === '과학탐구실험') {
                k = 4;
              }
              normalSubjectInfoList.push(gradeData[j]);
              tempIndex++;
            }
            isSubject = false;
          }
        }

        // 진로선택과목 파싱
        const selectFirst = textFromGrade.indexOf('<진로 선택 과목>');
        if (selectFirst !== -1) {
          const selectTextFromMarker = textFromGrade.substring(selectFirst);
          const selectLastIndex = selectTextFromMarker.indexOf('이수단위 합계');
          if (selectLastIndex !== -1) {
            const selectData = selectTextFromMarker
              .substring(0, selectLastIndex)
              .replace(/\r/g, '')
              .split(' ');

            for (let j = 0; j < selectData.length; j++) {
              if (SUBJECT_LIST.includes(selectData[j]) && selectData[j] !== '2') {
                // 복합 과목명 확인
                let checkCompound = '';
                let realSubjectName = '';

                for (let g = j; g < Math.min(j + 3, selectData.length); g++) {
                  checkCompound += selectData[g];
                  if (SUBJECT_LIST.includes(checkCompound.replace(/\n/g, '').replace(/ /g, ''))) {
                    realSubjectName += selectData[g];
                    j++;
                  } else {
                    if (selectSubjectInfoList.length !== 0) {
                      selectSubjectInfoList.push(String(grade));
                      selectSubjectInfoList.push(selectTempSemester === '' ? '1' : selectSemester);
                      selectResultList.push([...selectSubjectInfoList]);
                    }
                    selectTempSemester = selectSemester;
                    selectSubjectInfoList = [realSubjectName];
                    isSubject = true;
                    break;
                  }
                }
              }

              if (isSubject) {
                // 과목 상세 정보 파싱
                let subSubject = '';
                while (j < selectData.length) {
                  if (['1', '2', '3', '4', '5'].includes(selectData[j])) {
                    j--;
                    break;
                  } else {
                    subSubject += selectData[j];
                  }
                  j++;
                }

                selectSubjectInfoList.push(subSubject);

                // 학기 정보 확인
                if (j + 7 < selectData.length && ['1', '2'].includes(selectData[j + 7])) {
                  selectSemester = selectData[j + 7];
                }

                let k = 7;
                let tempIndex = 1;

                while (tempIndex < k) {
                  j++;
                  if (j >= selectData.length) break;
                  if (selectData[j] === '반') {
                    isSubject = false;
                    break;
                  }
                  if (selectData[j] === 'P') {
                    k = 4;
                  }
                  selectSubjectInfoList.push(selectData[j]);
                  tempIndex++;
                }
                isSubject = false;
              }
            }
          }
        }
      }

      // 마지막 학년 데이터 저장
      if (normalSubjectInfoList.length !== 0) {
        normalSubjectInfoList.push(String(grade));
        normalSubjectInfoList.push('2');
        normalResultList.push([...normalSubjectInfoList]);

        if (selectSubjectInfoList.length !== 0) {
          selectSubjectInfoList.push(String(grade));
          selectSubjectInfoList.push('2');
          selectResultList.push([...selectSubjectInfoList]);
        }
      }

      // 엔티티 형식으로 변환
      const subjectLearnings = this.convertToSubjectLearning(
        normalResultList,
        mainMappingTable,
        mappingTable,
      );
      const selectSubjects = this.convertToSelectSubject(
        selectResultList,
        mainMappingTable,
        mappingTable,
      );

      // 데이터 검증
      for (const item of subjectLearnings) {
        if (!mainMappingTable.has(item.mainSubjectName)) {
          this.logger.warn(`Unknown main subject: ${item.mainSubjectName}, using default code`);
        }
      }

      for (const item of selectSubjects) {
        if (!mainMappingTable.has(item.mainSubjectName)) {
          this.logger.warn(`Unknown main subject: ${item.mainSubjectName}, using default code`);
        }
      }

      return { subjectLearnings, selectSubjects };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('PDF 파싱 오류:', error);
      throw new Error(`정상적인 PDF 양식으로 업로드해주세요. ${message}`);
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
   * 파싱된 데이터를 SubjectLearning 형식으로 변환
   *
   * 데이터 형식: (교과, 과목, 단위수, 원점수/과목평균(표준편차), 성취도(수강자수), 석차등급, 학년, 학기)
   */
  private convertToSubjectLearning(
    dataList: string[][],
    mainMappingTable: Map<string, string>,
    mappingTable: Map<string, string>,
  ): ParsedSubjectLearning[] {
    const result: ParsedSubjectLearning[] = [];

    for (const data of dataList) {
      if (data.length < 7) continue;

      const mainSubjectNameRaw = data[0].replace(/\s/g, '');
      const mainSubjectCode = mainMappingTable.get(mainSubjectNameRaw) || DEFAULT_MAIN_SUBJECT_CODE;

      const subjectNameRaw = data[1].replace(/\s/g, '');
      const subjectCode = mappingTable.get(subjectNameRaw) || DEFAULT_SUBJECT_CODE_LEARNING;

      const unit = data[2].trim();
      let rawScore = '';
      let subSubjectAverage = '';
      let standardDeviation = '';
      let achievement = 'P';
      let studentsNum = '';
      let ranking = '';
      let grade = '';
      let semester = '';

      if (data.length === 7) {
        // P 등급이거나 과학탐구실험인 경우
        if (subjectNameRaw === '과학탐구실험') {
          // 원점수/과목평균(표준편차) 파싱
          if (data[3]) {
            const parts = data[3].split('/');
            if (parts.length >= 2) {
              rawScore = parts[0];
              const avgParts = parts[1].split('(');
              subSubjectAverage = avgParts[0];
              if (avgParts.length >= 2) {
                standardDeviation = avgParts[1].replace(')', '');
              }
            }
          }
          // 성취도(수강자수) 파싱
          const achParts = data[4].split('(');
          achievement = achParts[0];
          studentsNum = achParts.length >= 2 ? achParts[1].replace(')', '') : '';

          grade = data[5];
          semester = data[6];
        } else {
          achievement = data[3];
          ranking = data[4];
          grade = data[5];
          semester = data[6];
        }
      } else {
        // 전체 데이터 케이스
        // 원점수/과목평균(표준편차) 파싱
        if (data[3]) {
          const parts = data[3].split('/');
          if (parts.length >= 2) {
            rawScore = parts[0];
            const avgParts = parts[1].split('(');
            subSubjectAverage = avgParts[0];
            if (avgParts.length >= 2) {
              standardDeviation = avgParts[1].replace(')', '');
            }
          }
        }
        // 성취도(수강자수) 파싱
        const achParts = data[4].split('(');
        achievement = achParts[0];
        studentsNum = achParts.length >= 2 ? achParts[1].replace(')', '') : '';

        ranking = data[5];
        grade = data[6];
        semester = data[7];
      }

      result.push({
        grade,
        semester,
        mainSubjectCode,
        mainSubjectName: mainSubjectNameRaw,
        subjectCode,
        subjectName: subjectNameRaw,
        unit,
        rawScore,
        subSubjectAverage,
        standardDeviation,
        achievement,
        studentsNum,
        ranking,
        etc: '',
      });
    }

    return result;
  }

  /**
   * 파싱된 데이터를 SelectSubject 형식으로 변환
   *
   * 데이터 형식: (교과, 과목, 단위수, 원점수/과목평균, 성취도(수강자수), A분포, B분포, C분포, 학년, 학기)
   */
  private convertToSelectSubject(
    dataList: string[][],
    mainMappingTable: Map<string, string>,
    mappingTable: Map<string, string>,
  ): ParsedSelectSubject[] {
    const result: ParsedSelectSubject[] = [];

    for (const data of dataList) {
      if (data.length < 10) continue;

      const mainSubjectNameRaw = data[0].replace(/\s/g, '');
      const mainSubjectCode = mainMappingTable.get(mainSubjectNameRaw) || DEFAULT_MAIN_SUBJECT_CODE;

      const subjectNameRaw = data[1].replace(/\s/g, '');
      const subjectCode = mappingTable.get(subjectNameRaw) || DEFAULT_SUBJECT_CODE_SELECT;

      const unit = data[2];

      // 원점수/과목평균 파싱
      let rawScore = '';
      let subSubjectAverage = '';
      const scoreParts = data[3].split('/');
      if (scoreParts.length >= 2) {
        rawScore = scoreParts[0];
        subSubjectAverage = scoreParts[1];
      }

      // 성취도(수강자수) 파싱
      const achParts = data[4].split('(');
      const achievement = achParts[0];
      const studentsNum = achParts.length >= 2 ? achParts[1].replace(')', '') : '';

      // 성취도 분포 파싱
      const achievementA = this.extractPercentage(data[5]);
      const achievementB = this.extractPercentage(data[6]);
      const achievementC = this.extractPercentage(data[7]);

      const grade = data[8];
      const semester = data[9];

      result.push({
        grade,
        semester,
        mainSubjectCode,
        mainSubjectName: mainSubjectNameRaw,
        subjectCode,
        subjectName: subjectNameRaw,
        unit,
        rawScore,
        subSubjectAverage,
        achievement,
        studentsNum,
        achievementA,
        achievementB,
        achievementC,
        etc: '',
      });
    }

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
