import { createFileRoute, lazyRouteComponent } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/events')({
  component: lazyRouteComponent(() => import('../../features/Events'), 'Events'),
})
