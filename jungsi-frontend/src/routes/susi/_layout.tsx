import { SubSidebarNav } from "@/components/sub-sidebar-nav";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/susi/_layout")({
  component: SusiInterestLayout,
});

const sidebarNavItems = [
  {
    title: "생기부 입력",
    href: "/susi/school-record",
  },
  {
    title: "성적 분석",
    href: "/susi/performance",
  },
  {
    title: "계열 적합성 진단",
    href: "/susi/compatibility",
  },
  {
    title: "평가 신청(AI/사정관)",
    href: "/susi/request",
  },
  {
    title: "생기부 평가 내역",
    href: "/susi/evaluation-list",
  },
  {
    title: "교과 전형 탐색",
    href: "/susi/subject",
  },
  {
    title: "학종 전형 탐색",
    href: "/susi/comprehensive",
  },
  {
    title: "논술 전형 탐색",
    href: "/susi/nonsul",
  },
  {
    title: "관심대학",
    href: "/susi/interest",
  },
  {
    title: "모의지원",
    href: "/susi/combination",
  },
];

function SusiInterestLayout() {
  return (
    <div
      className="mx-auto w-full max-w-screen-xl space-y-6 px-4 py-10"
      style={
        {
          "--primary": "88 43% 24%",
          "--primary-foreground": "60 9.1% 97.8%",
        } as React.CSSProperties
      }
    >
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="shrink-0 lg:w-[220px]">
          <SubSidebarNav items={sidebarNavItems} showArrows />
        </aside>
        <div className="w-full flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
