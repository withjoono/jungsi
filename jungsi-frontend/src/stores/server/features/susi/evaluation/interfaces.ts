// 사정관 평가
export interface IOfficerEvaluation {
  id: number;
  member_id: number;
  series: string;
  status: string; // COMPLETE | READY
  student_id: number;
  update_dt: Date | null;
  create_dt: Date | null;
}

// 사정관 평가 점수
export interface IOfficerEvaluationScore {
  id: number;
  bottom_survey_id: number | null;
  officer_relation_id: number; // OfficerEvaluation ID
  score: number; // D: 1, C: 2, C+: 3, B: 4, B+: 5, A: 6, A+: 7
}

// 사정관 평가 코멘트
export interface IOfficerEvaluationComment {
  id: number;
  comment: string;
  main_survey_type: string; // HAKUP | JINRO | GONGDONG | ETC
  officer_relation_id: number; // OfficerEvaluation ID
}

// 사정관 평가 질문
export interface IOfficerEvaluationSurvey {
  id: number;
  evaluate_content: string; // 질문내용
  order_num: number; // 순서
}

// 사정관 목록 조회
export interface IOfficerListItem {
  officer_id: string;
  officer_name: string | null;
  officer_profile_image: string | null;
  officer_university: string | null;
  officer_education: string | null;
  remaining_evaluations: number;
}

// 유저 평가목록 조회
export interface IOfficerEvaluationItem {
  id: IOfficerEvaluation["id"];
  series: IOfficerEvaluation["series"];
  status: IOfficerEvaluation["status"];
  update_dt: IOfficerEvaluation["update_dt"];

  officer_id: string;
  officer_name: string;
  officer_profile_image: string;
  remaining_evaluations: number; // 남은 평가 수
}

export interface IOfficerEvaluationQuery {
  comments: IOfficerEvaluationComment[];
  scores: Record<string, number>;
  factorScores: Record<string, IEvaluationFactorScore>;
}

// 사정관 목록 조회
export interface IOfficerProfile {
  education: string;
  id: string;
  member_id: string;
  officer_name: string;
  officer_profile_image: string;
  university: string;
}

// 평가요소별 계산된 내 점수
export interface IEvaluationFactorScore {
  code: string;
  text: string;
  surveyIds: number[];
  score: number;
}
