import { SubSidebarNav } from "@/components/sub-sidebar-nav";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/mock-analysis/_layout")({
  component: MockAnalysisLayout,
});

const sidebarNavItems = [
  {
    title: "성적입력",
    href: "/mock-analysis/score-input",
  },
  {
    title: "성적분석",
    href: "/mock-analysis/score-analysis",
  },
  {
    title: "대학예측",
    href: "/mock-analysis/prediction",
  },
  {
    title: "누적분석",
    href: "/mock-analysis/statistics",
  },
  {
    title: "분석과오답",
    href: "/mock-analysis/wrong-answers",
  },
  {
    title: "목표대학",
    href: "/mock-analysis/target-university",
  },
];

function MockAnalysisLayout() {
  return (
    <div className="mx-auto w-full max-w-screen-xl space-y-6 px-4 py-10">
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
