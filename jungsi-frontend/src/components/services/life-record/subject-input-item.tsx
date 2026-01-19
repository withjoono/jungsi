import React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ISchoolRecordSubject } from "@/stores/server/features/me/interfaces";
import { ITransformedSubjects } from "@/stores/server/features/static-data/queries";

export const SubjectInputItem = React.memo(
  ({
    index,
    subjectItem,
    onChangeSubjectValue,
    subjects,
  }: {
    index: number;
    subjectItem: Omit<ISchoolRecordSubject, "id">;
    onChangeSubjectValue: (index: number, type: string, value: string) => void;
    subjects: ITransformedSubjects;
  }) => {
    const getMainSubjectByCode = (code: string) => subjects.MAIN_SUBJECTS[code];
    const getSubjectByCode = (code: string) => subjects.SUBJECTS[code];

    return (
      <div className="flex items-center gap-2">
        <Select
          value={subjectItem.semester || ""}
          onValueChange={(value) =>
            onChangeSubjectValue(index, "semester", value)
          }
        >
          <SelectTrigger className="min-w-[80px] max-w-[80px]">
            <SelectValue placeholder="학기 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>학기 선택</SelectLabel>
              <SelectItem value="1">1학기</SelectItem>
              <SelectItem value="2">2학기</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select
          value={subjectItem.main_subject_code || ""}
          onValueChange={(value) => {
            onChangeSubjectValue(index, "main_subject_code", value);
            const mainSubject = getMainSubjectByCode(value);
            if (mainSubject) {
              onChangeSubjectValue(
                index,
                "main_subject_name",
                mainSubject.name,
              );
            }
          }}
        >
          <SelectTrigger className="min-w-[120px] max-w-[120px]">
            <SelectValue placeholder="교과 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>교과 선택</SelectLabel>
              {Object.keys(subjects.MAIN_SUBJECTS).map((key) => (
                <SelectItem key={key} value={key}>
                  {subjects.MAIN_SUBJECTS[key].name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select
          value={subjectItem.subject_code || ""}
          onValueChange={(value) => {
            onChangeSubjectValue(index, "subject_code", value);
            const subject = getSubjectByCode(value);
            if (subject) {
              onChangeSubjectValue(index, "subject_name", subject.name);
            }
          }}
        >
          <SelectTrigger className="min-w-[120px] max-w-[120px]">
            <SelectValue placeholder="과목 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>세부과목 선택</SelectLabel>
              {subjectItem.main_subject_code &&
                subjects.MAIN_SUBJECTS[
                  subjectItem.main_subject_code
                ]?.subjectList
                  .filter((code) => subjects.SUBJECTS[code].courseType !== 2)
                  .map((code) => (
                    <SelectItem key={code} value={code}>
                      {subjects.SUBJECTS[code].name}
                    </SelectItem>
                  ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Input
          className="min-w-[60px] max-w-[60px]"
          placeholder="단위수"
          type="text"
          value={subjectItem.unit || ""}
          onChange={(e) => onChangeSubjectValue(index, "unit", e.target.value)}
        />
        <Input
          className="min-w-[60px] max-w-[60px]"
          placeholder="원점수"
          type="text"
          value={subjectItem.raw_score || ""}
          onChange={(e) =>
            onChangeSubjectValue(index, "raw_score", e.target.value)
          }
        />
        <Input
          className="min-w-[60px] max-w-[60px]"
          placeholder="과목평균"
          type="text"
          value={subjectItem.sub_subject_average || ""}
          onChange={(e) =>
            onChangeSubjectValue(index, "sub_subject_average", e.target.value)
          }
        />
        <Input
          className="min-w-[60px] max-w-[60px]"
          placeholder="표준편차"
          type="text"
          value={subjectItem.standard_deviation || ""}
          onChange={(e) =>
            onChangeSubjectValue(index, "standard_deviation", e.target.value)
          }
        />

        <Select
          value={subjectItem.achievement || ""}
          onValueChange={(value) => {
            onChangeSubjectValue(index, "achievement", value);
          }}
        >
          <SelectTrigger className="min-w-[60px] max-w-[60px]">
            <SelectValue placeholder="성취도" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>성취도</SelectLabel>
              {["A", "B", "C", "D", "E"].map((achievement) => (
                <SelectItem key={achievement} value={achievement}>
                  {achievement}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Input
          className="min-w-[60px] max-w-[60px]"
          placeholder="수강자수"
          type="text"
          value={subjectItem.students_num || ""}
          onChange={(e) =>
            onChangeSubjectValue(index, "students_num", e.target.value)
          }
        />
        <Input
          className="min-w-[60px] max-w-[60px]"
          placeholder="석차등급"
          type="text"
          value={subjectItem.ranking || ""}
          onChange={(e) =>
            onChangeSubjectValue(index, "ranking", e.target.value)
          }
        />
      </div>
    );
  },
);
