import { FAQArticles } from "@/components/faq-articles";
import { GradeBasedServices } from "@/components/grade-based-services";
import { HeroBanner } from "@/components/hero-banner";
import { JungsiProgramSection } from "@/components/jungsi-program-section";
import { RecentNoticeBoard } from "@/components/recent-notice-board";
import { Container } from "@/components/test/container";
import { Grade, useGradeStore } from "@/stores/client/use-grade-store";
import { useEffect } from "react";
import ReactPlayer from "react-player";

interface HomeContentProps {
  grade: Grade;
}

export function HomeContent({ grade }: HomeContentProps) {
  const { setGrade } = useGradeStore();

  // URL 기반으로 grade store 동기화
  useEffect(() => {
    setGrade(grade);
  }, [grade, setGrade]);

  return (
    <div className="relative">
      <HeroBanner />

      {/* 학년별 서비스 선택 (고3은 숨김) */}
      <GradeBasedServices />

      {/* 고3 전용: 정시 프로그램 섹션 */}
      <JungsiProgramSection />

      <Container className="flex flex-col items-center justify-between">
        {/* YouTube 영상 */}
        <div className="container flex flex-col gap-8 py-10 md:flex-row">
          <div className="flex-1">
            <div className="relative w-full pt-[56.25%]">
              <ReactPlayer
                url="https://www.youtube.com/watch?v=K7ZGIsuYISo"
                width="100%"
                controls
                height="100%"
                className="absolute inset-0 left-0 top-0 h-full w-full"
              />
            </div>
            <p className="mt-4 text-center text-muted-foreground">
              정시 서비스 사용안내
            </p>
          </div>

          <div className="flex-1">
            <div className="relative w-full pt-[56.25%]">
              <ReactPlayer
                url="https://www.youtube.com/watch?v=PO_GI9diEvc"
                width="100%"
                controls
                height="100%"
                className="absolute inset-0 left-0 top-0 h-full w-full"
              />
            </div>
            <p className="mt-4 text-center text-muted-foreground">
              정시 지원 시 나에게 유리한 대학 찾는 법
            </p>
          </div>
        </div>

        {/* 공지사항 & FAQ (맨 아래로 이동) */}
        <div className="container relative flex flex-col items-start gap-x-20 lg:flex-row">
          <RecentNoticeBoard />
          <FAQArticles />
        </div>
      </Container>
    </div>
  );
}
