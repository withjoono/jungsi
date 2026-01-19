import { Button } from "@/components/custom/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import { createLazyFileRoute } from "@tanstack/react-router";
import feature1 from "@/assets/images/features/001.png";
import feature2 from "@/assets/images/features/002.png";
import feature3 from "@/assets/images/features/003.png";
import feature4 from "@/assets/images/features/004.png";
import feature5 from "@/assets/images/features/005.png";
import feature6 from "@/assets/images/features/006.png";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { USER_API } from "@/stores/server/features/me/apis";
import {
  IconUser,
  IconFileText,
  IconSettings,
  IconSearch,
  IconHeart,
  IconSchool,
  IconAlertCircle,
} from "@tabler/icons-react";

export const Route = createLazyFileRoute("/susi/")({
  component: SusiHome,
});

const primaryColor = "#84cc16"; // olive-500

// ==========================================
// 로그인 후 대시보드 컴포넌트
// ==========================================
interface DashboardProps {
  user: any;
  hasSusiService: boolean;
}

function SusiDashboard({ user, hasSusiService }: DashboardProps) {
  // 빠른 메뉴
  const quickMenus = [
    { title: "교과 전형 탐색", icon: IconSearch, href: "/susi/subject", color: "bg-olive-500" },
    { title: "학종 전형 탐색", icon: IconSchool, href: "/susi/comprehensive", color: "bg-emerald-500" },
    { title: "관심 대학 관리", icon: IconHeart, href: "/susi/interest", color: "bg-rose-500" },
    { title: "설정", icon: IconSettings, href: "/users/profile", color: "bg-gray-500" },
  ];

  // 서비스 카드
  const serviceCards = [
    {
      title: "교과 전형 탐색",
      description: "내 생기부 교과 성적을 통해 나에게 유리한 전형을 찾는 서비스",
      href: "/susi/subject",
      icon: IconSearch,
      color: "olive",
    },
    {
      title: "학종 전형 탐색",
      description: "생기부 평가 점수를 통해 나에게 유리한 전형을 찾는 서비스",
      href: "/susi/comprehensive",
      icon: IconSchool,
      color: "emerald",
    },
    {
      title: "관심 대학 관리",
      description: "교과/학종/논술 탐색에서 리포트를 저장하는 서비스",
      href: "/susi/interest",
      icon: IconHeart,
      color: "rose",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 대시보드 헤더 */}
      <div className="w-full bg-gradient-to-r from-olive-500 to-olive-600 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                <IconUser className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{user.nickname}님, 환영합니다!</h1>
                <p className="text-olive-100">
                  {user.memberType === 'teacher' ? '멘토' : user.memberType === 'parent' ? '학부모' : '학생'} 계정
                </p>
              </div>
            </div>
            <div className="text-right">
              {hasSusiService ? (
                <span className="inline-block rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-white">
                  수시 서비스 이용중
                </span>
              ) : (
                <Link to="/products">
                  <Button className="bg-white text-olive-500 hover:bg-olive-50">
                    수시 서비스 신청하기
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 생기부 미등록 안내 배너 */}
      <div className="container mx-auto px-4 pt-6">
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-6 shadow-lg">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
                <IconAlertCircle className="h-8 w-8 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-amber-800">생기부를 등록하면 더 정확한 분석이 가능합니다</h3>
                <p className="text-amber-700">마이페이지에서 생기부를 등록하시면 맞춤형 전형 분석을 받으실 수 있습니다.</p>
              </div>
            </div>
            <Link to="/users/school-record">
              <Button className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-3 text-base whitespace-nowrap">
                생기부 등록하기
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 빠른 메뉴 */}
      <div className="container mx-auto px-4 mt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickMenus.map((menu, idx) => {
            const Icon = menu.icon;
            return (
              <Link key={idx} to={menu.href}>
                <div className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer">
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-3", menu.color)}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="font-semibold text-gray-900">{menu.title}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 서비스 카드 섹션 */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">수시 서비스</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {serviceCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <Link key={idx} to={card.href}>
                <Card className="h-full hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer border-2 hover:border-olive-300">
                  <CardHeader>
                    <div className={cn(
                      "w-12 h-12 rounded-lg flex items-center justify-center mb-2",
                      card.color === "olive" && "bg-olive-100",
                      card.color === "emerald" && "bg-emerald-100",
                      card.color === "rose" && "bg-rose-100"
                    )}>
                      <Icon className={cn(
                        "w-6 h-6",
                        card.color === "olive" && "text-olive-600",
                        card.color === "emerald" && "text-emerald-600",
                        card.color === "rose" && "text-rose-600"
                      )} />
                    </div>
                    <CardTitle className="text-lg">{card.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm">{card.description}</p>
                    <div className="mt-4 flex items-center text-olive-500 font-medium text-sm">
                      바로가기 →
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 가이드 섹션 */}
      <div className="container mx-auto px-4 pb-12">
        <GuidePage />
      </div>
    </div>
  );
}

// ==========================================
// 로그인 전 홍보 페이지 컴포넌트
// ==========================================
function SusiPromo() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="w-full bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* 왼쪽: 텍스트 */}
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                2027 <span className="text-olive-500">수시 합격 예측</span> 서비스
              </h1>
              <p className="text-lg text-gray-600 mb-6">
                거북스쿨만의 단계별 필터링 검색으로<br />
                나에게 가장 유리한 전형을 찾아보세요
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link to="/auth/login">
                  <Button className="bg-olive-500 hover:bg-olive-600 text-white px-8 py-3 text-lg">
                    로그인하고 시작하기
                  </Button>
                </Link>
                <Link to="/auth/register">
                  <Button variant="outline" className="border-olive-500 text-olive-500 hover:bg-olive-50 px-8 py-3 text-lg">
                    회원가입
                  </Button>
                </Link>
              </div>
            </div>

            {/* 오른쪽: 로그인 카드 */}
            <div className="flex-shrink-0 w-full max-w-sm">
              <Card className="border-gray-100 shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-center text-sm text-gray-500">
                    2027 수시 서비스
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-col items-center gap-3 py-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                      <IconUser className="h-7 w-7 text-gray-400" />
                    </div>
                    <p className="text-center text-sm text-gray-500">
                      로그인하시면 수시 서비스를
                      <br />
                      이용하실 수 있습니다.
                    </p>
                    <Link to="/auth/login" className="w-full">
                      <Button className="w-full text-white bg-olive-500 hover:bg-olive-600">
                        로그인
                      </Button>
                    </Link>
                    <Link to="/auth/register" className="w-full">
                      <Button variant="outline" className="w-full">
                        회원가입
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* 서비스 소개 섹션 */}
      <div className="mx-auto w-full max-w-screen-xl space-y-20 px-4 py-12 pb-8 md:px-8">
        {/* 교과 전형 탐색 */}
        <div className="flex flex-col items-center justify-between gap-x-12 gap-y-4 md:flex-row">
          <div className="flex w-full flex-col space-y-8 lg:w-6/12">
            <div className="flex flex-col space-y-4">
              <div className="flex flex-col">
                <h2 className="font-heading scroll-m-20 border-l-4 border-olive-500 pb-2 pl-4 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
                  교과 전형 탐색
                </h2>
                <h3>
                  <span className="flex flex-col space-y-1 bg-gradient-to-br bg-clip-text text-xl font-normal text-gray-500 dark:from-white dark:via-gray-300 dark:to-gray-400 dark:text-transparent lg:text-2xl">
                    내 생기부 교과 성적을 통해 나에게 유리한 전형을 찾는 서비스
                  </span>
                </h3>
              </div>
              <p>
                300개 이상의 대학의 모든 전형을 펼처두고 거북스쿨만의 단계별
                필터링 검색을 통해 나에게 가장 유리한 전형을 5단계 필터링을 통해
                탐색하는 <b className="text-olive-500">부분 유료 서비스</b>
                입니다.
              </p>
              <p className="text-foreground/80">
                서비스를 이용하려면{" "}
                <Link to="/users/school-record" className="text-olive-500 hover:text-olive-600 underline">
                  마이페이지
                </Link>
                에서 생기부 혹은 성적 입력이 필요합니다.
              </p>
              <div>
                <Button type="button" className="bg-olive-500 hover:bg-olive-600">
                  <Link
                    className="flex h-full w-full items-center transition-transform duration-500 ease-out"
                    to="/susi/subject"
                  >
                    <span className="flex w-full flex-1 items-center justify-center">
                      <span className="flex items-center space-x-2">
                        <span>바로가기</span>
                      </span>
                    </span>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
          <Card className="flex w-full p-4 lg:w-6/12">
            <img
              alt="intro_susi_1"
              loading="lazy"
              width="626"
              height="683"
              decoding="async"
              data-nimg="1"
              className="rounded-2xl"
              src="/images/intro-susi-1.png"
            />
          </Card>
        </div>

        {/* 학종 전형 탐색 */}
        <div className="flex flex-col-reverse items-center justify-between gap-x-12 gap-y-4 md:flex-row">
          <Card className="flex w-full p-4 lg:w-6/12">
            <img
              alt="intro_susi_2"
              loading="lazy"
              width="626"
              height="683"
              decoding="async"
              data-nimg="1"
              className="rounded-2xl"
              src="/images/intro-susi-2.png"
            />
          </Card>
          <div className="flex w-full flex-col space-y-8 lg:w-6/12">
            <div className="flex flex-col space-y-4">
              <div className="flex flex-col">
                <h2 className="font-heading scroll-m-20 border-l-4 border-olive-500 pb-2 pl-4 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
                  학종 전형 탐색
                </h2>
                <h3>
                  <span className="flex flex-col space-y-1 bg-gradient-to-br bg-clip-text text-xl font-normal text-gray-500 dark:from-white dark:via-gray-300 dark:to-gray-400 dark:text-transparent lg:text-2xl">
                    생기부 평가 점수를 통해 나에게 유리한 전형을 찾는 서비스
                  </span>
                </h3>
              </div>
              <p>
                교과와 달리 생기부 위주로 평가되는 학종 전형에서 자가 평가 혹은
                사정관 평가 결과를 바탕으로 전형별 내 점수를 예측하여 나에게 가장
                유리한 전형을 5단계 필터링을 통해 찾아내는{" "}
                <b className="text-olive-500">부분 유료 서비스</b>입니다.
              </p>

              <p className="text-foreground/80">
                서비스를 이용하려면{" "}
                <Link to="/evaluation" className="text-olive-500 hover:text-olive-600 underline">
                  사정관 평가 서비스
                </Link>
                에서 자가 평가 혹은 사정관 평가 결과가 필요합니다.
              </p>
              <div>
                <Button type="button" className="bg-olive-500 hover:bg-olive-600">
                  <Link
                    className="flex h-full w-full items-center transition-transform duration-500 ease-out"
                    to="/susi/comprehensive"
                  >
                    <span className="flex w-full flex-1 items-center justify-center">
                      <span className="flex items-center space-x-2">
                        <span>바로가기</span>
                      </span>
                    </span>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* 관심 대학 관리 */}
        <div className="flex flex-col items-center justify-between gap-x-12 gap-y-4 md:flex-row">
          <div className="flex w-full flex-col space-y-8 lg:w-6/12">
            <div className="flex flex-col space-y-4">
              <div className="flex flex-col">
                <h2 className="font-heading scroll-m-20 border-l-4 border-olive-500 pb-2 pl-4 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
                  관심 대학 관리
                </h2>
                <h3>
                  <span className="flex flex-col space-y-1 bg-gradient-to-br bg-clip-text text-xl font-normal text-gray-500 dark:from-white dark:via-gray-300 dark:to-gray-400 dark:text-transparent lg:text-2xl">
                    교과/학종/논술 탐색에서 리포트를 저장하는 서비스
                  </span>
                </h3>
              </div>
              <p>
                교과/학종/논술 탐색 서비스에서 최종 선택된 전형을 관리하는 서비스
                입니다. 한눈에 각 위험도를 파악하고 각 전형에 맞춤화된 보고서를
                확인할 수 있습니다.
              </p>
              <p className="text-foreground/80">
                <Link to="/users/school-record" className="text-olive-500 hover:text-olive-600 underline">
                  수시 서비스(교과/학종/논술)
                </Link>
                의 탐색 결과를 저장하는 서비스입니다.
              </p>
              <div>
                <Button type="button" className="bg-olive-500 hover:bg-olive-600">
                  <Link
                    className="flex h-full w-full items-center transition-transform duration-500 ease-out"
                    to="/susi/interest"
                  >
                    <span className="flex w-full flex-1 items-center justify-center">
                      <span className="flex items-center space-x-2">
                        <span>바로가기</span>
                      </span>
                    </span>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
          <Card className="flex w-full p-4 lg:w-6/12">
            <img
              alt="intro_susi_3"
              loading="lazy"
              width="626"
              height="683"
              decoding="async"
              data-nimg="1"
              className="rounded-2xl"
              src="/images/intro-susi-3.png"
            />
          </Card>
        </div>

        {/* FAQ */}
        <div className="my-8 flex flex-col space-y-8">
          <div className="flex flex-col items-center space-y-4">
            <h1 className="font-heading scroll-m-20 text-4xl font-bold tracking-tight dark:text-white">
              FAQ
            </h1>
            <h2>
              <span className="flex flex-col space-y-1 bg-gradient-to-br bg-clip-text text-xl font-normal text-gray-500 dark:from-white dark:via-gray-300 dark:to-gray-400 dark:text-transparent lg:text-2xl">
                자주 묻는 질문
              </span>
            </h2>
          </div>
          <div className="m-auto flex w-full max-w-xl items-center justify-center">
            <div className="flex w-full flex-col">
              {faqList.map((item, idx) => {
                return (
                  <details
                    key={idx}
                    className="group border-b border-olive-100 px-2 py-4"
                  >
                    <summary className="flex items-center justify-between hover:cursor-pointer">
                      <h2 className="cursor-pointer font-sans text-lg font-medium text-gray-600 hover:text-olive-500 dark:text-gray-300 dark:hover:text-olive-400">
                        {item.title}
                      </h2>
                      <div>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          aria-hidden="true"
                          data-slot="icon"
                          className="h-5 text-olive-500 transition duration-300 group-open:-rotate-180"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m19.5 8.25-7.5 7.5-7.5-7.5"
                          ></path>
                        </svg>
                      </div>
                    </summary>
                    <div className="flex flex-col space-y-2 py-1 text-gray-500 dark:text-gray-400">
                      {item.body}
                    </div>
                  </details>
                );
              })}
            </div>
          </div>
        </div>

        <GuidePage />
      </div>
    </div>
  );
}

// ==========================================
// 메인 컴포넌트 (로그인 여부에 따라 분기)
// ==========================================
function SusiHome() {
  // 사용자 정보 조회
  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: USER_API.fetchCurrentUserAPI,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  // 활성 서비스 조회 (계약 기반)
  const { data: activeServiceCodes } = useQuery({
    queryKey: ["me", "active"],
    queryFn: USER_API.fetchCurrentUserActiveServicesAPI,
    enabled: !!user,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  // 수시(S) 또는 통합(S포함) 서비스 이용 중 여부
  const hasSusiService = activeServiceCodes?.includes("S") || false;

  // 로그인 여부에 따라 다른 페이지 렌더링
  if (user) {
    return (
      <SusiDashboard
        user={user}
        hasSusiService={hasSusiService}
      />
    );
  }

  return <SusiPromo />;
}

const faqList = [
  {
    title: "전형 탐색 시 내 등급이 다르게 나와요.",
    body: "성적은 문과/이과에 따라 변동이 있기 때문에 마이페이지(프로필 수정)에서 전공 여부를 체크하고 마이페이지(생기부 등록)에서 1, 2, 3학년 성적을 확인해 주세요.",
  },
  {
    title: "생기부 평가 내역이 없으면 학종 탐색을 하지 못하나요?",
    body: "사용하지 못합니다. 하지만 무료 서비스인 자가 평가를 통해 여러 계열을 충분히 탐색한 뒤 하나의 계열을 정하여 사정관 평가를 진행하는 것을 추천드립니다.",
  },
  {
    title: "각 위험도는 어떤 기준으로 계산되나요?",
    body: "위험도는 10단계로 결격, 위험, 소신, 적정, 안전으로 평가됩니다. 각 위험도의 기준은 입결, 합불 데이터, 대학별 성적 계산식 등을 통해 전형별로 계산되기 때문에 상위 대학으로 갈수록 위험도 간격이 좁아지는 경향이 있습니다.",
  },
  {
    title: "학종 전형에서 다른 계열을 검색할 수 있나요?",
    body: "자가 평가의 계열을 변경하여 다른 계열을 탐색할 수 있습니다. (사정관 평가는 선택한 계열에 맞춤 평가되었기 때문에 변경할 수 없음)",
  },
];

function GuidePage() {
  const [tab, setTab] = useState(1);

  return (
    <div className="mx-auto w-full max-w-screen-xl space-y-6 px-4 py-8">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          onClick={() => setTab(1)}
          variant={tab === 1 ? "default" : "outline"}
          className={cn(
            tab === 1
              ? "bg-olive-500 hover:bg-olive-600"
              : "border-olive-500 text-olive-500 hover:bg-olive-50"
          )}
        >
          수시(교과) 서비스
        </Button>
        <Button
          type="button"
          onClick={() => setTab(2)}
          variant={tab === 2 ? "default" : "outline"}
          className={cn(
            tab === 2
              ? "bg-olive-500 hover:bg-olive-600"
              : "border-olive-500 text-olive-500 hover:bg-olive-50"
          )}
        >
          수시(학종) 서비스
        </Button>
      </div>
      <div className="m-auto flex w-full max-w-screen-lg items-center justify-center pt-14">
        {tab === 1 && (
          <div className="flex flex-col items-center gap-2">
            <img src={feature2} className="w-full" alt="교과 서비스 특징 2" />
            <img src={feature1} className="w-full" alt="교과 서비스 특징 1" />
            <img src={feature3} className="w-full" alt="교과 서비스 특징 3" />
          </div>
        )}
        {tab === 2 && (
          <div className="flex flex-col items-center gap-2">
            <img src={feature4} alt="학종 서비스 특징 1" />
            <img src={feature6} alt="학종 서비스 특징 3" />
            <img src={feature5} alt="학종 서비스 특징 2" />
          </div>
        )}
      </div>
    </div>
  );
}
