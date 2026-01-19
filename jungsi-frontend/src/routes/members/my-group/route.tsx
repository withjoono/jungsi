import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/members/my-group')({
  component: MyclassRoute,
})

function MyclassRoute() {
  return <Outlet />
}
