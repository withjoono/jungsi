import { Injectable } from '@nestjs/common';
import { CommonSearchQueryDto } from 'src/common/dtos/common-search-query.dto';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import { AdminSusiSubjectResponseDto } from '../dtos/admin-susi-subject-response.dto';
import {
  convertExcelDate,
  convertExcelTime,
  isExcelDate,
  isExcelTime,
} from 'src/common/utils/excel-utils';
import { SuSiSubjectEntity } from 'src/database/entities/susi/susi-subject.entity';
import { SusiSubjectService } from 'src/modules/susi/services/susi-subject.service';
import { subjectExcelFieldMapping } from '../excel-mapper/subject-excel-field-mapper';

@Injectable()
export class AdminSusiSubjectService {
  constructor(private readonly susiSubjectService: SusiSubjectService) {}

  async getAdminSusiSubjectList(
    commonSearchQueryDto: CommonSearchQueryDto,
  ): Promise<AdminSusiSubjectResponseDto> {
    const { list, totalCount } =
      await this.susiSubjectService.getAllSusiSubject(commonSearchQueryDto);
    return { list, totalCount };
  }

  async syncDatabaseWithExcel(filePath: string): Promise<void> {
    try {
      await this.susiSubjectService.clear();

      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0]; // 첫번째 시트 (교과)
      const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
        header: 'A',
      });

      const CHUNK_SIZE = 300; // 청크 사이즈 설정
      let chunk = [];
      let id = 1;
      for (let i = 3; i < sheet.length; i++) {
        const row = sheet[i];
        const entity = new SuSiSubjectEntity();
        entity.id = id;
        entity.interview = 0;
        ++id;

        for (const [key, value] of Object.entries(row)) {
          const columnName = subjectExcelFieldMapping[key];

          if (columnName && value !== '-') {
            let processedValue: any = value;

            if (columnName === 'interview_date_text' && isExcelDate(value)) {
              processedValue = convertExcelDate(value);
            } else if (columnName === 'interview_time' && isExcelTime(value)) {
              processedValue = convertExcelTime(value);
            } else if (typeof value === 'string') {
              processedValue = value.trim() === '' ? null : value;
            }
            if (
              processedValue === 'none' ||
              processedValue === '#N/A' ||
              (columnName !== 'minimum_academic_standards_applied' && processedValue === 'N')
            ) {
              continue;
            }

            if (columnName === 'minimum_academic_standards_applied') {
              processedValue = processedValue === 'Y' ? 1 : 0;
            }
            if (
              (columnName === 'converted_score_total' || columnName === 'converted_score_cut') &&
              typeof processedValue === 'string'
            ) {
              processedValue = null;
            }
            entity[columnName] = processedValue;
          }
        }

        chunk.push(entity);

        if (chunk.length === CHUNK_SIZE || i === sheet.length - 1) {
          await this.susiSubjectService.insertSusiSubjectData(chunk);
          chunk = [];

          // // 배치 처리 후 잠시 대기
          // await new Promise((resolve) => setTimeout(resolve, 1000)); // 1초 대기
        }
      }
    } catch (error) {
      throw error;
    } finally {
      // 파일 삭제
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(`Failed to delete file: ${filePath}`, err);
        }
      });
    }
  }
}
