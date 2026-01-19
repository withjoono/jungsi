export interface IExploreEarlySubjectStep1Item {
  id: number;
  university: {
    id: number;
    name: string;
    region: string;
    code: string;
    establishment_type: string;
  };
  name: string;
  year: number;
  basic_type: "일반" | "특별";
  category: {
    id: number;
    name: string;
  };
  subtype_ids: number[];
  general_type: {
    id: number;
    name: string;
  };
  min_cut: number | null;
  max_cut: number | null;
  recruitment_unit_ids: number[];
}

export interface IExploreEarlySubjectStep1Response {
  items: IExploreEarlySubjectStep1Item[];
}

export interface IExploreEarlySubjectStep2Item {
  id: number;
  university: {
    id: number;
    name: string;
    region: string;
    code: string;
    establishment_type: string;
  };
  admission: {
    id: number;
    name: string;
    year: number;
    basic_type: "일반" | "특별";
  };
  general_field: {
    id: number;
    name: string;
  };
  name: string;
  recruitment_number: number | null;
  minimum_grade: {
    is_applied: "Y" | "N";
    description: string | null;
  } | null;
}

export interface IExploreEarlySubjectStep2Response {
  items: IExploreEarlySubjectStep2Item[];
}

export interface IExploreEarlySubjectStep3Item {
  id: number;
  university: {
    id: number;
    name: string;
    region: string;
    code: string;
    establishment_type: string;
  };
  admission: {
    id: number;
    name: string;
    year: number;
    basic_type: "일반" | "특별";
  };
  general_field: {
    id: number;
    name: string;
  };
  name: string;
  method: {
    method_description: string;
    subject_ratio: number | null;
    document_ratio: number | null;
    interview_ratio: number | null;
    practical_ratio: number | null;
    other_details: string | null;
    second_stage_first_ratio: number | null;
    second_stage_interview_ratio: number | null;
    second_stage_other_ratio: number | null;
    second_stage_other_details: string | null;
    eligibility: string;
    school_record_evaluation_score: string | null;
    school_record_evaluation_elements: string | null;
  };
}

export interface IExploreEarlySubjectStep3Response {
  items: IExploreEarlySubjectStep3Item[];
}

export interface IExploreEarlySubjectStep4Item {
  id: number;
  name: string;
  recruitment_number: number | null;
  university: {
    id: number;
    name: string;
    region: string;
    code: string;
    establishment_type: string;
  };
  admission: {
    id: number;
    name: string;
    year: number;
    basic_type: "일반" | "특별";
  };
  general_field: {
    id: number;
    name: string;
  };
  scores: {
    grade_50_cut: number | null;
    grade_70_cut: number | null;
    convert_50_cut: number | null;
    convert_70_cut: number | null;
    risk_plus_5: number | null;
    risk_plus_4: number | null;
    risk_plus_3: number | null;
    risk_plus_2: number | null;
    risk_plus_1: number | null;
    risk_minus_1: number | null;
    risk_minus_2: number | null;
    risk_minus_3: number | null;
    risk_minus_4: number | null;
    risk_minus_5: number | null;
  } | null;
}

export interface IExploreEarlySubjectStep4Response {
  items: IExploreEarlySubjectStep4Item[];
}

export interface IExploreEarlySubjectStep5Item {
  id: number;
  name: string;
  recruitment_number: number | null;
  university: {
    id: number;
    name: string;
    region: string;
    code: string;
    establishment_type: string;
  };
  admission: {
    id: number;
    name: string;
    year: number;
    basic_type: "일반" | "특별";
  };
  general_field: {
    id: number;
    name: string;
  };
  interview: {
    is_reflected: number;
    interview_type: string | null;
    materials_used: string | null;
    interview_process: string | null;
    evaluation_content: string | null;
    interview_date: string | null;
    interview_time: string | null;
  } | null;
}

export interface IExploreEarlySubjectStep5Response {
  items: IExploreEarlySubjectStep5Item[];
}

export interface IExploreEarlySubjectDetailResponse {
  id: number;
  name: string;
  recruitment_number: number | null;
  university: {
    id: number;
    name: string;
    region: string;
    code: string;
    establishment_type: string;
  };
  admission: {
    id: number;
    name: string;
    year: number;
    basic_type: "일반" | "특별";
    category: {
      id: number;
      name: string;
    };
    subtypes: {
      id: number;
      name: string;
    }[];
  };
  admission_method: {
    method_description: string;
    subject_ratio: number | null;
    document_ratio: number | null;
    interview_ratio: number | null;
    practical_ratio: number | null;
    other_details: string | null;
    second_stage_first_ratio: number | null;
    second_stage_interview_ratio: number | null;
    second_stage_other_ratio: number | null;
    second_stage_other_details: string | null;
    eligibility: string;
    school_record_evaluation_score: string | null;
    school_record_evaluation_elements: string | null;
  };
  general_field: {
    id: number;
    name: string;
  };
  fields: {
    major: {
      id: number;
      name: string;
    } | null;
    mid: {
      id: number;
      name: string;
    } | null;
    minor: {
      id: number;
      name: string;
    } | null;
  };
  minimum_grade: {
    is_applied: "Y" | "N";
    description: string | null;
  } | null;
  interview: {
    is_reflected: number;
    interview_type: string | null;
    materials_used: string | null;
    interview_process: string | null;
    evaluation_content: string | null;
    interview_date: string | null;
    interview_time: string | null;
  } | null;
  scores: {
    grade_50_cut: number | null;
    grade_70_cut: number | null;
    convert_50_cut: number | null;
    convert_70_cut: number | null;
    risk_plus_5: number | null;
    risk_plus_4: number | null;
    risk_plus_3: number | null;
    risk_plus_2: number | null;
    risk_plus_1: number | null;
    risk_minus_1: number | null;
    risk_minus_2: number | null;
    risk_minus_3: number | null;
    risk_minus_4: number | null;
    risk_minus_5: number | null;
  } | null;
  previous_results: Array<{
    year: number;
    result_criteria: string;
    grade_cut: number | null;
    converted_score_cut: number | null;
    competition_ratio: number | null;
    recruitment_number: number | null;
  }>;
}
