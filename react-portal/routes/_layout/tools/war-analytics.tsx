import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/tools/war-analytics')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_layout/tools/war-analytics"!</div>
}
