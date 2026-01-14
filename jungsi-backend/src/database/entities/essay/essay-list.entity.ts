import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('essay_list_tb')
@Unique('unique_essay', [
  'college_code',
  'admission_series_code',
  'recruitment_unit',
  'type_rate',
  'essay_type',
])
export class EssayListEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 50 })
  admission_series_code: string;

  @Column({ type: 'varchar', length: 100 })
  college_code: string;

  @Column({ type: 'varchar', length: 1000 })
  integration_code: string;

  @Column({ type: 'varchar', length: 100 })
  essay_subject: string;

  @Column({ type: 'varchar', length: 100 })
  essay_type: string;

  @Column({ type: 'varchar', length: 1000 })
  examination_tendency: string;

  @Column({ type: 'varchar', length: 1000 })
  competition_rate: string;

  @Column({ type: 'varchar', length: 200 })
  recruitment_unit: string;

  @Column({ type: 'varchar', length: 1000 })
  rthree_etc_code: string;

  @Column({ type: 'int' })
  rthree_etc_flag: number;

  @Column({ type: 'int' })
  rthree_region_flag: number;

  @Column({ type: 'varchar', length: 1000 })
  rthree_region_info: string;

  @Column({ type: 'varchar', length: 1000 })
  su_nosul: string;

  @Column({ type: 'varchar', length: 1000 })
  susi: string;

  @Column({ type: 'varchar', length: 100 })
  type_rate: string;

  @Column({ type: 'varchar', length: 1000 })
  type_time: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  admission_date: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  admission_time: string | null;

  @Column({ type: 'int', nullable: true })
  common_math: number | null;

  @Column({ type: 'int', nullable: true })
  common_science: number | null;

  @Column({ type: 'int', nullable: true })
  cross_support: number | null;

  @Column({ type: 'int', nullable: true })
  df_in: number | null;

  @Column({ type: 'int', nullable: true })
  except_nonsul: number | null;

  @Column({ type: 'int', nullable: true })
  geometry: number | null;

  @Column({ type: 'int', nullable: true })
  hwaone: number | null;

  @Column({ type: 'int', nullable: true })
  hwaonetwo: number | null;

  @Column({ type: 'int', nullable: true })
  jiown: number | null;

  @Column({ type: 'int', nullable: true })
  jiowntwo: number | null;

  @Column({ type: 'int', nullable: true })
  mulone: number | null;

  @Column({ type: 'int', nullable: true })
  mulonetwo: number | null;

  @Column({ type: 'int', nullable: true })
  mun_mathen: number | null;

  @Column({ type: 'int', nullable: true })
  pb_st: number | null;

  @Column({ type: 'int', nullable: true })
  sangone: number | null;

  @Column({ type: 'int', nullable: true })
  sangonetwo: number | null;

  @Column({ type: 'int', nullable: true })
  science_designation: number | null;

  @Column({ type: 'int', nullable: true })
  select_math_subject: number | null;

  @Column({ type: 'int', nullable: true })
  select_science_subject: number | null;

  @Column({ type: 'int', nullable: true })
  student_recruitment_num: number | null;

  @Column({ type: 'int', nullable: true })
  suone_sutwo: number | null;
}
