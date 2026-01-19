import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/officer/_layout/apply/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/officer/_layout/apply/"!</div>
}
