import { useGetOfficerEvaluationSurvey } from "@/stores/server/features/susi/evaluation/queries";
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button, buttonVariants } from "@/components/custom/button";
import { cn } from "@/lib/utils";
// Spring 백엔드는 더 이상 사용하지 않음 (2024-12 NestJS로 완전 마이그레이션)
// import {
//   useGetCompleteEvaluationList,
//   useGetEvaluationInfo,
//   useGetEvaluationStudnetInfo,
//   useGetOfficerApplyList,
// } from "@/stores/server/features/spring/queries";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useEvaluationByOfficer } from "@/stores/server/features/susi/evaluation/mutations";

interface EditEvaluationFormProps {
  studentId: string;
}

export const EditEvaluationForm = ({ studentId }: EditEvaluationFormProps) => {
  // Queries
  // Spring 백엔드가 비활성화되어 쿼리도 비활성화됨
  // const { data: studentInfo } = useGetEvaluationStudnetInfo(studentId);
  // const { data: evaluationInfo, refetch: refetchEvaluationInfo } =
  //   useGetEvaluationInfo(studentId);
  const studentInfo = null as { studentName?: string; series?: string } | null;
  const evaluationInfo = null as { officerSurveyList?: any[]; officerCommentList?: any[] } | null;
  const refetchEvaluationInfo = async () => {};
  const { data: survey } = useGetOfficerEvaluationSurvey();

  // const { refetch: refetchApplyList } = useGetOfficerApplyList();
  // const { refetch: refetchCompleteEvaluationList } =
  //   useGetCompleteEvaluationList();
  const refetchApplyList = async () => {};
  const refetchCompleteEvaluationList = async () => {};

  // Mutations (TODO)
  const evaluationByOfficer = useEvaluationByOfficer();

  const [scores, setScores] = useState<Record<number, string>>({});
  const [comments, setComments] = useState<Record<string, string>>({});

  const navigate = useNavigate();

  useEffect(() => {
    const scoreMap: Record<number, string> = {};
    if (evaluationInfo?.officerSurveyList) {
      for (const { score, surveyId } of evaluationInfo.officerSurveyList) {
        scoreMap[Number(surveyId)] = String(score);
      }
    }
    setScores(scoreMap);

    const commentMap: Record<string, string> = {};
    if (evaluationInfo?.officerCommentList) {
      for (const {
        comment,
        mainSurveyType,
      } of evaluationInfo.officerCommentList) {
        commentMap[mainSurveyType] = comment;
      }
    }
    setComments(commentMap);
  }, [evaluationInfo]);

  const handleScoreChange = (surveyId: number, score: string) => {
    setScores((prevScores) => ({
      ...prevScores,
      [surveyId]: score,
    }));
  };

  const handleCommentChange = (mainSurveyType: string, value: string) => {
    setComments((prevComments) => ({
      ...prevComments,
      [mainSurveyType]: value,
    }));
  };

  // 평가 완료
  async function handleSubmit() {
    const updateScoreData = Object.entries(scores).map(([surveyId, score]) => ({
      surveyId: Number(surveyId),
      score: Number(score),
    }));
    const updateCommentData = Object.entries(comments).map(
      ([mainSurveyType, comment]) => ({
        comment,
        mainSurveyType,
      }),
    );

    if (survey && updateScoreData.length !== survey.length) {
      toast.error("모든 설문 내용을 입력해주세요.");
      return;
    }

    for (const n of updateCommentData) {
      if (n.comment.length < 10) {
        toast.error("평가자 주석이 짧은 항목이 존재합니다. (최소 10글자)");
        return;
      }
    }

    const result = await evaluationByOfficer.mutateAsync({
      studentId: studentId,
      series: studentInfo?.series || "",
      scores: updateScoreData,
      comments: updateCommentData,
      saveType: 1,
    });

    if (result.success) {
      toast.success("성공적으로 평가를 완료했습니다.");
      await refetchApplyList();
      await refetchCompleteEvaluationList();
      await refetchEvaluationInfo();
      navigate({ to: "/officer/apply" });
    } else {
      toast.error(result.error);
    }
  }

  // 임시 저장
  async function handleSubmitTemp() {
    const updateScoreData = Object.entries(scores).map(([surveyId, score]) => ({
      surveyId: Number(surveyId),
      score: Number(score),
    }));
    const updateCommentData = Object.entries(comments).map(
      ([mainSurveyType, comment]) => ({
        comment,
        mainSurveyType,
      }),
    );

    const result = await evaluationByOfficer.mutateAsync({
      studentId: studentId,
      series: studentInfo?.series || "",
      scores: updateScoreData,
      comments: updateCommentData,
      saveType: 0,
    });

    if (result.success) {
      toast.info("성공적으로 임시저장을 완료했습니다.");
      await refetchApplyList();
      await refetchCompleteEvaluationList();
      await refetchEvaluationInfo();
      navigate({ to: "/officer/apply" });
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div className="pb-20">
      {/* 신청자 정보 */}
      <div className="flex flex-col items-center gap-2">
        <h3 className="text-2xl font-semibold">
          신청자: {studentInfo?.studentName}
        </h3>
        <div className="flex flex-wrap items-center justify-center gap-4">
          {studentInfo?.series.split(">").map((n, idx) => (
            <div key={n} className="flex items-center gap-2 text-sm">
              <span>
                {idx === 0 ? "대계열: " : idx === 1 ? "중계열: " : "소계열: "}
              </span>
              <p key={n} className="font-semibold text-primary">
                {n}
              </p>
            </div>
          ))}
        </div>
      </div>
      {/* 평가점수 */}
      <div className="space-y-4">
        <div className="flex items-center border-b py-4 text-lg">
          <h4 className="w-full font-semibold">평가항목</h4>
          <div className="hidden w-80 shrink-0 items-center justify-between lg:flex">
            <p>A+</p>
            <p>A</p>
            <p>B+</p>
            <p>B</p>
            <p>C+</p>
            <p>C</p>
            <p>D</p>
          </div>
        </div>
        <div className="">
          {survey?.map((item) => {
            return (
              <div
                key={item.id}
                className="flex flex-col items-center gap-y-4 border-b py-2 hover:bg-accent hover:text-accent-foreground lg:flex-row"
              >
                <div className="w-full font-semibold lg:pr-8">
                  {item.id} - {item.evaluate_content}
                </div>
                <RadioGroup
                  onValueChange={(value) => handleScoreChange(item.id, value)}
                  value={scores[item.id] || ""}
                  className="flex w-full max-w-80 shrink-0 items-center justify-between"
                >
                  <div>
                    <RadioGroupItem value="7" id="7" />
                    <p className="text-sm lg:hidden">A+</p>
                  </div>
                  <div>
                    <RadioGroupItem value="6" id="6" />
                    <p className="text-sm lg:hidden">A</p>
                  </div>
                  <div>
                    <RadioGroupItem value="5" id="5" />
                    <p className="text-sm lg:hidden">B+</p>
                  </div>
                  <div>
                    <RadioGroupItem value="4" id="4" />
                    <p className="text-sm lg:hidden">B</p>
                  </div>
                  <div>
                    <RadioGroupItem value="3" id="3" />
                    <p className="text-sm lg:hidden">C+</p>
                  </div>
                  <div>
                    <RadioGroupItem value="2" id="2" />
                    <p className="text-sm lg:hidden">C</p>
                  </div>
                  <div>
                    <RadioGroupItem value="1" id="1" />
                    <p className="text-sm lg:hidden">D</p>
                  </div>
                </RadioGroup>
              </div>
            );
          })}
        </div>

        <div className="space-y-4 py-8">
          <div className="space-y-2">
            <p className="text-xl font-semibold">진로역량</p>
            <Textarea
              value={comments["JINRO"] || ""}
              onChange={(e) => handleCommentChange("JINRO", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <p className="text-xl font-semibold">학업역량</p>
            <Textarea
              value={comments["HAKUP"] || ""}
              onChange={(e) => handleCommentChange("HAKUP", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <p className="text-xl font-semibold">공동체역량</p>
            <Textarea
              value={comments["GONGDONG"] || ""}
              onChange={(e) => handleCommentChange("GONGDONG", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <p className="text-xl font-semibold">기타역량</p>
            <Textarea
              value={comments["ETC"] || ""}
              onChange={(e) => handleCommentChange("ETC", e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 pt-16">
          <Link
            to="/officer/apply"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            뒤로가기
          </Link>
          <Button onClick={handleSubmitTemp} variant={"outline"}>
            임시저장
          </Button>
          <Button onClick={handleSubmit}>저장하기</Button>
        </div>
      </div>
    </div>
  );
};
