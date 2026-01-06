import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import { MockexamRawToStandardEntity } from 'src/database/entities/mock-exam/mockexam-raw-to-standard.entity';
import { getSubjectCode } from '../excel-mapper/subject-code-mapper';
import { CommonSearchQueryDto } from 'src/common/dtos/common-search-query.dto';
import { CommonSearchUtils } from 'src/common/utils/common-search.utils';
import { AdminMockExamRawToStandardResponseDto } from '../dtos/admin-mock-exam-raw-standard.dto';

@Injectable()
export class AdminMockExamService {
  constructor(
    @InjectRepository(MockexamRawToStandardEntity)
    private readonly mockexamRawToStandardRepository: Repository<MockexamRawToStandardEntity>,
  ) {}

  // 원점수 변환표 조회 (admin)
  async getAdminMockExamRawToStandards(
    commonSearchQueryDto: CommonSearchQueryDto,
  ): Promise<AdminMockExamRawToStandardResponseDto> {
    const param = CommonSearchUtils.convertRequestDtoToMapForSearch(
      commonSearchQueryDto,
      this.mockexamRawToStandardRepository,
    );

    const queryBuilder = this.mockexamRawToStandardRepository.createQueryBuilder('A');

    if (param.search) {
      queryBuilder.where(param.search);
    }

    if (param.searchSort) {
      queryBuilder.orderBy(param.searchSort.field, param.searchSort.sort);
    }

    queryBuilder.skip((param.page - 1) * param.pageSize).take(param.pageSize);

    const [list, totalCount] = await queryBuilder.getManyAndCount();
    return {
      list: list,
      totalCount,
    };
  }

  async syncDatabaseWithExcel(filePath: string): Promise<void> {
    await this.mockexamRawToStandardRepository.clear();

    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0]; // 임시(추후 분리된 엑셀파일 받을 시 변경)
    const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
      header: 1,
    });

    const CHUNK_SIZE = 300; // 청크 사이즈 설정
    let rawToStandardChunk = [];

    try {
      for (let i = 1; i < sheet.length; i++) {
        const row = sheet[i] as any[];

        // MockExamRawToStandardEntity 데이터 처리
        const rawToStandardRecord = new MockexamRawToStandardEntity();
        rawToStandardRecord.code = getSubjectCode((String(row[1]) || '').trim());
        rawToStandardRecord.raw_score_common = (String(row[2]) || '').trim();
        rawToStandardRecord.raw_score_select = (String(row[3]) || '').trim();
        rawToStandardRecord.standard_score = (String(row[4]) || '').trim();
        rawToStandardRecord.percentile = row[5] || 0;
        rawToStandardRecord.grade = row[6] || null;
        rawToStandardRecord.top_cumulative = row[7] || 0;
        rawToStandardChunk.push(rawToStandardRecord);

        if (rawToStandardChunk.length === CHUNK_SIZE || i === sheet.length - 1) {
          await this.mockexamRawToStandardRepository.save(rawToStandardChunk);
          rawToStandardChunk = [];
        }
      }
    } catch (error) {
      console.error('업로드 중 오류 발생:', error);
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
