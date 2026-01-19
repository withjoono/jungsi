import { useState } from "react";
import { createLazyFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export const Route = createLazyFileRoute("/mock-analysis/_layout/score-input")({
  component: MockExamScoreInputPage,
});

function MockExamScoreInputPage() {
  const [activeGrade, setActiveGrade] = useState<"grade1" | "grade2" | "grade3">("grade1");
  const [grade1ScoreType, setGrade1ScoreType] = useState<"standard" | "raw">("raw");
  const [grade2ScoreType, _setGrade2ScoreType] = useState<"standard" | "raw">("raw");
  const [grade3ScoreType, _setGrade3ScoreType] = useState<"standard" | "raw">("raw");

  // Grade 1 Mock Exam Scores (Standard)
  const [grade1StandardScores, setGrade1StandardScores] = useState({
    korean: { standard: "", grade: "", percentile: "" },
    math: { standard: "", grade: "", percentile: "" },
    english: { grade: "" },
    koreanHistory: { grade: "" },
    integratedScience: { standard: "", grade: "", percentile: "" },
    integratedSocial: { standard: "", grade: "", percentile: "" },
    exam: "3월 모의고사",
    year: "2025",
  });

  // Grade 1 Mock Exam Scores (Raw)
  const [grade1RawScores, setGrade1RawScores] = useState({
    korean: { raw: "" },
    math: { raw: "" },
    english: { raw: "" },
    koreanHistory: { raw: "" },
    integratedScience: { raw: "" },
    integratedSocial: { raw: "" },
    exam: "3월 모의고사",
    year: "2025",
  });

  // Grade 2 Mock Exam Scores (Standard)
  const [grade2StandardScores, setGrade2StandardScores] = useState({
    korean: { standard: "", grade: "", percentile: "" },
    math: { standard: "", grade: "", percentile: "" },
    english: { grade: "" },
    koreanHistory: { grade: "" },
    inquiry1: { subject: "", standard: "", grade: "", percentile: "" },
    inquiry2: { subject: "", standard: "", grade: "", percentile: "" },
    exam: "3월 모의고사",
    year: "2025",
  });

  // Grade 2 Mock Exam Scores (Raw)
  const [grade2RawScores, setGrade2RawScores] = useState({
    korean: { raw: "" },
    math: { raw: "" },
    english: { raw: "" },
    koreanHistory: { raw: "" },
    inquiry1: { subject: "", raw: "" },
    inquiry2: { subject: "", raw: "" },
    exam: "3월 모의고사",
    year: "2025",
  });

  // Grade 3 Mock Exam Scores (Standard)
  const [grade3StandardScores, setGrade3StandardScores] = useState({
    korean: { standard: "", grade: "", percentile: "", selectedSubject: "화법과 작문" },
    math: { standard: "", grade: "", percentile: "", selectedSubject: "확률과 통계" },
    english: { grade: "" },
    koreanHistory: { grade: "" },
    inquiry1: { subject: "", standard: "", grade: "", percentile: "" },
    inquiry2: { subject: "", standard: "", grade: "", percentile: "" },
    secondLanguage: { category: "", subject1: "" },
    exam: "3월 모의고사",
    year: "2025",
  });

  // Grade 3 Mock Exam Scores (Raw)
  const [grade3RawScores, setGrade3RawScores] = useState({
    korean: { raw: "", selectedSubject: "화법과 작문" },
    math: { raw: "", selectedSubject: "확률과 통계" },
    english: { raw: "" },
    koreanHistory: { raw: "" },
    inquiry1: { subject: "", raw: "" },
    inquiry2: { subject: "", raw: "" },
    secondLanguage: { category: "" },
    exam: "3월 모의고사",
    year: "2025",
  });

  const grade1MockExamOptions = ["3월 모의고사", "6월 모의고사", "9월 모의고사", "10월 모의고사"];
  const _mockExamOptions = [
    "3월 모의고사", "4월 모의고사", "6월 모의고사", "7월 모의고사",
    "9월 모의고사", "10월 모의고사", "11월 모의고사",
  ];
  const yearOptions = ["2025", "2024", "2023", "2022", "2021"];
  const inquirySubjects = [
    "물리학I", "화학I", "생명과학I", "지구과학I",
    "물리학II", "화학II", "생명과학II", "지구과학II",
    "한국지리", "세계지리", "동아시아사", "세계사",
    "경제", "정치와법", "사회·문화",
  ];
  const secondLanguageSubjects = [
    "독일어I", "프랑스어I", "스페인어I", "중국어I", "일본어I",
    "러시아어I", "아랍어I", "베트남어I", "한문I",
  ];

  const handleGrade1StandardScoreChange = (subject: string, field: string, value: string) => {
    setGrade1StandardScores((prev) => ({
      ...prev,
      [subject]: { ...(prev as Record<string, Record<string, string>>)[subject], [field]: value },
    }));
  };

  const handleGrade1StandardExamChange = (field: string, value: string) => {
    setGrade1StandardScores((prev) => ({ ...prev, [field]: value }));
  };

  const handleGrade1RawScoreChange = (subject: string, field: string, value: string) => {
    setGrade1RawScores((prev) => ({
      ...prev,
      [subject]: { ...(prev as Record<string, Record<string, string>>)[subject], [field]: value },
    }));
  };

  const handleGrade1RawExamChange = (field: string, value: string) => {
    setGrade1RawScores((prev) => ({ ...prev, [field]: value }));
  };

  const _handleGrade2StandardScoreChange = (subject: string, field: string, value: string) => {
    setGrade2StandardScores((prev) => ({
      ...prev,
      [subject]: { ...(prev as Record<string, Record<string, string>>)[subject], [field]: value },
    }));
  };

  const _handleGrade2StandardExamChange = (field: string, value: string) => {
    setGrade2StandardScores((prev) => ({ ...prev, [field]: value }));
  };

  const _handleGrade2RawScoreChange = (subject: string, field: string, value: string) => {
    setGrade2RawScores((prev) => ({
      ...prev,
      [subject]: { ...(prev as Record<string, Record<string, string>>)[subject], [field]: value },
    }));
  };

  const _handleGrade2RawExamChange = (field: string, value: string) => {
    setGrade2RawScores((prev) => ({ ...prev, [field]: value }));
  };

  const _handleGrade3StandardScoreChange = (subject: string, field: string, value: string) => {
    setGrade3StandardScores((prev) => ({
      ...prev,
      [subject]: { ...(prev as Record<string, Record<string, string>>)[subject], [field]: value },
    }));
  };

  const _handleGrade3StandardExamChange = (field: string, value: string) => {
    setGrade3StandardScores((prev) => ({ ...prev, [field]: value }));
  };

  const _handleGrade3RawScoreChange = (subject: string, field: string, value: string) => {
    setGrade3RawScores((prev) => ({
      ...prev,
      [subject]: { ...(prev as Record<string, Record<string, string>>)[subject], [field]: value },
    }));
  };

  const _handleGrade3RawExamChange = (field: string, value: string) => {
    setGrade3RawScores((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (activeGrade === "grade1") {
      console.log(grade1ScoreType === "standard" ? grade1StandardScores : grade1RawScores);
    } else if (activeGrade === "grade2") {
      console.log(grade2ScoreType === "standard" ? grade2StandardScores : grade2RawScores);
    } else {
      console.log(grade3ScoreType === "standard" ? grade3StandardScores : grade3RawScores);
    }
  };

  // Grade 1 Raw Score Input Component
  const Grade1RawScoreInput = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">모의고사 선택</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>연도</Label>
              <Select value={grade1RawScores.year} onValueChange={(value) => handleGrade1RawExamChange("year", value)}>
                <SelectTrigger><SelectValue placeholder="연도를 선택하세요" /></SelectTrigger>
                <SelectContent>
                  {yearOptions.map((year) => <SelectItem key={year} value={year}>{year}년</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>모의고사</Label>
              <Select value={grade1RawScores.exam} onValueChange={(value) => handleGrade1RawExamChange("exam", value)}>
                <SelectTrigger><SelectValue placeholder="모의고사를 선택하세요" /></SelectTrigger>
                <SelectContent>
                  {grade1MockExamOptions.map((exam) => <SelectItem key={exam} value={exam}>{exam}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">성적 입력</CardTitle>
          <div className="flex gap-2 mt-2">
            <Button size="sm" className={grade1ScoreType === "raw" ? "bg-orange-500 hover:bg-orange-600 text-white" : ""} variant={grade1ScoreType === "raw" ? "default" : "outline"} onClick={() => setGrade1ScoreType("raw")}>원점수 입력</Button>
            <Button size="sm" variant={grade1ScoreType === "standard" ? "default" : "outline"} className={grade1ScoreType === "standard" ? "bg-orange-500 hover:bg-orange-600 text-white" : ""} onClick={() => setGrade1ScoreType("standard")}>표준점수 입력</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: "korean", label: "국어", icon: "📝", color: "text-orange-500", max: 100 },
            { key: "math", label: "수학", icon: "📊", color: "text-blue-500", max: 100 },
            { key: "english", label: "영어", icon: "🌐", color: "text-blue-500", max: 100 },
            { key: "koreanHistory", label: "한국사", icon: "📚", color: "text-green-500", max: 50 },
            { key: "integratedScience", label: "통합과학", icon: "🔬", color: "text-green-500", max: 50 },
            { key: "integratedSocial", label: "통합사회", icon: "🏛️", color: "text-purple-500", max: 50 },
          ].map((subject) => (
            <Card key={subject.key}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className={subject.color}>{subject.icon}</span> {subject.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-48">
                  <label className="block text-sm font-medium mb-1">원점수 (0~{subject.max})</label>
                  <Input type="number" placeholder="0" min="0" max={subject.max} value={(grade1RawScores as any)[subject.key]?.raw || ""} onChange={(e) => handleGrade1RawScoreChange(subject.key, "raw", e.target.value)} />
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  // Grade 1 Standard Score Input Component
  const Grade1StandardScoreInput = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">모의고사 선택</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>연도</Label>
              <Select value={grade1StandardScores.year} onValueChange={(value) => handleGrade1StandardExamChange("year", value)}>
                <SelectTrigger><SelectValue placeholder="연도를 선택하세요" /></SelectTrigger>
                <SelectContent>
                  {yearOptions.map((year) => <SelectItem key={year} value={year}>{year}년</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>모의고사</Label>
              <Select value={grade1StandardScores.exam} onValueChange={(value) => handleGrade1StandardExamChange("exam", value)}>
                <SelectTrigger><SelectValue placeholder="모의고사를 선택하세요" /></SelectTrigger>
                <SelectContent>
                  {grade1MockExamOptions.map((exam) => <SelectItem key={exam} value={exam}>{exam}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">성적 입력</CardTitle>
          <div className="flex gap-2 mt-2">
            <Button size="sm" variant={grade1ScoreType === "raw" ? "default" : "outline"} className={grade1ScoreType === "raw" ? "bg-orange-500 hover:bg-orange-600 text-white" : ""} onClick={() => setGrade1ScoreType("raw")}>원점수 입력</Button>
            <Button size="sm" className={grade1ScoreType === "standard" ? "bg-orange-500 hover:bg-orange-600 text-white" : ""} variant={grade1ScoreType === "standard" ? "default" : "outline"} onClick={() => setGrade1ScoreType("standard")}>표준점수 입력</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {[
            { key: "korean", label: "국어", icon: "📝", color: "text-orange-500", hasStandard: true },
            { key: "math", label: "수학", icon: "📊", color: "text-blue-500", hasStandard: true },
            { key: "english", label: "영어", icon: "🌐", color: "text-blue-500", hasStandard: false },
            { key: "koreanHistory", label: "한국사", icon: "📚", color: "text-green-500", hasStandard: false },
            { key: "integratedScience", label: "통합과학", icon: "🔬", color: "text-green-500", hasStandard: true },
            { key: "integratedSocial", label: "통합사회", icon: "🏛️", color: "text-purple-500", hasStandard: true },
          ].map((subject) => (
            <Card key={subject.key}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className={subject.color}>{subject.icon}</span> {subject.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {subject.hasStandard ? (
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">표준점수 (0~200)</label>
                      <Input type="number" placeholder="0" value={(grade1StandardScores as any)[subject.key]?.standard || ""} onChange={(e) => handleGrade1StandardScoreChange(subject.key, "standard", e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">등급 (1~9)</label>
                      <Input type="number" placeholder="0" min="1" max="9" value={(grade1StandardScores as any)[subject.key]?.grade || ""} onChange={(e) => handleGrade1StandardScoreChange(subject.key, "grade", e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">백분위 (0~100)</label>
                      <Input type="number" placeholder="0" min="0" max="100" value={(grade1StandardScores as any)[subject.key]?.percentile || ""} onChange={(e) => handleGrade1StandardScoreChange(subject.key, "percentile", e.target.value)} />
                    </div>
                  </div>
                ) : (
                  <div className="w-32">
                    <label className="block text-sm font-medium mb-1">등급 (1~9)</label>
                    <Input type="number" placeholder="0" min="1" max="9" value={(grade1StandardScores as any)[subject.key]?.grade || ""} onChange={(e) => handleGrade1StandardScoreChange(subject.key, "grade", e.target.value)} />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  // Grade 2 and Grade 3 components are similar - simplified for brevity
  const Grade2Input = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-lg">고2 성적 입력</CardTitle></CardHeader>
        <CardContent>
          <p className="text-gray-500">고2 성적 입력 폼 - 탐구과목 선택 포함</p>
          <div className="mt-4">
            <Select value={grade2RawScores.inquiry1?.subject || ""} onValueChange={(value) => handleGrade2RawScoreChange("inquiry1", "subject", value)}>
              <SelectTrigger className="w-48"><SelectValue placeholder="탐구1 과목 선택" /></SelectTrigger>
              <SelectContent>
                {inquirySubjects.map((subject) => <SelectItem key={subject} value={subject}>{subject}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const Grade3Input = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-lg">고3/재수 성적 입력</CardTitle></CardHeader>
        <CardContent>
          <p className="text-gray-500">고3/재수 성적 입력 폼 - 선택과목 및 제2외국어 포함</p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {secondLanguageSubjects.map((subject) => (
              <Button key={subject} size="sm" variant="outline" className={grade3RawScores.secondLanguage.category === subject ? "bg-blue-500 text-white border-blue-500" : ""} onClick={() => handleGrade3RawScoreChange("secondLanguage", "category", subject)}>{subject}</Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    if (activeGrade === "grade1") {
      return grade1ScoreType === "raw" ? <Grade1RawScoreInput /> : <Grade1StandardScoreInput />;
    } else if (activeGrade === "grade2") {
      return <Grade2Input />;
    } else {
      return <Grade3Input />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6 text-sm text-gray-600">
        <span>홈</span> <span className="mx-2">{">"}</span>
        <span>모의고사 분석</span> <span className="mx-2">{">"}</span>
        <span className="text-gray-900">성적입력</span>
      </div>

      <div className="mb-6">
        <div className="flex gap-2">
          <Button size="sm" variant={activeGrade === "grade1" ? "default" : "outline"} className={activeGrade === "grade1" ? "bg-orange-500 hover:bg-orange-600 text-white" : ""} onClick={() => setActiveGrade("grade1")}>고1</Button>
          <Button size="sm" variant={activeGrade === "grade2" ? "default" : "outline"} className={activeGrade === "grade2" ? "bg-orange-500 hover:bg-orange-600 text-white" : ""} onClick={() => setActiveGrade("grade2")}>고2</Button>
          <Button size="sm" variant={activeGrade === "grade3" ? "default" : "outline"} className={activeGrade === "grade3" ? "bg-orange-500 hover:bg-orange-600 text-white" : ""} onClick={() => setActiveGrade("grade3")}>고3/재수</Button>
        </div>
      </div>

      {renderContent()}

      <div className="mt-8 text-center">
        <Button onClick={handleSubmit} className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-2">입력하기</Button>
      </div>

      <div className="mt-4 text-center text-sm text-gray-500">학생 성적의 수집 및 활용에 동의합니다.</div>
    </div>
  );
}
