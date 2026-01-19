import React, { useMemo } from "react";
import { Button } from "@/components/custom/button";
import { MinusIcon, PlusIcon } from "lucide-react";
import { SubjectInputItem } from "./subject-input-item";
import { SelectSubjectInputItem } from "./select-subject-input-item";
import { AttendanceInputItem } from "./attendance-input-item";
import { useLifeRecord } from "@/hooks/use-life-record";
import { useGetStaticData } from "@/stores/server/features/static-data/queries";

export const LifeRecordInputTabs: React.FC = () => {
  const {
    currentGrade,
    setCurrentGrade,
    schoolrecordSubjectLearningList,
    schoolrecordSelectSubjectList,
    schoolrecordAttendanceDetailList,
    onChangeSubjectValue,
    onChangeSelectSubjectValue,
    onChangeAttendanceValue,
    onClickAddOrDelLine,
    onClickSaveGrade,
  } = useLifeRecord();

  const { data: staticData } = useGetStaticData();

  const subjects = useMemo(
    () => staticData?.subjects || { MAIN_SUBJECTS: {}, SUBJECTS: {} },
    [staticData],
  );

  const renderGradeButtons = useMemo(
    () => (
      <div className="flex items-center gap-4">
        {["1", "2", "3"].map((grade) => (
          <Button
            key={grade}
            type="button"
            onClick={() => setCurrentGrade(grade)}
            variant={currentGrade === grade ? "default" : "outline"}
          >
            {grade}학년
          </Button>
        ))}
      </div>
    ),
    [currentGrade, setCurrentGrade],
  );

  const renderAttendanceSection = useMemo(
    () => (
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold">출결</h4>
        </div>
        <div className="space-y-2 overflow-x-auto p-2">
          <div className="flex items-end space-x-2 text-xs font-semibold text-primary">
            <div className="min-w-[80px]">학년</div>
            <div className="min-w-[80px]">수업일수</div>
            <div className="min-w-[180px] items-center">
              <div className="text-center text-blue-500">결석일수</div>
              <div className="flex items-center justify-around">
                <div>질병</div>
                <div>무단</div>
                <div>기타</div>
              </div>
            </div>
            <div className="min-w-[180px] items-center">
              <div className="text-center text-blue-500">지각</div>
              <div className="flex items-center justify-around">
                <div>질병</div>
                <div>무단</div>
                <div>기타</div>
              </div>
            </div>
            <div className="min-w-[180px] items-center">
              <div className="text-center text-blue-500">조퇴</div>
              <div className="flex items-center justify-around">
                <div>질병</div>
                <div>무단</div>
                <div>기타</div>
              </div>
            </div>
            <div className="min-w-[180px] items-center">
              <div className="text-center text-blue-500">결과</div>
              <div className="flex items-center justify-around">
                <div>질병</div>
                <div>무단</div>
                <div>기타</div>
              </div>
            </div>
          </div>
          <div className="pb-4">
            <AttendanceInputItem
              attendanceItem={schoolrecordAttendanceDetailList}
              onChangeAttendanceValue={onChangeAttendanceValue}
            />
          </div>
        </div>
      </section>
    ),
    [schoolrecordAttendanceDetailList, onChangeAttendanceValue],
  );

  const renderSubjectSection = useMemo(
    () => (
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-semibold">
              공통과목 / 일반선택과목 / 전문교과I / 전문교과II
            </h4>
            <p className="text-sm text-foreground/50">
              석차 등급이 없는 교과의 경우 석차등급은 비워두시면 됩니다
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="p-2"
              onClick={() => onClickAddOrDelLine(false, false)}
            >
              <MinusIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="default"
              className="p-2"
              onClick={() => onClickAddOrDelLine(true, false)}
            >
              <PlusIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="space-y-2 overflow-x-auto p-2">
          <div className="flex items-center space-x-2 text-xs font-semibold text-primary">
            <div className="min-w-[80px]">학기</div>
            <div className="min-w-[120px]">교과</div>
            <div className="min-w-[120px]">과목</div>
            <div className="min-w-[60px]">단위수</div>
            <div className="min-w-[60px]">원점수</div>
            <div className="min-w-[60px]">과목평균</div>
            <div className="min-w-[60px]">표준편차</div>
            <div className="min-w-[60px]">성취도</div>
            <div className="min-w-[60px]">수강자수</div>
            <div className="min-w-[60px]">석차등급</div>
          </div>
          <div className="space-y-6 pb-6 lg:space-y-2">
            {schoolrecordSubjectLearningList.length ? (
              schoolrecordSubjectLearningList.map((item, index) => (
                <SubjectInputItem
                  key={`normal-${item.main_subject_code}-${item.subject_code}-${index}`}
                  index={index}
                  onChangeSubjectValue={onChangeSubjectValue}
                  subjectItem={item}
                  subjects={subjects}
                />
              ))
            ) : (
              <p className="py-8 text-center text-sm text-foreground/60">
                우측 플러스 버튼을 눌러 과목을 추가해주세요 😄
              </p>
            )}
          </div>
        </div>
      </section>
    ),
    [
      schoolrecordSubjectLearningList,
      onChangeSubjectValue,
      onClickAddOrDelLine,
      subjects,
    ],
  );

  const renderSelectSubjectSection = useMemo(
    () => (
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold">진로선택과목</h4>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="p-2"
              onClick={() => onClickAddOrDelLine(false, true)}
            >
              <MinusIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="default"
              className="p-2"
              onClick={() => onClickAddOrDelLine(true, true)}
            >
              <PlusIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="space-y-2 overflow-x-auto p-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary">
            <div className="min-w-[80px]">학기</div>
            <div className="min-w-[120px]">교과</div>
            <div className="min-w-[120px]">과목</div>
            <div className="min-w-[60px]">단위수</div>
            <div className="min-w-[60px]">원점수</div>
            <div className="min-w-[60px]">과목평균</div>
            <div className="min-w-[60px]">성취도</div>
            <div className="min-w-[60px]">수강자수</div>
            <div className="min-w-[196px]">성취도별 분포비율(A,B,C)</div>
          </div>
          <div className="space-y-6 pb-6 lg:space-y-2">
            {schoolrecordSelectSubjectList.length ? (
              schoolrecordSelectSubjectList.map((item, index) => (
                <SelectSubjectInputItem
                  key={`select-${item.main_subject_code}-${item.subject_code}-${index}`}
                  index={index}
                  selectSubjectItem={item}
                  onChangeSelectSubjectValue={onChangeSelectSubjectValue}
                  subjects={subjects}
                />
              ))
            ) : (
              <p className="py-8 text-center text-sm text-foreground/60">
                우측 플러스 버튼을 눌러 과목을 추가해주세요 😄
              </p>
            )}
          </div>
        </div>
      </section>
    ),
    [
      schoolrecordSelectSubjectList,
      onChangeSelectSubjectValue,
      onClickAddOrDelLine,
      subjects,
    ],
  );

  return (
    <div className="pb-20">
      {renderGradeButtons}
      <div className="flex w-full flex-col items-center space-y-2 py-4">
        <div className="w-full space-y-4 pt-4">
          {renderAttendanceSection}
          {renderSubjectSection}
          {renderSelectSubjectSection}
          <div className="flex justify-end">
            <Button onClick={onClickSaveGrade}>저장하기</Button>
          </div>
        </div>
      </div>
    </div>
  );
};
