"use client";

import { Link } from "@tanstack/react-router";
import { IconChevronRight, IconDeviceMobile, IconChartBar, IconUserCheck } from "@tabler/icons-react";
import { useGradeStore, gradeThemes } from "@/stores/client/use-grade-store";

const programs = [
  {
    title: "무료 모의지원 앱 '거북정모'",
    description: "국내유일 모의지원 전문 앱\n앱기반의 신속, 편리성\n사용자 확대와 데이터 교류를 위한 협력 고교 확대중",
    price: "무료",
    imageUrl: "/images/ETC/무료 모의지원 앱.jpg",
    href: "/products",
    icon: IconDeviceMobile,
  },
  {
    title: "2026 정시합격예측",
    description: "예측은 당근, 단계별 프로세스식 최적 조합 제시\n무료 모의지원 앱 '거북정모'에서 교차지원률, 연쇄이동률 파악 예측컷에 반영",
    price: "유료 - 59,000원",
    imageUrl: "/images/ETC/정시.jpg",
    href: "/products",
    icon: IconChartBar,
  },
  {
    title: "거북쌤 강준의 대면 컨설팅",
    description: "비대면 컨설팅 3회 + 최종 대면 컨설팅 1회 + 교차지원, 연쇄이동 현황에 따른 예측컷 변동 1~3일 업데이트",
    price: "유료 - 490,000원",
    imageUrl: "/images/ETC/거북쌤.png",
    href: "/products",
    icon: IconUserCheck,
  },
];

export const JungsiProgramSection = () => {
  const { grade } = useGradeStore();
  const theme = gradeThemes[grade];

  // 고3이 아니면 렌더링하지 않음
  if (grade !== "3") return null;

  return (
    <div className="w-full bg-white py-16">
      <div className="container mx-auto px-4">
        {/* 제목 */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            2026년 <span style={{ color: theme.primary }}>정시 프로그램</span>
          </h2>
          <p className="text-gray-500">거북스쿨만의 차별화된 정시 예측 서비스</p>
        </div>

        {/* 프로그램 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {programs.map((program, index) => {
            const Icon = program.icon;
            return (
              <Link
                key={index}
                to={program.href}
                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                {/* 이미지 */}
                <div className="relative w-full h-96 overflow-hidden">
                  <img
                    src={program.imageUrl}
                    alt={program.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* 콘텐츠 */}
                <div className="p-5">
                  {/* 가격 태그 */}
                  <div className="flex justify-between items-start mb-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${theme.primary}15` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: theme.primary }} />
                    </div>
                    <span
                      className="px-3 py-1 text-xs font-medium rounded-full"
                      style={{
                        backgroundColor: `${theme.primary}15`,
                        color: theme.primary,
                      }}
                    >
                      {program.price}
                    </span>
                  </div>

                  {/* 제목 */}
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{program.title}</h3>

                  {/* 설명 */}
                  <p className="text-gray-500 text-sm whitespace-pre-line line-clamp-3 mb-4">
                    {program.description}
                  </p>

                  {/* 더보기 */}
                  <div
                    className="flex items-center text-sm font-medium group-hover:gap-2 transition-all"
                    style={{ color: theme.primary }}
                  >
                    <span>자세히 보기</span>
                    <IconChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
