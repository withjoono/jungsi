import { Controller, Get, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { ApiOperation } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { SubjectCodesService } from './services/subject-code.service';
import { SubjectCodeListEntity } from 'src/database/entities/common-code/subject-code-list-entity';

@Controller('common')
export class CommonCodeController {
  constructor(private readonly subjectCodeService: SubjectCodesService) {}

  @Get('subject-code')
  async findAll(): Promise<SubjectCodeListEntity[]> {
    return this.subjectCodeService.findAll();
  }

  @Post('subject-code/upload')
  @Roles(['ROLE_ADMIN'])
  @ApiOperation({ summary: '[관리자] 공통코드 [교과/과목] 업로드' })
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
    await this.subjectCodeService.syncDatabaseWithExcel(file.path);
    return { message: 'File uploaded and processed successfully' };
  }
}
