import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/jungsi")({
  component: JungsiRoute,
});

function JungsiRoute() {
  return <Outlet />;
}
