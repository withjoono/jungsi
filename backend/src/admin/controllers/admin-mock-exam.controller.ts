import { Controller, Get, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { AdminMockExamService } from '../services/admin-mock-exam.service';
import { AdminMockExamRawToStandardResponseDto } from '../dtos/admin-mock-exam-raw-standard.dto';
import { CommonSearchQueryDto } from 'src/common/dtos/common-search-query.dto';

@Controller('admin/mock-exam')
@ApiTags('[관리자] 모의고사 관련 API')
export class AdminMockExamController {
  constructor(private readonly adminMockExamService: AdminMockExamService) {}

  @Get('raw-to-standard')
  @Roles(['ROLE_ADMIN'])
  @ApiOperation({ summary: '[관리자] 원점수 변환표 조회' })
  getAdminEarlydComprehensiveList(
    @Query() commonSearchQueryDto: CommonSearchQueryDto,
  ): Promise<AdminMockExamRawToStandardResponseDto> {
    return this.adminMockExamService.getAdminMockExamRawToStandards(commonSearchQueryDto);
  }

  @Post('raw-to-standard/upload')
  @Roles(['ROLE_ADMIN'])
  @ApiOperation({ summary: '[관리자] 원점수 표준점수 변환 테이블 업로드' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: '/tmp/uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    await this.adminMockExamService.syncDatabaseWithExcel(file.path);
    return { message: 'File uploaded and processed successfully' };
  }
}
