import { Link } from "@tanstack/react-router";
import naverCafeIcon from "@/assets/icon/naver-cafe.png";
import youtubeIcon from "@/assets/icon/yotube.png";
// import footerIcon from "@/assets/icon/footer_logo.png";

export const Footer = () => {
  return (
    <div className="border-t py-12">
      <div className="mx-auto w-full max-w-screen-lg space-y-3 px-6">
        <div className="space-y-2">
          <div className="flex">
            <div className="flex flex-col items-center gap-1">
              <img className="h-auto w-10 sm:w-12" src="/logo.png" />
              <span className="text-sm sm:text-base">{"(주)거북스쿨"}</span>
            </div>
          </div>
          <div className="flex w-full flex-col gap-1 text-xs text-foreground/70 sm:text-sm">
            <div className="flex w-full flex-col gap-1 sm:flex-row sm:flex-wrap sm:gap-x-4">
              <span>사업체명 (주)거북스쿨</span>
              <span>대표 강준호</span>
              <span>사업자등록번호 772-87-02782</span>
              <span>연락처 042-484-3356</span>
            </div>
            <div className="flex w-full flex-col gap-1 sm:flex-row sm:flex-wrap sm:gap-x-4">
              <span>서울시 성북구 화랑로 211 성북구 기술창업센터 105호</span>
              <span>해피톡 상담시간 평일 10~16시 / 주말 및 공휴일 제외</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <Link to="/explain/service" target="_blank">
              이용약관
            </Link>
            <Link to="/explain/refund" target="_blank">
              환불규정
            </Link>
            <Link
              to="/explain/privacy"
              target="_blank"
              className="text-primary"
            >
              개인정보처리방침
            </Link>
          </div>

          <div className="flex items-center justify-start gap-2">
            <a
              href="https://www.youtube.com/@turtleschool_official"
              target="_blank"
            >
              <img className="h-6 w-6 rounded-md" src={youtubeIcon}></img>
            </a>
            <a href="https://cafe.naver.com/turtlecorp" target="_blank">
              <img className="h-6 w-6 rounded-md" src={naverCafeIcon}></img>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
