import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SchoolRecordAttendanceDetailEntity } from 'src/database/entities/schoolrecord/schoolrecord-attendance-detail.entity';
import { SchoolRecordSelectSubjectEntity } from 'src/database/entities/schoolrecord/schoolrecord-select-subject.entity';
import { SchoolRecordSubjectLearningEntity } from 'src/database/entities/schoolrecord/schoolrecord-subject-learning.entity';
import { SchoolRecordVolunteerEntity } from 'src/database/entities/schoolrecord/schoolrecord-volunteer.entity';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { SchoolrecordSportsArtEntity } from 'src/database/entities/schoolrecord/schoolrecord-sport-art.entity';
import { MemberEntity } from 'src/database/entities/member/member.entity';
import { EditLifeRecordDto } from '../members/dtos/edit-life-record.dto';
// import { AwsUploadService } from 'src/aws-upload/aws-upload.service';
import { MemberUploadFileListEntity } from 'src/database/entities/member/member-file';

@Injectable()
export class SchoolRecordService {
  private readonly logger = new Logger(SchoolRecordService.name);
  constructor(
    @InjectRepository(SchoolRecordAttendanceDetailEntity)
    private attendanceRepository: Repository<SchoolRecordAttendanceDetailEntity>,
    @InjectRepository(SchoolRecordSelectSubjectEntity)
    private selectSubjectRepository: Repository<SchoolRecordSelectSubjectEntity>,
    @InjectRepository(SchoolRecordSubjectLearningEntity)
    private subjectLearningRepository: Repository<SchoolRecordSubjectLearningEntity>,
    @InjectRepository(SchoolRecordVolunteerEntity)
    private volunteerRepository: Repository<SchoolRecordVolunteerEntity>,
    @InjectRepository(SchoolrecordSportsArtEntity)
    private sportArtRepository: Repository<SchoolrecordSportsArtEntity>,
    @InjectRepository(MemberEntity)
    private memberRepository: Repository<MemberEntity>,
    @InjectRepository(MemberUploadFileListEntity)
    private memberUploadFileListRepository: Repository<MemberUploadFileListEntity>,
    private readonly dataSource: DataSource,
    // private readonly awsUploadService: AwsUploadService,
  ) {}

  async getMemberUploadFiles(
    skip: number,
    limit: number,
    searchKey?: string,
  ): Promise<
    [
      {
        id: string;
        file_path: string;
        file_type: string;
        create_dt: Date;
        member_id: string;
        member_nickname: string | null;
        member_email: string | null;
      }[],
      number,
    ]
  > {
    let whereClause = '';
    let params: any[] = [limit, skip];

    if (searchKey) {
      whereClause = 'WHERE m.email LIKE ?';
      params = [`%${searchKey}%`, ...params];
    }

    const filesQuery = `
      SELECT 
          mufl.id,
          mufl.file_path,
          mufl.file_type,
          mufl.create_dt,
          m.id AS member_id,
          m.email AS member_email,
          m.nickname AS member_nickname
      FROM 
          member_upload_file_list_tb mufl
      LEFT JOIN 
          member_tb m ON mufl.member_id = m.id
      ${whereClause}
      ORDER BY 
          mufl.create_dt DESC
      LIMIT ? OFFSET ?
    `;

    const countQuery = `
      SELECT COUNT(*) as count 
      FROM member_upload_file_list_tb mufl
      LEFT JOIN member_tb m ON mufl.member_id = m.id
      ${whereClause}
    `;

    const [files, totalResult] = await Promise.all([
      this.dataSource.query(filesQuery, params),
      this.dataSource.query(countQuery, searchKey ? [`%${searchKey}%`] : []),
    ]);

    const total = totalResult[0].count;

    return [files, total];
  }
  async getAttendanceDetails(memberId: number): Promise<SchoolRecordAttendanceDetailEntity[]> {
    return await this.attendanceRepository.find({
      where: { member: { id: memberId } },
    });
  }

  async getSelectSubjects(memberId: number): Promise<SchoolRecordSelectSubjectEntity[]> {
    return await this.selectSubjectRepository.find({
      where: { member: { id: memberId } },
    });
  }

  async getSubjectLearnings(memberId: number): Promise<SchoolRecordSubjectLearningEntity[]> {
    return await this.subjectLearningRepository.find({
      where: { member: { id: memberId } },
    });
  }

  async getVolunteers(memberId: number): Promise<SchoolRecordVolunteerEntity[]> {
    return await this.volunteerRepository.find({
      where: { member: { id: memberId } },
    });
  }

  async getSportArts(memberId: number): Promise<SchoolrecordSportsArtEntity[]> {
    return await this.sportArtRepository.find({
      where: { member: { id: memberId } },
    });
  }

  async editLifeRecord(memberId: string, editLifeRecordDto: EditLifeRecordDto): Promise<void> {
    const { attendances, subjects, selectSubjects } = editLifeRecordDto;

    const member = await this.memberRepository.findOne({
      where: { id: Number(memberId) },
    });
    if (!member) {
      throw new NotFoundException(`유저를 찾을 수 없습니다.`);
    }
    await this.dataSource.transaction(async (transactionalEntityManager) => {
      // 기존 기록 삭제
      await transactionalEntityManager.delete(SchoolRecordAttendanceDetailEntity, {
        member: { id: member.id },
      });
      await transactionalEntityManager.delete(SchoolRecordSubjectLearningEntity, {
        member: { id: member.id },
      });
      await transactionalEntityManager.delete(SchoolRecordSelectSubjectEntity, {
        member: { id: member.id },
      });

      // 새로운 기록 생성
      const newAttendances = attendances.map((attendance) =>
        this.attendanceRepository.create({ ...attendance, member }),
      );
      await transactionalEntityManager.save(SchoolRecordAttendanceDetailEntity, newAttendances);

      const newSubjects = subjects.map((subject) =>
        this.subjectLearningRepository.create({ ...subject, member }),
      );
      await transactionalEntityManager.save(SchoolRecordSubjectLearningEntity, newSubjects);

      const newSelectSubjects = selectSubjects.map((selectSubject) =>
        this.selectSubjectRepository.create({ ...selectSubject, member }),
      );
      await transactionalEntityManager.save(SchoolRecordSelectSubjectEntity, newSelectSubjects);
    });

    this.logger.log(`Updated life record for member ${member.id}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getSchoolRecordFile(_fileKey: string) {
    // const uploadedFileUrl = await this.awsUploadService.getSignedUrl(fileKey);
    // return uploadedFileUrl;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async deleteSchoolRecordById(_schoolRecordId: string) {
    // const file = await this.memberUploadFileListRepository.findOne({
    //   where: {
    //     id: Number(schoolRecordId),
    //   },
    // });
    // if (!file) {
    //   throw new NotFoundException('파일이 존재하지 않습니다.');
    // }
    // await this.awsUploadService.deleteFile(file.file_key);
    // await this.memberUploadFileListRepository.delete({
    //   id: file.id,
    // });
  }

  async uploadSchoolRecordPdf(memberId: string, file: Express.Multer.File): Promise<string> {
    if (!file) {
      throw new BadRequestException('파일이 존재하지 않습니다.');
    }

    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('PDF파일만 업로드 가능합니다.');
    }

    // const queryRunner = this.dataSource.createQueryRunner();
    // await queryRunner.connect();
    // await queryRunner.startTransaction();

    // try {
    //   // AWS S3에 파일 업로드
    //   const filename = await this.awsUploadService.uploadFile(
    //     file,
    //     'school-records',
    //   );

    //   // DB에 파일 정보 저장
    //   await this.savePdfFileInfo(queryRunner, memberId, file, filename);

    //   await queryRunner.commitTransaction();
    //   return filename;
    // } catch (error) {
    //   await queryRunner.rollbackTransaction();
    //   throw error;
    // } finally {
    //   await queryRunner.release();
    // }
    return 'Not implemented';
  }

  private async savePdfFileInfo(
    queryRunner: QueryRunner,
    memberId: string,
    file: Express.Multer.File,
    filename: string,
  ) {
    const uploadInfo = queryRunner.manager.create(MemberUploadFileListEntity, {
      update_dt: new Date(),
      create_dt: new Date(),
      file_key: filename,
      file_name: file.originalname,
      file_path: filename,
      file_size: file.size,
      file_type: 'school-record-pdf',
      member_id: Number(memberId),
    });
    await queryRunner.manager.save(MemberUploadFileListEntity, uploadInfo);
  }
}
