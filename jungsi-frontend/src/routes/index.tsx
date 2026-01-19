import { ServiceCardsPage } from "@/components/service-cards-page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return <ServiceCardsPage />;
}
