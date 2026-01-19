import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createLazyFileRoute("/jungsi/_layout/strategy")({
  component: StrategyPage,
});

function StrategyPage() {
  const navigate = useNavigate();

  useEffect(() => {
    alert("지금 운영되지 않는 페이지입니다\n(수능 시험일부터 2주간만 운영되는 서비스입니다)");
    navigate({ to: "/jungsi" });
  }, [navigate]);

  return null;
}
