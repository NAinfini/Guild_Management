import { createFileRoute, lazyRouteComponent } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/roster')({
  component: lazyRouteComponent(() => import('../../features/Members'), 'Roster'),
})
