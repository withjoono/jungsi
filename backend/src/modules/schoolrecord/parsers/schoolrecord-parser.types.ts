/**
 * School Record Parser Types
 * 학생부 파서 타입 정의
 */

export interface SubjectCodeMapping {
  mainSubjectName: string;
  mainSubjectCode: string;
  subjectName: string;
  subjectCode: string;
}

export interface ParsedSubjectLearning {
  grade: string;
  semester: string;
  mainSubjectCode: string;
  mainSubjectName: string;
  subjectCode: string;
  subjectName: string;
  unit: string;
  rawScore: string;
  subSubjectAverage: string;
  standardDeviation: string;
  achievement: string;
  studentsNum: string;
  ranking: string;
  etc: string;
}

export interface ParsedSelectSubject {
  grade: string;
  semester: string;
  mainSubjectCode: string;
  mainSubjectName: string;
  subjectCode: string;
  subjectName: string;
  unit: string;
  rawScore: string;
  subSubjectAverage: string;
  achievement: string;
  studentsNum: string;
  achievementA: string;
  achievementB: string;
  achievementC: string;
  etc: string;
}

export interface ParsedVolunteer {
  grade: string;
  date: string;
  place: string;
  activityContent: string;
  activityTime: string;
  accumulateTime: string;
}

export interface ParsedSchoolRecord {
  subjectLearnings: ParsedSubjectLearning[];
  selectSubjects: ParsedSelectSubject[];
  volunteers: ParsedVolunteer[];
}

export interface ParsedSchoolRecordPdf {
  subjectLearnings: ParsedSubjectLearning[];
  selectSubjects: ParsedSelectSubject[];
}

// 과목 목록 (PDF 파싱용)
export const SUBJECT_LIST =
  '국어,수학,영어,사회(역사/도덕포함),과학,기술・가정/제2외국어/한문/교양,예술,체육,한국사';

// 기본 과목 코드 (매핑되지 않은 과목용)
export const DEFAULT_MAIN_SUBJECT_CODE = 'HH10';
export const DEFAULT_SUBJECT_CODE_LEARNING = 'HHS224';
export const DEFAULT_SUBJECT_CODE_SELECT = 'HHS225';
