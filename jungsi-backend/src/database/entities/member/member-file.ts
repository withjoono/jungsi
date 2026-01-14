import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('member_upload_file_list_tb')
export class MemberUploadFileListEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @CreateDateColumn({ name: 'create_dt' })
  create_dt: Date;

  @Column({ name: 'file_key', length: 500 })
  file_key: string;

  @Column({ name: 'file_name', length: 500 })
  file_name: string;

  @Column({ name: 'file_path', length: 500 })
  file_path: string;

  @Column({ name: 'file_size', type: 'int', nullable: true })
  file_size: number;

  @Column({ name: 'file_type', length: 500 })
  file_type: string;

  @Column({ name: 'member_id', type: 'bigint' })
  member_id: number;

  @UpdateDateColumn({ name: 'update_dt' })
  update_dt: Date;
}
