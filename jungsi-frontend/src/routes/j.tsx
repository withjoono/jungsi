import { HomeContent } from "@/components/home-content";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/j")({
  component: JungsiPage,
});

function JungsiPage() {
  return <HomeContent grade="3" />;
}
