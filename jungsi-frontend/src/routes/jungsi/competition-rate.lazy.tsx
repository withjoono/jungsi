import { CompetitionRate } from "@/components/services/competition-rate";
import { Separator } from "@/components/ui/separator";
import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { LogIn, ArrowRight } from "lucide-react";
import { useUserStore } from "@/stores/atoms/user";

export const Route = createLazyFileRoute("/jungsi/competition-rate")({
  component: PublicCompetitionRatePage,
});

function PublicCompetitionRatePage() {
  const { user } = useUserStore();
  const isLoggedIn = !!user;

  return (
    <div className="mx-auto w-full max-w-screen-xl px-4 py-10">
      <div className="space-y-6">
        {/* Header with Login CTA */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold">실시간 경쟁률</h3>
            <p className="text-sm text-muted-foreground mt-1">
              정시 실시간 경쟁률 분석 서비스입니다.
            </p>
          </div>

          {!isLoggedIn && (
            <Link to="/auth/login" search={{ redirect: "/jungsi/competition-rate" }}>
              <Button className="gap-2">
                <LogIn className="w-4 h-4" />
                로그인하고 더 보기
              </Button>
            </Link>
          )}
        </div>

        <Separator />

        {/* Competition Rate Component */}
        <CompetitionRate />

        {/* Bottom CTA Button */}
        <div className="mt-8 flex justify-center">
          <Link to="/jungsi">
            <Button size="lg" className="gap-2">
              거북스쿨 정시 서비스 자세히 알아보기
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
