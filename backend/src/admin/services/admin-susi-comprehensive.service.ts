import { Injectable } from '@nestjs/common';
import { CommonSearchQueryDto } from 'src/common/dtos/common-search-query.dto';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import {
  convertExcelDate,
  convertExcelTime,
  isExcelDate,
  isExcelTime,
} from 'src/common/utils/excel-utils';
import { SusiComprehensiveService } from 'src/modules/susi/services/susi-comprehensive.service';
import { SusiComprehensiveEntity } from 'src/database/entities/susi/susi-comprehensive.entity';
import { AdminSusiComprehensiveResponseDto } from '../dtos/admin-susi-comprehensive-response.dto';
import { comprehensiveExcelFieldMapping } from '../excel-mapper/comprehensive-excel-field-mapper';

@Injectable()
export class AdminSusiComprehensiveService {
  constructor(private readonly susiComprehensiveService: SusiComprehensiveService) {}

  async getAdminSusiComprehensiveList(
    commonSearchQueryDto: CommonSearchQueryDto,
  ): Promise<AdminSusiComprehensiveResponseDto> {
    const { list, totalCount } =
      await this.susiComprehensiveService.getAllSusiComprehensive(commonSearchQueryDto);
    return { list, totalCount };
  }

  async syncDatabaseWithExcel(filePath: string): Promise<void> {
    try {
      await this.susiComprehensiveService.clear();

      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[1]; // 두번째 시트 (학종)
      const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
        header: 'A',
      });

      const CHUNK_SIZE = 300; // 청크 사이즈 설정
      let chunk = [];
      let id = 1;
      for (let i = 3; i < sheet.length; i++) {
        const row = sheet[i] as Record<string, any>;
        const entity = new SusiComprehensiveEntity();
        entity.id = id;
        ++id;

        for (const [key, value] of Object.entries(row)) {
          const columnName = comprehensiveExcelFieldMapping[key];

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

            // if (columnName === 'interview_score_applied') {
            //   processedValue = processedValue === '반영' ? 1 : 0;
            // }
            // if (String(columnName).startsWith('risk_level')) {
            //   processedValue = parseFloat(processedValue);
            //   if (isNaN(processedValue)) processedValue = 0;
            // }

            // // 모집인원 숫자 체크
            // if (
            //   columnName === 'recruitment_number' &&
            //   Number.isNaN(Number(processedValue))
            // ) {
            //   processedValue = 0;
            // }
            // if (
            //   columnName === 'evaluation_code' &&
            //   60 <= String(processedValue).length
            // ) {
            //   processedValue = null;
            // }
            entity[columnName] = processedValue;
          }
        }

        chunk.push(entity);

        if (chunk.length === CHUNK_SIZE || i === sheet.length - 1) {
          await this.susiComprehensiveService.insertSusiComprehensive(chunk);
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
