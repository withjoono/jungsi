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
import { ISchoolRecordSelectSubject } from "@/stores/server/features/me/interfaces";
import { ITransformedSubjects } from "@/stores/server/features/static-data/queries";

export const SelectSubjectInputItem = React.memo(
  ({
    index,
    selectSubjectItem,
    onChangeSelectSubjectValue,
    subjects,
  }: {
    index: number;
    selectSubjectItem: Omit<ISchoolRecordSelectSubject, "id">;
    onChangeSelectSubjectValue: (
      index: number,
      type: string,
      value: string,
    ) => void;
    subjects: ITransformedSubjects;
  }) => {
    const getMainSubjectByCode = (code: string) => subjects.MAIN_SUBJECTS[code];
    const getSubjectByCode = (code: string) => subjects.SUBJECTS[code];

    return (
      <div className="flex items-center gap-2">
        <Select
          value={selectSubjectItem.semester || ""}
          onValueChange={(value) =>
            onChangeSelectSubjectValue(index, "semester", value)
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
          value={selectSubjectItem.main_subject_code || ""}
          onValueChange={(value) => {
            onChangeSelectSubjectValue(index, "main_subject_code", value);
            const mainSubject = getMainSubjectByCode(value);
            if (mainSubject) {
              onChangeSelectSubjectValue(
                index,
                "main_subject_name",
                mainSubject.name,
              );
            }
          }}
        >
          <SelectTrigger className="min-w-[120px] max-w-[120px]">
            <SelectValue placeholder="과목 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>과목 선택</SelectLabel>
              {Object.keys(subjects.MAIN_SUBJECTS).map((key) => (
                <SelectItem key={key} value={key}>
                  {subjects.MAIN_SUBJECTS[key].name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select
          value={selectSubjectItem.subject_code || ""}
          onValueChange={(value) => {
            onChangeSelectSubjectValue(index, "subject_code", value);
            const subject = getSubjectByCode(value);
            if (subject) {
              onChangeSelectSubjectValue(index, "subject_name", subject.name);
            }
          }}
        >
          <SelectTrigger className="min-w-[120px] max-w-[120px]">
            <SelectValue placeholder="과목 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>세부과목 선택</SelectLabel>
              {selectSubjectItem.main_subject_code &&
                subjects.MAIN_SUBJECTS[
                  selectSubjectItem.main_subject_code
                ]?.subjectList.map((code) => (
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
          value={selectSubjectItem.unit || ""}
          onChange={(e) =>
            onChangeSelectSubjectValue(index, "unit", e.target.value)
          }
        />
        <Input
          className="min-w-[60px] max-w-[60px]"
          placeholder="원점수"
          type="text"
          value={selectSubjectItem.raw_score || ""}
          onChange={(e) =>
            onChangeSelectSubjectValue(index, "raw_score", e.target.value)
          }
        />
        <Input
          className="min-w-[60px] max-w-[60px]"
          placeholder="과목평균"
          type="text"
          value={selectSubjectItem.sub_subject_average || ""}
          onChange={(e) =>
            onChangeSelectSubjectValue(
              index,
              "sub_subject_average",
              e.target.value,
            )
          }
        />

        <Select
          value={selectSubjectItem.achievement || ""}
          onValueChange={(value) => {
            onChangeSelectSubjectValue(index, "achievement", value);
          }}
        >
          <SelectTrigger className="min-w-[60px] max-w-[60px]">
            <SelectValue placeholder="성취도" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>성취도</SelectLabel>
              {["A", "B", "C", "D", "E"].map((achievement) => (
                <SelectItem key={achievement + "normal"} value={achievement}>
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
          value={selectSubjectItem.students_num || ""}
          onChange={(e) =>
            onChangeSelectSubjectValue(index, "students_num", e.target.value)
          }
        />
        <Input
          className="min-w-[60px] max-w-[60px]"
          placeholder="A"
          type="text"
          value={selectSubjectItem.achievementa || ""}
          onChange={(e) =>
            onChangeSelectSubjectValue(index, "achievementa", e.target.value)
          }
        />
        <Input
          className="min-w-[60px] max-w-[60px]"
          placeholder="B"
          type="text"
          value={selectSubjectItem.achievementb || ""}
          onChange={(e) =>
            onChangeSelectSubjectValue(index, "achievementb", e.target.value)
          }
        />
        <Input
          className="min-w-[60px] max-w-[60px]"
          placeholder="C"
          type="text"
          value={selectSubjectItem.achievementc || ""}
          onChange={(e) =>
            onChangeSelectSubjectValue(index, "achievementc", e.target.value)
          }
        />
      </div>
    );
  },
);
