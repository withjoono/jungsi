import { SubSidebarNav } from "@/components/sub-sidebar-nav";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/jungsi/_layout")({
  component: JungsiInterestLayout,
});

const sidebarNavItems = [
  {
    title: "성적 입력",
    href: "/jungsi/score-input",
  },
  {
    title: "성적분석",
    href: "/jungsi/score-analysis",
  },
  {
    title: "수시/정시 지원전략",
    href: "/jungsi/strategy",
  },
  {
    title: "가군",
    href: "/jungsi/a",
  },
  {
    title: "나군",
    href: "/jungsi/b",
  },
  {
    title: "다군",
    href: "/jungsi/c",
  },
  {
    title: "군외",
    href: "/jungsi/gunoe",
  },
  {
    title: "관심대학",
    href: "/jungsi/interest",
  },
  {
    title: "모의지원",
    href: "/jungsi/combination",
  },
];

function JungsiInterestLayout() {
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
